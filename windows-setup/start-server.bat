@echo off
setlocal EnableDelayedExpansion
title Box Factory ERP - Production Server
color 0A

cd /d "%~dp0\.."

:: -----------------------------------------------------------------------------
:: Step 1: Detect Node.js (including default Windows installation folders)
:: -----------------------------------------------------------------------------
where node >nul 2>nul
if %errorlevel% equ 0 goto :NODE_FOUND

if exist "C:\Program Files\nodejs\node.exe" (
    set "PATH=C:\Program Files\nodejs;%PATH%"
    goto :NODE_FOUND
)
if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set "PATH=C:\Program Files (x86)\nodejs;%PATH%"
    goto :NODE_FOUND
)
if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
    set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
    goto :NODE_FOUND
)
if exist "%ProgramFiles%\nodejs\node.exe" (
    set "PATH=%ProgramFiles%\nodejs;%PATH%"
    goto :NODE_FOUND
)

goto :NODE_MISSING

:NODE_FOUND
cls
echo ===============================================================================
echo       Box Factory ERP - Arman Amiran Packaging Automation Server
echo       Samaneh Jame Automasion Karkhaneh Jabeh va Kartonsazi
echo ===============================================================================
echo.
echo [OK] Node.js is ready:
node -v
echo.

:: -----------------------------------------------------------------------------
:: Step 2: Check server dependencies
:: -----------------------------------------------------------------------------
if exist "server\node_modules\express" goto :START_SERVER

echo [1/2] Installing required server dependencies (first run only)...
echo Lotfan kami sabr konid...
cd server
call npm install --no-audit
cd ..
echo [OK] Dependencies installed successfully.
echo.

:START_SERVER
echo ===============================================================================
echo                  SERVER IS RUNNING ON PORT 3001
echo            Server ba movafaghiat roshan shod va amadeh ast
echo ===============================================================================
echo.
echo [1] Dastresi rooye hamin computer (Local Access):
echo     http://localhost:3001
echo.
echo [2] Dastresi az goushi, tablet va digar computer-ha (LAN / WiFi):
ipconfig | findstr /i "IPv4"
echo     Port: 3001  -  Mesal: http://192.168.1.100:3001
echo.
echo ===============================================================================
echo NOTE: Do NOT close this window while users are working.
echo Tavajoh: In panjereh ra nabandid ta etesal bargharar bemanad.
echo ===============================================================================
echo.

node server/index.js
if %errorlevel% neq 0 goto :SERVER_ERROR
goto :END

:SERVER_ERROR
echo.
echo [WARN] Server stopped unexpectedly. Retrying module check...
cd server
call npm install --no-audit
cd ..
node server/index.js
goto :END

:NODE_MISSING
color 0C
cls
echo ===============================================================================
echo [ERROR] Node.js is NOT installed on this Windows computer!
echo [KHATA] Narm-afzar Node.js rooye in computer nasb nist!
echo ===============================================================================
echo.
echo Baraye ejraye automasion, lotfan yekbar narmafzar rayegan Node.js ra nasb konid:
echo.
echo   1. Website Node.js dar moroorgar shoma baz mishavad: https://nodejs.org
echo   2. Dokmeh sabz rang Node.js (LTS) ra download va nasb konid.
echo   3. Pas az nasb, hamin file start-server.bat ra mojadadan ejra konid.
echo.
echo ===============================================================================
echo Dar hal baz kardan safheye download Node.js dar moroorgar...
start https://nodejs.org
echo.
pause
exit /b 1

:END
pause
