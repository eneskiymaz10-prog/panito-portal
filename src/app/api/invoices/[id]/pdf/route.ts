import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import {
  InvoicePdfDocument,
  type InvoiceData,
} from "@/components/invoices/invoice-pdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createServiceClient();

    // Fetch invoice with order and customer info
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(
        "*, orders!inner(id, order_number, customer_id, currency, profiles!orders_customer_id_fkey(company_name, country, address))"
      )
      .eq("id", id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: invoiceError?.message || "Invoice not found" },
        { status: 404 }
      );
    }

    // Fetch order items with product names
    const order = invoice.orders as unknown as {
      id: string;
      order_number: string;
      customer_id: string;
      currency: string;
      profiles: {
        company_name: string | null;
        country: string | null;
        address: string | null;
      };
    };

    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("*, products!inner(name)")
      .eq("order_id", order.id);

    if (itemsError) {
      return NextResponse.json(
        { error: itemsError.message },
        { status: 500 }
      );
    }

    // Build the invoice data for the PDF template
    const invoiceData: InvoiceData = {
      invoice_number: invoice.invoice_number,
      created_at: invoice.created_at,
      due_date: invoice.due_date,
      currency: invoice.currency || "EUR",
      subtotal: invoice.subtotal,
      tax_rate: invoice.tax_rate,
      tax_amount: invoice.tax_amount,
      total: invoice.total,
      customer: {
        company_name: order.profiles?.company_name || null,
        country: order.profiles?.country || null,
        address: order.profiles?.address || null,
      },
      items: (orderItems || []).map((item) => {
        const product = item.products as unknown as { name: string };
        return {
          product_name: product.name,
          quantity_masterboxes: item.quantity_masterboxes,
          unit_price: item.unit_price,
          line_total: item.line_total,
        };
      }),
    };

    // Render the PDF to a buffer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(
      React.createElement(InvoicePdfDocument, { data: invoiceData }) as any
    );

    // Return the PDF with appropriate headers
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${invoice.invoice_number}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
