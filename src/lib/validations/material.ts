import { z } from "zod";

export const rawMaterialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  unit: z.enum(["kg", "liters", "pieces"]),
  current_stock: z.coerce.number().min(0).default(0),
  min_stock_level: z.coerce.number().min(0).default(0),
});

export type RawMaterialFormValues = z.infer<typeof rawMaterialSchema>;

export const stockMovementSchema = z.object({
  raw_material_id: z.string().uuid(),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  type: z.enum(["purchase", "production_use", "adjustment"]),
  reference: z.string().optional(),
});

export type StockMovementFormValues = z.infer<typeof stockMovementSchema>;

export const bomEntrySchema = z.object({
  product_id: z.string().uuid(),
  raw_material_id: z.string().uuid(),
  quantity_per_unit: z.coerce.number().positive("Quantity must be positive"),
});
