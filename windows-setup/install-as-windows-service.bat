@echo off
setlocal EnableDelayedExpansion
title Box Factory ERP - Windows Background Service Setup

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
echo          Installing Box Factory ERP as Automatic Windows Service
echo ===============================================================================
echo.

echo Installing PM2 process manager...
call npm install -g pm2 pm2-windows-service

echo Starting ERP server with PM2...
call pm2 start "%ROOT_DIR%\server\index.js" --name "box-factory-erp"
call pm2 save

echo.
echo ===============================================================================
echo [SUCCESS] Box Factory ERP is now running as a background service!
echo It will automatically start every time Windows boots.
echo ===============================================================================
pause
