/* مکان‌یابی دقیق برش‌های شفاف روی آرت با ماسک اختلاف (بک‌گراند دقیقاً همان است) */
const sharp = require('./node_modules/sharp');
const fs = require('fs');
const AW = 400, AH = 566;
async function grayOf(path, w, h) {
  const r = await sharp(path).resize(w, h, { fit: 'fill' }).grayscale().raw().toBuffer({ resolveWithObject: true });
  return r.data;
}
async function alphaOf(path, w) {
  const r = await sharp(path).resize({ width: w }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = r.info.width, H = r.info.height, a = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) a[i] = r.data[i * 4 + 3];
  return { a, w: W, h: H };
}
function trim(m) {
  let x0=1e9,y0=1e9,x1=-1,y1=-1;
  for (let y=0;y<m.h;y++) for (let x=0;x<m.w;x++) if (m.a[y*m.w+x]>24){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
  const w=x1-x0+1,h=y1-y0+1,out=new Uint8Array(w*h);
  for (let y=0;y<h;y++) for (let x=0;x<w;x++) out[y*w+x]=m.a[(y+y0)*m.w+(x+x0)];
  return { a: out, w, h };
}
(async () => {
  const A = await grayOf('content/cave/images/incoming/art-full.webp', AW, AH);
  const B = await grayOf('content/cave/images/incoming/bg.webp', AW, AH);
  const M = new Uint8Array(AW * AH);
  for (let i = 0; i < AW * AH; i++) M[i] = Math.abs(A[i] - B[i]) > 26 ? 1 : 0;
  console.log('mask mass:', M.reduce((s, v) => s + v, 0));
  const cuts = { man:'man.webp', kids:'kids.webp', painter:'painter.webp', fire:'fire.webp', torch:'torch.webp' };
  const out = {};
  for (const [name, f] of Object.entries(cuts)) {
    let best = null;
    const native = trim(await alphaOf('content/cave/images/incoming/' + f, 1200));
    for (const wf of [0.08,0.12,0.17,0.23,0.30,0.38,0.47,0.57]) {
      const tw = Math.round(AW * wf);
      const th = Math.round(native.h * (tw / native.w));
      if (th > AH) continue;
      // ماسکِ برش‌خورده را به اندازهٔ هدف بازنمونه‌گیری کن
      const rb = await sharp(Buffer.from(native.a), { raw: { width: native.w, height: native.h, channels: 1 } })
        .resize(tw, th, { fit: 'fill' }).raw().toBuffer();
      const t = { a: rb, w: tw, h: th };
      for (let y = 0; y <= AH - t.h; y += 1) {
        for (let x = 0; x <= AW - t.w; x += 1) {
          let inter = 0, uni = 0;
          for (let yy = 0; yy < t.h; yy++) {
            const row = (y + yy) * AW + x, crow = yy * t.w;
            for (let xx = 0; xx < t.w; xx++) { const a = t.a[crow + xx] > 24 ? 1 : 0, b = M[row + xx]; inter += a & b; uni += a | b; }
          }
          const iou = uni ? inter / uni : 0;
          if (!best || iou > best.iou) best = { iou, x, y, w: t.w, h: t.h, wf };
        }
      }
    }
    out[name] = { iou: +best.iou.toFixed(3),
      left: +(100 * best.x / AW).toFixed(2), top: +(100 * best.y / AH).toFixed(2),
      width: +(100 * best.w / AW).toFixed(2), height: +(100 * best.h / AH).toFixed(2) };
    console.log(name, JSON.stringify(out[name]));
  }
  fs.writeFileSync('/tmp/cave-locate.json', JSON.stringify(out, null, 2));
})().catch(e => { console.error(e); process.exit(1); });
