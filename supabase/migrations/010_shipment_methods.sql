-- Add shipment-method-specific masterboxes per pallet columns
ALTER TABLE products ADD COLUMN masterboxes_per_pallet_air INTEGER;
ALTER TABLE products ADD COLUMN masterboxes_per_pallet_sea INTEGER;

-- Migrate existing data: copy current value to both columns
UPDATE products SET
  masterboxes_per_pallet_air = masterboxes_per_pallet,
  masterboxes_per_pallet_sea = masterboxes_per_pallet;

-- Make columns required after migration
ALTER TABLE products ALTER COLUMN masterboxes_per_pallet_air SET NOT NULL;
ALTER TABLE products ALTER COLUMN masterboxes_per_pallet_sea SET NOT NULL;

-- Drop old column
ALTER TABLE products DROP COLUMN masterboxes_per_pallet;

-- Add shipment method to orders
ALTER TABLE orders ADD COLUMN shipment_method TEXT DEFAULT 'sea' CHECK (shipment_method IN ('air', 'sea'));
