// Minimal pure-JS PNG decoder (8-bit, non-interlaced) used by compile.mjs so the
// MindAR target compiler can run in Node without any native `canvas` dependency.
import zlib from 'node:zlib';

export function decodePNG(buf) {
  if (buf.length < 8 || buf.readUInt32BE(0) !== 0x89504e47 || buf.readUInt32BE(4) !== 0x0d0a1a0a) {
    throw new Error('Not a PNG file');
  }
  let pos = 8;
  let w = 0, h = 0, depth = 0, color = 0, interlace = 0;
  let plte = null;
  const idat = [];
  while (pos + 8 <= buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      depth = data[8];
      color = data[9];
      interlace = data[12];
    } else if (type === 'PLTE') {
      plte = data;
    } else if (type === 'IDAT') {
      idat.push(Buffer.from(data));
    } else if (type === 'IEND') {
      break;
    }
    pos += 12 + len;
  }
  if (interlace !== 0) throw new Error('Interlaced PNG is not supported. Re-export without interlacing (Adam7).');
  if (depth !== 8) throw new Error(`Only 8-bit PNG supported, got bit depth ${depth}.`);
  const ch = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[color];
  if (!ch) throw new Error(`Unsupported PNG color type ${color}.`);

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * ch;
  const out = Buffer.alloc(h * stride);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    const line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? line[x - ch] : 0;
      const b = prev[x];
      const c = x >= ch ? prev[x - ch] : 0;
      let v = line[x];
      if (f === 1) v = (v + a) & 255;
      else if (f === 2) v = (v + b) & 255;
      else if (f === 3) v = (v + ((a + b) >> 1)) & 255;
      else if (f === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        v = (v + pr) & 255;
      }
      line[x] = v;
    }
    line.copy(out, y * stride);
    prev = line;
  }

  const rgba = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    let r, g, b, a = 255;
    if (color === 0) { r = g = b = out[i]; }
    else if (color === 2) { r = out[i * 3]; g = out[i * 3 + 1]; b = out[i * 3 + 2]; }
    else if (color === 3) { const p = out[i] * 3; r = plte[p]; g = plte[p + 1]; b = plte[p + 2]; }
    else if (color === 4) { r = g = b = out[i * 2]; a = out[i * 2 + 1]; }
    else { r = out[i * 4]; g = out[i * 4 + 1]; b = out[i * 4 + 2]; a = out[i * 4 + 3]; }
    rgba[i * 4] = r;
    rgba[i * 4 + 1] = g;
    rgba[i * 4 + 2] = b;
    rgba[i * 4 + 3] = a;
  }
  return { width: w, height: h, rgba };
}
