@echo off
setlocal EnableDelayedExpansion
title Box Factory ERP - Windows Server Setup

echo ===============================================================================
echo            Box Factory ERP - Automated Windows Server Installer
echo            Nasbe Khodkar Samaneh Box Factory (Amiran)
echo ===============================================================================
echo.

:: 1. Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is NOT installed on this machine!
    echo [Khata] Lotfan Node.js ra az site https://nodejs.org nasb konid.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js detected:
node -v
echo.

:: 2. Change to root directory
cd /d "%~dp0\.."
set "ROOT_DIR=%cd%"

:: Check for existing database & data preservation
if exist "%ROOT_DIR%\server\factory.db" (
    echo [INFO] Existing Factory Database detected!
    echo [Hefze Etelaat] Etelaate ghabli, sefareshat va moshtarian hefz mishavad.
    echo.
)

:: 3. Server Dependencies
echo [1/3] Installing Server Dependencies...
cd server
call npm install --no-audit
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install server dependencies.
    pause
    exit /b 1
)

:: 4. Check Client Build
echo.
echo [2/3] Checking Client Build...
cd "%ROOT_DIR%\client"
if not exist "dist\index.html" (
    echo Building UI client...
    call npm install --no-audit
    call npm run build
) else (
    echo Client build verified (dist folder is ready).
)

cd "%ROOT_DIR%"

:: 5. Open Windows Firewall Port 3001
echo.
echo [3/3] Configuring Windows Firewall for Port 3001...
netsh advfirewall firewall add rule name="BoxFactoryERP_3001" dir=in action=allow protocol=TCP localport=3001 >nul 2>nul

echo.
echo ===============================================================================
echo              INSTALLATION COMPLETED SUCCESSFULLY!
echo              Nasb Ba Movafaghiat Anjam Shod!
echo ===============================================================================
echo.
echo Local Server URL:
echo   http://localhost:3001
echo.
echo Local Area Network (LAN) / WiFi Mobile URL:
ipconfig | findstr /i "IPv4"
echo   Port: 3001  (Example: http://192.168.1.100:3001)
echo.
echo ===============================================================================
echo Press any key to start the server now...
pause >nul
cd /d "%~dp0"
call start-server.bat
