import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import Link from "next/link";

export default async function AdminOrdersPage() {
  const t = await getTranslations("orders");
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, profiles!orders_customer_id_fkey(company_name, country)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("orderNumber")}</TableHead>
                <TableHead>{t("customer")}</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">{t("totalAmount")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link href={`/dashboard/admin/orders/${order.id}`} className="font-medium text-primary hover:underline">
                      {order.order_number}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{(order as any).profiles?.company_name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">{(order as any).profiles?.country}</p>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status as any} />
                  </TableCell>
                  <TableCell className="text-right">
                    {order.total_amount ? formatCurrency(order.total_amount, order.currency) : "-"}
                  </TableCell>
                </TableRow>
              ))}
              {(!orders || orders.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No orders yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
