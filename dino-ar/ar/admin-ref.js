(function () {
  if (!window.BZFeat || !document.getElementById('ref_json')) return;
  var form = document.querySelector('form[enctype]');
  if (!form) return;
  function loadImg(src) {
    return new Promise(function (res, rej) {
      var im = new Image();
      im.onload = function () { res(im); };
      im.onerror = rej;
      im.src = src;
    });
  }
  function canvasToGray(img, w) {
    var h = Math.max(80, Math.round(w * img.naturalHeight / img.naturalWidth));
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0, w, h);
    var d = g.getImageData(0, 0, w, h);
    return { gray: window.BZFeat.grayFromRGBA(d.data, w, h), w: w, h: h };
  }
  function bgSource() {
    var f = form.querySelector('input[name="f_background"]');
    if (f && f.files && f.files[0]) return URL.createObjectURL(f.files[0]);
    var hid = form.querySelector('input[name="background"]');
    if (hid && hid.value && /\.(webp|png|jpe?g)$/i.test(hid.value)) return hid.value;
    return null;
  }
  form.addEventListener('submit', function (ev) {
    var stat = document.getElementById('refStat');
    var hid = document.getElementById('ref_json');
    if (hid.value) return; // قبلاً ساخته شده
    var src = bgSource();
    if (!src) { if (stat) stat.textContent = '(بدون مرجع تشخیص ذخیره شد)'; return; }
    ev.preventDefault();
    if (stat) stat.textContent = '⏳ در حال ساخت مرجع تشخیص دوربین…';
    loadImg(src).then(function (img) {
      var levels = [160, 240, 340, 480, 640].map(function (w) {
        var g = canvasToGray(img, w);
        return window.BZFeat.extract(g.gray, g.w, g.h, 300);
      });
      hid.value = JSON.stringify(window.BZFeat.serialize(levels));
      if (stat) stat.textContent = '✅ مرجع تشخیص ساخته شد';
      setTimeout(function () { form.submit(); }, 60);
    }).catch(function () {
      if (stat) stat.textContent = '(مرجع تشخیص ساخته نشد — ذخیره بدون آن)';
      form.submit();
    });
  });
})();
