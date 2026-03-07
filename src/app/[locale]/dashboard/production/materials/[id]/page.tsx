"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils/format";
import { Plus, ArrowUp, ArrowDown, Minus } from "lucide-react";

interface StockMovement {
  id: string;
  quantity: number;
  type: string;
  reference: string | null;
  created_at: string;
}

export default function MaterialDetailPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations("materials");
  const [material, setMaterial] = useState<any>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [newMovement, setNewMovement] = useState({ quantity: "", type: "purchase", reference: "" });

  useEffect(() => { load(); }, [id]);

  async function load() {
    const supabase = createClient();
    const { data: m } = await supabase.from("raw_materials").select("*").eq("id", id).single();
    const { data: mvs } = await supabase.from("stock_movements").select("*").eq("raw_material_id", id).order("created_at", { ascending: false });
    setMaterial(m);
    setMovements(mvs || []);
  }

  async function addMovement() {
    if (!newMovement.quantity) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const qty = parseFloat(newMovement.quantity);
    const actualQty = newMovement.type === "production_use" ? -Math.abs(qty) : Math.abs(qty);

    const { error } = await supabase.from("stock_movements").insert({
      raw_material_id: id,
      quantity: actualQty,
      type: newMovement.type,
      reference: newMovement.reference || null,
      created_by: user?.id,
    });
    if (error) { toast.error("Failed to add movement"); return; }
    toast.success("Stock updated");
    setNewMovement({ quantity: "", type: "purchase", reference: "" });
    load();
  }

  if (!material) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{material.name}</h1>
        <Badge variant={material.current_stock <= material.min_stock_level ? "destructive" : "outline"}>
          {material.current_stock} {material.unit}
        </Badge>
      </div>

      <Card>
        <CardHeader><CardTitle>{t("addStock")}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 items-end">
            <div className="space-y-1">
              <Label>{t("type")}</Label>
              <Select value={newMovement.type} onValueChange={(v) => setNewMovement({...newMovement, type: v})}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">{t("purchase")}</SelectItem>
                  <SelectItem value="production_use">{t("productionUse")}</SelectItem>
                  <SelectItem value="adjustment">{t("adjustment")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>{t("quantity")} ({material.unit})</Label>
              <Input type="number" step="0.01" value={newMovement.quantity} onChange={(e) => setNewMovement({...newMovement, quantity: e.target.value})} className="w-32" />
            </div>
            <div className="flex-1 space-y-1">
              <Label>{t("reference")}</Label>
              <Input value={newMovement.reference} onChange={(e) => setNewMovement({...newMovement, reference: e.target.value})} placeholder="PO number, order ref..." />
            </div>
            <Button onClick={addMovement}><Plus className="mr-2 h-4 w-4" /> Add</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t("stockMovements")}</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>{t("type")}</TableHead>
                <TableHead>{t("quantity")}</TableHead>
                <TableHead>{t("reference")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((mv) => (
                <TableRow key={mv.id}>
                  <TableCell className="text-sm">{formatDateTime(mv.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={mv.quantity > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}>
                      {mv.quantity > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                      {mv.type === "purchase" ? t("purchase") : mv.type === "production_use" ? t("productionUse") : t("adjustment")}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {mv.quantity > 0 ? "+" : ""}{mv.quantity} {material.unit}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{mv.reference || "-"}</TableCell>
                </TableRow>
              ))}
              {movements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No movements yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
