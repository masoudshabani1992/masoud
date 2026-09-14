@echo off
title Box Factory ERP - Uninstall Service
echo ===============================================================================
echo            Stopping and Removing Box Factory ERP Service
echo ===============================================================================
echo.

call pm2 stop box-factory-erp
call pm2 delete box-factory-erp
call pm2 save

echo.
echo ===============================================================================
echo [SUCCESS] Service uninstalled successfully.
echo ===============================================================================
pause
