#!/usr/bin/env bash
# دانلود همهٔ فایل‌های یک پوشهٔ گوگل‌درایو (صداهای استند غار) — روی رانر گیت‌هاب اجرا می‌شود
set -e
cd "$(dirname "$0")/.."
DEST="dino-ar/content/cave/audio"
mkdir -p "$DEST"
FOLDER="119ZLlC_hOwna4N2B160D96DEb1I0rOpW"

curl -sL "https://drive.google.com/embeddedfolderview?id=${FOLDER}" -o /tmp/folderview.html || true
python3 - "$DEST" <<'PY'
import re, sys, os, subprocess, html
dest = sys.argv[1]
raw = open('/tmp/folderview.html', encoding='utf8', errors='ignore').read()
# جفت‌های (شناسه فایل، نام فایل)
pairs = re.findall(r'id="entry-([A-Za-z0-9_-]{20,})"[^>]*aria-label="([^"]+)"', raw)
if not pairs:
    pairs = re.findall(r'\?id=([A-Za-z0-9_-]{20,})[^>]*>\s*<span class="flip-entry-name">([^<]+)</span>', raw)
if not pairs:
    pairs = re.findall(r'id="entry-([A-Za-z0-9_-]{20,})".*?flip-entry-name">([^<]+)<', raw, re.S)
seen = set()
for fid, name in pairs:
    if fid in seen: continue
    seen.add(fid)
    name = html.unescape(name).strip().replace('/', '-')
    out = os.path.join(dest, name)
    print('fetching', fid, '->', out)
    subprocess.run(['curl', '-sL', f'https://drive.google.com/uc?export=download&id={fid}', '-o', out], check=True)
    with open(out, 'rb') as f: head = f.read(300)
    if b'<html' in head.lower()[:300]:
        print('  html gate — retry with confirm')
        subprocess.run(['curl', '-sL', '-b', '/tmp/cj', '-c', '/tmp/cj',
                        f'https://drive.google.com/uc?export=download&confirm=t&id={fid}', '-o', out], check=True)
    print('  size:', os.path.getsize(out))
print('== folder fetch done:', len(seen), 'files')
PY
ls -la "$DEST"
echo "== done"
