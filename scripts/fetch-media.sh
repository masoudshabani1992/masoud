#!/usr/bin/env bash
# دانلود همهٔ فایل‌های یک پوشهٔ گوگل‌درایو (صداهای استند غار) — روی رانر گیت‌هاب اجرا می‌شود
set -e
cd "$(dirname "$0")/.."
DEST="dino-ar/content/cave/audio"
mkdir -p "$DEST"
FOLDER="119ZLlC_hOwna4N2B160D96DEb1I0rOpW"

curl -sL "https://drive.google.com/embeddedfolderview?id=${FOLDER}" -o /tmp/folderview.html || true
# تشخیص: اگر تجزیه ناموفق بود، بخشی از HTML داخل ریپو کامیت می‌شود
head -c 3000 /tmp/folderview.html > "$DEST/fetch-debug.txt" 2>/dev/null || true
python3 - "$DEST" <<'PY'
import re, sys, os, subprocess, html
dest = sys.argv[1]
raw = open('/tmp/folderview.html', encoding='utf8', errors='ignore').read()
# جفت‌های (شناسه فایل، نام فایل)
pairs = re.findall(r'id="entry-([A-Za-z0-9_-]{20,})".*?flip-entry-title">([^<]+)</div>', raw, re.S)
import io as _io
_io.open(os.path.join(dest,'fetch-debug.txt'),'a',encoding='utf8').write('\npairs=%d\n' % len(pairs) + '\n'.join(n for _,n in pairs[:40]))
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
