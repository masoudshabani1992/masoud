# Box Factory ERP - PowerShell Launcher
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$rootDir = Split-Path -Parent $PSScriptRoot
Set-Location "$rootDir"

$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254*" } | Select-Object -First 1).IPAddress

Write-Host "===============================================================================" -ForegroundColor Green
Write-Host "              سرور اتوماسیون کارخانه جعبه‌سازی با موفقیت روشن شد              " -ForegroundColor Yellow
Write-Host "===============================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "آدرس دسترسی در این سرور:    http://localhost:3001" -ForegroundColor White
Write-Host "آدرس دسترسی در شبکه و موبایل: http://$ip:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "نکته: این پنجره را نبندید تا سیستم در شبکه فعال بماند." -ForegroundColor Yellow
Write-Host "===============================================================================" -ForegroundColor Green
Write-Host ""

node server/index.js
