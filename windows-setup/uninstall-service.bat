@echo off
setlocal EnableDelayedExpansion
title Box Factory ERP - Remove Windows Background Service

echo ===============================================================================
echo          Removing Box Factory ERP Background Service
echo ===============================================================================
echo.

call pm2 delete "box-factory-erp"
call pm2 save

echo.
echo ===============================================================================
echo [SUCCESS] Box Factory ERP background service removed.
echo ===============================================================================
pause
