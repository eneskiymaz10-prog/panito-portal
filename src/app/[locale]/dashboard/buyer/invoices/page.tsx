import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default async function BuyerInvoicesPage() {
  const t = await getTranslations("invoices");
  const supabase = await createClient();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, orders!inner(order_number)")
    .order("created_at", { ascending: false });

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    sent: "bg-blue-100 text-blue-700",
    paid: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("invoiceNumber")}</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>{t("total")}</TableHead>
                <TableHead>{t("dueDate")}</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices?.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                  <TableCell>{(inv as any).orders?.order_number}</TableCell>
                  <TableCell>{formatCurrency(inv.total, inv.currency)}</TableCell>
                  <TableCell>{inv.due_date ? formatDate(inv.due_date) : "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[inv.status] || ""}>
                      {inv.status === "draft" ? t("statusDraft") : inv.status === "sent" ? t("statusSent") : t("statusPaid")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!invoices || invoices.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No invoices yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
