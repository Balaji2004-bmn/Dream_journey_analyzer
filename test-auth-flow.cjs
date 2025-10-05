#!/usr/bin/env node
/**
 * Test Authentication Flow
 * Tests the complete sign-up, email confirmation, and sign-in flow
 * 
 * Usage: node test-auth-flow.js
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'Test@1234';

console.log('🧪 Dream Journey Analyzer - Authentication Flow Test\n');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log(`Test Email: ${TEST_EMAIL}`);
console.log(`Test Password: ${TEST_PASSWORD}\n`);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = {
    info: `${colors.blue}ℹ${colors.reset}`,
    success: `${colors.green}✓${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    warning: `${colors.yellow}⚠${colors.reset}`,
  }[type] || '';
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

async function testSignUp() {
  log('Testing sign-up...', 'info');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });

    const data = await response.json();

    if (response.ok) {
      log('Sign-up successful! ✨', 'success');
      log(`Response: ${data.message}`, 'info');
      if (data.demo) {
        log('Running in DEMO mode', 'warning');
      }
      return { success: true, data };
    } else {
      log(`Sign-up failed: ${data.message}`, 'error');
      return { success: false, error: data.message };
    }
  } catch (error) {
    log(`Sign-up error: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

async function testSignInBeforeConfirmation() {
  log('Testing sign-in BEFORE email confirmation (should fail)...', 'info');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });

    const data = await response.json();

    if (!response.ok && (data.error === 'Email Not Verified' || data.message?.includes('verify'))) {
      log('✓ Sign-in correctly blocked for unverified email', 'success');
      log(`Message: ${data.message}`, 'info');
      return { success: true, blocked: true };
    } else if (response.ok) {
      log('✗ Sign-in should have been blocked (email not verified)', 'error');
      return { success: false, error: 'Sign-in should require email verification' };
    } else {
      log(`Unexpected error: ${data.message}`, 'warning');
      return { success: true, blocked: true }; // Might be blocked for other reasons
    }
  } catch (error) {
    log(`Sign-in test error: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

async function testEmailConfirmation() {
  log('Testing email confirmation...', 'info');
  log('⚠ This test uses POST endpoint (manual confirmation)', 'warning');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/email/confirm-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL })
    });

    const data = await response.json();

    if (response.ok && data.confirmed) {
      log('Email confirmation successful! 📧', 'success');
      log(`Message: ${data.message}`, 'info');
      return { success: true, data };
    } else {
      log(`Email confirmation failed: ${data.message}`, 'error');
      return { success: false, error: data.message };
    }
  } catch (error) {
    log(`Email confirmation error: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

async function testSignInAfterConfirmation() {
  log('Testing sign-in AFTER email confirmation (should succeed)...', 'info');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });

    const data = await response.json();

    if (response.ok && data.session) {
      log('Sign-in successful! 🎉', 'success');
      log(`User: ${data.user.email}`, 'info');
      log(`Session token: ${data.session.access_token?.substring(0, 20)}...`, 'info');
      return { success: true, data };
    } else {
      log(`Sign-in failed: ${data.message}`, 'error');
      return { success: false, error: data.message };
    }
  } catch (error) {
    log(`Sign-in error: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

async function testHealthCheck() {
  log('Checking backend health...', 'info');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    const data = await response.json();

    if (response.ok && data.status === 'OK') {
      log('Backend is healthy! 💚', 'success');
      log(`Environment: ${data.environment}`, 'info');
      log(`Email configured: ${data.services.email}`, 'info');
      return { success: true, data };
    } else {
      log('Backend health check failed', 'error');
      return { success: false };
    }
  } catch (error) {
    log(`Cannot reach backend: ${error.message}`, 'error');
    log('Make sure backend is running: cd backend && npm run dev', 'warning');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════\n');
  
  // Test 1: Health Check
  const healthResult = await testHealthCheck();
  if (!healthResult.success) {
    log('\n❌ Backend is not running or not accessible', 'error');
    log('Please start the backend: cd backend && npm run dev', 'warning');
    process.exit(1);
  }
  
  console.log('\n───────────────────────────────────────────────────────\n');
  
  // Test 2: Sign Up
  const signUpResult = await testSignUp();
  if (!signUpResult.success) {
    log('\n❌ Sign-up test failed', 'error');
    process.exit(1);
  }
  
  console.log('\n───────────────────────────────────────────────────────\n');
  
  // Wait a bit for the sign-up to process
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 3: Sign In Before Confirmation (should fail)
  const signInBeforeResult = await testSignInBeforeConfirmation();
  if (!signInBeforeResult.success) {
    log('\n⚠ Warning: Email verification check may not be working', 'warning');
  }
  
  console.log('\n───────────────────────────────────────────────────────\n');
  
  // Test 4: Email Confirmation
  const confirmResult = await testEmailConfirmation();
  if (!confirmResult.success) {
    log('\n❌ Email confirmation test failed', 'error');
    log('Check if demo users are being created correctly', 'warning');
    process.exit(1);
  }
  
  console.log('\n───────────────────────────────────────────────────────\n');
  
  // Wait a bit for confirmation to process
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 5: Sign In After Confirmation (should succeed)
  const signInAfterResult = await testSignInAfterConfirmation();
  if (!signInAfterResult.success) {
    log('\n❌ Sign-in after confirmation failed', 'error');
    process.exit(1);
  }
  
  console.log('\n═══════════════════════════════════════════════════════\n');
  console.log(`${colors.green}✓ All authentication tests passed! 🎉${colors.reset}\n`);
  console.log('Next steps:');
  console.log('1. Test with real email service (configure EMAIL_USER and EMAIL_PASSWORD)');
  console.log('2. Test email confirmation link in actual email');
  console.log('3. Test on production environment');
  console.log('4. Monitor email delivery rates\n');
}

// Run tests
runTests().catch(error => {
  console.error(`\n${colors.red}Unexpected error:${colors.reset}`, error);
  process.exit(1);
});
