/*! بازیکا — موتور تشخیص استند 🦖📷
 * تشخیص بدون مارکر/QR: گوشه‌ها + توصیف‌گر دودویی (بریف‌مانند) + هوموگرافی چندمقیاسی
 * بدون هیچ کتابخانه یا مدل خارجی — جاوااسکریپت خالص.
 * UMD: مرورگر (window.BZFeat) و نود (module.exports).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BZFeat = factory();
})(typeof self !== 'undefined' ? self : this, function () {
'use strict';

var PATTERN = 512; // 512 نقطه = 256 جفت → توصیف‌گر 256 بیتی
var PATCH = 24;

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* الگوی نمونه‌برداری توصیف‌گر (قطعی و یکسان در همه‌جا) */
var pattern = (function () {
  var rnd = mulberry32(1379), pts = [];
  for (var i = 0; i < PATTERN; i++) {
    var ang = rnd() * Math.PI * 2;
    var r = Math.sqrt(rnd()) * PATCH;
    pts.push([Math.round(Math.cos(ang) * r), Math.round(Math.sin(ang) * r)]);
  }
  return pts;
})();

function popcount(x) {
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return (((x + (x >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24;
}

function grayFromRGBA(data, w, h) {
  var g = new Float32Array(w * h), min = 255, max = 0, i, v;
  for (i = 0; i < w * h; i++) {
    v = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
    g[i] = v;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  var range = (max - min) || 1;
  for (i = 0; i < g.length; i++) g[i] = ((g[i] - min) / range) * 255;
  return g;
}

/* حذف نور نام یکنواخت و بازتاب (رتینکس لوگاریتمی) — برای چاپ براق */
function _boxH(src, w, h, r) {
  var out = new Float32Array(w * h);
  for (var y = 0; y < h; y++) {
    var row = y * w, acc = 0;
    for (var x = -r; x <= r; x++) acc += src[row + Math.min(w - 1, Math.max(0, x))];
    for (x = 0; x < w; x++) {
      out[row + x] = acc / (2 * r + 1);
      var add = Math.min(w - 1, x + r + 1), sub = Math.max(0, x - r);
      acc += src[row + add] - src[row + sub];
    }
  }
  return out;
}
function _boxV(src, w, h, r) {
  var out = new Float32Array(w * h);
  for (var x = 0; x < w; x++) {
    var acc = 0;
    for (var y = -r; y <= r; y++) acc += src[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (y = 0; y < h; y++) {
      out[y * w + x] = acc / (2 * r + 1);
      var add = Math.min(h - 1, y + r + 1), sub = Math.max(0, y - r);
      acc += src[add * w + x] - src[sub * w + x];
    }
  }
  return out;
}
function illumNorm(g, w, h) {
  var L = new Float32Array(w * h), i;
  for (i = 0; i < g.length; i++) L[i] = Math.log(g[i] + 8);
  var b = _boxH(L, w, h, 20); b = _boxV(b, w, h, 20);
  b = _boxH(b, w, h, 20); b = _boxV(b, w, h, 20);
  var out = new Float32Array(w * h), min = 1e9, max = -1e9;
  for (i = 0; i < out.length; i++) {
    out[i] = L[i] - b[i];
    if (out[i] < min) min = out[i];
    if (out[i] > max) max = out[i];
  }
  var range = (max - min) || 1;
  for (i = 0; i < out.length; i++) out[i] = ((out[i] - min) / range) * 255;
  return out;
}

function grayNormalize(g) {
  var min = 255, max = 0, i;
  for (i = 0; i < g.length; i++) { if (g[i] < min) min = g[i]; if (g[i] > max) max = g[i]; }
  var range = (max - min) || 1, out = new Float32Array(g.length);
  for (i = 0; i < g.length; i++) out[i] = ((g[i] - min) / range) * 255;
  return out;
}

function blur(g, w, h) {
  var out = new Float32Array(w * h);
  for (var y = 1; y < h - 1; y++) {
    for (var x = 1; x < w - 1; x++) {
      var i = y * w + x;
      out[i] = (g[i] * 4 + g[i - 1] + g[i + 1] + g[i - w] + g[i + w]) / 8;
    }
  }
  return out;
}

function cornerScore(g, w, h) {
  var s = new Float32Array(w * h);
  for (var y = 2; y < h - 2; y++) {
    for (var x = 2; x < w - 2; x++) {
      var i = y * w + x, c = g[i], m = 0;
      var p = [g[i - 1], g[i + 1], g[i - w], g[i + w],
               g[i - w - 1], g[i - w + 1], g[i + w - 1], g[i + w + 1]];
      for (var k = 0; k < 8; k++) {
        var d = Math.abs(p[k] - c);
        if (d > m) m = d;
      }
      s[i] = m;
    }
  }
  return s;
}

function pickCorners(score, w, h, maxN, minScore) {
  var R = 8, cands = [], x, y;
  for (y = PATCH; y < h - PATCH; y += 2) {
    for (x = PATCH; x < w - PATCH; x += 2) {
      var i = y * w + x, v = score[i];
      if (v < minScore) continue;
      var best = true;
      for (var dy = -R; dy <= R && best; dy += 2)
        for (var dx = -R; dx <= R; dx += 2) {
          if (dx === 0 && dy === 0) continue;
          if (score[i + dy * w + dx] > v) { best = false; break; }
        }
      if (best) cands.push([v, x, y]);
    }
  }
  cands.sort(function (a, b) { return b[0] - a[0]; });
  var keep = [], used = new Uint8Array(w * h);
  for (var k = 0; k < cands.length && keep.length < maxN; k++) {
    var cx = cands[k][1], cy = cands[k][2];
    if (used[cy * w + cx]) continue;
    keep.push({ x: cx, y: cy, s: cands[k][0] });
    for (var yy = cy - 6; yy <= cy + 6; yy += 2)
      for (var xx = cx - 6; xx <= cx + 6; xx += 2)
        if (yy >= 0 && xx >= 0 && yy < h && xx < w) used[yy * w + xx] = 1;
  }
  return keep;
}

function describe(g, w, h, x, y) {
  var d = new Uint32Array(8);
  for (var b = 0; b < 256; b++) {
    var p1 = pattern[b * 2], p2 = pattern[b * 2 + 1];
    if (g[(y + p1[1]) * w + (x + p1[0])] < g[(y + p2[1]) * w + (x + p2[0])])
      d[b >> 5] |= (1 << (b & 31));
  }
  return d;
}

/* استخراج ویژگی از تصویر خاکستری (دو بار محو برای پایداری توصیف‌گر) */
function extract(gray, w, h, maxFeatures) {
  var sm = blur(blur(gray, w, h), w, h);
  var score = cornerScore(sm, w, h);
  var pts = pickCorners(score, w, h, maxFeatures || 220, 16);
  if (pts.length < 50) pts = pickCorners(score, w, h, maxFeatures || 220, 9);
  var desc = [];
  for (var i = 0; i < pts.length; i++) desc.push(describe(sm, w, h, pts[i].x, pts[i].y));
  return { pts: pts, desc: desc, w: w, h: h };
}

function dist(a, b) {
  var d = 0;
  for (var i = 0; i < 8; i++) d += popcount(a[i] ^ b[i]);
  return d;
}

function matchFeatures(sceneDesc, refDesc, maxD, ratio) {
  maxD = maxD || 72; ratio = ratio || 0.86;
  var pairs = [];
  for (var i = 0; i < sceneDesc.length; i++) {
    var b1 = 1e9, b2 = 1e9, bi = -1;
    for (var j = 0; j < refDesc.length; j++) {
      var d = dist(sceneDesc[i], refDesc[j]);
      if (d < b1) { b2 = b1; b1 = d; bi = j; }
      else if (d < b2) b2 = d;
    }
    if (b1 <= maxD && b1 < b2 * ratio) pairs.push([i, bi, b1]);
  }
  return pairs;
}

/* هوموگرافی با DLT برای ≥۴ نقطه (نرمال‌سازی‌شده) */
function homography4(p) {
  var n = p.length, i;
  function norm(ix, iy) {
    var mx = 0, my = 0, k;
    for (k = 0; k < n; k++) { mx += p[k][ix]; my += p[k][iy]; }
    mx /= n; my /= n;
    var sd = 0;
    for (k = 0; k < n; k++) {
      var dx = p[k][ix] - mx, dy = p[k][iy] - my;
      sd += Math.sqrt(dx * dx + dy * dy);
    }
    sd /= n;
    var s = Math.SQRT2 / (sd || 1);
    return [s, 0, -s * mx, 0, s, -s * my, 0, 0, 1];
  }
  var T1 = norm(0, 1), T2 = norm(2, 3);
  function tr(T, x, y) { return [T[0] * x + T[2], T[4] * y + T[5]]; }

  var A = [];
  for (i = 0; i < n; i++) {
    var s1 = tr(T1, p[i][0], p[i][1]), s2 = tr(T2, p[i][2], p[i][3]);
    var x = s1[0], y = s1[1], X = s2[0], Y = s2[1];
    A.push([x, y, 1, 0, 0, 0, -X * x, -X * y, -X]);
    A.push([0, 0, 0, x, y, 1, -Y * x, -Y * y, -Y]);
  }
  var rows = A.length;
  for (var c = 0; c < 8; c++) {
    var piv = -1, mx2 = 1e-12, r;
    for (r = c; r < rows; r++) if (Math.abs(A[r][c]) > mx2) { mx2 = Math.abs(A[r][c]); piv = r; }
    if (piv < 0) return null;
    var tmp = A[c]; A[c] = A[piv]; A[piv] = tmp;
    var inv = 1 / A[c][c];
    for (var c2 = c; c2 < 9; c2++) A[c][c2] *= inv;
    for (var r2 = 0; r2 < rows; r2++) {
      if (r2 === c) continue;
      var f = A[r2][c];
      if (f === 0) continue;
      for (var c3 = c; c3 < 9; c3++) A[r2][c3] -= f * A[c][c3];
    }
  }
  var hh = [];
  for (i = 0; i < 8; i++) hh.push(-A[i][8]);
  var Hn = [hh[0], hh[1], hh[2], hh[3], hh[4], hh[5], hh[6], hh[7], 1];

  function inv3(T) {
    var sx = T[0], tx = T[2], sy = T[4], ty = T[5];
    return [1 / sx, 0, -tx / sx, 0, 1 / sy, -ty / sy, 0, 0, 1];
  }
  function mul3(A3, B3) {
    var C = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (var r3 = 0; r3 < 3; r3++)
      for (var c4 = 0; c4 < 3; c4++) {
        var v = 0;
        for (var k = 0; k < 3; k++) v += A3[r3 * 3 + k] * B3[k * 3 + c4];
        C[r3 * 3 + c4] = v;
      }
    return C;
  }
  var H = mul3(inv3(T2), mul3(Hn, T1));
  var wgt = H[8] || 1, out = [];
  for (i = 0; i < 8; i++) out.push(H[i] / wgt);
  return out;
}

function applyH(H, x, y) {
  var w = H[6] * x + H[7] * y + 1;
  if (Math.abs(w) < 1e-9) return null;
  return [(H[0] * x + H[1] * y + H[2]) / w, (H[3] * x + H[4] * y + H[5]) / w];
}

/* آیا هوموگرافی، قاب مرجع را به یک چهارضلعی «معقول» در صحنه می‌برد؟ */
function quadSane(H, rw, rh, sw, sh) {
  var c = [[0, 0], [rw, 0], [rw, rh], [0, rh]];
  var q = [], i;
  for (i = 0; i < 4; i++) {
    var p = applyH(H, c[i][0], c[i][1]);
    if (!p) return false;
    q.push(p);
  }
  // محدب بودن
  var sign = 0;
  for (i = 0; i < 4; i++) {
    var a = q[i], b = q[(i + 1) % 4], d = q[(i + 2) % 4];
    var cr = (b[0] - a[0]) * (d[1] - b[1]) - (b[1] - a[1]) * (d[0] - b[0]);
    if (Math.abs(cr) > 1e-6) {
      if (sign === 0) sign = cr > 0 ? 1 : -1;
      else if ((cr > 0 ? 1 : -1) !== sign) return false;
    }
  }
  // مساحت
  var area = 0;
  for (i = 0; i < 4; i++) {
    var p1 = q[i], p2 = q[(i + 1) % 4];
    area += p1[0] * p2[1] - p2[0] * p1[1];
  }
  area = Math.abs(area) / 2;
  var frameArea = sw * sh;
  if (area < frameArea * 0.02 || area > frameArea * 2.5) return false;
  // مرکز چهارضلعی تقریباً داخل قاب صحنه باشد
  var cx = (q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4;
  var cy = (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4;
  if (cx < -sw * 0.5 || cx > sw * 1.5 || cy < -sh * 0.5 || cy > sh * 1.5) return false;
  return true;
}

function ransac(pairs, scenePts, refPts, iters, tol) {
  iters = iters || 220; tol = tol || 5.0;
  var best = null, bestN = 0, n = pairs.length;
  if (n < 10) return null;
  var rnd = mulberry32(42);
  for (var it = 0; it < iters; it++) {
    var sample = [], guard = 0;
    while (sample.length < 4 && guard++ < 40) {
      var idx = Math.floor(rnd() * n), dup = false;
      for (var s = 0; s < sample.length; s++) if (sample[s] === idx) dup = true;
      if (!dup) sample.push(idx);
    }
    if (sample.length < 4) continue;
    var p4 = sample.map(function (i) {
      var sp = scenePts[pairs[i][0]], rp = refPts[pairs[i][1]];
      // homography4: ستون ۰,۱ → ستون ۲,۳؛ پس مرجع را بده تا به صحنه نگاشت شود
      return [rp.x, rp.y, sp.x, sp.y];
    });
    var H = homography4(p4);
    if (!H) continue;
    var cnt = 0;
    for (var k = 0; k < n; k++) {
      var sp2 = scenePts[pairs[k][0]], rp2 = refPts[pairs[k][1]];
      var pr = applyH(H, rp2.x, rp2.y);
      if (!pr) continue;
      var dx = pr[0] - sp2.x, dy = pr[1] - sp2.y;
      if (dx * dx + dy * dy < tol * tol) cnt++;
    }
    if (cnt > bestN) { bestN = cnt; best = H; }
  }
  if (!best || bestN < 12) return null;
  return { H: best, inliers: bestN, total: n };
}

/* تشخیص یک فریم در برابر «هر یک» از سطوح مرجع (هرمی) */
function detectFrame(sceneFeat, refModel) {
  var levels = refModel.levels || [refModel];
  var best = null;
  for (var li = 0; li < levels.length; li++) {
    var lv = levels[li];
    var pairs = matchFeatures(sceneFeat.desc, lv.desc);
    if (pairs.length < 10) continue;
    var r = ransac(pairs, sceneFeat.pts, lv.pts);
    if (!r) continue;
    if (!quadSane(r.H, lv.w, lv.h, sceneFeat.w, sceneFeat.h)) continue;
    var ratio = r.inliers / Math.min(sceneFeat.desc.length, lv.desc.length);
    var score = r.inliers + ratio * 100;
    if (!best || score > best.score) {
      best = { H: r.H, inliers: r.inliers, total: r.total, ratio: ratio, level: li, score: score };
    }
  }
  if (!best) return null;
  if (best.inliers < 16 || best.ratio < 0.08) return null;
  return best;
}

/* سریال‌سازی هرم مرجع برای ذخیره در JSON استند */
function serialize(levelsArr) {
  var levels = levelsArr.map(function (f) {
    return {
      w: f.w, h: f.h,
      pts: f.pts.map(function (p) { return [p.x, p.y]; }),
      desc: f.desc.map(function (d) { return Array.prototype.slice.call(d); })
    };
  });
  return { v: 2, levels: levels };
}

function deserialize(o) {
  if (!o) return null;
  var src = o.levels ? o.levels : [o];
  var levels = src.map(function (lv) {
    if (!lv || !lv.pts) return null;
    return {
      w: lv.w, h: lv.h,
      pts: lv.pts.map(function (p) { return { x: p[0], y: p[1] }; }),
      desc: lv.desc.map(function (a) { return Uint32Array.from(a); })
    };
  }).filter(Boolean);
  return levels.length ? { levels: levels } : null;
}

return {
  PATCH: PATCH,
  grayFromRGBA: grayFromRGBA,
  grayNormalize: grayNormalize,
  illumNorm: illumNorm,
  extract: extract,
  matchFeatures: matchFeatures,
  homography4: homography4,
  applyH: applyH,
  quadSane: quadSane,
  ransac: ransac,
  detectFrame: detectFrame,
  serialize: serialize,
  deserialize: deserialize,
  mulberry32: mulberry32
};
});
