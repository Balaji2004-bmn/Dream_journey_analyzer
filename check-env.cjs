#!/usr/bin/env node
/**
 * Environment Configuration Checker
 * Verifies all required environment variables are set correctly
 * 
 * Usage: node check-env.js
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, type = 'info') {
  const prefix = {
    info: `${colors.blue}ℹ${colors.reset}`,
    success: `${colors.green}✓${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    warning: `${colors.yellow}⚠${colors.reset}`,
  }[type] || '';
  console.log(`${prefix} ${message}`);
}

function header(text) {
  console.log(`\n${colors.bold}${colors.cyan}${text}${colors.reset}`);
  console.log('═'.repeat(text.length));
}

function loadEnvFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const env = {};
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    });
    return env;
  } catch (error) {
    return null;
  }
}

function checkValue(name, value, options = {}) {
  const { required = false, placeholder = null, minLength = 0, pattern = null } = options;
  
  if (!value || value === '') {
    if (required) {
      log(`${name}: ${colors.red}MISSING${colors.reset} (required)`, 'error');
      return false;
    } else {
      log(`${name}: ${colors.yellow}Not set${colors.reset} (optional)`, 'warning');
      return true;
    }
  }

  if (placeholder && value === placeholder) {
    log(`${name}: ${colors.red}PLACEHOLDER VALUE${colors.reset} - needs to be changed`, 'error');
    return false;
  }

  if (minLength && value.length < minLength) {
    log(`${name}: ${colors.red}TOO SHORT${colors.reset} (minimum ${minLength} chars)`, 'error');
    return false;
  }

  if (pattern && !pattern.test(value)) {
    log(`${name}: ${colors.red}INVALID FORMAT${colors.reset}`, 'error');
    return false;
  }

  log(`${name}: ${colors.green}OK${colors.reset}`, 'success');
  return true;
}

function checkBackendEnv() {
  header('Backend Environment (.env in backend/)');
  
  const envPath = path.join(__dirname, 'backend', '.env');
  const env = loadEnvFile(envPath);
  
  if (!env) {
    log('backend/.env file not found!', 'error');
    log('Copy backend/.env.example to backend/.env and configure it', 'warning');
    return false;
  }

  let allValid = true;

  // Server Configuration
  console.log('\n📡 Server Configuration:');
  allValid &= checkValue('PORT', env.PORT, { required: false });
  allValid &= checkValue('NODE_ENV', env.NODE_ENV, { required: false });
  allValid &= checkValue('FRONTEND_URL', env.FRONTEND_URL, { 
    required: true,
    placeholder: 'http://localhost:5173'
  });
  allValid &= checkValue('BACKEND_PUBLIC_URL', env.BACKEND_PUBLIC_URL, { 
    required: true,
    placeholder: 'http://localhost:3001'
  });

  // Supabase Configuration
  console.log('\n🗄️  Supabase Configuration:');
  allValid &= checkValue('SUPABASE_URL', env.SUPABASE_URL, { 
    required: true,
    placeholder: 'https://YOUR_PROJECT_ID.supabase.co',
    pattern: /^https:\/\/.*\.supabase\.co$/
  });
  allValid &= checkValue('SUPABASE_ANON_KEY', env.SUPABASE_ANON_KEY, { 
    required: true,
    placeholder: 'your_anon_key',
    minLength: 100
  });
  allValid &= checkValue('SUPABASE_SERVICE_KEY', env.SUPABASE_SERVICE_KEY, { 
    required: true,
    placeholder: 'your_service_role_key',
    minLength: 100
  });

  // Email Configuration
  console.log('\n📧 Email Configuration:');
  const emailUser = env.EMAIL_USER;
  const emailPass = env.EMAIL_PASSWORD;
  
  if (!emailUser || emailUser === 'your_gmail_address@gmail.com' || emailUser === 'demo@gmail.com') {
    log('EMAIL_USER: ' + colors.red + 'NOT CONFIGURED' + colors.reset, 'error');
    log('  → Email confirmation will NOT work without this!', 'warning');
    allValid = false;
  } else {
    log('EMAIL_USER: ' + colors.green + emailUser + colors.reset, 'success');
  }

  if (!emailPass || emailPass === 'your_app_specific_password' || emailPass === 'demo-password') {
    log('EMAIL_PASSWORD: ' + colors.red + 'NOT CONFIGURED' + colors.reset, 'error');
    log('  → Get App Password from Google Account settings', 'warning');
    allValid = false;
  } else {
    log('EMAIL_PASSWORD: ' + colors.green + '***' + emailPass.substring(emailPass.length - 4) + colors.reset, 'success');
  }

  // Admin Configuration
  console.log('\n👤 Admin Configuration:');
  allValid &= checkValue('ADMIN_EMAILS', env.ADMIN_EMAILS, { required: false });
  allValid &= checkValue('ADMIN_MASTER_PASSWORD', env.ADMIN_MASTER_PASSWORD, { 
    required: false,
    placeholder: 'ChangeMe_Admin_Override_123!',
    minLength: 8
  });

  // Security
  console.log('\n🔐 Security:');
  allValid &= checkValue('JWT_SECRET', env.JWT_SECRET, { 
    required: true,
    placeholder: 'change_me_to_a_long_random_secret_value',
    minLength: 32
  });

  // Optional Services
  console.log('\n🤖 Optional AI/Video Services:');
  checkValue('GEMINI_API_KEY', env.GEMINI_API_KEY, { required: false });
  checkValue('OPENAI_API_KEY', env.OPENAI_API_KEY, { required: false });
  checkValue('RUNWAY_API_KEY', env.RUNWAY_API_KEY, { required: false });
  checkValue('PIKA_API_KEY', env.PIKA_API_KEY, { required: false });

  return allValid;
}

function checkFrontendEnv() {
  header('Frontend Environment (.env in root)');
  
  const envPath = path.join(__dirname, '.env');
  const env = loadEnvFile(envPath);
  
  if (!env) {
    log('.env file not found!', 'error');
    log('Copy .env.example to .env and configure it', 'warning');
    return false;
  }

  let allValid = true;

  // Supabase Configuration
  console.log('\n🗄️  Supabase Configuration:');
  allValid &= checkValue('VITE_SUPABASE_URL', env.VITE_SUPABASE_URL, { 
    required: true,
    placeholder: 'https://YOUR_PROJECT_ID.supabase.co',
    pattern: /^https:\/\/.*\.supabase\.co$/
  });
  allValid &= checkValue('VITE_SUPABASE_ANON_KEY', env.VITE_SUPABASE_ANON_KEY, { 
    required: true,
    placeholder: 'your_anon_key',
    minLength: 100
  });

  // URLs
  console.log('\n🌐 URL Configuration:');
  allValid &= checkValue('VITE_BACKEND_URL', env.VITE_BACKEND_URL, { 
    required: true,
    placeholder: 'http://localhost:3001'
  });
  allValid &= checkValue('VITE_FRONTEND_URL', env.VITE_FRONTEND_URL, { 
    required: true,
    placeholder: 'http://localhost:5173'
  });

  // Optional
  console.log('\n🔧 Optional Configuration:');
  checkValue('VITE_HCAPTCHA_SITEKEY', env.VITE_HCAPTCHA_SITEKEY, { required: false });

  return allValid;
}

function checkFileStructure() {
  header('File Structure Check');
  
  const requiredFiles = [
    { path: 'backend/.env', desc: 'Backend environment variables' },
    { path: '.env', desc: 'Frontend environment variables' },
    { path: 'backend/server.js', desc: 'Backend server' },
    { path: 'backend/routes/auth.js', desc: 'Authentication routes' },
    { path: 'backend/routes/email.js', desc: 'Email routes' },
    { path: 'src/pages/Auth.jsx', desc: 'Auth page' },
    { path: 'src/contexts/AuthContext.jsx', desc: 'Auth context' },
    { path: 'package.json', desc: 'Frontend package.json' },
    { path: 'backend/package.json', desc: 'Backend package.json' },
  ];

  let allExist = true;

  requiredFiles.forEach(({ path: filePath, desc }) => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      log(`${desc}: ${colors.green}Found${colors.reset}`, 'success');
    } else {
      log(`${desc}: ${colors.red}Missing${colors.reset}`, 'error');
      allExist = false;
    }
  });

  return allExist;
}

function printSummary(backendOk, frontendOk, structureOk) {
  console.log('\n' + '═'.repeat(60));
  console.log(`${colors.bold}${colors.cyan}Configuration Summary${colors.reset}`);
  console.log('═'.repeat(60));
  
  const status = (ok) => ok ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
  
  console.log(`\nFile Structure:     ${status(structureOk)}`);
  console.log(`Backend Config:     ${status(backendOk)}`);
  console.log(`Frontend Config:    ${status(frontendOk)}`);
  
  const allOk = backendOk && frontendOk && structureOk;
  
  console.log('\n' + '─'.repeat(60));
  
  if (allOk) {
    console.log(`\n${colors.green}${colors.bold}✓ All checks passed! Your configuration looks good.${colors.reset}`);
    console.log('\nNext steps:');
    console.log('1. Start backend:  cd backend && npm run dev');
    console.log('2. Start frontend: npm run dev');
    console.log('3. Test auth flow: node test-auth-flow.js');
    console.log('4. Open browser:   http://localhost:5173\n');
  } else {
    console.log(`\n${colors.red}${colors.bold}✗ Configuration issues found!${colors.reset}`);
    console.log('\nPlease fix the issues above before starting the application.');
    console.log('\nQuick fixes:');
    if (!structureOk) {
      console.log('- Make sure you\'re in the project root directory');
    }
    if (!backendOk) {
      console.log('- Copy backend/.env.example to backend/.env');
      console.log('- Configure Supabase credentials');
      console.log('- Set up Gmail App Password for email');
    }
    if (!frontendOk) {
      console.log('- Copy .env.example to .env');
      console.log('- Configure Supabase credentials');
    }
    console.log('\nSee AUTH_FIX_COMPLETE.md and DEPLOYMENT_CHECKLIST.md for details.\n');
  }
  
  return allOk ? 0 : 1;
}

// Main execution
console.log(`${colors.bold}${colors.cyan}
╔══════════════════════════════════════════════════════════╗
║   Dream Journey Analyzer - Environment Configuration    ║
║                  Verification Tool                       ║
╚══════════════════════════════════════════════════════════╝
${colors.reset}`);

const structureOk = checkFileStructure();
const backendOk = checkBackendEnv();
const frontendOk = checkFrontendEnv();

const exitCode = printSummary(backendOk, frontendOk, structureOk);
process.exit(exitCode);
