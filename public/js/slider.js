/* اسلایدر صفحه اصلی — بدون وابستگی خارجی
   قابلیت‌ها: پخش خودکار، توقف با هاور/فوکوس، کلیدهای جهت، سوایپ لمسی، نقاط ناوبری */
(function () {
  'use strict';

  var root = document.getElementById('heroSlider');
  if (!root) return;

  var slides = Array.prototype.slice.call(root.querySelectorAll('.slide'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('.slider-dot'));
  var counter = root.querySelector('.slider-count b');
  var prevBtn = root.querySelector('[data-prev]');
  var nextBtn = root.querySelector('[data-next]');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (slides.length < 2) {
    if (prevBtn) prevBtn.hidden = true;
    if (nextBtn) nextBtn.hidden = true;
    dots.forEach(function (d) { d.hidden = true; });
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

  function show(index) {
    var next = (index + slides.length) % slides.length;
    if (next === current) return;

    slides.forEach(function (s, i) {
      var on = i === next;
      s.classList.toggle('is-active', on);
      s.setAttribute('aria-hidden', on ? 'false' : 'true');
      s.querySelectorAll('a, button').forEach(function (el) {
        if (on) { el.removeAttribute('tabindex'); } else { el.setAttribute('tabindex', '-1'); }
      });
    });
    dots.forEach(function (d, i) {
      d.classList.toggle('is-active', i === next);
      d.setAttribute('aria-selected', i === next ? 'true' : 'false');
      var fill = d.querySelector('span');
      if (fill) { fill.style.animation = 'none'; void fill.offsetWidth; fill.style.animation = ''; }
    });
    if (counter) counter.textContent = faNum(next + 1);
    current = next;
    restart();
  }

  function goNext() { show(current + 1); }
  function goPrev() { show(current - 1); }

  function start() {
    if (!autoplay || paused || timer) return;
    timer = window.setInterval(function () {
      if (paused || document.hidden) return;
      goNext();
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

  if (prevBtn) prevBtn.addEventListener('click', goPrev);
  if (nextBtn) nextBtn.addEventListener('click', goNext);
  dots.forEach(function (d, i) {
    d.addEventListener('click', function () { show(i); });
  });

  root.addEventListener('mouseenter', function () { setPaused(true); });
  root.addEventListener('mouseleave', function () { setPaused(false); });
  root.addEventListener('focusin', function () { setPaused(true); });
  root.addEventListener('focusout', function () { setPaused(false); });

  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { goNext(); }        // در RTL چپ = بعدی
    else if (e.key === 'ArrowRight') { goPrev(); }
    else return;
    e.preventDefault();
  });

  // سوایپ لمسی
  var startX = null;
  root.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
    setPaused(true);
  }, { passive: true });
  root.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 45) { dx < 0 ? goNext() : goPrev(); }
    startX = null;
    setPaused(false);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  start();
})();
