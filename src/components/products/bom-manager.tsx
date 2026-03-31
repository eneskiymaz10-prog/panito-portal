"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface BomEntry {
  id: string;
  raw_material_id: string;
  quantity_per_unit: number;
  raw_materials: { id: string; name: string; unit: string };
}

interface RawMaterial {
  id: string;
  name: string;
  unit: string;
}

export function BomManager({ productId }: { productId: string }) {
  const [bom, setBom] = useState<BomEntry[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [newEntry, setNewEntry] = useState({ raw_material_id: "", quantity_per_unit: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [bomRes, matsRes] = await Promise.all([
        fetch(`/api/products/${productId}/bom`),
        createClient().from("raw_materials").select("id, name, unit").order("name"),
      ]);
      if (bomRes.ok) setBom(await bomRes.json());
      if (!matsRes.error) setMaterials(matsRes.data || []);
      setLoading(false);
    }
    load();
  }, [productId]);

  const usedMaterialIds = new Set(bom.map((b) => b.raw_material_id));
  const availableMaterials = materials.filter((m) => !usedMaterialIds.has(m.id));

  async function addEntry() {
    if (!newEntry.raw_material_id || !newEntry.quantity_per_unit) return;
    const res = await fetch(`/api/products/${productId}/bom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        raw_material_id: newEntry.raw_material_id,
        quantity_per_unit: parseFloat(newEntry.quantity_per_unit),
      }),
    });
    if (!res.ok) { toast.error("Failed to add BOM entry"); return; }
    const data = await res.json();
    setBom([...bom, data]);
    setNewEntry({ raw_material_id: "", quantity_per_unit: "" });
    toast.success("BOM entry added");
  }

  async function removeEntry(bomId: string) {
    const res = await fetch(`/api/products/${productId}/bom`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bomId }),
    });
    if (!res.ok) { toast.error("Failed to remove BOM entry"); return; }
    setBom(bom.filter((b) => b.id !== bomId));
    toast.success("BOM entry removed");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bill of Materials (BOM)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Raw Material</TableHead>
                  <TableHead>Qty / Display Box</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bom.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.raw_materials.name}</TableCell>
                    <TableCell>{entry.quantity_per_unit}</TableCell>
                    <TableCell>{entry.raw_materials.unit}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEntry(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {bom.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                      No BOM entries yet. Add raw materials below.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {availableMaterials.length > 0 && (
              <div className="flex gap-3 items-end border-t pt-4">
                <div className="flex-1 space-y-1">
                  <Label>Raw Material</Label>
                  <Select
                    value={newEntry.raw_material_id}
                    onValueChange={(v) => setNewEntry({ ...newEntry, raw_material_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMaterials.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name} ({m.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-36 space-y-1">
                  <Label>Qty per display box</Label>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="0.000"
                    value={newEntry.quantity_per_unit}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, quantity_per_unit: e.target.value })
                    }
                  />
                </div>
                <Button onClick={addEntry}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
            )}

            {availableMaterials.length === 0 && materials.length === 0 && (
              <p className="text-sm text-muted-foreground border-t pt-4">
                No raw materials found. Create raw materials first in the Production section.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
