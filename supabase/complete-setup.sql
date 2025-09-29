-- Complete Database Setup for Dream Journey Analyzer
-- Run this entire script in Supabase SQL Editor

-- =============================================
-- 1. CREATE DREAMS TABLE
-- =============================================

-- Drop table if exists (for clean setup)
DROP TABLE IF EXISTS dreams CASCADE;

-- Create dreams table for user-generated content
CREATE TABLE dreams (
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

-- Enable Row Level Security
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for dreams
CREATE POLICY "Users can read own dreams" 
ON dreams 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dreams" 
ON dreams 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dreams" 
ON dreams 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dreams" 
ON dreams 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read public dreams" 
ON dreams 
FOR SELECT 
USING (is_public = true);

-- Create indexes for better performance
CREATE INDEX idx_dreams_user_id ON dreams(user_id);
CREATE INDEX idx_dreams_created_at ON dreams(created_at DESC);
CREATE INDEX idx_dreams_public ON dreams(is_public) WHERE is_public = true;

-- =============================================
-- 2. CREATE DEMO DREAMS TABLE
-- =============================================

-- Drop table if exists (for clean setup)
DROP TABLE IF EXISTS demo_dreams CASCADE;

-- Create demo_dreams table for gallery demo content
CREATE TABLE demo_dreams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  thumbnail_url TEXT,
  video_url TEXT,
  analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE demo_dreams ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for demo dreams (public read access)
CREATE POLICY "Demo dreams are publicly readable" 
ON demo_dreams 
FOR SELECT 
USING (true);

-- Create index for better performance
CREATE INDEX idx_demo_dreams_created_at ON demo_dreams(created_at DESC);

-- =============================================
-- 3. INSERT DEMO DATA
-- =============================================

-- Insert demo dream data for gallery
INSERT INTO demo_dreams (title, content, thumbnail_url, video_url, analysis) VALUES
(
  'Dancing in Space',
  'I was floating weightlessly in a starry cosmos, dancing with planets and comets. Each movement created colorful ripples through space-time, and I could feel the music of the spheres flowing through my body.',
  'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  '{
    "keywords": ["space", "dancing", "cosmos", "planets", "music", "weightless"],
    "emotions": [
      {"emotion": "euphoria", "intensity": 96, "color": "#F59E0B"},
      {"emotion": "freedom", "intensity": 91, "color": "#10B981"},
      {"emotion": "cosmic connection", "intensity": 87, "color": "#8B5CF6"}
    ],
    "summary": "This cosmic dance dream represents your desire for ultimate freedom and connection with the universe. Dancing with celestial bodies symbolizes harmony with natural forces and your place in the greater cosmos.",
    "themes": ["Cosmic Unity", "Freedom of Expression", "Spiritual Transcendence"]
  }'
),
(
  'Magical Library Adventure',
  'I discovered a vast library where books flew around like birds. When I opened one, I was instantly transported into its story - becoming a pirate, then a wizard, then an explorer. Each book was a portal to infinite adventures.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  '{
    "keywords": ["library", "books", "flying", "stories", "portals", "adventure"],
    "emotions": [
      {"emotion": "wonder", "intensity": 93, "color": "#06B6D4"},
      {"emotion": "curiosity", "intensity": 89, "color": "#8B5CF6"},
      {"emotion": "excitement", "intensity": 85, "color": "#F59E0B"}
    ],
    "summary": "This library dream reflects your thirst for knowledge and adventure. Flying books represent the liberation of ideas, while entering stories symbolizes your ability to empathize and experience multiple perspectives.",
    "themes": ["Knowledge Seeking", "Imagination", "Personal Growth"]
  }'
),
(
  'Crystal Cave Symphony',
  'I found myself in a cave filled with singing crystals. Each crystal produced a different musical note when touched, and together they created the most beautiful symphony I had ever heard. The cave walls sparkled with rainbow light.',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  '{
    "keywords": ["crystals", "music", "cave", "rainbow", "harmony", "singing"],
    "emotions": [
      {"emotion": "serenity", "intensity": 94, "color": "#10B981"},
      {"emotion": "awe", "intensity": 88, "color": "#8B5CF6"},
      {"emotion": "harmony", "intensity": 86, "color": "#06B6D4"}
    ],
    "summary": "The crystal cave represents your inner sanctuary and connection to natural harmonies. The singing crystals symbolize your ability to find beauty and music in unexpected places, reflecting your artistic soul.",
    "themes": ["Inner Peace", "Artistic Expression", "Natural Connection"]
  }'
),
(
  'Time Garden Journey',
  'I walked through a garden where each flower showed a different moment in time. Past flowers were sepia-toned, present flowers bloomed in vivid colors, and future flowers shimmered with unknown hues. I could step into any moment by touching a flower.',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  '{
    "keywords": ["garden", "time", "flowers", "past", "future", "moments"],
    "emotions": [
      {"emotion": "nostalgia", "intensity": 90, "color": "#F59E0B"},
      {"emotion": "contemplation", "intensity": 87, "color": "#8B5CF6"},
      {"emotion": "hope", "intensity": 84, "color": "#10B981"}
    ],
    "summary": "This time garden dream reflects your relationship with past, present, and future. It suggests a desire to understand life''s continuity and your place in the flow of time, while maintaining hope for what''s to come.",
    "themes": ["Time Reflection", "Life Journey", "Temporal Awareness"]
  }'
),
(
  'Dragon Companion Flight',
  'A magnificent dragon with scales that changed colors like an aurora landed beside me. Without fear, I climbed onto its back and we soared through clouds, over mountains, and across oceans. The dragon and I communicated without words.',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  '{
    "keywords": ["dragon", "flying", "aurora", "mountains", "telepathy", "companion"],
    "emotions": [
      {"emotion": "courage", "intensity": 95, "color": "#F59E0B"},
      {"emotion": "friendship", "intensity": 89, "color": "#10B981"},
      {"emotion": "adventure", "intensity": 92, "color": "#8B5CF6"}
    ],
    "summary": "The dragon companion represents your inner strength and the powerful allies you can find when you overcome fear. This dream suggests you''re ready to embrace new challenges and trust in meaningful connections.",
    "themes": ["Inner Courage", "Spiritual Alliance", "Fearless Adventure"]
  }'
),
(
  'Ocean of Dreams',
  'I was swimming in an endless ocean where each wave carried a different dream. Some waves were warm and golden, others cool and silver. I could dive deep and find ancient cities beneath the water, or float on the surface and watch the stars above.',
  'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=300&fit=crop',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  '{
    "keywords": ["ocean", "waves", "swimming", "dreams", "cities", "stars"],
    "emotions": [
      {"emotion": "tranquility", "intensity": 92, "color": "#06B6D4"},
      {"emotion": "exploration", "intensity": 88, "color": "#8B5CF6"},
      {"emotion": "wonder", "intensity": 85, "color": "#10B981"}
    ],
    "summary": "This oceanic dream represents your deep connection to the subconscious mind. The waves symbolize the ebb and flow of your thoughts and emotions, while the underwater cities represent hidden aspects of your psyche.",
    "themes": ["Subconscious Exploration", "Emotional Flow", "Deep Reflection"]
  }'
),
(
  'Mountain Peak Meditation',
  'I found myself sitting on the highest peak of a mountain, surrounded by clouds. The wind carried whispers of ancient wisdom, and I could see the entire world spread out below me. Time seemed to stand still as I meditated in perfect peace.',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  '{
    "keywords": ["mountain", "peak", "meditation", "wisdom", "clouds", "peace"],
    "emotions": [
      {"emotion": "serenity", "intensity": 98, "color": "#10B981"},
      {"emotion": "wisdom", "intensity": 90, "color": "#8B5CF6"},
      {"emotion": "clarity", "intensity": 87, "color": "#06B6D4"}
    ],
    "summary": "This mountain meditation dream reflects your quest for inner peace and spiritual elevation. The peak represents your highest aspirations, while the ancient wisdom suggests a connection to timeless truths.",
    "themes": ["Spiritual Growth", "Inner Peace", "Wisdom Seeking"]
  }'
);

-- =============================================
-- 4. VERIFY SETUP
-- =============================================

-- Check if tables were created successfully
SELECT 
  'dreams' as table_name,
  COUNT(*) as row_count
FROM dreams
UNION ALL
SELECT 
  'demo_dreams' as table_name,
  COUNT(*) as row_count
FROM demo_dreams;

-- Show success message
SELECT 'Database setup completed successfully! 🎉' as status;
