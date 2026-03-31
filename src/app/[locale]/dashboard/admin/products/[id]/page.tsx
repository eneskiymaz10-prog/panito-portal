import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/products/product-form";
import { BomManager } from "@/components/products/bom-manager";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("products");
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("editProduct")}</h1>
      <ProductForm
        productId={product.id}
        defaultValues={{
          sku: product.sku,
          name: product.name,
          description: product.description || undefined,
          flavour: product.flavour || undefined,
          weight_per_unit_grams: product.weight_per_unit_grams,
          dimensions_cm: product.dimensions_cm || undefined,
          units_per_masterbox: product.units_per_masterbox,
          masterboxes_per_pallet_air: product.masterboxes_per_pallet_air,
          masterboxes_per_pallet_sea: product.masterboxes_per_pallet_sea,
          price_per_unit: product.price_per_unit,
          is_active: product.is_active,
        }}
      />
      <BomManager productId={product.id} />
    </div>
  );
}
