'use strict';
/** تنظیمات سایت + دسترسی‌های مشترک قالب */
const { all, get, run } = require('./db');
const U = require('./util');

let cache = null;
let cacheAt = 0;

function getSettings(force = false) {
  if (!force && cache && Date.now() - cacheAt < 5000) return cache;
  const rows = all('SELECT key, value FROM settings');
  const s = {};
  for (const r of rows) s[r.key] = r.value;
  cache = s;
  cacheAt = Date.now();
  return s;
}

function setSetting(key, value) {
  run(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value == null ? '' : String(value)]
  );
  cache = null;
}

function setSettings(obj) {
  const { tx } = require('./db');
  tx(() => {
    for (const [k, v] of Object.entries(obj)) setSetting(k, v);
  });
  cache = null;
}

/** نقشه سایت برای لینک‌سازی و breadcrumb */
const PATHS = {
  home: '/',
  news: '/news',
  circulars: '/circulars',
  products: '/products',
  contact: '/contact',
  search: '/search',
  about: '/p/about',
};

function menu() {
  return [
    { title: 'محصولات کیا', url: '/products' },
    { title: 'فروش و لیست قیمت', url: '/prices' },
    { title: 'اخبار', url: '/news' },
    { title: 'بخشنامه‌ها', url: '/circulars' },
    { title: 'عاملیت‌ها', url: '/dealers' },
    { title: 'درباره کوشا', url: '/p/about' },
  ];
}

/** میان‌افزارlocals */
function locals(req, res, next) {
  const s = getSettings();
  res.locals.s = s;
  res.locals.U = U;
  res.locals.menu = menu();
  res.locals.currentUrl = req.originalUrl;
  res.locals.path = req.path;
  res.locals.year = U.toFa(new Date().getFullYear());
  res.locals.page = res.locals.page || {};
  next();
}

module.exports = { getSettings, setSetting, setSettings, menu, locals, PATHS };
