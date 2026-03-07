CREATE TABLE raw_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('kg', 'liters', 'pieces')),
  current_stock NUMERIC DEFAULT 0,
  min_stock_level NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE product_bom (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  raw_material_id UUID REFERENCES raw_materials(id) ON DELETE CASCADE,
  quantity_per_unit NUMERIC NOT NULL,
  UNIQUE(product_id, raw_material_id)
);

CREATE INDEX idx_product_bom_product ON product_bom(product_id);

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_material_id UUID REFERENCES raw_materials(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'production_use', 'adjustment')),
  reference TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_stock_movements_material ON stock_movements(raw_material_id);

-- Update current_stock when stock movement is inserted
CREATE OR REPLACE FUNCTION update_material_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE raw_materials
  SET current_stock = current_stock + NEW.quantity
  WHERE id = NEW.raw_material_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_stock_movement
  AFTER INSERT ON stock_movements
  FOR EACH ROW EXECUTE FUNCTION update_material_stock();
