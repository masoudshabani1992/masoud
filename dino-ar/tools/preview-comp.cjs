/* پیش‌نمایش ترکیب: بکگراند + برش‌ها با چیدمان درصدی */
const sharp = require('./node_modules/sharp');
const PL = JSON.parse(process.argv[2] || require('fs').readFileSync('/tmp/placement.json','utf8'));
const AW = 640, AH = 904;
(async () => {
  const bg = await sharp('content/dino/images/incoming/IMG_0424.webp').resize(AW, AH, { fit: 'cover' }).toBuffer();
  const comps = [{ input: bg, top: 0, left: 0 }];
  for (const c of PL) {
    const w = Math.round(AW * c.width / 100);
    let pipe = sharp('content/dino/images/incoming/' + c.file).trim().resize({ width: w });
    if (c.flip) pipe = pipe.flop();
    const buf = await pipe.toBuffer();
    let L = Math.round(AW * c.left / 100), T = Math.round(AH * c.top / 100);
    let img = buf;
    const m = await sharp(buf).metadata();
    const cl = Math.max(0, -L), ct = Math.max(0, -T);
    const cw = Math.min(m.width - cl, AW - Math.max(0, L)), ch = Math.min(m.height - ct, AH - Math.max(0, T));
    if (cl > 0 || ct > 0 || cw < m.width || ch < m.height) {
      img = await sharp(buf).extract({ left: cl, top: ct, width: cw, height: ch }).toBuffer();
    }
    L = Math.max(0, L); T = Math.max(0, T);
    if (L >= AW || T >= AH || cw <= 0 || ch <= 0) continue;
    comps.push({ input: img, left: L, top: T });
  }
  await sharp({ create: { width: AW, height: AH, channels: 4, background: '#222' } })
    .composite(comps).png().toFile('/tmp/comp.png');
  console.log('preview ready');
})().catch(e => { console.error(e); process.exit(1); });
