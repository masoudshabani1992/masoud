@echo off
chcp 65001 >nul
title Koosha Khodro CMS
cd /d "%~dp0"

echo.
echo  ==============================================
echo    کوشا خودرو - نسخه کامل سایت و پنل مدیریت
echo    Koosha Khodro CMS
echo  ==============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo  [خطا] Node.js روی این کامپیوتر نصب نیست.
  echo.
  echo  لطفا نسخه LTS را از آدرس زیر دانلود و نصب کنید:
  echo      https://nodejs.org/en/download
  echo  سپس دوباره روی همین فایل کلیک کنید.
  echo.
  pause
  exit /b 1
)

for /f "delims=" %%v in ('node -p "process.versions.node"') do set NODEV=%%v
echo  نسخه Node.js: %NODEV%

node -e "process.exit(parseInt(process.versions.node.split('.')[0])>=22 && parseInt(process.versions.node.split('.')[1])>=5 ? 0 : (parseInt(process.versions.node.split('.')[0])>22 ? 0 : 1))"
if errorlevel 1 (
  echo.
  echo  [خطا] این برنامه به Node.js نسخه 22.5 یا بالاتر نیاز دارد.
  echo  نسخه فعلی: %NODEV%
  echo  لطفا از https://nodejs.org نسخه 22 LTS یا جدیدتر را نصب کنید.
  echo.
  pause
  exit /b 1
)

echo.
echo  در حال اجرای سرور... پنجره را نبندید.
echo  آدرس سایت:      http://localhost:3000
echo  پنل مدیریت:     http://localhost:3000/admin
echo.
echo  نام کاربری: admin@kooshakhodro.com
echo  رمز عبور:   Koosha@1404
echo.

start "" cmd /c "timeout /t 4 >nul & start http://localhost:3000"

node server.js
pause
