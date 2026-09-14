const db = require('./db');
const XLSX = require('xlsx');

function normalizeStr(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/[٠۰]/g, '0')
    .replace(/[١۱]/g, '1')
    .replace(/[٢۲]/g, '2')
    .replace(/[٣۳]/g, '3')
    .replace(/[٤۴]/g, '4')
    .replace(/[٥۵]/g, '5')
    .replace(/[٦۶]/g, '6')
    .replace(/[٧۷]/g, '7')
    .replace(/[٨۸]/g, '8')
    .replace(/[٩۹]/g, '9')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .trim();
}

function parseNum(val, defaultVal = 0) {
  if (val === null || val === undefined || val === '') return defaultVal;
  const cleaned = normalizeStr(val).replace(/,/g, '').replace(/[^\d.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? defaultVal : num;
}

function parseBool(val, defaultVal = 0) {
  if (val === null || val === undefined || val === '') return defaultVal;
  const str = normalizeStr(val).toLowerCase();
  if (['1', 'true', 'بله', 'دارد', 'yes', 'on'].includes(str)) return 1;
  if (['0', 'false', 'خیر', 'ندارد', 'no', 'off'].includes(str)) return 0;
  return defaultVal;
}

// Field mapping dictionary (Persian / English headers -> internal DB keys)
const CUSTOMER_FIELD_MAP = {
  'کد مشتری': 'customer_code',
  'کد': 'customer_code',
  'customer_code': 'customer_code',
  'code': 'customer_code',
  'نام شرکت': 'company_name',
  'شرکت': 'company_name',
  'نام مشتری': 'company_name',
  'مشتری': 'company_name',
  'company_name': 'company_name',
  'name': 'company_name',
  'نام رابط': 'contact_person',
  'مسئول': 'contact_person',
  'رابط': 'contact_person',
  'contact_person': 'contact_person',
  'تلفن': 'phone',
  'شماره تماس': 'phone',
  'موبایل': 'phone',
  'همراه': 'phone',
  'phone': 'phone',
  'mobile': 'phone',
  'ایمیل': 'email',
  'پست الکترونیک': 'email',
  'email': 'email',
  'آدرس': 'address',
  'نشانی': 'address',
  'address': 'address',
  'یادداشت': 'notes',
  'توضیحات': 'notes',
  'notes': 'notes'
};

const PROJECT_FIELD_MAP = {
  'کد آرشیو': 'archive_code',
  'کد استعلام': 'archive_code',
  'کد پیگیری': 'archive_code',
  'archive_code': 'archive_code',
  'کد سفارش': 'order_code',
  'کد سفارش گیرنده': 'order_code',
  'شماره سفارش': 'order_code',
  'order_code': 'order_code',
  'کد مشتری': 'customer_code',
  'customer_code': 'customer_code',
  'نام کار': 'title',
  'نام جعبه': 'title',
  'عنوان سفارش': 'title',
  'عنوان': 'title',
  'title': 'title',
  'job_name': 'title',
  'نام مشتری': 'customer_name',
  'مشتری': 'customer_name',
  'خریدار': 'customer_name',
  'customer_name': 'customer_name',
  'تلفن مشتری': 'customer_phone',
  'تلفن': 'customer_phone',
  'customer_phone': 'customer_phone',
  'نوع جعبه': 'box_type',
  'box_type': 'box_type',
  'ساختار جعبه': 'box_structure',
  'نوع درب': 'box_structure',
  'ساختار': 'box_structure',
  'box_structure': 'box_structure',
  'تیراژ': 'quantity',
  'تعداد': 'quantity',
  'quantity': 'quantity',
  'تاریخ سفارش': 'order_date',
  'order_date': 'order_date',
  'تاریخ فایل': 'file_date',
  'file_date': 'file_date',
  'چاپ اول': 'is_first_print',
  'is_first_print': 'is_first_print',
  'عکاسی': 'photography',
  'طراحی': 'photography',
  'photography': 'photography',

  // Cardboard
  'دارای مقوا': 'has_cardboard',
  'نوع مقوا': 'cardboard_type',
  'جنس مقوا': 'cardboard_type',
  'cardboard_type': 'cardboard_type',
  'طول مقوا': 'cardboard_length',
  'cardboard_length': 'cardboard_length',
  'عرض مقوا': 'cardboard_width',
  'cardboard_width': 'cardboard_width',
  'گرماژ': 'cardboard_grammage',
  'گرماژ مقوا': 'cardboard_grammage',
  'cardboard_grammage': 'cardboard_grammage',
  'قیمت مقوا': 'cardboard_unit_price',
  'فی مقوا': 'cardboard_unit_price',
  'cardboard_unit_price': 'cardboard_unit_price',

  // Print
  'دارای چاپ': 'has_print',
  'وضعیت زینک': 'zinc_status',
  'zinc_status': 'zinc_status',
  'رنگ پنتون': 'custom_color',
  'تعداد رنگ': 'print_colors_count',
  'رنگ چاپ': 'print_colors_count',
  'print_colors_count': 'print_colors_count',
  'نوع چاپ': 'print_type',
  'print_type': 'print_type',
  'ماشین چاپ': 'print_format',
  'فرمت چاپ': 'print_format',
  'print_format': 'print_format',
  'طول چاپ': 'print_length',
  'عرض چاپ': 'print_width',
  'باطله چاپ': 'print_waste',
  'درصد باطله': 'print_waste',
  'تعداد در شیت': 'boxes_per_sheet',
  'تعداد در فرم': 'boxes_per_sheet',
  'boxes_per_sheet': 'boxes_per_sheet',
  'شیت چاپ': 'print_sheets_count',
  'تعداد شیت': 'print_sheets_count',

  // Finishes
  'ورنی': 'has_varnish',
  'دارای ورنی': 'has_varnish',
  'سلفون': 'has_cellophane',
  'دارای سلفون': 'has_cellophane',
  'نوع سلفون': 'cellophane_type',
  'cellophane_type': 'cellophane_type',
  'یووی': 'has_uv',
  'UV': 'has_uv',
  'دارای یووی': 'has_uv',
  'نوع یووی': 'uv_type',
  'uv_type': 'uv_type',
  'وضعیت شابلون یووی': 'uv_shablon_status',
  'طلاکوب': 'has_foil',
  'فویل': 'has_foil',
  'نوع طلاکوب': 'foil_type',
  'طول طلاکوب': 'foil_length',
  'عرض طلاکوب': 'foil_width',
  'برجسته': 'has_emboss',
  'کلیشه برجسته': 'emboss_cliche_status',
  'نوع برجسته': 'emboss_type',
  'تیغ': 'has_blade',
  'قالب': 'has_blade',
  'نوع قالب': 'blade_type',
  'blade_type': 'blade_type',
  'وضعیت قالب': 'blade_status',
  'blade_status': 'blade_status',
  'پنجره طلق': 'has_window',
  'طلق': 'has_window',
  'طول طلق': 'window_length',
  'عرض طلق': 'window_width',
  'ضخامت طلق': 'window_thickness',
  'جعبه چسبانی': 'has_glue',
  'چسب': 'has_glue',
  'نوع چسب': 'glue_type',
  'glue_type': 'glue_type',
  'اجرت چسب': 'glue_price',
  'منگنه': 'has_staple',
  'تعداد منگنه': 'staple_count',
  'سینگل': 'has_sheet',
  'ورق': 'has_sheet',
  'نوع ورق': 'sheet_category',
  'sheet_category': 'sheet_category',
  'کرجی': 'has_karji',

  // Financial & General
  'توضیحات': 'general_notes',
  'ملاحظات': 'general_notes',
  'general_notes': 'general_notes',
  'قیمت واحد': 'estimated_unit_price',
  'فی واحد': 'estimated_unit_price',
  'estimated_unit_price': 'estimated_unit_price',
  'قیمت کل': 'estimated_total_price',
  'مبلغ کل': 'estimated_total_price',
  'estimated_total_price': 'estimated_total_price',
  'بهای تمام شده': 'cost_price',
  'cost_price': 'cost_price',
  'درصد سود': 'profit_margin',
  'profit_margin': 'profit_margin',
  'مرحله': 'current_stage',
  'current_stage': 'current_stage',
  'وضعیت': 'status',
  'status': 'status'
};

function mapRowKeys(row, mappingDict) {
  const mapped = {};
  for (const [key, val] of Object.entries(row)) {
    const cleanKey = normalizeStr(key);
    const targetKey = mappingDict[cleanKey] || mappingDict[key] || key;
    mapped[targetKey] = typeof val === 'string' ? normalizeStr(val) : val;
  }
  return mapped;
}

// Bulk Import Customers
function importCustomers(customersList, options = { overwrite: true }) {
  let inserted = 0;
  let updated = 0;
  let errors = [];

  const checkStmt = db.prepare('SELECT id FROM customers WHERE customer_code = ? OR company_name = ? LIMIT 1');
  const insertStmt = db.prepare(`
    INSERT INTO customers (customer_code, company_name, contact_person, phone, email, address, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const updateStmt = db.prepare(`
    UPDATE customers SET
      company_name = ?,
      contact_person = ?,
      phone = ?,
      email = ?,
      address = ?,
      notes = ?
    WHERE id = ?
  `);

  db.exec('BEGIN TRANSACTION');
  try {
    customersList.forEach((raw, idx) => {
      const item = mapRowKeys(raw, CUSTOMER_FIELD_MAP);
      const code = item.customer_code ? normalizeStr(item.customer_code) : `C-${Math.floor(1000 + Math.random() * 9000)}`;
      const company = item.company_name ? normalizeStr(item.company_name) : `مشتری نامشخص ${idx + 1}`;
      const contact = item.contact_person ? normalizeStr(item.contact_person) : '';
      const phone = item.phone ? normalizeStr(item.phone) : '';
      const email = item.email ? normalizeStr(item.email) : '';
      const address = item.address ? normalizeStr(item.address) : '';
      const notes = item.notes ? normalizeStr(item.notes) : '';

      const existing = checkStmt.get(code, company);
      if (existing) {
        if (options.overwrite) {
          updateStmt.run(company, contact, phone, email, address, notes, existing.id);
          updated++;
        }
      } else {
        insertStmt.run(code, company, contact, phone, email, address, notes);
        inserted++;
      }
    });
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  return { success: true, total: customersList.length, inserted, updated, errors };
}

// Bulk Import Projects / Orders
function importProjects(projectsList, options = { overwrite: true, userId: 1, userName: 'مدیریت', userRole: 'ceo' }) {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  const checkStmt = db.prepare('SELECT id FROM projects WHERE archive_code = ? LIMIT 1');
  const checkCustomer = db.prepare('SELECT id, company_name FROM customers WHERE customer_code = ? OR company_name = ? LIMIT 1');
  const insertCustomer = db.prepare('INSERT INTO customers (customer_code, company_name, contact_person, phone) VALUES (?, ?, ?, ?)');

  const insertStmt = db.prepare(`
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
      has_window, window_length, window_width, window_thickness,
      has_glue, glue_type, glue_price,
      has_staple, staple_count,
      has_sheet, sheet_category, sheet_length, sheet_width, sheet_price, sheet_type,
      has_karji, karji_length, karji_width, karji_thickness, karji_selection,
      design_file_status, general_notes,
      estimated_unit_price, estimated_total_price, cost_price, profit_margin,
      current_stage, status, created_by
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
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  const updateStmt = db.prepare(`
    UPDATE projects SET
      order_code = ?,
      customer_code = ?,
      title = ?,
      customer_name = ?,
      customer_phone = ?,
      box_type = ?,
      box_structure = ?,
      quantity = ?,
      order_date = ?,
      file_date = ?,
      is_first_print = ?,
      photography = ?,
      has_cardboard = ?,
      cardboard_type = ?,
      cardboard_length = ?,
      cardboard_width = ?,
      cardboard_grammage = ?,
      cardboard_unit_price = ?,
      has_print = ?,
      zinc_status = ?,
      custom_color = ?,
      print_colors_count = ?,
      print_type = ?,
      print_format = ?,
      print_length = ?,
      print_width = ?,
      print_waste = ?,
      boxes_per_sheet = ?,
      print_sheets_count = ?,
      has_varnish = ?,
      has_cellophane = ?,
      cellophane_type = ?,
      has_uv = ?,
      uv_shablon_status = ?,
      uv_type = ?,
      has_foil = ?,
      foil_type = ?,
      foil_length = ?,
      foil_width = ?,
      has_emboss = ?,
      emboss_cliche_status = ?,
      emboss_type = ?,
      has_blade = ?,
      blade_status = ?,
      blade_type = ?,
      has_window = ?,
      window_length = ?,
      window_width = ?,
      window_thickness = ?,
      has_glue = ?,
      glue_type = ?,
      glue_price = ?,
      has_staple = ?,
      staple_count = ?,
      has_sheet = ?,
      sheet_category = ?,
      sheet_length = ?,
      sheet_width = ?,
      sheet_price = ?,
      sheet_type = ?,
      has_karji = ?,
      karji_length = ?,
      karji_width = ?,
      karji_thickness = ?,
      karji_selection = ?,
      design_file_status = ?,
      general_notes = ?,
      estimated_unit_price = ?,
      estimated_total_price = ?,
      cost_price = ?,
      profit_margin = ?,
      current_stage = ?,
      status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  db.exec('BEGIN TRANSACTION');
  try {
    projectsList.forEach((raw, idx) => {
      const item = mapRowKeys(raw, PROJECT_FIELD_MAP);
      
      let archiveCode = item.archive_code ? normalizeStr(item.archive_code) : `MIG-${idx + 1001}`;
      let orderCode = item.order_code ? normalizeStr(item.order_code) : `ORD-${idx + 1001}`;
      let customerCode = item.customer_code ? normalizeStr(item.customer_code) : '';
      let customerName = item.customer_name ? normalizeStr(item.customer_name) : (item.company_name ? normalizeStr(item.company_name) : 'مشتری نامشخص');
      let customerPhone = item.customer_phone ? normalizeStr(item.customer_phone) : (item.phone ? normalizeStr(item.phone) : '');
      let title = item.title ? normalizeStr(item.title) : `سفارش انتقالی ${archiveCode}`;

      // Auto-create customer if not present
      if (customerName) {
        const cust = checkCustomer.get(customerCode, customerName);
        if (!cust && customerCode) {
          try {
            insertCustomer.run(customerCode, customerName, '', customerPhone);
          } catch (e) {
            // ignore duplicate customer
          }
        }
      }

      // Parse fields
      const boxType = item.box_type || 'مقوایی';
      const boxStructure = item.box_structure || 'ساده';
      const quantity = parseNum(item.quantity, 5000);
      const orderDate = item.order_date || '1405-01-01';
      const fileDate = item.file_date || orderDate;
      const isFirstPrint = parseBool(item.is_first_print, 1);
      const photography = item.photography || 'none';

      // Cardboard
      const hasCardboard = parseBool(item.has_cardboard, 1);
      const cardboardType = item.cardboard_type || 'طوسی';
      const cardboardLength = parseNum(item.cardboard_length, 1000);
      const cardboardWidth = parseNum(item.cardboard_width, 600);
      const cardboardGrammage = parseNum(item.cardboard_grammage, 350);
      const cardboardUnitPrice = parseNum(item.cardboard_unit_price, 0);

      // Print
      const hasPrint = parseBool(item.has_print, 1);
      const zincStatus = item.zinc_status || 'زینک جدید';
      const customColor = parseBool(item.custom_color, 0);
      const printColorsCount = parseNum(item.print_colors_count, 4);
      const printType = item.print_type || 'افست';
      const printFormat = item.print_format || 'دوربرقی';
      const printLength = parseNum(item.print_length, 500);
      const printWidth = parseNum(item.print_width, 600);
      const printWaste = parseNum(item.print_waste, 5);
      const boxesPerSheet = parseNum(item.boxes_per_sheet, 2);
      const printSheetsCount = parseNum(item.print_sheets_count, Math.ceil(quantity / (boxesPerSheet || 1)));

      // Varnish & Cellophane
      const hasVarnish = parseBool(item.has_varnish, 0);
      const hasCellophane = parseBool(item.has_cellophane, 0);
      const cellophaneType = item.cellophane_type || 'سلفون حرارتی مات';

      // UV
      const hasUv = parseBool(item.has_uv, 0);
      const uvShablonStatus = item.uv_shablon_status || 'شابلون موجود';
      const uvType = item.uv_type || 'موضعی';

      // Foil
      const hasFoil = parseBool(item.has_foil, 0);
      const foilType = item.foil_type || 'طلاکوب';
      const foilLength = parseNum(item.foil_length, 0);
      const foilWidth = parseNum(item.foil_width, 0);

      // Emboss
      const hasEmboss = parseBool(item.has_emboss, 0);
      const embossClicheStatus = item.emboss_cliche_status || 'کلیشه جدید';
      const embossType = item.emboss_type || 'مقوایی';

      // Blade
      const hasBlade = parseBool(item.has_blade, 1);
      const bladeStatus = item.blade_status || 'جدید';
      const bladeType = item.blade_type || 'لترپرس';

      // Window
      const hasWindow = parseBool(item.has_window, 0);
      const windowLength = parseNum(item.window_length, 0);
      const windowWidth = parseNum(item.window_width, 0);
      const windowThickness = parseNum(item.window_thickness, 0);

      // Glue
      const hasGlue = parseBool(item.has_glue, 1);
      const glueType = item.glue_type || 'لمینتی';
      const gluePrice = parseNum(item.glue_price, 110);

      // Staple
      const hasStaple = parseBool(item.has_staple, 0);
      const stapleCount = parseNum(item.staple_count, 0);

      // Sheet
      const hasSheet = parseBool(item.has_sheet, 0);
      const sheetCategory = item.sheet_category || 'سینگل';
      const sheetLength = parseNum(item.sheet_length, 0);
      const sheetWidth = parseNum(item.sheet_width, 0);
      const sheetPrice = parseNum(item.sheet_price, 0);
      const sheetType = item.sheet_type || '';

      // Karji
      const hasKarji = parseBool(item.has_karji, 0);
      const karjiLength = parseNum(item.karji_length, 0);
      const karjiWidth = parseNum(item.karji_width, 0);
      const karjiThickness = parseNum(item.karji_thickness, 0);
      const karjiSelection = item.karji_selection || '';

      // Notes & Financials
      const designFileStatus = item.design_file_status || '';
      const generalNotes = item.general_notes || '';
      const estimatedUnitPrice = parseNum(item.estimated_unit_price, 0);
      const estimatedTotalPrice = parseNum(item.estimated_total_price, estimatedUnitPrice * quantity);
      const costPrice = parseNum(item.cost_price, 0);
      const profitMargin = parseNum(item.profit_margin, 15);
      const currentStage = parseNum(item.current_stage, 10); // default to production stage 10 or 1
      const status = item.status || (currentStage >= 11 ? 'completed' : 'in_progress');

      const existing = checkStmt.get(archiveCode);
      if (existing) {
        if (options.overwrite) {
          updateStmt.run(
            orderCode, customerCode, title, customerName, customerPhone,
            boxType, boxStructure, quantity, orderDate, fileDate, isFirstPrint, photography,
            hasCardboard, cardboardType, cardboardLength, cardboardWidth, cardboardGrammage, cardboardUnitPrice,
            hasPrint, zincStatus, customColor, printColorsCount, printType, printFormat, printLength, printWidth, printWaste, boxesPerSheet, printSheetsCount,
            hasVarnish, hasCellophane, cellophaneType,
            hasUv, uvShablonStatus, uvType,
            hasFoil, foilType, foilLength, foilWidth,
            hasEmboss, embossClicheStatus, embossType,
            hasBlade, bladeStatus, bladeType,
            hasWindow, windowLength, windowWidth, windowThickness,
            hasGlue, glueType, gluePrice,
            hasStaple, stapleCount,
            hasSheet, sheetCategory, sheetLength, sheetWidth, sheetPrice, sheetType,
            hasKarji, karjiLength, karjiWidth, karjiThickness, karjiSelection,
            designFileStatus, generalNotes,
            estimatedUnitPrice, estimatedTotalPrice, costPrice, profitMargin,
            currentStage, status,
            existing.id
          );
          updated++;
        } else {
          skipped++;
        }
      } else {
        insertStmt.run(
          archiveCode, orderCode, customerCode, title, customerName, customerPhone,
          boxType, boxStructure, quantity, orderDate, fileDate, isFirstPrint, photography,
          hasCardboard, cardboardType, cardboardLength, cardboardWidth, cardboardGrammage, cardboardUnitPrice,
          hasPrint, zincStatus, customColor, printColorsCount, printType, printFormat, printLength, printWidth, printWaste, boxesPerSheet, printSheetsCount,
          hasVarnish, hasCellophane, cellophaneType,
          hasUv, uvShablonStatus, uvType,
          hasFoil, foilType, foilLength, foilWidth,
          hasEmboss, embossClicheStatus, embossType,
          hasBlade, bladeStatus, bladeType,
          hasWindow, windowLength, windowWidth, windowThickness,
          hasGlue, glueType, gluePrice,
          hasStaple, stapleCount,
          hasSheet, sheetCategory, sheetLength, sheetWidth, sheetPrice, sheetType,
          hasKarji, karjiLength, karjiWidth, karjiThickness, karjiSelection,
          designFileStatus, generalNotes,
          estimatedUnitPrice, estimatedTotalPrice, costPrice, profitMargin,
          currentStage, status, options.userId || 1
        );
        inserted++;
      }
    });
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  return { success: true, total: projectsList.length, inserted, updated, skipped };
}

// Bulk Import Raw Materials
function importMaterials(materialsList, options = { overwrite: true }) {
  let inserted = 0;
  let updated = 0;

  const checkStmt = db.prepare('SELECT id FROM material_prices WHERE name = ? LIMIT 1');
  const insertStmt = db.prepare('INSERT INTO material_prices (category, name, unit, price_per_unit, description) VALUES (?, ?, ?, ?, ?)');
  const updateStmt = db.prepare('UPDATE material_prices SET category = ?, unit = ?, price_per_unit = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');

  db.exec('BEGIN TRANSACTION');
  try {
    materialsList.forEach((raw) => {
      const category = raw['دسته‌بندی'] || raw['category'] || 'عمومی';
      const name = raw['نام کالا'] || raw['نام'] || raw['name'] || '';
      const unit = raw['واحد'] || raw['unit'] || 'عدد';
      const price = parseNum(raw['قیمت واحد'] || raw['قیمت'] || raw['price_per_unit'] || raw['price'], 0);
      const desc = raw['توضیحات'] || raw['description'] || '';

      if (!name) return;

      const existing = checkStmt.get(name);
      if (existing) {
        if (options.overwrite) {
          updateStmt.run(category, unit, price, desc, existing.id);
          updated++;
        }
      } else {
        insertStmt.run(category, name, unit, price, desc);
        inserted++;
      }
    });
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  return { success: true, total: materialsList.length, inserted, updated };
}

// Export Full Database
function exportFullDatabase() {
  const customers = db.prepare('SELECT * FROM customers').all();
  const projects = db.prepare('SELECT * FROM projects').all();
  const materials = db.prepare('SELECT * FROM material_prices').all();
  const users = db.prepare('SELECT id, username, full_name, role, department, phone, created_at FROM users').all();
  const logs = db.prepare('SELECT * FROM workflow_logs').all();

  return {
    appName: 'Arman Amiran Packaging MIS',
    version: '2.5',
    exportDate: new Date().toISOString(),
    stats: {
      customersCount: customers.length,
      projectsCount: projects.length,
      materialsCount: materials.length,
      usersCount: users.length
    },
    data: {
      customers,
      projects,
      materials,
      users,
      logs
    }
  };
}

// Restore Full Database
function restoreFullDatabase(backupPayload, options = { clearExisting: false }) {
  const { data } = backupPayload;
  if (!data) throw new Error('فرمت فایل پشتیبان نامعتبر است');

  let restoredProjects = 0;
  let restoredCustomers = 0;
  let restoredMaterials = 0;

  if (data.customers && Array.isArray(data.customers)) {
    const res = importCustomers(data.customers, { overwrite: true });
    restoredCustomers = res.inserted + res.updated;
  }

  if (data.projects && Array.isArray(data.projects)) {
    const res = importProjects(data.projects, { overwrite: true });
    restoredProjects = res.inserted + res.updated;
  }

  if (data.materials && Array.isArray(data.materials)) {
    const res = importMaterials(data.materials, { overwrite: true });
    restoredMaterials = res.inserted + res.updated;
  }

  return {
    success: true,
    restoredCustomers,
    restoredProjects,
    restoredMaterials
  };
}

// Parse uploaded Excel / CSV Buffer
function parseExcelBuffer(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const result = {};

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    result[sheetName] = jsonData;
  });

  return result;
}

module.exports = {
  importCustomers,
  importProjects,
  importMaterials,
  exportFullDatabase,
  restoreFullDatabase,
  parseExcelBuffer,
  CUSTOMER_FIELD_MAP,
  PROJECT_FIELD_MAP
};
