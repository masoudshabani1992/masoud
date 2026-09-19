// کامپایلر هدف اسکن MindAR در Node — بدون نیاز به canvas نیتیو
//
// usage:  node compile.mjs <image.png> [out.mind] [maxDim=512]
//
// خروجی یک فایل .mind است که صفحه AR آن را از assets/targets.mind می‌خواند.
// برای تغییر طرح استند، تصویر جدید را کامپایل کنید و روی assets/targets.mind کپی کنید.

import fs from 'node:fs';
import path from 'node:path';
import * as tf from '@tensorflow/tfjs';
import { CompilerBase } from './compiler-src/image-target/compiler-base.js';
import { buildTrackingImageList } from './compiler-src/image-target/image-list.js';
import { extractTrackingFeatures } from './compiler-src/image-target/tracker/extract-utils.js';
import './compiler-src/image-target/detector/kernels/cpu/index.js';
import { resize } from './compiler-src/image-target/utils/images.js';
import { decodePNG } from './png.mjs';

// نسخهٔ بدون canvas از OfflineCompiler:
// فقط گرayscale را خودمان از RGBA می‌سازیم و tracking را مثل نسخهٔ رسمی انجام می‌دهیم.
class NodeCompiler extends CompilerBase {
  createProcessCanvas(img) {
    return {
      getContext() {
        return {
          drawImage() {},
          getImageData() { return { data: img.rgba }; },
        };
      },
    };
  }

  async compileTrack({ progressCallback, targetImages, basePercent }) {
    const percentPerImage = (100 - basePercent) / targetImages.length;
    let percent = 0;
    const list = [];
    for (const targetImage of targetImages) {
      const imageList = buildTrackingImageList(targetImage);
      const percentPerAction = percentPerImage / imageList.length;
      const trackingData = extractTrackingFeatures(imageList, () => {
        percent += percentPerAction;
        progressCallback(basePercent + percent);
      });
      list.push(trackingData);
    }
    return list;
  }
}

function toGray({ width, height, rgba }) {
  const data = new Uint8Array(width * height);
  for (let i = 0; i < data.length; i++) {
    const o = i * 4;
    data[i] = Math.floor((rgba[o] + rgba[o + 1] + rgba[o + 2]) / 3);
  }
  return { data, width, height };
}

async function main() {
  const src = process.argv[2];
  const out = process.argv[3] || path.join('..', 'assets', 'targets.mind');
  const maxDim = parseInt(process.argv[4] || '512', 10);
  if (!src) {
    console.error('usage: node compile.mjs <image.png> [out.mind] [maxDim]');
    process.exit(1);
  }

  await tf.setBackend('cpu');
  await tf.ready();

  let img = decodePNG(fs.readFileSync(src));
  console.log(`image: ${img.width}x${img.height}`);

  // کوچک‌کردن تصویر بزرگ برای سرعت و کیفیت بهتر کامپایل
  if (Math.max(img.width, img.height) > maxDim) {
    const ratio = maxDim / Math.max(img.width, img.height);
    const gray = toGray(img);
    const small = resize({ image: gray, ratio });
    // بازسازی RGBA از gray (شفافیت مهم نیست)
    const rgba = new Uint8ClampedArray(small.width * small.height * 4);
    for (let i = 0; i < small.width * small.height; i++) {
      rgba[i * 4] = rgba[i * 4 + 1] = rgba[i * 4 + 2] = small.data[i];
      rgba[i * 4 + 3] = 255;
    }
    img = { width: small.width, height: small.height, rgba };
    console.log(`downscaled to ${img.width}x${img.height}`);
  }

  const compiler = new NodeCompiler();
  const t0 = Date.now();
  await compiler.compileImageTargets([img], (p) => {
    process.stdout.write(`\rprogress: ${p.toFixed(1)}%   `);
  });
  console.log(`\ncompiled in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

  const buffer = compiler.exportData();
  fs.writeFileSync(out, Buffer.from(buffer));
  console.log(`wrote ${out} (${(buffer.byteLength / 1024).toFixed(0)} KB)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
