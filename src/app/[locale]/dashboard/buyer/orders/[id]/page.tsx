import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatCurrency, formatDate, formatWeight } from "@/lib/utils/format";
import { calculateFromMasterboxes, formatPallets } from "@/lib/utils/pallet-calculator";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations("orders");
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*, products(*))")
    .eq("id", id)
    .single();

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{order.order_number}</h1>
          <p className="text-muted-foreground">{formatDate(order.created_at)}</p>
        </div>
        <OrderStatusBadge status={order.status as any} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("items")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>{t("masterboxes")}</TableHead>
                <TableHead>{t("pallets")}</TableHead>
                <TableHead>{t("unitPrice")}</TableHead>
                <TableHead className="text-right">{t("lineTotal")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(order as any).order_items?.map((item: any) => {
                const calc = item.products ? calculateFromMasterboxes(
                  item.quantity_masterboxes,
                  item.products.masterboxes_per_pallet,
                  item.products.units_per_masterbox
                ) : null;
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.products?.name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">{item.products?.sku}</p>
                      </div>
                    </TableCell>
                    <TableCell>{item.quantity_masterboxes}</TableCell>
                    <TableCell>{calc ? formatPallets(calc.totalPallets) : "-"}</TableCell>
                    <TableCell>{formatCurrency(item.unit_price, order.currency)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.line_total, order.currency)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center text-lg">
            <span className="font-medium">{t("totalAmount")}</span>
            <span className="text-2xl font-bold">
              {formatCurrency(order.total_amount || 0, order.currency)}
            </span>
          </div>
          {order.notes && (
            <div className="mt-4 border-t pt-4">
              <p className="text-sm text-muted-foreground">{t("notes")}:</p>
              <p>{order.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
