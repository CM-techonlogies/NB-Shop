-- Run in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Users (synced from Clerk via webhook)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Clerk user ID (user_xxxx)
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  label TEXT,
  name TEXT,
  phone TEXT,
  address TEXT,
  landmark TEXT,
  city TEXT,
  pincode TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  image_public_id TEXT,
  sort_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  brand TEXT,
  mrp NUMERIC(10,2) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  discount INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 0,
  weight TEXT,
  unit TEXT DEFAULT 'pcs' CHECK (unit IN ('kg','g','l','ml','pcs','dozen','pack')),
  sku TEXT UNIQUE,
  barcode TEXT,
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  trending BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Images
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  public_id TEXT
);

-- Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  qty INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id TEXT UNIQUE,
  user_id TEXT REFERENCES users(id),
  address JSONB NOT NULL,
  status TEXT DEFAULT 'pending_payment' CHECK (status IN ('pending_payment','payment_received','confirmed','preparing','packed','out_for_delivery','delivered','cancelled')),
  subtotal NUMERIC(10,2) NOT NULL,
  delivery_charge NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  notes TEXT,
  invoice_url TEXT,
  payment_screenshot_url TEXT,
  payment_screenshot_public_id TEXT,
  payment_screenshot_sent_at TIMESTAMPTZ,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID,
  name TEXT NOT NULL,
  image TEXT,
  price NUMERIC(10,2) NOT NULL,
  qty INTEGER NOT NULL,
  total NUMERIC(10,2) NOT NULL
);

-- Order Status History
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Banners
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  image_url TEXT,
  image_public_id TEXT,
  link TEXT,
  type TEXT DEFAULT 'slider' CHECK (type IN ('slider','festival','offer')),
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offers
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('flat','percentage','product','category')),
  discount_value NUMERIC(10,2),
  applicable_on TEXT DEFAULT 'all' CHECK (applicable_on IN ('all','product','category')),
  product_id UUID,
  category_id UUID,
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings (singleton)
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  store_name TEXT DEFAULT 'MyKirana Store',
  store_phone TEXT,
  store_address TEXT,
  store_email TEXT,
  upi_id TEXT,
  upi_qr_url TEXT,
  upi_qr_public_id TEXT,
  delivery_charge NUMERIC(10,2) DEFAULT 40,
  free_delivery_above NUMERIC(10,2) DEFAULT 499,
  whatsapp_enabled BOOLEAN DEFAULT false,
  invoice_prefix TEXT DEFAULT 'INV',
  invoice_counter INTEGER DEFAULT 10000,
  logo_url TEXT,
  business_hours TEXT,
  CONSTRAINT singleton CHECK (id = 1)
);
INSERT INTO settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT,
  title TEXT,
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id TEXT,
  action TEXT,
  target_model TEXT,
  target_id TEXT,
  details TEXT,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
