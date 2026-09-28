@echo off
title Box Factory ERP - Running Server
color 0A

cd /d "%~dp0\.."

:: 1. Verify Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is NOT installed!
    echo Please download and install Node.js (LTS version) from https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: 2. Auto-install server dependencies if first time run or missing
if not exist "server\node_modules\express" (
    echo ===============================================================================
    echo      First Time Setup: Installing Server Modules (Lotfan Chand Lahze Sabr Konid)...
    echo ===============================================================================
    cd server
    call npm install --no-audit
    cd /d "%~dp0\.."
    cls
)

echo ===============================================================================
echo                     BOX FACTORY ERP SERVER IS RUNNING
echo                     Server Ba Movafaghiat Roshan Shod
echo ===============================================================================
echo.
echo Local Access:
echo   http://localhost:3001
echo.
echo Network Access (LAN / Mobile Devices):
ipconfig | findstr /i "IPv4"
echo   Port: 3001  (Example: http://192.168.1.100:3001)
echo.
echo ===============================================================================
echo NOTE: Do NOT close this window while users are using the system.
echo ===============================================================================
echo.

node server/index.js
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server exited with code %errorlevel%.
    echo Trying to reinstall dependencies...
    cd server
    call npm install
    cd ..
    node server/index.js
)
pause
