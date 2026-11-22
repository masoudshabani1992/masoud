#!/usr/bin/env bash
# ساخت بسته‌های ویندوز: نسخه آفلاین (نمایشی) و نسخه کامل (اجراشدنی)
set -e
cd "$(dirname "$0")/.."

echo "→ ساخت نسخه آفلاین (HTML)"
node scripts/export-preview.js

rm -rf dist-preview build-win deliver
mkdir -p dist-preview build-win deliver

cp -r .preview-build "dist-preview/koosha-preview"
(cd dist-preview && zip -qr -9 koosha-preview-windows.zip koosha-preview)

echo "→ ساخت نسخه کامل (اجراشدنی با Node)"
mkdir -p build-win/koosha-cms
cp -r server.js package.json package-lock.json start.bat src views public node_modules build-win/koosha-cms/
mkdir -p build-win/koosha-cms/data
cp data/cms.db build-win/koosha-cms/data/ 2>/dev/null || true
cp scripts/README-win.txt "build-win/koosha-cms/راهنمای-نصب.txt"

(cd build-win && zip -qr -9 koosha-cms-windows.zip koosha-cms)

cp build-win/koosha-cms-windows.zip dist-preview/koosha-preview-windows.zip deliver/
ls -lh deliver
