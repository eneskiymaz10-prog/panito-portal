import { getTranslations } from "next-intl/server";
import { ProductForm } from "@/components/products/product-form";

export default async function NewProductPage() {
  const t = await getTranslations("products");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("addProduct")}</h1>
      <ProductForm />
    </div>
  );
}
