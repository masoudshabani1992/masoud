@echo off
chcp 65001 >nul
title Battery Kaveh - Saba Battery Automation Server
echo ================================================================
echo   سامانه اتوماسیون فروش، صندوق و اتصال سپیدار - باتری کاوه
echo   نمایندگی رسمی باتری صبا
echo ================================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [خطا] Node.js نسخه 22 یا بالاتر روی این سرور ویندوز نصب نیست.
    echo لطفا نسخه LTS را از nodejs.org دانلود و نصب نمایید.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [1/2] در حال نصب کتابخانه‌های مورد نیاز...
    call npm install
)

if not exist "web-bundle" (
    echo [2/2] در حال ساخت نسخه اجرایی رابط کاربری...
    call npm run build
)

echo.
echo آدرس‌های شبکه این سرور برای اتصال کامپیوتر صندوقدار طبقه پایین:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    echo   http://%%a:3000
)
echo.
echo سرور در حال اجرا روی پورت 3000 است (پنجره را نبندید)...
echo ================================================================
set NODE_ENV=production
set PORT=3000
node server/index.js
pause
