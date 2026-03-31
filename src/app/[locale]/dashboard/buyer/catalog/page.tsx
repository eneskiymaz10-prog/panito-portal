import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatWeight, formatCurrency } from "@/lib/utils/format";

export default async function CatalogPage() {
  const t = await getTranslations("products");
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  const { data: products } = await supabase
    .from("products")
    .select("*, product_translations(*)")
    .eq("is_active", true)
    .order("name");

  // Get customer-specific prices
  const { data: prices } = await supabase
    .from("customer_prices")
    .select("*")
    .eq("customer_id", user!.id);

  const priceMap = new Map(
    prices?.map((p) => [p.product_id, p]) || []
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => {
          const price = priceMap.get(product.id);
          return (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <Badge variant="outline">{product.sku}</Badge>
                </div>
                {product.flavour && (
                  <p className="text-sm text-muted-foreground">{product.flavour}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {product.description && (
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                )}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t("weight")}:</span>{" "}
                    <span className="font-medium">{formatWeight(product.weight_per_unit_grams)}</span>
                  </div>
                  {product.dimensions_cm && (
                    <div>
                      <span className="text-muted-foreground">{t("dimensions")}:</span>{" "}
                      <span className="font-medium">{product.dimensions_cm} cm</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">{t("unitsPerMasterbox")}:</span>{" "}
                    <span className="font-medium">{product.units_per_masterbox}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("masterboxesPerPalletAir")}:</span>{" "}
                    <span className="font-medium">{product.masterboxes_per_pallet_air}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("masterboxesPerPalletSea")}:</span>{" "}
                    <span className="font-medium">{product.masterboxes_per_pallet_sea}</span>
                  </div>
                </div>
                {price && (
                  <div className="border-t pt-3">
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(price.price_per_unit, price.currency)}
                    </span>
                    <span className="text-sm text-muted-foreground"> / unit</span>
                  </div>
                )}
                {!price && (
                  <div className="border-t pt-3">
                    <span className="text-sm text-muted-foreground">
                      Contact admin for pricing
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {(!products || products.length === 0) && (
          <p className="col-span-full text-center text-muted-foreground py-8">
            No products available yet.
          </p>
        )}
      </div>
    </div>
  );
}
