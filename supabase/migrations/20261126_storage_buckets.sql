-- ====================================================================
-- SUPABASE STORAGE BUCKET MIGRATION: SALARY SLIPS & COMPANY ASSETS
-- ====================================================================

-- 1. Create storage buckets if they do not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('salary-slips', 'salary-slips', true, 10485760, ARRAY['application/pdf']),
    ('company-assets', 'company-assets', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Policies for 'salary-slips'
-- Allow public or authenticated read
DROP POLICY IF EXISTS "Public Salary Slips Access" ON storage.objects;
CREATE POLICY "Public Salary Slips Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'salary-slips');

-- Allow authenticated users / admins to upload salary slips
DROP POLICY IF EXISTS "Admin Salary Slips Upload" ON storage.objects;
CREATE POLICY "Admin Salary Slips Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'salary-slips');

-- Allow authenticated users / admins to update salary slips
DROP POLICY IF EXISTS "Admin Salary Slips Update" ON storage.objects;
CREATE POLICY "Admin Salary Slips Update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'salary-slips');

-- Allow authenticated users / admins to delete salary slips
DROP POLICY IF EXISTS "Admin Salary Slips Delete" ON storage.objects;
CREATE POLICY "Admin Salary Slips Delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'salary-slips');

-- 3. Storage Policies for 'company-assets'
DROP POLICY IF EXISTS "Public Assets Access" ON storage.objects;
CREATE POLICY "Public Assets Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-assets');

DROP POLICY IF EXISTS "Admin Assets Upload" ON storage.objects;
CREATE POLICY "Admin Assets Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'company-assets');
