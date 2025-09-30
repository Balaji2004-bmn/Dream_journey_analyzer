Write-Host "Starting Dream Journey Analyzer Servers..." -ForegroundColor Green
Write-Host ""

Write-Host "Starting Main Backend Server (Port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; node server.js"

Start-Sleep -Seconds 3

Write-Host "Starting Admin Server (Port 3002)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; node admin-server.js"

Start-Sleep -Seconds 3

Write-Host "Starting Frontend (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host ""
Write-Host "All servers are starting..." -ForegroundColor Green
Write-Host "Main Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Admin Server: http://localhost:3002" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Admin Login: http://localhost:5173/admin-auth" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
