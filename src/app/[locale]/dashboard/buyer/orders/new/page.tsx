"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Package } from "lucide-react";
import { toast } from "sonner";
import { calculateFromMasterboxes, formatPallets } from "@/lib/utils/pallet-calculator";
import { formatCurrency } from "@/lib/utils/format";

interface Product {
  id: string;
  name: string;
  sku: string;
  flavour: string | null;
  units_per_masterbox: number;
  masterboxes_per_pallet: number;
  weight_per_unit_grams: number;
}

interface Price {
  product_id: string;
  price_per_unit: number;
  currency: string;
}

interface OrderItem {
  product_id: string;
  quantity_masterboxes: number;
}

export default function NewOrderPage() {
  const t = useTranslations("orders");
  const tc = useTranslations("common");
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [items, setItems] = useState<OrderItem[]>([{ product_id: "", quantity_masterboxes: 1 }]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: prods } = await supabase.from("products").select("*").eq("is_active", true);
      const { data: prc } = await supabase.from("customer_prices").select("*").eq("customer_id", user!.id);
      setProducts(prods || []);
      setPrices(prc || []);
    }
    loadData();
  }, []);

  const priceMap = new Map(prices.map((p) => [p.product_id, p]));
  const productMap = new Map(products.map((p) => [p.id, p]));

  function addItem() {
    setItems([...items, { product_id: "", quantity_masterboxes: 1 }]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof OrderItem, value: string | number) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  }

  function getItemCalculation(item: OrderItem) {
    const product = productMap.get(item.product_id);
    const price = priceMap.get(item.product_id);
    if (!product || !item.quantity_masterboxes) return null;

    const calc = calculateFromMasterboxes(
      item.quantity_masterboxes,
      product.masterboxes_per_pallet,
      product.units_per_masterbox
    );
    const lineTotal = price ? calc.totalUnits * price.price_per_unit : 0;

    return { ...calc, lineTotal, currency: price?.currency || "EUR" };
  }

  const totalAmount = items.reduce((sum, item) => {
    const calc = getItemCalculation(item);
    return sum + (calc?.lineTotal || 0);
  }, 0);

  async function handleSubmit() {
    const validItems = items.filter((i) => i.product_id && i.quantity_masterboxes > 0);
    if (validItems.length === 0) {
      toast.error("Add at least one item");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: validItems, notes: notes || undefined }),
    });

    if (!res.ok) {
      toast.error("Failed to place order");
      setSubmitting(false);
      return;
    }

    toast.success(t("orderPlaced"));
    router.push("/dashboard/buyer/orders");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("newOrder")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("items")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => {
            const calc = getItemCalculation(item);
            return (
              <div key={index} className="rounded-lg border p-4 space-y-3">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>{t("selectProduct")}</Label>
                    <Select
                      value={item.product_id}
                      onValueChange={(val) => updateItem(index, "product_id", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectProduct")} />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} {p.flavour ? `(${p.flavour})` : ""} - {p.sku}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("masterboxes")}</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity_masterboxes}
                      onChange={(e) => updateItem(index, "quantity_masterboxes", parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={items.length === 1}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {calc && (
                  <div className="flex gap-6 text-sm text-muted-foreground bg-muted/50 rounded p-2">
                    <span>{t("pallets")}: <strong>{formatPallets(calc.totalPallets)}</strong></span>
                    <span>Units: <strong>{calc.totalUnits}</strong></span>
                    {calc.lineTotal > 0 && (
                      <span>{t("lineTotal")}: <strong>{formatCurrency(calc.lineTotal, calc.currency)}</strong></span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <Button variant="outline" onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" />
            {t("addItem")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tc("notes")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions..." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("orderSummary")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{t("totalAmount")}: {formatCurrency(totalAmount)}</div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={submitting} size="lg">
          <Package className="mr-2 h-4 w-4" />
          {submitting ? "..." : t("submitOrder")}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          {tc("cancel")}
        </Button>
      </div>
    </div>
  );
}
