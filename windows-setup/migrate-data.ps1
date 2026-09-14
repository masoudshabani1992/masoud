# PowerShell Migration Script for Arman Amiran Packaging MIS
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "ابزار انتقال اطلاعات اتوماسیون آرمان امیران"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "    مرکز انتقال و ورود اطلاعات اتوماسیون تولید آرمان امیران" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "این اسکریپت فایل‌های اکسل (.xlsx, .xls, .csv) یا JSON را وارد پایگاه داده می‌کند." -ForegroundColor Gray
Write-Host ""

$filePath = Read-Host "لطفاً مسیر فایل اکسل یا JSON را وارد کنید"
$filePath = $filePath.Trim('"')

if ([string]::IsNullOrWhiteSpace($filePath) -or -not (Test-Path $filePath)) {
    Write-Host "[خطا] فایل مورد نظر یافت نشد: $filePath" -ForegroundColor Red
    Pause
    Exit
}

$serverDir = Split-Path -Parent $PSScriptRoot
Set-Location $serverDir

node server/migrate-tool.js $filePath auto

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "عملیات انتقال داده‌ها به پایان رسید." -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
Pause
