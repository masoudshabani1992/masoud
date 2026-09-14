# Box Factory ERP - PowerShell Automated Installer
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "          سامانه جامع اتوماسیون کارخانه جعبه‌سازی و کارتن‌سازی           " -ForegroundColor Yellow
Write-Host "                نصب و راه‌اندازی خودکار در ویندوز سرور                 " -ForegroundColor Green
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = Split-Path -Parent $PSScriptRoot

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] نرم‌افزار Node.js روی این سرور نصب نیست!" -ForegroundColor Red
    Write-Host "لطفا Node.js را از https://nodejs.org دانلود و نصب فرمایید." -ForegroundColor Yellow
    Pause
    Exit 1
}

Write-Host "[1/3] بررسی نسخه Node.js:" -ForegroundColor Green
node -v

# Install server deps
Write-Host ""
Write-Host "[2/3] نصب وابستگی‌های سرور..." -ForegroundColor Green
Set-Location "$rootDir\server"
npm install --no-audit

# Configure Firewall
Write-Host ""
Write-Host "[3/3] تنظیم فایروال ویندوز برای پورت 3001..." -ForegroundColor Green
try {
    netsh advfirewall firewall add rule name="BoxFactoryERP_3001" dir=in action=allow protocol=TCP localport=3001 | Out-Null
    Write-Host "[موفقیت] پورت 3001 در فایروال ویندوز باز شد." -ForegroundColor Green
} catch {
    Write-Host "[توجه] تنظیم فایروال به دسترسی Administrator نیاز دارد." -ForegroundColor Yellow
}

# Get IP Address
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254*" } | Select-Object -First 1).IPAddress

Write-Host ""
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "                       نصب با موفقیت کامل انجام شد!                           " -ForegroundColor Green
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "آدرس‌های دسترسی:" -ForegroundColor Yellow
Write-Host "  1. در همین سرور:  http://localhost:3001" -ForegroundColor White
Write-Host "  2. در شبکه داخلی / تبلت و موبایل: http://$ip:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "جهت شروع، کلیدی را فشار دهید..." -ForegroundColor Gray
Pause
