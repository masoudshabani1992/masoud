/* بازیکا — استند زندهٔ عمودی (تصویر زنده، بدون دوربین/بدون سه‌بعدی)
   لایه‌ها: پس‌زمینه + برش‌های شفاف شخصیت‌ها که تکان می‌خورند
   ضربه روی هر شخصیت = صدا + پاپ‌آپ • داده از data/stands/<id>.json (CMS) */
(function () {
'use strict';

var BUILD = '2026-10-11b';
window.__BAZIKA_INIT = true;

var STAND = null;
var muted = localStorage.getItem('bazika-muted') === '1';

function diag(msg) {
  var el = document.getElementById('diag');
  if (el) el.textContent = msg;
}
diag('بازیکا ' + BUILD);
window.addEventListener('error', function (e) { diag('⚠ ' + (e.message || 'خطای ناشناخته')); });

fetch('../data/stands/index.json')
  .then(function (r) { return r.ok ? r.json() : null; })
  .then(function (idx) {
    if (!idx || !idx.stands || !idx.stands.length) {
      diag('⚠ هنوز استندی تعریف نشده — از admin.php اضافه کنید');
      return null;
    }
    var id = new URLSearchParams(location.search).get('stand');
    var found = null;
    idx.stands.forEach(function (s) { if (s.id === id) found = s; });
    if (!found) found = idx.stands[0];
    return fetch('../data/stands/' + found.id + '.json').then(function (r) { return r.json(); });
  })
  .then(function (st) { if (st) start(st); })
  .catch(function (e) { diag('⚠ خطا در خواندن داده: ' + (e && e.message)); });

function start(st) {
  STAND = st;
  if (st.title) {
    var t = document.getElementById('standTitle');
    if (t) t.textContent = st.title;
    document.title = 'بازیکا — ' + st.title;
  }
  if (st.aboutText) document.getElementById('infoText').textContent = st.aboutText;

  var frame = document.getElementById('frame');

  // پس‌زمینه
  if (st.background) {
    var bg = document.createElement('img');
    bg.className = 'layer bg';
    bg.src = st.background;
    bg.alt = '';
    bg.onload = function () {
      if (bg.naturalWidth && bg.naturalHeight) {
        frame.style.aspectRatio = bg.naturalWidth + ' / ' + bg.naturalHeight;
      }
    };
    frame.appendChild(bg);
  }

  // شخصیت‌ها (به ترتیب z)
  var chars = (st.characters || []).slice();
  chars.sort(function (a, b) { return (a.z || 0) - (b.z || 0); });
  chars.forEach(function (c) {
    var img = document.createElement('img');
    img.className = 'layer char anim-' + (c.anim || 'bob');
    img.src = c.image;
    img.alt = c.name || '';
    img.style.left = (c.left != null ? c.left : 10) + '%';
    img.style.top = (c.top != null ? c.top : 10) + '%';
    img.style.width = (c.width != null ? c.width : 50) + '%';
    img.style.animationDuration = (c.dur || 3) + 's';
    img.style.animationDelay = (-Math.random() * 2).toFixed(2) + 's';
    img.addEventListener('click', function () { openPopup(c); });
    frame.appendChild(img);
  });

  setTimeout(function () {
    var h = document.getElementById('hint');
    if (h) h.style.opacity = '0';
  }, 6000);
}

// ── پاپ‌آپ + صدا ──
function openPopup(d) {
  document.getElementById('popupImg').src = d.image || '';
  document.getElementById('popupName').textContent = d.name || '';
  var rows = '';
  [['📖 معنای نام', d.meaning], ['🕰️ دورهٔ زیست', d.era], ['🗺️ موقعیت', d.region], ['🍽️ رژیم غذایی', d.diet], ['📏 جثه', d.size]].forEach(function (r) {
    if (r[1]) rows += '<li><b>' + r[0] + ':</b> ' + r[1] + '</li>';
  });
  document.getElementById('popupRows').innerHTML = rows;
  document.getElementById('popupFact').textContent = d.desc || '';
  document.getElementById('popup').classList.add('open');
  if (!muted && d.roar) {
    try { var a = new Audio(d.roar); a.volume = 0.9; a.play().catch(function () {}); } catch (e) {}
  }
}
document.getElementById('popupClose').addEventListener('click', function () {
  document.getElementById('popup').classList.remove('open');
});

// ▶ صدای راوی
var narAudio = null;
var btnPlay = document.getElementById('btnPlay');
btnPlay.addEventListener('click', function () {
  if (narAudio) {
    narAudio.pause(); narAudio = null;
    btnPlay.innerHTML = '▶<span>صدای راوی</span>';
    return;
  }
  if (muted) { toast('🔇 صدا قطع است — اول دکمهٔ صدا را بزنید'); return; }
  if (!STAND || !STAND.narration) { toast('🎙️ صدای راوی برای این استند تعریف نشده'); return; }
  narAudio = new Audio(STAND.narration);
  narAudio.onended = function () { narAudio = null; btnPlay.innerHTML = '▶<span>صدای راوی</span>'; };
  narAudio.onerror = function () { toast('فایل صدا پیدا نشد'); narAudio = null; };
  narAudio.play().catch(function () { toast('پخش صدا ممکن نشد'); narAudio = null; });
  btnPlay.innerHTML = '⏸<span>توقف</span>';
});

document.getElementById('btnInfo').addEventListener('click', function () {
  document.getElementById('infoPanel').classList.add('open');
});

// 🔊 قطع/وصل همهٔ صداها (غرش‌ها + راوی)
var btnMute = document.getElementById('btnMute');
function muteUI() {
  btnMute.innerHTML = (muted ? '🔇<span>بی‌صدا</span>' : '🔊<span>صدا</span>');
}
muteUI();
btnMute.addEventListener('click', function () {
  muted = !muted;
  localStorage.setItem('bazika-muted', muted ? '1' : '0');
  if (muted && narAudio) { narAudio.pause(); narAudio = null; btnPlay.innerHTML = '▶<span>صدای راوی</span>'; }
  muteUI();
  toast(muted ? '🔇 همهٔ صداها قطع شد' : '🔊 صدا وصل شد');
});

function toast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.h);
  toast.h = setTimeout(function () { t.classList.remove('show'); }, 2600);
}

})();
