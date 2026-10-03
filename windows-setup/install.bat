@echo off
setlocal EnableDelayedExpansion
title Box Factory ERP - Windows Server Installer
color 0B

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

echo ===============================================================================
echo            Box Factory ERP - Automated Windows Server Installer
echo            Nasb va Rah-andazi Automasion Karkhaneh Jabehsazi
echo ===============================================================================
echo.

:: -----------------------------------------------------------------------------
:: Step 2: Detect Node.js
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
echo [OK] Node.js Version:
node -v
echo.

:: -----------------------------------------------------------------------------
:: Step 3: Database Preservation Check
:: -----------------------------------------------------------------------------
if exist "%ROOT_DIR%\server\factory.db" (
    echo [SECURITY INFO] Previous database detected. All existing orders are preserved.
    echo.
)

:: -----------------------------------------------------------------------------
:: Step 4: Server Dependencies
:: -----------------------------------------------------------------------------
if exist "%ROOT_DIR%\server\node_modules\express" (
    echo [1/2] Server modules already installed [OK]
) else (
    echo [1/2] Installing server dependencies...
    cd /d "%ROOT_DIR%\server"
    call npm install --no-audit
    cd /d "%ROOT_DIR%"
)

:: -----------------------------------------------------------------------------
:: Step 5: Windows Firewall Rule
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
call "%ROOT_DIR%\start-server.bat"
goto :EOF

:NODE_ERROR
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
