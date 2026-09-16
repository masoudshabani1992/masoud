const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'factory.db');
const db = new DatabaseSync(dbPath);

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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

      -- Staple
      has_staple INTEGER DEFAULT 0,
      staple_count INTEGER,

      -- Single / Corrugated Sheet
      has_sheet INTEGER DEFAULT 0,
      sheet_category TEXT,
      sheet_length REAL,
      sheet_width REAL,
      sheet_price REAL,
      sheet_type TEXT,

      -- Karji
      has_karji INTEGER DEFAULT 0,
      karji_length REAL,
      karji_width REAL,
      karji_thickness REAL,
      karji_selection TEXT,

      -- Design Files & Notes
      design_file_status TEXT,
      general_notes TEXT,

      -- Financials
      estimated_unit_price REAL DEFAULT 0,
      estimated_total_price REAL DEFAULT 0,
      cost_price REAL DEFAULT 0,
      profit_margin REAL DEFAULT 15,

      -- Detailed JSON Payloads for 9 workflow stages
      specs_data TEXT,
      estimation_data TEXT,
      ceo_approval_data TEXT,
      design_data TEXT,
      customer_design_data TEXT,
      mockup_data TEXT,
      customer_mockup_data TEXT,
      purchasing_data TEXT,
      production_data TEXT,

      created_by INTEGER,
      assigned_to INTEGER,
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
      user_name TEXT NOT NULL,
      user_role TEXT NOT NULL,
      comment TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS project_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      user_id INTEGER,
      user_name TEXT NOT NULL,
      user_role TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      material_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      supplier TEXT,
      status TEXT DEFAULT 'pending',
      invoice_number TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      role TEXT,
      project_id INTEGER,
      archive_code TEXT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      stage_number INTEGER,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS marketing_leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_code TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      cardboard_type TEXT NOT NULL,
      cardboard_grammage INTEGER,
      material_construction TEXT NOT NULL,
      cellophane_type TEXT,
      box_length REAL,
      box_width REAL,
      box_height REAL,
      notes TEXT,
      status TEXT DEFAULT 'pending_commercial',
      marketer_id INTEGER,
      marketer_name TEXT,
      commercial_reviewer_id INTEGER,
      commercial_reviewer_name TEXT,
      estimated_unit_price REAL,
      estimated_total_price REAL,
      commercial_notes TEXT,
      reviewed_at DATETIME,
      converted_project_id INTEGER,
      converted_archive_code TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Default Users
  const salt = bcrypt.genSaltSync(10);
  const hash = (p) => bcrypt.hashSync(p, salt);

  const checkUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (checkUsers.count === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (username, password_hash, full_name, role, department, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertUser.run('ceo', hash('123456'), 'مهندس مسعود شعبانی', 'ceo', 'مدیریت عامل', '09121111111');
    insertUser.run('designer', hash('123456'), 'واحد طراحی و آتلیه', 'design', 'طراحی', '09124444444');
    insertUser.run('sales', hash('123456'), 'واحد بازرگانی و فروش', 'sales', 'بازرگانی', '09122222222');
    insertUser.run('secretary', hash('123456'), 'مسئول دفتر و پذیرش', 'secretary', 'مسئول دفتر', '09123333333');
    insertUser.run('accounting', hash('123456'), 'واحد حسابداری و برآورد', 'accounting', 'حسابداری', '09125555555');
    insertUser.run('production', hash('123456'), 'سرپرست سالن چاپ و تولید', 'production', 'سالن تولید', '09127777777');
    insertUser.run('outsource', hash('123456'), 'واحد برونسپاری و ماکت', 'outsource', 'برونسپاری', '09126666666');
    insertUser.run('warehouse', hash('123456'), 'مسئول انبار و ورود مصرفی', 'warehouse', 'ورود انبار مصرفی', '09128888888');
    insertUser.run('marketer', hash('123456'), 'کارشناس بازاریابی و فروش میدانی', 'marketer', 'بازاریابی', '09129999999');
  } else {
    const checkMarketer = db.prepare('SELECT * FROM users WHERE role = ? OR username = ?').get('marketer', 'marketer');
    if (!checkMarketer) {
      db.prepare(`
        INSERT INTO users (username, password_hash, full_name, role, department, phone)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('marketer', hash('123456'), 'کارشناس بازاریابی و فروش میدانی', 'marketer', 'بازاریابی', '09129999999');
    }
  }

  // Seed sample projects matching the user's software
  const checkProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get();
  if (checkProjects.count === 0) {
    const insertProj = db.prepare(`
      INSERT INTO projects (
        archive_code, order_code, customer_code, title, customer_name, customer_phone,
        box_type, box_structure, quantity, order_date, file_date, is_first_print, photography,
        has_cardboard, cardboard_type, cardboard_length, cardboard_width, cardboard_grammage, cardboard_unit_price,
        has_print, zinc_status, custom_color, print_colors_count, print_type, print_format, print_length, print_width, print_waste, boxes_per_sheet, print_sheets_count,
        has_varnish, has_cellophane, cellophane_type,
        has_uv, uv_shablon_status, uv_type,
        has_foil, foil_type, foil_length, foil_width,
        has_emboss, emboss_cliche_status, emboss_type,
        has_blade, blade_status, blade_type,
        has_glue, glue_type, glue_price,
        has_staple, has_sheet, sheet_category,
        general_notes, estimated_unit_price, estimated_total_price, cost_price, profit_margin, current_stage, status
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
      )
    `);

    // Sample matching user's screen: جعبه ترموستات
    insertProj.run(
      '7542', '6320', '3463', 'جعبه ترموستات', 'صنایع خودروسازی پارت', '09123004050',
      'جعبه مقوایی پشت طوسی صنعتی', 'ته قفلی درب دارویی', 10000, '1405-6-7', '1405-6-7', 1, 'طراحی توسط امیران',
      1, 'طوسی', 1000, 600, 350, 2020000,
      1, 'زینک جدید', 0, 4, 'افست', 'دوربرقی', 500, 600, 5, 2, 300,
      1, 1, 'سلفون حرارتی مات',
      0, 'شابلون موجود', 'موضعی',
      1, 'طلاکوب', 200, 150,
      1, 'کلیشه جدید', 'مقوایی',
      1, 'جدید', 'لترپرس',
      1, 'لمینتی', 110,
      0, 1, 'سینگل',
      'کنترل کیفیت دقیق روی خط تا و تیغ بوبست، تست لبه چسب با چسب گرم', 4500, 45000000, 36000000, 20, 2, 'in_progress'
    );
  }

  // Seed default material prices
  const checkMaterials = db.prepare('SELECT COUNT(*) as count FROM material_prices').get();
  if (checkMaterials.count === 0) {
    const insertMat = db.prepare(`
      INSERT INTO material_prices (category, name, unit, price_per_unit, description)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertMat.run('مقوا', 'مقوای پشت طوسی ۳۵۰ گرم', 'بند / شیت', 2020000, 'شیت ۱۰۰×۶۰ و ۷۰×۱۰۰');
    insertMat.run('مقوا', 'مقوای ایندربرد ۳۰۰ گرم بهداشتی', 'بند / شیت', 2400000, 'شیت ۱۰۰×۷۰ فودگرید');
    insertMat.run('مقوا', 'مقوای کرافت ۳۰۰ گرم', 'کیلوگرم', 58000, 'کرافت روسی وارداتی');
    insertMat.run('ورق و کارتن', 'سینگل فلوت E', 'متر مربع', 14500, 'رول یا شیت سینگل فیس');
    insertMat.run('ورق و کارتن', 'ورق ۳ لایه کرافت B فلوت', 'متر مربع', 24000, 'ورق ۳ لایه جهت کارتن لمینتی');
    insertMat.run('ورق و کارتن', 'ورق ۵ لایه BC فلوت صادراتی', 'متر مربع', 42000, 'مخصوص کارتن‌های سنگین و صادراتی');
    insertMat.run('لیتوگرافی و زینک', 'زینک حرارتی سایز ۲ ورقی', 'ورق', 95000, 'زینک افست سایز ۵۰×۷۰');
    insertMat.run('لیتوگرافی و زینک', 'زینک حرارتی سایز ۴.۵ ورقی', 'ورق', 160000, 'زینک افست سایز ۷۰×۱۰۰');
    insertMat.run('سلفون و پوشش', 'سلفون حرارتی مات', 'متر مربع', 4200, 'عرض‌های مختلف');
    insertMat.run('سلفون و پوشش', 'سلفون حرارتی براق', 'متر مربع', 3800, 'شفاف و مقاوم');
    insertMat.run('سلفون و پوشش', 'سلفون مخملی (سافت تاچ)', 'متر مربع', 9500, 'روکش لوکس لمسی');
    insertMat.run('خدمات تکمیلی', 'یووی موضعی سیلندری', 'فرم / دور', 650000, 'UV براق موضعی');
    insertMat.run('خدمات تکمیلی', 'طلاکوب و نقره‌کوب حرارتی', 'فرم / دور', 750000, 'اجرت ضرب فویل');
    insertMat.run('قالب و تیغ', 'قالب لیزری لترپرس / بوبست', 'قالب', 1200000, 'ساخت تیغ و اسفنج‌گذاری دقیق');
    insertMat.run('جعبه چسبانی', 'جعبه چسبانی لاک باتم و ۵ نقطه', 'عدد جعبه', 190, 'خط اتوماتیک چسب گرم و سرد');
    insertMat.run('جعبه چسبانی', 'جعبه چسبانی ساده لب چسب', 'عدد جعبه', 110, 'خط اتوماتیک جعبه چسبانی');
  }
}

initDb();

module.exports = db;
