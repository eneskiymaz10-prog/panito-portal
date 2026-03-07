import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, DollarSign, Clock } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import Link from "next/link";

export default async function AccountingDashboard() {
  const t = await getTranslations();
  const supabase = await createClient();

  const { data: pendingInvoices } = await supabase
    .from("invoices")
    .select("*, orders!inner(order_number, profiles!orders_customer_id_fkey(company_name))")
    .eq("status", "sent")
    .order("created_at", { ascending: false });

  const { count: draftCount } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("status", "draft");

  const { count: sentCount } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("status", "sent");

  const { count: paidCount } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("status", "paid");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("dashboard.accountingWelcome")}</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Awaiting Payment
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Draft Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Paid
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices Awaiting Payment</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingInvoices && pendingInvoices.length > 0 ? (
            <div className="space-y-3">
              {pendingInvoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/dashboard/accounting/invoices/${invoice.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{invoice.invoice_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {(invoice as any).orders?.order_number} &middot;{" "}
                      {(invoice as any).orders?.profiles?.company_name || "Unknown"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </span>
                    {invoice.due_date && (
                      <span className="text-xs text-muted-foreground">
                        Due: {formatDate(invoice.due_date)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{t("common.noResults")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
