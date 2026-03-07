import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();

  // When production starts, deduct materials from stock
  if (body.status === "in_progress") {
    const { data: productionOrder } = await supabase
      .from("production_orders")
      .select("order_id")
      .eq("id", id)
      .single();

    if (productionOrder) {
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("product_id, quantity_masterboxes, products(units_per_masterbox)")
        .eq("order_id", productionOrder.order_id);

      if (orderItems && orderItems.length > 0) {
        const productIds = orderItems.map((i) => i.product_id);

        const { data: bomEntries } = await supabase
          .from("product_bom")
          .select("*")
          .in("product_id", productIds);

        if (bomEntries && bomEntries.length > 0) {
          const materialNeeds = new Map<string, number>();
          for (const item of orderItems) {
            const unitsPerMasterbox = (item as any).products?.units_per_masterbox ?? 1;
            const totalUnits = item.quantity_masterboxes * unitsPerMasterbox;
            const productBom = bomEntries.filter((b) => b.product_id === item.product_id);
            for (const bom of productBom) {
              const current = materialNeeds.get(bom.raw_material_id) ?? 0;
              materialNeeds.set(bom.raw_material_id, current + totalUnits * bom.quantity_per_unit);
            }
          }

          const { data: { user } } = await supabase.auth.getUser();

          for (const [materialId, quantity] of materialNeeds.entries()) {
            const rounded = Math.round(quantity * 1000) / 1000;

            // The DB trigger on stock_movements automatically updates current_stock
            await supabase.from("stock_movements").insert({
              raw_material_id: materialId,
              quantity: -rounded,
              type: "production_use",
              reference: productionOrder.order_id,
              created_by: user?.id ?? null,
            });
          }
        }
      }
    }
  }

  const { data, error } = await supabase
    .from("production_orders")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
