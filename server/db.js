const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'factory.db');

let db = null;

// 1. Try native node:sqlite (Node 22.5+)
try {
  const { DatabaseSync } = require('node:sqlite');
  if (typeof DatabaseSync === 'function') {
    db = new DatabaseSync(dbPath);
  }
} catch (e) {
  // Not Node 22 or node:sqlite not enabled
}

// 2. Try better-sqlite3 (Node 16 / 18 / 20 / 22)
if (!db) {
  try {
    const Database = require('better-sqlite3');
    db = new Database(dbPath);
  } catch (e) {
    console.error('Error initializing SQLite database engine:', e);
    throw new Error('No compatible SQLite database engine found. Please ensure Node.js is installed and run: cd server && npm install');
  }
}

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT NOT NULL,
      phone TEXT,
      avatar TEXT,
      permissions TEXT,
      is_active INTEGER DEFAULT 1,
      monthly_target_inquiries INTEGER DEFAULT 20,
      monthly_target_amount REAL DEFAULT 0,
      monthly_target_orders INTEGER DEFAULT 5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS marketer_targets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      year_month_fa TEXT NOT NULL,
      target_inquiries INTEGER DEFAULT 20,
      target_amount REAL DEFAULT 0,
      target_orders INTEGER DEFAULT 5,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, year_month_fa),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS employee_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      personnel_code TEXT UNIQUE,
      national_id TEXT,
      hire_date_fa TEXT,
      contract_type TEXT DEFAULT 'full_time',
      job_title TEXT NOT NULL,
      department TEXT NOT NULL,
      base_salary REAL DEFAULT 0,
      emergency_phone TEXT,
      education TEXT,
      skills TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS hr_evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      evaluator_id INTEGER NOT NULL,
      evaluator_name TEXT NOT NULL,
      period_fa TEXT NOT NULL,
      score_quality REAL NOT NULL,
      score_speed REAL NOT NULL,
      score_target REAL NOT NULL,
      score_discipline REAL NOT NULL,
      score_teamwork REAL NOT NULL,
      total_score REAL NOT NULL,
      performance_grade TEXT NOT NULL,
      strengths TEXT,
      improvements TEXT,
      feedback_notes TEXT,
      bonus_percent REAL DEFAULT 0,
      bonus_amount REAL DEFAULT 0,
      evaluation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (evaluator_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS hr_disciplinary_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      issued_by TEXT NOT NULL,
      date_fa TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_code TEXT UNIQUE,
      company_name TEXT NOT NULL,
      contact_person TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS material_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      unit TEXT NOT NULL,
      price_per_unit REAL NOT NULL,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      archive_code TEXT UNIQUE NOT NULL,
      order_code TEXT,
      customer_code TEXT,
      title TEXT NOT NULL,
      customer_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      box_type TEXT NOT NULL,
      box_structure TEXT,
      quantity INTEGER NOT NULL,
      order_date TEXT,
      file_date TEXT,
      priority TEXT DEFAULT 'normal',
      current_stage INTEGER DEFAULT 1,
      status TEXT DEFAULT 'in_progress',
      is_first_print INTEGER DEFAULT 1,
      photography TEXT DEFAULT 'none',

      -- Cardboard (مقوا)
      has_cardboard INTEGER DEFAULT 1,
      cardboard_type TEXT,
      cardboard_length REAL,
      cardboard_width REAL,
      cardboard_grammage REAL,
      cardboard_unit_price REAL,

      -- Print (چاپ)
      has_print INTEGER DEFAULT 1,
      zinc_status TEXT,
      custom_color INTEGER DEFAULT 0,
      print_colors_count INTEGER DEFAULT 4,
      print_type TEXT,
      print_format TEXT,
      print_length REAL,
      print_width REAL,
      print_waste REAL,
      boxes_per_sheet INTEGER DEFAULT 2,
      print_sheets_count INTEGER,

      -- Varnish & Cellophane
      has_varnish INTEGER DEFAULT 0,
      has_cellophane INTEGER DEFAULT 0,
      cellophane_type TEXT,

      -- UV
      has_uv INTEGER DEFAULT 0,
      uv_shablon_status TEXT,
      uv_type TEXT,

      -- Foil
      has_foil INTEGER DEFAULT 0,
      foil_type TEXT,
      foil_length REAL,
      foil_width REAL,

      -- Emboss
      has_emboss INTEGER DEFAULT 0,
      emboss_cliche_status TEXT,
      emboss_type TEXT,

      -- Die
      has_blade INTEGER DEFAULT 1,
      blade_status TEXT,
      blade_type TEXT,

      -- Window
      has_window INTEGER DEFAULT 0,
      window_length REAL,
      window_width REAL,
      window_thickness REAL,

      -- Glue
      has_glue INTEGER DEFAULT 1,
      glue_type TEXT,
      glue_price REAL,

      -- Plastic & Corrugated
      has_plastic INTEGER DEFAULT 0,
      has_carton INTEGER DEFAULT 0,
      carton_type TEXT,

      notes TEXT,
      unit_price REAL,
      total_price REAL,
      prepayment REAL,
      profit_percent REAL DEFAULT 20,
      settlement_type INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS workflow_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      stage_number INTEGER NOT NULL,
      stage_name TEXT NOT NULL,
      action TEXT NOT NULL,
      user_id INTEGER,
      user_name TEXT,
      user_role TEXT,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      material_type TEXT NOT NULL,
      material_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      supplier_name TEXT,
      supplier_phone TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS project_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      stage INTEGER NOT NULL,
      action TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      comment TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS project_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT,
      file_size INTEGER,
      uploaded_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS project_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      user_role TEXT NOT NULL,
      comment TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      archive_code TEXT,
      user_id INTEGER,
      role TEXT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notification_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS marketing_leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_code TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      company_name TEXT,
      box_title TEXT NOT NULL,
      box_type TEXT NOT NULL,
      length REAL NOT NULL,
      width REAL NOT NULL,
      height REAL NOT NULL,
      quantity INTEGER NOT NULL,
      cardboard_type TEXT,
      grammage REAL,
      coating_type TEXT,
      foil_type TEXT,
      uv_type TEXT,
      emboss_type TEXT,
      window_patching INTEGER DEFAULT 0,
      gluing_type TEXT,
      marketer_notes TEXT,
      target_price_per_box REAL,
      marketer_name TEXT NOT NULL,
      estimated_unit_price REAL,
      estimated_total_price REAL,
      estimation_date TEXT,
      estimated_by TEXT,
      dieline_file_url TEXT,
      dieline_filename TEXT,
      incomplete_reason TEXT,
      status TEXT DEFAULT 'pending_estimation',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 1. دستور تولید هوشمند با ۳ رنگ وضعیت (سفید / زرد / سبز)
    CREATE TABLE IF NOT EXISTS production_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_code TEXT NOT NULL,
      archive_code TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      product_title TEXT NOT NULL,
      order_category TEXT DEFAULT 'offset', -- 'offset', 'digital', 'service'
      quantity INTEGER NOT NULL,
      box_type TEXT,
      material TEXT,
      grammage REAL,
      sheet_size TEXT,
      sheet_count INTEGER,
      zinc_count INTEGER,
      coating_type TEXT,
      diecut_type TEXT,
      gluing_type TEXT,
      status_color TEXT DEFAULT 'white', -- 'white' (در صف تولید), 'yellow' (پرونده در دست مالی), 'green' (تکمیل و بایگانی)
      financial_status TEXT DEFAULT 'در انتظار پیش‌پرداخت',
      financial_notes TEXT,
      total_price REAL,
      paid_amount REAL DEFAULT 0,
      delivery_deadline TEXT,
      assigned_machine TEXT,
      production_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. انبار مقوا و کاغذ و ملزومات کارخانه
    CREATE TABLE IF NOT EXISTS warehouse_receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      warehouse_category TEXT DEFAULT 'cardboard', -- 'cardboard' (مقوا), 'sheet_carton' (ورق), 'single_face' (سینگل), 'cellophane' (سلفون), 'pvc_film' (طلق), 'ink' (مرکب)
      registration_date TEXT NOT NULL,
      order_code TEXT NOT NULL,
      archive_code TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      order_name TEXT NOT NULL,
      supplier TEXT NOT NULL, -- یزدی، جوزی، مرادیان، انبار، امیران، اسکویی، پتروپلیمر، آران، هوبر
      material TEXT NOT NULL, -- ایندربرد، پشت طوسی، گلاسه، E-Flute، سلفون مات، طلق PVC، مرکب CMYK
      grammage REAL,
      size TEXT NOT NULL, -- 50*90, 70*100, رول عرض ۱۰۰, قوطی ۱ کیلو...
      unit TEXT DEFAULT 'شیت',
      required_qty INTEGER NOT NULL,
      unloading_location TEXT NOT NULL, -- انبار چهاردانگه، سالن چاپ شمس‌آباد، سوله لامینت، انبار ملزومات
      received_qty_1 INTEGER,
      received_date_1 TEXT,
      received_qty_2 INTEGER,
      received_date_2 TEXT,
      total_received INTEGER DEFAULT 0,
      status TEXT DEFAULT 'received', -- 'received', 'partial', 'pending', 'excess'
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. سفارشات چاپ دیجیتال
    CREATE TABLE IF NOT EXISTS digital_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_code TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      title TEXT NOT NULL,
      machine_type TEXT NOT NULL, -- کونیکا مینولتا، زیراکس، اکوسالونت، یووی فلت‌بد، پلاتر
      paper_type TEXT NOT NULL, -- گلاسه، تحریر، کتان، متالایز، پشت‌چسب‌دار، لیبل PVC
      grammage REAL,
      dimensions TEXT NOT NULL, -- A3+، A4، 50x70، رول عرض ۱۰۰
      quantity INTEGER NOT NULL,
      print_side TEXT DEFAULT 'یکرو ۴ رنگ', -- یکرو ۴ رنگ، دورو ۴ رنگ، چاپ سفید + ۴ رنگ
      lamination TEXT DEFAULT 'بدون روکش', -- سلفون مات، براق، سافت‌تاچ، شنی
      finishing TEXT, -- برش دوربری، کات دیجیتال، خط‌تا، طلاکوب دیجیتال، فنر دوبل
      status_color TEXT DEFAULT 'white', -- 'white', 'yellow', 'green'
      unit_price REAL,
      total_price REAL,
      paid_amount REAL DEFAULT 0,
      delivery_deadline TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. کارهای خدماتی و اجرتی (Toll / Finishing Processing)
    CREATE TABLE IF NOT EXISTS toll_service_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_code TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      service_title TEXT NOT NULL,
      service_types TEXT NOT NULL, -- JSON Array: ["دایکات", "سلفون مات", "طلاکوب", ...]
      incoming_material_desc TEXT NOT NULL, -- توضیحات جنس امانی مشتری
      incoming_sheet_count INTEGER NOT NULL, -- تعداد شیت امانی ورودی
      incoming_receipt_number TEXT, -- شماره قبض انبار ورودی
      die_status TEXT DEFAULT 'قالب در کارخانه موجود است', -- قالب موجود / قالب مشتری / ساخت قالب
      setup_fee REAL DEFAULT 0, -- هزینه تنظیم دستگاه
      rate_per_unit REAL NOT NULL, -- اجرت هر ضرب/شیت/متر
      total_amount REAL NOT NULL,
      paid_amount REAL DEFAULT 0,
      status_color TEXT DEFAULT 'white', -- 'white' (در نوبت اجرا), 'yellow' (تسویه مالی), 'green' (تکمیل و تحویل)
      operator_name TEXT,
      completed_qty INTEGER,
      delivered_date TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 5. جدول فایل‌ها و پیوست‌های استوریج (User Storage & File Attachments)
    CREATE TABLE IF NOT EXISTS storage_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT NOT NULL DEFAULT 'general',
      user_full_name TEXT,
      original_filename TEXT NOT NULL,
      stored_filename TEXT NOT NULL,
      relative_path TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_size_bytes INTEGER DEFAULT 0,
      mime_type TEXT,
      category TEXT DEFAULT 'general', -- 'dieline', 'artwork', 'migration', 'invoice', 'photo', 'general'
      related_entity_type TEXT, -- 'marketing_lead', 'project', 'customer', 'receipt'
      related_entity_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 6. جدول جامع تاریخچه و لاگ عملیات کاربران (User Activity Logs & Audit Trail)
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT NOT NULL DEFAULT 'unknown',
      full_name TEXT NOT NULL DEFAULT 'کاربر نامشخص',
      role TEXT NOT NULL DEFAULT 'user',
      action TEXT NOT NULL, -- 'login', 'logout', 'create_order', 'edit_order', 'update_stage', 'delete_order', 'create_lead', 'estimate_lead', 'update_lead_status', 'convert_lead_to_order', 'warehouse_receipt', 'warehouse_edit', 'user_create', 'user_edit', 'user_delete', 'price_formula_update', 'file_upload', 'file_delete', 'hr_evaluation', 'backup_download', 'status_color_change'
      module TEXT NOT NULL, -- 'auth', 'orders', 'workflow', 'marketing', 'calculator', 'warehouse', 'production', 'studio', 'users', 'hr', 'pricing', 'storage', 'backup'
      target_id TEXT,
      target_name TEXT,
      description TEXT NOT NULL,
      details_json TEXT,
      ip_address TEXT DEFAULT '127.0.0.1',
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(username);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_module ON activity_logs(module);

    -- 7. جدول اعتبارسنجی بیومتریک اثر انگشت و تشخیص چهره موبایل (Biometric / WebAuthn / Passkeys)
    CREATE TABLE IF NOT EXISTS biometric_credentials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      credential_id TEXT UNIQUE NOT NULL,
      public_key TEXT,
      device_name TEXT NOT NULL DEFAULT 'گوشی موبایل پرسنل',
      device_type TEXT NOT NULL DEFAULT 'mobile_fingerprint', -- 'mobile_fingerprint', 'mobile_face_id', 'touch_id', 'windows_hello'
      device_info TEXT, -- OS, Browser details, IP
      bio_token TEXT,   -- Secure cryptographic local device verification token
      counter INTEGER DEFAULT 0,
      last_used_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_biometric_user ON biometric_credentials(user_id);
    CREATE INDEX IF NOT EXISTS idx_biometric_cred ON biometric_credentials(credential_id);
  `);

  // Seed default users
  const checkUser = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (checkUser.count === 0) {
    const salt = bcrypt.genSaltSync(10);
    const passHash = bcrypt.hashSync('123456', salt);

    const insertUser = db.prepare(`
      INSERT INTO users (username, password_hash, full_name, role, department, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertUser.run('admin', passHash, 'مهندس مسعود شعبانی', 'admin', 'مدیریت ارشد سیستم (Admin)', '09121111111');
    insertUser.run('ceo', passHash, 'مدیریت محترم عامل', 'ceo', 'مدیریت عامل کارخانه', '09121111112');
    insertUser.run('sales', passHash, 'مهندس رادمنش', 'sales', 'واحد فروش', '09122222222');
    insertUser.run('marketer', passHash, 'رضا صادقی', 'marketer', 'بازاریابی و استعلام میدانی', '09123334455');
    insertUser.run('secretary', passHash, 'خانم افشار', 'secretary', 'دبیرخانه و ثبت سفارش', '09123333333');
    insertUser.run('estimate', passHash, 'مهندس احمدی', 'estimation', 'واحد برآورد و قیمت‌گذاری', '09124444444');
    insertUser.run('designer', passHash, 'مهندس کاظمی', 'design', 'استودیو طراحی و قالب', '09125555555');
    insertUser.run('mockup', passHash, 'مهندس طاهری', 'mockup', 'واحد ماکت‌سازی و لیتوگرافی', '09126666666');
    insertUser.run('procurement', passHash, 'مهندس باقری', 'procurement', 'واحد بازرگانی و خرید مقوا', '09127777777');
    insertUser.run('production', passHash, 'استاد رحیمی', 'production', 'سرپرست سالن چاپ و دایکات', '09128888888');
    insertUser.run('accounting', passHash, 'خانم تهرانی', 'accounting', 'امور مالی و حسابداری', '09129999999');
  }

  // Ensure Admin user always exists
  try {
    const salt = bcrypt.genSaltSync(10);
    const passHash = bcrypt.hashSync('123456', salt);
    const existingAdmin = db.prepare('SELECT id FROM users WHERE username = ? OR role = ?').get('admin', 'admin');
    if (!existingAdmin) {
      db.prepare(`
        INSERT INTO users (username, password_hash, full_name, role, department, phone)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('admin', passHash, 'مهندس مسعود شعبانی', 'admin', 'مدیریت ارشد سیستم (Admin)', '09121111111');
    }
  } catch (e) {}

  // Migrations / Column additions if missing
  try {
    db.prepare('CREATE TABLE IF NOT EXISTS settings (key TEXT UNIQUE NOT NULL, value TEXT NOT NULL)').run();
  } catch (e) {}

  try {
    db.prepare("ALTER TABLE warehouse_receipts ADD COLUMN warehouse_category TEXT DEFAULT 'cardboard'").run();
  } catch (e) {}

  try {
    db.prepare("ALTER TABLE projects ADD COLUMN length_mm REAL").run();
  } catch (e) {}
  try {
    db.prepare("ALTER TABLE projects ADD COLUMN width_mm REAL").run();
  } catch (e) {}
  try {
    db.prepare("ALTER TABLE projects ADD COLUMN height_mm REAL").run();
  } catch (e) {}
  try {
    db.prepare("ALTER TABLE projects ADD COLUMN box_length REAL").run();
  } catch (e) {}
  try {
    db.prepare("ALTER TABLE projects ADD COLUMN box_width REAL").run();
  } catch (e) {}
  try {
    db.prepare("ALTER TABLE projects ADD COLUMN box_height REAL").run();
  } catch (e) {}
  try {
    db.prepare("ALTER TABLE projects ADD COLUMN profit_margin REAL DEFAULT 20").run();
  } catch (e) {}
  try {
    db.prepare("ALTER TABLE projects ADD COLUMN estimated_unit_price REAL").run();
  } catch (e) {}
  try {
    db.prepare("ALTER TABLE projects ADD COLUMN estimated_total_price REAL").run();
  } catch (e) {}
  try {
    db.prepare("ALTER TABLE projects ADD COLUMN cost_price REAL").run();
  } catch (e) {}
  try {
    db.prepare("ALTER TABLE projects ADD COLUMN created_by INTEGER").run();
  } catch (e) {}
  try {
    db.prepare("ALTER TABLE projects ADD COLUMN assigned_to INTEGER").run();
  } catch (e) {}
  try {
    db.prepare("ALTER TABLE projects ADD COLUMN marketer_name TEXT").run();
  } catch (e) {}

  // Migrations for marketing_leads table
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN customer_phone TEXT").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN product_name TEXT").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN cardboard_grammage REAL").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN material_construction TEXT").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN cellophane_type TEXT").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN box_length REAL").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN box_width REAL").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN box_height REAL").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN notes TEXT").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN marketer_id INTEGER").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP").run(); } catch (e) {}

  try { db.prepare("UPDATE marketing_leads SET customer_phone = phone WHERE customer_phone IS NULL AND phone IS NOT NULL").run(); } catch (e) {}
  try { db.prepare("UPDATE marketing_leads SET product_name = box_title WHERE product_name IS NULL AND box_title IS NOT NULL").run(); } catch (e) {}
  try { db.prepare("UPDATE marketing_leads SET box_length = length WHERE box_length IS NULL AND length IS NOT NULL").run(); } catch (e) {}
  try { db.prepare("UPDATE marketing_leads SET box_width = width WHERE box_width IS NULL AND width IS NOT NULL").run(); } catch (e) {}
  try { db.prepare("UPDATE marketing_leads SET box_height = height WHERE box_height IS NULL AND height IS NOT NULL").run(); } catch (e) {}
  try { db.prepare("UPDATE marketing_leads SET cardboard_grammage = grammage WHERE cardboard_grammage IS NULL AND grammage IS NOT NULL").run(); } catch (e) {}
  try { db.prepare("UPDATE marketing_leads SET cellophane_type = coating_type WHERE cellophane_type IS NULL AND coating_type IS NOT NULL").run(); } catch (e) {}
  try { db.prepare("UPDATE marketing_leads SET notes = marketer_notes WHERE notes IS NULL AND marketer_notes IS NOT NULL").run(); } catch (e) {}

  try {
    db.prepare("ALTER TABLE warehouse_receipts ADD COLUMN unit TEXT DEFAULT 'شیت'").run();
  } catch (e) {}

  try {
    db.prepare("ALTER TABLE warehouse_receipts ADD COLUMN status_color TEXT DEFAULT 'white'").run();
  } catch (e) {}

  try {
    db.prepare("ALTER TABLE marketing_leads ADD COLUMN customer_feedback TEXT").run();
  } catch (e) {}

  try {
    db.prepare("ALTER TABLE marketing_leads ADD COLUMN rejection_reason TEXT").run();
  } catch (e) {}

  try {
    db.prepare("ALTER TABLE marketing_leads ADD COLUMN followup_logs TEXT").run();
  } catch (e) {}

  try {
    db.prepare("ALTER TABLE marketing_leads ADD COLUMN commercial_reviewer_id INTEGER").run();
  } catch (e) {}

  try {
    db.prepare("ALTER TABLE marketing_leads ADD COLUMN commercial_reviewer_name TEXT").run();
  } catch (e) {}

  try {
    db.prepare("ALTER TABLE marketing_leads ADD COLUMN commercial_notes TEXT").run();
  } catch (e) {}

  try {
    db.prepare("ALTER TABLE marketing_leads ADD COLUMN reviewed_at DATETIME").run();
  } catch (e) {}

  try {
    db.prepare("ALTER TABLE marketing_leads ADD COLUMN converted_project_id INTEGER").run();
  } catch (e) {}

  try {
    db.prepare("ALTER TABLE marketing_leads ADD COLUMN converted_archive_code TEXT").run();
  } catch (e) {}

  // Granular technical material specifications migrations
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN main_category TEXT DEFAULT 'مقوایی'").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN print_type TEXT").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN print_colors TEXT").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN print_zinc TEXT").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN custom_spot_color INTEGER DEFAULT 0").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN print_form_length REAL").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN print_form_width REAL").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN boxes_per_sheet INTEGER").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN coating_category TEXT DEFAULT 'سلفون'").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN varnish_type TEXT").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN lacquer_type TEXT").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN has_uv INTEGER DEFAULT 0").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN has_emboss INTEGER DEFAULT 0").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN has_window INTEGER DEFAULT 0").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN window_length REAL").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN window_width REAL").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN window_thickness TEXT").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN has_glue INTEGER DEFAULT 1").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN glue_type TEXT").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN glue_length REAL").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN glue_width REAL").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN has_foil INTEGER DEFAULT 0").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN foil_length REAL").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN foil_width REAL").run(); } catch (e) {}
  try { db.prepare("ALTER TABLE marketing_leads ADD COLUMN technical_specs_json TEXT").run(); } catch (e) {}

  // Biometric authentication migrations
  try {
    db.prepare("ALTER TABLE users ADD COLUMN biometric_enabled INTEGER DEFAULT 0").run();
  } catch (e) {}

  // Seed sample biometric devices for default demo users
  try {
    const credCount = db.prepare('SELECT COUNT(*) as count FROM biometric_credentials').get().count;
    if (credCount === 0) {
      const usersList = db.prepare('SELECT id, username, full_name, role FROM users').all();
      const insertBio = db.prepare(`
        INSERT INTO biometric_credentials (
          user_id, credential_id, device_name, device_type, device_info, bio_token, last_used_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-1 hours'))
      `);

      usersList.forEach(u => {
        let devName = 'گوشی سامسونگ گلکسی پرسنل (اثر انگشت)';
        let devType = 'mobile_fingerprint';
        if (u.role === 'ceo' || u.role === 'admin') {
          devName = 'آیفون ۱۵ پرو (تشخیص چهره Face ID)';
          devType = 'mobile_face_id';
        } else if (u.role === 'design') {
          devName = 'تبلت گرافیکی آی‌پد (Touch ID)';
          devType = 'touch_id';
        } else if (u.role === 'production') {
          devName = 'موبایل شیائومی سرپرست سالن (Fingerprint)';
          devType = 'mobile_fingerprint';
        }

        const credId = `bio_cred_${u.username}_${u.id}_dev1`;
        const bioToken = `btok_${Buffer.from(`${u.id}:${u.username}:biometric_verified_token_factory_1405`).toString('base64')}`;
        try {
          insertBio.run(u.id, credId, devName, devType, 'Mobile Chrome / Safari on Mobile OS', bioToken);
          db.prepare('UPDATE users SET biometric_enabled = 1 WHERE id = ?').run(u.id);
        } catch (err) {}
      });
    }
  } catch (e) {}

  // Seed default warehouse receipts matching actual factory Google Sheet
  const checkWarehouse = db.prepare('SELECT COUNT(*) as count FROM warehouse_receipts').get();
  if (checkWarehouse.count === 0) {
    const insertWh = db.prepare(`
      INSERT INTO warehouse_receipts (
        warehouse_category, registration_date, order_code, archive_code, customer_name, order_name,
        supplier, material, grammage, size, unit, required_qty, unloading_location,
        received_qty_1, received_date_1, received_qty_2, received_date_2, total_received, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // 1. مقوا (Cardboard) - 22 live factory records
    insertWh.run('cardboard', '1405/01/15', '10745', '8609', 'الکتروژن', 'جعبه 90001061 BLDC', 'یزدی', 'پشت طوسی راشا', 180, '50*90', 'شیت', 40300, 'اندیشه', 21800, '1405/01/15', 18500, '1405/02/02', 40300, 'received', 'آقای یزدی کم فرستاده در نتیجه بقیشو از موجودی ارسال میکنیم.');
    insertWh.run('cardboard', '1405/01/16', '10746', '8535', 'علوم خلاق', 'جعبه تخم دایناسور', 'انبار', 'ایندربرد', 230, '80*120', 'شیت', 300, 'ارتا', 300, '1405/01/16', null, null, 300, 'received', 'تحویل فوری');
    insertWh.run('cardboard', '1405/01/29', '10747', '8541', 'میهن یدک', 'جعبه برق هشت بوبین هرمزی کد 120', 'یزدی', 'پشت طوسی راشا', 180, '70*100', 'شیت', 2600, 'ارتا', 2600, '1405/02/02', null, null, 2600, 'received', 'تکمیل و ارسال به چاپ');
    insertWh.run('cardboard', '1405/01/29', '10748', '8540', 'میهن یدک', 'جعبه ایتم 414 بوبین برق cdi با پایه نگهدارنده', 'جوزی', 'ایندربرد', 350, '70*120', 'شیت', 1700, 'صیادی', 1900, '1405/01/31', null, null, 1900, 'excess', '۲۰۰ عدد (۲ بند) اضافی آمده - پالت خریداری شده نه بند.');
    insertWh.run('cardboard', '1405/01/29', '10749', '8533', 'میهن یدک', 'جعبه برق هشت بوبین هوندا سوکت کد 418', 'جوزی', 'پشت طوسی راشا', 180, '70*100', 'شیت', 5100, 'صیادی', 5500, '1405/01/31', null, null, 5500, 'received', '۵۵۰۰ خرید / ۵۱۰۰ ارسال به چاپخانه');
    insertWh.run('cardboard', '1405/01/30', '10750', '8640', 'آ.اردلان', 'زیروکیوم پژو 405', 'یزدی', 'پشت طوسی راشا', 180, '55*83', 'شیت', 10200, 'اندیشه', 10200, '1405/01/30', null, null, 10200, 'received', 'کامل دریافت شد');
    insertWh.run('cardboard', '1405/01/30', '10751', '8642', 'میهن یدک', 'کارتن 34.5در54درارتفاع38.8', 'یزدی', 'پشت طوسی راشا', 180, '75*94', 'شیت', 10400, 'اندیشه', 10400, '1405/01/30', null, null, 10400, 'received', 'در صف لامینت');
    insertWh.run('cardboard', '1405/01/31', '10752', '8651', 'آ.نورانی', 'لیبل ماشین', 'جوزی', 'پشت چسب دار', 80, '51*70', 'شیت', 2550, 'اسکویی', 2550, '1405/02/05', null, null, 2550, 'received', 'لیبل رولی');
    insertWh.run('cardboard', '1405/01/31', '10753', '8626', 'صحت', 'سربرگ آزمایشگاه', 'جوزی', 'تحریر', 80, '60*90', 'شیت', 500, 'ارتا', 500, '1405/02/02', null, null, 500, 'received', 'تحویل شد');
    insertWh.run('cardboard', '1405/01/31', '10754', '8637', 'دل کوک', 'بروشور سه لتی', 'جوزی', 'گلاسه', 170, '60*90', 'شیت', 1300, 'ارتا', 1300, '1405/02/02', null, null, 1300, 'received', 'سلفون مات');
    insertWh.run('cardboard', '1405/01/31', '10755', '8662', 'آ.نورانی', 'استند حباب ساز', 'جوزی', 'پشت طوسی راشا', 180, '70*100', 'شیت', 2200, 'اندیشه', 2200, '1405/02/02', null, null, 2200, 'received', '۵۵۰۰ خرید ۲۲۰۰ ارسال به چاپخانه');
    insertWh.run('cardboard', '1405/02/02', '10756', '8685', 'اکسیرآفرین', 'بروشور 3 و 5 میلی گرم', 'جوزی', 'تحریر', 80, '60*90', 'شیت', 3200, 'اندیشه', 3200, '1405/02/02', null, null, 3200, 'received', 'دارویی');
    insertWh.run('cardboard', '1405/02/02', '10757', '8686', 'اکسیرآفرین', 'بروشور ملاتونین 10 میلی گرم', 'جوزی', 'تحریر', 80, '60*90', 'شیت', 3200, 'اندیشه', 3200, '1405/02/02', null, null, 3200, 'received', 'دارویی');
    insertWh.run('cardboard', '1405/02/02', '10759', '8752', 'خودکار', 'زیره دسر سوهان', 'جوزی', 'ایندربرد', 270, '80*100', 'شیت', 5100, 'صیادی', 5100, '1405/02/06', null, null, 5100, 'received', 'روکش بهداشتی');
    insertWh.run('cardboard', '1405/02/02', '10758', '8753', 'خودکار', 'رویه دسر سوهان', 'جوزی', 'ایندربرد', 270, '80*100', 'شیت', 2600, 'صیادی', 2600, '1405/02/06', null, null, 2600, 'received', 'طلاکوب');
    insertWh.run('cardboard', '1405/02/04', '10760', '8769', 'بنار', 'برشور 5025', 'جوزی', 'گلاسه', 115, '70*100', 'شیت', 5000, 'اندیشه', 5000, '1405/02/06', null, null, 5000, 'received', 'تکمیل');
    insertWh.run('cardboard', '1405/02/07', '10771', '8814', 'فکراوران', 'جعبه مونوپولی کیفی', 'جوزی', 'پشت طوسی راشا', 180, '60*90', 'شیت', 3500, 'اندیشه', 5500, '1405/02/12', null, null, 5500, 'received', '۵۵۰۰ برگ خریداری شده ۳۵۰۰ برگ ارسال به چاپخانه');
    insertWh.run('cardboard', '1405/02/07', '10779', '8830', 'هنر پلاستیک', 'جعبه بوگاتی ویزن TT93005', 'جوزی', 'پشت طوسی راشا', 180, '70*100', 'شیت', 3700, 'اندیشه', 3700, '1405/02/12', null, null, 3700, 'received', 'دایکات لترپرس');
    insertWh.run('cardboard', '1405/02/12', '10785', '8876', 'یوسفی', 'لیبل امبولانس', 'جوزی', 'لیبل', 80, '50*70', 'شیت', 2250, 'اسکویی', 2550, '1405/02/16', null, null, 2550, 'received', 'نیم‌تیغ دیجیتال');
    insertWh.run('cardboard', '1405/02/14', '10791', '8966', 'ممقانی', 'جعبه پودر فیکس گابرینی', 'جوزی', 'ایندربرد', 300, '60*89', 'شیت', 2300, 'صیادی', 2300, '1405/02/19', null, null, 2300, 'received', '۲۵۹۹ خرید شده ۲۳۰۰ چاپخانه');
    insertWh.run('cardboard', '1405/02/22', '10806', '9140', 'راماسیم', 'کارتن قرقره K200', 'یزدی', 'پشت طوسی', 180, '65*90', 'شیت', 22000, 'اندیشه', 22000, '1405/02/26', null, null, 22000, 'received', 'مقوا برگشت داده شد');
    insertWh.run('cardboard', '1405/02/22', '10807', '9101', 'راماسیم', 'لفاف قرقره K200', 'یزدی/امیران', 'ایندربرد', 270, '70*100', 'شیت', 6700, 'ارتا', 6000, '1405/02/23', null, null, 6000, 'partial', '۶۰۰۰ برگ یزدی / ۷۰۰ برگ امیران');

    // 2. ورق کارتن (Sheet Carton)
    insertWh.run('sheet_carton', '1405/02/01', '10810', '9210', 'صنایع الکتروژن', 'ورق ۳ لایه کارتن موتور کولر', 'کارتن میهن', 'ورق ۳ لایه E-Flute کرافت/کرافت', 320, '85*125', 'ورق', 5000, 'سوله لامینت شمس‌آباد', 5000, '1405/02/03', null, null, 5000, 'received', 'جهت لامینت پوستر چاپ‌شده');
    insertWh.run('sheet_carton', '1405/02/05', '10811', '9215', 'فکراوران', 'ورق ۳ لایه کارتن اسباب‌بازی', 'آران کارتن', 'ورق ۳ لایه B-Flute لاینر/تست', 350, '100*140', 'ورق', 3500, 'انبار چهاردانگه', 3500, '1405/02/07', null, null, 3500, 'received', 'فلوت مستحکم صادراتی');
    insertWh.run('sheet_carton', '1405/02/10', '10812', '9220', 'صنایع میهن یدک', 'ورق ۵ لایه قطعات خودرو', 'کاسپین کارتن', 'ورق ۵ لایه BC-Flute سنگین', 550, '110*160', 'ورق', 2000, 'سوله دایکات', 2000, '1405/02/12', null, null, 2000, 'received', 'مخصوص دایکات بوبست');

    // 3. سینگل فلوت (Single-Face)
    insertWh.run('single_face', '1405/02/02', '10820', '9230', 'راماسیم', 'رول سینگل E-Flute لفاف قرقره', 'سینگل البرز', 'رول سینگل E-Flute بهداشتی', 110, 'عرض 100 cm', 'طاقه', 3000, 'سوله لامینت', 3000, '1405/02/04', null, null, 3000, 'received', 'متراژ رول کامل');
    insertWh.run('single_face', '1405/02/08', '10821', '9235', 'خودکار', 'شیت سینگل فلوت زیره سوهان', 'سینگل تهران', 'شیت سینگل B-Flute سفید', 120, '70*100', 'شیت', 8000, 'انبار ملزومات', 8000, '1405/02/10', null, null, 8000, 'received', 'کاغذ فلوتینگ درجه یک');

    // 4. سلفون و روکش (Cellophane)
    insertWh.run('cellophane', '1405/02/03', '10830', '9240', 'ممقانی', 'سلفون حرارتی مات گابرینی', 'پرشین فیلم', 'سلفون حرارتی مات درجه یک (۲۲ میکرون)', 22, 'عرض 100 cm', 'طاقه / رول', 12, 'انبار ملزومات چاپ', 12, '1405/02/04', null, null, 12, 'received', 'هر رول ۳۰۰۰ متر');
    insertWh.run('cellophane', '1405/02/06', '10831', '9245', 'دل کوک', 'سلفون حرارتی براق کاتالوگ', 'پتروپلیمر', 'سلفون حرارتی براق ضدخش', 20, 'عرض 70 cm', 'طاقه / رول', 8, 'انبار ملزومات چاپ', 8, '1405/02/07', null, null, 8, 'received', 'بدون حباب و چروک');
    insertWh.run('cellophane', '1405/02/12', '10832', '9250', 'اکسیرآفرین', 'سلفون مخملی سافت‌تاچ دارویی', 'نوین پلیمر', 'سلفون مخملی Soft Touch مات', 28, 'عرض 70 cm', 'طاقه / رول', 4, 'انبار ملزومات لوکس', 4, '1405/02/13', null, null, 4, 'received', 'برای جعبه‌های صادراتی');

    // 5. طلق و پنجره جعبه (PVC / PET Rigid Film)
    insertWh.run('pvc_film', '1405/02/04', '10840', '9260', 'هنر پلاستیک', 'طلق شفاف پنجره جعبه بوگاتی', 'طلق پلاستیک خاور', 'طلق PVC شفاف آنتی‌استاتیک', 200, '70*100', 'شیت', 4000, 'سوله جعبه‌چسبانی', 4000, '1405/02/06', null, null, 4000, 'received', 'بدون خط و خش و کدرشدگی');
    insertWh.run('pvc_film', '1405/02/09', '10841', '9265', 'علوم خلاق', 'طلق سخت وکیوم تخم دایناسور', 'رویال پلاست', 'شیت سخت PET شفاف وکیوم', 350, '60*90', 'شیت', 1500, 'انبار وکیوم و فرمینگ', 1500, '1405/02/11', null, null, 1500, 'received', 'ضخامت ۳۵۰ میکرون');

    // 6. مرکب و رنگ چاپ (Printing Inks)
    insertWh.run('ink', '1405/02/05', '10850', '9270', 'انبار چاپخانه', 'مرکب افست ۴ رنگ CMYK', 'مرکب پارس', 'مرکب افست سری هوبر آلمان', 0, 'قوطی ۱ کیلوگرم', 'قوطی', 40, 'انبار مواد شیمیایی و رنگ', 40, '1405/02/06', null, null, 40, 'received', 'شامل ۱۰ کیلو Cyan، ۱۰ Magenta، ۱۰ Yellow، ۱۰ Black');
    insertWh.run('ink', '1405/02/11', '10851', '9275', 'خودکار', 'مرکب طلایی ریچ گلد پنتون', 'تویو اینک', 'مرکب طلایی متالیک Rich Gold 871', 0, 'قوطی ۱.۵ کیلو', 'قوطی', 6, 'انبار رنگ و لیتوگرافی', 6, '1405/02/12', null, null, 6, 'received', 'پوشش‌دهی درخشان');
    insertWh.run('ink', '1405/02/15', '10852', '9280', 'صحت', 'ورنی افست براق محافظ', 'هیوندای اینک', 'ورنی روغنی Overprint Varnish', 0, 'حلب ۵ کیلوگرم', 'حلب', 4, 'سالن چاپخانه', 4, '1405/02/16', null, null, 4, 'received', 'مقاوم در برابر سایش');
  }

  // Ensure all 6 warehouse categories are seeded
  const insertWhItem = db.prepare(`
    INSERT INTO warehouse_receipts (
      warehouse_category, registration_date, order_code, archive_code, customer_name, order_name,
      supplier, material, grammage, size, unit, required_qty, unloading_location,
      received_qty_1, received_date_1, received_qty_2, received_date_2, total_received, status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const categoriesToSeed = [
    { cat: 'sheet_carton', records: [
      ['sheet_carton', '1405/02/01', '10810', '9210', 'صنایع الکتروژن', 'ورق ۳ لایه کارتن موتور کولر', 'کارتن میهن', 'ورق ۳ لایه E-Flute کرافت/کرافت', 320, '85*125', 'ورق', 5000, 'سوله لامینت شمس‌آباد', 5000, '1405/02/03', null, null, 5000, 'received', 'جهت لامینت پوستر چاپ‌شده'],
      ['sheet_carton', '1405/02/05', '10811', '9215', 'فکراوران', 'ورق ۳ لایه کارتن اسباب‌بازی', 'آران کارتن', 'ورق ۳ لایه B-Flute لاینر/تست', 350, '100*140', 'ورق', 3500, 'انبار چهاردانگه', 3500, '1405/02/07', null, null, 3500, 'received', 'فلوت مستحکم صادراتی'],
      ['sheet_carton', '1405/02/10', '10812', '9220', 'صنایع میهن یدک', 'ورق ۵ لایه قطعات خودرو', 'کاسپین کارتن', 'ورق ۵ لایه BC-Flute سنگین', 550, '110*160', 'ورق', 2000, 'سوله دایکات', 2000, '1405/02/12', null, null, 2000, 'received', 'مخصوص دایکات بوبست']
    ]},
    { cat: 'single_face', records: [
      ['single_face', '1405/02/02', '10820', '9230', 'راماسیم', 'رول سینگل E-Flute لفاف قرقره', 'سینگل البرز', 'رول سینگل E-Flute بهداشتی', 110, 'عرض 100 cm', 'طاقه', 3000, 'سوله لامینت', 3000, '1405/02/04', null, null, 3000, 'received', 'متراژ رول کامل'],
      ['single_face', '1405/02/08', '10821', '9235', 'خودکار', 'شیت سینگل فلوت زیره سوهان', 'سینگل تهران', 'شیت سینگل B-Flute سفید', 120, '70*100', 'شیت', 8000, 'انبار ملزومات', 8000, '1405/02/10', null, null, 8000, 'received', 'کاغذ فلوتینگ درجه یک']
    ]},
    { cat: 'cellophane', records: [
      ['cellophane', '1405/02/03', '10830', '9240', 'ممقانی', 'سلفون حرارتی مات گابرینی', 'پرشین فیلم', 'سلفون حرارتی مات درجه یک (۲۲ میکرون)', 22, 'عرض 100 cm', 'طاقه / رول', 12, 'انبار ملزومات چاپ', 12, '1405/02/04', null, null, 12, 'received', 'هر رول ۳۰۰۰ متر'],
      ['cellophane', '1405/02/06', '10831', '9245', 'دل کوک', 'سلفون حرارتی براق کاتالوگ', 'پتروپلیمر', 'سلفون حرارتی براق ضدخش', 20, 'عرض 70 cm', 'طاقه / رول', 8, 'انبار ملزومات چاپ', 8, '1405/02/07', null, null, 8, 'received', 'بدون حباب و چروک'],
      ['cellophane', '1405/02/12', '10832', '9250', 'اکسیرآفرین', 'سلفون مخملی سافت‌تاچ دارویی', 'نوین پلیمر', 'سلفون مخملی Soft Touch مات', 28, 'عرض 70 cm', 'طاقه / رول', 4, 'انبار ملزومات لوکس', 4, '1405/02/13', null, null, 4, 'received', 'برای جعبه‌های صادراتی']
    ]},
    { cat: 'pvc_film', records: [
      ['pvc_film', '1405/02/04', '10840', '9260', 'هنر پلاستیک', 'طلق شفاف پنجره جعبه بوگاتی', 'طلق پلاستیک خاور', 'طلق PVC شفاف آنتی‌استاتیک', 200, '70*100', 'شیت', 4000, 'سوله جعبه‌چسبانی', 4000, '1405/02/06', null, null, 4000, 'received', 'بدون خط و خش و کدرشدگی'],
      ['pvc_film', '1405/02/09', '10841', '9265', 'علوم خلاق', 'طلق سخت وکیوم تخم دایناسور', 'رویال پلاست', 'شیت سخت PET شفاف وکیوم', 350, '60*90', 'شیت', 1500, 'انبار وکیوم و فرمینگ', 1500, '1405/02/11', null, null, 1500, 'received', 'ضخامت ۳۵۰ میکرون']
    ]},
    { cat: 'ink', records: [
      ['ink', '1405/02/05', '10850', '9270', 'انبار چاپخانه', 'مرکب افست ۴ رنگ CMYK', 'مرکب پارس', 'مرکب افست سری هوبر آلمان', 0, 'قوطی ۱ کیلوگرم', 'قوطی', 40, 'انبار مواد شیمیایی و رنگ', 40, '1405/02/06', null, null, 40, 'received', 'شامل ۱۰ کیلو Cyan، ۱۰ Magenta، ۱۰ Yellow، ۱۰ Black'],
      ['ink', '1405/02/11', '10851', '9275', 'خودکار', 'مرکب طلایی ریچ گلد پنتون', 'تویو اینک', 'مرکب طلایی متالیک Rich Gold 871', 0, 'قوطی ۱.۵ کیلو', 'قوطی', 6, 'انبار رنگ و لیتوگرافی', 6, '1405/02/12', null, null, 6, 'received', 'پوشش‌دهی درخشان'],
      ['ink', '1405/02/15', '10852', '9280', 'صحت', 'ورنی افست براق محافظ', 'هیوندای اینک', 'ورنی روغنی Overprint Varnish', 0, 'حلب ۵ کیلوگرم', 'حلب', 4, 'سالن چاپخانه', 4, '1405/02/16', null, null, 4, 'received', 'مقاوم در برابر سایش']
    ]}
  ];

  categoriesToSeed.forEach(({ cat, records }) => {
    const checkCat = db.prepare("SELECT COUNT(*) as count FROM warehouse_receipts WHERE warehouse_category = ?").get(cat);
    if (!checkCat || checkCat.count === 0) {
      records.forEach((rec) => insertWhItem.run(...rec));
    }
  });

  // Seed default production orders with 3-color statuses (White, Yellow, Green)
  const checkProd = db.prepare('SELECT COUNT(*) as count FROM production_orders').get();
  if (checkProd.count === 0) {
    const insertPo = db.prepare(`
      INSERT INTO production_orders (
        order_code, archive_code, customer_name, customer_phone, product_title, order_category,
        quantity, box_type, material, grammage, sheet_size, sheet_count, zinc_count,
        coating_type, diecut_type, gluing_type, status_color, financial_status,
        financial_notes, total_price, paid_amount, delivery_deadline, assigned_machine, production_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // ⚪ سفید (در صف تولید)
    insertPo.run('10745', '8609', 'الکتروژن', '09121111111', 'جعبه 90001061 BLDC', 'offset', 40300, 'جعبه قفل زیرین', 'پشت طوسی راشا', 180, '50*90', 20150, 4, 'ورنی براق', 'دایکات بوبست اتوماتیک', 'لب‌چسب ۵ نقطه', 'white', 'پیش‌پرداخت ۵۰٪ دریافت شد', 'چک صیادی ثبت گردید', 145000000, 72500000, '1405/03/10', 'هایدلبرگ ۴ ورقی CD102', 'کنترل دقیق خط تیغ روی شماره فنی');
    insertPo.run('10759', '8752', 'خودکار', '09122222222', 'زیره و رویه دسر سوهان', 'offset', 7700, 'هاردباکس دو تکه', 'ایندربرد بهداشتی', 270, '80*100', 3850, 4, 'سلفون مات + طلاکوب', 'لترپرس هایدلبرگ', 'چسب گرم جعبه‌سازی', 'white', 'بیعانه واریز شد', 'تأییدیه امور مالی ثبت است', 58000000, 30000000, '1405/03/05', 'ماشین طلاکوب و لترپرس', 'طلاکوب طلای براق ۲۴ عیار');
    insertPo.run('10791', '8966', 'ممقانی', '09123333333', 'جعبه پودر فیکس گابرینی', 'offset', 2300, 'جعبه دارویی دو طرف درب', 'ایندربرد بهداشتی', 300, '60*89', 1150, 4, 'سلفون مات + یووی موضعی', 'دایکات فکی', 'جعبه‌چسبانی اتوماتیک', 'white', 'پیش‌پرداخت واریز شد', 'تأییدیه مالی دارد', 24500000, 15000000, '1405/03/08', 'دستگاه یووی سیلندری و فکی', 'یووی موضعی روی لوگو گابرینی');
    insertPo.run('10771', '8814', 'فکراوران', '09124444444', 'جعبه مونوپولی کیفی', 'offset', 3500, 'کارتن کیبوردی پستی', 'پشت طوسی راشا + E-Flute', 180, '60*90', 3500, 4, 'سلفون براق', 'دایکات روتاری', 'دستی دسته‌دار', 'white', 'نقدی پرداخت شد', 'تسویه پیش‌پرداخت', 48000000, 48000000, '1405/03/12', 'خط لامینت اتومات و دایکات', 'نصب دسته پلاستیکی');

    // 🟡 زرد (پرونده در دست مالی)
    insertPo.run('10760', '8769', 'بنار', '09125555555', 'برشورهای تخصصی دارویی 5025 و 7070', 'offset', 10600, 'بروشور آکاردئونی', 'گلاسه ۱۱۵ گرم', 115, '70*100', 5300, 4, 'بدون سلفون', 'برش پلار', 'تاکن ۶ لت دارویی', 'yellow', 'در انتظار وصول چک', 'چک صیادی هنوز تایید سیستمی نشده', 38000000, 0, '1405/03/15', 'چاپخانه اندیشه', 'تا زمان تایید مالی کار متوقف بماند');
    insertPo.run('10779', '8830', 'هنر پلاستیک', '09126666666', 'استند و جعبه بوگاتی TT93005', 'offset', 3700, 'استند پیشخوان پرفراژدار', 'پشت طوسی راشا', 180, '70*100', 3700, 4, 'سلفون مات', 'لترپرس پرفراژدار', 'لب‌چسب دستی', 'yellow', 'کسری پیش‌پرداخت', 'مشتری قول واریز تا فردا داده است', 32000000, 10000000, '1405/03/18', 'سالن دایکات', 'به محض اعلام مالی چاپ شروع شود');
    insertPo.run('10785', '8876', 'یوسفی', '09127777777', 'مجموعه لیبل‌های آمبولانس و اتوبوس', 'digital', 7350, 'لیبل رولی دوربری', 'پشت‌چسب‌دار براق', 80, '50*70', 2450, 0, 'سلفون براق', 'نیم‌تیغ دیجیتال', 'برش رول', 'yellow', 'در انتظار پیش‌پرداخت', 'فاکتور صادر شده ولی پرداخت نشده', 18500000, 0, '1405/03/20', 'پلاتر و کاتر پلاتر دیجیتال', 'تحویل فوری به محض واریز');

    // 🟢 سبز (تکمیل شده و بایگانی)
    insertPo.run('10747', '8541', 'میهن یدک', '09128888888', 'جعبه برق هشت بوبین هرمزی کد 120', 'offset', 2600, 'جعبه دارویی دو طرف درب', 'پشت طوسی راشا', 180, '70*100', 1300, 4, 'سلفون براق', 'لترپرس', 'لب‌چسب اتومات', 'green', 'تسویه کامل', 'فاکتور تسویه و وجه واریز شد', 22000000, 22000000, '1405/02/15', 'تولید تکمیل شد', 'تحویل انبار مرکزی میهن یدک گردید');
    insertPo.run('10750', '8640', 'آ.اردلان', '09129999999', 'زیروکیوم پژو 405', 'offset', 10200, 'جعبه قطعات خودرو', 'پشت طوسی راشا', 180, '55*83', 5100, 4, 'ورنی', 'دایکات بوبست', 'چسب ۲ نقطه', 'green', 'تسویه کامل', 'رسید تحویل امضا شد', 68000000, 68000000, '1405/02/18', 'تولید تکمیل شد', 'کنترل کیفیت ۱۰۰٪ انجام شد');
    insertPo.run('10753', '8626', 'صحت', '09120000000', 'سربرگ و پاکت‌های آزمایشگاه', 'offset', 500, 'سربرگ و ست اداری', 'تحریر ۸۰ گرم کتان', 80, '60*90', 250, 4, 'ساده', 'برش دوربری', 'سرچسب دستی', 'green', 'تسویه کامل', 'واریز نقدی', 8500000, 8500000, '1405/02/20', 'تولید تکمیل شد', 'تحویل مدیریت آزمایشگاه صحت');
  }

  // Seed default digital orders
  const checkDigital = db.prepare('SELECT COUNT(*) as count FROM digital_orders').get();
  if (checkDigital.count === 0) {
    const insertDig = db.prepare(`
      INSERT INTO digital_orders (
        order_code, customer_name, customer_phone, title, machine_type,
        paper_type, grammage, dimensions, quantity, print_side, lamination,
        finishing, status_color, unit_price, total_price, paid_amount, delivery_deadline, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertDig.run('DIG-101', 'دکتر بهرامی (کلینیک رستا)', '09121112233', 'کارت ویزیت لوکس پی‌وی‌سی + کاتالوگ مطب', 'کونیکا مینولتا C6085', 'گلاسه ۳۰۰ گرم + PVC', 300, 'A3+ (32x48cm)', 500, 'دورو ۴ رنگ', 'سلفون مات حرارتی', 'برش دوربری + خط‌تا', 'white', 18000, 9000000, 5000000, '1405/03/02', 'تحویل فوری ۲۴ ساعته');
    insertDig.run('DIG-102', 'کافه رستوران نارنج', '09123334455', 'منوی رستورانی فنر دوبل با جلد سخت', 'زیراکس ورسانت 180', 'گلاسه ۲۵۰ گرم لمینتی', 250, 'A4', 80, 'دورو ۴ رنگ', 'سلفون مات ضدخش', 'فنر دوبل فلزی + جلد سخت', 'yellow', 65000, 5200000, 0, '1405/03/04', 'در انتظار تایید فایل نهایی و واریز');
    insertDig.run('DIG-103', 'شرکت مهندسی پویا', '09125556677', 'استند رول‌آپ نمایشگاهی و پاپ‌آپ', 'پلاتر اکوسالونت رولند', 'سولیت و بنر ۱۳ انس کره‌ای', 400, 'عرض ۸۵ در ارتفاع ۲۰۰ سانت', 4, 'یکرو ۴ رنگ', 'بدون روکش', 'نصب روی پایه استند آلومینیومی', 'green', 1400000, 5600000, 5600000, '1405/02/28', 'تکمیل و تحویل غرفه نمایشگاه');
  }

  // Seed default toll services orders (کارهای خدماتی و اجرتی)
  const checkService = db.prepare('SELECT COUNT(*) as count FROM toll_service_orders').get();
  if (checkService.count === 0) {
    const insertSrv = db.prepare(`
      INSERT INTO toll_service_orders (
        order_code, customer_name, customer_phone, service_title, service_types,
        incoming_material_desc, incoming_sheet_count, incoming_receipt_number,
        die_status, setup_fee, rate_per_unit, total_amount, paid_amount,
        status_color, operator_name, completed_qty, delivered_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertSrv.run(
      'SRV-201', 'چاپخانه افق', '09127778899', 'اجرت دایکات فکی و سلفون مات جعبه فیلتر هوا',
      JSON.stringify(['دایکات فکی', 'سلفون حرارتی مات']),
      '۸۰۰۰ شیت مقوای چاپ‌شده پشت طوسی ابعاد ۶۰×۹۰ ارسالی مشتری', 8000, 'REC-9081',
      'قالب توسط مشتری ارسال شده است', 350000, 850, 7150000, 3500000,
      'white', 'استاد رحیمی', 0, '1405/03/06', 'دقت بالا در لبه‌های پوشال‌گیری'
    );
    insertSrv.run(
      'SRV-202', 'بسته‌بندی پارس گستر', '09129990011', 'خدمات طلاکوب حرارتی و یووی موضعی جعبه ادکلن',
      JSON.stringify(['طلاکوب حرارتی', 'یووی موضعی سیلندری']),
      '۳۵۰۰ شیت مقوای ایندربرد سلفون‌خورده ابعاد ۷۰×۱۰۰ ارسالی مشتری', 3500, 'REC-9082',
      'کلیشه طلاکوب ساخته شد', 450000, 1200, 4650000, 0,
      'yellow', 'مهندس طاهری', 0, '1405/03/08', 'در انتظار تسویه فاکتور خدمات'
    );
    insertSrv.run(
      'SRV-203', 'کارتن‌سازی البرز', '09121114455', 'اجرت لامینت اتوماتیک کارتن E-Flute و لب‌چسب',
      JSON.stringify(['لامینت اتوماتیک', 'جعبه‌چسبانی اتوماتیک']),
      '۱۲۰۰۰ شیت پوستر گلاسه + ورق سینگل فیس ارسالی مشتری', 12000, 'REC-9079',
      'قالب در کارخانه موجود است', 600000, 650, 8400000, 8400000,
      'green', 'استاد کاظمی', 12000, '1405/02/25', 'کار تحویل و فاکتور تسویه شد'
    );
  }

  // Seed default 11-stage workflow projects
  try {
    const checkProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get();
    if (checkProjects && checkProjects.count === 0) {
      const insertProj = db.prepare(`
        INSERT INTO projects (
          archive_code, order_code, title, customer_name, customer_phone,
          box_type, box_structure, quantity, current_stage, status, priority,
          has_cardboard, cardboard_type, cardboard_grammage, length_mm, width_mm, height_mm,
          has_print, print_type, print_colors_count, print_format, print_length, print_width, boxes_per_sheet,
          has_cellophane, cellophane_type, has_foil, foil_type, has_blade, blade_type, has_glue, glue_type,
          estimated_unit_price, estimated_total_price, cost_price, profit_margin, created_by, assigned_to
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?
        )
      `);

      // 1. Stage 5: Design stage (طراحی خط تیغ)
      insertProj.run(
        '8609', '10745', 'جعبه قطعات الکتروژن BLDC', 'الکتروژن', '09121111111',
        'جعبه مقوایی پشت طوسی صنعتی', 'درب دارویی ته قفلی (Lock-Bottom)', 40300, 5, 'in_progress', 'high',
        1, 'پشت طوسی راشا', 180, 120, 80, 200,
        1, 'افست ۴ رنگ CMYK', 4, 'ورقی', 700, 1000, 4,
        1, 'سلفون مات', 0, null, 1, 'دایکات بوبست', 1, 'لب‌چسب اتوماتیک',
        3600, 145080000, 2900, 24, 1, 6
      );

      // 2. Stage 7: Mockup Stage (ماکت‌سازی)
      insertProj.run(
        '8752', '10759', 'زیره و رویه دسر سوهان', 'صنایع غذایی خودکار', '09122222222',
        'جعبه مقوایی ایندربرد بهداشتی', 'جعبه تلسکوپی (درب و ته مجزا)', 7700, 7, 'in_progress', 'normal',
        1, 'ایندربرد', 270, 200, 150, 60,
        1, 'افست ۵ رنگ (CMYK + Gold)', 5, 'ورقی', 800, 1000, 2,
        1, 'سلفون مات', 1, 'طلاکوب طلایی براق', 1, 'لترپرس', 1, 'جعبه‌چسبانی دستی',
        7500, 57750000, 6100, 23, 1, 7
      );

      // 3. Stage 10: Floor Production (خط تولید)
      insertProj.run(
        '8966', '10791', 'جعبه پودر فیکس گابرینی', 'آرایشی بهداشتی ممقانی', '09123333333',
        'جعبه مقوایی ایندربرد بهداشتی', 'درب دارویی ساده (Tuck End)', 2300, 10, 'in_progress', 'high',
        1, 'ایندربرد بهداشتی', 300, 65, 65, 140,
        1, 'افست ۴ رنگ CMYK', 4, 'دوربرقی', 600, 890, 6,
        1, 'سلفون مات', 0, null, 1, 'دایکات فکی', 1, 'اتوماتیک',
        10650, 24495000, 8500, 25, 2, 9
      );

      // 4. Stage 1: Sales / Reception (ثبت سفارش)
      insertProj.run(
        '9140', '10806', 'کارتن قرقره K200', 'صنایع کابل راماسیم', '09124444444',
        'کارتن لمینتی E فلوت', 'کیبوردی قفل‌دار (Mail-Lock)', 22000, 1, 'in_progress', 'normal',
        1, 'پشت طوسی راشا + E فلوت', 180, 250, 200, 180,
        1, 'افست ۴ رنگ CMYK', 4, 'ورقی', 650, 900, 2,
        1, 'سلفون براق', 0, null, 1, 'دایکات روتاری', 1, 'اتوماتیک',
        12500, 275000000, 9800, 27, 2, null
      );
    }
  } catch (e) {
    console.error('Error seeding projects:', e);
  }

  // Seed default activity logs (نمونه گزارش لاگ‌های سیستم)
  try {
    const checkLogs = db.prepare('SELECT COUNT(*) as count FROM activity_logs').get();
    if (checkLogs && checkLogs.count === 0) {
      const insertLog = db.prepare(`
        INSERT INTO activity_logs (
          user_id, username, full_name, role,
          action, module, target_id, target_name,
          description, details_json, ip_address, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
      `);

      insertLog.run(1, 'ceo', 'مسعود شعبانی', 'ceo', 'login', 'auth', '1', 'مسعود شعبانی', 'ورود موفق مدیرعامل به سامانه اتوماسیون کارخانه', null, '192.168.1.10', '-3 hours');
      insertLog.run(3, 'marketer', 'رضا صادقی', 'marketer', 'create_lead', 'marketing', 'MKT-107', 'جعبه کرم مارال', 'ثبت استعلام بازاریابی جدید: جعبه کرم آبرسان کاسه‌ای مارال (تیراژ ۲۰,۰۰۰ عدد) همراه با فایل خط تیغ', '{"quantity":20000,"material":"ایندربرد ۳۰۰ گرم","box_dimensions":"80x80x70"}', '192.168.1.15', '-2 hours');
      insertLog.run(5, 'estimate', 'مهندس احمدی', 'estimation', 'estimate_lead', 'calculator', 'MKT-105', 'جعبه شوینده گلبرگ', 'برآورد و ثبت قیمت استعلام جعبه شوینده گلبرگ: فی واحد ۴,۳۵۰ تومان (مجموع ۱۰۸,۷۵۰,۰۰۰ تومان)', '{"unit_price":4350,"total_price":108750000,"cardboard_cost":2150,"print_cost":650}', '192.168.1.18', '-90 minutes');
      insertLog.run(6, 'designer', 'مهندس کاظمی', 'design', 'dieline_export', 'studio', 'DIE-204', 'جعبه دارویی اکسیر', 'طراحی پارامتریک و خروجی CorelDRAW EPS وکتور با خطوط Hairline برای دستگاه لیزر قالب', '{"box_type":"reverse_tuck","dimensions":"65x65x140"}', '192.168.1.20', '-60 minutes');
      insertLog.run(9, 'production', 'استاد رحیمی', 'production', 'status_color_change', 'production', '10759', 'زیره و رویه دسر سوهان', 'تغییر وضعیت دستور کار تولید به رنگ سفید (صف تولید سالن چاپ و دایکات)', '{"old_status":"yellow","new_status":"white"}', '192.168.1.25', '-45 minutes');
      insertLog.run(8, 'procurement', 'مهندس باقری', 'warehouse', 'warehouse_receipt', 'warehouse', 'REC-101', 'ایندربرد ۳۰۰ گرم چانگ‌هوآ', 'ثبت ورود پارت اول مقوای ایندربرد ۳۰۰ گرم سایز ۷۰×۱۰۰ به انبار مرکزی (۵,۰۰۰ شیت)', '{"supplier":"بازرگانی چانگ‌هوآ","sheet_count":5000,"location":"انبار سالن ۱"}', '192.168.1.22', '-20 minutes');
    }
  } catch (e) {
    console.error('Error seeding activity logs:', e);
  }

  // 1. Table for Form Options & Dynamic Specs Configurator (مدیریت داینامیک فیلدها و فرم‌های استعلام)
  try {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS form_options_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        config_key TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        items_json TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_by TEXT
      )
    `).run();

    const countOptions = db.prepare('SELECT COUNT(*) as count FROM form_options_config').get().count;
    if (countOptions === 0) {
      const insertOpt = db.prepare(`
        INSERT INTO form_options_config (config_key, category, title, items_json, updated_by)
        VALUES (?, ?, ?, ?, 'مدیر ارشد سیستم')
      `);

      const defaultOptionsList = [
        {
          key: 'cardboard_types',
          cat: 'cardboard',
          title: 'انواع مقوا',
          items: [
            'ایندربرد',
            'پشت طوسی (Duplex Board)',
            'کرافت (Kraft)',
            'گلاسه (Art Paper)',
            'فابریانو (Fabriano)',
            'مقوای بهداشتی (سفید / بهداشتی)',
            'مقوای متالایز نقره‌ای',
            'مقوای متالایز طلایی',
            'مقوای کرجی (مغزی هاردباکس)',
            'پشت کرم (FBB)',
            'سایلبورد (Solid Bleached Board)'
          ]
        },
        {
          key: 'grammages',
          cat: 'cardboard',
          title: 'گرماژهای استاندارد مقوا',
          items: [200, 230, 250, 280, 300, 320, 350, 400, 450, 500]
        },
        {
          key: 'print_types',
          cat: 'print',
          title: 'انواع روش چاپ',
          items: [
            'افست نرمال',
            'افست متالایز',
            'چاپ دیجیتال',
            'چاپ فلکسوگرافی',
            'سیلک اسکرین',
            'بدون چاپ'
          ]
        },
        {
          key: 'print_colors',
          cat: 'print',
          title: 'تعداد رنگ‌های چاپ',
          items: [
            '۱ رنگ تک‌رنگ',
            '۲ رنگ ترکیبی',
            '۳ رنگ',
            '۴ رنگ (CMYK استاندارد)',
            '۵ رنگ (CMYK + رنگ پنتون)',
            '۶ رنگ (CMYK + ۲ رنگ اختصاصی)'
          ]
        },
        {
          key: 'print_zinc_options',
          cat: 'print',
          title: 'وضعیت زینک چاپ',
          items: [
            'زینک جدید',
            'زینک موجود در بایگانی کارخانه',
            'زینک تحویلی توسط مشتری',
            'بدون زینک (پلیت آماده)'
          ]
        },
        {
          key: 'cellophane_types',
          cat: 'coating',
          title: 'انواع و زیرمجموعه سلفون',
          items: [
            'سلفون حرارتی مات',
            'سلفون حرارتی براق',
            'سلفون مخملی (Soft-Touch)',
            'سلفون متالایز نقره‌ای',
            'سلفون متالایز طلایی',
            'سلفون ضدخش (Anti-Scratch)',
            'سلفون طرح‌دار / هولوگرام',
            'سلفون واتربیس مات',
            'سلفون واتربیس براق'
          ]
        },
        {
          key: 'varnish_options',
          cat: 'coating',
          title: 'انواع و زیرمجموعه ورنی',
          items: [
            'ورنی مات افست',
            'ورنی براق افست',
            'ورنی پایه‌آب (واتربیس مات)',
            'ورنی پایه‌آب (واتربیس براق)',
            'ورنی ضدخش فرابنفش'
          ]
        },
        {
          key: 'lacquer_options',
          cat: 'coating',
          title: 'انواع و زیرمجموعه لاک',
          items: [
            'لاک براق حرارتی',
            'لاک مات',
            'لاک چاپ و محافظ',
            'لاک ضدخش'
          ]
        },
        {
          key: 'uv_cylinder_options',
          cat: 'coating',
          title: 'انواع و زیرمجموعه یو وی سیلندری',
          items: [
            'یو وی سیلندری براق',
            'یو وی سیلندری مات',
            'یو وی سیلندری شنی'
          ]
        },
        {
          key: 'uv_options',
          cat: 'special_effects',
          title: 'انواع یو وی موضعی و افکت‌های خاص',
          items: [
            'موضعی براق (Spot UV)',
            'موضعی شنی (Sand Texture UV)',
            'هیبرید (Drip-off / مات و براق)',
            'اکلیلی (Glitter UV)',
            'یووی برجسته سه‌بعدی (3D High-Build UV)',
            'یووی فلورسنت و شبرنگ'
          ]
        },
        {
          key: 'emboss_options',
          cat: 'special_effects',
          title: 'انواع برجسته‌کاری و کلیشه',
          items: [
            'برجسته (کلیشه جدید)',
            'برجسته (کلیشه موجود در آرشیو)',
            'فرورفته (Debossing)',
            'امباس طرح‌دار سرتاسری (Linen / Leather)',
            'برجسته کور (Blind Emboss)'
          ]
        },
        {
          key: 'window_thickness_options',
          cat: 'window_glue',
          title: 'ضخامت و نوع طلق پنجره جعبه',
          items: [
            '۱۵۰ میکرون (استاندارد جعبه دارویی و بهداشتی)',
            '۲۰۰ میکرون (مقاوم و ضخیم)',
            '۲۵۰ میکرون (سخت و ضدضربه)',
            '۳۰۰ میکرون (فوق ضخیم صنعتی)',
            'طلق PVC شفاف آنتی‌استاتیک',
            'طلق PET شفاف غذایی (Food Grade)'
          ]
        },
        {
          key: 'glue_options',
          cat: 'window_glue',
          title: 'انواع چسب و لب‌چسب',
          items: [
            'لب چسب خطی اتوماتیک',
            'چسب گرم (Hot-Melt)',
            'چسب سرد واتربیس (PVA)',
            'لمینتی (چسب سیلیکات / چسب نشاسته)',
            'چسب دوطرفه صنعتی',
            'چسب لاک‌باتم (۴ گوشه / ۶ گوشه)'
          ]
        },
        {
          key: 'foil_options',
          cat: 'special_effects',
          title: 'انواع فویل و طلاکوب',
          items: [
            'طلاکوب براق (Gold Foil)',
            'طلاکوب مات (Matte Gold)',
            'نقره‌کوب براق (Silver Foil)',
            'نقره‌کوب مات (Matte Silver)',
            'هفت‌رنگ / هولوگرام (Rainbow Hologram)',
            'مسی و رزگلد (Copper / Rose Gold)',
            'رنگی‌کوب (قرمز، آبی، سبز متالیک)',
            'فویل سرد (Cold Foil)'
          ]
        },
        {
          key: 'material_constructions',
          cat: 'material',
          title: 'ساختارهای لمینتی و کارتن',
          items: [
            'مقوای تک‌لا (بدون سینگل)',
            'لمینت روی سینگل E-Flute (ای فلوت)',
            'لمینت روی سینگل B-Flute (بی فلوت)',
            'کارتن ۳ لایه C-Flute (کارتن مادر)',
            'کارتن ۵ لایه BC-Flute (کارتن سنگین صادراتی)',
            'هاردباکس مغزی کرجی'
          ]
        }
      ];

      defaultOptionsList.forEach(opt => {
        insertOpt.run(opt.key, opt.cat, opt.title, JSON.stringify(opt.items));
      });
    }
  } catch (e) {
    console.error('Error creating form_options_config:', e);
  }

  // 2. Table for Scrolling Announcement Ticker (نوار رونده بالای پنل جهت اعلان پرسنل)
  try {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS system_announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        message TEXT NOT NULL,
        priority TEXT DEFAULT 'info',
        is_active INTEGER DEFAULT 1,
        speed INTEGER DEFAULT 35,
        created_by_id INTEGER,
        created_by_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    const countAnnouncements = db.prepare('SELECT COUNT(*) as count FROM system_announcements').get().count;
    if (countAnnouncements === 0) {
      db.prepare(`
        INSERT INTO system_announcements (title, message, priority, is_active, speed, created_by_id, created_by_name)
        VALUES (?, ?, ?, 1, 35, 1, 'مهندس مسعود شعبانی (مدیر ارشد)')
      `).run(
        'اطلاعیه مدیریت کارخانه',
        'همکاران گرامی؛ کلیه استعلام‌های بازاریابی ظرف حداکثر ۲ ساعت توسط واحد برآورد تعیین قیمت می‌شوند. رعایت کامل الزامات ایمنی و بهداشت در خطوط تولید الزامی است.',
        'info'
      );
    }
  } catch (e) {
    console.error('Error creating system_announcements:', e);
  }

  // 3. Table for Dynamic System Titles & Header Text Customization
  try {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS system_ui_titles (
        key TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        subtitle TEXT,
        description TEXT,
        default_title TEXT NOT NULL,
        default_subtitle TEXT,
        default_description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_by TEXT
      )
    `).run();

    const countTitles = db.prepare('SELECT COUNT(*) as count FROM system_ui_titles').get().count;
    if (countTitles === 0) {
      const insertTitle = db.prepare(`
        INSERT INTO system_ui_titles (key, category, title, subtitle, description, default_title, default_subtitle, default_description, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'مدیر ارشد سیستم')
      `);

      const defaultTitlesList = [
        {
          key: 'marketing_header',
          category: 'marketing',
          title: 'پروفایل و کارتابل پیگیری استعلامات بازاریاب',
          subtitle: 'سامانه رهگیری لحظه‌ای نتیجه استعلام‌ها، مشاهده قیمت‌های اعلام‌شده توسط واحد بازرگانی، ثبت لاگ تماس و پیگیری مشتری، و صدور پیش‌فاکتور رسمی.',
          description: 'عنوان اصلی و توضیحات بالای کارتابل بازاریاب'
        },
        {
          key: 'marketing_form',
          category: 'marketing',
          title: 'فرم ثبت استعلام صنعتی جدید',
          subtitle: 'ورود مشخصات فنی، متریال، ابعاد، چاپ، روکش، یووی، برجسته، طلق، چسب و تیراژ جعبه',
          description: 'عنوان و زیرعنوان فرم ثبت استعلام جدید'
        },
        {
          key: 'calculator_header',
          category: 'calculator',
          title: 'ماشین‌حساب هوشمند و صنعتی برآورد قیمت جعبه و کارتن',
          subtitle: 'محاسبه دقیق و خودکار هزینه‌های مقوا، چاپ، روکش، تیغ، قالب، لترپرس، لب‌چسب و مارژین سود خالص',
          description: 'عنوان و توضیحات صفحه ماشین‌حساب قیمت'
        },
        {
          key: 'dashboard_header',
          category: 'dashboard',
          title: 'داشبورد و آمار تحلیلی مانیتورینگ کارخانه',
          subtitle: 'پایش شاخص‌های کلیدی عملکرد (KPI)، میزان فروش ماهانه، سفارشات فعال و راندمان خطوط تولید',
          description: 'عنوان بالای صفحه داشبورد مدیریتی'
        },
        {
          key: 'workflow_header',
          category: 'workflow',
          title: 'گردش کار ۱۰ مرحله تولید صنعتی و کانبان خطوط',
          subtitle: 'جریان پیوسته و هوشمند سفارشات از استعلام تا تحویل نهایی با پایپ‌لاین گرافیکی و نودهای تعاملی',
          description: 'عنوان صفحه گردش کار و کانبان'
        },
        {
          key: 'production_header',
          category: 'production',
          title: 'کارتابل دستورات تولید و کارت‌های کارگاهی',
          subtitle: 'سیستم ۴ رنگی کنترل وضعیت، صدور کارت کار، برنامه چاپ افست، دیجیتال و خدمات تکمیلی',
          description: 'عنوان صفحه کارتابل تولید'
        },
        {
          key: 'warehouse_header',
          category: 'warehouse',
          title: 'سامانه هوشمند مدیریت انبارهای شش‌گانه متریال',
          subtitle: 'پایش لحظه‌ای موجودی و حواله‌های انبار مقوا، ورق کارتن، سینگل‌فلوت، سلفون، طلق PVC و مرکب چاپ',
          description: 'عنوان صفحه انبارهای متریال'
        },
        {
          key: 'studio_header',
          category: 'studio',
          title: 'استودیو طراحی امیران، گسترده دایکات و ماک‌آپ سه‌بعدی',
          subtitle: 'طراحی پارامتریک خط تیغ ۲۲ قالب استاندارد، چیدمان بهینه شیت و خروجی مستقیم CorelDRAW و Illustrator',
          description: 'عنوان استودیو طراحی و قالب‌سازی'
        },
        {
          key: 'ai_header',
          category: 'ai',
          title: 'دستیار هوشمند بسته‌بندی و پیش‌پرواز تولید',
          subtitle: 'استخراج هوشمند مشخصات استعلام با پردازش زبان طبیعی (NLP)، بهینه‌سازی شیت چاپی و عیب‌یابی فنی',
          description: 'عنوان دستیار هوش مصنوعی'
        },
        {
          key: 'hr_header',
          category: 'hr',
          title: 'ارزیابی عملکرد پرسنل و پرونده دیجیتال کارگزینی',
          subtitle: 'سیستم ۵ محوره ارزیابی ماهانه، مانیتورینگ تارگت‌های بازاریابی و پاداش بهره‌وری منابع انسانی',
          description: 'عنوان ماژول منابع انسانی HR'
        },
        {
          key: 'app_branding',
          category: 'branding',
          title: 'شرکت آرمان امیران',
          subtitle: 'اتوماسیون تولید (MIS)',
          description: 'برندینگ سربرگ و هدر اصلی سامانه'
        }
      ];

      defaultTitlesList.forEach(item => {
        insertTitle.run(item.key, item.category, item.title, item.subtitle, item.description, item.title, item.subtitle, item.description);
      });
    }
  } catch (e) {
    console.error('Error creating system_ui_titles:', e);
  }

  // 4. Table for System Features & Capabilities Config (کم و زیاد کردن و تغییر نام ماژول‌ها)
  try {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS system_features_config (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        badge TEXT,
        color TEXT,
        is_enabled INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        is_custom INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_by TEXT
      )
    `).run();

    const countFeatures = db.prepare('SELECT COUNT(*) as count FROM system_features_config').get().count;
    if (countFeatures === 0) {
      const insertFeat = db.prepare(`
        INSERT INTO system_features_config (id, category, name, title, description, icon, badge, color, is_enabled, sort_order, is_custom, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 0, 'مدیر ارشد سیستم')
      `);

      const defaultFeaturesList = [
        { id: 'feat_marketing', category: 'marketing', name: 'کارتابل استعلامات بازاریابی', title: 'ثبت، پیگیری و صدور پیش‌فاکتور استعلامات', description: 'مدیریت لیدها، تعیین مشخصات فنی متریال و پیگیری لحظه‌ای قیمت‌ها', icon: 'Users', badge: 'استعلام', color: 'emerald', sort: 1 },
        { id: 'feat_calculator', category: 'marketing', name: 'ماشین‌حساب برآورد قیمت', title: 'فرمولاسیون هوشمند بهای تمام‌شده', description: 'محاسبه هزینه‌های مقوا، چاپ، روکش، قالب و سود خالص', icon: 'Calculator', badge: 'مالی', color: 'teal', sort: 2 },
        { id: 'feat_production_orders', category: 'production', name: 'دستور تولید صنعتی (افست و دیجیتال)', title: 'کارت‌های کارگاهی و برنامه تولید', description: 'کنترل ۴ رنگی وضعیت چاپ، صدور حواله تولید و کارت فرآیند', icon: 'Layers', badge: '۳ رنگ', color: 'indigo', sort: 3 },
        { id: 'feat_warehouse', category: 'warehouse', name: 'انبارداری شش‌گانه متریال', title: 'مدیریت و کنترل موجودی انبارها', description: 'انبار مقوا، ورق کارتن، سینگل، سلفون، طلق PVC و مرکب چاپ', icon: 'PackageCheck', badge: '۶ بخش', color: 'amber', sort: 4 },
        { id: 'feat_workflow_kanban', category: 'workflow', name: 'گردش کار ۱۰ مرحله و کانبان', title: 'پایش و رهگیری خطوط تولید کارخانه', description: 'تابلوی تعاملی کانبان با ۱۰ مرحله استاندارد تولید جعبه و کارتن', icon: 'Kanban', badge: '۱۰ مرحله', color: 'purple', sort: 5 },
        { id: 'feat_n8n_pipeline', category: 'workflow', name: 'پایپ‌لاین تعاملی گرافیکی n8n', title: 'نمای شبکه نودها و اتصالات نوری', description: 'شبیه‌ساز بصری جریان سفارشات با کابل‌های نورانی و انیمیشن زنده', icon: 'Activity', badge: 'گرافیکی', color: 'violet', sort: 6 },
        { id: 'feat_dieline_studio', category: 'studio', name: 'استودیو طراحی ۲D و ۳D امیران', title: 'طراحی پارامتریک خط تیغ و ماک‌آپ ۳بعدی', description: '۲۲ قالب استاندارد، تاخوردگی ۳D، چیدمان شیت و خروجی CorelDRAW و AI', icon: 'Box', badge: '3D/CAD', color: 'amber', sort: 7 },
        { id: 'feat_ai_assistant', category: 'ai', name: 'دستیار هوش مصنوعی و بهینه‌ساز شیت', title: 'پردازش متن استعلام و چیدمان شیت چاپی', description: 'استخراج هوشمند متریال و ابعاد با NLP و حداقل‌سازی پرت مقوا', icon: 'Sparkles', badge: 'AI', color: 'fuchsia', sort: 8 },
        { id: 'feat_biometric', category: 'security', name: 'ورود بیومتریک و اثر انگشت', title: 'احراز هویت سریع با اثر انگشت و چهره', description: 'پشتیبانی از سنسورهای Touch ID، Windows Hello و اثر انگشت گوشی', icon: 'Fingerprint', badge: 'Touch ID', color: 'cyan', sort: 9 },
        { id: 'feat_bale_sms', category: 'notifications', name: 'اطلاع‌رسانی بله و پیامک مشتری', title: 'ارسال خودکار پیام به پرسنل و مشتریان', description: 'اتصال به روبات پیام‌رسان بله و سامانه پیامک ملی‌پیامک در ۳ گام کلیدی', icon: 'Bell', badge: 'پیام‌رسان', color: 'rose', sort: 10 },
        { id: 'feat_hr_evaluation', category: 'hr', name: 'ارزیابی عملکرد پرسنل و تارگت ماهانه', title: 'پرونده کارگزینی و شاخص‌های KPI', description: 'ارزیابی ۵ محوره ماهانه و تارگت‌های اختصاصی بازاریابان با لیدربرد', icon: 'Award', badge: 'HR', color: 'orange', sort: 11 },
        { id: 'feat_excel_migration', category: 'data', name: 'انتقال اطلاعات و ایمپورت اکسل', title: 'ورود سریع داده‌های اتوماسیون قدیمی', description: 'ایمپورت فایل‌های اکسل، CSV و پشتیبان‌های داده‌ای به پایگاه داده', icon: 'FileSpreadsheet', badge: 'اکسل', color: 'blue', sort: 12 },
        { id: 'feat_activity_logs', category: 'security', name: 'لاگ و ممیزی فعالیت کاربران', title: 'ردیابی و بایگانی کلیه اقدامات سیستم', description: 'ثبت زمان، آی‌پی، کاربر و جزییات تغییرات سفارشات و دسترسی‌ها', icon: 'ShieldAlert', badge: 'Admin', color: 'slate', sort: 13 }
      ];

      defaultFeaturesList.forEach(feat => {
        insertFeat.run(feat.id, feat.category, feat.name, feat.title, feat.description, feat.icon, feat.badge, feat.color, feat.sort);
      });
    }
  } catch (e) {
    console.error('Error creating system_features_config:', e);
  }
}

initDb();

module.exports = db;
