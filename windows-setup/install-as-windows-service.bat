@echo off
title Box Factory ERP - Windows Background Service Setup
cd /d "%~dp0\.."

echo ===============================================================================
echo          Installing Box Factory ERP as Automatic Windows Service
echo ===============================================================================
echo.

echo Installing PM2 process manager...
call npm install -g pm2 pm2-windows-service

echo Starting ERP server with PM2...
call pm2 start server/index.js --name "box-factory-erp"
call pm2 save

echo.
echo ===============================================================================
echo [SUCCESS] Box Factory ERP is now running as a background service!
echo It will automatically start every time Windows boots.
echo ===============================================================================
pause
