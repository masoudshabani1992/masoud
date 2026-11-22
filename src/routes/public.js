'use strict';
/** مسیرهای عمومی سایت (فقط خواندنی) */
const express = require('express');
const { all, get, run } = require('../db');
const U = require('../util');
const seoLib = require('../seo');
const { renderPage } = require('../render');
const { getSettings } = require('../settings');


const router = express.Router();

/** آدرس عمومی یک مطلب */
function postUrl(p) {
  return (p && p.type === 'circular' ? '/circular/' : '/news/') + (p && p.slug ? p.slug : '');
}
const PER_PAGE = 9;

/* ---------- کمک‌کننده‌ها ---------- */
function media(id) {
  if (!id) return null;
  return get('SELECT id, url, alt, width, height FROM media WHERE id = ?', [Number(id)]);
}

function cover(row) {
  return media(row.cover_id) || media(row.og_image_id);
}

function attachCover(rows) {
  return rows.map((r) => ({ ...r, coverUrl: (media(r.cover_id) || media(r.og_image_id) || {}).url || null }));
}

function footerData() {
  return all(
    "SELECT name, slug FROM products WHERE status <> 'out' ORDER BY sort LIMIT 5"
  );
}

function published(extra = '') {
  return `p.status = 'published' AND (p.published_at IS NULL OR p.published_at <= datetime('now')) ${extra}`;
}

function paginate(req, total, perPage) {
  const page = Math.max(1, parseInt(U.faToEnDigits(req.query.page || '1'), 10) || 1);
  const pages = Math.max(1, Math.ceil(total / perPage));
  return { page: Math.min(page, pages), pages, total, perPage, offset: (Math.min(page, pages) - 1) * perPage };
}

function pageUrl(base, q, n) {
  const params = new URLSearchParams();
  Object.entries(q || {}).forEach(([k, v]) => { if (v && k !== 'page') params.set(k, v); });
  if (n > 1) params.set('page', String(n));
  const qs = params.toString();
  return base + (qs ? '?' + qs : '');
}

