-- Create demo_dreams table for gallery demo content
CREATE TABLE IF NOT EXISTS demo_dreams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  thumbnail_url TEXT,
  video_url TEXT,
  analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for demo_dreams (public read access)
ALTER TABLE demo_dreams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Demo dreams are publicly readable" 
ON demo_dreams 
FOR SELECT 
USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_demo_dreams_created_at ON demo_dreams(created_at DESC);
