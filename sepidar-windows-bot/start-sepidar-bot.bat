@echo off
cd /d "%~dp0"
title Kaveh Battery - Sepidar Windows Bot Builder and Launcher

echo ================================================================
echo   Kaveh Battery - Sepidar Native Windows Bot (.EXE)
echo   Developer: Masoud Shabani
echo ================================================================
echo.

if exist "%~dp0KavehSepidarBot.exe" goto :run_exe

set "CSC=%SystemRoot%\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if exist "%CSC%" goto :compile_exe

set "CSC=%SystemRoot%\Microsoft.NET\Framework\v4.0.30319\csc.exe"
if exist "%CSC%" goto :compile_exe

echo [ERROR] Microsoft .NET Framework 4.0 compiler was not found on Windows.
pause
exit /b 1

:compile_exe
echo Building native Windows application KavehSepidarBot.exe ...
"%CSC%" /nologo /target:winexe /r:System.dll /r:System.Core.dll /r:System.Drawing.dll /r:System.Windows.Forms.dll /r:System.Web.Extensions.dll /out:"%~dp0KavehSepidarBot.exe" "%~dp0KavehSepidarBot.cs"
if errorlevel 1 goto :compile_failed

:run_exe
echo Launching KavehSepidarBot.exe ...
start "" "%~dp0KavehSepidarBot.exe"
exit /b 0

:compile_failed
echo.
echo [ERROR] Failed to build KavehSepidarBot.exe. Make sure KavehSepidarBot.cs is in the same folder.
pause
exit /b 1
