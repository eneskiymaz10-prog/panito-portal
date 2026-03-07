import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const body = await request.json();

  // Create payment record
  const { data: payment, error } = await supabase
    .from("payments")
    .insert({
      invoice_id: body.invoice_id,
      amount: body.amount,
      payment_method: body.payment_method || null,
      reference: body.reference || null,
      confirmed_by: user?.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update invoice status
  await supabase.from("invoices").update({ status: "paid" }).eq("id", body.invoice_id);

  // Get order_id from invoice and update order status
  const { data: invoice } = await supabase
    .from("invoices")
    .select("order_id")
    .eq("id", body.invoice_id)
    .single();

  if (invoice) {
    await supabase.from("orders").update({ status: "paid" }).eq("id", invoice.order_id);

    // Notify buyer
    const { data: order } = await supabase
      .from("orders")
      .select("customer_id, order_number")
      .eq("id", invoice.order_id)
      .single();

    if (order) {
      await supabase.from("notifications").insert({
        user_id: order.customer_id,
        type: "payment_received",
        title: "Payment Confirmed",
        message: "Payment for order " + order.order_number + " has been confirmed",
        data: { orderId: invoice.order_id },
      });
    }
  }

  return NextResponse.json(payment, { status: 201 });
}
