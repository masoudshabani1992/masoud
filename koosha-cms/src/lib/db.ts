import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "koosha.db");

declare global {
  // eslint-disable-next-line no-var
  var __kooshaDb: DatabaseSync | undefined;
}

function createConnection() {
  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  return db;
}

export const db: DatabaseSync = global.__kooshaDb ?? createConnection();
if (process.env.NODE_ENV !== "production") global.__kooshaDb = db;

let initialized = false;

export function initDb() {
  if (initialized) return;
  initialized = true;

  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      site_name TEXT NOT NULL DEFAULT 'کوشا خودرو',
      tagline TEXT NOT NULL DEFAULT '',
      logo_url TEXT NOT NULL DEFAULT '',
      logo_dark_url TEXT NOT NULL DEFAULT '',
      favicon TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      customer_phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      instagram TEXT NOT NULL DEFAULT '',
      telegram TEXT NOT NULL DEFAULT '',
      whatsapp TEXT NOT NULL DEFAULT '',
      about_short TEXT NOT NULL DEFAULT '',
      about_content TEXT NOT NULL DEFAULT '',
      footer_text TEXT NOT NULL DEFAULT '',
      seo_title TEXT NOT NULL DEFAULT '',
      seo_description TEXT NOT NULL DEFAULT '',
      seo_keywords TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS slider_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      subtitle TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      link_url TEXT NOT NULL DEFAULT '',
      link_label TEXT NOT NULL DEFAULT 'مشاهده بیشتر',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL DEFAULT '',
      subtitle TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '',
      summary TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      specs TEXT NOT NULL DEFAULT '[]',
      image_url TEXT NOT NULL DEFAULT '',
      gallery TEXT NOT NULL DEFAULT '[]',
      catalog_url TEXT NOT NULL DEFAULT '',
      price_label TEXT NOT NULL DEFAULT '',
      badge TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      seo_title TEXT NOT NULL DEFAULT '',
      seo_description TEXT NOT NULL DEFAULT '',
      seo_keywords TEXT NOT NULL DEFAULT '',
      og_image TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS news_items (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL DEFAULT 'NEWS',
      excerpt TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      cover_image TEXT NOT NULL DEFAULT '',
      source_url TEXT NOT NULL DEFAULT '',
      published_at TEXT NOT NULL DEFAULT (datetime('now')),
      is_active INTEGER NOT NULL DEFAULT 1,
      is_featured INTEGER NOT NULL DEFAULT 0,
      seo_title TEXT NOT NULL DEFAULT '',
      seo_description TEXT NOT NULL DEFAULT '',
      seo_keywords TEXT NOT NULL DEFAULT '',
      og_image TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      cover_image TEXT NOT NULL DEFAULT '',
      show_in_menu INTEGER NOT NULL DEFAULT 0,
      menu_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      seo_title TEXT NOT NULL DEFAULT '',
      seo_description TEXT NOT NULL DEFAULT '',
      seo_keywords TEXT NOT NULL DEFAULT '',
      og_image TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      subject TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL DEFAULT '',
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS agencies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      province TEXT NOT NULL DEFAULT '',
      owner_name TEXT NOT NULL DEFAULT '',
      code TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      phone2 TEXT NOT NULL DEFAULT '',
      postal_code TEXT NOT NULL DEFAULT '',
      work_hours TEXT NOT NULL DEFAULT '',
      covered_cars TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL DEFAULT 'عاملیت فروش و خدمات پس از فروش',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const settingsCount = db.prepare("SELECT COUNT(*) as c FROM settings").get() as { c: number };
  if (settingsCount.c === 0) {
    db.prepare(
      `INSERT INTO settings (id, site_name, tagline, logo_url, logo_dark_url, favicon, phone, customer_phone, email, address, instagram, telegram, whatsapp, about_short, about_content, footer_text, seo_title, seo_description, seo_keywords)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      "کوشا خودرو",
      "نماینده رسمی فروش و خدمات پس از فروش کیا در ایران",
      "/uploads/logo.png",
      "/uploads/logo.png",
      "/uploads/logo.png",
      "021-49970000",
      "021-4997",
      "info@kooshakhodro.com",
      "تهران، کیلومتر ۴ جاده مخصوص، شماره ۷۷",
      "",
      "",
      "",
      "فروش و خدمات پس از فروش کیا در ایران",
      "",
      "© تمامی حقوق این وبسایت متعلق به شرکت کوشا خودرو می‌باشد.",
      "کوشا خودرو | نماینده رسمی کیا در ایران",
      "فروش و خدمات پس از فروش خودروهای کیا در ایران توسط شرکت کوشا خودرو، واردکننده رسمی محصولات کیا موتورز",
      "کوشا خودرو, کیا, نمایندگی کیا, اسپورتیج, سلتوس, K5, K3, پگاس, EV5"
    );
  }
}

initDb();
