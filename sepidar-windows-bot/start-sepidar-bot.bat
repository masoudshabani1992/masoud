@echo off
chcp 65001 >nul
title Kaveh Battery - Sepidar Windows RPA Bot
echo ================================================================
echo   ربات دستیار ویندوزی سپیدار (جایگزین خودکار حسابدار)
echo   نمایندگی رسمی باتری صبا - باتری کاوه
echo ================================================================
echo.

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [خطا] Python روی این سیستم ویندوزی نصب نیست.
    echo لطفا Python 3.11+ را از python.org نصب کنید (تیک Add to PATH را بزنید).
    pause
    exit /b 1
)

echo در حال بررسی و نصب کتابخانه‌های کنترل خودکار ویندوز...
pip install -r requirements.txt --quiet

echo در حال اجرای ربات دستیار سپیدار...
python kaveh_sepidar_bot.py
pause
