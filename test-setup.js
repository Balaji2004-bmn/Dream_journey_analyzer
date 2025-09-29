#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🧪 Dream Journey Analyzer - Setup Test\n');

// Check if .env files exist
const frontendEnv = fs.existsSync('.env');
const backendEnv = fs.existsSync('backend/.env');

console.log('Environment Files:');
console.log(`  Frontend .env: ${frontendEnv ? '✅' : '❌'}`);
console.log(`  Backend .env: ${backendEnv ? '✅' : '❌'}`);

// Check if node_modules exist
const frontendModules = fs.existsSync('node_modules');
const backendModules = fs.existsSync('backend/node_modules');

console.log('\nDependencies:');
console.log(`  Frontend node_modules: ${frontendModules ? '✅' : '❌'}`);
console.log(`  Backend node_modules: ${backendModules ? '✅' : '❌'}`);

// Check package.json files
const frontendPackage = fs.existsSync('package.json');
const backendPackage = fs.existsSync('backend/package.json');

console.log('\nConfiguration:');
console.log(`  Frontend package.json: ${frontendPackage ? '✅' : '❌'}`);
console.log(`  Backend package.json: ${backendPackage ? '✅' : '❌'}`);

// Check if .env files have required variables
if (frontendEnv) {
  const frontendContent = fs.readFileSync('.env', 'utf8');
  const hasSupabaseUrl = frontendContent.includes('VITE_SUPABASE_URL=');
  const hasSupabaseKey = frontendContent.includes('VITE_SUPABASE_PUBLISHABLE_KEY=');
  
  console.log('\nFrontend Environment Variables:');
  console.log(`  VITE_SUPABASE_URL: ${hasSupabaseUrl ? '✅' : '❌'}`);
  console.log(`  VITE_SUPABASE_PUBLISHABLE_KEY: ${hasSupabaseKey ? '✅' : '❌'}`);
}

if (backendEnv) {
  const backendContent = fs.readFileSync('backend/.env', 'utf8');
  const hasSupabaseUrl = backendContent.includes('SUPABASE_URL=');
  const hasSupabaseServiceKey = backendContent.includes('SUPABASE_SERVICE_KEY=');
  
  console.log('\nBackend Environment Variables:');
  console.log(`  SUPABASE_URL: ${hasSupabaseUrl ? '✅' : '❌'}`);
  console.log(`  SUPABASE_SERVICE_KEY: ${hasSupabaseServiceKey ? '✅' : '❌'}`);
}

console.log('\n📋 Next Steps:');
if (!frontendEnv || !backendEnv) {
  console.log('1. Run: node setup-env.js');
}
if (!frontendModules || !backendModules) {
  console.log('2. Run: npm run install:all');
}
console.log('3. Set up your Supabase database with the SQL scripts in supabase/');
console.log('4. Run: npm run dev:full');

console.log('\n✨ Setup test complete!');
