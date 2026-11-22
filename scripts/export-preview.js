'use strict';
/**
 * ساخت بسته پیش‌نمایش آفلاین سایت برای ویندوز
 * صفحه‌ها به HTML مستقل تبدیل می‌شوند تا با دوبار کلیک در مرورگر باز شوند (بدون نیاز به نصب چیزی)
 */
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const OUT = path.join(ROOT, '.preview-build');

function get(urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.get({ host: '127.0.0.1', port: 3000, path: encodeURI(urlPath), headers: { 'accept-language': 'fa' } }, (res) => {
      let d = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { d += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.setTimeout(20000, () => { req.destroy(new Error('timeout ' + urlPath)); });
  });
}

/** نام فایل امن و یکتا برای هر آدرس (اسلاگ فارسی → نام لاتین پایدار) */
const crypto = require('crypto');
function fileName(p) {
  let clean = p.split('?')[0].split('#')[0];
  if (clean === '/' || clean === '') return 'home.html';
  clean = clean.replace(/^\/+|\/+$/g, '');
  if (!/[^a-zA-Z0-9\-_/]/.test(clean)) return clean.replace(/\//g, '-') + '.html';
  // بخش لاتین اسلاگ را نگه می‌داریم و در صورت نبود، هش کوتاه می‌سازیم
  const parts = clean.split('/');
  const latin = parts.map((x) => x.replace(/[^a-zA-Z0-9\-_]/g, '')).filter(Boolean).join('-');
  const hash = crypto.createHash('md5').update(clean).digest('hex').slice(0, 6);
  return (latin ? latin + '-' + hash : 'page-' + hash) + '.html';
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

const ASSET_PREFIX = ['/img/', '/css/', '/js/', '/fonts/', '/uploads/', '/catalogs/', '/favicon'];

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  // ۱) فهرست آدرس‌ها از sitemap
  const sm = await get('/sitemap.xml');
  const paths = new Set(['/']);
  for (const m of sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    let loc = m[1].trim().replace(/&amp;/g, '&');
    let pathname = loc;
    if (/^https?:\/\//.test(loc)) {
      try { pathname = new URL(loc).pathname; } catch (e) { continue; }
    } else if (!loc.startsWith('/')) {
      pathname = '/' + loc;
    }
    try { paths.add(decodeURIComponent(pathname)); } catch (e) { paths.add(pathname); }
  }
  // صفحه‌های ضروری که ممکن است در sitemap نباشند
  ['/products', '/news', '/circulars', '/dealers', '/prices', '/contact', '/p/about'].forEach((p) => paths.add(p));

  const pageMap = {};
  paths.forEach((p) => { pageMap[p] = fileName(p); });

  // ۲) دانلود و بازنویسی صفحه‌ها
  const written = [];
  for (const p of paths) {
    let res;
    try { res = await get(p); } catch (e) { console.log('skip', p, e.message); continue; }
    if (res.status !== 200 || !/<html/i.test(res.body)) continue;

    let html = res.body;

    // لینک‌های داخلی → فایل HTML
    html = html.replace(/(href|action)="([^"]*)"/g, (all, attr, val) => {
      if (val === '') return `${attr}="home.html"`;
      if (/^(https?:)?\/\//.test(val) || /^(mailto:|tel:|javascript:|#|data:)/.test(val)) return all;
      if (val.startsWith('/')) {
        const [pathPart, hash] = val.split('#');
        const clean = pathPart.split('?')[0] || '/';
        if (pageMap[clean]) return `${attr}="${pageMap[clean]}${hash ? '#' + hash : ''}"`;
        if (ASSET_PREFIX.some((pre) => clean.startsWith(pre))) return `${attr}="${clean.slice(1)}${hash ? '#' + hash : ''}"`;
        return `${attr}="#"`;
      }
      return all;
    });

    // منابع (تصویر، اسکریپت، فونت)
    html = html.replace(/(src|srcset)="([^"]*)"/g, (all, attr, val) => {
      if (!val.startsWith('/')) return all;
      return `${attr}="${val.slice(1)}"`;
    });

    // ارجاع‌های درون استایل و متا
    html = html.replace(/(content|style)="([^"]*)"/g, (all, attr, val) => {
      if (!val.includes('(/' ) && !val.includes('url(/')) return all;
      return `${attr}="${val.replace(/url\(\//g, 'url(')}"`;
    });
    html = html.replace(/"(\/(?:img|css|js|fonts|uploads|catalogs)\/[^"]*)"/g, (all, v) => `"${v.slice(1)}"`);
    html = html.replace(/'(\/(?:img|css|js|fonts|uploads|catalogs)\/[^']*)'/g, (all, v) => `'${v.slice(1)}'`);

    // دکمه‌های اشتراک‌گذاری شبکه‌های اجتماعی در نسخه آفلاین غیرفعال می‌شوند
    html = html.replace(/href="https?:\/\/(?:t\.me|wa\.me|twitter\.com|www\.linkedin\.com)\/[^"]*"/g, 'href="#"');

    // دکمه‌های فرم در نسخه آفلاین کاری انجام نمی‌دهند
    html = html.replace(/<form([^>]*)>/g, '<form$1 onsubmit="return false">');

    // یادداشت نسخه پیش‌نمایش
    html = html.replace('</body>', `<div style="position:fixed;inset-inline:0;bottom:0;z-index:99999;background:#0a0a0a;color:#d8d8d3;font:12px Tahoma,sans-serif;text-align:center;padding:7px 10px">نسخه پیش‌نمایش آفلاین — کوشا خودرو | بعضی فرم‌ها در این نسخه غیرفعال هستند</div></body>`);

    fs.writeFileSync(path.join(OUT, pageMap[p]), html, 'utf8');
    written.push([p, pageMap[p]]);
  }

  // ۳) کپی دارایی‌ها
  for (const d of ['img', 'css', 'js', 'fonts', 'catalogs', 'uploads']) {
    copyDir(path.join(PUBLIC, d), path.join(OUT, d));
  }
  for (const f of ['favicon.svg']) {
    const src = path.join(PUBLIC, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(OUT, f));
  }

  // ۴) اصلاح مسیرها داخل CSS (چون در پوشه css قرار دارد)
  const cssDir = path.join(OUT, 'css');
  if (fs.existsSync(cssDir)) {
    for (const f of fs.readdirSync(cssDir).filter((x) => x.endsWith('.css'))) {
      const fp = path.join(cssDir, f);
      let css = fs.readFileSync(fp, 'utf8');
      css = css.replace(/url\(\s*'\/(fonts|img)\//g, "url('../$1/");
      css = css.replace(/url\(\s*"\/(fonts|img)\//g, 'url("../$1/');
      css = css.replace(/url\(\s*\/(fonts|img)\//g, 'url(../$1/');
      fs.writeFileSync(fp, css);
    }
  }

  // ۵) صفحه شروع (index.html) برای دوبار کلیک در ویندوز
  const landing = path.join(__dirname, 'preview-index.html');
  if (fs.existsSync(landing)) {
    let html = fs.readFileSync(landing, 'utf8');
    html = html.replace(/href="index\.html"/, 'href="home.html"');
    fs.writeFileSync(path.join(OUT, 'index.html'), html, 'utf8');
  }

  const readme = path.join(__dirname, 'preview-readme.txt');
  if (fs.existsSync(readme)) fs.copyFileSync(readme, path.join(OUT, 'README-first.txt'));

  fs.writeFileSync(path.join(OUT, 'pages.json'), JSON.stringify(written, null, 2));
  console.log('صفحه‌های ساخته‌شده:', written.length);
  console.log(written.map((w) => '  ' + w[0] + '  →  ' + w[1]).join('\n'));
}

main().catch((e) => { console.error(e); process.exit(1); });
