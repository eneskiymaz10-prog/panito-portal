import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { ProductionActions } from "@/components/production/production-actions";
import { formatDate, formatWeight } from "@/lib/utils/format";
import { calculateFromMasterboxes, formatPallets } from "@/lib/utils/pallet-calculator";
import { checkBomAvailability } from "@/lib/utils/bom-checker";

export default async function ProductionOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations();
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*, products(*)), profiles!orders_customer_id_fkey(company_name)")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const { data: productionOrder } = await supabase
    .from("production_orders")
    .select("*")
    .eq("order_id", id)
    .single();

  // Get BOM and materials for availability check
  const productIds = ((order as any).order_items || []).map((i: any) => i.product_id);
  const { data: bomEntries } = await supabase
    .from("product_bom")
    .select("*")
    .in("product_id", productIds);

  const materialIds = (bomEntries || []).map((b) => b.raw_material_id);
  const { data: materials } = materialIds.length > 0
    ? await supabase.from("raw_materials").select("*").in("id", materialIds)
    : { data: [] };

  // Build BOM check per product
  const orderItemsForBom = ((order as any).order_items || []).map((item: any) => ({
    product_id: item.product_id,
    quantity_masterboxes: item.quantity_masterboxes,
    units_per_masterbox: item.products?.units_per_masterbox || 1,
  }));

  // Filter BOM entries per product
  const bomByProduct = new Map<string, any[]>();
  for (const item of orderItemsForBom) {
    const productBom = (bomEntries || []).filter((b) => b.product_id === item.product_id);
    bomByProduct.set(item.product_id, productBom);
  }

  // Aggregate material needs
  const materialNeeds = new Map<string, number>();
  for (const item of orderItemsForBom) {
    const totalUnits = item.quantity_masterboxes * item.units_per_masterbox;
    const productBom = bomByProduct.get(item.product_id) || [];
    for (const bom of productBom) {
      const current = materialNeeds.get(bom.raw_material_id) || 0;
      materialNeeds.set(bom.raw_material_id, current + totalUnits * bom.quantity_per_unit);
    }
  }

  const materialCheck = Array.from(materialNeeds.entries()).map(([matId, needed]) => {
    const mat = (materials || []).find((m) => m.id === matId);
    const available = mat?.current_stock || 0;
    return {
      id: matId,
      name: mat?.name || "Unknown",
      unit: mat?.unit || "",
      needed: Math.round(needed * 100) / 100,
      available,
      shortage: Math.max(0, Math.round((needed - available) * 100) / 100),
      sufficient: available >= needed,
    };
  });

  const allSufficient = materialCheck.every((m) => m.sufficient);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{order.order_number}</h1>
          <p className="text-muted-foreground">
            {(order as any).profiles?.company_name} &middot; {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status as any} />
          {productionOrder && (
            <ProductionActions
              orderId={order.id}
              productionOrderId={productionOrder.id}
              orderStatus={order.status as any}
              productionStatus={productionOrder.status}
            />
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t("production.materialCheck")}
            {allSufficient ? (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {t("production.allMaterialsAvailable")}
              </Badge>
            ) : (
              <Badge variant="destructive">
                {t("production.materialsShortage")}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>{t("production.needed")}</TableHead>
                <TableHead>{t("production.available")}</TableHead>
                <TableHead>{t("production.shortage")}</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materialCheck.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{m.needed} {m.unit}</TableCell>
                  <TableCell>{m.available} {m.unit}</TableCell>
                  <TableCell className={m.shortage > 0 ? "text-destructive font-medium" : ""}>
                    {m.shortage > 0 ? m.shortage + " " + m.unit : "-"}
                  </TableCell>
                  <TableCell>
                    {m.sufficient ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700">OK</Badge>
                    ) : (
                      <Badge variant="destructive">Short</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {materialCheck.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                    No BOM entries found for these products. Add BOM data to enable material checking.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Masterboxes</TableHead>
                <TableHead>Pallets</TableHead>
                <TableHead>Total Units</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {((order as any).order_items || []).map((item: any) => {
                const mbPerPallet = item.products
                  ? ((order as any).shipment_method === "air" ? item.products.masterboxes_per_pallet_air : item.products.masterboxes_per_pallet_sea)
                  : 1;
                const calc = item.products ? calculateFromMasterboxes(item.quantity_masterboxes, mbPerPallet, item.products.units_per_masterbox) : null;
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-medium">{item.products?.name}</p>
                      <p className="text-sm text-muted-foreground">{item.products?.sku}</p>
                    </TableCell>
                    <TableCell>{item.quantity_masterboxes}</TableCell>
                    <TableCell>{calc ? formatPallets(calc.totalPallets) : "-"}</TableCell>
                    <TableCell>{calc?.totalUnits || "-"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
