import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  db,
  initDatabase,
  hashPassword,
  verifyPassword,
  generateToken,
  getSetting,
  setSetting,
  getAllSettings,
} from './db.js';
import {
  buildSepidarPayload,
  syncSaleToSepidar,
  testSepidarConnection,
  generateSepidarCsv,
  getBotPendingJobs,
  completeBotJob,
} from './sepidarService.js';
import { filterSalesList, buildComprehensiveReport } from './reportService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

initDatabase();

const app = express();
app.use(express.json({ limit: '2mb' }));

// Serve Vazirmatn fonts locally so even offline LAN print popups render crisp Persian text
app.use(
  '/local-fonts',
  express.static(path.join(ROOT_DIR, 'node_modules', 'vazirmatn'))
);

// Normalize Persian/Arabic digits in server-side inputs
function normalizeDigits(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

// Helper: Extract current authenticated user (checks X-Kaveh-Token, query params, body, and Authorization)
function getUserFromRequest(req) {
  const candidates = [];

  if (req.headers['x-kaveh-token']) {
    candidates.push(String(req.headers['x-kaveh-token']).trim());
  }
  if (req.query?.kaveh_token) {
    candidates.push(String(req.query.kaveh_token).trim());
  }
  if (req.query?.token) {
    candidates.push(String(req.query.token).trim());
  }
  if (req.body && typeof req.body === 'object' && req.body._token) {
    candidates.push(String(req.body._token).trim());
  }
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    candidates.push(authHeader.slice(7).trim());
  }

  for (const token of candidates) {
    if (!token) continue;
    const session = db
      .prepare('SELECT * FROM sessions WHERE token = ?')
      .get(token);
    if (!session) continue;

    if (new Date(session.expires_at).getTime() < Date.now()) {
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
      continue;
    }

    const user = db
      .prepare('SELECT id, username, full_name, role, station_name, is_active FROM users WHERE id = ?')
      .get(session.user_id);

    if (user && user.is_active) {
      return { ...user, token };
    }
  }

  return null;
}

function buildBootstrapPayload(user) {
  const categories = db
    .prepare('SELECT * FROM battery_categories ORDER BY sort_order ASC, id ASC')
    .all();
  const brands = db
    .prepare('SELECT * FROM battery_brands ORDER BY sort_order ASC, id ASC')
    .all();
  const brandCategoryRates = db
    .prepare('SELECT * FROM brand_category_rates')
    .all();
  const amperages = db
    .prepare('SELECT * FROM amperages ORDER BY amp_value ASC')
    .all();
  const posTerminals = db
    .prepare('SELECT * FROM pos_terminals ORDER BY sort_order ASC, id ASC')
    .all();

  const allSettings = getAllSettings();
  const publicSettings = {
    store_name: allSettings.store_name,
    store_subtitle: allSettings.store_subtitle,
    store_phone: allSettings.store_phone,
    store_address: allSettings.store_address,
    receipt_footer: allSettings.receipt_footer,
    next_label_number: Math.max(1500, Number(allSettings.next_label_number || 1500)),
    label_width_mm: allSettings.label_width_mm || '50',
    label_height_mm: allSettings.label_height_mm || '30',
  };

  const pendingSepidarCount = db
    .prepare("SELECT COUNT(*) as c FROM sales WHERE sepidar_status = 'pending'")
    .get().c;

  const response = {
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      station_name: user.station_name,
    },
    categories,
    brands,
    brandCategoryRates,
    amperages,
    posTerminals,
    publicSettings,
    pendingSepidarCount,
  };

  if (user.role === 'admin') {
    response.adminSettings = allSettings;
    response.cashiers = db
      .prepare('SELECT id, username, full_name, role, station_name, is_active FROM users ORDER BY id ASC')
      .all();
  }

  return response;
}

function requireAuth(req, res, next) {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'نشست کاربری معتبر نیست. لطفاً مجدداً وارد شوید.' });
  }
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'این بخش ویژه مدیر مالی است.' });
  }
  next();
}

// ------------------------------------------------------------
// PUBLIC & AUTH ROUTES
// ------------------------------------------------------------
app.get('/api/public-info', (_req, res) => {
  const activeUsers = db
    .prepare('SELECT username, full_name, role, station_name FROM users WHERE is_active = 1 ORDER BY id ASC')
    .all();
  res.json({
    storeName: getSetting('store_name', 'نمایندگی صبا باتری - باتری کاوه'),
    storeSubtitle: getSetting('store_subtitle', 'اتوماسیون یکپارچه فروش، صندوق و اتصال به سپیدار'),
    accounts: activeUsers,
  });
});

