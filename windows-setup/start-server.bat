@echo off
setlocal EnableDelayedExpansion
title Box Factory ERP - Production Server
color 0A

:: -----------------------------------------------------------------------------
:: Step 1: Resolve Root Project Directory
:: -----------------------------------------------------------------------------
set "SCRIPT_DIR=%~dp0"
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

if exist "%SCRIPT_DIR%\server\index.js" (
    set "ROOT_DIR=%SCRIPT_DIR%"
) else if exist "%SCRIPT_DIR%\..\server\index.js" (
    pushd "%SCRIPT_DIR%\.."
    set "ROOT_DIR=!cd!"
    popd
) else (
    set "ROOT_DIR=%SCRIPT_DIR%"
)

cd /d "%ROOT_DIR%"

:: -----------------------------------------------------------------------------
:: Step 2: Detect Node.js (PATH + Default Windows Locations)
:: -----------------------------------------------------------------------------
where node >nul 2>nul
if %errorlevel% equ 0 goto :NODE_OK

if exist "C:\Program Files\nodejs\node.exe" (
    set "PATH=C:\Program Files\nodejs;%PATH%"
    goto :NODE_OK
)
if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set "PATH=C:\Program Files (x86)\nodejs;%PATH%"
    goto :NODE_OK
)
if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
    set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
    goto :NODE_OK
)
if exist "%ProgramFiles%\nodejs\node.exe" (
    set "PATH=%ProgramFiles%\nodejs;%PATH%"
    goto :NODE_OK
)

goto :NODE_ERROR

:NODE_OK
cls
echo ===============================================================================
echo       Box Factory ERP - Arman Amiran Packaging Automation Server
echo       Samaneh Jame Automasion Karkhaneh Jabeh va Kartonsazi
echo ===============================================================================
echo.
echo [OK] Node.js Version:
node -v
echo.

:: -----------------------------------------------------------------------------
:: Step 3: Check and Install Server Dependencies if needed
:: -----------------------------------------------------------------------------
if exist "%ROOT_DIR%\server\node_modules\express" goto :LAUNCH_SERVER

echo [1/2] Installing required server dependencies (first run only)...
echo Lotfan kami sabr konid...
cd /d "%ROOT_DIR%\server"
call npm install --no-audit
cd /d "%ROOT_DIR%"
echo [OK] Dependencies installed successfully.
echo.

:LAUNCH_SERVER
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

node "%ROOT_DIR%\server\index.js"
if %errorlevel% neq 0 goto :SERVER_CRASH
goto :END

:SERVER_CRASH
echo.
echo [WARN] Server encountered an issue. Verifying server dependencies...
cd /d "%ROOT_DIR%\server"
call npm install --no-audit
cd /d "%ROOT_DIR%"
node "%ROOT_DIR%\server\index.js"
goto :END

:NODE_ERROR
color 0C
cls
echo ===============================================================================
echo [ERROR] Node.js is NOT installed on this Windows computer!
echo [KHATA] Narm-afzar Node.js rooye in computer nasb nist!
echo ===============================================================================
echo.
echo Baraye ejraye automasion, lotfan yekbar narmafzar rayegan Node.js ra nasb konid:
echo.
echo   1. Safheye download dar moroorgar baz mishavad (https://nodejs.org).
echo   2. Noskheh LTS (Dokmeh sabz rang) ra download va nasb konid.
echo   3. Pas az nasb, hamin file start-server.bat ra mojadadan ejra konid.
echo.
echo ===============================================================================
start https://nodejs.org
pause
exit /b 1

:END
pause
