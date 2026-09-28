@echo off
chcp 65001 >nul 2>nul
title Box Factory ERP - Windows Server Installer
color 0B

echo ===============================================================================
echo            سامانه اتوماسیون کارخانه جعبه‌سازی و کارتن‌سازی آرمان امیران
echo            Box Factory ERP - Automated Windows Server Installer
echo ===============================================================================
echo.

:: 1. Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo ===============================================================================
    echo [خطای مهم] نرم‌افزار نودجی‌اس روی این سیستم نصب نیست!
    echo [ERROR] Node.js is NOT installed on this machine!
    echo ===============================================================================
    echo.
    echo برای اجرای سامانه اتوماسیون، ابتدا نودجی‌اس را نصب فرمایید:
    echo Please install Node.js (LTS version) from: https://nodejs.org
    echo.
    echo بعد از نصب نودجی‌اس، مجدداً همین فایل install.bat را اجرا کنید.
    echo ===============================================================================
    echo.
    pause
    exit /b 1
)

echo [✓] Node.js Version:
node -v
echo.

:: 2. Change to root directory
cd /d "%~dp0\.."
set "ROOT_DIR=%cd%"

:: Check for existing database & data preservation
if exist "%ROOT_DIR%\server\factory.db" (
    echo [اطلاعیه امنیتی] پایگاه داده قبلی شناسایی شد؛ اطلاعات و سفارشات کاملاً حفظ می‌شوند.
    echo.
)

:: 3. Server Dependencies check
if not exist "%ROOT_DIR%\server\node_modules\express" (
    echo [1/2] در حال آماده‌سازی و نصب ماژول‌های سرور...
    cd "%ROOT_DIR%\server"
    call npm install --no-audit
) else (
    echo [1/2] ماژول‌های سرور از قبل آماده و نصب شده‌اند [✓]
)

:: 4. Windows Firewall Rule
echo.
echo [2/2] بازگشایی پورت شبکه ۳۰۰۱ در فایروال ویندوز...
netsh advfirewall firewall add rule name="BoxFactoryERP_3001" dir=in action=allow protocol=TCP localport=3001 >nul 2>nul
echo پورت ۳۰۰۱ در فایروال با موفقیت باز شد [✓]

echo.
echo ===============================================================================
echo                 نصب و آماده‌سازی با موفقیت کامل انجام شد!
echo                    INSTALLATION COMPLETED SUCCESSFULLY!
echo ===============================================================================
echo.
echo آدرس دسترسی در این کامپیوتر:
echo   http://localhost:3001
echo.
echo آدرس دسترسی سایر کامپیوترها، تبلت و موبایل پرسنل در کارخانه (WiFi / LAN):
ipconfig | findstr /i "IPv4"
echo   پورت: 3001 (مثال: http://192.168.1.100:3001)
echo.
echo ===============================================================================
echo برای راه‌اندازی و باز شدن سرور، یک کلید را فشار دهید...
pause >nul
cd /d "%~dp0"
call start-server.bat
