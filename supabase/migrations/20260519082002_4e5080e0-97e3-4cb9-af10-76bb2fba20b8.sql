
-- Add new enum value for order_status (must be in its own statement, committed before use)
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'verification_pending';

-- Create verification status enum
DO $$ BEGIN
  CREATE TYPE public.verification_status AS ENUM ('not_required', 'pending', 'verified', 'requires_clarification', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Extend orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS bathroom_photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS prefer_whatsapp_photos boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_status public.verification_status NOT NULL DEFAULT 'not_required',
  ADD COLUMN IF NOT EXISTS verification_notes text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES public.technicians(id),
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS photo_analysis jsonb;

-- Create the storage bucket for bathroom photos (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('bathroom-photos', 'bathroom-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Public RLS policies for the bucket
DO $$ BEGIN
  CREATE POLICY "Public can view bathroom photos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'bathroom-photos');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public can upload bathroom photos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'bathroom-photos');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public can delete bathroom photos"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'bathroom-photos');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Scheduled cleanup: delete photo files older than 90 days for completed orders
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.archive_old_bathroom_photos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN
    SELECT o.name
    FROM storage.objects o
    WHERE o.bucket_id = 'bathroom-photos'
      AND o.created_at < now() - interval '90 days'
      AND EXISTS (
        SELECT 1 FROM public.orders ord
        WHERE ord.status = 'completed'
          AND split_part(o.name, '/', 1) = ord.id::text
      )
  LOOP
    DELETE FROM storage.objects WHERE bucket_id = 'bathroom-photos' AND name = obj.name;
  END LOOP;
END;
$$;

-- Schedule weekly (Sundays at 3 AM)
DO $$ BEGIN
  PERFORM cron.schedule('archive-old-bathroom-photos', '0 3 * * 0', $cron$SELECT public.archive_old_bathroom_photos();$cron$);
EXCEPTION WHEN OTHERS THEN null; END $$;
