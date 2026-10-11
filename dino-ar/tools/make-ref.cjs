/* ساخت مرجع تشخیص برای استندها (عکس چاپ = مرجع) */
const sharp = require('./node_modules/sharp');
const F = require('../ar/feat.js');
const fs = require('fs');

async function grayOf(src, w) {
  const r = await sharp(src).resize({ width: w }).grayscale().raw().toBuffer({ resolveWithObject: true });
  return { g: F.grayNormalize(Float32Array.from(r.data)), w: r.info.width, h: r.info.height };
}

(async () => {
  const [src, jsonPath] = process.argv.slice(2);
  const levels = [];
  for (const w of [340, 480, 640]) {
    const im = await grayOf(src, w);
    levels.push(F.extract(im.g, im.w, im.h, 300));
  }
  const ref = F.serialize(levels);
  const st = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  st.ref = ref;
  fs.writeFileSync(jsonPath, JSON.stringify(st, null, 2));
  console.log('ref written to', jsonPath, '—', JSON.stringify(ref).length, 'bytes');
})().catch(e => { console.error(e); process.exit(1); });
