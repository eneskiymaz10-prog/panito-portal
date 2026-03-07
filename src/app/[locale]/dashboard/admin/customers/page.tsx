import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { InviteCustomerDialog } from "@/components/customers/invite-customer-dialog";

export default async function CustomersPage() {
  const t = await getTranslations("nav");
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "buyer")
    .order("company_name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("customers")}</h1>
        <InviteCustomerDialog />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers?.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={"/dashboard/admin/customers/" + c.id} className="font-medium text-primary hover:underline">
                      {c.company_name || "No company"}
                    </Link>
                  </TableCell>
                  <TableCell>{c.country || "-"}</TableCell>
                  <TableCell>{c.contact_email || "-"}</TableCell>
                  <TableCell>{c.contact_phone || "-"}</TableCell>
                </TableRow>
              ))}
              {(!customers || customers.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No customers yet. Invite your first customer above.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
