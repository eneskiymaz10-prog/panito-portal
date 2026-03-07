"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

interface CustomerPrice {
  id: string;
  product_id: string;
  price_per_unit: number;
  currency: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations();
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [prices, setPrices] = useState<CustomerPrice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newPrice, setNewPrice] = useState({ product_id: "", price_per_unit: "", currency: "USD" });

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: c } = await supabase.from("profiles").select("*").eq("id", id).single();
      const { data: p } = await supabase.from("customer_prices").select("*").eq("customer_id", id);
      const { data: prods } = await supabase.from("products").select("id, name, sku").eq("is_active", true);
      setCustomer(c);
      setPrices(p || []);
      setProducts(prods || []);
    }
    load();
  }, [id]);

  async function addPrice() {
    if (!newPrice.product_id || !newPrice.price_per_unit) return;
    const supabase = createClient();
    const { data, error } = await supabase.from("customer_prices").insert({
      customer_id: id,
      product_id: newPrice.product_id,
      price_per_unit: parseFloat(newPrice.price_per_unit),
      currency: newPrice.currency,
    }).select().single();
    if (error) { toast.error("Failed to add price"); return; }
    setPrices([...prices, data]);
    setNewPrice({ product_id: "", price_per_unit: "", currency: "USD" });
    toast.success("Price added");
  }

  async function removePrice(priceId: string) {
    const supabase = createClient();
    await supabase.from("customer_prices").delete().eq("id", priceId);
    setPrices(prices.filter((p) => p.id !== priceId));
    toast.success("Price removed");
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  if (!customer) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{customer.company_name || "Customer"}</h1>
      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div><Label>Company</Label><p>{customer.company_name || "-"}</p></div>
          <div><Label>Country</Label><p>{customer.country || "-"}</p></div>
          <div><Label>Email</Label><p>{customer.contact_email || "-"}</p></div>
          <div><Label>Phone</Label><p>{customer.contact_phone || "-"}</p></div>
          <div className="md:col-span-2"><Label>Address</Label><p>{customer.address || "-"}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Customer Pricing</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price / Unit</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prices.map((price) => {
                const product = productMap.get(price.product_id);
                return (
                  <TableRow key={price.id}>
                    <TableCell>{product ? product.name + " (" + product.sku + ")" : price.product_id}</TableCell>
                    <TableCell>{formatCurrency(price.price_per_unit, price.currency)}</TableCell>
                    <TableCell>{price.currency}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removePrice(price.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="flex gap-3 items-end border-t pt-4">
            <div className="flex-1 space-y-1">
              <Label>Product</Label>
              <Select value={newPrice.product_id} onValueChange={(v) => setNewPrice({...newPrice, product_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-32 space-y-1">
              <Label>Price / Unit</Label>
              <Input type="number" step="0.01" value={newPrice.price_per_unit} onChange={(e) => setNewPrice({...newPrice, price_per_unit: e.target.value})} />
            </div>
            <div className="w-24 space-y-1">
              <Label>Currency</Label>
              <Select value={newPrice.currency} onValueChange={(v) => setNewPrice({...newPrice, currency: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="TRY">TRY</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addPrice}><Plus className="mr-2 h-4 w-4" /> Add</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
