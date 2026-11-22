/* صفحه اصلی — اسلایدر هیرو + انیمیشن‌های GSAP + کاروسل اخبار و بخشنامه‌ها
   - اگر GSAP یا ScrollTrigger بارگذاری نشود، همه محتوا سالم و بدون انیمیشن نمایش داده می‌شود
   - با prefers-reduced-motion انیمیشن‌ها و پخش خودکار غیرفعال می‌شوند */
(function () {
  'use strict';

  // jsdom و برخی محیط‌های قدیمی matchMedia ندارند؛ در آن حالت ScrollTrigger را فعال نمی‌کنیم
  var canMatchMedia = typeof window.matchMedia === 'function';
  var reduce = canMatchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var hasGsap = !!gsap;

  if (hasGsap && ScrollTrigger && canMatchMedia) {
    try { gsap.registerPlugin(ScrollTrigger); } catch (e) { ScrollTrigger = null; }
  } else {
    ScrollTrigger = null;
  }
  // محیط آزمایشی jsdom برای GSAP ناسازگار است و فقط تیکر را مصرف می‌کند
  if (hasGsap && !canMatchMedia) { try { gsap.ticker.sleep(); } catch (e) {} }

  var faDigits = '۰۱۲۳۴۵۶۷۸۹';
  function toFa(n) {
    return String(n).replace(/\d/g, function (d) { return faDigits[+d]; });
  }

  /* =====================================================================
     ۱) کاروسل اخبار و بخشنامه‌ها
     ===================================================================== */
  function setupCarousel(root) {
    var name = root.getAttribute('data-carousel');
    var track = root.querySelector('.carousel-track');
    var items = Array.prototype.slice.call(root.querySelectorAll('[data-carousel-item]'));
    if (!track || items.length < 2) return;

    var prev = document.querySelector('[data-carousel-prev="' + name + '"]');
    var next = document.querySelector('[data-carousel-next="' + name + '"]');
    var index = 0;

    function perView() {
      var w = window.innerWidth;
      if (w <= 640) return 1;
      if (w <= 1080) return 2;
      return 3;
    }
    function maxIndex() { return Math.max(0, items.length - perView()); }

    function update() {
      var step = items[0].getBoundingClientRect().width + 20;
      track.style.transform = 'translateX(' + (index * step) + 'px)';
      if (prev) prev.disabled = index <= 0;
      if (next) next.disabled = index >= maxIndex();
    }
    function go(delta) {
      index = Math.min(maxIndex(), Math.max(0, index + delta));
      update();
    }

    if (next) next.addEventListener('click', function () { go(1); });
    if (prev) prev.addEventListener('click', function () { go(-1); });

    var lock = false;
    root.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
      if (Math.abs(e.deltaX) < 28 || lock) return;
      lock = true;
      go(e.deltaX > 0 ? 1 : -1);
      setTimeout(function () { lock = false; }, 550);
    }, { passive: true });

    var startX = 0, dragging = false;
    root.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX; dragging = true;
    }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (!dragging) return;
      dragging = false;
      if (Math.abs(e.changedTouches[0].clientX - startX) > 45) go(e.changedTouches[0].clientX - startX > 0 ? 1 : -1);
    }, { passive: true });

    root.setAttribute('tabindex', '0');
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(1); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { go(-1); e.preventDefault(); }
    });

    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () { index = Math.min(index, maxIndex()); update(); }, 150);
    });

    update();
  }
  document.querySelectorAll('[data-carousel]').forEach(setupCarousel);

  /* =====================================================================
     ۲) اسلایدر هیرو
     ===================================================================== */
  function setupHero() {
    var root = document.getElementById('heroSlider');
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    var prev = root.querySelector('[data-prev]');
    var next = root.querySelector('[data-next]');
    var counter = root.querySelector('[data-count-current]');
    var autoplay = root.getAttribute('data-autoplay') === '1' && !reduce;
    var interval = Math.max(3, Number(root.getAttribute('data-interval')) || 6) * 1000;
    root.style.setProperty('--dot-duration', (interval / 1000) + 's');

    var current = 0;
    var timer = null;
    var paused = false;

    /* انیمیشن محتوای اسلاید فعال */
    function animateIn(slide) {
      if (!slide) return;
      var els = slide.querySelectorAll('[data-anim]');
      if (!hasGsap || reduce) {
        els.forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; });
        return;
      }
      try {
        gsap.killTweensOf(els);
        gsap.set(els, { opacity: 1, transform: 'none' });
        gsap.fromTo(slide.querySelector('[data-anim="kicker"]'),
          { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: 'power3.out' });
        gsap.fromTo(slide.querySelectorAll('[data-anim="line"]'),
          { yPercent: 110 }, { yPercent: 0, duration: .95, ease: 'power3.out', delay: .1 });
        gsap.fromTo(slide.querySelector('[data-anim="sub"]'),
          { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: 'power3.out', delay: .32 });
        gsap.fromTo(slide.querySelectorAll('[data-anim="actions"] > *'),
          { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .55, stagger: .09, ease: 'power3.out', delay: .46 });
      } catch (e) { /* بدون انیمیشن هم قابل استفاده است */ }
    }

    function show(index, opts) {
      opts = opts || {};
      if (!slides.length) return;
      var target = (index + slides.length) % slides.length;
      if (target === current && !opts.force) return;

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
        // restart نوار پیشرفت
        var bar = d.querySelector('span');
        if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
      });
      if (counter) counter.textContent = toFa(target + 1);
      current = target;
      animateIn(slides[target]);
      restart();
    }

    function step(dir) { show(current + dir); }

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
      d.addEventListener('click', function () {
        show(Number(d.getAttribute('data-goto')) || 0);
      });
    });

    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { step(1); }        // RTL: چپ = بعدی
      else if (e.key === 'ArrowRight') { step(-1); }
      else if (e.key === 'Home') { show(0); }
      else if (e.key === 'End') { show(slides.length - 1); }
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
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1);
      setPaused(false);
    }, { passive: true });

    // اسلاید اول
    animateIn(slides[0]);
    start();
  }
  setupHero();

  /* =====================================================================
     ۳) شمارش اعداد آمار
     ===================================================================== */
  var statsBox = document.querySelector('[data-stats]');
  if (statsBox) {
    var nums = statsBox.querySelectorAll('[data-num]');
    var runCount = function () {
      nums.forEach(function (el) {
        var target = Number(el.getAttribute('data-num')) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        if (!hasGsap || reduce) { el.textContent = toFa(target) + suffix; return; }
        var obj = { v: 0 };
        gsap.to(obj, {
          v: target, duration: 1.6, ease: 'power2.out',
          onUpdate: function () { el.textContent = toFa(Math.round(obj.v)) + suffix; }
        });
      });
    };
    // مقادیر را از ابتدا نمایش می‌دهیم تا اگر انیمیشن اجرا نشد صفر نماند
    nums.forEach(function (el) {
      el.textContent = toFa(Number(el.getAttribute('data-num')) || 0) + (el.getAttribute('data-suffix') || '');
    });
    if (hasGsap && ScrollTrigger && !reduce) {
      try {
        ScrollTrigger.create({ trigger: statsBox, start: 'top 88%', once: true, onEnter: runCount });
      } catch (e) { /* بی‌اثر */ }
    }
  }

  /* =====================================================================
     ۴) نمایش تدریجی بخش‌ها با اسکرول
     ===================================================================== */
  if (hasGsap && ScrollTrigger && !reduce) {
    try {
      document.querySelectorAll('[data-reveal]').forEach(function (el) {
        gsap.from(el, {
          y: 34, opacity: 0, duration: .9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
      });

      document.querySelectorAll('.prod-grid').forEach(function (grid) {
        gsap.from(grid.children, {
          y: 44, opacity: 0, duration: .85, stagger: .1, ease: 'power3.out',
          scrollTrigger: { trigger: grid, start: 'top 85%', once: true }
        });
      });

      document.querySelectorAll('[data-carousel]').forEach(function (car) {
        gsap.from(car.querySelectorAll('[data-carousel-item]'), {
          y: 32, opacity: 0, duration: .8, stagger: .08, ease: 'power3.out',
          scrollTrigger: { trigger: car, start: 'top 88%', once: true }
        });
      });

      document.querySelectorAll('.dark-list li').forEach(function (el, i) {
        gsap.from(el, {
          opacity: 0, x: 18, duration: .5, delay: (i % 4) * .06,
          scrollTrigger: { trigger: el, start: 'top 94%', once: true }
        });
      });

      gsap.to('.hero-bg', {
        yPercent: 7, ease: 'none',
        scrollTrigger: { trigger: '.hero-dark', start: 'top top', end: 'bottom top', scrub: true }
      });
    } catch (e) { /* در صورت خطا صفحه بدون انیمیشن نمایش داده می‌شود */ }
  }
})();
