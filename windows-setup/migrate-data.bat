@echo off
setlocal EnableDelayedExpansion
title Box Factory ERP - Data Migration Tool
color 0B

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

cd /d "%~dp0\.."
node server/migrate-tool.js "%FILE_PATH%" auto

echo.
echo ======================================================================
echo Amaliat ba movafaghiat be payan resid.
echo ======================================================================
pause
