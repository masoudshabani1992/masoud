/* global AFRAME, THREE */
/* استند دایناسوری — واقعیت افزوده:
   با اسکن استند، سه دایناسور سه‌بعدیِ بزرگ از استند جدا می‌شوند،
   در محیط واقعیِ اتاق قدم می‌زنند و با صدا غرش می‌کنند. */
(function () {
'use strict';

var SOUNDS = {
  big: '../sounds/roar-big.wav',
  mid: '../sounds/roar-mid.wav',
  pop: '../sounds/pop.wav'
};

/* scale برحسب «پهنای استند = 1» — بزرگ و واقعی در اتاق */
var SPECIES = [
  { key: 'trex',  scale: 2.2, speed: 0.55, yaw: -90, roars: ['big', 'mid'], home: { x: 0.0,  y: 0.95 } },
  { key: 'trice', scale: 1.5, speed: 0.42, yaw: 90,  roars: ['mid'],        home: { x: -1.1, y: 0.50 } },
  { key: 'stego', scale: 1.6, speed: 0.38, yaw: 90,  roars: ['mid', 'big'], home: { x: 1.1,  y: 0.55 } }
];

var BOUNDS = { x: 1.6, y0: 0.25, y1: 1.7 };

var muted = false;
var worldActive = false;
var globalScale = 1;
var yawTrim = 0;
var loadedModels = 0;
var spawnedCount = 0;

/* ---------- نوار تشخیص ---------- */
var diagEl;
var DIAG = { mind: '…', cam: '…', target: '—', models: '0/3', spawn: '0/3', parent: '…', pos: '', err: '' };
function diag() {
  if (!diagEl) return;
  diagEl.textContent = 'mind:' + DIAG.mind + ' cam:' + DIAG.cam +
    ' target:' + DIAG.target + ' models:' + DIAG.models + ' spawn:' + DIAG.spawn +
    ' par:' + DIAG.parent + (DIAG.pos ? ' [' + DIAG.pos + ']' : '') +
    (DIAG.err ? ' ⚠' + DIAG.err : '');
}

/* ---------- صدا ---------- */
var audioPool = {};
function playSound(name, vol) {
  if (muted) return;
  var a = audioPool[name];
  if (!a) { a = audioPool[name] = new Audio(SOUNDS[name]); }
  a.currentTime = 0;
  a.volume = vol == null ? 1 : vol;
  a.play().catch(function () {});
}

/* ---------- سایهٔ نرم ---------- */
var shadowTex = null;
function shadowTexture() {
  if (shadowTex) return shadowTex;
  var c = document.createElement('canvas');
  c.width = c.height = 128;
  var g = c.getContext('2d');
  var rg = g.createRadialGradient(64, 64, 6, 64, 64, 62);
  rg.addColorStop(0, 'rgba(20,10,5,0.45)');
  rg.addColorStop(0.7, 'rgba(20,10,5,0.20)');
  rg.addColorStop(1, 'rgba(20,10,5,0)');
  g.fillStyle = rg;
  g.fillRect(0, 0, 128, 128);
  shadowTex = new THREE.CanvasTexture(c);
  return shadowTex;
}

function rand(a, b) { return a + Math.random() * (b - a); }
function lerpAngle(a, b, t) {
  var d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * Math.min(1, t);
}
function easeOutBack(t) {
  var c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/* ---------- دایناسور سه‌بعدی بزرگ ----------
   زنجیره: outer(مکان روی زمینِ بیرون‌زده + heading)
            → up(ایستادن) → yaw(جهت مدل) → مدل GLB        */
AFRAME.registerComponent('dino', {
  schema: { index: { default: 0 } },

  init: function () {
    var self = this;
    this.sp = SPECIES[this.data.index];
    this.x = this.sp.home.x;
    this.y = this.sp.home.y;
    this.heading = rand(0, Math.PI * 2);
    this.desiredHeading = this.heading;
    this.state = 'idle';
    this.timer = rand(0.5, 2);
    this.roarTimer = rand(3, 8);
    this.spawnT = -1;
    this.spawnScale = 0.0001;
    this.currentAnim = null;
    this.action = null;

    this.up = new THREE.Object3D();
    this.up.rotation.x = -Math.PI / 2;
    this.yawN = new THREE.Object3D();
    this.up.add(this.yawN);
    this.el.object3D.add(this.up);

    this.shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false })
    );
    this.shadow.position.z = 0.002;
    this.shadow.material.opacity = 0;
    this.el.object3D.add(this.shadow);

    this.el.object3D.position.set(this.x, this.y, 0);
    this.applyYaw();
    this.applyScale();

    var loader = new THREE.GLTFLoader();
    loader.load('../models/' + ['Trex.glb', 'Triceratops.glb', 'Stegosaurus.glb'][this.data.index], function (gltf) {
      self.model = gltf.scene;
      self.clips = {};
      gltf.animations.forEach(function (c) {
        var n = (c.name || '').toLowerCase();
        ['walk', 'run', 'idle', 'attack', 'jump'].forEach(function (k) {
          if (n.indexOf(k) !== -1 && !self.clips[k]) self.clips[k] = c;
        });
      });
      self.mixer = new THREE.AnimationMixer(self.model);
      self.mixer.addEventListener('finished', function () {
        self.currentAnim = null;
        if (self.state === 'roar') {
          self.state = 'idle';
          self.timer = rand(1, 3);
          self.playAnim('idle');
        }
      });
      self.yawN.add(self.model);
      self.applyScale();
      self.loaded = true;
      loadedModels++;
      DIAG.models = loadedModels + '/3';
      diag();
      if (self.spawnT >= 0) self.playAnim('idle');
    }, undefined, function () {
      DIAG.err = 'model:' + self.data.index;
      diag();
    });

    // اطمینان از اتصال به گراف صحنه
    setTimeout(function () {
      if (!self.el.object3D.parent) {
        var t = document.querySelector('#world');
        if (t && t.object3D) { t.object3D.add(self.el.object3D); DIAG.parent = 'manual'; }
        else DIAG.parent = 'no!';
      } else {
        DIAG.parent = 'ok';
      }
      diag();
    }, 800);
  },

  applyYaw: function () {
    this.yawN.rotation.y = THREE.MathUtils.degToRad(this.sp.yaw + yawTrim);
  },

  applyScale: function () {
    var s = Math.max(0.0001, this.sp.scale * globalScale * this.spawnScale);
    this.yawN.scale.setScalar(s);
    this.shadow.scale.set(this.sp.scale * 1.5 * globalScale * this.spawnScale, this.sp.scale * 1.0 * globalScale * this.spawnScale, 1);
  },

  spawn: function () {
    if (this.spawnT >= 0) return;
    this.spawnT = 0;
    spawnedCount++;
    DIAG.spawn = spawnedCount + '/3';
    diag();
    playSound('pop', 0.9);
  },

  playAnim: function (name, loop) {
    if (loop == null) loop = true;
    if (!this.mixer) return;
    var clip = this.clips[name] || this.clips.idle;
    if (!clip || this.currentAnim === name) return;
    this.currentAnim = name;
    if (this.action) this.action.fadeOut(0.3);
    var a = this.mixer.clipAction(clip);
    a.reset();
    a.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
    a.clampWhenFinished = !loop;
    a.fadeIn(0.3);
    a.play();
    this.action = a;
  },

  tick: function (time, dtMs) {
    var dt = Math.min(0.05, dtMs / 1000);

    // تله‌متری نخستین دایناسور
    if (this.data.index === 0 && this.el.object3D.parent) {
      this.telT = (this.telT || 0) + dt;
      if (this.telT > 1) {
        this.telT = 0;
        try {
          var v = new THREE.Vector3();
          this.el.object3D.getWorldPosition(v);
          var nd = v.clone().project(this.el.sceneEl.camera);
          DIAG.pos = v.x.toFixed(1) + ',' + v.y.toFixed(1) + ',' + v.z.toFixed(1) +
            '>' + nd.x.toFixed(1) + ',' + nd.y.toFixed(1) + ',' + nd.z.toFixed(1);
          diag();
        } catch (e) {}
      }
    }

    // خودترمیمی اسپان
    if (worldActive && this.spawnT < 0) this.spawn();

    if (this.spawnT >= 0 && this.spawnT < 1) {
      this.spawnT = Math.min(1, this.spawnT + dt / 0.8);
      this.spawnScale = Math.max(0.0001, easeOutBack(this.spawnT));
      this.shadow.material.opacity = 0.9 * this.spawnT;
      this.applyScale();
    }

    if (!this.loaded || !worldActive) return;
    if (this.mixer) this.mixer.update(dt);

    if (this.state === 'idle') {
      this.timer -= dt;
      this.roarTimer -= dt;
      if (this.roarTimer <= 0) {
        this.roarTimer = rand(5, 12);
        if (this.clips.attack || this.clips.jump) {
          this.state = 'roar';
          this.desiredHeading = 0;
          playSound(this.sp.roars[Math.floor(Math.random() * this.sp.roars.length)], 1);
          this.playAnim(this.clips.attack ? 'attack' : 'jump', false);
        }
      } else if (this.timer <= 0) {
        this.dest = { x: rand(-BOUNDS.x, BOUNDS.x), y: rand(BOUNDS.y0, BOUNDS.y1) };
        this.state = 'walk';
        this.playAnim(this.clips.run ? 'run' : 'walk');
      }
    } else if (this.state === 'walk') {
      var dx = this.dest.x - this.x, dy = this.dest.y - this.y;
      var d = Math.hypot(dx, dy);
      if (d < 0.08) {
        this.state = 'idle';
        this.timer = rand(1, 3.5);
        this.playAnim('idle');
      } else {
        var v2 = this.sp.speed;
        this.x += (dx / d) * v2 * dt;
        this.y += (dy / d) * v2 * dt;
        this.desiredHeading = Math.atan2(-dx, dy);
      }
    } else if (this.state === 'roar') {
      this.desiredHeading = 0;
    }

    this.heading = lerpAngle(this.heading, this.desiredHeading, 3 * dt);
    this.el.object3D.rotation.z = this.heading;
    this.el.object3D.position.set(this.x, this.y, 0);
  }
});

