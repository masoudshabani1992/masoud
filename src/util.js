'use strict';
/** توابع کمکی مشترک */

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

function faToEnDigits(str = '') {
  return String(str)
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/٬/g, '');
}

function toFa(str) {
  return String(str ?? '').replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

function slugify(input = '') {
  const s = faToEnDigits(String(input))
    .trim()
    .toLowerCase()
    .replace(/[\u200c\u200f\u200e]/g, '-') // نیم‌فاصله
    .replace(/['"“”‘’«»]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
  return s || 'item-' + Date.now().toString(36);
}

function uniqueSlug(table, base, ignoreId = null) {
  const { get } = require('./db');
  let slug = base;
  let i = 2;
  for (;;) {
    const row = ignoreId
      ? get(`SELECT id FROM ${table} WHERE slug = ? AND id <> ?`, [slug, ignoreId])
      : get(`SELECT id FROM ${table} WHERE slug = ?`, [slug]);
    if (!row) return slug;
    slug = `${base}-${i++}`;
  }
}

/** تاریخ شمسی */
function faDate(dateStr, withTime = false) {
  if (!dateStr) return '—';
  const d = new Date(String(dateStr).replace(' ', 'T') + (String(dateStr).includes('T') ? '' : 'Z'));
  if (isNaN(d)) return '—';
  const opts = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Tehran' };
  if (withTime) {
    opts.hour = '2-digit';
    opts.minute = '2-digit';
    opts.hour12 = false;
  }
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', opts).format(d);
}

function faDateShort(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(String(dateStr).replace(' ', 'T') + (String(dateStr).includes('T') ? '' : 'Z'));
  if (isNaN(d)) return '—';
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Tehran',
  }).format(d);
}

function nowISO() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function money(n) {
  if (n === null || n === undefined || n === '') return null;
  return toFa(Number(n).toLocaleString('en-US')).replace(/,/g, '٬');
}

/** متن ساده از HTML */
function stripTags(html = '') {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(str, n = 160) {
  const s = stripTags(str || '');
  if (s.length <= n) return s;
  return s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function readingTime(html = '') {
  const words = stripTags(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function faBytes(bytes) {
  if (!bytes) return '۰';
  const units = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
  let i = 0;
  let n = Number(bytes);
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return toFa(n.toFixed(i === 0 ? 0 : 1)) + ' ' + units[i];
}

const STATUS_LABELS = {
  draft: 'پیش‌نویس',
  published: 'منتشر شده',
  scheduled: 'زمان‌بندی شده',
  available: 'موجود',
  soon: 'به‌زودی',
  out: 'ناموجود',
  new: 'جدید',
  done: 'بررسی شده',
};

const TYPE_LABELS = {
  news: 'خبر',
  circular: 'بخشنامه',
  page: 'صفحه',
  product: 'محصول',
};

module.exports = {
  faToEnDigits, toFa, slugify, uniqueSlug, faDate, faDateShort, nowISO, money,
  stripTags, truncate, escapeHtml, readingTime, faBytes, STATUS_LABELS, TYPE_LABELS,
};