app.get('/api/download-package', (_req, res) => {
  const zipPath = path.join(ROOT_DIR, 'kaveh-battery-automation.zip');
  if (!fs.existsSync(zipPath)) {
    return res.status(404).json({ error: 'فایل پکیج یافت نشد.' });
  }
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="kaveh-battery-automation.zip"');
  res.sendFile(zipPath);
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'نام کاربری و رمز عبور الزامی است.' });
  }

  const normalizedUsername = normalizeDigits(String(username)).trim();
  const normalizedPassword = normalizeDigits(String(password));

  const user = db
    .prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)')
    .get(normalizedUsername);

  const passOk =
    user &&
    (verifyPassword(String(password), user.password_hash) ||
      verifyPassword(normalizedPassword, user.password_hash));

  if (!user || !passOk) {
    return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است.' });
  }

  if (!user.is_active) {
    return res.status(403).json({ error: 'این حساب کاربری توسط مدیر غیرفعال شده است.' });
  }

  const token = generateToken();
  const now = new Date();
  const expires = new Date(now.getTime() + 14 * 24 * 3600 * 1000); // 14 days

  db.prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
    token,
    user.id,
    now.toISOString(),
    expires.toISOString()
  );

  const safeUser = {
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    role: user.role,
    station_name: user.station_name,
  };

  res.json({
    token,
    user: safeUser,
    bootstrap: buildBootstrapPayload(safeUser),
  });
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(req.user.token);
  res.json({ ok: true });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// ------------------------------------------------------------
// BOOTSTRAP DATA FOR POS & ADMIN
// ------------------------------------------------------------
app.get('/api/bootstrap', requireAuth, (req, res) => {
  res.json(buildBootstrapPayload(req.user));
});

// ------------------------------------------------------------
// SALES & POS OPERATIONS
// ------------------------------------------------------------
app.get('/api/sales', requireAuth, (req, res) => {
  const allSales = db
    .prepare('SELECT * FROM sales ORDER BY id DESC')
    .all();

  const query = { ...req.query };
  // Cashiers default to viewing their own shift/sales unless searching a specific label/invoice for customer reprint
  if (req.user.role === 'cashier' && query.scope !== 'all_store') {
    query.cashierId = req.user.id;
  }

  const filtered = filterSalesList(allSales, query);
  res.json({ sales: filtered });
});

