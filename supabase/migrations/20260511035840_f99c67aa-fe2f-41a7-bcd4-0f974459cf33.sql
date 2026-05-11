
-- ENUMS
CREATE TYPE public.order_status AS ENUM ('pending','confirmed','assigned','completed','cancelled');
CREATE TYPE public.installation_slot AS ENUM ('morning','afternoon','evening');
CREATE TYPE public.receipt_kind AS ENUM ('order','completion');

-- PRODUCTS
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_kes INTEGER NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL DEFAULT '',
  stock_count INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TECHNICIANS
CREATE TABLE public.technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ORDERS
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  county TEXT NOT NULL,
  address TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  unit_price_kes INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_kes INTEGER NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  installation_date DATE NOT NULL,
  installation_slot public.installation_slot NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  technician_id UUID REFERENCES public.technicians(id),
  technician_name TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sequence for order codes
CREATE SEQUENCE public.order_code_seq START 142;

CREATE OR REPLACE FUNCTION public.generate_order_code()
RETURNS TEXT LANGUAGE sql AS $$
  SELECT 'STK-' || EXTRACT(YEAR FROM now())::text || '-' || LPAD(nextval('public.order_code_seq')::text, 5, '0');
$$;

-- RECEIPTS
CREATE TABLE public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_code TEXT NOT NULL UNIQUE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  kind public.receipt_kind NOT NULL DEFAULT 'order',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE SEQUENCE public.receipt_code_seq START 142;

CREATE OR REPLACE FUNCTION public.generate_receipt_code()
RETURNS TEXT LANGUAGE sql AS $$
  SELECT 'STK-REC-' || EXTRACT(YEAR FROM now())::text || '-' || LPAD(nextval('public.receipt_code_seq')::text, 5, '0');
$$;

-- RLS — public access for MVP staff workflow (admin gated by password in app)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "public write products" ON public.products FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "public read technicians" ON public.technicians FOR SELECT USING (true);
CREATE POLICY "public write technicians" ON public.technicians FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "public write orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "public read receipts" ON public.receipts FOR SELECT USING (true);
CREATE POLICY "public write receipts" ON public.receipts FOR ALL USING (true) WITH CHECK (true);

-- Realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER TABLE public.orders REPLICA IDENTITY FULL;
