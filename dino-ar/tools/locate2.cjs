/* مکان‌یابی برش‌ها با تطبیق سیلوئت (IoU ماسک) — مقاوم به تفاوت رندر */
const sharp = require('./node_modules/sharp');
const fs = require('fs');
const AW = 320, AH = 452; // نسبت 2480x3508

async function grayOf(path, w, h, fit) {
  const r = await sharp(path).resize(w, h, fit ? { fit } : {}).grayscale().raw().toBuffer({ resolveWithObject: true });
  return { g: r.data, w: r.info.width, h: r.info.height };
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
function dilate(m,w,h,r){const o=new Uint8Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){let v=0;for(let dy=-r;dy<=r&&!v;dy++)for(let dx=-r;dx<=r;dx++){const yy=y+dy,xx=x+dx;if(yy>=0&&xx>=0&&yy<h&&xx<w&&m[yy*w+xx]){v=1;break;}}o[y*w+x]=v;}return o;}
function erode(m,w,h,r){const o=new Uint8Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){let v=1;for(let dy=-r;dy<=r&&v;dy++)for(let dx=-r;dx<=r;dx++){const yy=y+dy,xx=x+dx;if(yy<0||xx<0||yy>=h||xx>=w||!m[yy*w+xx]){v=0;break;}}o[y*w+x]=v;}return o;}

(async () => {
  const art = await grayOf('user-art/dinosaur4.webp', AW, AH, 'fill');
  const bg  = await grayOf('content/dino/images/incoming/IMG_0424.webp', AW, AH, 'cover');
  // ماسک اختلاف = سیلوئت دایناسورها
  let M = new Uint8Array(AW * AH);
  for (let i = 0; i < AW * AH; i++) M[i] = Math.abs(art.g[i] - bg.g[i]) > 30 ? 1 : 0;
  M = erode(M, AW, AH, 1); M = dilate(M, AW, AH, 2); M = erode(M, AW, AH, 1);
  const mass = M.reduce((s, v) => s + v, 0);
  console.log('dino-silhouette mass:', mass, 'of', AW*AH);
  fs.writeFileSync('/tmp/mask.pgm', 'P5\n' + AW + ' ' + AH + '\n255\n' + Buffer.from(M.map(v=>v*255)));

  const cuts = { trex:'content/dino/images/incoming/IMG_0243.webp', trice:'content/dino/images/incoming/IMG_0984.webp', stego:'content/dino/images/incoming/IMG_0978.webp' };
  const result = {};
  for (const [name, path] of Object.entries(cuts)) {
    let best = null;
    for (const wf of [0.50,0.58,0.66,0.74,0.82]) {
      const cw = Math.round(AW * wf);
      const t = trim(await alphaOf(path, cw));
      const cm = t.a.map(v => v > 24 ? 1 : 0);
      for (let y = 0; y <= AH - t.h; y += 2) {
        for (let x = 0; x <= AW - t.w; x += 2) {
          let inter = 0, uni = 0;
          for (let yy = 0; yy < t.h; yy += 1) {
            const row = (y + yy) * AW + x, crow = yy * t.w;
            for (let xx = 0; xx < t.w; xx += 1) {
              const a = cm[crow + xx], b = M[row + xx];
              inter += a & b; uni += a | b;
            }
          }
          const iou = uni ? inter / uni : 0;
          if (!best || iou > best.iou) best = { iou, x, y, w: t.w, h: t.h, wf };
        }
      }
    }
    result[name] = {
      iou: +best.iou.toFixed(3),
      left: +(100 * best.x / AW).toFixed(2), top: +(100 * best.y / AH).toFixed(2),
      width: +(100 * best.w / AW).toFixed(2), height: +(100 * best.h / AH).toFixed(2), wf: best.wf
    };
    console.log(name, JSON.stringify(result[name]));
  }
  fs.writeFileSync('/tmp/locate2.json', JSON.stringify(result, null, 2));
})().catch(e => { console.error(e); process.exit(1); });
