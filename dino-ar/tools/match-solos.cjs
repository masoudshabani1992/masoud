/* جای دقیق هر دایناسورِ شفاف روی عکس چاپی — با موتور ویژگی بازیکا */
const sharp = require('./node_modules/sharp');
const F = require('../ar/feat.js');

async function rawRGBA(f, w) {
  const r = await sharp(f).resize({ width: w }).raw().toBuffer({ resolveWithObject: true });
  return { data: r.data, w: r.info.width, h: r.info.height, ch: r.info.channels };
}

async function alphaBBox(f) {
  const r = await sharp(f).raw().toBuffer({ resolveWithObject: true });
  const { data } = r;
  const { width: w, height: h, channels: ch } = r.info;
  let x0 = w, y0 = h, x1 = 0, y1 = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (data[(y * w + x) * ch + 3] > 40) {
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1, w, h };
}

async function grayOfBuf(buf, w, h, ch) {
  const g = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++)
    g[i] = 0.299 * buf[i * ch] + 0.587 * buf[i * ch + 1] + 0.114 * buf[i * ch + 2];
  return F.grayNormalize(g);
}

(async () => {
  const compW = 620;
  const comp = await rawRGBA('user-art/dinosaur4.webp', compW);
  const compGray = await grayOfBuf(comp.data, comp.w, comp.h, comp.ch);
  const compFeat = F.extract(compGray, comp.w, comp.h, 600);
  console.log('comp features:', compFeat.pts.length);

  const compMeta = await sharp('user-art/dinosaur4.webp').metadata();

  for (const [name, f] of [
    ['trex', 'content/dino/images/trex.webp'],
    ['trice', 'content/dino/images/triceratops.webp'],
    ['stego', 'content/dino/images/stegosaurus.webp'],
  ]) {
    const bb = await alphaBBox(f);
    // برش به جوهر و کوچک‌سازی به پهنای هدف
    const targetW = 470;
    const r = await sharp(f).extract(bb).resize({ width: targetW }).raw().toBuffer({ resolveWithObject: true });
    const g = await grayOfBuf(r.data, r.info.width, r.info.height, r.info.channels);
    const feat = F.extract(g, r.info.width, r.info.height, 400);
    const pairs = F.matchFeatures(feat.desc, compFeat.desc, 60, 0.85);
    const res = pairs.length >= 14 ? F.ransac(pairs, feat.pts, compFeat.pts, 300, 3.5) : null;
    if (!res) { console.log(name, '❌ no match (pairs=' + pairs.length + ')'); continue; }
    // چهار گوشهٔ جوهرِ سولو → مختصات کامپوزیت
    const corners = [[0, 0], [r.info.width, 0], [r.info.width, r.info.height], [0, r.info.height]];
    const q = corners.map(c => F.applyH(res.H, c[0], c[1]));
    const xs = q.map(p => p[0]), ys = q.map(p => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const pct = v => +(v * 100).toFixed(2);
    console.log(name,
      '✅ inliers=' + res.inliers + '/' + pairs.length,
      '| left=' + pct(minX / comp.w) + '% top=' + pct(minY / comp.h) + '%',
      'width=' + pct((maxX - minX) / comp.w) + '% height=' + pct((maxY - minY) / comp.h) + '%',
      '| px@full:', Math.round(minX / comp.w * compMeta.width), Math.round(minY / comp.h * compMeta.height),
      Math.round((maxX - minX) / comp.w * compMeta.width), Math.round((maxY - minY) / comp.h * compMeta.height));
  }
})().catch(e => { console.error(e); process.exit(1); });
