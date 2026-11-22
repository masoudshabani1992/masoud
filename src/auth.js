'use strict';
/** احراز هویت: نشست کوکی، هش رمز، محافظت CSRF */
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { run, get, all } = require('./db');

const COOKIE = 'koosha_sid';
const MAX_AGE_MS = 1000 * 60 * 60 * 12; // ۱۲ ساعت

function newToken() {
  return crypto.randomBytes(32).toString('hex');
}

function createSession(userId, ip, ua) {
  const token = newToken();
  const expires = new Date(Date.now() + MAX_AGE_MS).toISOString();
  run(
    'INSERT INTO sessions (token, user_id, expires_at, ip, user_agent) VALUES (?,?,?,?,?)',
    [token, userId, expires, String(ip || '').slice(0, 60), String(ua || '').slice(0, 250)]
  );
  return { token, expires: new Date(expires) };
}

function destroySession(token) {
  if (token) run('DELETE FROM sessions WHERE token = ?', [token]);
}

function loadUser(req, res, next) {
  res.locals.admin = null;
  const token = req.cookies && req.cookies[COOKIE];
  if (!token) return next();
  const row = get(
    `SELECT s.token, s.expires_at, u.id, u.name, u.email, u.role
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token = ? AND u.active = 1`,
    [token]
  );
  if (!row) return next();
  if (new Date(row.expires_at).getTime() < Date.now()) {
    destroySession(token);
    res.clearCookie(COOKIE);
    return next();
  }
  req.admin = { id: row.id, name: row.name, email: row.email, role: row.role, token: row.token };
  res.locals.admin = req.admin;
  next();
}

function requireAuth(req, res, next) {
  if (!req.admin) {
    if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'unauthorized' });
    return res.redirect('/admin/login?next=' + encodeURIComponent(req.originalUrl));
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.admin || req.admin.role !== 'admin') {
    return res.status(403).send('دسترسی غیرمجاز');
  }
  next();
}

function csrfToken(req) {
  if (req.admin && req.admin.token) {
    return crypto.createHmac('sha256', req.app.get('session secret') || 'koosha-csrf')
      .update(req.admin.token).digest('hex').slice(0, 40);
  }
  return '';
}

const SAFE_UPLOAD_PATHS = [/^\/(admin\/)?media\/(upload|upload-json|file)/];

/** بررسی توکن CSRF در فرم‌های پنل */
function verifyCsrf(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  // آپلود فایل بدنه multipart دارد و پیش از پارس شدن آن قابل بررسی نیست؛
  // برای این مسیرها به هدر اختصاصی متکی هستیم
  if (SAFE_UPLOAD_PATHS.some((re) => re.test(req.path))) return next();
  const expected = csrfToken(req);
  const sent = (req.body && req.body._csrf) || req.get('x-csrf-token') || '';
  if (!expected || sent !== expected) {
    return res.status(403).send('توکن امنیتی نامعتبر است. صفحه را دوباره بارگذاری کنید.');
  }
  next();
}

function login(email, password) {
  const user = get('SELECT * FROM users WHERE email = ? AND active = 1', [String(email).toLowerCase().trim()]);
  if (!user) return null;
  if (!bcrypt.compareSync(String(password), user.password_hash)) return null;
  run("UPDATE users SET last_login_at = datetime('now') WHERE id = ?", [user.id]);
  return user;
}

function cleanupSessions() {
  run("DELETE FROM sessions WHERE expires_at < ?", [new Date().toISOString()]);
}

module.exports = {
  COOKIE, MAX_AGE_MS, loadUser, requireAuth, requireAdmin, createSession,
  destroySession, csrfToken, verifyCsrf, login, cleanupSessions,
};
