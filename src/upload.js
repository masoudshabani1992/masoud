'use strict';
/** آپلود تصویر و فایل با ذخیره‌سازی در public/uploads */
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { run, get } = require('./db');

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');
const BACKUP_DIR = path.join(__dirname, '..', 'data', 'backups');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(BACKUP_DIR, { recursive: true });

const IMAGE_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'image/avif': '.avif',
};
const DOC_TYPES = {
  'application/pdf': '.pdf',
  'application/zip': '.zip',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
};

function storage(kind) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const allowed = kind === 'image' ? IMAGE_TYPES : { ...IMAGE_TYPES, ...DOC_TYPES };
      const ext = allowed[file.mimetype] || path.extname(file.originalname || '').toLowerCase() || '';
      const name = Date.now().toString(36) + '-' + crypto.randomBytes(4).toString('hex') + ext;
      cb(null, name);
    },
  });
}

function fileFilter(kind) {
  return (req, file, cb) => {
    const allowed = kind === 'image' ? IMAGE_TYPES : { ...IMAGE_TYPES, ...DOC_TYPES };
    if (allowed[file.mimetype]) return cb(null, true);
    const err = new Error('فرمت فایل مجاز نیست');
    err.code = 'INVALID_TYPE';
    cb(err);
  };
}

const uploadImage = multer({
  storage: storage('image'),
  fileFilter: fileFilter('image'),
  limits: { fileSize: 8 * 1024 * 1024, files: 12 },
});

const uploadAny = multer({
  storage: storage('any'),
  fileFilter: fileFilter('any'),
  limits: { fileSize: 20 * 1024 * 1024, files: 8 },
});

/** ابعاد تصویر را از هدر فایل می‌خواند (PNG/JPEG/WebP/GIF) */
function imageSize(filePath) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(24);
    fs.readSync(fd, buf, 0, 24, 0);
    fs.closeSync(fd);
    if (buf[0] === 0x89 && buf.toString('ascii', 1, 4) === 'PNG') {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      // JPEG: اسکن سگمنت‌ها
      const data = fs.readFileSync(filePath);
      let off = 2;
      while (off < data.length) {
        if (data[off] !== 0xff) { off++; continue; }
        const marker = data[off + 1];
        const len = data.readUInt16BE(off + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { height: data.readUInt16BE(off + 5), width: data.readUInt16BE(off + 7) };
        }
        off += 2 + len;
      }
    }
    if (buf.toString('ascii', 0, 4) === 'GIF8') {
      return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
    }
  } catch (_) { /* ignore */ }
  return { width: null, height: null };
}

/** ثبت فایل آپلودشده در جدول media */
function record(media, userId, alt = '') {
  const dim = media.mimetype.startsWith('image/') ? imageSize(path.join(UPLOAD_DIR, media.filename)) : {};
  const url = '/uploads/' + media.filename;
  const r = run(
    `INSERT INTO media (filename, original_name, url, mime, size, width, height, alt, created_by)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [media.filename, media.originalname || media.filename, url, media.mimetype,
      media.size || 0, dim.width || null, dim.height || null, alt || '', userId || null]
  );
  return get('SELECT * FROM media WHERE id = ?', [Number(r.lastInsertRowid)]);
}

function mediaById(id) {
  if (!id) return null;
  return get('SELECT * FROM media WHERE id = ?', [Number(id)]);
}

function removeMedia(id) {
  const m = mediaById(id);
  if (!m) return false;
  const file = path.join(UPLOAD_DIR, m.filename);
  if (fs.existsSync(file)) fs.unlinkSync(file);
  run('DELETE FROM media WHERE id = ?', [id]);
  return true;
}

function backupDb(dbPath) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dest = path.join(BACKUP_DIR, `cms-${stamp}.db`);
  fs.copyFileSync(dbPath, dest);
  return dest;
}

module.exports = {
  uploadImage, uploadAny, record, mediaById, removeMedia, UPLOAD_DIR, BACKUP_DIR, backupDb,
};
