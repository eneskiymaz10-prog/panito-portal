-- Add base price per unit (display box) to products
ALTER TABLE products ADD COLUMN price_per_unit NUMERIC DEFAULT 0;
