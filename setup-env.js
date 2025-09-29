#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupEnvironment() {
  console.log('🌟 Dream Journey Analyzer - Environment Setup\n');
  
  console.log('Please provide your Supabase credentials:');
  console.log('(You can find these in your Supabase project settings > API)\n');
  
  const supabaseUrl = await question('Supabase URL: ');
  const supabaseAnonKey = await question('Supabase Anon Key: ');
  const supabaseServiceKey = await question('Supabase Service Role Key: ');
  const openaiKey = await question('OpenAI API Key (optional, press Enter to skip): ');
  
  // Frontend .env
  const frontendEnv = `# Frontend Environment Variables
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_PUBLISHABLE_KEY=${supabaseAnonKey}
VITE_BACKEND_URL=http://localhost:3002
`;

  // Backend .env
  const backendEnv = `# Backend Environment Variables
SUPABASE_URL=${supabaseUrl}
SUPABASE_SERVICE_KEY=${supabaseServiceKey}
OPENAI_API_KEY=${openaiKey || 'your_openai_api_key_here'}
NODE_ENV=development
PORT=3002
FRONTEND_URL=http://localhost:5173
`;

  try {
    // Write frontend .env
    fs.writeFileSync('.env', frontendEnv);
    console.log('✅ Created .env file for frontend');
    
    // Write backend .env
    fs.writeFileSync('backend/.env', backendEnv);
    console.log('✅ Created backend/.env file');
    
    console.log('\n🎉 Environment setup complete!');
    console.log('\nNext steps:');
    console.log('1. Run the SQL scripts in supabase/ directory in your Supabase SQL editor');
    console.log('2. Start the application with: npm run dev:full');
    
  } catch (error) {
    console.error('❌ Error creating environment files:', error.message);
  }
  
  rl.close();
}

setupEnvironment().catch(console.error);