/* ---------- رویدادها و رابط ---------- */
var statusEl;

function mapCamErr(e) {
  var n = e && e.name;
  if (n === 'NotAllowedError' || n === 'SecurityError') {
    return '🚫 دسترسی دوربین مسدود است؛ در تنظیمات گوشی دسترسی دوربین را بدهید.';
  }
  if (n === 'NotFoundError' || n === 'OverconstrainedError') return '📷 دوربین پشت پیدا نشد.';
  if (n === 'NotReadableError') return '⚠️ دوربین درگیر اپ دیگری است.';
  return '⚠️ خطای دوربین: ' + (n || 'نامشخص');
}

function showFatal(msg) {
  if (!statusEl) return;
  statusEl.className = 'chip scan';
  statusEl.textContent = msg + ' ';
  var btn = document.createElement('button');
  btn.textContent = '🔄 تلاش دوباره';
  btn.className = 'retry';
  btn.addEventListener('click', function () { location.reload(); });
  statusEl.appendChild(btn);
}

function setStatus(mode) {
  if (!statusEl) return;
  if (mode === 'scan') {
    statusEl.textContent = '📷 استند را جلوی دوربین بگیرید…';
    statusEl.className = 'chip scan';
  } else if (mode === 'found') {
    statusEl.textContent = '🦖 دایناسورها در محیط شما آزاد شدند!';
    statusEl.className = 'chip found';
  } else if (mode === 'load') {
    statusEl.textContent = '⏳ در حال آماده‌سازی…';
    statusEl.className = 'chip scan';
  }
}

