import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'kaveh-battery.db');
export const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, key] = stored.split(':');
  const hashBuffer = crypto.scryptSync(String(password), salt, 64);
  const keyBuffer = Buffer.from(key, 'hex');
  if (hashBuffer.length !== keyBuffer.length) return false;
  return crypto.timingSafeEqual(hashBuffer, keyBuffer);
}

export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'cashier')),
      station_name TEXT DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS battery_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      scrap_price_per_amp INTEGER NOT NULL DEFAULT 50000,
      sepidar_warehouse_code TEXT DEFAULT '101',
      sepidar_scrap_warehouse_code TEXT DEFAULT '102',
      sepidar_scrap_item_code TEXT DEFAULT 'DAGHI-01',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS battery_brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      manufacturer TEXT DEFAULT 'صبا باتری',
      default_price_per_amp INTEGER NOT NULL,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS brand_category_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand_id INTEGER NOT NULL REFERENCES battery_brands(id) ON DELETE CASCADE,
      category_id INTEGER NOT NULL REFERENCES battery_categories(id) ON DELETE CASCADE,
      price_per_amp INTEGER NOT NULL,
      sepidar_item_prefix TEXT DEFAULT '',
      updated_at TEXT NOT NULL,
      updated_by INTEGER REFERENCES users(id),
      UNIQUE(brand_id, category_id)
    );

    CREATE TABLE IF NOT EXISTS amperages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amp_value REAL UNIQUE NOT NULL,
      category_scope TEXT NOT NULL DEFAULT 'all',
      is_sale_option INTEGER NOT NULL DEFAULT 1,
      is_scrap_option INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS pos_terminals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bank_name TEXT NOT NULL,
      terminal_title TEXT NOT NULL,
      terminal_number TEXT DEFAULT '',
      account_number TEXT DEFAULT '',
      sepidar_pos_code TEXT DEFAULT '',
      sepidar_dl_code TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT UNIQUE NOT NULL,
      label_number INTEGER UNIQUE NOT NULL,
      cashier_id INTEGER NOT NULL REFERENCES users(id),
      cashier_name TEXT NOT NULL,
      category_id INTEGER NOT NULL REFERENCES battery_categories(id),
      category_name TEXT NOT NULL,
      brand_id INTEGER NOT NULL REFERENCES battery_brands(id),
      brand_name TEXT NOT NULL,
      amperage REAL NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      total_sold_amps REAL NOT NULL,
      unit_price_per_amp INTEGER NOT NULL,
      gross_amount INTEGER NOT NULL,
      has_scrap INTEGER NOT NULL DEFAULT 0,
      scrap_category_id INTEGER REFERENCES battery_categories(id),
      scrap_category_name TEXT DEFAULT '',
      scrap_amperage REAL NOT NULL DEFAULT 0,
      scrap_quantity INTEGER NOT NULL DEFAULT 1,
      total_scrap_amps REAL NOT NULL DEFAULT 0,
      scrap_price_per_amp INTEGER NOT NULL DEFAULT 0,
      scrap_deduction_amount INTEGER NOT NULL DEFAULT 0,
      calculated_net_amount INTEGER NOT NULL,
      final_sale_amount INTEGER NOT NULL,
      is_manual_price INTEGER NOT NULL DEFAULT 0,
      payment_method TEXT NOT NULL CHECK (payment_method IN ('pos', 'transfer', 'cash')),
      pos_terminal_id INTEGER REFERENCES pos_terminals(id),
      pos_bank_name TEXT DEFAULT '',
      payment_ref TEXT DEFAULT '',
      customer_name TEXT DEFAULT '',
      customer_phone TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      label_printed_count INTEGER NOT NULL DEFAULT 0,
      receipt_printed_count INTEGER NOT NULL DEFAULT 0,
      sepidar_status TEXT NOT NULL DEFAULT 'pending' CHECK (sepidar_status IN ('pending', 'synced', 'rejected', 'error')),
      approved_by INTEGER REFERENCES users(id),
      approved_by_name TEXT DEFAULT '',
      approved_at TEXT DEFAULT '',
      sepidar_doc_number TEXT DEFAULT '',
      sepidar_voucher_number TEXT DEFAULT '',
      sepidar_error_message TEXT DEFAULT '',
      sepidar_payload_json TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
    CREATE INDEX IF NOT EXISTS idx_sales_cashier_id ON sales(cashier_id);
    CREATE INDEX IF NOT EXISTS idx_sales_sepidar_status ON sales(sepidar_status);
    CREATE INDEX IF NOT EXISTS idx_sales_label_number ON sales(label_number);

    CREATE TABLE IF NOT EXISTS price_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      user_name TEXT,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sepidar_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER REFERENCES sales(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      status TEXT NOT NULL,
      request_payload TEXT DEFAULT '',
      response_payload TEXT DEFAULT '',
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Safe schema migration for Windows RPA Bot queue column
  const salesCols = db.prepare('PRAGMA table_info(sales)').all();
  if (!salesCols.some((c) => c.name === 'bot_queue_status')) {
    db.exec("ALTER TABLE sales ADD COLUMN bot_queue_status TEXT DEFAULT '';");
  }

  seedInitialData();
}

