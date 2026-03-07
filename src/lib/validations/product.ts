import { z } from "zod";

export const productSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  flavour: z.string().optional(),
  weight_per_unit_grams: z.coerce.number().positive("Weight must be positive"),
  dimensions_cm: z.string().optional(),
  units_per_masterbox: z.coerce.number().int().positive("Units per masterbox must be positive"),
  masterboxes_per_pallet: z.coerce.number().int().positive("Masterboxes per pallet must be positive"),
  is_active: z.boolean().default(true),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const productTranslationSchema = z.object({
  language: z.enum(["en", "tr"]),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});
