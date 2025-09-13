-- Insert demo dream data for gallery
-- This script should be run AFTER creating the demo_dreams table

INSERT INTO demo_dreams (id, title, content, thumbnail_url, video_url, analysis) VALUES
(
  gen_random_uuid(),
  'Dancing in Space',
  'I was floating weightlessly in a starry cosmos, dancing with planets and comets. Each movement created colorful ripples through space-time, and I could feel the music of the spheres flowing through my body.',
  'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop',
  'https://player.vimeo.com/external/386962654.sd.mp4?s=3f8e9c1a6b2d7f4e5c8a9b3f6d2e7c1a8b4f9e6d&profile_id=164&oauth2_token_id=57447761',
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
  gen_random_uuid(),
  'Magical Library Adventure',
  'I discovered a vast library where books flew around like birds. When I opened one, I was instantly transported into its story - becoming a pirate, then a wizard, then an explorer. Each book was a portal to infinite adventures.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  'https://player.vimeo.com/external/425314987.sd.mp4?s=8a7b4f2e9c6d5a1b8f3e7c9a2d6f4b8e1c7a5f9b&profile_id=164&oauth2_token_id=57447761',
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
  gen_random_uuid(),
  'Crystal Cave Symphony',
  'I found myself in a cave filled with singing crystals. Each crystal produced a different musical note when touched, and together they created the most beautiful symphony I had ever heard. The cave walls sparkled with rainbow light.',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
  'https://player.vimeo.com/external/372891234.sd.mp4?s=2c8f7a3e6b9d4f1a5c8e2b7f9a4d6c1e8b5f3a7c&profile_id=164&oauth2_token_id=57447761',
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
  gen_random_uuid(),
  'Time Garden Journey',
  'I walked through a garden where each flower showed a different moment in time. Past flowers were sepia-toned, present flowers bloomed in vivid colors, and future flowers shimmered with unknown hues. I could step into any moment by touching a flower.',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
  'https://player.vimeo.com/external/391847652.sd.mp4?s=7e4a9b2f8c6d3f7a1e9c5b8f2d6a4c7e1b9f5a3d&profile_id=164&oauth2_token_id=57447761',
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
  gen_random_uuid(),
  'Dragon Companion Flight',
  'A magnificent dragon with scales that changed colors like an aurora landed beside me. Without fear, I climbed onto its back and we soared through clouds, over mountains, and across oceans. The dragon and I communicated without words.',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
  'https://player.vimeo.com/external/416759823.sd.mp4?s=5c9a7f3e1b8d6a4f2c7e9b5a8d3f6c1e4b7a9f5c&profile_id=164&oauth2_token_id=57447761',
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
);
