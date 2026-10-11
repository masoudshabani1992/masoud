const sharp = require('./node_modules/sharp');
const F = require('../ar/feat.js');

async function grayOf(buf, w) {
  const r = await sharp(buf).resize({ width: w }).grayscale().raw().toBuffer({ resolveWithObject: true });
  return { g: F.grayNormalize(Float32Array.from(r.data)), w: r.info.width, h: r.info.height };
}

(async () => {
  const src = '../user-art/dinosaur4.webp';

  // مرجع هرمی: سه مقیاس از عکس استند
  const levels = [];
  for (const w of [340, 480, 640]) {
    const im = await grayOf(src, w);
    levels.push(F.extract(im.g, im.w, im.h, 300));
  }
  const refModel = { levels };
  const refFeat = refModel; // سازگاری با کدهای قبلی تست
  console.log('ref pyramid levels:', levels.map(l => l.pts.length + '@' + l.w).join(', '));

  // شبیه‌سازی‌های «دوربین موبایل»
  const cases = [
    ['همان عکس کوچک‌تر (دور)',       { width: 360 }],
    ['بزرگ‌نمایی 20٪ + روشن‌تر',      { width: 580, modulate: { brightness: 1.25 } }],
    ['تاریک‌تر + کنتراست کمتر',        { width: 460, modulate: { brightness: 0.8 } }, { gamma: 1.4 }],
    ['چرخش ۴ درجه',                  { width: 480, rotate: 4 }],
    ['چرخش ۸ درجه + برش',            { width: 620, rotate: 8, extractAfter: { left: 30, top: 30 } }],
  ];
  // خودآزمایی: مرجع در برابر خودش باید ۱۰۰٪ تطبیق دهد
  const selfLv = F.extract((await grayOf(src, 480)).g, 0, 0) || null;
  const selfImg = await grayOf(src, 480);
  const selfFeat = F.extract(selfImg.g, selfImg.w, selfImg.h, 300);
  const self = F.detectFrame(selfFeat, refModel);
  console.log('خودآزمایی (مرجع با خودش)'.padEnd(30), '→', self ? ('✅ ' + self.inliers + ' inliers, ratio=' + self.ratio.toFixed(2)) : '❌ no match');

  for (const [name, o, extra] of cases) {
    let pipe = sharp(src);
    if (o.rotate) pipe = pipe.rotate(o.rotate);
    pipe = pipe.resize({ width: o.width });
    if (o.extractAfter) {
      const meta = await pipe.grayscale().raw().toBuffer({ resolveWithObject: true });
      const ew = Math.min(o.width - 60, meta.info.width - o.extractAfter.left);
      const eh = Math.min(Math.floor(ew * 1.4), meta.info.height - o.extractAfter.top);
      pipe = sharp(meta.data, { raw: { width: meta.info.width, height: meta.info.height, channels: 1 } })
        .extract({ left: o.extractAfter.left, top: o.extractAfter.top, width: ew, height: eh });
    }
    if (o.modulate) pipe = pipe.modulate(o.modulate);
    if (extra && extra.gamma) pipe = pipe.gamma(extra.gamma);
    const img = await pipe.grayscale().raw().toBuffer({ resolveWithObject: true });
    const g = F.grayNormalize(Float32Array.from(img.data));
    const sc = F.extract(g, img.info.width, img.info.height, 300);
    const res = F.detectFrame(sc, refFeat);
    console.log(name.padEnd(30), '→', res ? ('✅ ' + res.inliers + ' inliers, ratio=' + res.ratio.toFixed(2)) : '❌ no match');
  }

  // کنترل منفی: عکس کاملاً بی‌ربط نباید تطبیق بدهد
  const neg = await grayOf('../assets/jungle.jpg', 480).catch(async () => {
    // ساخت یک تصویر تصادفی به‌عنوان بی‌ربط
    const n = 480 * 640, rnd = F.mulberry32(7);
    const buf = Buffer.from(Array.from({ length: n }, () => Math.floor(rnd() * 256)));
    return { g: F.grayNormalize(Float32Array.from(buf)), w: 480, h: 640 };
  });
  const scNeg = F.extract(neg.g, neg.w, neg.h, 300);
  const resNeg = F.detectFrame(scNeg, refModel);
  console.log('تصویر بی‌ربط (کنترل منفی)'.padEnd(30), '→', resNeg ? '⚠ مثبت کاذب! inliers=' + resNeg.inliers : '✅ تطبیقی نداد');

  // اندازهٔ سریال مرجع
  console.log('serialized pyramid size:', JSON.stringify(F.serialize(levels)).length, 'bytes');
})().catch(e => { console.error(e); process.exit(1); });