app.post('/api/sales', requireAuth, (req, res) => {
  try {
    const {
      categoryId,
      brandId,
      amperage,
      quantity = 1,
      hasScrap = false,
      scrapCategoryId,
      scrapAmperage = 0,
      scrapQuantity = 1,
      finalSaleAmount,
      paymentMethod,
      posTerminalId,
      paymentRef = '',
      customerName = '',
      customerPhone = '',
      notes = '',
    } = req.body || {};

    const cat = db
      .prepare('SELECT * FROM battery_categories WHERE id = ? AND is_active = 1')
      .get(Number(categoryId));
    if (!cat) {
      return res.status(400).json({ error: 'نوع باتری انتخاب شده معتبر نیست.' });
    }

    const brand = db
      .prepare('SELECT * FROM battery_brands WHERE id = ? AND is_active = 1')
      .get(Number(brandId));
    if (!brand) {
      return res.status(400).json({ error: 'برند باتری انتخاب شده معتبر نیست.' });
    }

    const ampVal = Number(amperage);
    if (!ampVal || ampVal <= 0) {
      return res.status(400).json({ error: 'آمپراژ باتری را به درستی انتخاب یا وارد نمایید.' });
    }

    const qtyVal = Math.max(1, Math.floor(Number(quantity) || 1));

    if (!['pos', 'transfer', 'cash'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'روش پرداخت را انتخاب نمایید.' });
    }

    let posTerminal = null;
    if (paymentMethod === 'pos') {
      posTerminal = db
        .prepare('SELECT * FROM pos_terminals WHERE id = ? AND is_active = 1')
        .get(Number(posTerminalId));
      if (!posTerminal) {
        return res.status(400).json({ error: 'لطفاً دستگاه کارتخوان (صادرات / پارسیان / ملت) را انتخاب نمایید.' });
      }
    }

    // Lookup per-ampere rate for Brand × Category (fallback to Brand default)
    const rateRow = db
      .prepare('SELECT * FROM brand_category_rates WHERE brand_id = ? AND category_id = ?')
      .get(brand.id, cat.id);
    const unitPricePerAmp = rateRow ? rateRow.price_per_amp : brand.default_price_per_amp;

    const totalSoldAmps = ampVal * qtyVal;
    const grossAmount = Math.round(totalSoldAmps * unitPricePerAmp);

    // Scrap battery calculation
    const scrapAmpVal = hasScrap ? Number(scrapAmperage || 0) : 0;
    const isScrapActive = scrapAmpVal > 0 ? 1 : 0;
    const scrapCat = isScrapActive
      ? db.prepare('SELECT * FROM battery_categories WHERE id = ?').get(Number(scrapCategoryId || cat.id)) || cat
      : null;
    const scrapQtyVal = isScrapActive ? Math.max(1, Math.floor(Number(scrapQuantity) || 1)) : 0;
    const totalScrapAmps = isScrapActive ? scrapAmpVal * scrapQtyVal : 0;
    const scrapPricePerAmp = isScrapActive ? scrapCat.scrap_price_per_amp : 0;
    const scrapDeductionAmount = Math.round(totalScrapAmps * scrapPricePerAmp);

    const calculatedNetAmount = Math.max(0, grossAmount - scrapDeductionAmount);

    let effectiveFinalAmount = calculatedNetAmount;
    let isManualPrice = 0;
    if (finalSaleAmount !== undefined && finalSaleAmount !== null && finalSaleAmount !== '') {
      const parsedFinal = Math.round(Number(finalSaleAmount));
      if (!Number.isNaN(parsedFinal) && parsedFinal >= 0) {
        effectiveFinalAmount = parsedFinal;
        if (effectiveFinalAmount !== calculatedNetAmount) {
          isManualPrice = 1;
        }
      }
    }

    db.exec('BEGIN IMMEDIATE;');
    let createdSale;
    let nextLabelAfter;
    try {
      // Ensure label number is strictly >= 1500 and sequential
      const maxExistingLabel = db.prepare('SELECT COALESCE(MAX(label_number), 1499) as m FROM sales').get().m;
      const configuredNext = Number(getSetting('next_label_number', '1500')) || 1500;
      const assignedLabel = Math.max(1500, configuredNext, maxExistingLabel + 1);
      nextLabelAfter = assignedLabel + 1;

      const invSeq = Math.max(1001, Number(getSetting('next_invoice_seq', '1001')) || 1001);
      const fiscalYear = getSetting('sepidar_fiscal_year', '1405');
      const invoiceNumber = `KV-${fiscalYear}-${invSeq}`;

      const nowIso = new Date().toISOString();

      const insertResult = db.prepare(`
        INSERT INTO sales (
          invoice_number, label_number, cashier_id, cashier_name,
          category_id, category_name, brand_id, brand_name,
          amperage, quantity, total_sold_amps, unit_price_per_amp, gross_amount,
          has_scrap, scrap_category_id, scrap_category_name, scrap_amperage, scrap_quantity,
          total_scrap_amps, scrap_price_per_amp, scrap_deduction_amount,
          calculated_net_amount, final_sale_amount, is_manual_price,
          payment_method, pos_terminal_id, pos_bank_name, payment_ref,
          customer_name, customer_phone, notes,
          sepidar_status, created_at
        ) VALUES (
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?,
          'pending', ?
        )
      `).run(
        invoiceNumber,
        assignedLabel,
        req.user.id,
        req.user.full_name,
        cat.id,
        cat.name,
        brand.id,
        brand.name,
        ampVal,
        qtyVal,
        totalSoldAmps,
        unitPricePerAmp,
        grossAmount,
        isScrapActive,
        scrapCat ? scrapCat.id : null,
        scrapCat ? scrapCat.name : '',
        scrapAmpVal,
        scrapQtyVal,
        totalScrapAmps,
        scrapPricePerAmp,
        scrapDeductionAmount,
        calculatedNetAmount,
        effectiveFinalAmount,
        isManualPrice,
        paymentMethod,
        posTerminal ? posTerminal.id : null,
        posTerminal ? posTerminal.bank_name : '',
        String(paymentRef || '').trim(),
        String(customerName || '').trim(),
        String(customerPhone || '').trim(),
        String(notes || '').trim(),
        nowIso
      );

      setSetting('next_label_number', String(nextLabelAfter));
      setSetting('next_invoice_seq', String(invSeq + 1));

      createdSale = db
        .prepare('SELECT * FROM sales WHERE id = ?')
        .get(insertResult.lastInsertRowid);

      db.exec('COMMIT;');
    } catch (txErr) {
      db.exec('ROLLBACK;');
      throw txErr;
    }

    res.status(201).json({
      sale: createdSale,
      nextLabelNumber: nextLabelAfter,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'خطا در ثبت فاکتور فروش' });
  }
});

app.post('/api/sales/:id/print', requireAuth, (req, res) => {
  const saleId = Number(req.params.id);
  const { type } = req.body || {};
  if (type === 'label') {
    db.prepare('UPDATE sales SET label_printed_count = label_printed_count + 1 WHERE id = ?').run(saleId);
  } else if (type === 'receipt') {
    db.prepare('UPDATE sales SET receipt_printed_count = receipt_printed_count + 1 WHERE id = ?').run(saleId);
  }
  const updated = db.prepare('SELECT * FROM sales WHERE id = ?').get(saleId);
  res.json({ sale: updated });
});

