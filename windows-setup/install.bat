@echo off
setlocal EnableDelayedExpansion
title Box Factory ERP - Windows Server Installer
color 0B

echo ===============================================================================
echo            Box Factory ERP - Automated Windows Server Installer
echo            Nasb va Rah-andazi Automasion Karkhaneh Jabehsazi
echo ===============================================================================
echo.

:: -----------------------------------------------------------------------------
:: Step 1: Detect Node.js
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
echo [OK] Node.js Version:
node -v
echo.

:: -----------------------------------------------------------------------------
:: Step 2: Root directory & Database preservation check
:: -----------------------------------------------------------------------------
cd /d "%~dp0\.."
set "ROOT_DIR=%cd%"

if exist "%ROOT_DIR%\server\factory.db" (
    echo [SECURITY INFO] Previous database detected. All existing orders are preserved.
    echo.
)

:: -----------------------------------------------------------------------------
:: Step 3: Server dependencies
:: -----------------------------------------------------------------------------
if exist "%ROOT_DIR%\server\node_modules\express" (
    echo [1/2] Server modules already installed [OK]
) else (
    echo [1/2] Installing server dependencies...
    cd "%ROOT_DIR%\server"
    call npm install --no-audit
    cd "%ROOT_DIR%"
)

:: -----------------------------------------------------------------------------
:: Step 4: Windows Firewall rule
:: -----------------------------------------------------------------------------
echo.
echo [2/2] Opening Network Port 3001 in Windows Firewall...
netsh advfirewall firewall add rule name="BoxFactoryERP_3001" dir=in action=allow protocol=TCP localport=3001 >nul 2>nul
echo Network port 3001 configured successfully [OK]

echo.
echo ===============================================================================
echo                    INSTALLATION COMPLETED SUCCESSFULLY!
echo                     Nasb ba movafaghiat anjam shod!
echo ===============================================================================
echo.
echo Local Computer Access:
echo   http://localhost:3001
echo.
echo Factory LAN / WiFi Access for mobile, tablet, and personnel PCs:
ipconfig | findstr /i "IPv4"
echo   Port: 3001  -  Example: http://192.168.1.100:3001
echo.
echo ===============================================================================
echo Press any key to start the ERP server now...
pause >nul
cd /d "%~dp0"
call start-server.bat
goto :EOF

:NODE_MISSING
color 0C
cls
echo ===============================================================================
echo [ERROR] Node.js is NOT installed on this machine!
echo [KHATA] Narm-afzar Node.js rooye in computer nasb nist!
echo ===============================================================================
echo.
echo Baraye ejraye automasion, lotfan yekbar narmafzar Node.js ra nasb konid:
echo.
echo   1. Website https://nodejs.org dar moroorgar baz mishavad.
echo   2. Noskheh LTS ra download va nasb konid.
echo   3. Pas az nasb, hamin file install.bat ra mojadadan ejra konid.
echo.
echo ===============================================================================
start https://nodejs.org
pause
exit /b 1
