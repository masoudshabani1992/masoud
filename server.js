'use strict';
/**
 * کوشا خودرو — CMS اختصاصی
 * اجرا: node server.js  (پیش‌فرض پورت 3000)
 */
const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

const { seedAll } = require('./src/schema');
const auth = require('./src/auth');
const settings = require('./src/settings');
const { escapeHtml } = require('./src/util');

seedAll();
auth.cleanupSessions();

const app = express();
app.set('trust proxy', true);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('session secret', process.env.SESSION_SECRET || 'koosha-cms-local-secret');

// توکن CSRF وابسته به نشست کاربر — پیش از پردازش بدنه باید ساخته شود
app.use((req, res, next) => {
  res.locals.csrf = auth.csrfToken(req);
  next();
});

// توسعه: پذیرش دامنه پیش‌نمایش در محیط sandbox

app.use(compression());
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '7d' }));

// ---- دانلود بسته‌های آماده (فقط اگر پوشه downloads وجود داشته باشد) ----
const DOWNLOADS_DIR = path.join(__dirname, 'downloads');
if (fs.existsSync(DOWNLOADS_DIR)) {
  app.get('/downloads', (req, res) => {
    let items = [];
    try { items = fs.readdirSync(DOWNLOADS_DIR).filter((f) => f.endsWith('.zip')); } catch (e) { items = []; }
    const rows = items.map((f) => {
      const st = fs.statSync(path.join(DOWNLOADS_DIR, f));
      const mb = (st.size / 1048576).toFixed(1);
      const title = f.includes('preview') ? 'نسخه نمایشی (آفلاین، بدون نصب)' : 'نسخه کامل اجراشدنی با start.bat';
      return `<li style="margin:14px 0"><a href="/downloads/${encodeURIComponent(f)}" download style="font-weight:700;font-size:17px">${escapeHtml(f)}</a>
        <div style="font-size:13px;color:#666;margin-top:4px">${title} — ${mb} مگابایت</div></li>`;
    }).join('');
    res.send(`<!DOCTYPE html><html lang="fa" dir="rtl"><meta charset="utf-8">
<title>دانلود بسته‌های کوشا خودرو</title>
<body style="font-family:Tahoma,sans-serif;background:#0a0a0a;color:#eee;padding:40px;line-height:2">
<h1 style="font-size:24px">بسته‌های آماده دانلود</h1><ul style="list-style:none;padding:0">${rows || '<li>فایلی موجود نیست.</li>'}</ul>
<p style="color:#888;font-size:13px">پس از دانلود: اکسترکت کنید و روی start.bat (نسخه کامل) یا index.html (نسخه نمایشی) دوبار کلیک کنید.</p>
</body></html>`);
  });

  app.use('/downloads', express.static(DOWNLOADS_DIR, {
    maxAge: 0,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.zip')) {
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
      }
    },
  }));
}

app.use(auth.loadUser);
app.use(settings.locals);

// ---- ریدایرکت‌های مدیریتی (انتقال آدرس‌های قدیمی وردپرس) ----
const { get: dbGet, run: dbRun } = require('./src/db');
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/admin') || req.path.startsWith('/api')) return next();
  const row = dbGet('SELECT * FROM redirects WHERE from_path IN (?, ?)', [req.path, req.path + '/']);
  if (!row) return next();
  dbRun('UPDATE redirects SET hits = hits + 1 WHERE id = ?', [row.id]);
  if (row.code === 410) return res.status(410).send('این محتوا حذف شده است.');
  return res.redirect(row.code === 302 ? 302 : 301, row.to_path);
});

// ---- مسیرها ----
app.use('/admin', require('./src/routes/admin'));
// مسیر عمومی داده کاتالوگ (پیش از میدل‌ور احراز هویت API ثبت می‌شود)
app.get('/api/catalog/data', require('./src/routes/api').catalogData);
app.use('/api', require('./src/routes/api'));
app.use('/', require('./src/routes/public'));

// ---- 404 ----
app.use((req, res) => {
  res.status(404).render('site/404', { seo: require('./src/seo').build({ title: 'صفحه یافت نشد', noindex: true, path: req.path }) });
});

// ---- خطاها ----
app.use((err, req, res, next) => {
  console.error('[error]', err.message);
  if (req.path.startsWith('/api/')) return res.status(500).json({ error: 'خطای سرور: ' + err.message });
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).send('حجم فایل بیش از حد مجاز است.');
  }
  // خطای اعتبارسنجی فرم‌ها کد وضعیت خودش را دارد (مثلاً ۴۰۰) تا ۵۰۰ واقعی مبهم نماند
  const status = Number(err.status) || 500;
  res.status(status).send(
    `<div dir="rtl" style="font-family:sans-serif;padding:40px">
      <h2>خطایی رخ داد</h2><p>${require('./src/util').escapeHtml(err.message)}</p>
      <a href="/admin">بازگشت به پنل</a>
    </div>`
  );
});

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`کوشا خودرو CMS روی http://localhost:${PORT} اجرا شد`);
  console.log(`پنل مدیریت: http://localhost:${PORT}/admin`);
  console.log(`[ready] listening on ${HOST}:${PORT}`);
});

// اگر پورت در اختیار فرآیند دیگری بود، به‌جای کرش با پیام روشن خارج شویم
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[fatal] پورت ${PORT} در حال استفاده است. فرآیند قبلی را متوقف کنید یا PORT را تغییر دهید.`);
    process.exit(98);
  }
  if (err.code === 'EACCES') {
    console.error(`[fatal] دسترسی به پورت ${PORT} مجاز نیست (پورت‌های زیر ۱۰۲۴ نیاز به دسترسی ویژه دارند).`);
    process.exit(77);
  }
  console.error('[fatal] خطای سرور:', err.message);
  process.exit(1);
});

// خاموشی تمیز: بستن اتصال‌ها و دیتابیس تا پورت و فایل WAL آزاد شوند
let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[shutdown] دریافت ${signal} — در حال بستن سرور…`);

  const forceExit = setTimeout(() => {
    console.error('[shutdown] خروج اجباری پس از ۸ ثانیه');
    process.exit(1);
  }, 8000);
  forceExit.unref();

  server.close(() => {
    try {
      const { db } = require('./src/db');
      db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
      db.close();
      console.log('[shutdown] دیتابیس بسته شد. خداحافظ.');
    } catch (e) {
      console.error('[shutdown] خطا در بستن دیتابیس:', e.message);
    }
    process.exit(0);
  });
}

['SIGTERM', 'SIGINT', 'SIGHUP'].forEach((sig) => process.on(sig, () => shutdown(sig)));

// خطاهای پیش‌بینی‌نشده نباید بی‌صدا سرور را زمین بزنند
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason && reason.message ? reason.message : reason);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err.message);
});
