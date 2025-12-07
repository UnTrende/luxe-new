-- ============================================================================
-- INFRASTRUCTURE CONSOLIDATION & STANDARDIZATION
-- ============================================================================
-- Purpose: Consolidate storage buckets and standardize schema
-- Version: 1.0
-- Date: 2025-12-06
-- Breaking Changes: NONE - All changes are backward compatible
-- ============================================================================

-- ============================================================================
-- STEP 1: ENSURE NEW CONSOLIDATED BUCKETS EXIST
-- ============================================================================
-- The new bucket structure is:
--   - luxecut-public (products, services, site assets) → Admin write, Public read
--   - luxecut-photos (barber portfolios) → Owner write, Public read
--   - luxecut-admin (internal docs) → Admin only

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('luxecut-public', 'luxecut-public', true),
  ('luxecut-photos', 'luxecut-photos', true),
  ('luxecut-admin', 'luxecut-admin', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 2: ADD TRANSITION POLICIES FOR OLD BUCKETS
-- ============================================================================
-- Allow reading from old buckets (they may still have images)
-- This does NOT delete old buckets - they remain accessible

DO $$
BEGIN
  -- Ensure old bucket policies still allow public read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Legacy bucket public read'
  ) THEN
    EXECUTE 'CREATE POLICY "Legacy bucket public read" ON storage.objects
      FOR SELECT USING (bucket_id IN (''product-images'', ''barber-photos'', ''service-images'', ''site-logo'', ''hero-images''))';
  END IF;
END $$;

-- ============================================================================
-- STEP 3: CREATE COMPREHENSIVE STORAGE POLICIES FOR NEW BUCKETS
-- ============================================================================

-- Drop existing policies to recreate with proper permissions
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Public" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Public" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Public" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Photos" ON storage.objects;
DROP POLICY IF EXISTS "Barber Upload Own Photos" ON storage.objects;
DROP POLICY IF EXISTS "Barber Manage Own Photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin Manage All Photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin Full Access" ON storage.objects;
DROP POLICY IF EXISTS "luxecut_public_read" ON storage.objects;
DROP POLICY IF EXISTS "luxecut_public_insert" ON storage.objects;
DROP POLICY IF EXISTS "luxecut_public_update" ON storage.objects;
DROP POLICY IF EXISTS "luxecut_public_delete" ON storage.objects;
DROP POLICY IF EXISTS "luxecut_photos_read" ON storage.objects;
DROP POLICY IF EXISTS "luxecut_photos_barber_insert" ON storage.objects;
DROP POLICY IF EXISTS "luxecut_photos_barber_update" ON storage.objects;
DROP POLICY IF EXISTS "luxecut_photos_barber_delete" ON storage.objects;
DROP POLICY IF EXISTS "luxecut_admin_all" ON storage.objects;

-- LUXECUT-PUBLIC: Public read, Admin write
CREATE POLICY "luxecut_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'luxecut-public');

CREATE POLICY "luxecut_public_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'luxecut-public' 
    AND (
      auth.jwt() ->> 'role' = 'admin' 
      OR EXISTS (SELECT 1 FROM public.app_users WHERE id = auth.uid() AND role = 'admin')
    )
  );

CREATE POLICY "luxecut_public_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'luxecut-public' 
    AND (
      auth.jwt() ->> 'role' = 'admin' 
      OR EXISTS (SELECT 1 FROM public.app_users WHERE id = auth.uid() AND role = 'admin')
    )
  );

CREATE POLICY "luxecut_public_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'luxecut-public' 
    AND (
      auth.jwt() ->> 'role' = 'admin' 
      OR EXISTS (SELECT 1 FROM public.app_users WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- LUXECUT-PHOTOS: Public read, Barber owns folder, Admin full access
CREATE POLICY "luxecut_photos_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'luxecut-photos');

CREATE POLICY "luxecut_photos_barber_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'luxecut-photos' 
    AND (
      -- Barber can upload to their own folder (folder name = user_id)
      auth.uid()::text = (storage.foldername(name))[1]
      -- Or admin can upload anywhere
      OR EXISTS (SELECT 1 FROM public.app_users WHERE id = auth.uid() AND role = 'admin')
    )
  );

CREATE POLICY "luxecut_photos_barber_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'luxecut-photos' 
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (SELECT 1 FROM public.app_users WHERE id = auth.uid() AND role = 'admin')
    )
  );

CREATE POLICY "luxecut_photos_barber_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'luxecut-photos' 
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (SELECT 1 FROM public.app_users WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- LUXECUT-ADMIN: Admin only (private bucket)
CREATE POLICY "luxecut_admin_all" ON storage.objects
  FOR ALL USING (
    bucket_id = 'luxecut-admin' 
    AND EXISTS (SELECT 1 FROM public.app_users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- STEP 4: ADD BUCKET METADATA COLUMN IF NEEDED
-- ============================================================================
-- This adds a column to track which bucket convention an image uses

ALTER TABLE products ADD COLUMN IF NOT EXISTS storage_bucket TEXT DEFAULT 'product-images';
ALTER TABLE services ADD COLUMN IF NOT EXISTS storage_bucket TEXT DEFAULT 'service-images';
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS storage_bucket TEXT DEFAULT 'barber-photos';

-- ============================================================================
-- STEP 5: CREATE HELPER VIEW FOR IMAGE RESOLUTION
-- ============================================================================
-- This view helps resolve images from either old or new bucket structure

CREATE OR REPLACE VIEW v_product_images AS
SELECT 
  id,
  name,
  COALESCE(imageurl, '') AS image_url,
  COALESCE(image_path, '') AS image_path,
  COALESCE(storage_bucket, 'product-images') AS bucket
FROM products;

CREATE OR REPLACE VIEW v_service_images AS
SELECT 
  id,
  name,
  COALESCE(image_url, '') AS image_url,
  COALESCE(image_path, '') AS image_path,
  COALESCE(storage_bucket, 'service-images') AS bucket
FROM services;

CREATE OR REPLACE VIEW v_barber_photos AS
SELECT 
  id,
  name,
  COALESCE(photo, '') AS photo_url,
  COALESCE(photo_path, '') AS photo_path,
  COALESCE(storage_bucket, 'barber-photos') AS bucket
FROM barbers;

-- ============================================================================
-- STEP 6: DOCUMENT BUCKET STRUCTURE
-- ============================================================================
-- 
-- RECOMMENDED FOLDER STRUCTURE FOR NEW UPLOADS:
-- 
-- luxecut-public/
--   ├── products/           # Product images
--   │   └── {product_id}/   # Images per product
--   ├── services/           # Service images
--   │   └── {service_id}/
--   └── site/               # Site assets
--       ├── logo/
--       └── hero/
-- 
-- luxecut-photos/
--   └── {user_id}/          # Barber's portfolio (folder per user)
--       └── portfolio/
-- 
-- luxecut-admin/
--   ├── backups/
--   └── reports/
--
-- ============================================================================

-- ============================================================================
-- MIGRATION COMPLETE - NO BREAKING CHANGES
-- ============================================================================
-- Old buckets remain functional for existing images
-- New uploads can use either bucket structure
-- Frontend ImageResolver handles both cases
-- ============================================================================
