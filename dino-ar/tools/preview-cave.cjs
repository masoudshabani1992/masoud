const sharp = require('./node_modules/sharp');
const fs = require('fs');
const PL = JSON.parse(fs.readFileSync('/tmp/cave-placement.json','utf8'));
const AW = 480, AH = 679;
(async () => {
  const bg = await sharp('content/cave/images/incoming/bg.webp').resize(AW, AH, { fit: 'fill' }).toBuffer();
  const comps = [{ input: bg, top: 0, left: 0 }];
  for (const c of PL) {
    const w = Math.round(AW * c.width / 100);
    let L = Math.round(AW * c.left / 100), T = Math.round(AH * c.top / 100);
    let buf = await sharp('content/cave/images/incoming/' + c.file).trim().resize({ width: w }).toBuffer();
    const m = await sharp(buf).metadata();
    const cl = Math.max(0, -L), ct = Math.max(0, -T);
    const cw = Math.min(m.width - cl, AW - Math.max(0, L)), ch = Math.min(m.height - ct, AH - Math.max(0, T));
    if (cl > 0 || ct > 0 || cw < m.width || ch < m.height) buf = await sharp(buf).extract({ left: cl, top: ct, width: cw, height: ch }).toBuffer();
    L = Math.max(0, L); T = Math.max(0, T);
    if (cw <= 0 || ch <= 0) continue;
    comps.push({ input: buf, left: L, top: T });
  }
  await sharp({ create: { width: AW, height: AH, channels: 4, background: '#222' } }).composite(comps).png().toFile('/tmp/cave-comp.png');
  const art = await sharp('content/cave/images/incoming/art-full.webp').resize(440, 622, { fit: 'fill' }).toBuffer();
  const fin = await sharp('/tmp/cave-comp.png').resize(440, 622, { fit: 'fill' }).toBuffer();
  await sharp({ create: { width: 880, height: 622, channels: 3, background: '#000' } })
    .composite([{ input: art, top: 0, left: 0 }, { input: fin, top: 0, left: 440 }]).png().toFile('/tmp/cave-side.png');
  console.log('cave preview ok');
})().catch(e => { console.error(e); process.exit(1); });
