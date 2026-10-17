/* WAV → 22050Hz mono 16bit (سبک‌سازی برای وب) */
const fs = require('fs');
function readWav(p) {
  const b = fs.readFileSync(p);
  let off = 12, fmt = null, data = null;
  while (off + 8 <= b.length) {
    const id = b.toString('ascii', off, off + 4);
    const sz = b.readUInt32LE(off + 4);
    if (id === 'fmt ') fmt = { ch: b.readUInt16LE(off + 10), rate: b.readUInt32LE(off + 12), bits: b.readUInt16LE(off + 22) };
    if (id === 'data') data = b.subarray(off + 8, off + 8 + sz);
    off += 8 + sz + (sz % 2);
  }
  return { fmt, data };
}
function sampleAt(data, i, bits) {
  if (bits === 16) return data.readInt16LE(i * 2);
  if (bits === 24) return (data[i * 3] | (data[i * 3 + 1] << 8) | (data[i * 3 + 2] << 24)) >> 8;
  if (bits === 8) return (data[i] - 128) << 8;
  throw new Error('bits ' + bits);
}
for (const p of process.argv.slice(2)) {
  const { fmt, data } = readWav(p);
  const frames = Math.floor(data.length / (fmt.bits / 8) / fmt.ch);
  const out = new Int16Array(Math.floor(frames / 2));
  for (let i = 0; i < out.length; i++) {
    let acc = 0;
    for (let k = 0; k < 2; k++) {           // دو فریم پشت‌سرهم → میانگین (ضدالیاس سبک)
      const f = i * 2 + k;
      let s = 0;
      for (let c = 0; c < fmt.ch; c++) s += sampleAt(data, f * fmt.ch + c, fmt.bits);
      acc += s / fmt.ch;
    }
    out[i] = Math.max(-32768, Math.min(32767, Math.round(acc / 2)));
  }
  const hdr = Buffer.alloc(44);
  hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + out.length * 2, 4); hdr.write('WAVE', 8);
  hdr.write('fmt ', 12); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(1, 22);
  hdr.writeUInt32LE(22050, 24); hdr.writeUInt32LE(22050 * 2, 28); hdr.writeUInt16LE(2, 32); hdr.writeUInt16LE(16, 34);
  hdr.write('data', 36); hdr.writeUInt32LE(out.length * 2, 40);
  fs.writeFileSync(p, Buffer.concat([hdr, Buffer.from(out.buffer)]));
  console.log(p, '→', fs.statSync(p).size, 'bytes');
}