/* ---------- صفحه اصلی ---------- */
router.get('/', (req, res) => {
  const s = getSettings();
  const featuredProducts = all(
    `SELECT * FROM products WHERE status <> 'out' ORDER BY featured DESC, sort, id DESC LIMIT 4`
  ).map((p) => ({ ...p, coverUrl: (media(p.cover_id) || {}).url || null }));

  const latestNews = all(
    `SELECT p.*, c.name AS cat_name, c.slug AS cat_slug FROM posts p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE ${published("AND p.type IN ('news')")} ORDER BY COALESCE(p.pinned,0) DESC, p.published_at DESC LIMIT 6`
  ).map((r) => ({ ...r, coverUrl: cover(r)?.url || null }));

  const latestCirculars = all(
    `SELECT p.*, c.name AS cat_name FROM posts p LEFT JOIN categories c ON c.id = p.category_id
     WHERE ${published("AND p.type = 'circular'")} ORDER BY p.pinned DESC, COALESCE(p.doc_date, p.published_at) DESC LIMIT 5`
  );

  const seo = seoLib.build({
    isHome: true,
    title: `${s.site_name} | ${s.site_tagline}`,
    description: s.site_description,
    path: '/',
    jsonLd: [
      seoLib.organizationJsonLd(),
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: s.site_name,
        url: seoLib.absUrl('/'),
        potentialAction: {
          '@type': 'SearchAction',
          target: seoLib.absUrl('/search?q={search_term_string}'),
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  });

  renderPage(res, 'site/home', {
    page: { title: 'خانه' },
    seo,
    featuredProducts,
    productsCount: get('SELECT COUNT(*) c FROM products').c,
    latestNews,
    latestCirculars,
    homeSections: JSON.parse(s.home_sections || '[]'),
    footerProducts: footerData(),
  });
});

/* ---------- اخبار ---------- */
router.get('/news', (req, res) => {
  const cat = req.query.cat || '';
  const q = String(req.query.q || '').trim();
  const where = [published("AND p.type = 'news'")];
  const params = {};
  if (cat) { where.push('c.slug = :cat'); params.cat = cat; }
  if (q) { where.push('(p.title LIKE :q OR p.excerpt LIKE :q)'); params.q = `%${q}%`; }
  const W = where.join(' AND ');

  const total = get(
    `SELECT COUNT(*) c FROM posts p LEFT JOIN categories c ON c.id = p.category_id WHERE ${W}`, params
  ).c;
  const pg = paginate(req, total, PER_PAGE);
  const paramsPage = { ...params };
  const rows = all(
    `SELECT p.*, c.name cat_name, c.slug cat_slug FROM posts p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE ${W} ORDER BY p.pinned DESC, p.published_at DESC LIMIT ${PER_PAGE} OFFSET ${pg.offset}`,
    paramsPage
  );
  const items = rows.map((r) => ({ ...r, coverUrl: cover(r)?.url || null }));

  const cats = all("SELECT * FROM categories WHERE type='news' ORDER BY sort, id");
  const activeCat = cats.find((c) => c.slug === cat);

  const seo = seoLib.build({
    title: activeCat ? `اخبار ${activeCat.name}` : 'اخبار کوشا خودرو و صنعت خودرو',
    description: activeCat
      ? `آخرین اخبار ${activeCat.name} از کوشا خودرو`
      : 'آخرین اخبار کوشا خودرو، محصولات کیا و صنعت خودرو ایران و جهان',
    path: '/news' + (cat ? '?cat=' + cat : ''),
    prev: pg.page > 1 ? seoLib.absUrl(pageUrl('/news', req.query, pg.page - 1)) : null,
    next: pg.page < pg.pages ? seoLib.absUrl(pageUrl('/news', req.query, pg.page + 1)) : null,
    jsonLd: [
      seoLib.organizationJsonLd(),
      seoLib.breadcrumbJsonLd([
        { title: 'خانه', path: '/' },
        { title: 'اخبار', path: '/news' },
      ]),
    ],
  });

  renderPage(res, 'site/list', {
    page: { title: 'اخبار' }, pageUrl,
    seo,
    kind: 'news',
    heading: 'اخبار',
    subtitle: 'آخرین خبرها از کوشا خودرو و صنعت خودرو',
    items,
    cats,
    activeCat: cat,
    q,
    pg,
    baseUrl: '/news',
    query: req.query,
    footerProducts: footerData(),
  });
});

/* ---------- بخشنامه‌ها ---------- */
router.get('/circulars', (req, res) => {
  const cat = req.query.cat || '';
  const q = String(req.query.q || '').trim();
  const where = [published("AND p.type = 'circular'")];
  const params = {};
  if (cat) { where.push('c.slug = :cat'); params.cat = cat; }
  if (q) { where.push('(p.title LIKE :q OR p.doc_number LIKE :q OR p.body LIKE :q)'); params.q = `%${q}%`; }
  const W = where.join(' AND ');

  const total = get(`SELECT COUNT(*) c FROM posts p LEFT JOIN categories c ON c.id = p.category_id WHERE ${W}`, params).c;
  const pg = paginate(req, total, 10);
  const rows = all(
    `SELECT p.*, c.name cat_name, c.slug cat_slug FROM posts p LEFT JOIN categories c ON c.id = p.category_id
     WHERE ${W} ORDER BY p.pinned DESC, COALESCE(p.doc_date, p.published_at) DESC LIMIT 10 OFFSET ${pg.offset}`,
    params
  );
  const cats = all("SELECT * FROM categories WHERE type='circular' ORDER BY sort, id");

  const seo = seoLib.build({
    title: 'بخشنامه‌ها و اطلاعیه‌های رسمی',
    description: 'آرشیو بخشنامه‌ها، اطلاعیه‌ها و دستورالعمل‌های رسمی کوشا خودرو برای نمایندگی‌ها و مشتریان',
    path: '/circulars' + (cat ? '?cat=' + cat : ''),
    jsonLd: [
      seoLib.organizationJsonLd(),
      seoLib.breadcrumbJsonLd([
        { title: 'خانه', path: '/' },
        { title: 'بخشنامه‌ها', path: '/circulars' },
      ]),
    ],
  });

  renderPage(res, 'site/circulars', {
    page: { title: 'بخشنامه‌ها' }, pageUrl,
    seo, items: rows, cats, activeCat: cat, q, pg, query: req.query,
    footerProducts: footerData(),
  });
});

/* ---------- محصولات ---------- */
router.get('/products', (req, res) => {
  const cat = req.query.cat || '';
  const where = ['1=1'];
  const params = {};
  if (cat) { where.push('c.slug = :cat'); params.cat = cat; }
  const W = where.join(' AND ');
  const items = all(
    `SELECT p.*, c.name cat_name, c.slug cat_slug FROM products p LEFT JOIN categories c ON c.id = p.category_id
     WHERE ${W} ORDER BY p.featured DESC, p.sort, p.id`, params
  ).map((p) => ({
    ...p,
    coverUrl: (media(p.cover_id) || {}).url || null,
    specs: JSON.parse(p.specs_json || '[]'),
  }));
  const cats = all("SELECT * FROM categories WHERE type='product' ORDER BY sort, id");
  const activeCat = cats.find((c) => c.slug === cat);

  const seo = seoLib.build({
    title: activeCat ? `محصولات کیا — ${activeCat.name}` : 'محصولات کیا در ایران',
    description: 'محصولات وارداتی کیا توسط کوشا خودرو؛ مشخصات فنی، امکانات، قیمت و شرایط فروش',
    path: '/products' + (cat ? '?cat=' + cat : ''),
    jsonLd: [
      seoLib.organizationJsonLd(),
      seoLib.breadcrumbJsonLd([
        { title: 'خانه', path: '/' },
        { title: 'محصولات', path: '/products' },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: items.slice(0, 10).map((p, i) => ({
          '@type': 'ListItem', position: i + 1, name: p.name, url: seoLib.absUrl(`/products/${p.slug}`),
        })),
      },
    ],
  });

  renderPage(res, 'site/products', {
    page: { title: 'محصولات' }, seo, items, cats, activeCat: cat,
    footerProducts: footerData(),
  });
});

router.get('/products/:slug', (req, res) => {
  const p = get(
    `SELECT p.*, c.name cat_name, c.slug cat_slug FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.slug = ?`,
    [req.params.slug]
  );
  if (!p) return res.status(404).render('site/404', { seo: seoLib.build({ title: 'محصول یافت نشد', noindex: true }) });

  run('UPDATE products SET views = views + 1 WHERE id = ?', [p.id]);
  const coverImg = media(p.cover_id);
  const gallery = (JSON.parse(p.gallery_json || '[]')).map(media).filter(Boolean);
  const specs = JSON.parse(p.specs_json || '[]');
  const related = all(
    `SELECT name, slug, price, cover_id FROM products WHERE id <> ? ORDER BY featured DESC, sort LIMIT 3`, [p.id]
  ).map((r) => ({ ...r, coverUrl: (media(r.cover_id) || {}).url || null }));

  const seo = seoLib.build({
    title: p.seo_title || p.name,
    description: p.seo_description || p.short_desc,
    seo_keywords: p.seo_keywords,
    canonical: p.canonical || undefined,
    robots: p.robots,
    path: `/products/${p.slug}`,
    image: coverImg ? coverImg.url : null,
    ogType: 'product',
    updated_at: p.updated_at,
    jsonLd: [
      seoLib.organizationJsonLd(),
      seoLib.productJsonLd({ ...p, specs }, coverImg ? coverImg.url : null),
      seoLib.breadcrumbJsonLd([
        { title: 'خانه', path: '/' },
        { title: 'محصولات', path: '/products' },
        { title: p.name, path: `/products/${p.slug}` },
      ]),
    ],
  });

  renderPage(res, 'site/product', {
    page: { title: p.name }, seo, p, coverImg, gallery, specs, related,
    sent: req.query.sent === '1',
    footerProducts: footerData(),
  });
});

/* ---------- فرم استعلام ---------- */
router.post('/products/:slug/inquiry', (req, res) => {
  const p = get('SELECT id, slug FROM products WHERE slug = ?', [req.params.slug]);
  if (!p) return res.redirect('/products');
  const name = String(req.body.name || '').trim().slice(0, 120);
  const phone = String(req.body.phone || '').trim().slice(0, 30);
  if (!name || !U.faToEnDigits(phone).replace(/\D/g, '').length) {
    return res.redirect(`/products/${p.slug}?sent=0`);
  }
  run(
    `INSERT INTO inquiries (product_id, name, phone, email, city, message) VALUES (?,?,?,?,?,?)`,
    [p.id, name, U.faToEnDigits(phone), String(req.body.email || '').trim().slice(0, 120),
      String(req.body.city || '').trim().slice(0, 80), String(req.body.message || '').trim().slice(0, 1000)]
  );
  res.redirect(`/products/${p.slug}?sent=1#inquiry`);
});

/* ---------- تماس ---------- */
router.get('/contact', (req, res) => {
  const seo = seoLib.build({
    title: 'تماس با ما',
    description: 'راه‌های ارتباط با کوشا خودرو، تلفن فروش و خدمات پس از فروش، آدرس دفتر مرکزی و شبکه نمایندگی‌ها',
    path: '/contact',
    jsonLd: [seoLib.organizationJsonLd(), seoLib.breadcrumbJsonLd([{ title: 'خانه', path: '/' }, { title: 'تماس با ما', path: '/contact' }])],
  });
  renderPage(res, 'site/contact', {
    page: { title: 'تماس با ما' }, seo, sent: req.query.sent === '1', footerProducts: footerData(),
  });
});

router.post('/contact', (req, res) => {
  const name = String(req.body.name || '').trim().slice(0, 120);
  const phone = String(req.body.phone || '').trim().slice(0, 30);
  if (!name || !phone) return res.redirect('/contact?sent=0');
  run(
    `INSERT INTO inquiries (name, phone, email, city, message) VALUES (?,?,?,?,?)`,
    [name, U.faToEnDigits(phone), String(req.body.email || '').trim().slice(0, 120),
      String(req.body.city || '').trim().slice(0, 80), String(req.body.message || '').trim().slice(0, 1000)]
  );
  res.redirect('/contact?sent=1#form');
});

/* ---------- جست‌وجو ---------- */
router.get('/search', (req, res) => {
  const q = String(req.query.q || '').trim();
  let news = [], products = [], circulars = [], pages = [];
  if (q) {
    const like = `%${q}%`;
    news = all(
      `SELECT p.slug, p.title, p.excerpt, p.published_at FROM posts p WHERE ${published("AND p.type='news'")} AND (title LIKE ? OR excerpt LIKE ? OR body LIKE ?) LIMIT 12`,
      [like, like, like]
    );
    circulars = all(
      `SELECT p.slug, p.title, p.doc_number, p.doc_date, p.published_at FROM posts p WHERE ${published("AND p.type='circular'")} AND (title LIKE ? OR body LIKE ? OR doc_number LIKE ?) LIMIT 12`,
      [like, like, like]
    );
    pages = all(
      `SELECT p.slug, p.title, p.excerpt FROM posts p WHERE ${published("AND p.type='page'")} AND (title LIKE ? OR body LIKE ?) LIMIT 8`,
      [like, like]
    );
    products = all(
      `SELECT slug, name, short_desc, cover_id FROM products WHERE name LIKE ? OR short_desc LIKE ? OR body LIKE ? LIMIT 12`,
      [like, like, like]
    ).map((r) => ({ ...r, coverUrl: (media(r.cover_id) || {}).url || null }));
  }
  const seo = seoLib.build({
    title: q ? `نتایج جست‌وجو برای «${q}»` : 'جست‌وجو',
    description: 'جست‌وجو در اخبار، بخشنامه‌ها، محصولات و صفحات سایت کوشا خودرو',
    path: '/search',
    noindex: true,
  });
  renderPage(res, 'site/search', {
    page: { title: 'جست‌وجو' }, seo, q, news, products, circulars, pages,
    total: news.length + products.length + circulars.length + pages.length,
    footerProducts: footerData(),
  });
});

/* ---------- مطلب (خبر / بخشنامه) ---------- */
/* ---------- مطلب (خبر / بخشنامه) ---------- */
router.get('/post/:slug', (req, res, next) => {
  const row = get("SELECT type, slug FROM posts WHERE slug = ? AND type IN ('news','circular') AND status = 'published'", [req.params.slug]);
  if (!row) return next();
  return res.redirect(301, postUrl(row));
});

/** رندر صفحه مطلب (خبر یا بخشنامه) */
function renderArticle(req, res, p) {
  run('UPDATE posts SET views = views + 1 WHERE id = ?', [p.id]);
  const coverImg = cover(p);
  const attachment = p.attachment_id ? media(p.attachment_id) : null;
  const related = all(
    `SELECT p.slug, p.title, p.published_at, p.cover_id FROM posts p
     WHERE p.type = ? AND p.id <> ? AND ${published()} ORDER BY p.published_at DESC LIMIT 4`,
    [p.type, p.id]
  ).map((r) => ({ ...r, coverUrl: (media(r.cover_id) || {}).url || null }));

  const base = p.type === 'circular' ? '/circulars' : '/news';
  const canonicalPath = postUrl(p);
  const seo = seoLib.build({
    title: p.seo_title || p.title,
    description: p.seo_description || p.excerpt,
    seo_keywords: p.seo_keywords,
    canonical: p.canonical || undefined,
    robots: p.robots,
    path: canonicalPath,
    image: coverImg ? coverImg.url : null,
    ogType: 'article',
    published_at: p.published_at,
    updated_at: p.updated_at,
    jsonLd: [
      seoLib.articleJsonLd({ ...p, path: canonicalPath, image: coverImg ? coverImg.url : null }),
      seoLib.breadcrumbJsonLd([
        { title: 'خانه', path: '/' },
        { title: p.type === 'circular' ? 'بخشنامه‌ها' : 'اخبار', path: base },
        { title: p.title, path: canonicalPath },
      ]),
    ],
  });

  renderPage(res, 'site/post', {
    page: { title: p.title }, seo, p, coverImg, attachment, related, base, postUrl,
    readingTime: U.readingTime(p.body), footerProducts: footerData(),
  });
}

router.get('/news/:slug', (req, res, next) => {
  const p = get(
    `SELECT p.*, c.name cat_name, c.slug cat_slug FROM posts p LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.slug = ? AND p.type = 'news' AND ${published()}`,
    [req.params.slug]
  );
  if (!p) return next();
  return renderArticle(req, res, p);
});

router.get('/circular/:slug', (req, res, next) => {
  const p = get(
    `SELECT p.*, c.name cat_name, c.slug cat_slug FROM posts p LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.slug = ? AND p.type = 'circular' AND ${published()}`,
    [req.params.slug]
  );
  if (!p) return next();
  return renderArticle(req, res, p);
});

/* ================= نمایندگی‌ها و عاملیت‌ها ================= */
const SERVICE_LABELS = { 'فروش': 'فروش', 'خدمات پس از فروش': 'خدمات پس از فروش', 'قطعات یدکی': 'قطعات یدکی' };
const TYPE_LABELS_DEALER = { dealer: 'نمایندگی فروش', agency: 'عاملیت خدمات', both: 'نمایندگی و عاملیت' };

function dealerCities() {
  return all(
    `SELECT city, COUNT(*) c FROM dealers WHERE active = 1 GROUP BY city ORDER BY c DESC, city`
  );
}

function parseServices(d) {
  try { return JSON.parse(d.services || '[]'); } catch (_) { return []; }
}

router.get('/dealers', (req, res) => {
  const city = String(req.query.city || '').trim();
  const type = ['dealer', 'agency', 'both'].includes(req.query.type) ? req.query.type : '';
  const q = String(req.query.q || '').trim();

  const where = ['active = 1'];
  const params = {};
  if (city) { where.push('city = :city'); params.city = city; }
  if (type) { where.push('type = :type'); params.type = type; }
  if (q) { where.push('(name LIKE :q OR address LIKE :q OR phone LIKE :q)'); params.q = `%${q}%`; }

  const rows = all(
    `SELECT * FROM dealers WHERE ${where.join(' AND ')} ORDER BY sort, id`, params
  ).map((d) => ({ ...d, servicesList: parseServices(d) }));

  // تفکیک شهرها برای نمایش گروهی
  const grouped = {};
  rows.forEach((d) => { (grouped[d.city] = grouped[d.city] || []).push(d); });
  const cities = dealerCities();
  const allCount = get('SELECT COUNT(*) c FROM dealers WHERE active = 1').c;

  const seo = seoLib.build({
    title: city ? `نمایندگی‌ها و عاملیت‌های کوشا خودرو در ${city}` : 'شبکه نمایندگی‌ها و عاملیت‌های کوشا خودرو',
    description: city
      ? `آدرس، تلفن، ساعات کاری و لیست قیمت نمایندگی‌ها و عاملیت‌های کوشا خودرو در ${city}.`
      : 'فهرست نمایندگی‌های فروش و عاملیت‌های خدمات پس از فروش کوشا خودرو در شهرهای مختلف، به همراه آدرس، تلفن و لیست قیمت.',
    path: '/dealers' + (city ? '?city=' + encodeURIComponent(city) : ''),
    jsonLd: [
      seoLib.organizationJsonLd(),
      seoLib.breadcrumbJsonLd([
        { title: 'خانه', path: '/' },
        { title: 'نمایندگی‌ها', path: '/dealers' },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: rows.slice(0, 30).map((d, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'AutoDealer',
            name: d.name,
            telephone: d.phone,
            address: { '@type': 'PostalAddress', streetAddress: d.address, addressLocality: d.city, addressCountry: 'IR' },
            url: seoLib.absUrl(`/dealers/${d.slug}`),
          },
        })),
      },
    ],
  });

  renderPage(res, 'site/dealers', {
    page: { title: 'نمایندگی‌ها' }, seo, rows, grouped, cities, city, type, q, allCount,
    TYPE_LABELS_DEALER, footerProducts: footerData(),
  });
});

router.get('/dealers/:slug', (req, res) => {
  const d = get('SELECT * FROM dealers WHERE slug = ? AND active = 1', [req.params.slug]);
  if (!d) return res.status(404).render('site/404', { seo: seoLib.build({ title: 'نمایندگی یافت نشد', noindex: true }) });

  const services = parseServices(d);
  const priceList = d.price_list_id ? get('SELECT * FROM price_lists WHERE id = ?', [d.price_list_id]) : null;
  const items = priceList
    ? all('SELECT * FROM price_items WHERE price_list_id = ? ORDER BY sort, id', [priceList.id])
    : [];
  const siblings = all(
    'SELECT name, slug, city, type FROM dealers WHERE city = ? AND id <> ? AND active = 1 ORDER BY sort LIMIT 6',
    [d.city, d.id]
  );
  const nearby = all(
    'SELECT name, slug, city, type FROM dealers WHERE city <> ? AND active = 1 ORDER BY sort LIMIT 6',
    [d.city]
  );
  const coverImg = media(d.cover_id);

  const seo = seoLib.build({
    title: d.seo_title || d.name,
    description: d.seo_description || `آدرس، تلفن، ساعات کاری و لیست قیمت ${d.name} در ${d.city}.`,
    path: `/dealers/${d.slug}`,
    image: coverImg ? coverImg.url : null,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'AutoDealer',
        name: d.name,
        telephone: d.phone,
        email: d.email || undefined,
        url: seoLib.absUrl(`/dealers/${d.slug}`),
        address: {
          '@type': 'PostalAddress',
          streetAddress: d.address,
          addressLocality: d.city,
          addressRegion: d.province,
          addressCountry: 'IR',
        },
        geo: d.lat && d.lng ? { '@type': 'GeoCoordinates', latitude: d.lat, longitude: d.lng } : undefined,
        openingHours: d.hours || undefined,
        areaServed: d.city,
      },
      seoLib.breadcrumbJsonLd([
        { title: 'خانه', path: '/' },
        { title: 'نمایندگی‌ها', path: '/dealers' },
        { title: d.name, path: `/dealers/${d.slug}` },
      ]),
    ],
  });

  renderPage(res, 'site/dealer', {
    page: { title: d.name }, seo, d, services, priceList, items, siblings, nearby, coverImg,
    TYPE_LABELS_DEALER, footerProducts: footerData(),
  });
});

