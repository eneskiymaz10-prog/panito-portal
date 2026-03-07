import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createOrderSchema } from "@/lib/validations/order";
import { generateOrderNumber } from "@/lib/utils/format";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let query = supabase
    .from("orders")
    .select("*, order_items(*, products(*)), profiles!orders_customer_id_fkey(company_name, country)")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Get customer prices for line total calculation
  const { data: prices } = await supabase
    .from("customer_prices")
    .select("*")
    .eq("customer_id", user.id);

  const priceMap = new Map(prices?.map((p) => [p.product_id, p]) || []);

  // Get product details for unit calculations
  const productIds = parsed.data.items.map((i) => i.product_id);
  const { data: products } = await supabase
    .from("products")
    .select("id, units_per_masterbox")
    .in("id", productIds);

  const productMap = new Map(products?.map((p) => [p.id, p]) || []);

  // Calculate totals
  let totalAmount = 0;
  const orderItems = parsed.data.items.map((item) => {
    const price = priceMap.get(item.product_id);
    const product = productMap.get(item.product_id);
    const unitPrice = price?.price_per_unit || 0;
    const unitsPerMasterbox = product?.units_per_masterbox || 1;
    const lineTotal = item.quantity_masterboxes * unitsPerMasterbox * unitPrice;
    totalAmount += lineTotal;

    return {
      product_id: item.product_id,
      quantity_masterboxes: item.quantity_masterboxes,
      unit_price: unitPrice,
      line_total: lineTotal,
    };
  });

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: generateOrderNumber(),
      customer_id: user.id,
      status: "submitted",
      total_amount: totalAmount,
      currency: prices?.[0]?.currency || "USD",
      notes: parsed.data.notes || null,
    })
    .select()
    .single();

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });

  // Create order items
  const itemsWithOrderId = orderItems.map((item) => ({
    ...item,
    order_id: order.id,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsWithOrderId);

  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });

  // Create notification for admin users
  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  if (admins) {
    const notifications = admins.map((admin) => ({
      user_id: admin.id,
      type: "new_order",
      title: "New Order",
      message: `New order ${order.order_number} has been placed`,
      data: { orderId: order.id },
    }));
    await supabase.from("notifications").insert(notifications);
  }

  return NextResponse.json(order, { status: 201 });
}
