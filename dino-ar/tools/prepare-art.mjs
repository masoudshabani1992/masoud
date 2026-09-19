// تبدیل فایل‌های طرح کاربر به دارایی‌های موردنیاز محصول
// usage:
//   node prepare-art.mjs --group <طرح‌گروهی.webp> --trex <f> --trice <f> --stego <f> [--jungle <f>] [--stand <عکس‌استند>]
//
// خروجی‌ها:
//   ../assets/target.png        هدف اسکن MindAR (بعداً: node compile.mjs ../assets/target.png ../assets/targets.mind)
//   ../assets/sprites/{trex,trice,stego}.png   برش‌خورده با پس‌زمینهٔ شفاف
//   ../assets/jungle.jpg        پس‌زمینهٔ صفحهٔ فرود
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(__dirname, '..', 'assets');

const args = process.argv.slice(2);
function arg(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
}

// حذف پس‌زمینهٔ سیاه → شفاف (با لبهٔ نرم)؛ اگر تصویر خودش آلفا داشت، فقط کپی می‌شود
async function cutout(inPath, outPath) {
  const meta = await sharp(inPath).metadata();
  if (meta.hasAlpha) {
    await sharp(inPath).png().toFile(outPath);
    console.log('alpha already present ->', outPath);
    return;
  }
  const { data, info } = await sharp(inPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const n = info.width * info.height;
  for (let i = 0; i < n; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    const m = Math.max(r, g, b);
    let a;
    if (m < 28) a = 0;
    else if (m < 70) a = Math.round(((m - 28) / 42) * 255);
    else a = 255;
    data[i * 4 + 3] = a;
  }
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile(outPath);
  console.log('cutout ->', outPath);
}

async function main() {
  const group = arg('--group');
  const trex = arg('--trex');
  const trice = arg('--trice');
  const stego = arg('--stego');
  const jungle = arg('--jungle');
  if (!group || !trex || !trice || !stego) {
    console.error('usage: node prepare-art.mjs --group <f> --trex <f> --trice <f> --stego <f> [--jungle <f>]');
    process.exit(1);
  }

  await sharp(group).resize(1024, 1024, { fit: 'inside' }).png().toFile(path.join(ASSETS, 'target.png'));
  console.log('target.png updated');

  await cutout(trex, path.join(ASSETS, 'sprites', 'trex.png'));
  await cutout(trice, path.join(ASSETS, 'sprites', 'trice.png'));
  await cutout(stego, path.join(ASSETS, 'sprites', 'stego.png'));

  if (jungle) {
    await sharp(jungle).resize(1400, 1400, { fit: 'inside' }).jpeg({ quality: 82 }).toFile(path.join(ASSETS, 'jungle.jpg'));
    console.log('jungle.jpg updated');
  }
  console.log('done. حالا: node compile.mjs ../assets/target.png ../assets/targets.mind');
}

main().catch((e) => { console.error(e); process.exit(1); });
