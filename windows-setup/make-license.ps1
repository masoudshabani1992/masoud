# ==============================================================================
# License Key Generator - PowerShell Launcher (Masoud Shabani)
# ==============================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "ابزار صدور لایسنس - مهندس مسعود شعبانی"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = (Get-Item $scriptDir).Parent.FullName

Set-Location $rootDir

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please download and install Node.js from https://nodejs.org" -ForegroundColor Yellow
    Read-Host "Press Enter to exit..."
    exit 1
}

Write-Host "Starting License Generator..." -ForegroundColor Cyan
node server\license-generator.js

Write-Host ""
Read-Host "Press Enter to exit..."
