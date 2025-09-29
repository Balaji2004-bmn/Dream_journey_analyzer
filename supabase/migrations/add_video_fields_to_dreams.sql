-- Add video-related fields to dreams table for permanent video storage
-- This migration ensures dreams can store video data properly

-- Add video fields to dreams table if they don't exist
ALTER TABLE dreams 
ADD COLUMN IF NOT EXISTS video_prompt TEXT,
ADD COLUMN IF NOT EXISTS video_duration INTEGER DEFAULT 4;

-- Add video fields to demo_dreams table if they don't exist  
ALTER TABLE demo_dreams 
ADD COLUMN IF NOT EXISTS video_prompt TEXT,
ADD COLUMN IF NOT EXISTS video_duration INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Create index for better video query performance
CREATE INDEX IF NOT EXISTS idx_dreams_video_url ON dreams(video_url) WHERE video_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_demo_dreams_video_url ON demo_dreams(video_url) WHERE video_url IS NOT NULL;

-- Update existing dreams to have default video duration
UPDATE dreams SET video_duration = 4 WHERE video_duration IS NULL;
UPDATE demo_dreams SET video_duration = 4 WHERE video_duration IS NULL;
