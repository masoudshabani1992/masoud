'use strict';
/**
 * اتصال به دیتابیس SQLite داخلی نود (بدون نیاز به کامپایل بومی)
 * فایل دیتابیس: data/cms.db
 */
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, 'cms.db'));
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

/** اجرای کوئری با پارامترهای نام‌دار (آبجکت) یا ترتیبی (آرایه) */
function args(params) {
  if (Array.isArray(params)) return params; // برای spread شدن
  return [params];
}
function run(sql, params = {}) {
  const stmt = db.prepare(sql);
  return Array.isArray(params) ? stmt.run(...params) : stmt.run(params);
}
function all(sql, params = {}) {
  const stmt = db.prepare(sql);
  return Array.isArray(params) ? stmt.all(...params) : stmt.all(params);
}
function get(sql, params = {}) {
  const stmt = db.prepare(sql);
  return Array.isArray(params) ? stmt.get(...params) : stmt.get(params);
}
function exec(sql) {
  db.exec(sql);
}

/** تراکنش ساده */
function tx(fn) {
  db.exec('BEGIN');
  try {
    const out = fn();
    db.exec('COMMIT');
    return out;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

module.exports = { db, run, all, get, exec, tx, DATA_DIR };
