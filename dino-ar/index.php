<?php
/* بازیکا — صفحهٔ اصلی (محافظت‌شده) */
require __DIR__ . '/bz_guard.php';
bz_session_secure();
session_start();
bz_headers();
bz_guard();
$BZ_TOK = bz_token();
?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>بازیکا | استندهای زنده</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🦖</text></svg>" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;800&display=swap" rel="stylesheet" />
<style>
  :root { --ink:#101418; --bg:#f6f1e6; --card:#fffdf7; --green:#1e7a46; --amber:#ffb340; --line:#e5dcc8; }
  * { box-sizing: border-box; }
  body { margin:0; font-family:"Vazirmatn", Tahoma, sans-serif; background:var(--bg); color:var(--ink); line-height:1.9; }
  header {
    background:linear-gradient(rgba(9,42,26,.62), rgba(9,42,26,.82)), url('assets/jungle.jpg') center 35%/cover no-repeat;
    color:#fff; text-align:center; padding:34px 20px 54px; position:relative; overflow:hidden;
  }
  #brandLogo { height:76px; margin-bottom:6px; border-radius:22%; filter:drop-shadow(0 6px 14px rgba(0,0,0,.4)); }
  .crew { display:flex; justify-content:center; align-items:flex-end; gap:10px; margin-bottom:6px; }
  .crew img { filter:drop-shadow(0 10px 18px rgba(0,0,0,.45)); }
  .crew .c-trex { height:110px; animation:bob 3s ease-in-out infinite; }
  .crew .c-trice { height:70px; animation:bob 3.4s .3s ease-in-out infinite; }
  .crew .c-stego { height:76px; animation:bob 3.8s .6s ease-in-out infinite; }
  @keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
  h1 { font-size:clamp(24px,5vw,40px); font-weight:800; margin:10px 0 6px; }
  header p.sub { max-width:560px; margin:0 auto; font-size:15px; opacity:.92; }
  main { max-width:960px; margin:-30px auto 40px; padding:0 16px; }
  .grid { display:grid; gap:16px; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); }
  .card { background:var(--card); border:1px solid var(--line); border-radius:20px; padding:20px; box-shadow:0 6px 20px rgba(70,50,10,.07); text-align:center; }
  .card h3 { margin:0 0 6px; font-size:18px; color:var(--green); }
  .month { display:inline-block; background:#eaf6ee; color:var(--green); border-radius:999px; padding:2px 14px; font-size:12.5px; font-weight:700; margin-bottom:8px; }
  .qr { display:inline-block; background:#fff; padding:10px; border-radius:14px; border:1px solid var(--line); margin:8px 0; }
  .qr svg { display:block; width:150px; height:150px; }
  .btn { display:inline-block; margin:6px 4px 0; padding:10px 26px; border-radius:12px; background:var(--green); color:#fff; text-decoration:none; font-weight:700; font-size:14px; }
  .btn.ghost { background:transparent; color:var(--green); border:2px solid var(--green); }
  footer { text-align:center; padding:26px 16px 40px; font-size:13px; opacity:.75; }
  .tag { display:inline-block; background:#eaf6ee; color:var(--green); border-radius:999px; padding:3px 14px; font-size:12.5px; font-weight:700; margin:2px; }
</style>
</head>
<body>
<header>
  <img id="brandLogo" src="assets/logo.png" alt="بازیکا" onerror="this.remove()" />
  <div class="crew">
    <img class="c-trice" src="assets/sprites/trice.png" alt="" />
    <img class="c-trex" src="assets/sprites/trex.png" alt="" />
    <img class="c-stego" src="assets/sprites/stego.png" alt="" />
  </div>
  <h1>بازیکا — کلکسیون استندهای زنده</h1>
  <p class="sub">بدون نصب اپ و بدون دوربین؛ روی هر گوشی (اندروید/آیفون) باز کنید: شخصیت‌ها از داخل استند بیرون می‌آیند، قدم می‌زنند، تکان می‌خورند و با ضربه، صدا و داستان هر کدام پخش می‌شود!</p>
</header>

<main>
  <div id="stands" class="grid"><p style="text-align:center;width:100%">⏳ در حال بارگذاری استندها…</p></div>

  <div class="card" style="margin-top:16px">
    <h3>کالکسیون زنده 🧩</h3>
    <p>طرحی که در دست دارید شمارهٔ ۰۱ از یک کلکسیون زنده است؛ هر ماه با موضوعی تازه، پنجره‌ای جادویی به دنیای قصه‌ها، صداها و دانستنی‌ها. شماره‌های بعدی را از دست ندهید!</p>
    <span class="tag">بدون نیاز به اپلیکیشن</span>
    <span class="tag">کار در مرورگر گوشی</span>
    <span class="tag">اندروید و آیفون</span>
    <span class="tag">صدای راوی و شخصیت‌ها</span>
  </div>
</main>

<footer>
  © بازیکا — تصویر زندهٔ لایسنس‌دار • کپی‌برداری غیرمجاز ممنوع 🔒<br/>
  برای بهترین تجربه، صفحه را روی گوشی و با اینترنت باز کنید.
</footer>

<script src="vendor/qrcode.js"></script>
<script>window.BZ_TOKEN = <?php echo json_encode($BZ_TOK); ?>;</script>
  <script>
  fetch('ar/data.php?x=index&t=' + encodeURIComponent(window.BZ_TOKEN || ''), { credentials: 'same-origin' })
    .then(function (r) { return r.ok ? r.json() : { stands: [] }; })
    .then(function (idx) {
      var box = document.getElementById('stands');
      box.innerHTML = '';
      if (!idx.stands.length) { box.innerHTML = '<p style="width:100%;text-align:center">هنوز استندی منتشر نشده — از بخش مدیریت (admin.php) اضافه کنید.</p>'; return; }
      idx.stands.forEach(function (s) {
        var card = document.createElement('div');
        card.className = 'card';
        var url = new URL('ar/?stand=' + encodeURIComponent(s.id), location.href).href;
        card.innerHTML =
          '<span class="month">' + (s.month || '') + '</span>' +
          '<h3>' + s.title + '</h3>' +
          '<div class="qr" data-url="' + url + '"></div>' +
          '<div><a class="btn" href="ar/?stand=' + encodeURIComponent(s.id) + '">🦖 تماشای استند زنده</a></div>' +
          '<div><a class="btn ghost" href="#" data-qrpng>دانلود QR برای چاپ</a></div>';
        box.appendChild(card);
        var qr = qrcode(0, 'M');
        qr.addData(url); qr.make();
        var qrBox = card.querySelector('.qr');
        qrBox.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
        var svg = qrBox.querySelector('svg');
        var xml = new XMLSerializer().serializeToString(svg);
        var img = new Image();
        img.onload = function () {
          var c = document.createElement('canvas');
          c.width = c.height = 640;
          var g = c.getContext('2d');
          g.fillStyle = '#fff'; g.fillRect(0, 0, 640, 640);
          g.drawImage(img, 20, 20, 600, 600);
          var a = card.querySelector('[data-qrpng]');
          a.href = c.toDataURL('image/png');
          a.setAttribute('download', 'bazika-' + s.id + '-qr.png');
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(xml))));
      });
    })
    .catch(function () {
      document.getElementById('stands').innerHTML = '<p style="width:100%;text-align:center">⚠ خطا در خواندن فهرست استندها</p>';
    });
</script>
</body>
</html>
