-- Products catalog
CREATE TABLE products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  domain text NOT NULL,
  name text NOT NULL,
  item_type text NOT NULL,
  price_bdt integer NOT NULL DEFAULT 0,
  description text,
  thumbnail_url text,
  is_active boolean DEFAULT true,
  is_free boolean GENERATED ALWAYS AS (price_bdt = 0) STORED,
  stock_count integer,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Course modules (for Video Course products)
CREATE TABLE course_modules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  title text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Course lessons (videos within modules)
CREATE TABLE course_lessons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id uuid REFERENCES course_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  video_url text,
  video_embed_url text,
  duration_minutes integer,
  position integer NOT NULL DEFAULT 0,
  is_preview boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Digital assets (PDFs, files for download)
CREATE TABLE digital_assets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size_bytes bigint,
  created_at timestamptz DEFAULT now()
);

-- Customers (course buyers - separate from IR platform users)
CREATE TABLE shop_customers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  password_hash text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'disabled')),
  email_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders
CREATE TABLE shop_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES shop_customers(id),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
  total_bdt integer NOT NULL,
  payment_method text,
  payment_reference text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items (snapshot of product at time of purchase)
CREATE TABLE shop_order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES shop_orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  product_name text NOT NULL,
  item_type text NOT NULL,
  price_bdt integer NOT NULL,
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Customer access grants (what a customer can access)
CREATE TABLE customer_access (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid REFERENCES shop_customers(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  order_id uuid REFERENCES shop_orders(id),
  granted_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  UNIQUE(customer_id, product_id)
);

-- Course progress tracking
CREATE TABLE course_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid REFERENCES shop_customers(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES course_lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  UNIQUE(customer_id, lesson_id)
);

-- Admin accounts (separate from IR platform users)
CREATE TABLE admin_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  password_hash text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Generate order numbers
CREATE SEQUENCE order_number_seq START 1001;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'LCS-' || LPAD(nextval('order_number_seq')::text, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON shop_orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER shop_customers_updated_at BEFORE UPDATE ON shop_customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER shop_orders_updated_at BEFORE UPDATE ON shop_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_products_domain ON products(domain);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_shop_orders_customer ON shop_orders(customer_id);
CREATE INDEX idx_shop_orders_status ON shop_orders(status);
CREATE INDEX idx_customer_access_customer ON customer_access(customer_id);
CREATE INDEX idx_customer_access_product ON customer_access(product_id);