function setSettingIfMissing(key, value) {
  db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)').run(key, String(value));
}

export function getSetting(key, fallback = '') {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : fallback;
}

export function setSetting(key, value) {
  db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, String(value));
}

export function getAllSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const map = {};
  for (const r of rows) {
    map[r.key] = r.value;
  }
  return map;
}

function seedInitialData() {
  const nowIso = new Date().toISOString();

  // 1. Default Settings
  const defaultSettings = {
    store_name: 'نمایندگی صبا باتری - باتری کاوه',
    store_subtitle: 'فروش انواع باتری خودرو، موتورسیکلت و UPS',
    store_phone: '۰۲۱-۳۳۹۹۸۸۷۷',
    store_address: 'نمایندگی رسمی باتری صبا - فروشگاه مرکزی باتری کاوه',
    receipt_footer: 'ضمانت اصالت و گارانتی معتبر شرکت صبا باتری | از خرید شما متشکریم',
    next_label_number: '1500',
    next_invoice_seq: '1001',
    label_width_mm: '50',
    label_height_mm: '30',
    sepidar_mode: 'simulation',
    sepidar_server_url: 'http://192.168.1.100:7361/api',
    sepidar_username: 'kaveh_finance',
    sepidar_password: 'Sepidar@1405',
    sepidar_integration_key: 'KAVEH-SABA-POS-01',
    sepidar_fiscal_year: '1405',
    sepidar_currency_multiplier: '10',
    sepidar_default_customer_code: '10001',
    sepidar_sale_sl_code: '611001',
    sepidar_scrap_sl_code: '151005',
    sepidar_cash_fund_code: 'FUND-101',
    sepidar_cash_sl_code: '111001',
    sepidar_transfer_bank_code: 'BANK-TR-01',
    sepidar_transfer_sl_code: '112005',
    sepidar_scrap_accounting_mode: 'inventory_and_deduction',
    sepidar_bot_api_key: 'KAVEH-BOT-SECRET-1405',
    sepidar_exe_path: 'C:\\Program Files (x86)\\Sepidar System\\Sepidar\\Sepidar.exe',
    sepidar_bot_last_heartbeat: '',
    sepidar_bot_host: '',
  };

  for (const [k, v] of Object.entries(defaultSettings)) {
    setSettingIfMissing(k, v);
  }

  // 2. Seed Users
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if (userCount === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (username, password_hash, full_name, role, station_name, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `);
    insertUser.run('admin', hashPassword('123456'), 'مدیر مالی (دفتر طبقه بالا)', 'admin', 'طبقه بالا - مدیریت مالی و سپیدار', nowIso);
    insertUser.run('cashier1', hashPassword('123456'), 'علی رضایی', 'cashier', 'طبقه پایین - صندوق ۱', nowIso);
    insertUser.run('cashier2', hashPassword('123456'), 'محمد کریمی', 'cashier', 'طبقه پایین - صندوق ۲', nowIso);
  }

  // 3. Seed Battery Categories (خودرو، موتور سیکلت، UPS)
  const catCount = db.prepare('SELECT COUNT(*) as c FROM battery_categories').get().c;
  if (catCount === 0) {
    const insertCat = db.prepare(`
      INSERT INTO battery_categories (code, name, scrap_price_per_amp, sepidar_warehouse_code, sepidar_scrap_warehouse_code, sepidar_scrap_item_code, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertCat.run('car', 'باتری خودرو', 50000, '101', '102', 'DAGHI-CAR', 1);
    insertCat.run('motorcycle', 'باتری موتور سیکلت', 50000, '101', '102', 'DAGHI-MOTO', 2);
    insertCat.run('ups', 'باتری UPS', 50000, '103', '102', 'DAGHI-UPS', 3);
  }

  // 4. Seed Battery Brands (راین، اکسون، اوربیتال)
  const brandCount = db.prepare('SELECT COUNT(*) as c FROM battery_brands').get().c;
  if (brandCount === 0) {
    const insertBrand = db.prepare(`
      INSERT INTO battery_brands (code, name, manufacturer, default_price_per_amp, sort_order)
      VALUES (?, ?, 'صبا باتری', ?, ?)
    `);
    insertBrand.run('rayen', 'راین', 132000, 1);
    insertBrand.run('exon', 'اکسون', 135000, 2);
    insertBrand.run('orbital', 'اوربیتال', 138000, 3);
  }

  // 5. Ensure Brand × Category Rate Matrix Exists
  const brands = db.prepare('SELECT * FROM battery_brands').all();
  const categories = db.prepare('SELECT * FROM battery_categories').all();
  const insertRate = db.prepare(`
    INSERT OR IGNORE INTO brand_category_rates (brand_id, category_id, price_per_amp, sepidar_item_prefix, updated_at, updated_by)
    VALUES (?, ?, ?, ?, ?, 1)
  `);
  for (const b of brands) {
    for (const c of categories) {
      const prefix = `${b.code.toUpperCase()}-${c.code.toUpperCase()}`;
      insertRate.run(b.id, c.id, b.default_price_per_amp, prefix, nowIso);
    }
  }

  // 6. Seed Amperages (50, 60, 66, 70, 74, 90)
  const ampCount = db.prepare('SELECT COUNT(*) as c FROM amperages').get().c;
  if (ampCount === 0) {
    const insertAmp = db.prepare(`
      INSERT INTO amperages (amp_value, category_scope, is_sale_option, is_scrap_option, sort_order)
      VALUES (?, 'all', 1, 1, ?)
    `);
    [50, 60, 66, 70, 74, 90].forEach((amp, idx) => {
      insertAmp.run(amp, idx + 1);
    });
  }

  // 7. Seed POS Terminals (صادرات، پارسیان، ملت)
  const posCount = db.prepare('SELECT COUNT(*) as c FROM pos_terminals').get().c;
  if (posCount === 0) {
    const insertPos = db.prepare(`
      INSERT INTO pos_terminals (bank_name, terminal_title, terminal_number, account_number, sepidar_pos_code, sepidar_dl_code, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertPos.run('صادرات', 'کارتخوان بانک صادرات', '8841201', '0109845120004', 'POS-SAD-01', '112001', 1);
    insertPos.run('پارسیان', 'کارتخوان بانک پارسیان', '7720945', '2010554128901', 'POS-PAR-02', '112002', 2);
    insertPos.run('ملت', 'کارتخوان بانک ملت', '9915320', '448712095632', 'POS-MEL-03', '112003', 3);
  }

  // 8. Seed Realistic Sample Sales (starting at Label 1500!) so reports & Sepidar queue are immediately demonstrable
  const saleCount = db.prepare('SELECT COUNT(*) as c FROM sales').get().c;
  if (saleCount === 0) {
    seedSampleSales();
  }
}

function seedSampleSales() {
  const adminUser = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
  const cashier1 = db.prepare("SELECT * FROM users WHERE username = 'cashier1'").get();
  const cashier2 = db.prepare("SELECT * FROM users WHERE username = 'cashier2'").get();

  const catCar = db.prepare("SELECT * FROM battery_categories WHERE code = 'car'").get();
  const catMoto = db.prepare("SELECT * FROM battery_categories WHERE code = 'motorcycle'").get();
  const catUps = db.prepare("SELECT * FROM battery_categories WHERE code = 'ups'").get();

  const brandRayen = db.prepare("SELECT * FROM battery_brands WHERE code = 'rayen'").get();
  const brandExon = db.prepare("SELECT * FROM battery_brands WHERE code = 'exon'").get();
  const brandOrbital = db.prepare("SELECT * FROM battery_brands WHERE code = 'orbital'").get();

  const posSaderat = db.prepare("SELECT * FROM pos_terminals WHERE bank_name = 'صادرات'").get();
  const posParsian = db.prepare("SELECT * FROM pos_terminals WHERE bank_name = 'پارسیان'").get();
  const posMellat = db.prepare("SELECT * FROM pos_terminals WHERE bank_name = 'ملت'").get();

  const now = new Date();
  const hoursAgo = (h) => new Date(now.getTime() - h * 3600 * 1000).toISOString();
  const daysAgo = (d, hOffset = 2) => new Date(now.getTime() - (d * 24 + hOffset) * 3600 * 1000).toISOString();

  const samples = [
    // Earlier in the month (18 days ago & 11 days ago)
    {
      cashier: cashier1,
      cat: catCar,
      brand: brandRayen,
      amp: 60,
      qty: 1,
      scrapAmp: 60,
      payMethod: 'pos',
      pos: posSaderat,
      customerName: 'رضا محمدی',
      customerPhone: '09123456781',
      status: 'synced',
      createdAt: daysAgo(18, 4),
    },
    {
      cashier: cashier2,
      cat: catUps,
      brand: brandOrbital,
      amp: 90,
      qty: 2,
      scrapAmp: 90,
      scrapQty: 2,
      payMethod: 'transfer',
      paymentRef: 'TR-994821',
      customerName: 'شرکت داده‌پردازان البرز',
      customerPhone: '09121112233',
      status: 'synced',
      createdAt: daysAgo(11, 3),
    },
    // Earlier this week (4 days ago & 2 days ago & yesterday)
    {
      cashier: cashier1,
      cat: catCar,
      brand: brandExon,
      amp: 74,
      qty: 1,
      scrapAmp: 70,
      payMethod: 'pos',
      pos: posMellat,
      customerName: 'حسین نادری',
      customerPhone: '09354448899',
      status: 'synced',
      createdAt: daysAgo(4, 5),
    },
    {
      cashier: cashier2,
      cat: catMoto,
      brand: brandRayen,
      amp: 50,
      qty: 1,
      scrapAmp: 0,
      payMethod: 'cash',
      customerName: 'مهدی عباسی',
      customerPhone: '09197776655',
      status: 'synced',
      createdAt: daysAgo(2, 2),
    },
    {
      cashier: cashier1,
      cat: catCar,
      brand: brandOrbital,
      amp: 66,
      qty: 1,
      scrapAmp: 66,
      payMethod: 'pos',
      pos: posParsian,
      customerName: 'سعید شریفی',
      customerPhone: '09128884422',
      status: 'synced',
      createdAt: daysAgo(1, 3),
    },
    // Today across different hours!
    {
      // Exact user prompt example: راین 60 آمپر × 132,000 = 7,920,000 - داغی 60 × 50,000 = 4,920,000 تومان
      cashier: cashier1,
      cat: catCar,
      brand: brandRayen,
      amp: 60,
      qty: 1,
      scrapAmp: 60,
      payMethod: 'pos',
      pos: posMellat,
      customerName: 'امیرحسین کاظمی',
      customerPhone: '09125551234',
      status: 'synced',
      createdAt: hoursAgo(4.5),
    },
    {
      cashier: cashier2,
      cat: catCar,
      brand: brandExon,
      amp: 70,
      qty: 1,
      scrapAmp: 66,
      payMethod: 'pos',
      pos: posSaderat,
      customerName: 'بهرام جلالی',
      customerPhone: '09123339876',
      status: 'pending',
      createdAt: hoursAgo(2.8),
    },
    {
      cashier: cashier1,
      cat: catUps,
      brand: brandOrbital,
      amp: 90,
      qty: 1,
      scrapAmp: 90,
      payMethod: 'transfer',
      paymentRef: '845120994',
      customerName: 'درمانگاه شبانه‌روزی مهر',
      customerPhone: '09124447700',
      status: 'pending',
      createdAt: hoursAgo(1.5),
    },
    {
      cashier: cashier2,
      cat: catCar,
      brand: brandRayen,
      amp: 50,
      qty: 1,
      scrapAmp: 50,
      payMethod: 'pos',
      pos: posParsian,
      customerName: 'حمیدرضا طاهری',
      customerPhone: '09361239988',
      status: 'pending',
      createdAt: hoursAgo(0.4),
    },
  ];

  let labelSeq = 1500;
  let invSeq = 1001;

  const insertSale = db.prepare(`
    INSERT INTO sales (
      invoice_number, label_number, cashier_id, cashier_name,
      category_id, category_name, brand_id, brand_name,
      amperage, quantity, total_sold_amps, unit_price_per_amp, gross_amount,
      has_scrap, scrap_category_id, scrap_category_name, scrap_amperage, scrap_quantity,
      total_scrap_amps, scrap_price_per_amp, scrap_deduction_amount,
      calculated_net_amount, final_sale_amount, is_manual_price,
      payment_method, pos_terminal_id, pos_bank_name, payment_ref,
      customer_name, customer_phone, notes,
      label_printed_count, receipt_printed_count,
      sepidar_status, approved_by, approved_by_name, approved_at,
      sepidar_doc_number, sepidar_voucher_number, created_at
    ) VALUES (
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, 0,
      ?, ?, ?, ?,
      ?, ?, '',
      1, 1,
      ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  for (const s of samples) {
    const qty = s.qty || 1;
    const totalSoldAmps = s.amp * qty;
    const unitRate = s.brand.default_price_per_amp;
    const gross = Math.round(totalSoldAmps * unitRate);

    const hasScrap = s.scrapAmp > 0 ? 1 : 0;
    const scrapQty = hasScrap ? (s.scrapQty || 1) : 0;
    const totalScrapAmps = hasScrap ? s.scrapAmp * scrapQty : 0;
    const scrapRate = hasScrap ? s.cat.scrap_price_per_amp : 0;
    const scrapDeduction = Math.round(totalScrapAmps * scrapRate);
    const netAmount = Math.max(0, gross - scrapDeduction);

    const isSynced = s.status === 'synced';
    const invNum = `KV-1405-${invSeq}`;
    const docNum = isSynced ? `SPD-INV-${4100 + (invSeq - 1000)}` : '';
    const vchNum = isSynced ? `SPD-VCH-${810 + (invSeq - 1000)}` : '';

    insertSale.run(
      invNum,
      labelSeq,
      s.cashier.id,
      s.cashier.full_name,
      s.cat.id,
      s.cat.name,
      s.brand.id,
      s.brand.name,
      s.amp,
      qty,
      totalSoldAmps,
      unitRate,
      gross,
      hasScrap,
      hasScrap ? s.cat.id : null,
      hasScrap ? s.cat.name : '',
      hasScrap ? s.scrapAmp : 0,
      scrapQty,
      totalScrapAmps,
      scrapRate,
      scrapDeduction,
      netAmount,
      netAmount,
      s.payMethod,
      s.pos ? s.pos.id : null,
      s.pos ? s.pos.bank_name : '',
      s.paymentRef || '',
      s.customerName || '',
      s.customerPhone || '',
      s.status,
      isSynced ? adminUser.id : null,
      isSynced ? adminUser.full_name : '',
      isSynced ? s.createdAt : '',
      docNum,
      vchNum,
      s.createdAt
    );

    labelSeq += 1;
    invSeq += 1;
  }

  setSetting('next_label_number', String(labelSeq));
  setSetting('next_invoice_seq', String(invSeq));
}
