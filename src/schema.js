'use strict';
/** اسکیمای دیتابیس + داده‌های اولیه */

const { exec, get, run } = require('./db');
const bcrypt = require('bcryptjs');
const { slugify, faToEnDigits } = require('./util');

function migrate() {
  exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'editor',      -- admin | editor
    active INTEGER NOT NULL DEFAULT 1,
    last_login_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT,
    url TEXT NOT NULL,
    mime TEXT,
    size INTEGER,
    width INTEGER,
    height INTEGER,
    alt TEXT,
    created_by INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,                       -- news | circular | product
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    parent_id INTEGER,
    description TEXT,
    sort INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(type, slug)
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,                       -- news | circular | page
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    excerpt TEXT,
    body TEXT,
    cover_id INTEGER,
    category_id INTEGER,
    status TEXT NOT NULL DEFAULT 'draft',     -- draft | published | scheduled
    featured INTEGER NOT NULL DEFAULT 0,
    pinned INTEGER NOT NULL DEFAULT 0,        -- بخشنامه‌های مهم
    published_at TEXT,
    -- SEO
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT,
    canonical TEXT,
    robots TEXT DEFAULT 'index,follow',
    og_image_id INTEGER,
    -- بخشنامه‌ها
    doc_number TEXT,
    doc_date TEXT,
    attachment_id INTEGER,
    template TEXT,
    views INTEGER NOT NULL DEFAULT 0,
    author_id INTEGER,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(type, slug)
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    model TEXT,
    category_id INTEGER,
    short_desc TEXT,
    body TEXT,
    price INTEGER,                            -- تومان، خالی = تماس بگیرید
    price_note TEXT,
    engine TEXT,
    transmission TEXT,
    fuel TEXT,
    status TEXT NOT NULL DEFAULT 'available', -- available | soon | out
    specs_json TEXT,                          -- [{label, value}]
    gallery_json TEXT,                        -- [media_id...]
    cover_id INTEGER,
    featured INTEGER NOT NULL DEFAULT 0,
    sort INTEGER NOT NULL DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT,
    canonical TEXT,
    robots TEXT DEFAULT 'index,follow',
    og_image_id INTEGER,
    brochure_id INTEGER,                       -- فایل کاتالوگ PDF در جدول media
    brochure_json TEXT,                       -- {tagline, highlights[]}
    views INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    city TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new',       -- new | done
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS redirects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_path TEXT NOT NULL UNIQUE,
    to_path TEXT NOT NULL,
    code INTEGER NOT NULL DEFAULT 301,
    hits INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    entity TEXT,
    entity_id INTEGER,
    meta TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at TEXT NOT NULL,
    ip TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- اسلایدهای صفحه اصلی
  CREATE TABLE IF NOT EXISTS slides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kicker TEXT,
    title TEXT NOT NULL,
    subtitle TEXT,
    image_id INTEGER,
    overlay INTEGER NOT NULL DEFAULT 55,        -- شدت لایه تیره روی تصویر (۰ تا ۹۰)
    align TEXT NOT NULL DEFAULT 'right',        -- right | center
    btn1_label TEXT,
    btn1_url TEXT,
    btn2_label TEXT,
    btn2_url TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    sort INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- نمایندگی‌ها و عاملیت‌ها
  CREATE TABLE IF NOT EXISTS dealers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    code TEXT,                                 -- کد عاملیت
    type TEXT NOT NULL DEFAULT 'dealer',       -- dealer (نمایندگی فروش) | agency (عاملیت خدمات) | both
    city TEXT NOT NULL,
    province TEXT,
    address TEXT,
    phone TEXT,
    mobile TEXT,
    email TEXT,
    hours TEXT,
    lat REAL,
    lng REAL,
    map_url TEXT,
    manager TEXT,
    cover_id INTEGER,
    services TEXT,                             -- ["فروش","خدمات پس از فروش","قطعات یدکی"]
    price_list_id INTEGER,
    active INTEGER NOT NULL DEFAULT 1,
    sort INTEGER NOT NULL DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- لیست‌های قیمت (ویژه عاملیت‌ها و نمایندگی‌ها)
  CREATE TABLE IF NOT EXISTS price_lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    scope TEXT NOT NULL DEFAULT 'general',     -- general | city | dealer | agency
    city TEXT,                                 -- اگر scope = city
    dealer_id INTEGER,                         -- اگر مخصوص یک عاملیت
    customer_type TEXT NOT NULL DEFAULT 'dealer', -- dealer | agency | public
    effective_from TEXT,
    effective_to TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'published',  -- draft | published
    attachment_id INTEGER,                     -- PDF ابلاغیه قیمت
    seo_title TEXT,
    seo_description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- اقلام قیمت
  CREATE TABLE IF NOT EXISTS price_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    price_list_id INTEGER NOT NULL,
    product_id INTEGER,
    label TEXT,                                -- اگر محصول آزاد باشد
    model_year TEXT,
    color TEXT,
    base_price INTEGER,                        -- قیمت پایه (تومان)
    dealer_discount INTEGER DEFAULT 0,         -- تخفیف/سهم عاملیت (تومان)
    final_price INTEGER,                       -- قیمت نهایی برای عاملیت
    public_price INTEGER,                      -- قیمت مصرف‌کننده
    stock INTEGER,                             -- موجودی قابل تخصیص
    delivery TEXT,                             -- زمان تحویل
    note TEXT,
    sort INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (price_list_id) REFERENCES price_lists(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    price_list_id INTEGER NOT NULL,
    product_id INTEGER,
    label TEXT,
    old_price INTEGER,
    new_price INTEGER,
    changed_by INTEGER,
    changed_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_dealers_city ON dealers(city, active);
  CREATE INDEX IF NOT EXISTS idx_price_items_list ON price_items(price_list_id);
  CREATE INDEX IF NOT EXISTS idx_posts_type_status ON posts(type, status, published_at);
  CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
  CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
  CREATE INDEX IF NOT EXISTS idx_media_created ON media(created_at);
  `);
  addColumns();
}

/** افزودن ستون‌های تازه به دیتابیس‌های موجود (SQLite: ALTER TABLE فقط در صورت نبود ستون) */
function addColumns() {
  const has = (table, col) =>
    require('./db').all(`PRAGMA table_info(${table})`).some((c) => c.name === col);
  const jobs = [
    ['products', 'brochure_id', 'ALTER TABLE products ADD COLUMN brochure_id INTEGER'],
    ['products', 'brochure_json', 'ALTER TABLE products ADD COLUMN brochure_json TEXT'],
  ];
  jobs.forEach(([t, c, sql]) => { if (!has(t, c)) exec(sql); });
}

function seed() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@kooshakhodro.com';
  const adminPass = process.env.ADMIN_PASSWORD || 'Koosha@1404';
  if (!get('SELECT id FROM users LIMIT 1')) {
    run(
      `INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)`,
      ['مدیر سایت', adminEmail, bcrypt.hashSync(adminPass, 10), 'admin']
    );
  }

  const defaults = {
    site_name: 'کوشا خودرو',
    site_tagline: 'نماینده رسمی فروش و خدمات پس از فروش کیا در ایران',
    site_description:
      'کوشا خودرو، واردکننده و نماینده رسمی محصولات کیا در ایران؛ اخبار، بخشنامه‌ها و اطلاعیه‌های فروش، محصولات و شبکه نمایندگی‌ها.',
    site_url: process.env.SITE_URL || 'http://localhost:3000',
    logo_url: '',
    logo_dark_url: '',
    favicon_url: '',
    phone: '021-91009000',
    sales_phone: '021-91009000',
    support_phone: '021-91009000',
    email: 'info@kooshakhodro.com',
    address: 'تهران، خیابان ولیعصر، برج کوشا، طبقه ۱۲',
    social_instagram: 'https://instagram.com/kooshakhodro',
    social_telegram: '',
    social_linkedin: '',
    social_aparat: '',
    footer_about: 'کوشا خودرو از سال ۱۳۸۷ در حوزه واردات خودرو فعالیت می‌کند و امروز نماینده رسمی فروش و خدمات پس از فروش محصولات کیا در ایران است.',
    google_analytics_id: '',
    google_search_console: '',
    google_site_verification: '',
    default_og_image: '',
    sale_url: 'https://sale.kooshakhodro.com',
    contact_map: '',
    reviews_enabled: '1',
    inquiry_notify_email: '',
    home_sections: JSON.stringify([
      'hero',
      'featured_products',
      'news',
      'circulars',
      'about',
      'stats',
    ]),
    seo_title_template: '{title} | کوشا خودرو',
    seo_description_max: '160',
    robots_global: 'index,follow',
    sitemap_include_pages: '1',
  };
  for (const [k, v] of Object.entries(defaults)) {
    run('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', [k, v]);
  }

  // دسته‌بندی‌های پیش‌فرض
  const cats = [
    ['news', 'اخبار شرکت', 'company-news'],
    ['news', 'اخبار صنعت خودرو', 'auto-industry'],
    ['news', 'اطلاعیه‌های فروش', 'sales-notices'],
    ['circular', 'بخشنامه‌های فروش', 'sales-circulars'],
    ['circular', 'بخشنامه‌های خدمات پس از فروش', 'service-circulars'],
    ['circular', 'بخشنامه‌های نمایندگی‌ها', 'dealer-circulars'],
    ['product', 'سدان', 'sedan'],
    ['product', 'شاسی‌بلند و کراس‌اور', 'suv'],
    ['product', 'هیبریدی', 'hybrid'],
    ['product', 'هاچ‌بک شهری', 'hatchback'],
  ];
  const catIds = {};
  for (const [type, name, slug] of cats) {
    const exists = get('SELECT id FROM categories WHERE type=? AND slug=?', [type, slug]);
    if (exists) { catIds[slug] = exists.id; continue; }
    const r = run('INSERT INTO categories (type, name, slug) VALUES (?,?,?)', [type, name, slug]);
    catIds[slug] = Number(r.lastInsertRowid);
  }

  if (!get('SELECT id FROM products LIMIT 1')) {
    const products = [
      {
        name: 'کیا اسپورتیج ۲۰۲۵',
        slug: 'kia-sportage-2025',
        model: 'Sportage',
        cat: 'suv',
        short: 'کراس‌اور محبوب کیا با پیشرانه ۱.۵ لیتری توربوشارژ، ۱۹۸ اسب بخار قدرت و جعبه‌دنده ۸ سرعته اتوماتیک.',
        price: 8762200000,
        engine: '۱.۵ لیتر توربوشارژ GDI',
        transmission: 'اتوماتیک ۸ سرعته',
        fuel: 'بنزین',
        featured: 1,
        specs: [
          { label: 'قدرت موتور', value: '۱۹۸ اسب بخار' },
          { label: 'گشتاور', value: '۲۵۳ نیوتن‌متر' },
          { label: 'شتاب ۰ تا ۱۰۰', value: '۹.۱ ثانیه' },
          { label: 'مصرف سوخت ترکیبی', value: '۷.۴ لیتر در ۱۰۰ کیلومتر' },
          { label: 'کیسه هوا', value: '۶ عدد' },
          { label: 'سیستم مولتی‌مدیا', value: 'صفحه لمسی ۱۲.۳ اینچ' },
        ],
      },
      {
        name: 'کیا K5 توربو',
        slug: 'kia-k5-turbo',
        model: 'K5',
        cat: 'sedan',
        short: 'سدان اسپرت کیا با طراحی مدرن، پیشرانه ۱.۵ لیتری توربو و فناوری‌های ایمنی پیشرفته.',
        price: 7760600000,
        engine: '۱.۵ لیتر توربوشارژ',
        transmission: 'اتوماتیک ۷ سرعته DCT',
        fuel: 'بنزین',
        featured: 1,
        specs: [
          { label: 'قدرت موتور', value: '۱۷۰ اسب بخار' },
          { label: 'گشتاور', value: '۲۵۳ نیوتن‌متر' },
          { label: 'شتاب ۰ تا ۱۰۰', value: '۸.۶ ثانیه' },
          { label: 'طول خودرو', value: '۴۹۰۵ میلی‌متر' },
        ],
      },
      {
        name: 'کیا سلتوس',
        slug: 'kia-seltos',
        model: 'Seltos',
        cat: 'suv',
        short: 'کراس‌اور کامپکت کیا با پیشرانه ۱.۴ لیتری توربو، مناسب استفاده شهری و سفرهای جاده‌ای.',
        price: null,
        engine: '۱.۴ لیتر توربوشارژ',
        transmission: 'اتوماتیک ۷ سرعته DCT',
        fuel: 'بنزین',
        featured: 1,
        specs: [
          { label: 'قدرت موتور', value: '۱۴۰ اسب بخار' },
          { label: 'گشتاور', value: '۲۴۲ نیوتن‌متر' },
          { label: 'حجم صندوق', value: '۴۳۳ لیتر' },
        ],
      },
      {
        name: 'کیا سونت',
        slug: 'kia-sonet',
        model: 'Sonet',
        cat: 'suv',
        short: 'کراس‌اور کوچک و اقتصادی کیا با پیشرانه ۱.۵ لیتری تنفس طبیعی.',
        price: null,
        engine: '۱.۵ لیتر تنفس طبیعی',
        transmission: 'اتوماتیک CVT',
        fuel: 'بنزین',
        specs: [
          { label: 'قدرت موتور', value: '۱۱۵ اسب بخار' },
          { label: 'گشتاور', value: '۱۴۴ نیوتن‌متر' },
        ],
      },
    ];
    let i = 0;
    for (const p of products) {
      i++;
      run(
        `INSERT INTO products (name, slug, model, category_id, short_desc, body, price, engine, transmission, fuel,
          specs_json, featured, sort, seo_title, seo_description)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          p.name, p.slug, p.model, catIds[p.cat] || null, p.short,
          `<p>${p.short}</p><p>این محصول با گارانتی رسمی کوشا خودرو و خدمات پس از فروش در شبکه نمایندگی‌های سراسر کشور عرضه می‌شود. برای دریافت کاتالوگ کامل و مشاوره خرید با کارشناسان ما در تماس باشید.</p>`,
          p.price, p.engine, p.transmission, p.fuel,
          JSON.stringify(p.specs || []), p.featured || 0, i,
          `${p.name} | قیمت و مشخصات`, p.short.slice(0, 155),
        ]
      );
    }
  }

  if (!get("SELECT id FROM posts WHERE type='page' LIMIT 1")) {
    const pages = [
      ['درباره کوشا خودرو', 'about', 'کوشا خودرو از سال ۱۳۸۷ فعالیت خود را در حوزه واردات خودرو آغاز کرد و امروز نماینده رسمی فروش و خدمات پس از فروش محصولات کیا در ایران است.'],
      ['تماس با ما', 'contact', 'برای ارتباط با کوشا خودرو از راه‌های زیر استفاده کنید.'],
      ['حریم خصوصی', 'privacy', 'این صفحه سیاست حفظ حریم خصوصی کاربران وب‌سایت کوشا خودرو را شرح می‌دهد.'],
      ['شرایط و قوانین', 'terms', 'قوانین استفاده از وب‌سایت و خدمات کوشا خودرو.'],
    ];
    for (const [title, slug, body] of pages) {
      run(
        `INSERT INTO posts (type,title,slug,excerpt,body,status,published_at,template)
         VALUES ('page',?,?,?,?,'published',datetime('now'),'default')`,
        [title, slug, body, `<p>${body}</p>`]
      );
    }
  }
}

function seedAll() {
  migrate();
  seed();
  try {
    require('./seed-content').seedDemo();
  } catch (e) {
    console.error('[seed-content]', e.message);
  }
  try {
    require('./seed-dealers').seedDealers();
  } catch (e) {
    console.error('[seed-dealers]', e.message);
  }
  try {
    require('./seed-koosha').seedKoosha();
  } catch (e) {
    console.error('[seed-koosha]', e.message);
  }
}

module.exports = { migrate, seed, seedAll };
