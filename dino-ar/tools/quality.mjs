// بررسی کیفیت هدف اسکن: تعداد ویژگی‌های قابل‌ردیابی در هر مقیاس
// usage: node quality.mjs image.png
import fs from 'node:fs';
import * as tf from '@tensorflow/tfjs';
import { Detector } from './compiler-src/image-target/detector/detector.js';
import './compiler-src/image-target/detector/kernels/cpu/index.js';
import { buildImageList } from './compiler-src/image-target/image-list.js';
import { decodePNG } from './png.mjs';

const src = process.argv[2];
if (!src) { console.error('usage: node quality.mjs image.png'); process.exit(1); }

await tf.setBackend('cpu');
await tf.ready();

const img = decodePNG(fs.readFileSync(src));
const gray = new Uint8Array(img.width * img.height);
for (let i = 0; i < gray.length; i++) {
  const o = i * 4;
  gray[i] = Math.floor((img.rgba[o] + img.rgba[o + 1] + img.rgba[o + 2]) / 3);
}

const list = buildImageList({ data: gray, width: img.width, height: img.height });
let total = 0;
for (const im of list) {
  const det = new Detector(im.width, im.height);
  const t = tf.tensor(im.data, [im.data.length], 'float32').reshape([im.height, im.width]);
  const { featurePoints } = det.detect(t);
  t.dispose();
  total += featurePoints.length;
  console.log(`scale ${im.scale.toFixed(2)}  ${im.width}x${im.height}  -> ${featurePoints.length} features`);
}
console.log(total >= 300 ? `QUALITY: GOOD (${total} features)` : `QUALITY: WEAK (${total} features) — تصویر پرجزئیات‌تری استفاده کنید`);
