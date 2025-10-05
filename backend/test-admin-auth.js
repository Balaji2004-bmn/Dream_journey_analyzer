#!/usr/bin/env node

/**
 * Test Admin Authentication Setup
 * 
 * This script verifies that admin authentication is configured correctly.
 * Run with: node test-admin-auth.js
 */

require('dotenv').config();

const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
const adminPassword = process.env.ADMIN_MASTER_PASSWORD;

console.log('\n🔐 Admin Authentication Configuration Test\n');
console.log('='.repeat(60));

// Test 1: Check if admin emails are configured
console.log('\n📧 Test 1: Admin Emails Configuration');
if (adminEmails.length === 0) {
  console.log('❌ FAIL: No admin emails configured!');
  console.log('   Fix: Add ADMIN_EMAILS to your .env file');
  console.log('   Example: ADMIN_EMAILS=admin@example.com,another@example.com');
} else {
  console.log(`✅ PASS: ${adminEmails.length} admin email(s) configured`);
  adminEmails.forEach((email, i) => {
    console.log(`   ${i + 1}. ${email}`);
  });
}

// Test 2: Check if admin password is configured
console.log('\n🔑 Test 2: Admin Master Password');
if (!adminPassword) {
  console.log('❌ FAIL: No admin master password configured!');
  console.log('   Fix: Add ADMIN_MASTER_PASSWORD to your .env file');
  console.log('   Example: ADMIN_MASTER_PASSWORD=YourSecurePassword123!');
} else if (adminPassword.length < 8) {
  console.log('⚠️  WARN: Admin password is too short (less than 8 characters)');
  console.log('   Recommendation: Use a longer password for better security');
} else {
  console.log('✅ PASS: Admin master password is configured');
  console.log(`   Length: ${adminPassword.length} characters`);
}

// Test 3: Check Supabase configuration
console.log('\n🗄️  Test 3: Supabase Configuration');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || supabaseUrl === 'https://YOUR_PROJECT_ID.supabase.co') {
  console.log('⚠️  WARN: Supabase URL not configured (using demo mode)');
} else {
  console.log(`✅ PASS: Supabase URL configured: ${supabaseUrl}`);
}

if (!supabaseKey || supabaseKey === 'your_anon_key') {
  console.log('⚠️  WARN: Supabase anon key not configured (using demo mode)');
} else {
  console.log('✅ PASS: Supabase anon key configured');
}

if (!supabaseServiceKey || supabaseServiceKey === 'your_service_role_key') {
  console.log('⚠️  WARN: Supabase service key not configured (limited admin features)');
} else {
  console.log('✅ PASS: Supabase service key configured');
}

// Test 4: Summary and next steps
console.log('\n📋 Summary');
console.log('='.repeat(60));

const allPassed = adminEmails.length > 0 && adminPassword && adminPassword.length >= 8;

if (allPassed) {
  console.log('✅ Admin authentication is properly configured!');
  console.log('\n🚀 Next Steps:');
  console.log('   1. Start your backend server: npm run dev');
  console.log('   2. Navigate to: http://localhost:5173/admin/auth');
  console.log('   3. Login with one of these emails:');
  adminEmails.forEach((email, i) => {
    console.log(`      - ${email}`);
  });
  console.log(`   4. Use password from ADMIN_MASTER_PASSWORD`);
} else {
  console.log('❌ Admin authentication is NOT properly configured');
  console.log('\n🔧 Required Actions:');
  if (adminEmails.length === 0) {
    console.log('   1. Add ADMIN_EMAILS to backend/.env');
  }
  if (!adminPassword || adminPassword.length < 8) {
    console.log('   2. Add/update ADMIN_MASTER_PASSWORD in backend/.env');
  }
  console.log('\n📖 See ADMIN_SETUP_GUIDE.md for detailed instructions');
}

// Test 5: Test admin login endpoint
console.log('\n🧪 Test 5: Admin Login Endpoint Test');
if (adminEmails.length > 0 && adminPassword) {
  const testEmail = adminEmails[0];
  console.log(`\nYou can test admin login with this curl command:\n`);
  console.log(`curl -X POST http://localhost:3001/api/auth/signin \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"email": "${testEmail}", "password": "${adminPassword}"}'`);
  console.log('\nExpected response should include: "isAdmin": true');
} else {
  console.log('⏭️  SKIPPED: Configure admin emails and password first');
}

console.log('\n' + '='.repeat(60) + '\n');

// Exit with appropriate code
process.exit(allPassed ? 0 : 1);
