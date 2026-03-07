"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { CheckCircle, DollarSign } from "lucide-react";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations("invoices");
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [payment, setPayment] = useState({ amount: "", payment_method: "bank_transfer", reference: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data } = await supabase
        .from("invoices")
        .select("*, orders!inner(order_number, profiles!orders_customer_id_fkey(company_name)), payments(*)")
        .eq("id", id)
        .single();
      setInvoice(data);
      if (data) setPayment((p) => ({ ...p, amount: String(data.total) }));
    }
    load();
  }, [id]);

  async function confirmPayment() {
    setSubmitting(true);
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoice_id: id,
        amount: parseFloat(payment.amount),
        payment_method: payment.payment_method,
        reference: payment.reference || null,
      }),
    });
    if (!res.ok) { toast.error("Failed to confirm payment"); setSubmitting(false); return; }
    toast.success("Payment confirmed");
    router.push("/dashboard/accounting/invoices");
    router.refresh();
  }

  if (!invoice) return <div className="p-6">Loading...</div>;

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    sent: "bg-blue-100 text-blue-700",
    paid: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{invoice.invoice_number}</h1>
          <p className="text-muted-foreground">
            {invoice.orders?.order_number} &middot; {invoice.orders?.profiles?.company_name}
          </p>
        </div>
        <Badge variant="outline" className={statusColors[invoice.status] || ""}>
          {invoice.status.toUpperCase()}
        </Badge>
      </div>

      <Card>
        <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>{t("subtotal")}</Label><p className="text-lg">{formatCurrency(invoice.subtotal, invoice.currency)}</p></div>
            <div><Label>{t("tax")} ({invoice.tax_rate}%)</Label><p className="text-lg">{formatCurrency(invoice.tax_amount, invoice.currency)}</p></div>
            <div><Label>{t("total")}</Label><p className="text-2xl font-bold">{formatCurrency(invoice.total, invoice.currency)}</p></div>
            <div><Label>{t("dueDate")}</Label><p className="text-lg">{invoice.due_date ? formatDate(invoice.due_date) : "Not set"}</p></div>
          </div>
        </CardContent>
      </Card>

      {invoice.status === "sent" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t("confirmPayment")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" step="0.01" value={payment.amount} onChange={(e) => setPayment({...payment, amount: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{t("paymentMethod")}</Label>
                <Select value={payment.payment_method} onValueChange={(v) => setPayment({...payment, payment_method: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("paymentReference")}</Label>
                <Input value={payment.reference} onChange={(e) => setPayment({...payment, reference: e.target.value})} placeholder="Transaction ID..." />
              </div>
            </div>
            <Button onClick={confirmPayment} disabled={submitting}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {submitting ? "..." : t("confirmPayment")}
            </Button>
          </CardContent>
        </Card>
      )}

      {invoice.payments && invoice.payments.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
          <CardContent>
            {invoice.payments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between border-b py-3 last:border-0">
                <div>
                  <p className="font-medium">{formatCurrency(p.amount, invoice.currency)}</p>
                  <p className="text-sm text-muted-foreground">{p.payment_method} &middot; {p.reference || "No ref"}</p>
                </div>
                <p className="text-sm text-muted-foreground">{formatDate(p.confirmed_at)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
