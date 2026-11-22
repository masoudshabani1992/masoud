'use strict';
/** پنل مدیریت */
const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sanitizeHtml = require('sanitize-html');
const path = require('path');

const { all, get, run, tx } = require('../db');
const U = require('../util');
const auth = require('../auth');
const seoLib = require('../seo');
const settingsLib = require('../settings');
const { uploadImage, uploadAny, record, mediaById, removeMedia, backupDb, UPLOAD_DIR } = require('../upload');
const { DATA_DIR } = require('../db');
const { render } = require('../render-admin');

const router = express.Router();

/* ---------------- ابزارها ---------------- */
const sanitize = (html) =>
  sanitizeHtml(html || '', {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img', 'figure', 'figcaption', 'h2', 'h3', 'h4', 'span', 'iframe', 'video', 'source', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'u', 's',
    ]),
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      iframe: ['src', 'width', 'height', 'allowfullscreen', 'frameborder', 'title'],
      video: ['src', 'poster', 'controls', 'width', 'height'],
      source: ['src', 'type'],
      '*': ['class', 'id'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener' }),
      iframe: (tagName, attribs) => {
        const src = attribs.src || '';
        if (!/^https:\/\/(www\.)?(youtube\.com|youtu\.be|aparat\.com|player\.|vimeo\.com)/.test(src)) {
          return { tagName: 'span', text: 'محتوای جاسازی‌شده مجاز نیست' };
        }
        return { tagName: 'iframe', attribs: { ...attribs, loading: 'lazy' } };
      },
    },
    disallowedTagsMode: 'discard',
  });

function flash(res, type, msg) {
  return { type, msg };
}

function logActivity(req, action, entity, entityId, meta) {
  run(
    'INSERT INTO activity (user_id, action, entity, entity_id, meta) VALUES (?,?,?,?,?)',
    [req.admin ? req.admin.id : null, action, entity || '', entityId || null, meta ? JSON.stringify(meta) : '']
  );
}

function mediaMap(ids) {
  const map = {};
  const list = ids.filter(Boolean).map(Number);
  if (!list.length) return map;
  all(`SELECT * FROM media WHERE id IN (${list.join(',')})`).forEach((m) => { map[m.id] = m; });
  return map;
}

/* ---------------- ورود / خروج ---------------- */
router.get('/login', (req, res) => {
  if (req.admin) return res.redirect('/admin');
  res.render('admin/login', { error: null, next: req.query.next || '/admin', email: '' });
});

router.post('/login', (req, res) => {
  const { email, password, next } = req.body;
  const user = auth.login(String(email || '').toLowerCase().trim(), String(password || ''));
  if (!user) {
    return res.status(401).render('admin/login', {
      error: 'ایمیل یا رمز عبور اشتباه است.', next: next || '/admin', email: email || '',
    });
  }
  const { token, expires } = auth.createSession(user.id, req.ip, req.get('user-agent'));
  res.cookie(auth.COOKIE, token, {
    httpOnly: true, sameSite: 'lax', expires,
    secure: process.env.NODE_ENV === 'production' && req.secure,
  });
  run('INSERT INTO activity (user_id, action, entity) VALUES (?,?,?)', [user.id, 'login', 'auth']);
  const dest = typeof next === 'string' && next.startsWith('/admin') ? next : '/admin';
  res.redirect(dest);
});

router.post('/logout', auth.requireAuth, (req, res) => {
  auth.destroySession(req.admin.token);
  res.clearCookie(auth.COOKIE);
  res.redirect('/admin/login');
});

/* بعد از این خط، همه مسیرها نیاز به ورود دارند */
router.use(auth.requireAuth);
router.use((req, res, next) => {
  res.locals.csrf = auth.csrfToken(req);
  res.locals.flashType = req.query.ok ? 'success' : req.query.err ? 'error' : null;
  res.locals.flashMsg = req.query.ok === '1' ? 'تغییرات با موفقیت ذخیره شد.' : req.query.err || null;
  next();
});
router.use(auth.verifyCsrf);

/* ---------------- داشبورد ---------------- */
router.get('/', (req, res) => {
  const counts = {
    news: get("SELECT COUNT(*) c FROM posts WHERE type='news' AND status='published'").c,
    draftNews: get("SELECT COUNT(*) c FROM posts WHERE type='news' AND status='draft'").c,
    circulars: get("SELECT COUNT(*) c FROM posts WHERE type='circular' AND status='published'").c,
    pages: get("SELECT COUNT(*) c FROM posts WHERE type='page'").c,
    products: get('SELECT COUNT(*) c FROM products').c,
    inquiries: get("SELECT COUNT(*) c FROM inquiries WHERE status='new'").c,
    media: get('SELECT COUNT(*) c FROM media').c,
    dealers: get('SELECT COUNT(*) c FROM dealers WHERE active = 1').c,
    priceLists: get("SELECT COUNT(*) c FROM price_lists WHERE status='published'").c,
    views: get("SELECT COALESCE(SUM(views),0) v FROM posts").v + get('SELECT COALESCE(SUM(views),0) v FROM products').v,
  };
  const recentPosts = all(
    `SELECT p.id,p.title,p.type,p.status,p.published_at,p.views FROM posts p ORDER BY p.updated_at DESC LIMIT 6`
  );
  const recentInquiries = all(
    `SELECT i.*, pr.name product_name FROM inquiries i LEFT JOIN products pr ON pr.id=i.product_id ORDER BY i.id DESC LIMIT 6`
  );
  const topContent = all(
    `SELECT title, slug, type, views FROM posts WHERE status='published' ORDER BY views DESC LIMIT 5`
  );
  const seoIssues = seoLib.audit().slice(0, 5);
  const recentActivity = all(
    `SELECT a.*, u.name user_name FROM activity a LEFT JOIN users u ON u.id=a.user_id ORDER BY a.id DESC LIMIT 8`
  );

  render(res, 'admin/dashboard', {
    active: 'dashboard', title: 'داشبورد',
    counts, recentPosts, recentInquiries, topContent, seoIssues, recentActivity,
    TYPE_LABELS: U.TYPE_LABELS,
  });
});

/* ================= اخبار و بخشنامه‌ها و صفحات ================= */
const TYPE_META = {
  news: { label: 'خبر', base: '/admin/news', listTitle: 'اخبار', badge: 'خبر' },
  circular: { label: 'بخشنامه', base: '/admin/circulars', listTitle: 'بخشنامه‌ها', badge: 'بخشنامه' },
  page: { label: 'صفحه', base: '/admin/pages', listTitle: 'صفحات', badge: 'صفحه' },
};

