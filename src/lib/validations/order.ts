import { z } from "zod";

export const orderItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity_masterboxes: z.coerce.number().int().positive("Quantity must be at least 1"),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  shipment_method: z.enum(["air", "sea"]).default("sea"),
  notes: z.string().optional(),
});

export type CreateOrderValues = z.infer<typeof createOrderSchema>;