window.addEventListener('DOMContentLoaded', function () {
  statusEl = document.querySelector('#status');
  diagEl = document.querySelector('#diag');
  var targetEl = document.querySelector('#target');
  var sceneEl = document.querySelector('a-scene');

  setStatus('load');
  diag();

  fetch('../assets/targets.mind').then(function (r) {
    DIAG.mind = r.ok ? 'ok' : '404';
    diag();
  }).catch(function () { DIAG.mind = 'err'; diag(); });

  sceneEl.addEventListener('loaded', function () { setStatus('scan'); });

  window.addEventListener('error', function (ev) {
    DIAG.err = (ev.message || 'script').slice(0, 40);
    diag();
  });

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function (st) {
      DIAG.cam = 'ok';
      diag();
      st.getTracks().forEach(function (t) { t.stop(); });
    }).catch(function (e) {
      DIAG.cam = 'no';
      diag();
      showFatal(mapCamErr(e));
    });
  } else {
    DIAG.cam = 'none';
    diag();
    showFatal('📷 مرورگر این دستگاه از دوربین AR پشتیبانی نمی‌کند؛ «Android System WebView» یا کروم را به‌روزرسانی کنید.');
  }

  targetEl.addEventListener('targetFound', function () {
    worldActive = true;
    DIAG.target = 'found';
    diag();
    setStatus('found');
    document.querySelectorAll('.dino').forEach(function (el, i) {
      setTimeout(function () {
        if (el.components.dino) el.components.dino.spawn();
      }, i * 700);
    });
  });
  targetEl.addEventListener('targetLost', function () {
    worldActive = false;
    DIAG.target = 'lost';
    diag();
    setStatus('scan');
  });

  document.querySelector('#btnSound').addEventListener('click', function () {
    muted = !muted;
    this.textContent = muted ? '🔇' : '🔊';
  });
  document.querySelector('#btnSmaller').addEventListener('click', function () {
    globalScale = Math.max(0.4, globalScale * 0.8);
    applyAll();
  });
  document.querySelector('#btnBigger').addEventListener('click', function () {
    globalScale = Math.min(2.5, globalScale * 1.25);
    applyAll();
  });
  document.querySelector('#btnYaw').addEventListener('click', function () {
    yawTrim = (yawTrim + 90) % 360;
    applyAll();
  });
  function applyAll() {
    document.querySelectorAll('.dino').forEach(function (el) {
      var c = el.components.dino;
      if (!c) return;
      c.applyYaw();
      c.applyScale();
    });
  }

  document.querySelector('#btnHelp').addEventListener('click', function () {
    document.querySelector('#help').classList.toggle('open');
  });

  var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isTouch) document.querySelector('#desktopHint').style.display = 'flex';
});

})();
