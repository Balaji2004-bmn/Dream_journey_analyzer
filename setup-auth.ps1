# Authentication Setup Script for Dream Journey Analyzer
# Run this script to set up authentication properly

Write-Host "🔧 Setting up Dream Journey Analyzer Authentication..." -ForegroundColor Cyan

# Check if backend directory exists
if (-not (Test-Path "backend")) {
    Write-Host "❌ Backend directory not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Copy .env.example to .env in backend
Write-Host "📁 Setting up backend environment..." -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    Write-Host "⚠️  Backend .env already exists. Backing up..." -ForegroundColor Yellow
    Copy-Item "backend\.env" "backend\.env.backup" -Force
}

Copy-Item "backend\.env.example" "backend\.env" -Force
Write-Host "✅ Backend .env file created" -ForegroundColor Green

# Check if frontend .env exists
Write-Host "📁 Checking frontend environment..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Frontend .env not found. Please ensure it exists with VITE_BACKEND_URL=http://localhost:3001" -ForegroundColor Yellow
} else {
    Write-Host "✅ Frontend .env file exists" -ForegroundColor Green
}

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location "backend"
try {
    npm install
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install backend dependencies. Please run 'npm install' manually in backend folder." -ForegroundColor Red
}
Set-Location ".."

# Install frontend dependencies
Write-Host "📦 Checking frontend dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ Frontend dependencies already installed" -ForegroundColor Green
} else {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    try {
        npm install
        Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install frontend dependencies. Please run 'npm install' manually." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Authentication setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open two terminals" -ForegroundColor White
Write-Host "2. Terminal 1: cd backend && npm start" -ForegroundColor White
Write-Host "3. Terminal 2: npm run dev" -ForegroundColor White
Write-Host "4. Go to http://localhost:5173/clean-auth to test" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Admin Login:" -ForegroundColor Cyan
Write-Host "- Email: bmn636169@gmail.com" -ForegroundColor White
Write-Host "- Must be registered user first" -ForegroundColor White
Write-Host "- Go to http://localhost:5173/admin-auth" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed instructions, see AUTHENTICATION_FIX_GUIDE.md" -ForegroundColor Cyan
