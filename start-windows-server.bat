@echo off
cd /d "%~dp0"
title Kaveh Battery - Saba Battery Web Automation Server

echo ================================================================
echo   Kaveh Battery - Web Automation Server (Port 3000)
echo   Developer: Masoud Shabani
echo ================================================================
echo.

where node >nul 2>nul
if errorlevel 1 goto :no_node

if exist "%~dp0node_modules" goto :check_bundle
echo [Step 1] Installing packages via npm install ...
call npm install
if errorlevel 1 goto :npm_err

:check_bundle
if exist "%~dp0web-bundle\index.html" goto :start_srv
echo [Step 2] Building web interface ...
call npm run build

:start_srv
echo.
echo LAN IP addresses for downstairs cashiers:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do echo   http://%%a:3000
echo.
echo Opening http://localhost:3000 in browser...
start "" "http://localhost:3000"
echo Server is running on port 3000. Keep this window open.
echo ================================================================
set NODE_ENV=production
set PORT=3000
node "%~dp0server\index.js"
pause
exit /b 0

:no_node
echo [ERROR] Node.js 22 LTS is not installed on this Windows PC.
echo Please download and install Node.js LTS from https://nodejs.org
pause
exit /b 1

:npm_err
echo [ERROR] npm install failed. Check internet connection for first-time setup.
pause
exit /b 1
