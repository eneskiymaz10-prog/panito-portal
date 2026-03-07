import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Update order status
  const { data: order, error } = await supabase
    .from("orders")
    .update({ status: "confirmed" })
    .eq("id", id)
    .select("*, profiles!orders_customer_id_fkey(id)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify buyer
  await supabase.from("notifications").insert({
    user_id: (order as any).profiles.id,
    type: "order_confirmed",
    title: "Order Confirmed",
    message: `Your order ${order.order_number} has been confirmed`,
    data: { orderId: order.id },
  });

  // Notify production team
  const { data: productionUsers } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "production");

  if (productionUsers) {
    const notifications = productionUsers.map((user) => ({
      user_id: user.id,
      type: "order_confirmed",
      title: "New Production Order",
      message: `Order ${order.order_number} is confirmed and ready for production`,
      data: { orderId: order.id },
    }));
    await supabase.from("notifications").insert(notifications);
  }

  // Create production order
  await supabase.from("production_orders").insert({
    order_id: order.id,
    status: "pending",
  });

  return NextResponse.json(order);
}
