-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_bom ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE packing_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- PROFILES
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT USING (get_user_role() = 'admin');
CREATE POLICY "Admin can update all profiles" ON profiles
  FOR UPDATE USING (get_user_role() = 'admin');
CREATE POLICY "Admin can insert profiles" ON profiles
  FOR INSERT WITH CHECK (get_user_role() = 'admin');

-- PRODUCTS (everyone can read active products, admin can write)
CREATE POLICY "Anyone authenticated can view active products" ON products
  FOR SELECT USING (is_active = true OR get_user_role() = 'admin');
CREATE POLICY "Admin can manage products" ON products
  FOR ALL USING (get_user_role() = 'admin');

-- PRODUCT TRANSLATIONS
CREATE POLICY "Anyone can view translations" ON product_translations
  FOR SELECT USING (true);
CREATE POLICY "Admin can manage translations" ON product_translations
  FOR ALL USING (get_user_role() = 'admin');

-- CUSTOMER PRICES
CREATE POLICY "Buyers see own prices" ON customer_prices
  FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Admin can manage prices" ON customer_prices
  FOR ALL USING (get_user_role() = 'admin');

-- ORDERS
CREATE POLICY "Buyers see own orders" ON orders
  FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Buyers can create orders" ON orders
  FOR INSERT WITH CHECK (customer_id = auth.uid() AND get_user_role() = 'buyer');
CREATE POLICY "Admin can view all orders" ON orders
  FOR SELECT USING (get_user_role() IN ('admin', 'production', 'accounting'));
CREATE POLICY "Admin can update orders" ON orders
  FOR UPDATE USING (get_user_role() = 'admin');
CREATE POLICY "Production can update order status" ON orders
  FOR UPDATE USING (get_user_role() = 'production');

-- ORDER ITEMS
CREATE POLICY "Buyers see own order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
  );
CREATE POLICY "Buyers can create order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
  );
CREATE POLICY "Internal roles see all order items" ON order_items
  FOR SELECT USING (get_user_role() IN ('admin', 'production', 'accounting'));

-- RAW MATERIALS
CREATE POLICY "Production and admin can view materials" ON raw_materials
  FOR SELECT USING (get_user_role() IN ('admin', 'production'));
CREATE POLICY "Production and admin can manage materials" ON raw_materials
  FOR ALL USING (get_user_role() IN ('admin', 'production'));

-- PRODUCT BOM
CREATE POLICY "Production and admin can view BOM" ON product_bom
  FOR SELECT USING (get_user_role() IN ('admin', 'production'));
CREATE POLICY "Admin can manage BOM" ON product_bom
  FOR ALL USING (get_user_role() = 'admin');

-- STOCK MOVEMENTS
CREATE POLICY "Production and admin can view movements" ON stock_movements
  FOR SELECT USING (get_user_role() IN ('admin', 'production'));
CREATE POLICY "Production can create movements" ON stock_movements
  FOR INSERT WITH CHECK (get_user_role() IN ('admin', 'production'));

-- PRODUCTION ORDERS
CREATE POLICY "Production and admin can view production orders" ON production_orders
  FOR SELECT USING (get_user_role() IN ('admin', 'production'));
CREATE POLICY "Production can manage production orders" ON production_orders
  FOR ALL USING (get_user_role() IN ('admin', 'production'));

-- PACKING LISTS
CREATE POLICY "Internal roles can view packing lists" ON packing_lists
  FOR SELECT USING (get_user_role() IN ('admin', 'production', 'accounting'));
CREATE POLICY "Admin and production can manage packing lists" ON packing_lists
  FOR ALL USING (get_user_role() IN ('admin', 'production'));
CREATE POLICY "Buyers can view own packing lists" ON packing_lists
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = packing_lists.order_id AND orders.customer_id = auth.uid())
  );

-- INVOICES
CREATE POLICY "Buyers see own invoices" ON invoices
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = invoices.order_id AND orders.customer_id = auth.uid())
  );
CREATE POLICY "Admin and accounting can view all invoices" ON invoices
  FOR SELECT USING (get_user_role() IN ('admin', 'accounting'));
CREATE POLICY "Admin can manage invoices" ON invoices
  FOR ALL USING (get_user_role() IN ('admin', 'accounting'));

-- PAYMENTS
CREATE POLICY "Accounting can manage payments" ON payments
  FOR ALL USING (get_user_role() IN ('admin', 'accounting'));
CREATE POLICY "Buyers can view own payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices
      JOIN orders ON orders.id = invoices.order_id
      WHERE invoices.id = payments.invoice_id AND orders.customer_id = auth.uid()
    )
  );

-- NOTIFICATIONS
CREATE POLICY "Users see own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);
