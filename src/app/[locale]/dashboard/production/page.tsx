import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Factory, AlertTriangle, CheckCircle } from "lucide-react";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";

export default async function ProductionDashboard() {
  const t = await getTranslations();
  const supabase = await createClient();

  // Orders confirmed and waiting for production
  const { data: productionQueue } = await supabase
    .from("orders")
    .select("*, profiles!orders_customer_id_fkey(company_name)")
    .in("status", ["confirmed", "in_production"])
    .order("created_at", { ascending: true });

  // Low stock materials
  const { data: lowStockMaterials } = await supabase
    .from("raw_materials")
    .select("*")
    .filter("current_stock", "lte", "min_stock_level");

  const { count: pendingProduction } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "confirmed");

  const { count: inProduction } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "in_production");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("dashboard.productionWelcome")}</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.pendingOrders")}
            </CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingProduction || 0}</div>
            <p className="text-xs text-muted-foreground">awaiting production</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Production</CardTitle>
            <Factory className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProduction || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.lowStock")}
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lowStockMaterials?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("production.queue")}</CardTitle>
        </CardHeader>
        <CardContent>
          {productionQueue && productionQueue.length > 0 ? (
            <div className="space-y-3">
              {productionQueue.map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/production/orders/${order.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {(order as any).profiles?.company_name || "Unknown"} &middot;{" "}
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status as any} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>No orders in production queue</span>
            </div>
          )}
        </CardContent>
      </Card>

      {lowStockMaterials && lowStockMaterials.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t("dashboard.lowStock")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockMaterials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between rounded-lg border border-destructive/20 p-3"
                >
                  <span className="font-medium">{material.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">
                      {material.current_stock} {material.unit}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      min: {material.min_stock_level} {material.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