/* ================= لیست قیمت ================= */
function priceItemRows(listId) {
  return all(
    `SELECT pi.*, pr.slug AS product_slug, pr.name AS product_name, pr.model AS product_model,
            (SELECT url FROM media m WHERE m.id = pr.cover_id) AS cover_url
       FROM price_items pi LEFT JOIN products pr ON pr.id = pi.product_id
      WHERE pi.price_list_id = ? ORDER BY pi.sort, pi.id`,
    [listId]
  );
}

router.get('/prices', (req, res) => {
  const lists = all(
    `SELECT pl.*, d.name AS dealer_name, d.slug AS dealer_slug,
            (SELECT COUNT(*) FROM price_items pi WHERE pi.price_list_id = pl.id) AS items_count
       FROM price_lists pl LEFT JOIN dealers d ON d.id = pl.dealer_id
      WHERE pl.status = 'published'
      ORDER BY CASE pl.scope WHEN 'general' THEN 0 WHEN 'city' THEN 1 ELSE 2 END, pl.city, pl.id`
  ).map((l) => ({ ...l, items: priceItemRows(l.id).slice(0, 4), count: l.items_count }));

  const general = all("SELECT * FROM price_lists WHERE scope='general' AND status='published' LIMIT 1")[0];
  const generalItems = general ? priceItemRows(general.id) : [];
  const cities = all(
    `SELECT city, COUNT(*) c FROM dealers WHERE active=1 GROUP BY city ORDER BY c DESC, city`
  );

  const seo = seoLib.build({
    title: 'لیست قیمت محصولات کیا برای عاملیت‌ها و نمایندگی‌ها',
    description:
      'لیست قیمت رسمی کوشا خودرو برای عاملیت‌ها و نمایندگی‌ها در شهرهای مختلف: قیمت پایه، سهم عاملیت، قیمت پیشنهادی مصرف‌کننده و زمان تحویل.',
    path: '/prices',
    jsonLd: [
      seoLib.organizationJsonLd(),
      seoLib.breadcrumbJsonLd([{ title: 'خانه', path: '/' }, { title: 'لیست قیمت', path: '/prices' }]),
    ],
  });

  renderPage(res, 'site/prices', {
    page: { title: 'لیست قیمت' }, seo, lists, general, generalItems, cities,
    footerProducts: footerData(),
  });
});

