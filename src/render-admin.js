'use strict';
/** رندر ویوهای پنل با layout پنل */
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const U = require('./util');

const VIEWS = path.join(__dirname, '..', 'views');
const LAYOUT = path.join(VIEWS, 'admin', 'layout.ejs');

function render(res, view, data = {}) {
  data = { ...res.locals, req: res.req, U, postUrl: (p) => (p && p.type === 'circular' ? '/circular/' : p && p.type === 'page' ? '/p/' : '/news/') + ((p && p.slug) || ''), ...data };
  const viewPath = path.join(VIEWS, view + '.ejs');
  const body = ejs.render(fs.readFileSync(viewPath, 'utf8'), data, { filename: viewPath });
  res.send(ejs.render(fs.readFileSync(LAYOUT, 'utf8'), { ...data, body }, { filename: LAYOUT }));
}

module.exports = { render };
