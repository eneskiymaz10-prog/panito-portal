CREATE TABLE customer_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  price_per_unit NUMERIC NOT NULL,
  currency TEXT DEFAULT 'EUR',
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  UNIQUE(customer_id, product_id, valid_from)
);

CREATE INDEX idx_customer_prices_customer ON customer_prices(customer_id);
CREATE INDEX idx_customer_prices_product ON customer_prices(product_id);
