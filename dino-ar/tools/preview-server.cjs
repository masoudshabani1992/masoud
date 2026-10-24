/* سرور پیش‌نمایش بازیکا (بدون PHP) — فقط برای دیدن خروجی در سندباکس */
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..', 'deploy');
const PORT = 8000;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.php': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webp': 'image/webp',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.svg': 'image/svg+xml',
};

function renderPhp(file) {
  let s = fs.readFileSync(file, 'utf8');
  s = s.replace(/^[\s\S]*?\?>\s*/, '');                       // حذف بلوک PHP ابتدای فایل
  s = s.split('<?php echo json_encode($BZ_TOK); ?>').join('"preview-token"');
  return s;
}

function standsBase() { return path.join(ROOT, 'data', 'stands'); }

function dataEndpoint(q, res) {
  const x = q.get('x') || 'index';
  const send = (v, code) => { res.writeHead(code || 200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(v)); };
  if (x === 'index') {
    const c = fs.readFileSync(path.join(standsBase(), 'index.json'), 'utf8');
    return send(JSON.parse(c));
  }
  if (x === 'stand') {
    const id = (q.get('id') || '').replace(/[^a-z0-9-]/g, '');
    const f = path.join(standsBase(), id + '.json');
    if (!fs.existsSync(f)) return send({ error: 'notfound' }, 404);
    return send(JSON.parse(fs.readFileSync(f, 'utf8')));
  }
  if (x === 'refs') {
    const out = [];
    for (const f of fs.readdirSync(standsBase())) {
      if (!f.endsWith('.json') || f === 'index.json') continue;
      const st = JSON.parse(fs.readFileSync(path.join(standsBase(), f), 'utf8'));
      if (st.ref) out.push({ id: st.id, title: st.title || '', ref: st.ref });
    }
    return send({ stands: out });
  }
  send({ error: 'badrequest' }, 400);
}

function serveFile(res, fp) {
  const ext = path.extname(fp).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';
  const stat = fs.statSync(fp);
  const range = null; // پیش‌نمایش ساده؛ بدون range
  res.writeHead(200, { 'Content-Type': mime, 'Content-Length': stat.size, 'Cache-Control': 'no-cache' });
  fs.createReadStream(fp).pipe(res);
}

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  let p = decodeURIComponent(u.pathname);
  try {
    if (p === '/ar/data.php' || p === '/data.php') return dataEndpoint(u.searchParams, res);
    if (p === '/' ) p = '/index.php';
    if (p === '/ar/' || p === '/ar') p = '/ar/index.php';
    const fp = path.join(ROOT, p);
    if (!fp.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    if (p.endsWith('.php')) {
      if (!fs.existsSync(fp)) { res.writeHead(404); return res.end('not found'); }
      const html = renderPhp(fp);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    }
    if (fs.existsSync(fp) && fs.statSync(fp).isFile()) return serveFile(res, fp);
    res.writeHead(404); res.end('not found: ' + p);
  } catch (e) {
    res.writeHead(500); res.end(String(e && e.message));
  }
}).listen(PORT, '0.0.0.0', () => console.log('bazika preview on :' + PORT));
