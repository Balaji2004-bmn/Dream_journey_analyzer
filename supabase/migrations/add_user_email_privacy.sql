-- Add user_email column to dreams table for email-based filtering
-- This provides an additional layer of privacy control

-- Add user_email column to dreams table
ALTER TABLE dreams ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Add user_email column to demo_dreams table
ALTER TABLE demo_dreams ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Create index for faster email-based queries
CREATE INDEX IF NOT EXISTS idx_dreams_user_email ON dreams(user_email);
CREATE INDEX IF NOT EXISTS idx_demo_dreams_user_email ON demo_dreams(user_email);

-- Update existing RLS policies to be more restrictive
-- Drop ALL old policies (to avoid conflicts)
DROP POLICY IF EXISTS "Users can read own dreams" ON dreams;
DROP POLICY IF EXISTS "Users can read only their own dreams by user_id" ON dreams;
DROP POLICY IF EXISTS "Users can read only their own dreams by email" ON dreams;
DROP POLICY IF EXISTS "Users can read their own dreams" ON dreams;
DROP POLICY IF EXISTS "Users can insert own dreams" ON dreams;
DROP POLICY IF EXISTS "Users can insert their own dreams" ON dreams;
DROP POLICY IF EXISTS "Users can update own dreams" ON dreams;
DROP POLICY IF EXISTS "Users can update their own dreams" ON dreams;
DROP POLICY IF EXISTS "Users can delete own dreams" ON dreams;
DROP POLICY IF EXISTS "Users can delete their own dreams" ON dreams;
DROP POLICY IF EXISTS "Anyone can read public dreams" ON dreams;
DROP POLICY IF EXISTS "Public dreams are visible to authenticated users" ON dreams;

-- Create new policies: Users can see their own dreams OR public dreams from anyone
CREATE POLICY "Users can read their own dreams"
ON dreams
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read public dreams"
ON dreams
FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can insert their own dreams"
ON dreams
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  (user_email IS NULL OR user_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

CREATE POLICY "Users can update their own dreams"
ON dreams
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dreams"
ON dreams
FOR DELETE
USING (auth.uid() = user_id);

-- Optional: Allow public dreams to be visible (comment out if you want strict privacy)
-- CREATE POLICY "Public dreams are visible to authenticated users"
-- ON dreams
-- FOR SELECT
-- USING (is_public = true AND auth.role() = 'authenticated');

-- =============================================
-- STORAGE POLICIES FOR VIDEOS
-- =============================================

-- Create storage bucket for dream videos (if not exists)
-- Note: This needs to be run in Supabase dashboard or via API
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('dream-videos', 'dream-videos', false)
-- ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;

-- Create storage policies for user-specific folders
-- Videos should be stored as: dream-videos/{user_id}/...
CREATE POLICY "Users can upload videos to their own folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'dream-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view videos in their own folder"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'dream-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update videos in their own folder"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'dream-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete videos in their own folder"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'dream-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =============================================
-- HELPER FUNCTION
-- =============================================

-- Function to get user email from user_id
CREATE OR REPLACE FUNCTION get_user_email(p_user_id UUID)
RETURNS TEXT AS $$
  SELECT email FROM auth.users WHERE id = p_user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_email(UUID) TO authenticated;

-- Verification queries
SELECT 'Privacy migration completed successfully!' as status;
SELECT 'Dreams table now has user_email column' as info;
SELECT 'Storage policies created for user-specific folders' as info;
