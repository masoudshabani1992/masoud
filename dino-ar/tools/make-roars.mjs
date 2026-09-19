// ساخت صدای دایناسور (غرش) به‌صورت کاملاً رویه‌ای — بدون هیچ فایل خارجی
// خروجی: sounds/roar-big.wav roar-mid.wav roar-raptor.wav pop.wav
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 44100;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'sounds');
fs.mkdirSync(OUT, { recursive: true });

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function writeWav(file, samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    let v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  fs.writeFileSync(file, buf);
  console.log(path.basename(file), (buf.length / 1024).toFixed(0) + 'KB');
}

// غرش: چند لایه اره‌ای + زیربم + نویز خشن، با AM غرش‌مانند و جاروب فیلتر
function roar({ seed, f0, dur, growlHz, fc0, fc1, shriek = 0, noiseAmt = 0.4 }) {
  const rnd = mulberry32(seed);
  const N = Math.floor(dur * SR);
  const out = new Float32Array(N);
  let ph1 = 0, ph2 = 0, ph3 = 0, lp = 0, hp = 0, hpx = 0, nlp = 0;
  const wobbleP = 4 + rnd() * 3, growlJit = 0.9 + rnd() * 0.2;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const k = t / dur;
    // منحنی زیروبمی: ضربهٔ آغاز، افت تدریجی، لرزش
    let f = f0 * (1 + 0.4 * Math.exp(-t / 0.09)) * (1 - 0.38 * k) * (1 + 0.045 * Math.sin(2 * Math.PI * wobbleP * t));
    if (shriek > 0 && t < 0.25) f *= 1 + shriek * (1 - t / 0.25); // سُر خوردن فرکانس در ابتدا
    const w1 = f / SR, w2 = (f * 1.007) / SR, w3 = (f * 0.5) / SR;
    ph1 += w1; ph2 += w2; ph3 += w3;
    const saw = (x) => 2 * (x - Math.floor(x + 0.5));
    let voice = 0.5 * saw(ph1) + 0.33 * saw(ph2) + 0.55 * Math.sin(2 * Math.PI * ph3);
    const g = 0.62 + 0.38 * Math.sin(2 * Math.PI * growlHz * growlJit * t);
    voice *= g;
    voice = Math.tanh(voice * 2.4) * 0.95; // خشم و خرخر
    // فیلتر پایین‌گذر جاروبی (دهان باز/بسته)
    const fc = fc0 + (fc1 - fc0) * k;
    const a = 1 - Math.exp(-2 * Math.PI * fc / SR);
    lp += a * (voice - lp);
    // نویز نفس/خرخر
    const nz = rnd() * 2 - 1;
    nlp += 0.12 * (nz - nlp);
    const breath = nlp * g * g;
    let x = lp * 0.85 + breath * noiseAmt;
    // حذف بمِ اضافی
    const ahp = 1 - Math.exp(-2 * Math.PI * 32 / SR);
    hpx = x; hp += ahp * (hpx - hp);
    x = hpx - hp * 0.0;
    // پوش: حملهٔ سریع + رهایش
    let env = 1 - Math.exp(-t / 0.07);
    const tR = dur - 0.7;
    if (t > tR) env *= Math.exp(-(t - tR) / 0.28);
    env *= 0.88 + 0.12 * Math.sin(2 * Math.PI * 0.8 * t);
    out[i] = Math.tanh(x * env * 1.35) * 0.92;
  }
  // نرمال‌سازی
  let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(out[i]));
  const gn = 0.92 / peak;
  for (let i = 0; i < N; i++) out[i] *= gn;
  return out;
}

// صدای کوتاه «بیرون پریدن» دایناسور از استند
function pop(seed) {
  const rnd = mulberry32(seed);
  const dur = 0.4, N = Math.floor(dur * SR);
  const out = new Float32Array(N);
  let ph = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const f = 520 * Math.exp(-t * 9) + 90;
    ph += f / SR;
    const tick = t < 0.05 ? (rnd() * 2 - 1) * (1 - t / 0.05) * 0.5 : 0;
    out[i] = (Math.sin(2 * Math.PI * ph) * Math.exp(-t * 10) * 0.9 + tick) * 0.9;
  }
  return out;
}

writeWav(path.join(OUT, 'roar-big.wav'), roar({ seed: 7, f0: 62, dur: 2.6, growlHz: 21, fc0: 1500, fc1: 320, noiseAmt: 0.5 }));
writeWav(path.join(OUT, 'roar-mid.wav'), roar({ seed: 21, f0: 84, dur: 2.1, growlHz: 26, fc0: 1900, fc1: 420, noiseAmt: 0.45 }));
writeWav(path.join(OUT, 'roar-raptor.wav'), roar({ seed: 42, f0: 150, dur: 1.6, growlHz: 31, fc0: 2600, fc1: 700, shriek: 1.1, noiseAmt: 0.6 }));
writeWav(path.join(OUT, 'pop.wav'), pop(5));