router.get('/prices/:slug', (req, res) => {
  const pl = get(
    `SELECT pl.*, d.name AS dealer_name, d.slug AS dealer_slug, d.city AS dealer_city
       FROM price_lists pl LEFT JOIN dealers d ON d.id = pl.dealer_id WHERE pl.slug = ?`,
    [req.params.slug]
  );
  if (!pl || pl.status !== 'published') {
    return res.status(404).render('site/404', { seo: seoLib.build({ title: 'لیست قیمت یافت نشد', noindex: true }) });
  }
  const items = priceItemRows(pl.id);
  const attachment = pl.attachment_id ? media(pl.attachment_id) : null;
  const otherLists = all(
    "SELECT title, slug, scope, city FROM price_lists WHERE status='published' AND id <> ? ORDER BY id LIMIT 6",
    [pl.id]
  );
  const history = all(
    'SELECT * FROM price_history WHERE price_list_id = ? ORDER BY id DESC LIMIT 8', [pl.id]
  );

  const scopeLabel = pl.scope === 'general' ? 'سراسر کشور' : pl.scope === 'city' ? `شهر ${pl.city}` : pl.dealer_name || 'اختصاصی';
  const seo = seoLib.build({
    title: pl.seo_title || pl.title,
    description: pl.seo_description || `${pl.title} — ${scopeLabel}. قیمت پایه، سهم عاملیت، قیمت مصرف‌کننده و موجودی.`,
    path: `/prices/${pl.slug}`,
    jsonLd: [
      seoLib.organizationJsonLd(),
      seoLib.breadcrumbJsonLd([
        { title: 'خانه', path: '/' },
        { title: 'لیست قیمت', path: '/prices' },
        { title: pl.title, path: `/prices/${pl.slug}` },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: pl.title,
        itemListElement: items.slice(0, 20).map((it, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Product',
            name: it.product_name || it.label,
            offers: it.public_price
              ? { '@type': 'Offer', price: it.public_price, priceCurrency: 'IRR' }
              : undefined,
          },
        })),
      },
    ],
  });

  renderPage(res, 'site/price-list', {
    page: { title: pl.title }, seo, pl, items, attachment, otherLists, history: history.slice(0, 4),
    scopeLabel, footerProducts: footerData(),
  });
});

