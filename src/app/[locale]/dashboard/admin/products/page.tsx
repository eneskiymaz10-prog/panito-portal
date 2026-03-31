import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatWeight, formatCurrency } from "@/lib/utils/format";

export default async function ProductsPage() {
  const t = await getTranslations("products");
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Button asChild>
          <Link href="/dashboard/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("addProduct")}
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("sku")}</TableHead>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("flavour")}</TableHead>
                <TableHead>{t("weight")}</TableHead>
                <TableHead>{t("unitsPerMasterbox")}</TableHead>
                <TableHead>{t("masterboxesPerPalletAir")}</TableHead>
                <TableHead>{t("masterboxesPerPalletSea")}</TableHead>
                <TableHead>{t("pricePerUnit")}</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Link href={`/dashboard/admin/products/${product.id}`} className="font-medium text-primary hover:underline">
                      {product.sku}
                    </Link>
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.flavour || "-"}</TableCell>
                  <TableCell>{formatWeight(product.weight_per_unit_grams)}</TableCell>
                  <TableCell>{product.units_per_masterbox}</TableCell>
                  <TableCell>{product.masterboxes_per_pallet_air}</TableCell>
                  <TableCell>{product.masterboxes_per_pallet_sea}</TableCell>
                  <TableCell>{formatCurrency(product.price_per_unit)}</TableCell>
                  <TableCell>
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? t("active") : t("inactive")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!products || products.length === 0) && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No products yet. Add your first product.
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
