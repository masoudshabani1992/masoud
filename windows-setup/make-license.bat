@echo off
setlocal EnableDelayedExpansion
title License Key Generator - Masoud Shabani
color 0B
cls

:: -----------------------------------------------------------------------------
:: Step 1: Resolve Root Project Directory
:: -----------------------------------------------------------------------------
set "SCRIPT_DIR=%~dp0"
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

if exist "%SCRIPT_DIR%\server\license-generator.js" (
    set "ROOT_DIR=%SCRIPT_DIR%"
) else if exist "%SCRIPT_DIR%\..\server\license-generator.js" (
    pushd "%SCRIPT_DIR%\.."
    set "ROOT_DIR=!cd!"
    popd
) else (
    set "ROOT_DIR=%SCRIPT_DIR%"
)

cd /d "%ROOT_DIR%"

:: Detect Node.js
where node >nul 2>nul
if %errorlevel% equ 0 goto :RUN_GEN

if exist "C:\Program Files\nodejs\node.exe" (
    set "PATH=C:\Program Files\nodejs;%PATH%"
    goto :RUN_GEN
)
if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set "PATH=C:\Program Files (x86)\nodejs;%PATH%"
    goto :RUN_GEN
)
if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
    set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
    goto :RUN_GEN
)
if exist "%ProgramFiles%\nodejs\node.exe" (
    set "PATH=%ProgramFiles%\nodejs;%PATH%"
    goto :RUN_GEN
)

echo [ERROR] Node.js is not installed or not in PATH!
echo Please install Node.js from https://nodejs.org
echo.
pause
exit /b 1

:RUN_GEN
node "%ROOT_DIR%\server\license-generator.js"

echo.
echo =======================================================================
echo Press any key to exit...
pause >nul
