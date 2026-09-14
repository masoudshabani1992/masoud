@echo off
title Box Factory ERP - Running Server
color 0A

cd /d "%~dp0\.."

echo ===============================================================================
echo                     BOX FACTORY ERP SERVER IS RUNNING
echo                     Server Ba Movafaghiat Roshan Shod
echo ===============================================================================
echo.
echo Local Access:
echo   http://localhost:3001
echo.
echo Network Access (LAN / Mobile Devices):
ipconfig | findstr /i "IPv4"
echo   Port: 3001  (Example: http://192.168.1.100:3001)
echo.
echo ===============================================================================
echo NOTE: Do NOT close this window while users are using the system.
echo ===============================================================================
echo.

node server/index.js
pause
