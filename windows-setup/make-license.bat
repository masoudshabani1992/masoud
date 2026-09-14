@echo off
setlocal EnableDelayedExpansion
title License Key Generator - Masoud Shabani
color 0B
cls

:: Navigate to root directory
cd /d "%~dp0"
if exist "..\server\license-generator.js" (
    cd /d "%~dp0\.."
)

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Run Node.js License Generator
node server\license-generator.js

echo.
echo =======================================================================
echo Press any key to exit...
pause >nul
