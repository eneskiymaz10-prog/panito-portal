"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  min_stock_level: number;
}

export default function MaterialsPage() {
  const t = useTranslations("materials");
  const tc = useTranslations("common");
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [newMaterial, setNewMaterial] = useState({ name: "", unit: "kg", min_stock_level: "0" });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, []);

  async function loadMaterials() {
    const supabase = createClient();
    const { data } = await supabase.from("raw_materials").select("*").order("name");
    setMaterials(data || []);
  }

  async function addMaterial() {
    if (!newMaterial.name) return;
    const supabase = createClient();
    const { error } = await supabase.from("raw_materials").insert({
      name: newMaterial.name,
      unit: newMaterial.unit,
      min_stock_level: parseFloat(newMaterial.min_stock_level) || 0,
    });
    if (error) { toast.error("Failed to add material"); return; }
    toast.success("Material added");
    setNewMaterial({ name: "", unit: "kg", min_stock_level: "0" });
    setDialogOpen(false);
    loadMaterials();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />{t("addMaterial")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("addMaterial")}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("name")}</Label>
                <Input value={newMaterial.name} onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{t("unit")}</Label>
                <Select value={newMaterial.unit} onValueChange={(v) => setNewMaterial({...newMaterial, unit: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="liters">liters</SelectItem>
                    <SelectItem value="pieces">pieces</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("minStock")}</Label>
                <Input type="number" value={newMaterial.min_stock_level} onChange={(e) => setNewMaterial({...newMaterial, min_stock_level: e.target.value})} />
              </div>
              <Button onClick={addMaterial} className="w-full">{tc("save")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("unit")}</TableHead>
                <TableHead>{t("currentStock")}</TableHead>
                <TableHead>{t("minStock")}</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((m) => {
                const isLow = m.current_stock <= m.min_stock_level;
                return (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Link href={"/dashboard/production/materials/" + m.id} className="font-medium text-primary hover:underline">
                        {m.name}
                      </Link>
                    </TableCell>
                    <TableCell>{m.unit}</TableCell>
                    <TableCell className="font-medium">{m.current_stock} {m.unit}</TableCell>
                    <TableCell>{m.min_stock_level} {m.unit}</TableCell>
                    <TableCell>
                      {isLow ? (
                        <Badge variant="destructive">Low Stock</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700">OK</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {materials.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No materials yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
