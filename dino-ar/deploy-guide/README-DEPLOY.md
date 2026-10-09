# راهنمای نصب روی ساب‌دامنهٔ شما 🦖

این بسته کاملاً استاتیک است (بدون PHP/دیتابیس) و روی هر هاست اشتراکی
(cPanel / DirectAdmin / هاست وردپرس) کار می‌کند.

## پیش‌نیاز مهم
دوربین گوشی فقط روی **HTTPS** باز می‌شود؛ ساب‌دامنه باید گواهی SSL داشته باشد
(در cPanel با AutoSSL/Let's Encrypt رایگان فعال می‌شود).

## گام‌ها (cPanel)
1. از بخش **Domains → Create A New Domain** یک ساب‌دامنه بسازید؛
   مثلاً `ar.yourdomain.com` (پوشهٔ آن مثلاً `public_html/ar` خواهد بود).
2. مطمئن شوید SSL روی ساب‌دامنه فعال است (بخش **SSL/TLS Status → AutoSSL**).
3. این فایل زیپ (`dino-ar-web-ar.zip`) را در پوشهٔ ساب‌دامنه **Upload** و همان‌جا **Extract** کنید.
4. ساختار داخل پوشهٔ ساب‌دامنه باید دقیقاً این باشد:
   ```
   index.html
   .htaccess
   ar/            (index.html, app.js, ui.css)
   vendor/        (aframe.min.js, GLTFLoader.js, mindar-image-aframe.prod.js, qrcode.js)
   models/        (Trex.glb, Triceratops.glb, Stegosaurus.glb, dinos-combined.glb)
   sounds/        (roar-big.wav, roar-mid.wav, pop.wav)
   assets/        (targets.mind, target.png, jungle.jpg, sprites/)
   content/dino/  (info.json, audio/, images/)
   ```
5. تست: با گوشی باز کنید `https://ar.yourdomain.com` → «اجرای واقعیت افزوده» →
   اجازهٔ دوربین → اسکن استند.

## QR برای چاپ روی استند
صفحهٔ اصلی به‌صورت خودکار QR همان آدرس را می‌سازد؛ دکمهٔ «دانلود PNG برای چاپ»
را بزنید و روی استند/بسته‌بندی چاپ کنید. با هر دامنه‌ای که نصب کنید، QR همان دامنه را کد می‌کند.

## تغییر محتوا (ماه‌های بعد)
- متن پاپ‌آپ‌ها و دکمهٔ ℹ: ویرایش `content/dino/info.json`
- صدای راوی: جایگزینی `content/dino/audio/narration.mp3`
- صدای هر دایناسور: `roar-trex.mp3` / `roar-triceratops.mp3` / `roar-stegosaurus.mp3`
- عکس پاپ‌آپ‌ها: `content/dino/images/*.webp`
- طرح جدید استند (هدف اسکن): فایل `assets/targets.mind` باید از تصویر جدید ساخته شود
  (این مرحله را من انجام می‌دهم؛ فقط تصویر را بفرستید).

## عیب‌یابی سریع
- دوربین باز نمی‌شود → آدرس حتماً باید https باشد و مجوز دوربین داده شده باشد.
- مدل‌ها لود نمی‌شوند → در هاست‌های با تنظیمات سفارشی، مطمئن شوید `.htaccess` آپلود شده
  (برای MIME نوع `glb` و `mind`).
- صفحه سفید → مسیرها را چک کنید؛ `index.html` باید در ریشهٔ ساب‌دامنه باشد.
