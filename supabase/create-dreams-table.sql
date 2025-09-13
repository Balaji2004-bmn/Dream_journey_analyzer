-- Create dreams table for user-generated content
CREATE TABLE IF NOT EXISTS dreams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  thumbnail_url TEXT,
  video_url TEXT,
  analysis JSONB,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for dreams
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;

-- Users can read their own dreams
CREATE POLICY "Users can read own dreams" 
ON dreams 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own dreams
CREATE POLICY "Users can insert own dreams" 
ON dreams 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own dreams
CREATE POLICY "Users can update own dreams" 
ON dreams 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own dreams
CREATE POLICY "Users can delete own dreams" 
ON dreams 
FOR DELETE 
USING (auth.uid() = user_id);

-- Anyone can read public dreams
CREATE POLICY "Anyone can read public dreams" 
ON dreams 
FOR SELECT 
USING (is_public = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dreams_user_id ON dreams(user_id);
CREATE INDEX IF NOT EXISTS idx_dreams_created_at ON dreams(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dreams_public ON dreams(is_public) WHERE is_public = true;
