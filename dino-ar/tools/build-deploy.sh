#!/usr/bin/env bash
# ساخت بستهٔ انتشار بازیکا (با مبهم‌سازی جاوااسکریپت)
set -e
cd "$(dirname "$0")/.."
SRC="$(pwd)"
D="$(pwd)/../deploy"
rm -rf "$D"
mkdir -p "$D/ar" "$D/vendor" "$D/assets/sprites" "$D/data/stands" \
         "$D/content/dino/images/crop" "$D/content/dino/audio"

cp index.php admin.php bz_guard.php "$D/"
cp deploy-guide/update.php "$D/update.php"
cp deploy-guide/.htaccess "$D/.htaccess"
cp deploy-guide/README-DEPLOY.md "$D/"
cp ar/index.php ar/data.php ar/ui.css "$D/ar/"
cp vendor/qrcode.js "$D/vendor/"
cp assets/logo.png assets/jungle.jpg "$D/assets/" 2>/dev/null || true
cp -r assets/sprites "$D/assets/" 2>/dev/null || true
cp data/stands/index.json data/stands/dino.json "$D/data/stands/"
cp content/dino/images/crop/*.webp "$D/content/dino/images/crop/"
cp content/dino/images/stand-original.webp content/dino/images/bg.webp "$D/content/dino/images/"
cp content/dino/audio/*.mp3 "$D/content/dino/audio/"
cp version.json "$D/version.json"

# مبهم‌سازی جاوااسکریپت
cd "$SRC/tools"
npx --no-install terser "$SRC/ar/app.js" -c passes=2,pure_funcs=['console.log'] -m toplevel -o "$D/ar/app.js"
echo "app.js: $(wc -c < "$SRC/ar/app.js")B -> $(wc -c < "$D/ar/app.js")B (obfuscated)"
