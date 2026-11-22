/* کوشا خودرو — حرکت و تعامل صفحه اصلی
   اسلایدر هیرو + کاروسل‌های افقی + انیمیشن‌های ورودی
   بدون GSAP هم همه‌چیز سالم و قابل استفاده است. */
(function () {
  'use strict';

  var canMM = typeof window.matchMedia === 'function';
  var reduce = canMM && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;

  if (gsap && ScrollTrigger && canMM) {
    try { gsap.registerPlugin(ScrollTrigger); } catch (e) { ScrollTrigger = null; }
  } else {
    ScrollTrigger = null;
  }
  if (gsap && !canMM) { try { gsap.ticker.sleep(); } catch (e) { /* noop */ } }

  var FA = '۰۱۲۳۴۵۶۷۸۹';
  function toFa(n) {
    return String(n).replace(/\d/g, function (d) { return FA[+d]; });
  }
  function gapOf(el) {
    var cs = window.getComputedStyle(el);
    var g = parseFloat(cs.columnGap || cs.gap || '20');
    return isNaN(g) ? 20 : g;
  }

  /* =====================================================================
     کاروسل افقی (خودروها / اخبار / هر کاروسل دیگری)
     ===================================================================== */
  function setupCarousel(root) {
    var name = root.getAttribute('data-carousel');
    var track = root.querySelector('.hscroll-track') || root.querySelector('.carousel-track');
    var items = Array.prototype.slice.call(root.querySelectorAll('[data-carousel-item]'));
    if (!track || items.length < 2) return;

    var prev = document.querySelector('[data-carousel-prev="' + name + '"]');
    var next = document.querySelector('[data-carousel-next="' + name + '"]');
    var index = 0;

    function visCount() {
      var iw = items[0].getBoundingClientRect().width;
      var vw = root.getBoundingClientRect().width;
      if (!iw) return 1;
      return Math.max(1, Math.round((vw + gapOf(track)) / (iw + gapOf(track))));
    }
    function maxIndex() { return Math.max(0, items.length - visCount()); }

    function update() {
      index = Math.min(index, maxIndex());
      var gap = gapOf(track);
      var step = items[0].getBoundingClientRect().width + gap;
      // RTL: حرکت به سمت مثبت X، آیتم‌ها را به سمت راست می‌برد
      track.style.transform = 'translateX(' + (index * step) + 'px)';
      if (prev) prev.disabled = index <= 0;
      if (next) next.disabled = index >= maxIndex();
    }
    function go(d) {
      index = Math.min(maxIndex(), Math.max(0, index + d));
      update();
    }

    if (next) next.addEventListener('click', function () { go(1); });
    if (prev) prev.addEventListener('click', function () { go(-1); });

    // ویل پد افقی
    var lock = false;
    root.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      if (Math.abs(e.deltaX) < 24 || lock) return;
      lock = true;
      go(e.deltaX > 0 ? 1 : -1);
      setTimeout(function () { lock = false; }, 520);
    }, { passive: true });

    // کشیدن با انگشت
    var sx = 0, sy = 0, dragging = false;
    root.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; dragging = true;
    }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (!dragging) return;
      dragging = false;
      var dx = e.changedTouches[0].clientX - sx;
      var dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy) * 1.3) go(dx > 0 ? 1 : -1);
    }, { passive: true });

    root.setAttribute('tabindex', '0');
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(1); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { go(-1); e.preventDefault(); }
    });

    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(update, 160);
    });
    // تصاویر پس از بارگذاری ابعاد را عوض می‌کنند
    window.addEventListener('load', update);

    update();
  }
  document.querySelectorAll('[data-carousel]').forEach(setupCarousel);

  /* =====================================================================
     اسلایدر هیرو
     ===================================================================== */
  function setupHero() {
    var root = document.getElementById('heroSlider');
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    if (!slides.length) return;

    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    var prev = root.querySelector('[data-prev]');
    var next = root.querySelector('[data-next]');
    var counter = root.querySelector('[data-count-current]');
    var autoplay = root.getAttribute('data-autoplay') === '1' && !reduce;
    var interval = Math.max(3, Number(root.getAttribute('data-interval')) || 6) * 1000;
    root.style.setProperty('--dot-duration', (interval / 1000) + 's');

    var current = 0, timer = null, paused = false;

    function animateIn(slide) {
      if (!slide) return;
      var els = slide.querySelectorAll('[data-anim]');
      if (!gsap || reduce) {
        els.forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; });
        return;
      }
      try {
        gsap.killTweensOf(els);
        gsap.set(els, { opacity: 1, transform: 'none' });
        gsap.fromTo(slide.querySelector('[data-anim="kicker"]'),
          { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .7, ease: 'power3.out' });
        gsap.fromTo(slide.querySelector('[data-anim="line"]'),
          { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.05, ease: 'power3.out', delay: .08 });
        gsap.fromTo(slide.querySelector('[data-anim="sub"]'),
          { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: 'power3.out', delay: .3 });
        gsap.fromTo(slide.querySelectorAll('[data-anim="actions"] > *'),
          { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .1, ease: 'power3.out', delay: .44 });
      } catch (e) { /* بدون انیمیشن هم کار می‌کند */ }
    }

    function show(n, force) {
      var target = (n + slides.length) % slides.length;
      if (target === current && !force) return;
      slides.forEach(function (s, i) {
        var on = i === target;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-hidden', on ? 'false' : 'true');
        s.querySelectorAll('a, button').forEach(function (el) {
          if (on) el.removeAttribute('tabindex'); else el.setAttribute('tabindex', '-1');
        });
      });
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === target);
        d.setAttribute('aria-selected', i === target ? 'true' : 'false');
        var bar = d.querySelector('span');
        if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
      });
      if (counter) counter.textContent = toFa(target + 1);
      current = target;
      animateIn(slides[target]);
      restart();
    }
    function step(d) { show(current + d); }

    function start() {
      if (!autoplay || paused || timer || slides.length < 2) return;
      timer = window.setInterval(function () {
        if (paused || document.hidden) return;
        step(1);
      }, interval);
    }
    function stop() { if (timer) { window.clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }
    function setPaused(v) {
      paused = v;
      root.classList.toggle('is-paused', v);
      if (v) stop(); else start();
    }

    if (next) next.addEventListener('click', function () { step(1); });
    if (prev) prev.addEventListener('click', function () { step(-1); });
    dots.forEach(function (d) {
      d.addEventListener('click', function () { show(Number(d.getAttribute('data-goto')) || 0); });
    });

    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') step(1);       // RTL: چپ = بعدی
      else if (e.key === 'ArrowRight') step(-1);
      else if (e.key === 'Home') show(0);
      else if (e.key === 'End') show(slides.length - 1);
    });

    root.addEventListener('mouseenter', function () { setPaused(true); });
    root.addEventListener('mouseleave', function () { setPaused(false); });
    root.addEventListener('focusin', function () { setPaused(true); });
    root.addEventListener('focusout', function (e) {
      if (!root.contains(e.relatedTarget)) setPaused(false);
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    var sx = 0, sy = 0, tracking = false;
    root.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; tracking = true;
      setPaused(true);
    }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      var dx = e.changedTouches[0].clientX - sx;
      var dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1);
      setPaused(false);
    }, { passive: true });

    animateIn(slides[0]);
    start();
  }
  setupHero();

  /* =====================================================================
     شمارش آمار
     ===================================================================== */
  var statsBox = document.querySelector('[data-stats]');
  if (statsBox) {
    var nums = statsBox.querySelectorAll('[data-num]');
    var runCount = function () {
      nums.forEach(function (el) {
        var target = Number(el.getAttribute('data-num')) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        if (!gsap || reduce) { el.textContent = toFa(target) + suffix; return; }
        var obj = { v: 0 };
        gsap.to(obj, {
          v: target, duration: 1.7, ease: 'power2.out',
          onUpdate: function () { el.textContent = toFa(Math.round(obj.v)) + suffix; }
        });
      });
    };
    nums.forEach(function (el) {
      el.textContent = toFa(Number(el.getAttribute('data-num')) || 0) + (el.getAttribute('data-suffix') || '');
    });
    if (gsap && ScrollTrigger && !reduce) {
      try {
        ScrollTrigger.create({ trigger: statsBox, start: 'top 90%', once: true, onEnter: runCount });
      } catch (e) { /* بی‌اثر */ }
    }
  }

  /* =====================================================================
     نمایش تدریجی
     ===================================================================== */
  if (gsap && ScrollTrigger && !reduce) {
    try {
      document.querySelectorAll('[data-reveal]').forEach(function (el) {
        gsap.from(el, {
          y: 36, opacity: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true }
        });
      });
      document.querySelectorAll('[data-carousel]').forEach(function (car) {
        gsap.from(car.querySelectorAll('[data-carousel-item]'), {
          y: 30, opacity: 0, duration: .85, stagger: .07, ease: 'power3.out',
          scrollTrigger: { trigger: car, start: 'top 90%', once: true }
        });
      });
      document.querySelectorAll('.crc-row').forEach(function (row, i) {
        gsap.from(row, {
          opacity: 0, y: 18, duration: .7, delay: (i % 3) * .05, ease: 'power2.out',
          scrollTrigger: { trigger: row, start: 'top 94%', once: true }
        });
      });
      gsap.to('.hero-media img', {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    } catch (e) { /* صفحه بدون انیمیشن نمایش داده می‌شود */ }
  }
})();
