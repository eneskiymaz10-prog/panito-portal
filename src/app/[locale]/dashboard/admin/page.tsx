import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package, Users, FileText } from "lucide-react";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import Link from "next/link";
import {
  SalesCharts,
  type MonthlyRevenueData,
  type OrdersByStatusData,
  type TopProductData,
} from "@/components/analytics/sales-charts";

export default async function AdminDashboard() {
  const t = await getTranslations();
  const supabase = await createClient();

  const { count: totalOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "submitted");

  const { count: activeProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  const { count: totalCustomers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "buyer");

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*, profiles!orders_customer_id_fkey(company_name)")
    .order("created_at", { ascending: false })
    .limit(10);

  // --- Analytics data fetching ---

  // Monthly revenue: orders from last 6 months where status is not cancelled
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const { data: revenueOrders } = await supabase
    .from("orders")
    .select("created_at, total_amount")
    .neq("status", "cancelled")
    .gte("created_at", sixMonthsAgo.toISOString())
    .order("created_at", { ascending: true });

  const monthlyRevenueMap = new Map<string, number>();
  // Pre-fill the last 6 months so we always show them even if no orders
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleString("en-US", { month: "short", year: "numeric" });
    monthlyRevenueMap.set(key, 0);
  }
  if (revenueOrders) {
    for (const order of revenueOrders) {
      const date = new Date(order.created_at);
      const key = date.toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (monthlyRevenueMap.has(key)) {
        monthlyRevenueMap.set(
          key,
          (monthlyRevenueMap.get(key) || 0) + (order.total_amount || 0)
        );
      }
    }
  }
  const monthlyRevenue: MonthlyRevenueData[] = Array.from(
    monthlyRevenueMap.entries()
  ).map(([month, revenue]) => ({ month, revenue }));

  // Orders by status: count orders grouped by status
  const { data: allOrders } = await supabase
    .from("orders")
    .select("status");

  const statusCountMap = new Map<string, number>();
  if (allOrders) {
    for (const order of allOrders) {
      statusCountMap.set(
        order.status,
        (statusCountMap.get(order.status) || 0) + 1
      );
    }
  }
  const ordersByStatus: OrdersByStatusData[] = Array.from(
    statusCountMap.entries()
  ).map(([status, count]) => ({ status, count }));

  // Top 5 products by revenue: sum order_items line_total grouped by product
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("product_id, line_total, products(name)");

  const productRevenueMap = new Map<string, { name: string; revenue: number }>();
  if (orderItems) {
    for (const item of orderItems) {
      const productName =
        (item as any).products?.name || "Unknown Product";
      const existing = productRevenueMap.get(item.product_id);
      if (existing) {
        existing.revenue += item.line_total || 0;
      } else {
        productRevenueMap.set(item.product_id, {
          name: productName,
          revenue: item.line_total || 0,
        });
      }
    }
  }
  const topProducts: TopProductData[] = Array.from(
    productRevenueMap.values()
  )
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("dashboard.adminWelcome")}</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.pendingOrders")}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("nav.orders")}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.activeProducts")}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProducts || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("nav.customers")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.recentOrders")}</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/admin/orders/${order.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {(order as any).profiles?.company_name || "Unknown"} &middot;{" "}
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {order.total_amount && (
                      <span className="text-sm font-medium">
                        {formatCurrency(order.total_amount, order.currency)}
                      </span>
                    )}
                    <OrderStatusBadge status={order.status as any} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{t("common.noResults")}</p>
          )}
        </CardContent>
      </Card>

      <SalesCharts
        monthlyRevenue={monthlyRevenue}
        ordersByStatus={ordersByStatus}
        topProducts={topProducts}
      />
    </div>
  );
}