function siteHost() {
  const u = String(settingsLib.getSettings().site_url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
  return u || 'kooshakhodro.com';
}

function postFormView(req, res, type, post) {
  const cats = all('SELECT * FROM categories WHERE type = ? ORDER BY sort, id', [type]);
  const mediaByIds = post && post.cover_id ? mediaMap([post.cover_id, post.og_image_id, post.attachment_id]) : {};
  // برای پیش‌نمایش تحلیل سئو
  const draft = {
    ...post,
    kind: type,
    seo_description_auto: seoLib.autoDescription(post || {}),
  };
  const analysis = seoLib.analyze(draft);
  render(res, 'admin/post-form', {
    active: type === 'news' ? 'news' : type === 'circular' ? 'circulars' : 'pages',
    title: post && post.id ? 'ویرایش ' + TYPE_META[type].label : 'افزودن ' + TYPE_META[type].label,
    type, meta: TYPE_META[type], post: post || {}, cats, mediaByIds,
    analysis, STATUS_LABELS: U.STATUS_LABELS, siteHost: siteHost(),
  });
}

function listQuery(type, q, status) {
  const where = ['p.type = :type'];
  const params = { type };
  if (status) { where.push('p.status = :status'); params.status = status; }
  if (q) { where.push('(p.title LIKE :q OR p.slug LIKE :q)'); params.q = `%${q}%`; }
  return { sql: where.join(' AND '), params };
}

router.get('/:type(news|circulars|pages)', (req, res, next) => {
  const type = { news: 'news', circulars: 'circular', pages: 'page' }[req.params.type];
  const meta = TYPE_META[type];
  const q = String(req.query.q || '').trim();
  const status = ['draft', 'published', 'scheduled'].includes(req.query.status) ? req.query.status : '';
  const cat = req.query.cat || '';
  const { sql, params } = listQuery(type, q, status);
  let where = sql;
  if (cat) { where += ' AND p.category_id = :cat'; params.cat = Number(cat); }
  const page = Math.max(1, Number(U.faToEnDigits(req.query.page || 1)) || 1);
  const perPage = 20;
  const total = get(`SELECT COUNT(*) c FROM posts p WHERE ${where}`, params).c;
  const rows = all(
    `SELECT p.*, c.name cat_name,
      (SELECT COUNT(*) FROM media m WHERE m.id = p.cover_id) has_cover
      FROM posts p LEFT JOIN categories c ON c.id = p.category_id
      WHERE ${where} ORDER BY p.updated_at DESC LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`,
    params
  );
  const cats = all('SELECT * FROM categories WHERE type = ? ORDER BY sort, id', [type]);
  const counts = {
    all: get('SELECT COUNT(*) c FROM posts WHERE type = ?', [type]).c,
    published: get("SELECT COUNT(*) c FROM posts WHERE type = ? AND status='published'", [type]).c,
    draft: get("SELECT COUNT(*) c FROM posts WHERE type = ? AND status='draft'", [type]).c,
    scheduled: get("SELECT COUNT(*) c FROM posts WHERE type = ? AND status='scheduled'", [type]).c,
  };
  render(res, 'admin/post-list', {
    active: type === 'news' ? 'news' : type === 'circular' ? 'circulars' : 'pages',
    title: meta.listTitle, type, meta, rows, cats, counts, q, status, cat,
    page, pages: Math.max(1, Math.ceil(total / perPage)), total,
    STATUS_LABELS: U.STATUS_LABELS,
  });
});

router.get('/:type(news|circulars|pages)/new', (req, res) => {
  const type = { news: 'news', circulars: 'circular', pages: 'page' }[req.params.type];
  postFormView(req, res, type, {
    status: 'draft',
    robots: 'index,follow',
    pinned: 0,
    featured: 0,
    doc_date: new Date().toISOString().slice(0, 10),
    template: 'default',
  });
});

router.get('/:type(news|circulars|pages)/:id/edit', (req, res) => {
  const type = { news: 'news', circulars: 'circular', pages: 'page' }[req.params.type];
  const post = get('SELECT * FROM posts WHERE id = ? AND type = ?', [Number(req.params.id), type]);
  if (!post) return res.status(404).send('مطلب یافت نشد');
  postFormView(req, res, type, post);
});

function collectPost(req, type) {
  const b = req.body;
  const isProduct = false;
  const title = String(b.title || '').trim();
  const baseSlug = U.slugify(b.slug || title);
  const id = Number(b.id) || null;
  const slug = U.uniqueSlug('posts', baseSlug, id);
  const status = ['draft', 'published', 'scheduled'].includes(b.status) ? b.status : 'draft';
  let publishedAt = b.published_at ? b.published_at.replace('T', ' ') : null;
  if (status === 'published' && !publishedAt) publishedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  if (status === 'draft' && !publishedAt) publishedAt = null;

  return {
    type, title, slug,
    excerpt: String(b.excerpt || '').trim(),
    body: sanitize(b.body || ''),
    cover_id: Number(b.cover_id) || null,
    category_id: type === 'page' ? null : Number(b.category_id) || null,
    status,
    featured: b.featured ? 1 : 0,
    pinned: b.pinned ? 1 : 0,
    published_at: publishedAt,
    seo_title: String(b.seo_title || '').trim(),
    seo_description: String(b.seo_description || '').trim(),
    seo_keywords: String(b.seo_keywords || '').trim(),
    canonical: String(b.canonical || '').trim(),
    robots: b.robots || 'index,follow',
    og_image_id: Number(b.og_image_id) || null,
    doc_number: String(b.doc_number || '').trim(),
    doc_date: b.doc_date || null,
    attachment_id: Number(b.attachment_id) || null,
    template: b.template || 'default',
    author_id: Number(b.author_id) || (req.admin ? req.admin.id : null),
  };
}

function savePost(req, type, id) {
  const d = collectPost(req, type);
  if (!d.title) throw new Error('عنوان الزامی است');
  const fields = Object.keys(d).filter((k) => k !== 'type' && k !== 'author_id');
  if (id) {
    const sets = fields.map((f) => `${f} = :${f}`).join(', ');
    run(`UPDATE posts SET ${sets}, updated_at = datetime('now') WHERE id = :id AND type = :type`,
      { ...d, id: Number(id) });
    return Number(id);
  }
  const cols = [...fields, 'type', 'author_id'];
  const placeholders = cols.map((c) => ':' + c).join(',');
  const r = run(`INSERT INTO posts (${cols.join(',')}) VALUES (${placeholders})`, d);
  return Number(r.lastInsertRowid);
}

router.post('/:type(news|circulars|pages)/save', (req, res, next) => {
  const type = { news: 'news', circulars: 'circular', pages: 'page' }[req.params.type];
  const id = Number(req.body.id) || null;
  try {
    // بررسی تکراری نبودن اسلاگ
    const dup = get('SELECT id FROM posts WHERE slug = ? AND type = ? AND id <> ?', [
      U.slugify(req.body.slug || req.body.title), type, id || 0,
    ]);
    const savedId = savePost(req, type, id);
    logActivity(req, id ? 'update' : 'create', 'post', savedId, { title: req.body.title });
    const action = String(req.body._action || 'save');
    if (action === 'publish') {
      run("UPDATE posts SET status='published', published_at=COALESCE(published_at, datetime('now')) WHERE id = ?", [savedId]);
    }
    const back = TYPE_META[type].base;
    res.redirect(`${back}/${savedId}/edit?ok=1${action === 'publish' ? '&published=1' : ''}`);
  } catch (e) {
    next(e);
  }
});

router.post('/:type(news|circulars|pages)/:id/delete', (req, res) => {
  const type = { news: 'news', circulars: 'circular', pages: 'page' }[req.params.type];
  run('DELETE FROM posts WHERE id = ? AND type = ?', [Number(req.params.id), type]);
  logActivity(req, 'delete', 'post', Number(req.params.id));
  res.redirect(TYPE_META[type].base + '?ok=1');
});

router.post('/:type(news|circulars|pages)/:id/status', (req, res) => {
  const type = { news: 'news', circulars: 'circular', pages: 'page' }[req.params.type];
  const status = ['draft', 'published', 'scheduled'].includes(req.body.status) ? req.body.status : 'draft';
  run(
    `UPDATE posts SET status = ?, published_at = CASE WHEN ?='published' THEN COALESCE(published_at, datetime('now')) ELSE published_at END, updated_at = datetime('now') WHERE id = ?`,
    [status, status, Number(req.params.id)]
  );
  res.redirect(TYPE_META[type].base + '?ok=1');
});

/** API تحلیل زنده سئو (برای فرم) */
router.post('/seo/analyze', (req, res) => {
  const b = req.body || {};
  const analyze = seoLib.analyze({
    kind: b.kind || 'news',
    title: b.title, name: b.title, slug: b.slug,
    seo_title: b.seo_title, seo_description: b.seo_description,
    seo_keywords: b.seo_keywords, body: b.body, excerpt: b.excerpt,
    cover_id: b.cover_id ? 1 : null,
    status: b.status,
  });
  res.json({ ...analyze, previewUrl: seoLib.absUrl('/' + (b.slug || '')), siteName: settingsLib.getSettings().site_name });
});

/* ================= محصولات ================= */
router.get('/products', (req, res) => {
  const q = String(req.query.q || '').trim();
  const where = ['1=1'];
  const params = {};
  if (q) { where.push('(p.name LIKE :q OR p.slug LIKE :q)'); params.q = `%${q}%`; }
  if (req.query.cat) { where.push('p.category_id = :cat'); params.cat = Number(req.query.cat); }
  const rows = all(
    `SELECT p.*, c.name cat_name, (SELECT filename FROM media m WHERE m.id = p.cover_id) cover_file
     FROM products p LEFT JOIN categories c ON c.id = p.category_id
     WHERE ${where.join(' AND ')} ORDER BY p.sort, p.id`, params
  );
  const cats = all("SELECT * FROM categories WHERE type='product' ORDER BY sort, id");
  render(res, 'admin/product-list', {
    active: 'products', title: 'محصولات', rows, cats, q,
    cat: req.query.cat || '', STATUS_LABELS: U.STATUS_LABELS,
  });
});

router.get('/products/new', (req, res) => {
  render(res, 'admin/product-form', {
    active: 'products', title: 'افزودن محصول',
    p: { status: 'available', robots: 'index,follow', specs_json: '[]', gallery_json: '[]' },
    cats: all("SELECT * FROM categories WHERE type='product' ORDER BY sort, id"),
    specs: [], gallery: [], coverUrl: null, analysis: seoLib.analyze({ kind: 'product' }), siteHost: siteHost(),
    STATUS_LABELS: U.STATUS_LABELS,
  });
});

router.get('/products/:id/edit', (req, res) => {
  const p = get('SELECT * FROM products WHERE id = ?', [Number(req.params.id)]);
  if (!p) return res.status(404).send('محصول یافت نشد');
  const specs = JSON.parse(p.specs_json || '[]');
  const gallery = JSON.parse(p.gallery_json || '[]').map(mediaById).filter(Boolean);
  const cov = mediaById(p.cover_id);
  render(res, 'admin/product-form', {
    active: 'products', title: 'ویرایش محصول', p, specs, gallery, coverUrl: cov ? cov.url : null,
    cats: all("SELECT * FROM categories WHERE type='product' ORDER BY sort, id"),
    analysis: seoLib.analyze({ ...p, kind: 'product' }),
    STATUS_LABELS: U.STATUS_LABELS, siteHost: siteHost(),
  });
});

function specList(body) {
  const labels = [].concat(body.spec_label || []);
  const values = [].concat(body.spec_value || []);
  const out = [];
  for (let i = 0; i < labels.length; i++) {
    const l = String(labels[i] || '').trim();
    const v = String(values[i] || '').trim();
    if (l) out.push({ label: l, value: v });
  }
  return out;
}

function saveProduct(req, id) {
  const b = req.body;
  const name = String(b.name || '').trim();
  if (!name) throw new Error('نام محصول الزامی است');
  const slug = U.uniqueSlug('products', U.slugify(b.slug || name), id);
  const price = b.price === '' || b.price == null ? null : Number(U.faToEnDigits(String(b.price)).replace(/\D/g, '')) || null;
  const galleryIds = [].concat(b.gallery_id || []).map(Number).filter(Boolean);
  const d = {
    name, slug,
    model: String(b.model || '').trim(),
    category_id: Number(b.category_id) || null,
    short_desc: String(b.short_desc || '').trim(),
    body: sanitize(b.body || ''),
    price,
    price_note: String(b.price_note || '').trim(),
    engine: String(b.engine || '').trim(),
    transmission: String(b.transmission || '').trim(),
    fuel: String(b.fuel || '').trim(),
    status: ['available', 'soon', 'out'].includes(b.status) ? b.status : 'available',
    specs_json: JSON.stringify(specList(b)),
    gallery_json: JSON.stringify(galleryIds),
    cover_id: Number(b.cover_id) || null,
    featured: b.featured ? 1 : 0,
    sort: Number(b.sort) || 0,
    seo_title: String(b.seo_title || '').trim(),
    seo_description: String(b.seo_description || '').trim(),
    seo_keywords: String(b.seo_keywords || '').trim(),
    canonical: String(b.canonical || '').trim(),
    robots: b.robots || 'index,follow',
    og_image_id: Number(b.og_image_id) || null,
  };
  if (id) {
    const sets = Object.keys(d).map((k) => `${k} = :${k}`).join(', ');
    run(`UPDATE products SET ${sets}, updated_at = datetime('now') WHERE id = :id`, { ...d, id: Number(id) });
    return Number(id);
  }
  const cols = Object.keys(d);
  const r = run(`INSERT INTO products (${cols.join(',')}) VALUES (${cols.map((c) => ':' + c).join(',')})`, d);
  return Number(r.lastInsertRowid);
}

router.post('/products/save', (req, res, next) => {
  try {
    const id = Number(req.body.id) || null;
    const savedId = saveProduct(req, id);
    logActivity(req, id ? 'update' : 'create', 'product', savedId, { name: req.body.name });
    res.redirect(`/admin/products/${savedId}/edit?ok=1`);
  } catch (e) { next(e); }
});

router.post('/products/:id/delete', (req, res) => {
  run('DELETE FROM products WHERE id = ?', [Number(req.params.id)]);
  logActivity(req, 'delete', 'product', Number(req.params.id));
  res.redirect('/admin/products?ok=1');
});

/* ================= اسلایدر صفحه اصلی ================= */
router.get('/slides', (req, res) => {
  const rows = all(
    `SELECT sl.*, m.url AS image_url FROM slides sl LEFT JOIN media m ON m.id = sl.image_id
      ORDER BY sl.sort, sl.id`
  );
  render(res, 'admin/slides', {
    active: 'slides', title: 'اسلایدر صفحه اصلی', rows,
    alignment: { right: 'راست‌چین', center: 'وسط‌چین' },
  });
});

router.get('/slides/new', (req, res) => {
  render(res, 'admin/slide-form', {
    active: 'slides', title: 'اسلاید جدید',
    sl: { overlay: 55, align: 'right', active: 1, sort: 0 }, imageUrl: null, order: 1,
    alignment: { right: 'راست‌چین', center: 'وسط‌چین' },
  });
});

router.get('/slides/:id/edit', (req, res) => {
  const sl = get('SELECT * FROM slides WHERE id = ?', [Number(req.params.id)]);
  if (!sl) return res.status(404).send('اسلاید یافت نشد');
  const img = mediaById(sl.image_id);
  render(res, 'admin/slide-form', {
    active: 'slides', title: 'ویرایش اسلاید', sl,
    imageUrl: img ? img.url : null,
    order: get('SELECT COUNT(*) c FROM slides').c,
    alignment: { right: 'راست‌چین', center: 'وسط‌چین' },
  });
});

router.post('/slides/save', (req, res, next) => {
  try {
    const b = req.body;
    const id = Number(b.id) || null;
    const title = String(b.title || '').trim();
    if (!title) { const e = new Error('عنوان اسلاید الزامی است'); e.status = 400; throw e; }
    const d = {
      kicker: String(b.kicker || '').trim(),
      title,
      subtitle: String(b.subtitle || '').trim(),
      image_id: Number(b.image_id) || null,
      overlay: Math.min(90, Math.max(0, Number(b.overlay) || 0)),
      align: b.align === 'center' ? 'center' : 'right',
      btn1_label: String(b.btn1_label || '').trim(),
      btn1_url: String(b.btn1_url || '').trim(),
      btn2_label: String(b.btn2_label || '').trim(),
      btn2_url: String(b.btn2_url || '').trim(),
      active: b.active ? 1 : 0,
      sort: Number(b.sort) || 0,
    };
    if (id) {
      const sets = Object.keys(d).map((k) => `${k} = :${k}`).join(', ');
      run(`UPDATE slides SET ${sets}, updated_at = datetime('now') WHERE id = :id`, { ...d, id });
    } else {
      const cols = Object.keys(d);
      run(`INSERT INTO slides (${cols.join(',')}) VALUES (${cols.map((c) => ':' + c).join(',')})`, d);
    }
    logActivity(req, id ? 'update' : 'create', 'slide', id || title, { title });
    res.redirect('/admin/slides?ok=1');
  } catch (e) { next(e); }
});

router.post('/slides/:id/delete', (req, res) => {
  run('DELETE FROM slides WHERE id = ?', [Number(req.params.id)]);
  logActivity(req, 'delete', 'slide', Number(req.params.id));
  res.redirect('/admin/slides?ok=1');
});

router.post('/slides/:id/toggle', (req, res) => {
  run('UPDATE slides SET active = 1 - active WHERE id = ?', [Number(req.params.id)]);
  res.redirect('/admin/slides?ok=1');
});

router.post('/slides/:id/move', (req, res) => {
  const id = Number(req.params.id);
  const dir = req.body.dir === 'up' ? -1 : 1;
  const rows = all('SELECT id FROM slides ORDER BY sort, id');
  const idx = rows.findIndex((s) => s.id === id);
  const swap = idx + dir;
  if (idx >= 0 && swap >= 0 && swap < rows.length) {
    // جای دو ردیف را عوض می‌کنیم و sort را بر اساس ترتیب جدید بازنویسی می‌کنیم
    const order = rows.slice();
    order[idx] = rows[swap];
    order[swap] = rows[idx];
    tx(() => order.forEach((s, i) => run('UPDATE slides SET sort = ? WHERE id = ?', [i, s.id])));
  }
  res.redirect('/admin/slides?ok=1');
});

/* ================= نمایندگی‌ها / عاملیت‌ها ================= */
const DEALER_TYPES = { dealer: 'نمایندگی فروش', agency: 'عاملیت خدمات', both: 'نمایندگی و عاملیت' };
const SERVICES = ['فروش', 'خدمات پس از فروش', 'قطعات یدکی'];

router.get('/dealers', (req, res) => {
  const q = String(req.query.q || '').trim();
  const city = String(req.query.city || '').trim();
  const where = ['1=1'];
  const params = {};
  if (q) { where.push('(d.name LIKE :q OR d.address LIKE :q OR d.phone LIKE :q)'); params.q = `%${q}%`; }
  if (city) { where.push('d.city = :city'); params.city = city; }
  const rows = all(
    `SELECT d.*, pl.title AS price_list_title,
            (SELECT COUNT(*) FROM price_items pi WHERE pi.price_list_id = d.price_list_id) AS price_items
       FROM dealers d LEFT JOIN price_lists pl ON pl.id = d.price_list_id
      WHERE ${where.join(' AND ')} ORDER BY d.city, d.sort, d.id`, params
  );
  const cities = all('SELECT city, COUNT(*) c FROM dealers GROUP BY city ORDER BY c DESC, city');
  const priceLists = all("SELECT id, title, scope, city FROM price_lists WHERE status='published' ORDER BY id");
  render(res, 'admin/dealer-list', {
    active: 'dealers', title: 'نمایندگی‌ها و عاملیت‌ها',
    rows, cities, q, city, priceLists, DEALER_TYPES,
  });
});

router.get('/dealers/new', (req, res) => {
  render(res, 'admin/dealer-form', {
    active: 'dealers', title: 'افزودن نمایندگی',
    d: { type: 'dealer', active: 1, sort: 0, services: '[]' },
    priceLists: all("SELECT id, title, scope, city FROM price_lists ORDER BY id"),
    DEALER_TYPES, SERVICES, coverUrl: null, citiesList: all('SELECT DISTINCT city FROM dealers ORDER BY city'),
  });
});

router.get('/dealers/:id/edit', (req, res) => {
  const d = get('SELECT * FROM dealers WHERE id = ?', [Number(req.params.id)]);
  if (!d) return res.status(404).send('نمایندگی یافت نشد');
  const cov = mediaById(d.cover_id);
  render(res, 'admin/dealer-form', {
    active: 'dealers', title: 'ویرایش نمایندگی', d,
    priceLists: all("SELECT id, title, scope, city FROM price_lists ORDER BY id"),
    DEALER_TYPES, SERVICES, coverUrl: cov ? cov.url : null,
    citiesList: all('SELECT DISTINCT city FROM dealers ORDER BY city'),
  });
});

router.post('/dealers/save', (req, res, next) => {
  try {
    const b = req.body;
    const id = Number(b.id) || null;
    const name = String(b.name || '').trim();
    if (!name) throw new Error('نام نمایندگی الزامی است');
    const slug = U.uniqueSlug('dealers', U.slugify(b.slug || name), id);
    const services = [].concat(b.services || []).map(String);
    const d = {
      name, slug,
      code: String(b.code || '').trim(),
      type: Object.keys(DEALER_TYPES).includes(b.type) ? b.type : 'dealer',
      city: String(b.city || '').trim(),
      province: String(b.province || '').trim(),
      address: String(b.address || '').trim(),
      phone: String(b.phone || '').trim(),
      mobile: String(b.mobile || '').trim(),
      email: String(b.email || '').trim(),
      hours: String(b.hours || '').trim(),
      lat: b.lat ? Number(b.lat) : null,
      lng: b.lng ? Number(b.lng) : null,
      map_url: String(b.map_url || '').trim(),
      manager: String(b.manager || '').trim(),
      cover_id: Number(b.cover_id) || null,
      services: JSON.stringify(services),
      price_list_id: Number(b.price_list_id) || null,
      active: b.active ? 1 : 0,
      sort: Number(b.sort) || 0,
      seo_title: String(b.seo_title || '').trim(),
      seo_description: String(b.seo_description || '').trim(),
    };
    if (!d.city) throw new Error('شهر الزامی است');
    if (id) {
      const sets = Object.keys(d).map((k) => `${k} = :${k}`).join(', ');
      run(`UPDATE dealers SET ${sets}, updated_at = datetime('now') WHERE id = :id`, { ...d, id });
    } else {
      const cols = Object.keys(d);
      run(`INSERT INTO dealers (${cols.join(',')}) VALUES (${cols.map((c) => ':' + c).join(',')})`, d);
    }
    logActivity(req, id ? 'update' : 'create', 'dealer', id || slug, { name });
    res.redirect('/admin/dealers?ok=1');
  } catch (e) { next(e); }
});

router.post('/dealers/:id/delete', (req, res) => {
  run('DELETE FROM dealers WHERE id = ?', [Number(req.params.id)]);
  logActivity(req, 'delete', 'dealer', Number(req.params.id));
  res.redirect('/admin/dealers?ok=1');
});

router.post('/dealers/:id/toggle', (req, res) => {
  run('UPDATE dealers SET active = 1 - active WHERE id = ?', [Number(req.params.id)]);
  res.redirect('/admin/dealers?ok=1');
});

/* ================= لیست قیمت ================= */
const SCOPE_LABELS = { general: 'سراسری', city: 'شهری', dealer: 'اختصاصی یک مرکز' };

router.get('/prices', (req, res) => {
  const lists = all(
    `SELECT pl.*, d.name AS dealer_name,
            (SELECT COUNT(*) FROM price_items pi WHERE pi.price_list_id = pl.id) AS items_count,
            (SELECT MIN(final_price) FROM price_items pi WHERE pi.price_list_id = pl.id) AS min_price
       FROM price_lists pl LEFT JOIN dealers d ON d.id = pl.dealer_id
      ORDER BY CASE pl.scope WHEN 'general' THEN 0 WHEN 'city' THEN 1 ELSE 2 END, pl.city, pl.id`
  );
  render(res, 'admin/price-list-list', {
    active: 'prices', title: 'لیست‌های قیمت', lists, SCOPE_LABELS,
  });
});

function priceListFormData() {
  return {
    products: all('SELECT id, name, slug, price FROM products ORDER BY sort, id'),
    dealers: all('SELECT id, name, city FROM dealers ORDER BY city, sort'),
  };
}

router.get('/prices/new', (req, res) => {
  const data = priceListFormData();
  render(res, 'admin/price-list-form', {
    active: 'prices', title: 'لیست قیمت جدید',
    pl: { scope: 'general', customer_type: 'dealer', status: 'draft' },
    items: [], ...data, SCOPE_LABELS, attachment: null,
  });
});

router.get('/prices/:id/edit', (req, res) => {
  const pl = get('SELECT * FROM price_lists WHERE id = ?', [Number(req.params.id)]);
  if (!pl) return res.status(404).send('لیست قیمت یافت نشد');
  const items = all('SELECT * FROM price_items WHERE price_list_id = ? ORDER BY sort, id', [pl.id]);
  render(res, 'admin/price-list-form', {
    active: 'prices', title: 'ویرایش لیست قیمت', pl, items,
    ...priceListFormData(), SCOPE_LABELS,
    attachment: pl.attachment_id ? mediaById(pl.attachment_id) : null,
  });
});

router.post('/prices/save', (req, res, next) => {
  try {
    const b = req.body;
    const id = Number(b.id) || null;
    const title = String(b.title || '').trim();
    if (!title) throw new Error('عنوان لیست الزامی است');
    const slug = U.uniqueSlug('price_lists', U.slugify(b.slug || title), id);
    const pl = {
      title, slug,
      scope: Object.keys(SCOPE_LABELS).includes(b.scope) ? b.scope : 'general',
      city: String(b.city || '').trim() || null,
      dealer_id: Number(b.dealer_id) || null,
      customer_type: ['dealer', 'agency', 'public'].includes(b.customer_type) ? b.customer_type : 'dealer',
      effective_from: b.effective_from || null,
      effective_to: b.effective_to || null,
      notes: String(b.notes || '').trim(),
      status: b.status === 'published' ? 'published' : 'draft',
      attachment_id: Number(b.attachment_id) || null,
      seo_title: String(b.seo_title || '').trim(),
      seo_description: String(b.seo_description || '').trim(),
    };
    let listId = id;
    if (id) {
      const sets = Object.keys(pl).map((k) => `${k} = :${k}`).join(', ');
      run(`UPDATE price_lists SET ${sets}, updated_at = datetime('now') WHERE id = :id`, { ...pl, id });
    } else {
      const cols = Object.keys(pl);
      const r = run(`INSERT INTO price_lists (${cols.join(',')}) VALUES (${cols.map((c) => ':' + c).join(',')})`, pl);
      listId = Number(r.lastInsertRowid);
    }

    // اقلام قیمت — بازنویسی کامل با مقایسه برای ثبت سابقه تغییر قیمت
    const old = all('SELECT * FROM price_items WHERE price_list_id = ?', [listId]);
    const ids = [].concat(b.item_id || []);
    const productIds = [].concat(b.item_product_id || []);
    const labels = [].concat(b.item_label || []);
    const years = [].concat(b.item_year || []);
    const colors = [].concat(b.item_color || []);
    const basePrices = [].concat(b.item_base_price || []);
    const discounts = [].concat(b.item_discount || []);
    const finals = [].concat(b.item_final_price || []);
    const publics = [].concat(b.item_public_price || []);
    const stocks = [].concat(b.item_stock || []);
    const deliveries = [].concat(b.item_delivery || []);
    const notes = [].concat(b.item_note || []);

    const toNum = (v) => {
      const clean = U.faToEnDigits(String(v == null ? '' : v)).replace(/[^\d-]/g, '');
      return clean === '' ? null : Number(clean);
    };

    const keptIds = [];
    for (let i = 0; i < labels.length; i++) {
      const label = String(labels[i] || '').trim();
      const pid = Number(productIds[i]) || null;
      if (!label && !pid) continue;
      const row = {
        price_list_id: listId,
        product_id: pid,
        label,
        model_year: String(years[i] || '').trim(),
        color: String(colors[i] || '').trim(),
        base_price: toNum(basePrices[i]),
        dealer_discount: toNum(discounts[i]) || 0,
        final_price: toNum(finals[i]),
        public_price: toNum(publics[i]),
        stock: toNum(stocks[i]),
        delivery: String(deliveries[i] || '').trim(),
        note: String(notes[i] || '').trim(),
        sort: i,
      };
      // اگر قیمت نهایی خالی بود، محاسبه کن
      if (row.final_price == null && row.base_price != null) {
        row.final_price = row.base_price - (row.dealer_discount || 0);
      }
      const existingId = Number(ids[i]) || null;
      if (existingId) {
        run(
          `UPDATE price_items SET product_id=:product_id, label=:label, model_year=:model_year, color=:color,
             base_price=:base_price, dealer_discount=:dealer_discount, final_price=:final_price,
             public_price=:public_price, stock=:stock, delivery=:delivery, note=:note, sort=:sort
           WHERE id=:id`, { ...row, id: existingId }
        );
        keptIds.push(existingId);
        const before = old.find((o) => o.id === existingId);
        if (before && before.final_price != null && row.final_price != null && before.final_price !== row.final_price) {
          run(
            `INSERT INTO price_history (price_list_id, product_id, label, old_price, new_price, changed_by)
             VALUES (?,?,?,?,?,?)`,
            [listId, row.product_id, row.label, before.final_price, row.final_price, req.admin.id]
          );
        }
      } else {
        const r = run(
          `INSERT INTO price_items (price_list_id, product_id, label, model_year, color, base_price,
             dealer_discount, final_price, public_price, stock, delivery, note, sort)
           VALUES (:price_list_id, :product_id, :label, :model_year, :color, :base_price,
             :dealer_discount, :final_price, :public_price, :stock, :delivery, :note, :sort)`, row
        );
        keptIds.push(Number(r.lastInsertRowid));
      }
    }
    const toDelete = old.filter((o) => !keptIds.includes(o.id));
    toDelete.forEach((o) => run('DELETE FROM price_items WHERE id = ?', [o.id]));

    logActivity(req, id ? 'update' : 'create', 'price_list', listId, { title });
    res.redirect(`/admin/prices/${listId}/edit?ok=1`);
  } catch (e) { next(e); }
});

router.post('/prices/:id/delete', (req, res) => {
  const id = Number(req.params.id);
  run('DELETE FROM price_items WHERE price_list_id = ?', [id]);
  run('DELETE FROM price_lists WHERE id = ?', [id]);
  logActivity(req, 'delete', 'price_list', id);
  res.redirect('/admin/prices?ok=1');
});

router.post('/prices/:id/status', (req, res) => {
  run("UPDATE price_lists SET status = ?, updated_at = datetime('now') WHERE id = ?",
    [req.body.status === 'published' ? 'published' : 'draft', Number(req.params.id)]);
  res.redirect('/admin/prices?ok=1');
});

/** کپی لیست قیمت برای شهر دیگر (با تغییر درصد) */
router.post('/prices/:id/copy', (req, res) => {
  const src = get('SELECT * FROM price_lists WHERE id = ?', [Number(req.params.id)]);
  if (!src) return res.redirect('/admin/prices?err=' + encodeURIComponent('لیست مبدا یافت نشد'));
  const city = String(req.body.city || '').trim();
  const pct = Number(U.faToEnDigits(String(req.body.percent || '0'))) || 0;
  if (!city) return res.redirect('/admin/prices?err=' + encodeURIComponent('نام شهر الزامی است'));
  const title = `لیست قیمت نمایندگی‌های ${city}`;
  const slug = U.uniqueSlug('price_lists', U.slugify(`price-list-${city}`));
  const r = run(
    `INSERT INTO price_lists (title, slug, scope, city, customer_type, effective_from, effective_to, notes, status, seo_title, seo_description)
     VALUES (?,?,'city',?,?,?,?,?, 'draft', ?, ?)`,
    [title, slug, city, src.customer_type, src.effective_from, src.effective_to,
      String(req.body.notes || src.notes || ''), title, `لیست قیمت محصولات کیا برای نمایندگی‌های ${city}.`]
  );
  const newId = Number(r.lastInsertRowid);
  all('SELECT * FROM price_items WHERE price_list_id = ?', [src.id]).forEach((it) => {
    const factor = 1 + pct / 100;
    const base = it.base_price != null ? Math.round(it.base_price * factor) : null;
    const pub = it.public_price != null ? Math.round(it.public_price * factor) : null;
    const fin = base != null ? base - (it.dealer_discount || 0) : it.final_price;
    run(
      `INSERT INTO price_items (price_list_id, product_id, label, model_year, color, base_price, dealer_discount, final_price, public_price, stock, delivery, note, sort)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [newId, it.product_id, it.label, it.model_year, it.color, base, it.dealer_discount, fin, pub, it.stock, it.delivery, it.note, it.sort]
    );
  });
  logActivity(req, 'copy', 'price_list', newId, { from: src.id, city, percent: pct });
  res.redirect(`/admin/prices/${newId}/edit?ok=1`);
});

/* ================= دسته‌بندی‌ها ================= */
router.get('/categories', (req, res) => {
  const type = ['news', 'circular', 'product'].includes(req.query.type) ? req.query.type : 'news';
  const rows = all(
    `SELECT c.*, (SELECT COUNT(*) FROM posts p WHERE p.category_id=c.id) + (SELECT COUNT(*) FROM products pr WHERE pr.category_id=c.id) used
     FROM categories c WHERE c.type = ? ORDER BY c.sort, c.id`, [type]
  );
  render(res, 'admin/categories', { active: 'categories', title: 'دسته‌بندی‌ها', rows, type });
});

router.post('/categories/save', (req, res) => {
  const type = ['news', 'circular', 'product'].includes(req.body.type) ? req.body.type : 'news';
  const name = String(req.body.name || '').trim();
  const id = Number(req.body.id) || null;
  if (!name) return res.redirect('/admin/categories?type=' + type + '&err=' + encodeURIComponent('نام دسته الزامی است'));
  const slugBase = U.slugify(req.body.slug || name);
  const dup = get('SELECT id FROM categories WHERE type=? AND slug=? AND id<>?', [type, slugBase, id || 0]);
  const slug = dup ? `${slugBase}-${Date.now().toString(36).slice(-4)}` : slugBase;
  if (id) {
    run('UPDATE categories SET name=?, slug=?, description=?, sort=? WHERE id=? AND type=?',
      [name, slug, String(req.body.description || ''), Number(req.body.sort) || 0, id, type]);
  } else {
    run('INSERT INTO categories (type,name,slug,description,sort) VALUES (?,?,?,?,?)',
      [type, name, slug, String(req.body.description || ''), Number(req.body.sort) || 0]);
  }
  res.redirect('/admin/categories?type=' + type + '&ok=1');
});

router.post('/categories/:id/delete', (req, res) => {
  const cat = get('SELECT type FROM categories WHERE id = ?', [Number(req.params.id)]);
  run('UPDATE posts SET category_id = NULL WHERE category_id = ?', [Number(req.params.id)]);
  run('UPDATE products SET category_id = NULL WHERE category_id = ?', [Number(req.params.id)]);
  run('DELETE FROM categories WHERE id = ?', [Number(req.params.id)]);
  res.redirect('/admin/categories?type=' + (cat ? cat.type : 'news') + '&ok=1');
});

/* ================= رسانه ================= */
router.get('/media', (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const perPage = 24;
  const total = get('SELECT COUNT(*) c FROM media').c;
  const items = all(`SELECT * FROM media ORDER BY id DESC LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`);
  render(res, 'admin/media', {
    active: 'media', title: 'کتابخانه رسانه', items, page,
    pages: Math.max(1, Math.ceil(total / perPage)), total,
    pick: req.query.pick || '', FA: U.faBytes,
  });
});

router.post('/media/upload', uploadImage.array('files', 12), (req, res) => {
  const token = auth.csrfToken(req);
  if ((req.body && req.body._csrf) !== token && req.get('x-csrf-token') !== token) {
    return res.status(403).send('توکن امنیتی نامعتبر است.');
  }
  const created = (req.files || []).map((f) => record(f, req.admin.id, String(req.body.alt || '')));
  if (req.get('accept') && req.get('accept').includes('application/json')) {
    return res.json({ ok: true, items: created });
  }
  res.redirect('/admin/media?ok=1');
});

router.post('/media/upload-json', uploadImage.array('files', 12), (req, res) => {
  if (req.get('x-csrf-token') !== auth.csrfToken(req)) return res.status(403).json({ error: 'csrf' });
  const created = (req.files || []).map((f) => record(f, req.admin.id, ''));
  res.json({ ok: true, items: created });
});

router.post('/media/file', uploadAny.single('file'), (req, res) => {
  if (req.get('x-csrf-token') !== auth.csrfToken(req)) return res.status(403).json({ error: 'csrf' });
  if (!req.file) return res.status(400).json({ error: 'فایلی دریافت نشد' });
  const m = record(req.file, req.admin.id, String(req.body.alt || ''));
  res.json({ ok: true, item: m });
});

router.post('/media/:id/alt', (req, res) => {
  run('UPDATE media SET alt = ? WHERE id = ?', [String(req.body.alt || ''), Number(req.params.id)]);
  res.redirect('/admin/media?ok=1');
});

router.post('/media/:id/delete', (req, res) => {
  removeMedia(Number(req.params.id));
  res.redirect('/admin/media?ok=1');
});

/* ================= SEO ================= */
router.get('/seo', (req, res) => {
  const s = settingsLib.getSettings();
  const issues = seoLib.audit();
  const redirects = all('SELECT * FROM redirects ORDER BY id DESC');
  const publishedPosts = all(
    `SELECT id, title, type, slug, seo_title, seo_description, cover_id, views FROM posts WHERE status='published' ORDER BY views DESC LIMIT 50`
  );
  const products = all('SELECT id, name, slug, seo_title, seo_description, cover_id FROM products ORDER BY id');
  const missingMeta = publishedPosts.filter((p) => !p.seo_description).length;
  render(res, 'admin/seo', {
    active: 'seo', title: 'سئو', s, issues, redirects, publishedPosts, products, missingMeta,
  });
});

router.post('/seo/settings', (req, res) => {
  const keys = [
    'seo_title_template', 'seo_description_max', 'robots_global', 'google_analytics_id',
    'google_search_console', 'google_site_verification', 'default_og_image',
  ];
  const obj = {};
  keys.forEach((k) => { obj[k] = req.body[k] || ''; });
  obj.robots_global = req.body.robots_global === 'noindex,nofollow' ? 'noindex,nofollow' : 'index,follow';
  settingsLib.setSettings(obj);
  res.redirect('/admin/seo?ok=1');
});

router.post('/seo/redirects/save', (req, res) => {
  const from = String(req.body.from_path || '').trim();
  const to = String(req.body.to_path || '').trim();
  if (!from || !to) return res.redirect('/admin/seo?err=' + encodeURIComponent('هر دو مسیر الزامی است'));
  const id = Number(req.body.id) || null;
  const code = [301, 302, 410].includes(Number(req.body.code)) ? Number(req.body.code) : 301;
  if (id) {
    run('UPDATE redirects SET from_path=?, to_path=?, code=? WHERE id=?', [from, to, code, id]);
  } else {
    run('INSERT INTO redirects (from_path, to_path, code) VALUES (?,?,?) ON CONFLICT(from_path) DO UPDATE SET to_path=excluded.to_path, code=excluded.code', [from, to, code]);
  }
  res.redirect('/admin/seo?ok=1');
});

router.post('/seo/redirects/:id/delete', (req, res) => {
  run('DELETE FROM redirects WHERE id = ?', [Number(req.params.id)]);
  res.redirect('/admin/seo?ok=1');
});

/* ================= استعلام‌ها / پیام‌ها ================= */
router.get('/inquiries', (req, res) => {
  const status = ['new', 'done'].includes(req.query.status) ? req.query.status : '';
  const where = status ? 'WHERE i.status = ?' : '';
  const rows = all(
    `SELECT i.*, pr.name product_name, pr.slug product_slug FROM inquiries i
     LEFT JOIN products pr ON pr.id = i.product_id ${where} ORDER BY i.id DESC LIMIT 200`,
    status ? [status] : []
  );
  render(res, 'admin/inquiries', {
    active: 'inquiries', title: 'درخواست‌ها و استعلام‌ها', rows, status,
    newCount: get("SELECT COUNT(*) c FROM inquiries WHERE status='new'").c,
  });
});

router.post('/inquiries/:id/status', (req, res) => {
  run('UPDATE inquiries SET status = ? WHERE id = ?',
    [req.body.status === 'done' ? 'done' : 'new', Number(req.params.id)]);
  res.redirect('/admin/inquiries?ok=1');
});

router.post('/inquiries/:id/delete', (req, res) => {
  run('DELETE FROM inquiries WHERE id = ?', [Number(req.params.id)]);
  res.redirect('/admin/inquiries?ok=1');
});

/* ================= تنظیمات ================= */
router.get('/settings', (req, res) => {
  render(res, 'admin/settings', {
    active: 'settings', title: 'تنظیمات سایت', s: settingsLib.getSettings(),
  });
});

router.post('/settings', (req, res) => {
  const allowed = [
    'site_name', 'site_tagline', 'site_description', 'site_url', 'logo_url', 'logo_dark_url', 'favicon_url',
    'phone', 'sales_phone', 'support_phone', 'email', 'address', 'social_instagram', 'social_telegram',
    'social_linkedin', 'social_aparat', 'footer_about', 'sale_url', 'inquiry_notify_email',
  ];
  const obj = {};
  allowed.forEach((k) => { obj[k] = req.body[k] || ''; });
  // مقدار سلکت «0» هم باید صریحاً غیرفعال ذخیره شود (نه با truthiness)
  obj.slider_autoplay = String(req.body.slider_autoplay) === '1' ? '1' : '0';
  obj.slider_interval = String(Math.min(20, Math.max(3, Number(req.body.slider_interval) || 6)));
  settingsLib.setSettings(obj);
  logActivity(req, 'update', 'settings');
  res.redirect('/admin/settings?ok=1');
});

/* ================= کاربران ================= */
router.get('/users', auth.requireAdmin, (req, res) => {
  const users = all('SELECT id,name,email,role,active,last_login_at,created_at FROM users ORDER BY id');
  render(res, 'admin/users', { active: 'users', title: 'کاربران', users });
});

router.post('/users/save', auth.requireAdmin, (req, res) => {
  const id = Number(req.body.id) || null;
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const role = req.body.role === 'admin' ? 'admin' : 'editor';
  const password = String(req.body.password || '');
  if (!name || !email) return res.redirect('/admin/users?err=' + encodeURIComponent('نام و ایمیل الزامی است'));
  if (id) {
    run('UPDATE users SET name=?, email=?, role=? WHERE id=?', [name, email, role, id]);
    if (password) run('UPDATE users SET password_hash=? WHERE id=?', [bcrypt.hashSync(password, 10), id]);
  } else {
    if (!password) return res.redirect('/admin/users?err=' + encodeURIComponent('رمز عبور الزامی است'));
    const exists = get('SELECT id FROM users WHERE email=?', [email]);
    if (exists) return res.redirect('/admin/users?err=' + encodeURIComponent('این ایمیل قبلاً ثبت شده'));
    run('INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)',
      [name, email, bcrypt.hashSync(password, 10), role]);
  }
  res.redirect('/admin/users?ok=1');
});

router.post('/users/:id/toggle', auth.requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (id === req.admin.id) return res.redirect('/admin/users?err=' + encodeURIComponent('حساب خودتان را نمی‌توانید غیرفعال کنید'));
  run('UPDATE users SET active = 1 - active WHERE id = ?', [id]);
  res.redirect('/admin/users?ok=1');
});

/* ================= پشتیبان‌گیری ================= */
router.post('/backup', auth.requireAdmin, (req, res) => {
  const file = backupDb(path.join(DATA_DIR, 'cms.db'));
  logActivity(req, 'backup', 'system', null, { file: path.basename(file) });
  res.redirect('/admin/settings?ok=1');
});

module.exports = router;
