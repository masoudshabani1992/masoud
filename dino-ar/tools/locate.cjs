/* جای دقیق هر برش شفاف را روی عکس چاپی پیدا می‌کند */
const sharp = require('./node_modules/sharp');
const F = require('../ar/feat.js');
const fs = require('fs');

async function grayRGBA(path, w) {
  const r = await sharp(path).resize({ width: w }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const data = r.data, W = r.info.width, H = r.info.height;
  const g = new Float32Array(W * H), a = new Float32Array(W * H);
  let min = 255, max = 0;
  for (let i = 0; i < W * H; i++) {
    const v = 0.299 * data[i*4] + 0.587 * data[i*4+1] + 0.114 * data[i*4+2];
    g[i] = v; a[i] = data[i*4+3];
    if (a[i] > 20) { if (v < min) min = v; if (v > max) max = v; }
  }
  const range = (max - min) || 1;
  for (let i = 0; i < g.length; i++) g[i] = ((g[i] - min) / range) * 255;
  return { g, a, w: W, h: H };
}

function trimAlpha(img) {
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) {
    if (img.a[y * img.w + x] > 24) {
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const g = new Float32Array(w * h), a = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    g[y*w+x] = img.g[(y+y0)*img.w+(x+x0)];
    a[y*w+x] = img.a[(y+y0)*img.w+(x+x0)];
  }
  return { g, a, w, h };
}

(async () => {
  const ART = 'user-art/dinosaur4.webp';
  const art = await grayRGBA(ART, 640);           // فضای جستجو
  const artFeat = F.extract(art.g, art.w, art.h, 400);

  const cuts = {
    trex:  'content/dino/images/incoming/IMG_0243.webp',
    trice: 'content/dino/images/incoming/IMG_0984.webp',
    stego: 'content/dino/images/incoming/IMG_0978.webp',
  };
  const out = {};
  for (const [name, path] of Object.entries(cuts)) {
    const raw = await grayRGBA(path, 900);
    const cut = trimAlpha(raw);
    // هرم مرجع از برش
    const levels = [];
    for (const w of [200, 300, 420]) {
      const r = await sharp(path).resize({ width: w }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const im = { g: new Float32Array(r.info.width * r.info.height), a: new Float32Array(r.info.width * r.info.height), w: r.info.width, h: r.info.height };
      let min=255,max=0;
      for (let i=0;i<im.w*im.h;i++){ const v=0.299*r.data[i*4]+0.587*r.data[i*4+1]+0.114*r.data[i*4+2]; im.g[i]=v; im.a[i]=r.data[i*4+3]; if(im.a[i]>20){if(v<min)min=v;if(v>max)max=v;} }
      const range=(max-min)||1; for (let i=0;i<im.g.length;i++) im.g[i]=((im.g[i]-min)/range)*255;
      const t = trimAlpha(im);
      levels.push(F.extract(t.g, t.w, t.h, 300));
    }
    const hit = F.detectFrame(artFeat, { levels });
    if (!hit) { console.log(name, '❌ no match'); continue; }
    const lv = levels[hit.level];
    // H: مرجع(برش) → صحنه(آرت)
    const s = Math.hypot(hit.H[0], hit.H[3]);
    const c0 = F.applyH(hit.H, 0, 0), c1 = F.applyH(hit.H, lv.w, 0), c2 = F.applyH(hit.H, lv.w, lv.h), c3 = F.applyH(hit.H, 0, lv.h);
    const xs = [c0[0],c1[0],c2[0],c3[0]], ys = [c0[1],c1[1],c2[1],c3[1]];
    const bx = Math.min(...xs), by = Math.min(...ys), bw = Math.max(...xs)-bx, bh = Math.max(...ys)-by;
    // نرمال‌سازی روشنایی برای SSD: میانگین داخل ماسک برش و ناحیهٔ آرت
    out[name] = { level: hit.level, inliers: hit.inliers, scale: s,
      left: +(100 * bx / art.w).toFixed(2), top: +(100 * by / art.h).toFixed(2),
      width: +(100 * bw / art.w).toFixed(2), height: +(100 * bh / art.h).toFixed(2) };
    console.log(name, JSON.stringify(out[name]));
  }
  fs.writeFileSync('/tmp/locate.json', JSON.stringify(out, null, 2));
})().catch(e => { console.error(e); process.exit(1); });
