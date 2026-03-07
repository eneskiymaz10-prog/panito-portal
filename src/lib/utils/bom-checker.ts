export interface MaterialRequirement {
  materialId: string;
  materialName: string;
  unit: string;
  needed: number;
  available: number;
  shortage: number;
  sufficient: boolean;
}

export interface BomCheckResult {
  allSufficient: boolean;
  materials: MaterialRequirement[];
}

interface OrderItemForBom {
  product_id: string;
  quantity_masterboxes: number;
  units_per_masterbox: number;
}

interface BomEntry {
  raw_material_id: string;
  quantity_per_unit: number;
}

interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
}

export function checkBomAvailability(
  orderItems: OrderItemForBom[],
  bomEntries: BomEntry[],
  rawMaterials: RawMaterial[]
): BomCheckResult {
  const materialNeeds = new Map<string, number>();

  for (const item of orderItems) {
    const totalUnits = item.quantity_masterboxes * item.units_per_masterbox;
    const productBom = bomEntries.filter(
      (b) => b.raw_material_id !== undefined
    );

    for (const bom of productBom) {
      const current = materialNeeds.get(bom.raw_material_id) || 0;
      materialNeeds.set(
        bom.raw_material_id,
        current + totalUnits * bom.quantity_per_unit
      );
    }
  }

  const materials: MaterialRequirement[] = [];
  for (const [materialId, needed] of materialNeeds) {
    const material = rawMaterials.find((m) => m.id === materialId);
    if (!material) continue;

    const shortage = Math.max(0, needed - material.current_stock);
    materials.push({
      materialId,
      materialName: material.name,
      unit: material.unit,
      needed: Math.round(needed * 100) / 100,
      available: material.current_stock,
      shortage: Math.round(shortage * 100) / 100,
      sufficient: shortage === 0,
    });
  }

  return {
    allSufficient: materials.every((m) => m.sufficient),
    materials,
  };
}
