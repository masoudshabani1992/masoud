#!/usr/bin/env bash
# دانلود رسانه‌های ماه اول (دایناسورها) از گوگل‌درایو — روی رانر گیت‌هاب اجرا می‌شود
set -e
cd "$(dirname "$0")/.."
mkdir -p dino-ar/content/dino/audio dino-ar/content/dino/images/incoming

dl() { # $1=file id  $2=dest
  curl -sL "https://drive.google.com/uc?export=download&id=$1" -o "$2"
  if head -c 300 "$2" | grep -qi "<html"; then
    echo "WARN: $2 got an html page (virus-scan gate?) — retry with confirm"
    curl -sLb /tmp/cj -c /tmp/cj "https://drive.google.com/uc?export=download&confirm=t&id=$1" -o "$2"
  fi
  ls -la "$2"
}

# صداها
dl 1t-_g04llhe4uZHWYJqTgaIfjovbMPgLf dino-ar/content/dino/audio/narration.mp3        # Dinosaur final.mp3 — داستان با راوی
dl 1wULd8DI_5qqm-lkRDvWaT1bzdzGFT6q2 dino-ar/content/dino/audio/roar-trex.mp3       # epic t-rex roar
dl 1u3m1k4sfbf2zaKC2pl4kQ0_lvAVRLBC0 dino-ar/content/dino/audio/roar-triceratops.mp3 # Triceratops (1).mp3
dl 1b6U5WGIcbqS2in4E46MZ1jzjoxEwO_xN dino-ar/content/dino/audio/roar-stegosaurus.mp3 # deep beast growl

# تصویرهای جدید استند/دایناسورها
dl 1Ioga9trBJ_pw-JJ3uU1YVbYWY8DzLjuH dino-ar/content/dino/images/incoming/IMG_0243.webp
dl 1qRZEPMFTfbQegx981xfjJW-DD-Vin-zj dino-ar/content/dino/images/incoming/IMG_0424.webp
dl 1vcF2jdcJtWzGiXBrIXeHra-MY6X9Ir_w dino-ar/content/dino/images/incoming/IMG_0978.webp
dl 16CkDYBMUO0VJg06HHXd9fZVAJs3LC68e dino-ar/content/dino/images/incoming/IMG_0984.webp

# لوگوی بازیکا
curl -sL "https://drive.google.com/uc?export=download&id=1lmkmyaCiktWE0jZHkMIUZ8k0IpBLJxLZ" -o /tmp/logo
if head -c 300 /tmp/logo | grep -qi "<html"; then
  curl -sLb /tmp/cj -c /tmp/cj "https://drive.google.com/uc?export=download&confirm=t&id=1lmkmyaCiktWE0jZHkMIUZ8k0IpBLJxLZ" -o /tmp/logo
fi
case "$(file -b --mime-type /tmp/logo)" in
  image/png) EXT=png;; image/webp) EXT=webp;; image/svg+xml) EXT=svg;; image/jpeg|image/jpg) EXT=jpg;; *) EXT=png;;
esac
cp /tmp/logo "dino-ar/assets/logo.$EXT"
echo "logo saved as logo.$EXT"

echo "== done"