// ------------------------------------------------------------
// REPORTS (ADMIN)
// ------------------------------------------------------------
app.get('/api/reports', requireAuth, requireAdmin, (req, res) => {
  const allSales = db.prepare('SELECT * FROM sales ORDER BY id DESC').all();
  const filteredSales = filterSalesList(allSales, req.query);
  const report = buildComprehensiveReport(filteredSales);
  res.json({
    report,
    sales: filteredSales,
  });
});

// ------------------------------------------------------------
// ADMIN: PRICING & CATALOG MANAGEMENT
// ------------------------------------------------------------
app.put('/api/admin/pricing', requireAuth, requireAdmin, (req, res) => {
  const { brandDefaults = [], matrixRates = [], scrapRates = [] } = req.body || {};
  const nowIso = new Date().toISOString();
  const changeNotes = [];

  db.exec('BEGIN IMMEDIATE;');
  try {
    for (const bd of brandDefaults) {
      const price = Math.max(0, Math.round(Number(bd.defaultPricePerAmp) || 0));
      const old = db.prepare('SELECT * FROM battery_brands WHERE id = ?').get(Number(bd.brandId));
      if (old && old.default_price_per_amp !== price) {
        db.prepare('UPDATE battery_brands SET default_price_per_amp = ? WHERE id = ?').run(price, old.id);
        changeNotes.push(`نرخ پایه آمپر برند «${old.name}»: ${old.default_price_per_amp.toLocaleString('fa-IR')} ← ${price.toLocaleString('fa-IR')} تومان`);
      }
      if (bd.applyToAllCategories && old) {
        db.prepare(`
          UPDATE brand_category_rates
          SET price_per_amp = ?, updated_at = ?, updated_by = ?
          WHERE brand_id = ?
        `).run(price, nowIso, req.user.id, old.id);
      }
    }

    for (const mr of matrixRates) {
      const price = Math.max(0, Math.round(Number(mr.pricePerAmp) || 0));
      const prefix = String(mr.sepidarItemPrefix || '').trim();
      const existing = db
        .prepare('SELECT * FROM brand_category_rates WHERE brand_id = ? AND category_id = ?')
        .get(Number(mr.brandId), Number(mr.categoryId));

      if (existing) {
        if (existing.price_per_amp !== price || (prefix && existing.sepidar_item_prefix !== prefix)) {
          db.prepare(`
            UPDATE brand_category_rates
            SET price_per_amp = ?,
                sepidar_item_prefix = COALESCE(NULLIF(?, ''), sepidar_item_prefix),
                updated_at = ?,
                updated_by = ?
            WHERE id = ?
          `).run(price, prefix, nowIso, req.user.id, existing.id);

          if (existing.price_per_amp !== price) {
            const b = db.prepare('SELECT name FROM battery_brands WHERE id = ?').get(Number(mr.brandId));
            const c = db.prepare('SELECT name FROM battery_categories WHERE id = ?').get(Number(mr.categoryId));
            changeNotes.push(
              `نرخ آمپر «${b?.name} - ${c?.name}»: ${existing.price_per_amp.toLocaleString('fa-IR')} ← ${price.toLocaleString('fa-IR')} تومان`
            );
          }
        }
      } else {
        db.prepare(`
          INSERT INTO brand_category_rates (brand_id, category_id, price_per_amp, sepidar_item_prefix, updated_at, updated_by)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(Number(mr.brandId), Number(mr.categoryId), price, prefix, nowIso, req.user.id);
      }
    }

    for (const sr of scrapRates) {
      const scrapPrice = Math.max(0, Math.round(Number(sr.scrapPricePerAmp) || 0));
      const oldCat = db.prepare('SELECT * FROM battery_categories WHERE id = ?').get(Number(sr.categoryId));
      if (oldCat) {
        if (oldCat.scrap_price_per_amp !== scrapPrice) {
          changeNotes.push(
            `نرخ هر آمپر داغی «${oldCat.name}»: ${oldCat.scrap_price_per_amp.toLocaleString('fa-IR')} ← ${scrapPrice.toLocaleString('fa-IR')} تومان`
          );
        }
        db.prepare(`
          UPDATE battery_categories
          SET scrap_price_per_amp = ?,
              sepidar_warehouse_code = COALESCE(NULLIF(?, ''), sepidar_warehouse_code),
              sepidar_scrap_warehouse_code = COALESCE(NULLIF(?, ''), sepidar_scrap_warehouse_code),
              sepidar_scrap_item_code = COALESCE(NULLIF(?, ''), sepidar_scrap_item_code)
          WHERE id = ?
        `).run(
          scrapPrice,
          String(sr.sepidarWarehouseCode || ''),
          String(sr.sepidarScrapWarehouseCode || ''),
          String(sr.sepidarScrapItemCode || ''),
          oldCat.id
        );
      }
    }

    if (changeNotes.length > 0) {
      db.prepare('INSERT INTO price_logs (user_id, user_name, description, created_at) VALUES (?, ?, ?, ?)').run(
        req.user.id,
        req.user.full_name,
        changeNotes.join(' | '),
        nowIso
      );
    }

    db.exec('COMMIT;');
    res.json({ ok: true, changesCount: changeNotes.length });
  } catch (err) {
    db.exec('ROLLBACK;');
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/pricing/logs', requireAuth, requireAdmin, (_req, res) => {
  const logs = db.prepare('SELECT * FROM price_logs ORDER BY id DESC LIMIT 40').all();
  res.json({ logs });
});

app.post('/api/admin/brands', requireAuth, requireAdmin, (req, res) => {
  const { name, code, defaultPricePerAmp } = req.body || {};
  if (!name || !defaultPricePerAmp) {
    return res.status(400).json({ error: 'نام برند و قیمت هر آمپر الزامی است.' });
  }
  const cleanCode =
    String(code || name)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_') +
    '_' +
    Math.floor(Math.random() * 900 + 100);
  const price = Math.max(0, Math.round(Number(defaultPricePerAmp)));
  const nowIso = new Date().toISOString();

  const result = db
    .prepare('INSERT INTO battery_brands (code, name, default_price_per_amp, sort_order) VALUES (?, ?, ?, 99)')
    .run(cleanCode, String(name).trim(), price);

  const brandId = result.lastInsertRowid;
  const cats = db.prepare('SELECT * FROM battery_categories').all();
  for (const c of cats) {
    db.prepare(`
      INSERT INTO brand_category_rates (brand_id, category_id, price_per_amp, sepidar_item_prefix, updated_at, updated_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(brandId, c.id, price, `BR${brandId}-${c.code.toUpperCase()}`, nowIso, req.user.id);
  }

  db.prepare('INSERT INTO price_logs (user_id, user_name, description, created_at) VALUES (?, ?, ?, ?)').run(
    req.user.id,
    req.user.full_name,
    `افزودن برند جدید «${name}» با نرخ هر آمپر ${price.toLocaleString('fa-IR')} تومان`,
    nowIso
  );

  res.status(201).json({ ok: true });
});

app.put('/api/admin/brands/:id', requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const { name, is_active } = req.body || {};
  const existing = db.prepare('SELECT * FROM battery_brands WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'برند یافت نشد.' });

  db.prepare('UPDATE battery_brands SET name = ?, is_active = ? WHERE id = ?').run(
    name !== undefined ? String(name).trim() : existing.name,
    is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
    id
  );
  res.json({ ok: true });
});

app.post('/api/admin/categories', requireAuth, requireAdmin, (req, res) => {
  const { name, scrapPricePerAmp = 50000 } = req.body || {};
  if (!name) return res.status(400).json({ error: 'نام نوع باتری الزامی است.' });
  const cleanCode = 'cat_' + Date.now();
  const scrapPrice = Math.max(0, Math.round(Number(scrapPricePerAmp) || 50000));
  const nowIso = new Date().toISOString();

  const resCat = db
    .prepare('INSERT INTO battery_categories (code, name, scrap_price_per_amp, sort_order) VALUES (?, ?, ?, 99)')
    .run(cleanCode, String(name).trim(), scrapPrice);
  const catId = resCat.lastInsertRowid;

  const brands = db.prepare('SELECT * FROM battery_brands').all();
  for (const b of brands) {
    db.prepare(`
      INSERT INTO brand_category_rates (brand_id, category_id, price_per_amp, sepidar_item_prefix, updated_at, updated_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(b.id, catId, b.default_price_per_amp, `${b.code.toUpperCase()}-CAT${catId}`, nowIso, req.user.id);
  }
  res.status(201).json({ ok: true });
});

app.post('/api/admin/amperages', requireAuth, requireAdmin, (req, res) => {
  const amp = Number(req.body?.ampValue);
  if (!amp || amp <= 0) {
    return res.status(400).json({ error: 'عدد آمپراژ معتبر نیست.' });
  }
  db.prepare(`
    INSERT INTO amperages (amp_value, category_scope, is_sale_option, is_scrap_option, sort_order, is_active)
    VALUES (?, 'all', 1, 1, ?, 1)
    ON CONFLICT(amp_value) DO UPDATE SET is_active = 1
  `).run(amp, Math.round(amp));
  res.status(201).json({ ok: true });
});

app.delete('/api/admin/amperages/:id', requireAuth, requireAdmin, (req, res) => {
  db.prepare('DELETE FROM amperages WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

app.post('/api/admin/pos-terminals', requireAuth, requireAdmin, (req, res) => {
  const { bankName, terminalTitle, terminalNumber = '', sepidarPosCode = '', sepidarDlCode = '' } = req.body || {};
  if (!bankName) return res.status(400).json({ error: 'نام بانک کارتخوان الزامی است.' });
  db.prepare(`
    INSERT INTO pos_terminals (bank_name, terminal_title, terminal_number, sepidar_pos_code, sepidar_dl_code, sort_order)
    VALUES (?, ?, ?, ?, ?, 99)
  `).run(
    String(bankName).trim(),
    String(terminalTitle || `کارتخوان بانک ${bankName}`).trim(),
    String(terminalNumber).trim(),
    String(sepidarPosCode).trim(),
    String(sepidarDlCode).trim()
  );
  res.status(201).json({ ok: true });
});

app.put('/api/admin/pos-terminals/:id', requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM pos_terminals WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'کارتخوان یافت نشد.' });

  const { bankName, terminalTitle, terminalNumber, sepidarPosCode, sepidarDlCode, isActive } = req.body || {};
  db.prepare(`
    UPDATE pos_terminals
    SET bank_name = ?,
        terminal_title = ?,
        terminal_number = ?,
        sepidar_pos_code = ?,
        sepidar_dl_code = ?,
        is_active = ?
    WHERE id = ?
  `).run(
    bankName !== undefined ? String(bankName).trim() : existing.bank_name,
    terminalTitle !== undefined ? String(terminalTitle).trim() : existing.terminal_title,
    terminalNumber !== undefined ? String(terminalNumber).trim() : existing.terminal_number,
    sepidarPosCode !== undefined ? String(sepidarPosCode).trim() : existing.sepidar_pos_code,
    sepidarDlCode !== undefined ? String(sepidarDlCode).trim() : existing.sepidar_dl_code,
    isActive !== undefined ? (isActive ? 1 : 0) : existing.is_active,
    id
  );
  res.json({ ok: true });
});

// ------------------------------------------------------------
// ADMIN: USER / CASHIER MANAGEMENT
// ------------------------------------------------------------
app.get('/api/admin/users', requireAuth, requireAdmin, (_req, res) => {
  const users = db
    .prepare(`
      SELECT
        u.id, u.username, u.full_name, u.role, u.station_name, u.is_active, u.created_at,
        COUNT(s.id) AS total_invoices,
        COALESCE(SUM(CASE WHEN s.sepidar_status != 'rejected' THEN s.total_sold_amps ELSE 0 END), 0) AS total_sold_amps,
        COALESCE(SUM(CASE WHEN s.sepidar_status != 'rejected' THEN s.final_sale_amount ELSE 0 END), 0) AS total_net_sales
      FROM users u
      LEFT JOIN sales s ON s.cashier_id = u.id
      GROUP BY u.id
      ORDER BY u.id ASC
    `)
    .all();
  res.json({ users });
});

app.post('/api/admin/users', requireAuth, requireAdmin, (req, res) => {
  const { username, password, fullName, role = 'cashier', stationName = '' } = req.body || {};
  if (!username || !password || !fullName) {
    return res.status(400).json({ error: 'نام کامل، نام کاربری و رمز عبور الزامی است.' });
  }
  const cleanUser = String(username).trim();
  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(cleanUser);
  if (exists) {
    return res.status(400).json({ error: 'این نام کاربری قبلاً ثبت شده است.' });
  }
  const safeRole = role === 'admin' ? 'admin' : 'cashier';
  db.prepare(`
    INSERT INTO users (username, password_hash, full_name, role, station_name, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, 1, ?)
  `).run(
    cleanUser,
    hashPassword(password),
    String(fullName).trim(),
    safeRole,
    String(stationName).trim(),
    new Date().toISOString()
  );
  res.status(201).json({ ok: true });
});

app.put('/api/admin/users/:id', requireAuth, requireAdmin, (req, res) => {
  const targetId = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(targetId);
  if (!existing) return res.status(404).json({ error: 'کاربر یافت نشد.' });

  const { fullName, role, stationName, isActive, newPassword } = req.body || {};
  if (targetId === req.user.id && isActive === false) {
    return res.status(400).json({ error: 'امکان غیرفعال کردن حساب فعلی خودتان وجود ندارد.' });
  }

  const nextHash = newPassword && String(newPassword).trim().length > 0
    ? hashPassword(String(newPassword).trim())
    : existing.password_hash;

  db.prepare(`
    UPDATE users
    SET full_name = ?,
        role = ?,
        station_name = ?,
        is_active = ?,
        password_hash = ?
    WHERE id = ?
  `).run(
    fullName !== undefined ? String(fullName).trim() : existing.full_name,
    role === 'admin' || role === 'cashier' ? role : existing.role,
    stationName !== undefined ? String(stationName).trim() : existing.station_name,
    isActive !== undefined ? (isActive ? 1 : 0) : existing.is_active,
    nextHash,
    targetId
  );

  if (isActive === false) {
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(targetId);
  }
  res.json({ ok: true });
});

// ------------------------------------------------------------
// ADMIN: SEPIDAR APPROVAL & SYNC
// ------------------------------------------------------------
app.get('/api/admin/sepidar/preview/:id', requireAuth, requireAdmin, (req, res) => {
  const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(Number(req.params.id));
  if (!sale) return res.status(404).json({ error: 'فاکتور یافت نشد.' });
  const payload = buildSepidarPayload(sale);
  res.json({ sale, payload });
});

app.post('/api/admin/sepidar/approve/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(Number(req.params.id));
    if (!sale) return res.status(404).json({ error: 'فاکتور یافت نشد.' });
    if (sale.sepidar_status === 'synced') {
      return res.json({ sale, message: 'این سند قبلاً در سپیدار ثبت شده است.' });
    }
    const result = await syncSaleToSepidar(sale, req.user);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/sepidar/approve-bulk', requireAuth, requireAdmin, async (req, res) => {
  const { saleIds = [] } = req.body || {};
  if (!Array.isArray(saleIds) || saleIds.length === 0) {
    return res.status(400).json({ error: 'هیچ سندی انتخاب نشده است.' });
  }

  const synced = [];
  const errors = [];

  for (const rawId of saleIds) {
    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(Number(rawId));
    if (!sale || sale.sepidar_status === 'synced' || sale.sepidar_status === 'rejected') continue;
    try {
      const r = await syncSaleToSepidar(sale, req.user);
      synced.push(r.sale);
    } catch (err) {
      errors.push({ saleId: sale.id, invoiceNumber: sale.invoice_number, error: err.message });
    }
  }

  res.json({
    syncedCount: synced.length,
    errorCount: errors.length,
    errors,
  });
});

app.post('/api/admin/sepidar/reject/:id', requireAuth, requireAdmin, (req, res) => {
  const saleId = Number(req.params.id);
  const { reason = 'ابطال توسط مدیر مالی' } = req.body || {};
  const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(saleId);
  if (!sale) return res.status(404).json({ error: 'فاکتور یافت نشد.' });

  db.prepare(`
    UPDATE sales
    SET sepidar_status = 'rejected',
        approved_by = ?,
        approved_by_name = ?,
        approved_at = ?,
        sepidar_error_message = ?
    WHERE id = ?
  `).run(req.user.id, req.user.full_name, new Date().toISOString(), String(reason), saleId);

  res.json({ ok: true });
});

app.post('/api/admin/sepidar/test-connection', requireAuth, requireAdmin, async (req, res) => {
  const result = await testSepidarConnection(req.body || {});
  res.json(result);
});

app.get('/api/admin/sepidar/logs', requireAuth, requireAdmin, (_req, res) => {
  const logs = db.prepare('SELECT * FROM sepidar_logs ORDER BY id DESC LIMIT 50').all();
  res.json({ logs });
});

app.get('/api/admin/sepidar/export.csv', requireAuth, requireAdmin, (req, res) => {
  const allSales = db.prepare('SELECT * FROM sales ORDER BY id DESC').all();
  const filtered = filterSalesList(allSales, req.query);
  const csv = generateSepidarCsv(filtered);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="kaveh-battery-sepidar-export.csv"');
  res.send(csv);
});

// ------------------------------------------------------------
// WINDOWS DESKTOP RPA BOT ENDPOINTS (ربات ویندوزی جایگزین حسابدار)
// ------------------------------------------------------------
function verifyBotApiKey(req, res, next) {
  const configuredKey = getSetting('sepidar_bot_api_key', 'KAVEH-BOT-SECRET-1405');
  const providedKey = String(req.headers['x-bot-key'] || req.query.bot_key || '').trim();
  if (!providedKey || providedKey !== configuredKey) {
    return res.status(401).json({ error: 'کلید امنیتی ربات ویندوزی معتبر نیست.' });
  }
  next();
}

app.get('/api/bot/jobs', verifyBotApiKey, (req, res) => {
  const host = String(req.query.host || 'Windows-Server').trim();
  setSetting('sepidar_bot_last_heartbeat', new Date().toISOString());
  setSetting('sepidar_bot_host', host);
  res.json(getBotPendingJobs());
});

app.post('/api/bot/jobs/:id/complete', verifyBotApiKey, (req, res) => {
  try {
    const sale = completeBotJob(Number(req.params.id), req.body || {});
    res.json({ ok: true, sale });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/bot/status', requireAuth, requireAdmin, (_req, res) => {
  const settings = getAllSettings();
  const lastBeat = settings.sepidar_bot_last_heartbeat || '';
  const botOnline = Boolean(lastBeat && Date.now() - new Date(lastBeat).getTime() < 60000);
  const queued = getBotPendingJobs();
  res.json({
    botOnline,
    lastHeartbeat: lastBeat,
    botHost: settings.sepidar_bot_host || '',
    botApiKey: settings.sepidar_bot_api_key || 'KAVEH-BOT-SECRET-1405',
    exePath: settings.sepidar_exe_path || 'C:\\Program Files (x86)\\Sepidar System\\Sepidar\\Sepidar.exe',
    queuedJobs: queued.jobs,
  });
});

app.post('/api/admin/bot/simulate-run', requireAuth, requireAdmin, (_req, res) => {
  const pending = getBotPendingJobs();
  const completed = [];
  for (const job of pending.jobs) {
    const updated = completeBotJob(job.saleId, {
      success: true,
      sepidarDocNumber: `SPD-RPA-${4500 + job.saleId}`,
      sepidarVoucherNumber: `VCH-RPA-${950 + job.saleId}`,
      botHost: 'Windows-Server-RPA (Simulated)',
    });
    completed.push(updated);
  }
  res.json({
    ok: true,
    completedCount: completed.length,
    sales: completed,
  });
});

app.get('/api/admin/bot/download/:file', requireAuth, requireAdmin, (req, res) => {
  const allowedFiles = {
    'kaveh_sepidar_bot.py': 'text/x-python; charset=utf-8',
    'start-sepidar-bot.bat': 'text/plain; charset=utf-8',
    'requirements.txt': 'text/plain; charset=utf-8',
  };
  const fileName = req.params.file;
  if (!allowedFiles[fileName]) {
    return res.status(404).json({ error: 'فایل مورد نظر یافت نشد.' });
  }
  const fullPath = path.join(ROOT_DIR, 'sepidar-windows-bot', fileName);
  res.setHeader('Content-Type', allowedFiles[fileName]);
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.sendFile(fullPath);
});

// ------------------------------------------------------------
// ADMIN: SETTINGS & DEMO RESET
// ------------------------------------------------------------
app.put('/api/admin/settings', requireAuth, requireAdmin, (req, res) => {
  const incoming = req.body || {};
  const allowedKeys = [
    'store_name',
    'store_subtitle',
    'store_phone',
    'store_address',
    'receipt_footer',
    'next_label_number',
    'label_width_mm',
    'label_height_mm',
    'sepidar_mode',
    'sepidar_server_url',
    'sepidar_username',
    'sepidar_password',
    'sepidar_integration_key',
    'sepidar_fiscal_year',
    'sepidar_currency_multiplier',
    'sepidar_default_customer_code',
    'sepidar_sale_sl_code',
    'sepidar_scrap_sl_code',
    'sepidar_cash_fund_code',
    'sepidar_cash_sl_code',
    'sepidar_transfer_bank_code',
    'sepidar_transfer_sl_code',
    'sepidar_scrap_accounting_mode',
    'sepidar_bot_api_key',
    'sepidar_exe_path',
  ];

  for (const key of allowedKeys) {
    if (incoming[key] !== undefined) {
      if (key === 'next_label_number') {
        const num = Math.max(1500, Math.floor(Number(incoming[key]) || 1500));
        setSetting(key, String(num));
      } else {
        setSetting(key, String(incoming[key]));
      }
    }
  }
  res.json({ ok: true, settings: getAllSettings() });
});

app.post('/api/admin/reset-demo', requireAuth, requireAdmin, (_req, res) => {
  db.exec('BEGIN IMMEDIATE;');
  try {
    db.exec('DELETE FROM sepidar_logs;');
    db.exec('DELETE FROM sales;');
    setSetting('next_label_number', '1500');
    setSetting('next_invoice_seq', '1001');
    db.exec('COMMIT;');
    res.json({ ok: true, nextLabelNumber: 1500 });
  } catch (err) {
    db.exec('ROLLBACK;');
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------------
// FRONTEND SERVING (VITE MIDDLEWARE IN DEV / STATIC IN PROD)
// ------------------------------------------------------------
async function startServer() {
  const PORT = Number(process.env.PORT || 3000);
  const HOST = '0.0.0.0';
  const bundleDir = path.join(ROOT_DIR, 'web-bundle');
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(bundleDir);

  if (isProd) {
    app.use(express.static(bundleDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(bundleDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: ROOT_DIR,
      server: {
        middlewareMode: true,
        allowedHosts: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, HOST, () => {
    console.log(`Battery Kaveh Automation Server running on http://${HOST}:${PORT}`);
  });
}

startServer();
