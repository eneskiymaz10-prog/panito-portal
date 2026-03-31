"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormValues } from "@/lib/validations/product";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface ProductFormProps {
  defaultValues?: Partial<ProductFormValues>;
  productId?: string;
}

export function ProductForm({ defaultValues, productId }: ProductFormProps) {
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      is_active: true,
      ...defaultValues,
    },
  });

  const isActive = watch("is_active");

  async function onSubmit(data: ProductFormValues) {
    const url = productId ? `/api/products/${productId}` : "/api/products";
    const method = productId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      toast.error("Failed to save product");
      return;
    }

    toast.success(productId ? "Product updated" : "Product created");
    router.push("/dashboard/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("productDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sku">{t("sku")}</Label>
              <Input id="sku" {...register("sku")} />
              {errors.sku && <p className="text-sm text-destructive">{errors.sku.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">{t("name")}</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t("description")}</Label>
            <Textarea id="description" {...register("description")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="flavour">{t("flavour")}</Label>
              <Input id="flavour" {...register("flavour")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dimensions_cm">{t("dimensions")}</Label>
              <Input id="dimensions_cm" placeholder="e.g. 10x5x3" {...register("dimensions_cm")} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("specifications")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="weight_per_unit_grams">{t("weight")} (g)</Label>
              <Input id="weight_per_unit_grams" type="number" {...register("weight_per_unit_grams")} />
              {errors.weight_per_unit_grams && <p className="text-sm text-destructive">{errors.weight_per_unit_grams.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="units_per_masterbox">{t("unitsPerMasterbox")}</Label>
              <Input id="units_per_masterbox" type="number" {...register("units_per_masterbox")} />
              {errors.units_per_masterbox && <p className="text-sm text-destructive">{errors.units_per_masterbox.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="masterboxes_per_pallet_air">{t("masterboxesPerPalletAir")}</Label>
              <Input id="masterboxes_per_pallet_air" type="number" {...register("masterboxes_per_pallet_air")} />
              {errors.masterboxes_per_pallet_air && <p className="text-sm text-destructive">{errors.masterboxes_per_pallet_air.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="masterboxes_per_pallet_sea">{t("masterboxesPerPalletSea")}</Label>
              <Input id="masterboxes_per_pallet_sea" type="number" {...register("masterboxes_per_pallet_sea")} />
              {errors.masterboxes_per_pallet_sea && <p className="text-sm text-destructive">{errors.masterboxes_per_pallet_sea.message}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue("is_active", checked)}
            />
            <Label htmlFor="is_active">{isActive ? t("active") : t("inactive")}</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("pricing")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price_per_unit">{t("pricePerUnit")} ($)</Label>
              <Input id="price_per_unit" type="number" step="0.01" min="0" {...register("price_per_unit")} />
              {errors.price_per_unit && <p className="text-sm text-destructive">{errors.price_per_unit.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "..." : tc("save")}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {tc("cancel")}
        </Button>
      </div>
    </form>
  );
}
