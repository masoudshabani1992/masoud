@echo off
setlocal EnableDelayedExpansion
title Box Factory ERP - Data Migration Tool
color 0B

:: -----------------------------------------------------------------------------
:: Step 1: Resolve Root Project Directory
:: -----------------------------------------------------------------------------
set "SCRIPT_DIR=%~dp0"
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

if exist "%SCRIPT_DIR%\server\migrate-tool.js" (
    set "ROOT_DIR=%SCRIPT_DIR%"
) else if exist "%SCRIPT_DIR%\..\server\migrate-tool.js" (
    pushd "%SCRIPT_DIR%\.."
    set "ROOT_DIR=!cd!"
    popd
) else (
    set "ROOT_DIR=%SCRIPT_DIR%"
)

cd /d "%ROOT_DIR%"

echo ======================================================================
echo    Box Factory ERP - Data Import and Migration Tool
echo    Abzar Enteghal va Voroode Etelaat Az Excel va JSON
echo ======================================================================
echo.
echo In abzar be shoma emkan midahad file-haye Excel (.xlsx, .xls, .csv)
echo ya backup JSON ghabli ra vared database konid.
echo.

set /p FILE_PATH="Lotfan masir ya name file Excel/JSON ra vared konid (Drag and Drop): "

if "%FILE_PATH%"=="" (
    echo [ERROR] Hich fili entekhab nashod.
    pause
    exit /b 1
)

set FILE_PATH=%FILE_PATH:"=%

node "%ROOT_DIR%\server\migrate-tool.js" "%FILE_PATH%" auto

echo.
echo ======================================================================
echo Amaliat ba movafaghiat be payan resid.
echo ======================================================================
pause
