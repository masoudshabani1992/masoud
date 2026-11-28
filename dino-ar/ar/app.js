/* بازیکا — استند زندهٔ عمودی (تصویر زنده، بدون دوربین/بدون سه‌بعدی)
   لایه‌ها: پس‌زمینه + برش‌های شفاف شخصیت‌ها که تکان می‌خورند
   ضربه روی هر شخصیت = صدا + پاپ‌آپ • داده از data/stands/<id>.json (CMS) */
(function () {
'use strict';

var BUILD = '2026-10-11e';
window.__BAZIKA_INIT = true;

var STAND = null;
var muted = localStorage.getItem('bazika-muted') === '1';

function diag(msg) {
  var el = document.getElementById('diag');
  if (el) el.textContent = msg;
}
diag('بازیکا ' + BUILD);
window.addEventListener('error', function (e) { diag('⚠ ' + (e.message || 'خطای ناشناخته')); });

var BZT = window.BZ_TOKEN || '';
function bzFetch(x, id) {
  var u = 'data.php?x=' + x + '&t=' + encodeURIComponent(BZT);
  if (id) u += '&id=' + encodeURIComponent(id);
  return fetch(u, { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : null; });
}
bzFetch('index')
  .then(function (idx) {
    if (!idx || !idx.stands || !idx.stands.length) {
      diag('⚠ هنوز استندی تعریف نشده — از admin.php اضافه کنید');
      return null;
    }
    var id = new URLSearchParams(location.search).get('stand');
    var found = null;
    idx.stands.forEach(function (s) { if (s.id === id) found = s; });
    if (!found) found = idx.stands[0];
    return bzFetch('stand', found.id);
  })
  .then(function (st) { if (st) start(st); })
  .catch(function (e) { diag('⚠ خطا در خواندن داده: ' + (e && e.message)); });

function start(st) {
  STAND = st;
  if (new URLSearchParams(location.search).get('via') === 'detect') {
    setTimeout(function () { toast('📷 استند با دوربین تشخیص داده شد 🦖'); }, 700);
  }
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
    img.className = 'layer char' + (c.anim && c.anim !== 'none' ? ' anim-' + c.anim : '');
    if (c.ox != null || c.oy != null) img.style.transformOrigin = (c.ox != null ? c.ox : 50) + '% ' + (c.oy != null ? c.oy : 100) + '%';
    img.src = c.image;
    img.alt = c.name || '';
    img.style.left = (c.left != null ? c.left : 10) + '%';
    img.style.top = (c.top != null ? c.top : 10) + '%';
    img.style.width = (c.width != null ? c.width : 50) + '%';
    img.style.animationDuration = (c.dur || 3) + 's';
    img.style.animationDelay = (-Math.random() * 2).toFixed(2) + 's';
    img.addEventListener('click', function (ev) { if (gameOn) hitChar(c, img, ev); else openPopup(c); });
    frame.appendChild(img);
  });

  var bv = document.getElementById('btnVideo');
  if (bv) bv.style.display = st.video ? '' : 'none';

  setTimeout(function () {
    var h = document.getElementById('hint');
    if (h) h.style.opacity = '0';
  }, 6000);
}

