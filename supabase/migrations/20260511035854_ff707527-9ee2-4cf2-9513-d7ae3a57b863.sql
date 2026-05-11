
CREATE OR REPLACE FUNCTION public.generate_order_code()
RETURNS TEXT LANGUAGE sql SET search_path = public AS $$
  SELECT 'STK-' || EXTRACT(YEAR FROM now())::text || '-' || LPAD(nextval('public.order_code_seq')::text, 5, '0');
$$;

CREATE OR REPLACE FUNCTION public.generate_receipt_code()
RETURNS TEXT LANGUAGE sql SET search_path = public AS $$
  SELECT 'STK-REC-' || EXTRACT(YEAR FROM now())::text || '-' || LPAD(nextval('public.receipt_code_seq')::text, 5, '0');
$$;
