'use strict';
/** پنل مدیریت */
const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sanitizeHtml = require('sanitize-html');
const path = require('path');

const { all, get, run } = require('../db');
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
