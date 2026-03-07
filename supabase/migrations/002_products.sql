CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  flavour TEXT,
  weight_per_unit_grams NUMERIC NOT NULL,
  dimensions_cm TEXT,
  units_per_masterbox INTEGER NOT NULL,
  masterboxes_per_pallet INTEGER NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE product_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('en', 'tr')),
  name TEXT NOT NULL,
  description TEXT,
  UNIQUE(product_id, language)
);
