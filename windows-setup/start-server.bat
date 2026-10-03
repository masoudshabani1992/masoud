@echo off
chcp 65001 >nul 2>nul
title Box Factory ERP - Production Server
color 0A

cd /d "%~dp0\.."

echo ===============================================================================
echo       سامانه جامع اتوماسیون کارخانه جعبه و کارتن سازی آرمان امیران
echo                  BOX FACTORY ERP - SERVER LAUNCHER
echo ===============================================================================
echo.

:: 1. Verify Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo ===============================================================================
    echo [خطای مهم] نرم افزار Node.js روی این ویندوز نصب نیست!
    echo [ERROR] Node.js is NOT installed on this machine!
    echo ===============================================================================
    echo.
    echo برای اجرای سامانه فقط کافیست یکبار نرم افزار رایگان Node.js را نصب کنید:
    echo 1. به وبسایت زیر بروید:
    echo    https://nodejs.org
    echo 2. نسخه LTS را دانلود و نصب کنید.
    echo 3. پس از اتمام نصب، دوباره روی همین فایل start-server.bat کلیک کنید.
    echo.
    echo ===============================================================================
    pause
    exit /b 1
)

:: 2. Display Node info & check server modules
echo [OK] Node.js Version:
node -v
echo.

if not exist "server\node_modules\express" (
    echo [1/2] Installing required server dependencies (first run only)...
    cd server
    call npm install --no-audit
    cd ..
    echo [OK] Server dependencies installed successfully.
    echo.
)

:: 3. Server Startup
echo ===============================================================================
echo               سرور اتوماسیون با موفقیت روشن شد و آماده استفاده است
echo                    SERVER IS RUNNING ON PORT 3001
echo ===============================================================================
echo.
echo [1] دسترسی روی همین سیستم (Local Access):
echo     http://localhost:3001
echo.
echo [2] دسترسی از گوشی، تبلت و کامپیوترهای دیگر کارخانه (LAN / WiFi):
ipconfig | findstr /i "IPv4"
echo     پورت: 3001 (مثال: http://192.168.1.100:3001)
echo.
echo ===============================================================================
echo توجه: این پنجره را نبندید تا سیستم برای سایر همکاران فعال بماند.
echo NOTE: Do NOT close this window while users are working.
echo ===============================================================================
echo.

node server/index.js
if %errorlevel% neq 0 (
    echo.
    echo [خطا در اجرا] در حال بررسی ماژول های سرور...
    cd server
    call npm install
    cd ..
    node server/index.js
)
pause
