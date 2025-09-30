@echo off
echo Starting Dream Journey Analyzer Servers...
echo.

echo Starting Main Backend Server (Port 3001)...
start "Main Backend" cmd /k "cd backend && node server.js"

timeout /t 3 /nobreak >nul

echo Starting Admin Server (Port 3002)...
start "Admin Server" cmd /k "cd backend && node admin-server.js"

timeout /t 3 /nobreak >nul

echo Starting Frontend (Port 5173)...
start "Frontend" cmd /k "npm run dev"

echo.
echo All servers are starting...
echo Main Backend: http://localhost:3001
echo Admin Server: http://localhost:3002
echo Frontend: http://localhost:5173
echo Admin Login: http://localhost:5173/admin-auth
echo.
pause
