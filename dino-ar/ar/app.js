/* بازیکا — استند زندهٔ عمودی (بدون دوربین)
   دایناسورها داخل قاب استند راه می‌روند؛ ضربه = صدا + پاپ‌آپ
   داده از data/stands/<id>.json خوانده می‌شود (CMS) */
(function () {
'use strict';

var BUILD = '2026-10-11a';
window.__BAZIKA_INIT = true;

var scene, camera, renderer, raycaster;
var dinos = [];
var STAND = null;
var loadedCount = 0, totalChars = 0;

var stage = document.getElementById('stage');
var frame = document.getElementById('frame');

function diag(msg) {
  var el = document.getElementById('diag');
  if (el) el.textContent = msg;
}
diag('بازیکا ' + BUILD);
window.addEventListener('error', function (e) { diag('⚠ ' + (e.message || 'خطای ناشناخته')); });

// ── خواندن دادهٔ استند از CMS ──
fetch('../data/stands/index.json')
  .then(function (r) { return r.ok ? r.json() : null; })
  .then(function (idx) {
    if (!idx || !idx.stands || !idx.stands.length) {
      diag('⚠ هنوز استندی تعریف نشده — از بخش مدیریت اضافه کنید');
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
  initScene(st);
}

// ── صحنهٔ سه‌بعدی داخل قاب ──
function initScene(st) {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, 1, 0.1, 120);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  stage.appendChild(renderer.domElement);
  sizeRenderer();

  if (st.background) {
    new THREE.TextureLoader().load(st.background, function (t) {
      t.encoding = THREE.sRGBEncoding;
      scene.background = t;
    });
  } else {
    scene.background = new THREE.Color(0x1a2418);
  }

  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  var dl = new THREE.DirectionalLight(0xfff2d0, 1.0);
  dl.position.set(2, 5, 3);
  scene.add(dl);

  var ground = new THREE.Mesh(
    new THREE.CircleGeometry(9, 48),
    new THREE.MeshLambertMaterial({ color: 0x7a5a38 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  scene.add(ground);

  totalChars = (st.characters || []).length;
  (st.characters || []).forEach(loadChar);
  if (!totalChars) diag('⚠ این استند شخصیتی ندارد');

  raycaster = new THREE.Raycaster();
  bindPointer();
  window.addEventListener('resize', sizeRenderer);

  setTimeout(function () {
    var h = document.getElementById('hint');
    if (h) h.style.opacity = '0';
  }, 6000);
  setTimeout(function () {
    if (loadedCount === 0 && totalChars > 0) diag('⚠ مدل‌ها بارگذاری نشدند — مسیر فایل‌ها/هاست را بررسی کنید');
  }, 6000);

  tick();
}

function sizeRenderer() {
  var w = frame.clientWidth || 320;
  var h = frame.clientHeight || 480;
  renderer.setSize(w, h);
  if (camera) {
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}

function loadChar(c) {
  var loader = new THREE.GLTFLoader();
  loader.load(c.model, function (gltf) {
    var root = gltf.scene;
    root.scale.setScalar(c.scale || 0.16);
    root.position.set(c.x || 0, 0, c.z || 0.8);
    root.rotation.y = c.face || 0;
    scene.add(root);

    var d = { data: c, root: root, dir: c.face || 0, speed: 0.1 + Math.random() * 0.08, pause: 0 };
    if (gltf.animations && gltf.animations.length) {
      var walk = null;
      gltf.animations.forEach(function (a) { if (!walk && /walk/i.test(a.name || '')) walk = a; });
      d.mixer = new THREE.AnimationMixer(root);
      d.mixer.clipAction(walk || gltf.animations[0]).play();
    }
    dinos.push(d);
    loadedCount++;
    diag('🦖 ' + loadedCount + '/' + totalChars);
    if (loadedCount === totalChars) setTimeout(function () { diag(''); }, 2500);
  }, undefined, function () {
    diag('⚠ خطا در بارگذاری مدل ' + (c.name || c.model));
  });
}

// ── دوربین ثابتِ قاب + چرخش ملایم با کشیدن ──
var azimuth = 0, azimuthTarget = 0, downPos = null, moved = 0;
function bindPointer() {
  var el = renderer.domElement;
  el.style.touchAction = 'none';
  el.addEventListener('pointerdown', function (e) { downPos = [e.clientX, e.clientY]; moved = 0; });
  el.addEventListener('pointermove', function (e) {
    if (!downPos) return;
    var dx = e.clientX - downPos[0];
    moved = Math.max(moved, Math.abs(dx) + Math.abs(e.clientY - downPos[1]));
    azimuthTarget = Math.max(-0.5, Math.min(0.5, azimuthTarget + dx * 0.003));
    downPos = [e.clientX, e.clientY];
  });
  el.addEventListener('pointerup', function (e) {
    var wasTap = downPos && moved < 10;
    downPos = null;
    if (wasTap) tap(e);
  });
}

function tap(e) {
  var rect = renderer.domElement.getBoundingClientRect();
  var v = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  );
  raycaster.setFromCamera(v, camera);
  var best = null, bestDist = Infinity;
  dinos.forEach(function (d) {
    var hits = raycaster.intersectObject(d.root, true);
    if (hits.length && hits[0].distance < bestDist) { bestDist = hits[0].distance; best = d; }
  });
  if (best) openPopup(best.data);
}

var prev = performance.now();
function tick() {
  requestAnimationFrame(tick);
  var now = performance.now();
  var dt = Math.min(0.05, (now - prev) / 1000);
  prev = now;

  var B = (STAND && STAND.bounds) || { x: 1.15, zMin: 0.1, zMax: 1.5 };
  dinos.forEach(function (d) {
    if (d.mixer) d.mixer.update(dt);
    if (d.pause > 0) { d.pause -= dt; return; }
    d.root.rotation.y = d.dir;
    d.root.position.x += Math.sin(d.dir) * d.speed * dt;
    d.root.position.z += Math.cos(d.dir) * d.speed * dt;
    if (Math.abs(d.root.position.x) > B.x || d.root.position.z > B.zMax || d.root.position.z < B.zMin) {
      d.dir += Math.PI;
      d.pause = 0.4;
    } else if (Math.random() < 0.002) {
      d.pause = 1 + Math.random() * 2;
    }
  });

  azimuth += (azimuthTarget - azimuth) * 0.12;
  var R = 4.8, H = 1.5;
  camera.position.set(Math.sin(azimuth) * R, H, Math.cos(azimuth) * R);
  camera.lookAt(0, 0.95, 0);

  renderer.render(scene, camera);
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
  if (d.roar) {
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

function toast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.h);
  toast.h = setTimeout(function () { t.classList.remove('show'); }, 2600);
}

})();
