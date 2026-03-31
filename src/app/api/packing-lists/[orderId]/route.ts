import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { createServiceClient } from "@/lib/supabase/server";
import {
  PackingListPDF,
  type PackingListData,
  type PackingListItem,
} from "@/components/invoices/packing-list-pdf";
import { calculateFromMasterboxes } from "@/lib/utils/pallet-calculator";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const supabase = await createServiceClient();

    // Fetch order with items, products, and customer profile
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "*, order_items(*, products(*)), profiles!orders_customer_id_fkey(*)"
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: orderError?.message ?? "Order not found" },
        { status: 404 }
      );
    }

    const profile = order.profiles as {
      company_name: string | null;
      country: string | null;
      address: string | null;
      contact_email: string | null;
      contact_phone: string | null;
    };

    const shipmentMethod = (order as any).shipment_method || "sea";
    const items: PackingListItem[] = (
      order.order_items as Array<{
        quantity_masterboxes: number;
        products: {
          name: string;
          sku: string;
          masterboxes_per_pallet_air: number;
          masterboxes_per_pallet_sea: number;
          units_per_masterbox: number;
          weight_per_unit_grams: number;
        };
      }>
    ).map((item) => ({
      productName: item.products.name,
      sku: item.products.sku,
      quantityMasterboxes: item.quantity_masterboxes,
      masterboxesPerPallet: shipmentMethod === "air"
        ? item.products.masterboxes_per_pallet_air
        : item.products.masterboxes_per_pallet_sea,
      unitsPerMasterbox: item.products.units_per_masterbox,
      weightPerUnitGrams: item.products.weight_per_unit_grams,
    }));

    // Calculate totals for database record
    let totalMasterboxes = 0;
    let totalPallets = 0;
    let totalWeightGrams = 0;

    for (const item of items) {
      const calc = calculateFromMasterboxes(
        item.quantityMasterboxes,
        item.masterboxesPerPallet,
        item.unitsPerMasterbox
      );
      totalMasterboxes += item.quantityMasterboxes;
      totalPallets += calc.totalPallets;
      totalWeightGrams += calc.totalUnits * item.weightPerUnitGrams;
    }

    const totalWeightKg = totalWeightGrams / 1000;

    const packingListData: PackingListData = {
      orderNumber: order.order_number,
      orderDate: order.created_at,
      customerName: profile.company_name ?? "N/A",
      customerCountry: profile.country,
      customerAddress: profile.address,
      customerEmail: profile.contact_email,
      customerPhone: profile.contact_phone,
      items,
    };

    // Generate PDF
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(
      React.createElement(PackingListPDF, { data: packingListData }) as any
    );

    // Create or update packing_lists record
    const { data: existingList } = await supabase
      .from("packing_lists")
      .select("id")
      .eq("order_id", orderId)
      .single();

    if (existingList) {
      await supabase
        .from("packing_lists")
        .update({
          total_weight_kg: Math.round(totalWeightKg * 100) / 100,
          total_pallets: Math.round(totalPallets * 100) / 100,
          total_masterboxes: totalMasterboxes,
        })
        .eq("id", existingList.id);
    } else {
      await supabase.from("packing_lists").insert({
        order_id: orderId,
        total_weight_kg: Math.round(totalWeightKg * 100) / 100,
        total_pallets: Math.round(totalPallets * 100) / 100,
        total_masterboxes: totalMasterboxes,
      });
    }

    // Return PDF with proper headers
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="packing-list-${order.order_number}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating packing list PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate packing list PDF" },
      { status: 500 }
    );
  }
}
