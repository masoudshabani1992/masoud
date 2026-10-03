@echo off
setlocal EnableDelayedExpansion
title License Key Generator - Masoud Shabani
color 0B
cls

cd /d "%~dp0"
if exist "..\server\license-generator.js" (
    cd /d "%~dp0\.."
)

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
node server\license-generator.js

echo.
echo =======================================================================
echo Press any key to exit...
pause >nul
