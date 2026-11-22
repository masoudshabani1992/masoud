'use strict';
/** رندر ویوها با یک layout مشترک (بدون وابستگی اضافه) */
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const U = require('./util');
const { getSettings, menu } = require('./settings');

const VIEWS = path.join(__dirname, '..', 'views');
const LAYOUT = path.join(VIEWS, 'site', 'layout.ejs');
const fileCache = new Map();

function read(file) {
  if (process.env.NODE_ENV === 'production') {
    if (!fileCache.has(file)) fileCache.set(file, fs.readFileSync(file, 'utf8'));
    return fileCache.get(file);
  }
  return fs.readFileSync(file, 'utf8');
}

/**
 * رندر یک صفحه سایت داخل layout
 * @param {import('express').Response} res
 * @param {string} view  نام ویو بدون پسوند، مثل 'site/news-list'
 * @param {object} data  داده‌های ویو (باید seo داشته باشد)
 */
function renderPage(res, view, data = {}) {
  const s = getSettings();
  const ctx = {
    ...res.locals,
    footerProducts: [],
    req: res.req,
    s,
    U,
    menu: menu(),
    path: res.req.path,
    currentUrl: res.req.originalUrl,
    year: U.toFa(new Date().getFullYear()),
    postUrl: (p) => (p && p.type === 'circular' ? '/circular/' : '/news/') + ((p && p.slug) || ''),
    ...data,
  };
  const viewPath = path.join(VIEWS, view + '.ejs');
  const body = ejs.render(read(viewPath), ctx, { filename: viewPath });
  const html = ejs.render(read(LAYOUT), { ...ctx, body }, { filename: LAYOUT });
  res.status(res.statusCode === 200 ? 200 : res.statusCode).send(html);
}

module.exports = { renderPage };
