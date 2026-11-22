/* اسلایدر صفحه اصلی — بدون وابستگی خارجی
   قابلیت‌ها: پخش خودکار، توقف با تمرکز/هاور، کلیدهای جهت، سوایپ لمسی، نقاط ناوبری */
(function () {
  'use strict';

  var root = document.getElementById('heroSlider');
  if (!root) return;

  var track = root.querySelector('.slider-track');
  var slides = Array.prototype.slice.call(root.querySelectorAll('.slide'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('.slider-dot'));
  var counter = root.querySelector('.slider-count b');
  var prevBtn = root.querySelector('[data-prev]');
  var nextBtn = root.querySelector('[data-next]');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (slides.length < 2) {
    if (prevBtn) prevBtn.hidden = true;
    if (nextBtn) nextBtn.hidden = true;
    if (dots.length) dots.forEach(function (d) { d.hidden = true; });
    return;
  }

  var current = 0;
  var timer = null;
  var autoplay = root.getAttribute('data-autoplay') === '1' && !reduceMotion;
  var interval = Math.max(3, Number(root.getAttribute('data-interval')) || 6) * 1000;
  var paused = false;

  function faNum(n) {
    return String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[+d]; });
  }

  function show(index, opts) {
    opts = opts || {};
    var next = (index + slides.length) % slides.length;
    if (next === current && !opts.force) return;

    slides.forEach(function (s, i) {
      var on = i === next;
      s.classList.toggle('is-active', on);
      s.setAttribute('aria-hidden', on ? 'false' : 'true');
      // اسلایدهای غیرفعال برای screen reader و tab قابل دسترسی نباشند
      s.querySelectorAll('a, button').forEach(function (el) {
        if (on) { el.removeAttribute('tabindex'); } else { el.setAttribute('tabindex', '-1'); }
      });
    });
    dots.forEach(function (d, i) {
      d.classList.toggle('is-active', i === next);
      d.setAttribute('aria-selected', i === next ? 'true' : 'false');
    });
    if (counter) counter.textContent = faNum(next + 1);
    if (opts.direction) {
      root.classList.remove('dir-next', 'dir-prev');
      void root.offsetWidth;
      root.classList.add(opts.direction === 'prev' ? 'dir-prev' : 'dir-next');
    }
    current = next;
    restart();
  }

  function next() { show(current + 1, { direction: 'next' }); }
  function prev() { show(current - 1, { direction: 'prev' }); }

  function start() {
    if (!autoplay || paused || timer) return;
    timer = window.setInterval(function () {
      if (paused || document.hidden) return;
      next();
    }, interval);
  }
  function stop() {
    if (timer) { window.clearInterval(timer); timer = null; }
  }
  function restart() { stop(); start(); }
  function setPaused(v) {
    paused = v;
    root.classList.toggle('is-paused', v);
    if (v) stop(); else start();
  }

  /* کنترلها */
  if (nextBtn) nextBtn.addEventListener('click', next);
  if (prevBtn) prevBtn.addEventListener('click', prev);
  dots.forEach(function (d) {
    d.addEventListener('click', function () {
      var i = Number(d.getAttribute('data-goto')) || 0;
      show(i, { direction: i > current ? 'next' : 'prev' });
    });
  });

  /* صفحه‌کلید */
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { next(); }        // RTL: چپ = بعدی
    else if (e.key === 'ArrowRight') { prev(); }
    else if (e.key === 'Home') { show(0); }
    else if (e.key === 'End') { show(slides.length - 1); }
  });

  /* توقف هنگام هاور/تمرکز (دسترس‌پذیری) */
  root.addEventListener('mouseenter', function () { setPaused(true); });
  root.addEventListener('mouseleave', function () { setPaused(false); });
  root.addEventListener('focusin', function () { setPaused(true); });
  root.addEventListener('focusout', function (e) {
    if (!root.contains(e.relatedTarget)) setPaused(false);
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  /* سوایپ لمسی */
  var startX = 0, startY = 0, tracking = false;
  track.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    tracking = true;
    setPaused(true);
  }, { passive: true });

  track.addEventListener('touchend', function (e) {
    if (!tracking) return;
    tracking = false;
    var t = e.changedTouches[0];
    var dx = t.clientX - startX;
    var dy = t.clientY - startY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (dx < 0) next(); else prev();
    }
    setPaused(false);
  }, { passive: true });

  /* چرخ ماوس افقی روی دسکتاپ */
  var wheelLock = false;
  track.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
    if (Math.abs(e.deltaX) < 30 || wheelLock) return;
    wheelLock = true;
    if (e.deltaX > 0) next(); else prev();
    window.setTimeout(function () { wheelLock = false; }, 700);
  }, { passive: true });

  /* شروع */
  slides.forEach(function (s, i) {
    s.querySelectorAll('a, button').forEach(function (el) {
      if (i !== 0) el.setAttribute('tabindex', '-1');
    });
  });
  start();
})();
