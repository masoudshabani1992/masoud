'use strict';
/** API کوچک برای پنل (آپلود، تحلیل سئو، جست‌وجوی رسانه) */
const express = require('express');
const { all, get } = require('../db');
const auth = require('../auth');
const U = require('../util');

const router = express.Router();
router.use(auth.requireAuth);

router.get('/health', (req, res) => res.json({ ok: true, user: req.admin.email }));

router.get('/media', (req, res) => {
  const q = String(req.query.q || '').trim();
  const kind = req.query.kind || 'image';
  const rows = q
    ? all('SELECT * FROM media WHERE original_name LIKE ? ORDER BY id DESC LIMIT 60', [`%${q}%`])
    : all('SELECT * FROM media ORDER BY id DESC LIMIT 60');
  res.json({
    items: rows.filter((m) => (kind === 'file' ? true : String(m.mime || '').startsWith('image/'))),
  });
});

router.get('/search', (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.json({ posts: [], products: [] });
  const like = `%${q}%`;
  res.json({
    posts: all('SELECT id, title, type, slug, status FROM posts WHERE title LIKE ? OR slug LIKE ? LIMIT 10', [like, like]),
    products: all('SELECT id, name, slug, status FROM products WHERE name LIKE ? OR slug LIKE ? LIMIT 10', [like, like]),
  });
});

module.exports = router;

/* ---------- داده کاتالوگ برای اسکریپت ساخت PDF ----------
   این مسیر فقط داده عمومی محصولات را می‌دهد (بدون احراز هویت) و بدون آدرس سرور
   قابل استفاده نیست؛ برای همین توکن اختیاری CATALOG_TOKEN را می‌پذیرد. */
module.exports.catalogData = (req, res) => {
  const expected = process.env.CATALOG_TOKEN;
  if (expected && req.get('x-catalog-token') !== expected) {
    return res.status(403).json({ error: 'forbidden' });
  }
  const rows = all(
    `SELECT p.*, m.url AS cover_url FROM products p LEFT JOIN media m ON m.id = p.cover_id
     WHERE p.status <> 'out' ORDER BY p.sort, p.id`
  ).map((p) => ({
    slug: p.slug,
    name: p.name,
    model: p.model,
    price: p.price,
    price_note: p.price_note,
    cover_url: p.cover_url,
    specs: JSON.parse(p.specs_json || '[]'),
    brochure: JSON.parse(p.brochure_json || '{}'),
  }));
  res.json({ site: 'کوشا خودرو', products: rows });
};

module.exports.router = router;