/* ---------- صفحات ثابت ---------- */
router.get('/p/:slug', (req, res) => {
  const p = get(
    `SELECT p.*, c.name cat_name FROM posts p LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.slug = ? AND p.type = 'page' AND ${published()}`,
    [req.params.slug]
  );
  if (!p) return res.status(404).render('site/404', { seo: seoLib.build({ title: 'صفحه یافت نشد', noindex: true }) });
  const coverImg = cover(p);
  const seo = seoLib.build({
    title: p.seo_title || p.title,
    description: p.seo_description || p.excerpt,
    path: `/p/${p.slug}`,
    image: coverImg ? coverImg.url : null,
    robots: p.robots,
    jsonLd: [
      seoLib.organizationJsonLd(),
      seoLib.breadcrumbJsonLd([{ title: 'خانه', path: '/' }, { title: p.title, path: `/p/${p.slug}` }]),
    ],
  });
  renderPage(res, 'site/page', { page: { title: p.title }, seo, p, coverImg, footerProducts: footerData() });
});

/* ---------- sitemap.xml ---------- */
router.get('/sitemap.xml', (req, res) => {
  const s = getSettings();
  const base = seoLib.absUrl('/').replace(/\/$/, '');
  const urls = [];
  const push = (loc, lastmod, changefreq, priority) =>
    urls.push({ loc: base + loc, lastmod, changefreq, priority });

  push('/', new Date().toISOString().slice(0, 10), 'daily', '1.0');
  push('/news', null, 'daily', '0.9');
  push('/circulars', null, 'weekly', '0.9');
  push('/products', null, 'weekly', '0.9');
  push('/dealers', null, 'monthly', '0.8');
  push('/prices', null, 'weekly', '0.8');
  push('/contact', null, 'monthly', '0.5');

  all(`SELECT p.slug, p.type, p.updated_at FROM posts p WHERE ${published("AND p.type IN ('news','circular')")}`).forEach((r) => {
    push(postUrl(r), (r.updated_at || '').slice(0, 10) || null, 'weekly', '0.8');
  });
  all('SELECT slug, updated_at FROM products').forEach((r) =>
    push(`/products/${r.slug}`, (r.updated_at || '').slice(0, 10) || null, 'weekly', '0.8')
  );
  all('SELECT slug, updated_at FROM dealers WHERE active = 1').forEach((r) =>
    push(`/dealers/${r.slug}`, (r.updated_at || '').slice(0, 10) || null, 'monthly', '0.6')
  );
  all("SELECT slug, updated_at FROM price_lists WHERE status = 'published'").forEach((r) =>
    push(`/prices/${r.slug}`, (r.updated_at || '').slice(0, 10) || null, 'weekly', '0.7')
  );
  all(`SELECT slug, updated_at FROM posts p WHERE p.type='page' AND ${published()}`).forEach((r) =>
    push(`/p/${r.slug}`, (r.updated_at || '').slice(0, 10) || null, 'monthly', '0.4')
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${U.escapeHtml(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  res.type('application/xml').send(xml);
});

router.get('/robots.txt', (req, res) => {
  const s = getSettings();
  const lines = [
    'User-agent: *',
    'Disallow: /admin',
    'Disallow: /api',
    'Disallow: /search',
    'Allow: /',
    '',
    `Sitemap: ${seoLib.absUrl('/sitemap.xml')}`,
  ];
  res.type('text/plain').send(lines.join('\n'));
});

/* ---------- فید RSS ---------- */
router.get('/feed.xml', (req, res) => {
  const s = getSettings();
  const base = seoLib.absUrl('/').replace(/\/$/, '');
  const items = all(
    `SELECT p.* FROM posts p WHERE ${published("AND p.type IN ('news','circular')")}
     ORDER BY p.published_at DESC LIMIT 30`
  );
  const esc = (v) => U.escapeHtml(v || '');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>${esc(s.site_name)}</title>
  <link>${base}/</link>
  <description>${esc(s.site_description)}</description>
  <language>fa-ir</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items.map((p) => `  <item>
    <title>${esc(p.title)}</title>
    <link>${base}${postUrl(p)}</link>
    <guid isPermaLink="true">${base}${postUrl(p)}</guid>
    <pubDate>${new Date(String(p.published_at || '').replace(' ', 'T') + 'Z').toUTCString()}</pubDate>
    <category>${esc(p.type === 'circular' ? 'بخشنامه' : 'خبر')}</category>
    <description>${esc(U.truncate(p.excerpt || p.body, 300))}</description>
    <content:encoded><![CDATA[${p.body || ''}]]></content:encoded>
  </item>`).join('\n')}
</channel>
</rss>`;
  res.type('application/rss+xml').send(xml);
});

module.exports = router;
