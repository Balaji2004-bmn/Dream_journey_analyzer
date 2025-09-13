import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lfrdehertkpypwuydcgn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmcmRlaGVydGtweXB3dXlkY2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDgyMzYsImV4cCI6MjA3MzMyNDIzNn0.XZutxpzxMPXH1Npqs6t76wL_7GLvlA_44yNKmOvbOlc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDreamsTable() {
  console.log('Testing dreams table...')
  
  try {
    // Test if table exists and check structure
    const { data: tableData, error: tableError } = await supabase
      .from('dreams')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('Table error:', tableError)
      
      // Try to create the table
      console.log('Attempting to create dreams table...')
      const { error: createError } = await supabase.rpc('exec', {
        sql: `
          CREATE TABLE IF NOT EXISTS dreams (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            thumbnail_url TEXT,
            video_url TEXT,
            analysis JSONB,
            is_public BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON dreams FOR SELECT USING (true);
          CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users only" ON dreams FOR INSERT WITH CHECK (true);
        `
      })
      
      if (createError) {
        console.error('Failed to create table:', createError)
      } else {
        console.log('Table created successfully!')
      }
    } else {
      console.log('Dreams table exists and accessible')
      console.log('Sample data:', tableData)
    }
    
    // Test insert without authentication
    console.log('Testing insert...')
    const testDream = {
      user_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
      title: 'Test Dream',
      content: 'This is a test dream content',
      analysis: { keywords: ['test'], emotions: [] },
      is_public: true,
      thumbnail_url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
      video_url: null
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('dreams')
      .insert(testDream)
      .select()
    
    if (insertError) {
      console.error('Insert error:', insertError)
    } else {
      console.log('Insert successful:', insertData)
    }
    
  } catch (error) {
    console.error('General error:', error)
  }
}

testDreamsTable()
