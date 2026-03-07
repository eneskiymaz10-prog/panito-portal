import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*, orders!inner(order_number, customer_id, profiles!orders_customer_id_fkey(company_name))")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      order_id: body.order_id,
      invoice_number: "",
      subtotal: body.subtotal,
      tax_rate: body.tax_rate || 0,
      tax_amount: body.tax_amount || 0,
      total: body.total,
      currency: body.currency || "USD",
      due_date: body.due_date || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update order status
  await supabase.from("orders").update({ status: "invoiced" }).eq("id", body.order_id);

  return NextResponse.json(data, { status: 201 });
}
