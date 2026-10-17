<?php
/* بازیکا — تشخیص استند با دوربین 📷 (بدون QR) */
require __DIR__ . '/../bz_guard.php';
bz_session_secure();
session_start();
bz_headers();
bz_guard();
$BZ_TOK = bz_token();
?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<title>بازیکا — اسکن استند با دوربین</title>
<style>
  html, body { margin: 0; height: 100%; background: #0b0f14; color: #f2ede0; font-family: Tahoma, "Segoe UI", sans-serif; overflow: hidden; }
  #wrap { position: fixed; inset: 0; display: flex; flex-direction: column; }
  #view { flex: 1; position: relative; display: flex; align-items: center; justify-content: center; background: #000; }
  #cam { max-width: 100%; max-height: 100%; display: block; }
  #bar { padding: 12px 16px calc(14px + env(safe-area-inset-bottom)); text-align: center; background: rgba(11,15,20,.94); border-top: 1px solid #223; }
  #status { font-size: 15px; line-height: 1.9; min-height: 30px; }
  #hint { font-size: 12px; opacity: .75; margin-top: 4px; }
  .btnrow { display: flex; gap: 10px; justify-content: center; margin-top: 10px; }
  button, .btn { font-family: inherit; font-size: 14px; padding: 10px 18px; border-radius: 12px; border: 0; background: #1e7a46; color: #fff; cursor: pointer; text-decoration: none; display: inline-block; }
  button.ghost { background: #223; }
  #scrim { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 14px; background: rgba(6,9,13,.92); padding: 24px; text-align: center; z-index: 5; }
  #scrim.hidden { display: none; }
  #found { position: absolute; inset: 0; display: none; align-items: center; justify-content: center; z-index: 6; pointer-events: none; }
  #found.on { display: flex; }
  #found .card { background: rgba(20, 92, 50, .95); border: 2px solid #7fe0a8; padding: 18px 26px; border-radius: 18px; font-size: 20px; font-weight: bold; animation: pop .35s ease; }
  @keyframes pop { from { transform: scale(.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  #brandmini { position: absolute; top: 10px; right: 12px; height: 34px; opacity: .9; z-index: 4; }
</style>
</head>
<body>
<div id="wrap">
  <div id="view">
    <img id="brandmini" src="../assets/logo.png" alt="" onerror="this.remove()" />
    <canvas id="cam" width="480" height="640"></canvas>
    <div id="scrim">
      <div style="font-size:44px">📷</div>
      <p id="scrimMsg" style="max-width:420px;line-height:2">این صفحه <b>داخل سایت</b> استند را می‌شناسد: دکمه را بزن و دوربین را روی <b>عکس استند</b> بگیر تا قفل شود و استند زنده باز شود.<br><span style="opacity:.8;font-size:13px">(برای باز شدن سایت با ضربهٔ گوشی به استند، برچسب NFC ببندید — راهنمای بسته)</span></p>
      <button id="btnStart">فعال‌سازی دوربین</button>
      <a class="btn ghost" href="../index.php">بازگشت بدون دوربین</a>
    </div>
    <div id="found"><div class="card">🦖 استند پیدا شد!</div></div>
  </div>
  <div id="bar">
    <div id="status">برای شروع، دکمهٔ فعال‌سازی دوربین را بزنید</div>
    <div id="hint">💡 استند را کامل داخل کادر جا بدهید، صاف و رو به دوربین نگه دارید و نور کافی بتابانید</div>
    <div id="stats" style="font:11px monospace;opacity:.55;margin-top:4px" dir="ltr"></div>
  </div>
</div>

<script src="feat.js?v=1"></script>
<script>
window.BZ_TOKEN = <?php echo json_encode($BZ_TOK); ?>;
</script>
<script>
(function () {
'use strict';
var F = window.BZFeat;
var camCanvas = document.getElementById('cam');
var camCtx = camCanvas.getContext('2d', { willReadFrequently: true });
var video = document.createElement('video');
video.setAttribute('playsinline', '');
video.muted = true;

var models = [];            // [{id, title, model}]
var running = false;
var confirmHits = {};       // id -> {n, t}
var FOUND = false;

var statusEl = document.getElementById('status');
var statsEl = document.getElementById('stats');
var scrim = document.getElementById('scrim');
var scrimMsg = document.getElementById('scrimMsg');
var foundEl = document.getElementById('found');

function setStatus(t) { statusEl.textContent = t; }

function loadRefs() {
  return fetch('data.php?x=refs&t=' + encodeURIComponent(window.BZ_TOKEN || ''), { credentials: 'same-origin' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      if (!j || !j.stands || !j.stands.length) {
        scrimMsg.innerHTML = '⚠ هنوز برای هیچ استندی مرجع تشخیص ساخته نشده است.<br>از پنل مدیریت استند را ذخیره کنید تا مرجع ساخته شود.';
        return;
      }
      j.stands.forEach(function (s) {
        var m = F.deserialize(s.ref);
        if (m) models.push({ id: s.id, title: s.title, model: m });
      });
      if (!models.length) scrimMsg.textContent = '⚠ مرجع تشخیص پیدا نشد.';
    })
    .catch(function () { scrimMsg.textContent = '⚠ خطا در خواندن مرجع‌ها'; });
}

function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    scrimMsg.innerHTML = '❌ مرورگر شما دوربین نمی‌دهد. از کروم/سافاری جدید و آدرس <b>https</b> استفاده کنید.<br>راه جایگزین: همان کد QR روی استند را اسکن کنید.';
    return;
  }
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
    .then(function (stream) {
      video.srcObject = stream;
      return video.play();
    })
    .then(function () {
      scrim.classList.add('hidden');
      running = true;
      setStatus('🔎 دنبال استند می‌گردم…');
      setTimeout(loop, 200);
    })
    .catch(function (e) {
      scrimMsg.innerHTML = '❌ دسترسی به دوربین ممکن نشد (' + (e && e.name ? e.name : 'خطا') + ').<br>مجوز دوربین را در مرورگر بدهید یا از کد QR استفاده کنید.';
    });
}

function drawQuad(H, lvw, lvh, ok) {
  var c = [[0, 0], [lvw, 0], [lvw, lvh], [0, lvh]];
  camCtx.save();
  camCtx.beginPath();
  for (var i = 0; i < 4; i++) {
    var p = F.applyH(H, c[i][0], c[i][1]);
    if (!p) { camCtx.restore(); return; }
    if (i === 0) camCtx.moveTo(p[0], p[1]); else camCtx.lineTo(p[0], p[1]);
  }
  camCtx.closePath();
  camCtx.lineWidth = 4;
  camCtx.strokeStyle = ok ? '#34d17b' : 'rgba(255,214,90,.9)';
  camCtx.stroke();
  camCtx.fillStyle = ok ? 'rgba(52,209,123,.14)' : 'rgba(255,214,90,.06)';
  camCtx.fill();
  camCtx.restore();
}

function loop() {
  if (!running) return;
  var t0 = performance.now();
  if (video.readyState >= 2 && video.videoWidth) {
    var w = 480, h = Math.round(480 * video.videoHeight / video.videoWidth);
    if (camCanvas.width !== w || camCanvas.height !== h) { camCanvas.width = w; camCanvas.height = h; }
    camCtx.drawImage(video, 0, 0, w, h);
    var img = camCtx.getImageData(0, 0, w, h);
    var gray = F.grayFromRGBA(img.data, w, h);
    var scene = F.extract(gray, w, h, 300);

    var best = null, bestPairs = 0;
    for (var i = 0; i < models.length; i++) {
      var hit = F.detectFrame(scene, models[i].model);
      if (hit && (!best || hit.score > best.hit.score)) best = { m: models[i], hit: hit };
    }
    if (statsEl) statsEl.textContent = 'feat:' + scene.pts.length + '  inl:' + (best ? best.hit.inliers : 0) + '  lvl:' + (best ? best.hit.level : '-') + '  ms:' + Math.round(performance.now() - t0);
    if (best) {
      var lv = best.m.model.levels[best.hit.level];
      drawQuad(best.hit.H, lv.w, lv.h, false);
      registerHit(best.m);
    } else {
      setStatus('🔎 دنبال استند می‌گردم…');
      decayHits();
    }
  }
  var dt = performance.now() - t0;
  setTimeout(loop, Math.max(90, 260 - dt));
}

function registerHit(m) {
  var now = Date.now();
  var rec = confirmHits[m.id] || { n: 0, t: 0 };
  rec.n = (now - rec.t < 2600) ? rec.n + 1 : 1;
  rec.t = now;
  confirmHits[m.id] = rec;
  setStatus('🎯 «' + m.title + '»؟ تأیید… (' + Math.min(rec.n, 2) + '/2)');
  if (rec.n >= 2) found(m);
}

function decayHits() {
  var now = Date.now();
  for (var k in confirmHits) if (now - confirmHits[k].t > 2600) delete confirmHits[k];
}

function found(m) {
  if (FOUND) return;
  FOUND = true;
  running = false;
  foundEl.classList.add('on');
  try { navigator.vibrate && navigator.vibrate([60, 40, 120]); } catch (e) {}
  try {
    var a = new (window.AudioContext || window.webkitAudioContext)();
    var o = a.createOscillator(), g = a.createGain();
    o.frequency.value = 880; g.gain.value = 0.08;
    o.connect(g); g.connect(a.destination);
    o.start(); o.stop(a.currentTime + 0.18);
  } catch (e) {}
  if (video.srcObject) video.srcObject.getTracks().forEach(function (t) { t.stop(); });
  setTimeout(function () { location.href = 'index.php?stand=' + encodeURIComponent(m.id) + '&via=detect'; }, 900);
}

document.getElementById('btnStart').addEventListener('click', function () {
  loadRefs().then(startCamera);
});
})();
</script>
</body>
</html>
