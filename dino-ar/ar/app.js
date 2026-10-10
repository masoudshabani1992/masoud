/* بازیکا — استند زندهٔ دایناسورها (بدون دوربین / بدون AR)
   صحنهٔ سه‌بعدی: استند + سه دایناسور متحرک؛ ضربه = صدا + پاپ‌آپ */
(function () {
'use strict';

var IDS = ['trex', 'triceratops', 'stegosaurus'];
var FILES = { trex: 'Trex.glb', triceratops: 'Triceratops.glb', stegosaurus: 'Stegosaurus.glb' };
var HOME = { trex: [0, 0, 0.9], triceratops: [-1.8, 0, 0.3], stegosaurus: [1.8, 0, 0.3] };
var FACE = { trex: 0.0, triceratops: 0.7, stegosaurus: -0.7 };
var SCALE = 0.16;
var BOUNDS = { x: 2.4, zMin: -0.7, zMax: 1.8 };

var scene, camera, renderer, raycaster;
var dinos = [];
var loadedCount = 0;
var THEME = null;
var BUILD = '2026-10-10f';

window.addEventListener('error', function (e) { diag('⚠ ' + (e.message || 'خطای ناشناخته')); });

try { init(); } catch (e) { diag('⚠ خطا در راه‌اندازی نمایش سه‌بعدی: ' + (e && e.message)); }

function diag(msg) {
  var el = document.getElementById('diag');
  if (el) el.textContent = msg;
}

function init() {
  window.__BAZIKA_INIT = true;
  diag('بازیکا ' + BUILD);
  setTimeout(function () { if (loadedCount === 0) diag('⚠ مدل‌ها بارگذاری نشدند — مسیر فایل‌ها/هاست را بررسی کنید'); }, 6000);
  var wrap = document.getElementById('stage');
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 120);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  wrap.appendChild(renderer.domElement);
  if (!renderer.getContext()) {
    diag('⚠ مرورگر شما گرافیک سه‌بعدی را پشتیبانی نمی‌کند');
    return;
  }

  // پس‌زمینهٔ جنگل
  new THREE.TextureLoader().load('../content/dino/images/bg.webp', function (t) {
    t.encoding = THREE.sRGBEncoding;
    scene.background = t;
  });

  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  var dl = new THREE.DirectionalLight(0xfff2d0, 1.0);
  dl.position.set(2, 5, 3);
  scene.add(dl);

  // زمین خاکی
  var ground = new THREE.Mesh(
    new THREE.CircleGeometry(9, 48),
    new THREE.MeshLambertMaterial({ color: 0x7a5a38 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  scene.add(ground);

  // تختهٔ استند (طرح چاپی) پشت دایناسورها
  new THREE.TextureLoader().load('../content/dino/images/stand-art.webp', function (t) {
    t.encoding = THREE.sRGBEncoding;
    var ratio = (t.image && t.image.width) ? t.image.height / t.image.width : 1.4;
    var w = 3.6;
    var board = new THREE.Mesh(
      new THREE.PlaneGeometry(w, w * ratio),
      new THREE.MeshBasicMaterial({ map: t })
    );
    board.position.set(0, (w * ratio) / 2 - 0.15, -1.9);
    scene.add(board);
  });

  IDS.forEach(loadDino);

  raycaster = new THREE.Raycaster();
  bindPointer();

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // راهنمای اولیه چند ثانیه
  setTimeout(function () {
    var h = document.getElementById('hint');
    if (h) h.style.opacity = '0';
  }, 6000);

  tick();
}

function loadDino(id) {
  var loader = new THREE.GLTFLoader();
  loader.load('../models/' + FILES[id], function (gltf) {
    var root = gltf.scene;
    root.scale.setScalar(SCALE);
    root.position.fromArray(HOME[id]);
    root.rotation.y = FACE[id];
    scene.add(root);

    var d = { id: id, root: root, dir: FACE[id], speed: 0.12 + Math.random() * 0.1, pause: 0 };
    if (gltf.animations && gltf.animations.length) {
      var walk = null;
      gltf.animations.forEach(function (c) {
        if (!walk && /walk/i.test(c.name || '')) walk = c;
      });
      var clip = walk || gltf.animations[0];
      d.mixer = new THREE.AnimationMixer(root);
      d.mixer.clipAction(clip).play();
    }
    dinos.push(d);
    loadedCount++;
    diag('🦖 ' + loadedCount + '/3');
    if (loadedCount === 3) setTimeout(function () { diag(''); }, 2500);
  }, undefined, function () {
    diag('⚠ خطا در بارگذاری مدل ' + id);
  });
}

// ── دوربین: چرخش با کشیدن انگشت ──
var azimuth = 0, azimuthTarget = 0;
var downPos = null, moved = 0;

function bindPointer() {
  var el = renderer.domElement;
  el.style.touchAction = 'none';
  el.addEventListener('pointerdown', function (e) {
    downPos = [e.clientX, e.clientY];
    moved = 0;
  });
  el.addEventListener('pointermove', function (e) {
    if (!downPos) return;
    var dx = e.clientX - downPos[0];
    var dy = e.clientY - downPos[1];
    moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
    azimuthTarget += dx * 0.004;
    azimuthTarget = Math.max(-1.1, Math.min(1.1, azimuthTarget));
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
  if (best) openPopup(best.id);
}

// ── حلقهٔ انیمیشن ──
var clock = { t: 0 };
var prev = performance.now();

function tick() {
  requestAnimationFrame(tick);
  var now = performance.now();
  var dt = Math.min(0.05, (now - prev) / 1000);
  prev = now;

  // راه‌رفتن آرام در محوطه
  dinos.forEach(function (d) {
    if (d.mixer) d.mixer.update(dt);
    if (d.pause > 0) { d.pause -= dt; return; }
    d.root.rotation.y = d.dir;
    d.root.position.x += Math.sin(d.dir) * d.speed * dt;
    d.root.position.z += Math.cos(d.dir) * d.speed * dt;
    if (Math.abs(d.root.position.x) > BOUNDS.x ||
        d.root.position.z > BOUNDS.zMax ||
        d.root.position.z < BOUNDS.zMin) {
      d.dir += Math.PI; // دور بزند
      d.pause = 0.4;
    } else if (Math.random() < 0.002) {
      d.pause = 1 + Math.random() * 2; // گاهی بایستد
    }
  });

  // نرم شدن چرخش دوربین
  azimuth += (azimuthTarget - azimuth) * 0.12;
  var R = 5.6, H = 1.9;
  camera.position.set(Math.sin(azimuth) * R, H, Math.cos(azimuth) * R);
  camera.lookAt(0, 1.0, 0);

  renderer.render(scene, camera);
}

// ── محتوای موضوع (info.json) ──
fetch('../content/dino/info.json')
  .then(function (r) { return r.ok ? r.json() : null; })
  .then(function (j) {
    if (!j) return;
    THEME = j;
    if (j.aboutText) document.getElementById('infoText').textContent = j.aboutText;
  })
  .catch(function () {});

function toast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.h);
  toast.h = setTimeout(function () { t.classList.remove('show'); }, 2600);
}

// ▶ پخش صدای راوی
var narAudio = null;
var btnPlay = document.getElementById('btnPlay');
btnPlay.addEventListener('click', function () {
  if (narAudio) {
    narAudio.pause(); narAudio = null;
    btnPlay.innerHTML = '▶<span>صدای راوی</span>';
    return;
  }
  if (!THEME || !THEME.narration) { toast('🎙️ صدای راوی به‌زودی اضافه می‌شود'); return; }
  narAudio = new Audio('../content/dino/' + THEME.narration);
  narAudio.onended = function () { narAudio = null; btnPlay.innerHTML = '▶<span>صدای راوی</span>'; };
  narAudio.onerror = function () { toast('فایل صدا پیدا نشد'); narAudio = null; };
  narAudio.play().catch(function () { toast('پخش صدا ممکن نشد'); narAudio = null; });
  btnPlay.innerHTML = '⏸<span>توقف</span>';
});

// ℹ متن اطلاعات
document.getElementById('btnInfo').addEventListener('click', function () {
  document.getElementById('infoPanel').classList.add('open');
});

// ضربه روی هر دایناسور → پاپ‌آپ + صدا
function openPopup(id) {
  var d = null;
  ((THEME && THEME.dinosaurs) || []).forEach(function (x) { if (x.id === id) d = x; });
  if (!d) return;
  document.getElementById('popupImg').src = '../content/dino/' + d.image;
  document.getElementById('popupName').textContent = d.name || '';
  var rows = '';
  [['📖 معنای نام', d.meaning], ['🕰️ دورهٔ زیست', d.era], ['🗺️ موقعیت', d.region], ['🍽️ رژیم غذایی', d.diet], ['📏 جثه', d.size]].forEach(function (r) {
    if (r[1]) rows += '<li><b>' + r[0] + ':</b> ' + r[1] + '</li>';
  });
  document.getElementById('popupRows').innerHTML = rows;
  document.getElementById('popupFact').textContent = d.desc || '';
  document.getElementById('popup').classList.add('open');
  if (d.roar) {
    try { var a = new Audio('../content/dino/' + d.roar); a.volume = 0.9; a.play().catch(function () {}); } catch (e) {}
  }
}
document.getElementById('popupClose').addEventListener('click', function () {
  document.getElementById('popup').classList.remove('open');
});

})();