// ── بازی روپایی 🎮 : هر ضربه = یک روپایی به همان عضو ──
var gameOn = false, scores = {}, roundWon = false;
var btnGame = document.getElementById('btnGame');
var hud = document.getElementById('gameHud');
function faNum(n) { return String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }); }
function hudRender(win) {
  var total = 0, members = 0;
  for (var k in scores) { total += scores[k]; if (scores[k] > 0) members++; }
  var all = (STAND && STAND.characters) ? STAND.characters.length : 0;
  var t = '🎮 روپایی‌ها: ' + faNum(total) + ' — عضوها: ' + faNum(members) + ' از ' + faNum(all);
  if (win) t += '  🏆 آفرین! به همهٔ عضو‌ها روپایی زدی!';
  document.getElementById('hudTxt').textContent = t;
}
btnGame.addEventListener('click', function () {
  gameOn = !gameOn;
  scores = {}; roundWon = false;
  document.body.classList.toggle('gamemode', gameOn);
  btnGame.classList.toggle('on', gameOn);
  hud.classList.toggle('show', gameOn);
  if (gameOn) { toast('🎮 بازی شروع شد! روی هر عضو بزن تا یک روپایی بخورد'); hudRender(false); }
  else toast('🎮 بازی تمام شد');
});
function hitChar(c, img, ev) {
  scores[c.id] = (scores[c.id] || 0) + 1;
  img.classList.remove('bz-hit'); void img.offsetWidth; img.classList.add('bz-hit');
  if (!muted && c.roar) { try { var a = new Audio(c.roar); a.volume = 0.9; a.play().catch(function () {}); } catch (e) {} }
  var frame = document.getElementById('frame');
  var r = frame.getBoundingClientRect();
  var x = (ev && ev.clientX != null) ? ev.clientX - r.left : r.width / 2;
  var y = (ev && ev.clientY != null) ? ev.clientY - r.top : r.height / 2;
  var b = document.createElement('span'); b.className = 'bz-burst'; b.style.left = x + 'px'; b.style.top = y + 'px';
  var pl = document.createElement('span'); pl.className = 'bz-plus'; pl.textContent = '+۱'; pl.style.left = x + 'px'; pl.style.top = (y - 8) + 'px';
  frame.appendChild(b); frame.appendChild(pl);
  setTimeout(function () { b.remove(); pl.remove(); }, 800);
  var members = 0; for (var k in scores) if (scores[k] > 0) members++;
  var all = (STAND.characters || []).length;
  var win = false;
  if (all > 0 && members >= all && !roundWon) { roundWon = true; win = true; toast('🏆 آفرین! به همهٔ عضو‌ها روپایی زدی!'); }
  hudRender(win);
}

// ── ویدیوی استند 🎬 (فایل خودمیزبان یا لینک Drive) ──
var btnVideo = document.getElementById('btnVideo');
var videoSheet = document.getElementById('videoSheet');
btnVideo.addEventListener('click', function () {
  if (!STAND || !STAND.video) { toast('🎬 برای این استند ویدیویی تعریف نشده'); return; }
  var v = document.getElementById('vidEl'), f = document.getElementById('vidFrame');
  var m = /drive\.google\.com\/file\/d\/([^/?]+)|[?&]id=([^&]+)/.exec(STAND.video);
  if (/^https?:/.test(STAND.video) && m) {
    f.src = 'https://drive.google.com/file/d/' + (m[1] || m[2]) + '/preview';
    f.style.display = ''; v.style.display = 'none';
  } else {
    v.style.display = ''; f.style.display = 'none'; f.src = '';
    v.src = STAND.video; v.muted = muted;
    v.play().catch(function () {});
  }
  videoSheet.classList.add('open');
});
document.getElementById('videoClose').addEventListener('click', function () {
  var v = document.getElementById('vidEl'), f = document.getElementById('vidFrame');
  try { v.pause(); v.removeAttribute('src'); v.load(); } catch (e) {}
  f.src = ''; f.style.display = 'none';
  videoSheet.classList.remove('open');
});

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

// 🔉 صدای محیط استند (لوپ ملایم) — با اولین لمس شروع و با دکمهٔ صدا قطع می‌شود
var ambAudio = null;
function startAmbience() {
  if (!STAND || !STAND.ambience || muted || ambAudio) return;
  ambAudio = new Audio(STAND.ambience);
  ambAudio.loop = true;
  ambAudio.volume = 0.32;
  ambAudio.play().catch(function () { ambAudio = null; });
}
document.addEventListener('pointerdown', function () { startAmbience(); }, { once: true });

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
  if (ambAudio) { if (muted) ambAudio.pause(); else ambAudio.play().catch(function () {}); }
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


// ── بازدارنده‌های کپی 🛡 (محافظ نمایشی؛ قفل اصلی سمت سرور است) ──
try {
  document.addEventListener('contextmenu', function (e) {
    var t = e.target;
    if (t && (t.tagName === 'IMG' || (t.closest && t.closest('#frame')))) e.preventDefault();
  });
  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    if (e.ctrlKey && ['s', 'u', 'p'].indexOf(k) !== -1) e.preventDefault();
    if (e.key === 'F12') e.preventDefault();
    if (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].indexOf(k) !== -1) e.preventDefault();
  });
  var _w = window.innerWidth, _h = window.innerHeight;
  setInterval(function () {
    var dev = (window.outerWidth - window.innerWidth > 180) || (window.outerHeight - window.innerHeight > 220);
    var d = document.getElementById('diag');
    if (dev && d && !d.getAttribute('data-wm')) {
      d.setAttribute('data-wm', '1');
      d.textContent = '© بازیکا — نسخهٔ لایسنس‌دار';
    }
    _w = window.innerWidth; _h = window.innerHeight;
  }, 1200);
} catch (e) {}

})();
