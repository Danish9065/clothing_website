-- TABLE: profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) 
     ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  business_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer'
       CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: business_name is important for wholesale buyers

-- TABLE: categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  hero_image_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT,
  category_id UUID REFERENCES categories(id) 
              ON DELETE SET NULL,
  gender TEXT CHECK (gender IN ('boys','girls','child','unisex')),
  age_min_months INT,
  age_max_months INT,
  price NUMERIC(10,2) NOT NULL,
  compare_at_price NUMERIC(10,2),
  min_order_quantity INT NOT NULL DEFAULT 1,
  -- min_order_quantity = the "Min. Xpcs" shown on card
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_new_arrival BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: product_variants
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) 
             ON DELETE CASCADE,
  size_label TEXT NOT NULL,
  sku TEXT UNIQUE,
  stock_quantity INT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: product_images
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) 
             ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  cloudinary_public_id TEXT
);

-- TABLE: addresses
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  business_name TEXT,
  phone_number TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  business_name TEXT,
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
         CHECK (status IN (
           'pending','confirmed','processing',
           'shipped','delivered','cancelled'
         )),
  payment_status TEXT NOT NULL DEFAULT 'pending'
                 CHECK (payment_status IN (
                   'pending','paid','failed','refunded'
                 )),
  payment_provider TEXT,
  payment_reference TEXT,
  shipping_address JSONB NOT NULL,
  notes TEXT,
  -- notes: special instructions from wholesale buyer
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: order_items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) 
           ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_variant_id UUID REFERENCES product_variants(id) 
                     ON DELETE SET NULL,
  product_name_snapshot TEXT NOT NULL,
  size_label_snapshot TEXT NOT NULL,
  image_url_snapshot TEXT,
  min_order_quantity_snapshot INT NOT NULL,
  quantity INT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  line_total NUMERIC(10,2) NOT NULL
);

-- TABLE: site_settings
-- (For hero image URL, announcement text, etc.)
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default settings
INSERT INTO site_settings (key, value) VALUES
  ('hero_image_url', ''),
  ('announcement_text', 'Free shipping on orders above ₹5000'),
  ('announcement_active', 'true');

------------------------------------------------------------
-- Row Level Security (RLS)
------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users read their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- products
CREATE POLICY "Public reads active products" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins access all products" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- product_variants
CREATE POLICY "Public reads active product variants" ON product_variants
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins access all product variants" ON product_variants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- product_images
CREATE POLICY "Public reads product images" ON product_images
  FOR SELECT USING (true);

CREATE POLICY "Admins access all product images" ON product_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- categories
CREATE POLICY "Public reads categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Admins access all categories" ON categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- orders
CREATE POLICY "Users see their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins access all orders" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- order_items
CREATE POLICY "Users see items from their orders" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "Users insert items for their own orders" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "Admins access all order items" ON order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- addresses
CREATE POLICY "Users manage their own addresses" ON addresses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins access all addresses" ON addresses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- site_settings
CREATE POLICY "Public reads site settings" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins manage site settings" ON site_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

------------------------------------------------------------
-- Trigger: auto-create profile on user signup
------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

------------------------------------------------------------
-- Seed Data:
------------------------------------------------------------

-- Categories
INSERT INTO categories (id, name, slug, display_order)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Boys', 'boys', 1),
  ('22222222-2222-2222-2222-222222222222', 'Girls', 'girls', 2),
  ('33333333-3333-3333-3333-333333333333', 'Child', 'child', 3);

-- Products
INSERT INTO products (id, name, slug, gender, price, min_order_quantity, is_featured, is_active, category_id)
VALUES
  ('44444444-4444-4444-4444-444444444441', 'Summer Casual Set', 'summer-casual-set', 'boys', 450, 6, true, true, '11111111-1111-1111-1111-111111111111'),
  ('44444444-4444-4444-4444-444444444442', 'Floral Party Dress', 'floral-party-dress', 'girls', 680, 4, true, true, '22222222-2222-2222-2222-222222222222'),
  ('44444444-4444-4444-4444-444444444443', 'Premium Cotton Onesie', 'premium-cotton-onesie', 'child', 320, 12, true, true, '33333333-3333-3333-3333-333333333333'),
  ('44444444-4444-4444-4444-444444444444', 'Rugged Denim Jacket', 'rugged-denim-jacket', 'boys', 890, 5, true, true, '11111111-1111-1111-1111-111111111111');

-- Product Variants
INSERT INTO product_variants (product_id, size_label, sku, stock_quantity, is_active)
VALUES
  ('44444444-4444-4444-4444-444444444441', 'S', 'SCS-BOYS-01-S', 45, true),
  ('44444444-4444-4444-4444-444444444441', 'M', 'SCS-BOYS-01-M', 25, true),
  ('44444444-4444-4444-4444-444444444441', 'L', 'SCS-BOYS-01-L', 50, true),
  
  ('44444444-4444-4444-4444-444444444442', 'M', 'FPD-GIRLS-01-M', 30, true),
  ('44444444-4444-4444-4444-444444444442', 'L', 'FPD-GIRLS-01-L', 20, true),
  ('44444444-4444-4444-4444-444444444442', 'XL', 'FPD-GIRLS-01-XL', 35, true),

  ('44444444-4444-4444-4444-444444444443', '0-3M', 'PCO-CHILD-01-03M', 50, true),
  ('44444444-4444-4444-4444-444444444443', '3-6M', 'PCO-CHILD-01-36M', 40, true),
  ('44444444-4444-4444-4444-444444444443', '6-12M', 'PCO-CHILD-01-612M', 20, true),

  ('44444444-4444-4444-4444-444444444444', 'S', 'RDJ-BOYS-01-S', 30, true),
  ('44444444-4444-4444-4444-444444444444', 'L', 'RDJ-BOYS-01-L', 20, true),
  ('44444444-4444-4444-4444-444444444444', 'XL', 'RDJ-BOYS-01-XL', 40, true);
