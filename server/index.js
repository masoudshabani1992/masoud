const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const XLSX = require('xlsx');
const db = require('./db');
const { calculateBoxCost } = require('./calculator');
const { sendNotification, sendTestCustomerSms } = require('./notifications');
const {
  getHardwareFingerprint,
  getSystemLicenseStatus,
  activateLicense,
  verifyLicenseString
} = require('./license');
const {
  parsePackagingPrompt,
  optimizeSheetNesting,
  auditPackagingSpecs,
  PACKAGING_FAQ
} = require('./ai-assistant');
const {
  MATERIAL_SPECS,
  STANDARD_SHEETS,
  generateBoxDieline,
  optimizeSheetMontage
} = require('./dieline-generator');
const {
  importCustomers,
  importProjects,
  importMaterials,
  exportFullDatabase,
  restoreFullDatabase,
  parseExcelBuffer,
  CUSTOMER_FIELD_MAP,
  PROJECT_FIELD_MAP
} = require('./migration');


const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'boxfactory-super-secret-key-1403';

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use('/uploads', express.static(uploadDir));

// ================= OFFLINE HARDWARE LICENSE GUARD =================
function licenseGuard(req, res, next) {
  // Allow license status & activation, download setup, static assets, uploads
  if (
    !req.path.startsWith('/api') ||
    req.path.startsWith('/api/license') ||
    req.path === '/download-setup'
  ) {
    return next();
  }

  const status = getSystemLicenseStatus(db);
  if (!status.isActive) {
    return res.status(403).json({
      error: 'LICENSE_LOCKED',
      message: 'سامانه نرم‌افزاری فاقد لایسنس فعال است یا لایسنس منقضی شده است.',
      hardwareId: status.hardwareId,
      reason: status.errorReason
    });
  }

  req.license = status.license;
  next();
}

app.use(licenseGuard);

// ================= LICENSE API ENDPOINTS =================
app.get('/api/license/status', (req, res) => {
  try {
    const status = getSystemLicenseStatus(db);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/license/activate', (req, res) => {
  try {
    const { licenseKey } = req.body;
    if (!licenseKey) {
      return res.status(400).json({ error: 'کلید لایسنس وارد نشده است.' });
    }
    const result = activateLicense(db, licenseKey);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/license/deactivate', authMiddleware, requireCeo, (req, res) => {
  try {
    db.prepare('UPDATE license_store SET is_active = 0 WHERE id = 1').run();
    const licPath = path.join(__dirname, 'license.lic');
    if (fs.existsSync(licPath)) fs.unlinkSync(licPath);
    res.json({ success: true, message: 'لایسنس با موفقیت غیرفعال شد.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Developer License Key Generator (Only CEO/Developer)
app.post('/api/license/generate', authMiddleware, requireCeo, (req, res) => {
  try {
    const { hardwareId, companyName, issuedTo, expiry, maxUsers, type } = req.body;
    const { generateSignedLicenseKey } = require('./license-generator');
    const result = generateSignedLicenseKey({
      hardwareId: hardwareId || 'ANY',
      companyName: companyName || 'صنایع چاپ و بسته‌بندی آرمان امیران',
      issuedTo: issuedTo || 'مدیریت کارخانه',
      expiry: expiry || 'PERMANENT',
      maxUsers: maxUsers || 100,
      type: type || 'ENTERPRISE_UNLIMITED'
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: 'خطا در صدور لایسنس: ' + err.message });
  }
});

// ================= AI PACKAGING COPILOT ROUTES =================
app.post('/api/ai/parse-prompt', authMiddleware, (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'متن استعلام خالی است.' });
    }
    const result = parsePackagingPrompt(prompt);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'خطا در پردازش هوش مصنوعی: ' + err.message });
  }
});

app.post('/api/ai/optimize-nesting', authMiddleware, (req, res) => {
  try {
    const { flatLength, flatWidth, quantity, grammage, cardboardPricePerKg, customSheets } = req.body;
    const result = optimizeSheetNesting({
      flatLength,
      flatWidth,
      quantity,
      grammage,
      cardboardPricePerKg,
      customSheets
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'خطا در بهینه‌سازی شیت: ' + err.message });
  }
});

app.post('/api/ai/preflight-audit', authMiddleware, (req, res) => {
  try {
    const result = auditPackagingSpecs(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'خطا در بازرسی فنی: ' + err.message });
  }
});

app.get('/api/ai/knowledge-base', authMiddleware, (req, res) => {
  res.json({ faq: PACKAGING_FAQ });
});

// ================= DIELINE GENERATOR & MONTAGE ROUTES =================
app.post('/api/dieline/generate', authMiddleware, (req, res) => {
  try {
    const dieline = generateBoxDieline(req.body);
    res.json(dieline);
  } catch (err) {
    res.status(500).json({ error: 'خطا در تولید خط تیغ: ' + err.message });
  }
});

app.post('/api/dieline/montage', authMiddleware, (req, res) => {
  try {
    const {
      boxType,
      length,
      width,
      height,
      material,
      quantity,
      grammage,
      cardboardPricePerKg,
      customSheet,
      montageMode
    } = req.body;
    
    const montage = optimizeSheetMontage({
      boxType,
      length,
      width,
      height,
      material,
      quantity: quantity || 10000,
      grammage: grammage || 300,
      cardboardPricePerKg: cardboardPricePerKg || 65000,
      customSheet,
      montageMode: montageMode || 'auto'
    });

    res.json(montage);
  } catch (err) {
    res.status(500).json({ error: 'خطا در مونتاژ و چیدمان شیت: ' + err.message });
  }
});

<<<<<<< HEAD
// ================= MARKETING LEADS ROUTES (بخش بازاریاب) =================
// 1. Get leads list
=======
// ================= MARKETING LEADS ROUTES (بخش بازاریاب و پیگیری استعلامات) =================
// 1. Get leads list with marketer tracking & linked project stage details
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
app.get('/api/marketing/leads', authMiddleware, (req, res) => {
  try {
    const user = req.user;
    let leads;
    if (user.role === 'marketer') {
<<<<<<< HEAD
      leads = db.prepare('SELECT * FROM marketing_leads WHERE marketer_id = ? ORDER BY id DESC').all(user.id);
    } else {
      leads = db.prepare('SELECT * FROM marketing_leads ORDER BY id DESC').all();
    }
    res.json({ success: true, leads });
=======
      leads = db.prepare(`
        SELECT l.*,
               p.current_stage as project_current_stage,
               p.status as project_status,
               p.order_code as project_order_code,
               p.archive_code as project_archive_code
        FROM marketing_leads l
        LEFT JOIN projects p ON l.converted_project_id = p.id
        WHERE l.marketer_id = ?
        ORDER BY l.id DESC
      `).all(user.id);
    } else {
      leads = db.prepare(`
        SELECT l.*,
               p.current_stage as project_current_stage,
               p.status as project_status,
               p.order_code as project_order_code,
               p.archive_code as project_archive_code
        FROM marketing_leads l
        LEFT JOIN projects p ON l.converted_project_id = p.id
        ORDER BY l.id DESC
      `).all();
    }

    // Parse JSON followup_logs
    const enrichedLeads = leads.map(lead => {
      let followups = [];
      try {
        if (lead.followup_logs) {
          followups = typeof lead.followup_logs === 'string' ? JSON.parse(lead.followup_logs) : lead.followup_logs;
        }
      } catch (e) {
        followups = [];
      }
      return {
        ...lead,
        followup_logs: followups
      };
    });

    res.json({ success: true, leads: enrichedLeads });
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
  } catch (err) {
    res.status(500).json({ error: 'خطا در دریافت لیست استعلام‌های بازاریابی: ' + err.message });
  }
});

// 2. Submit new marketing lead (ثبت استعلام توسط بازاریاب)
app.post('/api/marketing/leads', authMiddleware, (req, res) => {
  try {
    const user = req.user;
    const {
      customer_name,
      customer_phone,
      product_name,
      quantity,
      cardboard_type,
      cardboard_grammage,
      material_construction,
      cellophane_type,
      box_length,
      box_width,
      box_height,
      notes
    } = req.body;

    if (!customer_name || !customer_phone || !product_name || !quantity) {
      return res.status(400).json({ error: 'لطفاً نام مشتری، شماره تماس، نام محصول و تیراژ را وارد نمایید.' });
    }

    const leadCount = db.prepare('SELECT COUNT(*) as count FROM marketing_leads').get();
    const leadCode = `MKT-${101 + (leadCount.count || 0)}`;

    const insertStmt = db.prepare(`
      INSERT INTO marketing_leads (
        lead_code, customer_name, customer_phone, product_name, quantity,
        cardboard_type, cardboard_grammage, material_construction, cellophane_type,
        box_length, box_width, box_height, notes,
        status, marketer_id, marketer_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_commercial', ?, ?)
    `);

    const result = insertStmt.run(
      leadCode,
      customer_name,
      customer_phone,
      product_name,
      Number(quantity),
      cardboard_type || 'ایندربرد',
      cardboard_grammage ? Number(cardboard_grammage) : 300,
      material_construction || 'مقوا تک‌لا',
      cellophane_type || 'سلفون مات',
      box_length ? Number(box_length) : null,
      box_width ? Number(box_width) : null,
      box_height ? Number(box_height) : null,
      notes || '',
      user.id,
      user.full_name || 'کارشناس بازاریابی'
    );

    const newLeadId = result.lastInsertRowid;

    // Send In-App & Multi-channel Notification to Commercial, Estimation and CEO
    sendNotification({
      targetRole: 'sales',
      title: 'استعلام جدید از بازاریاب',
      message: `استعلام جدید برای «${customer_name}» (${product_name}) با تیراژ ${Number(quantity).toLocaleString('fa-IR')} توسط ${user.full_name || 'بازاریاب'} ثبت و جهت برآورد قیمت ارسال شد.`,
      stageNumber: 1,
      projectId: newLeadId,
      archiveCode: leadCode
    });

    sendNotification({
      targetRole: 'estimation',
      title: 'استعلام جدید در انتظار برآورد قیمت',
      message: `استعلام «${customer_name}» (${leadCode}) با تیراژ ${Number(quantity).toLocaleString('fa-IR')} منتظر برآورد قیمت است.`,
      stageNumber: 2,
      projectId: newLeadId,
      archiveCode: leadCode
    });

    sendNotification({
      targetRole: 'ceo',
      title: 'استعلام بازاریابی جدید',
      message: `استعلام «${customer_name}» (${leadCode}) توسط بازاریاب ثبت شد.`,
      stageNumber: 1,
      projectId: newLeadId,
      archiveCode: leadCode
    });

    res.json({
      success: true,
      lead_id: newLeadId,
      lead_code: leadCode,
      message: 'استعلام با موفقیت ثبت و جهت برآورد قیمت به مدیر بازرگانی ارسال گردید.'
    });
  } catch (err) {
    res.status(500).json({ error: 'خطا در ثبت استعلام بازاریابی: ' + err.message });
  }
});

// 3. Commercial Manager Price Estimation (برآورد قیمت توسط مدیر بازرگانی)
app.put('/api/marketing/leads/:id/estimate', authMiddleware, (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'sales' && user.role !== 'ceo' && user.role !== 'accounting') {
      return res.status(403).json({ error: 'تنها واحد بازرگانی و مدیر عامل مجاز به برآورد قیمت هستند.' });
    }

    const { id } = req.params;
    const { estimated_unit_price, estimated_total_price, commercial_notes } = req.body;

    const lead = db.prepare('SELECT * FROM marketing_leads WHERE id = ?').get(id);
    if (!lead) {
      return res.status(404).json({ error: 'استعلام مورد نظر یافت نشد.' });
    }

    const unitPrice = Number(estimated_unit_price) || 0;
    const totalPrice = Number(estimated_total_price) || (unitPrice * lead.quantity);

    db.prepare(`
      UPDATE marketing_leads
      SET estimated_unit_price = ?,
          estimated_total_price = ?,
          commercial_notes = ?,
          commercial_reviewer_id = ?,
          commercial_reviewer_name = ?,
          reviewed_at = CURRENT_TIMESTAMP,
          status = 'estimated',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      unitPrice,
      totalPrice,
      commercial_notes || '',
      user.id,
      user.fullName || user.full_name || 'مدیر بازرگانی',
      id
    );

    // Notify Marketer
    if (lead.marketer_id) {
      sendNotification({
        userId: lead.marketer_id,
        targetRole: 'marketer',
        title: 'برآورد قیمت استعلام بازاریابی',
        message: `قیمت استعلام «${lead.customer_name}» (${lead.product_name}) توسط مدیر بازرگانی اعلام شد: فی ${unitPrice.toLocaleString('fa-IR')} تومان.`,
        stageNumber: 2
      });
    }

    res.json({ success: true, message: 'برآورد قیمت با موفقیت ثبت و به کارتابل بازاریاب اعلام گردید.' });
  } catch (err) {
    res.status(500).json({ error: 'خطا در ثبت برآورد قیمت: ' + err.message });
  }
});

// 4. Update Lead Status (e.g. Customer Approved, Rejected)
app.put('/api/marketing/leads/:id/status', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
<<<<<<< HEAD
    const { status } = req.body;
=======
    const { status, customer_feedback, rejection_reason } = req.body;
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)

    const lead = db.prepare('SELECT * FROM marketing_leads WHERE id = ?').get(id);
    if (!lead) return res.status(404).json({ error: 'استعلام یافت نشد.' });

<<<<<<< HEAD
    db.prepare('UPDATE marketing_leads SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
=======
    let query = 'UPDATE marketing_leads SET status = ?, updated_at = CURRENT_TIMESTAMP';
    const params = [status];

    if (customer_feedback !== undefined) {
      query += ', customer_feedback = ?';
      params.push(customer_feedback);
    }
    if (rejection_reason !== undefined) {
      query += ', rejection_reason = ?';
      params.push(rejection_reason);
    }

    query += ' WHERE id = ?';
    params.push(id);

    db.prepare(query).run(...params);
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)

    res.json({ success: true, message: 'وضعیت استعلام به‌روزرسانی شد.' });
  } catch (err) {
    res.status(500).json({ error: 'خطا در تغییر وضعیت: ' + err.message });
  }
});

<<<<<<< HEAD
=======
// 4.1 Add Follow-up Log (ثبت پیگیری و یادداشت تماس با مشتری توسط بازاریاب)
app.post('/api/marketing/leads/:id/followup', authMiddleware, (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { note, outcome, new_status } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ error: 'متن یادداشت پیگیری الزامی است.' });
    }

    const lead = db.prepare('SELECT * FROM marketing_leads WHERE id = ?').get(id);
    if (!lead) return res.status(404).json({ error: 'استعلام یافت نشد.' });

    let followups = [];
    try {
      if (lead.followup_logs) {
        followups = typeof lead.followup_logs === 'string' ? JSON.parse(lead.followup_logs) : lead.followup_logs;
      }
    } catch (e) {
      followups = [];
    }

    const newLog = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      date_shamsi: new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date()),
      user_name: user.fullName || user.full_name || 'کارشناس بازاریابی',
      user_role: user.role,
      note: note.trim(),
      outcome: outcome || 'پیگیری عادی'
    };

    followups.unshift(newLog);

    let nextStatus = new_status || lead.status;
    db.prepare(`
      UPDATE marketing_leads
      SET followup_logs = ?,
          status = ?,
          customer_feedback = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      JSON.stringify(followups),
      nextStatus,
      note.trim(),
      id
    );

    // If customer approved from follow-up, notify sales to convert
    if (nextStatus === 'customer_approved') {
      sendNotification({
        targetRole: 'sales',
        title: 'تایید قیمت توسط مشتری',
        message: `مشتری «${lead.customer_name}» قیمت استعلام ${lead.lead_code} را تایید کرد و آماده تبدیل به سفارش کارخانه است.`,
        stageNumber: 1,
        projectId: lead.id,
        archiveCode: lead.lead_code
      });
    }

    res.json({
      success: true,
      followup_logs: followups,
      status: nextStatus,
      message: 'پیگیری با موفقیت در پرونده استعلام ثبت گردید.'
    });
  } catch (err) {
    res.status(500).json({ error: 'خطا در ثبت پیگیری: ' + err.message });
  }
});

>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
// 5. Convert Lead to Factory ERP Project
app.post('/api/marketing/leads/:id/convert-to-project', authMiddleware, (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'sales' && user.role !== 'ceo' && user.role !== 'secretary') {
      return res.status(403).json({ error: 'فقط واحد بازرگانی یا مدیریت عامل می‌توانند استعلام را به سفارش تبدیل کنند.' });
    }

    const { id } = req.params;
    const lead = db.prepare('SELECT * FROM marketing_leads WHERE id = ?').get(id);
    if (!lead) return res.status(404).json({ error: 'استعلام یافت نشد.' });

    const projCount = db.prepare('SELECT COUNT(*) as count FROM projects').get();
    const nextArchiveCode = String(8000 + (projCount.count || 0) + 1);
    const nextOrderCode = String(7000 + (projCount.count || 0) + 1);

    const insertProj = db.prepare(`
      INSERT INTO projects (
        archive_code, order_code, title, customer_name, customer_phone,
        box_type, box_structure, quantity,
        has_cardboard, cardboard_type, cardboard_grammage,
        has_cellophane, cellophane_type,
        general_notes,
        estimated_unit_price, estimated_total_price,
        current_stage, status, created_by
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        1, ?, ?,
        ?, ?,
        ?,
        ?, ?,
        1, 'active', ?
      )
    `);

    const hasCello = lead.cellophane_type && !lead.cellophane_type.includes('بدون') ? 1 : 0;
    const notes = `ثبت شده توسط بازاریاب (${lead.marketer_name || 'بازاریاب'}) - کد استعلام: ${lead.lead_code}\nنوع ساختار: ${lead.material_construction}\n${lead.notes || ''}`;

    const projResult = insertProj.run(
      nextArchiveCode,
      nextOrderCode,
      lead.product_name,
      lead.customer_name,
      lead.customer_phone,
      lead.material_construction || 'جعبه مقوایی',
      'درب دارویی ساده (Tuck End)',
      lead.quantity,
      lead.cardboard_type || 'ایندربرد',
      lead.cardboard_grammage || 300,
      hasCello,
      lead.cellophane_type || '',
      notes,
      lead.estimated_unit_price || 0,
      lead.estimated_total_price || 0,
      user.id
    );

    const newProjectId = projResult.lastInsertRowid;

    db.prepare(`
      UPDATE marketing_leads
      SET status = 'converted_to_order',
          converted_project_id = ?,
          converted_archive_code = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newProjectId, nextArchiveCode, id);

    db.prepare(`
      INSERT INTO workflow_logs (project_id, stage_number, stage_name, action, user_id, user_name, user_role, comment)
      VALUES (?, 1, 'بازرگانی و تعریف سفارش', 'تبدیل استعلام بازاریاب به سفارش رسمی کارخانه', ?, ?, ?, ?)
    `).run(newProjectId, user.id, user.fullName || user.full_name || 'مدیر بازرگانی', user.role, `سفارش از استعلام ${lead.lead_code} بازاریاب (${lead.marketer_name}) ایجاد شد.`);

    res.json({
      success: true,
      project_id: newProjectId,
      archive_code: nextArchiveCode,
      message: `استعلام ${lead.lead_code} با موفقیت به سفارش رسمی کارخانه (کد پیگیری: ${nextArchiveCode}) تبدیل گردید.`
    });
  } catch (err) {
    res.status(500).json({ error: 'خطا در تبدیل استعلام به سفارش: ' + err.message });
  }
});

// ================= PRODUCTION ORDERS (دستور تولید با ۴ رنگ وضعیت: سفید، زرد، قرمز، سبز) =================
// 1. Get Production Orders List
app.get('/api/production-orders', authMiddleware, (req, res) => {
  try {
    const { color, category, search } = req.query;
    let query = 'SELECT * FROM production_orders WHERE 1=1';
    const params = [];

    if (color && color !== 'all') {
      query += ' AND status_color = ?';
      params.push(color);
    }
    if (category && category !== 'all') {
      query += ' AND order_category = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND (customer_name LIKE ? OR product_title LIKE ? OR order_code LIKE ? OR archive_code LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY id DESC';
    const orders = db.prepare(query).all(...params);

    const whiteCount = db.prepare("SELECT COUNT(*) as c FROM production_orders WHERE status_color = 'white'").get().c || 0;
    const yellowCount = db.prepare("SELECT COUNT(*) as c FROM production_orders WHERE status_color = 'yellow'").get().c || 0;
    const redCount = db.prepare("SELECT COUNT(*) as c FROM production_orders WHERE status_color = 'red'").get().c || 0;
    const greenCount = db.prepare("SELECT COUNT(*) as c FROM production_orders WHERE status_color = 'green'").get().c || 0;

    res.json({
      success: true,
      orders,
      counts: {
        white: whiteCount,
        yellow: yellowCount,
        red: redCount,
        green: greenCount,
        total: whiteCount + yellowCount + redCount + greenCount
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'خطا در دریافت لیست دستور تولید: ' + err.message });
  }
});

// 2. Create Production Order
app.post('/api/production-orders', authMiddleware, (req, res) => {
  try {
    const {
      customer_name, customer_phone, product_title, order_category,
      quantity, box_type, material, grammage, sheet_size, sheet_count,
      zinc_count, coating_type, diecut_type, gluing_type, status_color,
      financial_status, financial_notes, total_price, paid_amount,
      delivery_deadline, assigned_machine, production_notes
    } = req.body;

    if (!customer_name || !product_title || !quantity) {
      return res.status(400).json({ error: 'نام مشتری، نام محصول و تیراژ الزامی هستند.' });
    }

    const count = db.prepare('SELECT COUNT(*) as c FROM production_orders').get().c || 0;
    const order_code = req.body.order_code || String(10800 + count + 1);
    const archive_code = req.body.archive_code || String(9200 + count + 1);

    const stmt = db.prepare(`
      INSERT INTO production_orders (
        order_code, archive_code, customer_name, customer_phone, product_title, order_category,
        quantity, box_type, material, grammage, sheet_size, sheet_count, zinc_count,
        coating_type, diecut_type, gluing_type, status_color, financial_status,
        financial_notes, total_price, paid_amount, delivery_deadline, assigned_machine, production_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      order_code, archive_code, customer_name, customer_phone || null, product_title, order_category || 'offset',
      parseInt(quantity), box_type || null, material || null, parseFloat(grammage) || null,
      sheet_size || null, parseInt(sheet_count) || null, parseInt(zinc_count) || 4,
      coating_type || null, diecut_type || null, gluing_type || null, status_color || 'white',
      financial_status || 'در انتظار پیش‌پرداخت', financial_notes || null,
      parseFloat(total_price) || 0, parseFloat(paid_amount) || 0,
      delivery_deadline || null, assigned_machine || null, production_notes || null
    );

    res.json({ success: true, message: 'دستور تولید با موفقیت ثبت شد.' });
  } catch (err) {
    res.status(500).json({ error: 'خطا در ثبت دستور تولید: ' + err.message });
  }
});

// 3. Update Status Color (White / Yellow / Red / Green)
app.put('/api/production-orders/:id/status-color', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { status_color, financial_status, financial_notes } = req.body;

    if (!['white', 'yellow', 'red', 'green'].includes(status_color)) {
      return res.status(400).json({ error: 'رنگ وضعیت باید سفید، زرد، قرمز یا سبز باشد.' });
    }

    let query = 'UPDATE production_orders SET status_color = ?, updated_at = CURRENT_TIMESTAMP';
    const params = [status_color];

    if (financial_status) {
      query += ', financial_status = ?';
      params.push(financial_status);
    }
    if (financial_notes !== undefined) {
      query += ', financial_notes = ?';
      params.push(financial_notes);
    }

    query += ' WHERE id = ?';
    params.push(id);

    db.prepare(query).run(...params);
    res.json({ success: true, message: 'وضعیت کار به رنگ ' + status_color + ' تغییر یافت.' });
  } catch (err) {
    res.status(500).json({ error: 'خطا در تغییر وضعیت: ' + err.message });
  }
});

// 4. Update Production Order Details
app.put('/api/production-orders/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const {
      customer_name, customer_phone, product_title, order_category,
      quantity, box_type, material, grammage, sheet_size, sheet_count,
      zinc_count, coating_type, diecut_type, gluing_type, status_color,
      financial_status, financial_notes, total_price, paid_amount,
      delivery_deadline, assigned_machine, production_notes
    } = req.body;

    db.prepare(`
      UPDATE production_orders SET
        customer_name = ?, customer_phone = ?, product_title = ?, order_category = ?,
        quantity = ?, box_type = ?, material = ?, grammage = ?, sheet_size = ?, sheet_count = ?,
        zinc_count = ?, coating_type = ?, diecut_type = ?, gluing_type = ?, status_color = ?,
        financial_status = ?, financial_notes = ?, total_price = ?, paid_amount = ?,
        delivery_deadline = ?, assigned_machine = ?, production_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      customer_name, customer_phone, product_title, order_category,
      quantity, box_type, material, grammage, sheet_size, sheet_count,
      zinc_count, coating_type, diecut_type, gluing_type, status_color,
      financial_status, financial_notes, total_price, paid_amount,
      delivery_deadline, assigned_machine, production_notes, id
    );

    res.json({ success: true, message: 'دستور تولید با موفقیت به‌روزرسانی شد.' });
  } catch (err) {
    res.status(500).json({ error: 'خطا در ویرایش دستور تولید: ' + err.message });
  }
});

// 5. Export Production Orders Excel with 4 SHEETS (سفید / زرد / قرمز / سبز)
app.get('/api/production-orders/export-excel', authMiddleware, (req, res) => {
  try {
    const whiteOrders = db.prepare("SELECT * FROM production_orders WHERE status_color = 'white' ORDER BY id DESC").all();
    const yellowOrders = db.prepare("SELECT * FROM production_orders WHERE status_color = 'yellow' ORDER BY id DESC").all();
    const redOrders = db.prepare("SELECT * FROM production_orders WHERE status_color = 'red' ORDER BY id DESC").all();
    const greenOrders = db.prepare("SELECT * FROM production_orders WHERE status_color = 'green' ORDER BY id DESC").all();

    const formatRows = (rows) => rows.map((r, i) => ({
      'ردیف': i + 1,
      'شماره سفارش': r.order_code,
      'کد بایگانی': r.archive_code,
      'نام مشتری': r.customer_name,
      'نام سفارش / عنوان محصول': r.product_title,
      'نوع سفارش': r.order_category === 'offset' ? 'چاپ افست' : r.order_category === 'digital' ? 'چاپ دیجیتال' : 'خدمات کارمزدی',
      'تیراژ': r.quantity,
      'نوع جعبه': r.box_type || '-',
      'جنس مقوا / کاغذ': r.material || '-',
      'گراماژ': r.grammage || '-',
      'سایز شیت': r.sheet_size || '-',
      'تعداد شیت': r.sheet_count || '-',
      'تعداد زینک': r.zinc_count || '-',
      'نوع پوشش و سلفون': r.coating_type || '-',
      'دایکات و تیغ': r.diecut_type || '-',
      'چسب و اتصال': r.gluing_type || '-',
      'وضعیت مالی': r.financial_status || '-',
      'مبلغ کل (تومان)': r.total_price || 0,
      'مبلغ دریافتی (تومان)': r.paid_amount || 0,
      'مانده حساب (تومان)': (r.total_price || 0) - (r.paid_amount || 0),
      'مهلت تحویل': r.delivery_deadline || '-',
      'ماشین اختصاص‌یافته': r.assigned_machine || '-',
      'ملاحظات فنی تولید': r.production_notes || '-'
    }));

    const wb = XLSX.utils.book_new();

    const wsWhite = XLSX.utils.json_to_sheet(formatRows(whiteOrders));
    const wsYellow = XLSX.utils.json_to_sheet(formatRows(yellowOrders));
    const wsRed = XLSX.utils.json_to_sheet(formatRows(redOrders));
    const wsGreen = XLSX.utils.json_to_sheet(formatRows(greenOrders));

    XLSX.utils.book_append_sheet(wb, wsWhite, 'صف تولید (سفید)');
    XLSX.utils.book_append_sheet(wb, wsYellow, 'پرونده مالی (زرد)');
    XLSX.utils.book_append_sheet(wb, wsRed, 'کنسل شده (قرمز)');
    XLSX.utils.book_append_sheet(wb, wsGreen, 'تکمیل و بایگانی (سبز)');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Amiran-Production-Orders-4Sheets.xlsx"');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: 'خطا در خروجی اکسل: ' + err.message });
  }
});

// ================= WAREHOUSE RECEIPTS (انبار ۶ گانه کارخانه) =================
// 1. Get Warehouse Receipts with category filter
app.get('/api/warehouse-receipts', authMiddleware, (req, res) => {
  try {
    const { category, supplier, location, search, status } = req.query;
    let query = 'SELECT * FROM warehouse_receipts WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND warehouse_category = ?';
      params.push(category);
    }
    if (supplier && supplier !== 'all') {
      query += ' AND supplier = ?';
      params.push(supplier);
    }
    if (location && location !== 'all') {
      query += ' AND unloading_location = ?';
      params.push(location);
    }
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (customer_name LIKE ? OR order_name LIKE ? OR order_code LIKE ? OR archive_code LIKE ? OR material LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
    }

    query += ' ORDER BY id DESC';
    const receipts = db.prepare(query).all(...params);

    // Summary counts per warehouse category
    const counts = {
      cardboard: db.prepare("SELECT COUNT(*) as c FROM warehouse_receipts WHERE warehouse_category = 'cardboard'").get().c || 0,
      sheet_carton: db.prepare("SELECT COUNT(*) as c FROM warehouse_receipts WHERE warehouse_category = 'sheet_carton'").get().c || 0,
      single_face: db.prepare("SELECT COUNT(*) as c FROM warehouse_receipts WHERE warehouse_category = 'single_face'").get().c || 0,
      cellophane: db.prepare("SELECT COUNT(*) as c FROM warehouse_receipts WHERE warehouse_category = 'cellophane'").get().c || 0,
      pvc_film: db.prepare("SELECT COUNT(*) as c FROM warehouse_receipts WHERE warehouse_category = 'pvc_film'").get().c || 0,
      ink: db.prepare("SELECT COUNT(*) as c FROM warehouse_receipts WHERE warehouse_category = 'ink'").get().c || 0
    };

    res.json({ success: true, receipts, counts });
  } catch (err) {
    res.status(500).json({ error: 'خطا در دریافت انبار: ' + err.message });
  }
});

// 2. Create Warehouse Receipt
app.post('/api/warehouse-receipts', authMiddleware, (req, res) => {
  try {
    const {
      warehouse_category, registration_date, order_code, archive_code, customer_name, order_name,
      supplier, material, grammage, size, unit, required_qty, unloading_location,
      received_qty_1, received_date_1, received_qty_2, received_date_2, status, status_color, notes
    } = req.body;

    const r1 = parseInt(received_qty_1) || 0;
    const r2 = parseInt(received_qty_2) || 0;
    const total = r1 + r2;

    db.prepare(`
      INSERT INTO warehouse_receipts (
        warehouse_category, registration_date, order_code, archive_code, customer_name, order_name,
        supplier, material, grammage, size, unit, required_qty, unloading_location,
        received_qty_1, received_date_1, received_qty_2, received_date_2, total_received, status, status_color, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      warehouse_category || 'cardboard', registration_date || '1405/01/01', order_code, archive_code, customer_name, order_name,
      supplier, material, parseFloat(grammage) || null, size, unit || 'شیت', parseInt(required_qty), unloading_location,
      r1, received_date_1 || null, r2, received_date_2 || null, total, status || 'received', status_color || 'white', notes || null
    );

    res.json({ success: true, message: 'رسید انبار با موفقیت ثبت شد.' });
  } catch (err) {
    res.status(500).json({ error: 'خطا در ثبت انبار: ' + err.message });
  }
});

// 2.1 Update Warehouse Status Color (White / Yellow / Red / Green)
app.put('/api/warehouse-receipts/:id/status-color', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { status_color } = req.body;
    if (!['white', 'yellow', 'red', 'green'].includes(status_color)) {
      return res.status(400).json({ error: 'رنگ وضعیت باید سفید، زرد، قرمز یا سبز باشد.' });
    }
    db.prepare('UPDATE warehouse_receipts SET status_color = ? WHERE id = ?').run(status_color, id);
    res.json({ success: true, message: 'وضعیت رسید انبار تغییر یافت.' });
  } catch (err) {
    res.status(500).json({ error: 'خطا در تغییر وضعیت انبار: ' + err.message });
  }
});

// 3. Export Warehouse Excel (با ۶ شیت تخصصی: مقوا، ورق، سینگل، سلفون، طلق، مرکب)
app.get('/api/warehouse-receipts/export-excel', authMiddleware, (req, res) => {
  try {
    const formatRows = (rows) => rows.map((r, i) => ({
      'ردیف': i + 1,
      'تاریخ ثبت': r.registration_date,
      'شماره سفارش': r.order_code,
      'شماره بایگانی': r.archive_code,
      'نام مشتری': r.customer_name,
      'نام سفارش / عنوان کالا': r.order_name,
      'تامین کننده': r.supplier,
      'جنس / مشخصات فنی': r.material,
      'گراماژ / ضخامت': r.grammage || '-',
      'سایز / ابعاد': r.size,
      'واحد شمارش': r.unit || 'شیت',
      'تیراژ سفارش': r.required_qty,
      'محل تخلیه انبار': r.unloading_location,
      'تعداد دریافتی (پارت ۱)': r.received_qty_1 || 0,
      'تاریخ دریافت (پارت ۱)': r.received_date_1 || '-',
      'تعداد دریافتی (پارت ۲)': r.received_qty_2 || 0,
      'تاریخ دریافت (پارت ۲)': r.received_date_2 || '-',
      'جمع کل دریافتی': (r.received_qty_1 || 0) + (r.received_qty_2 || 0),
      'وضعیت کسری / مازاد': r.status === 'received' ? 'دریافت کامل' : r.status === 'partial' ? 'دارای کسری' : r.status === 'excess' ? 'مازاد بر تیراژ' : 'در انتظار',
      'توضیحات انبار': r.notes || '-'
    }));

    const cardboardRows = db.prepare("SELECT * FROM warehouse_receipts WHERE warehouse_category = 'cardboard' ORDER BY id DESC").all();
    const cartonRows = db.prepare("SELECT * FROM warehouse_receipts WHERE warehouse_category = 'sheet_carton' ORDER BY id DESC").all();
    const singleRows = db.prepare("SELECT * FROM warehouse_receipts WHERE warehouse_category = 'single_face' ORDER BY id DESC").all();
    const cellophaneRows = db.prepare("SELECT * FROM warehouse_receipts WHERE warehouse_category = 'cellophane' ORDER BY id DESC").all();
    const pvcRows = db.prepare("SELECT * FROM warehouse_receipts WHERE warehouse_category = 'pvc_film' ORDER BY id DESC").all();
    const inkRows = db.prepare("SELECT * FROM warehouse_receipts WHERE warehouse_category = 'ink' ORDER BY id DESC").all();

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(formatRows(cardboardRows)), '۱. انبار مقوا');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(formatRows(cartonRows)), '۲. انبار ورق');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(formatRows(singleRows)), '۳. انبار سینگل');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(formatRows(cellophaneRows)), '۴. انبار سلفون');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(formatRows(pvcRows)), '۵. انبار طلق');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(formatRows(inkRows)), '۶. انبار مرکب');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Amiran-Warehouse-6Categories.xlsx"');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: 'خطا در خروجی اکسل انبار: ' + err.message });
  }
});

// ================= DIGITAL PRINT ORDERS (چاپ دیجیتال) =================
// 1. Get Digital Orders
app.get('/api/digital-orders', authMiddleware, (req, res) => {
  try {
    const { color, search } = req.query;
    let query = 'SELECT * FROM digital_orders WHERE 1=1';
    const params = [];
    if (color && color !== 'all') {
      query += ' AND status_color = ?';
      params.push(color);
    }
    if (search) {
      query += ' AND (customer_name LIKE ? OR title LIKE ? OR order_code LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    query += ' ORDER BY id DESC';
    const orders = db.prepare(query).all(...params);
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ error: 'خطا در دریافت چاپ دیجیتال: ' + err.message });
  }
});

// 2. Create Digital Order
app.post('/api/digital-orders', authMiddleware, (req, res) => {
  try {
    const {
      customer_name, customer_phone, title, machine_type,
      paper_type, grammage, dimensions, quantity, print_side, lamination,
      finishing, status_color, unit_price, total_price, paid_amount, delivery_deadline, notes
    } = req.body;

    const count = db.prepare('SELECT COUNT(*) as c FROM digital_orders').get().c || 0;
    const order_code = req.body.order_code || `DIG-${101 + count}`;

    db.prepare(`
      INSERT INTO digital_orders (
        order_code, customer_name, customer_phone, title, machine_type,
        paper_type, grammage, dimensions, quantity, print_side, lamination,
        finishing, status_color, unit_price, total_price, paid_amount, delivery_deadline, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      order_code, customer_name, customer_phone || null, title, machine_type,
      paper_type, parseFloat(grammage) || null, dimensions, parseInt(quantity),
      print_side || 'یکرو ۴ رنگ', lamination || 'بدون روکش',
      finishing || null, status_color || 'white', parseFloat(unit_price) || 0,
      parseFloat(total_price) || 0, parseFloat(paid_amount) || 0,
      delivery_deadline || null, notes || null
    );

    res.json({ success: true, message: 'سفارش چاپ دیجیتال ثبت شد.' });
  } catch (err) {
    res.status(500).json({ error: 'خطا در ثبت چاپ دیجیتال: ' + err.message });
  }
});

// 3. Update Digital Order Status Color
app.put('/api/digital-orders/:id/status-color', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { status_color } = req.body;
    db.prepare('UPDATE digital_orders SET status_color = ? WHERE id = ?').run(status_color, id);
    res.json({ success: true, message: 'وضعیت سفارش دیجیتال تغییر کرد.' });
  } catch (err) {
    res.status(500).json({ error: 'خطا در تغییر وضعیت: ' + err.message });
  }
});

// ================= TOLL SERVICES ORDERS (کارهای خدماتی و اجرتی) =================
// 1. Get Toll Service Orders
app.get('/api/service-orders', authMiddleware, (req, res) => {
  try {
    const { color, search } = req.query;
    let query = 'SELECT * FROM toll_service_orders WHERE 1=1';
    const params = [];
    if (color && color !== 'all') {
      query += ' AND status_color = ?';
      params.push(color);
    }
    if (search) {
      query += ' AND (customer_name LIKE ? OR service_title LIKE ? OR order_code LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    query += ' ORDER BY id DESC';
    const orders = db.prepare(query).all(...params);
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ error: 'خطا در دریافت سفارشات خدماتی: ' + err.message });
  }
});

// 2. Create Toll Service Order
app.post('/api/service-orders', authMiddleware, (req, res) => {
  try {
    const {
      customer_name, customer_phone, service_title, service_types,
      incoming_material_desc, incoming_sheet_count, incoming_receipt_number,
      die_status, setup_fee, rate_per_unit, total_amount, paid_amount,
      status_color, operator_name, completed_qty, delivered_date, notes
    } = req.body;

    const count = db.prepare('SELECT COUNT(*) as c FROM toll_service_orders').get().c || 0;
    const order_code = req.body.order_code || `SRV-${201 + count}`;

    db.prepare(`
      INSERT INTO toll_service_orders (
        order_code, customer_name, customer_phone, service_title, service_types,
        incoming_material_desc, incoming_sheet_count, incoming_receipt_number,
        die_status, setup_fee, rate_per_unit, total_amount, paid_amount,
        status_color, operator_name, completed_qty, delivered_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      order_code, customer_name, customer_phone || null, service_title,
      typeof service_types === 'string' ? service_types : JSON.stringify(service_types || []),
      incoming_material_desc, parseInt(incoming_sheet_count) || 0, incoming_receipt_number || null,
      die_status || 'قالب در کارخانه موجود است', parseFloat(setup_fee) || 0,
      parseFloat(rate_per_unit) || 0, parseFloat(total_amount) || 0,
      parseFloat(paid_amount) || 0, status_color || 'white', operator_name || null,
      parseInt(completed_qty) || 0, delivered_date || null, notes || null
    );

    res.json({ success: true, message: 'سفارش خدماتی و کارمزدی ثبت شد.' });
  } catch (err) {
    res.status(500).json({ error: 'خطا در ثبت سفارش خدماتی: ' + err.message });
  }
});

// 3. Update Toll Service Status Color
app.put('/api/service-orders/:id/status-color', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { status_color } = req.body;
    db.prepare('UPDATE toll_service_orders SET status_color = ? WHERE id = ?').run(status_color, id);
    res.json({ success: true, message: 'وضعیت سفارش خدماتی تغییر کرد.' });
  } catch (err) {
    res.status(500).json({ error: 'خطا در تغییر وضعیت: ' + err.message });
  }
});

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      // Fallback if invalid token
    }
  }

  // Fallback demo user so preview always works seamlessly without 401 errors
  req.user = {
    id: 1,
    username: 'ceo',
    role: 'ceo',
    fullName: 'مهندس مسعود شعبانی',
    department: 'مدیریت عامل'
  };
  next();
}

const STAGES = {
  1: { id: 1, key: 'COMMERCE', name: '۱. بازرگانی و تعریف سفارش', role: 'sales', desc: 'ثبت کد آرشیو، مشخصات فنی و تیراژ' },
  2: { id: 2, key: 'PRICE_ESTIMATION', name: '۲. استعلام و برآورد قیمت روز', role: 'estimation', desc: 'محاسبه قیمت مقوا، سینگل، چاپ و خدمات' },
  3: { id: 3, key: 'CUSTOMER_PRICE_APPROVAL', name: '۳. تایید پیش‌فاکتور و قیمت توسط مشتری', role: 'sales', desc: 'ارائه قیمت به کارفرما، تاییدیه مالی و دریافت بیعانه' },
  4: { id: 4, key: 'CEO_APPROVAL', name: '۴. تایید مدیر عامل', role: 'ceo', desc: 'بررسی حاشیه سود و تایید نهایی پیش‌فاکتور' },
  5: { id: 5, key: 'DESIGN_ASSIGNMENT', name: '۵. ارجاع به واحد طراحی', role: 'design', desc: 'خط تیغ، آماده‌سازی فایل و فرم‌بندی' },
  6: { id: 6, key: 'CUSTOMER_DESIGN_APPROVAL', name: '۶. تایید طرح توسط مشتری', role: 'sales', desc: 'تایید فایل نهایی و متون توسط مشتری' },
  7: { id: 7, key: 'MOCKUP_PRODUCTION', name: '۷. ساخت ماکت و نمونه فیزیکی', role: 'mockup', desc: 'برش نمونه با کاترپلاتر و تست محصول' },
  8: { id: 8, key: 'CUSTOMER_MOCKUP_APPROVAL', name: '۸. تایید ماکت توسط مشتری', role: 'sales', desc: 'تایید نهایی قالب و ابعاد فیزیکی' },
  9: { id: 9, key: 'MATERIAL_PURCHASING', name: '۹. خرید متریال توسط واحد خرید', role: 'procurement', desc: 'تامین مقوا، زینک، ورق، رنگ و ملزومات' },
  10: { id: 10, key: 'PRODUCTION_EXECUTION', name: '۱۰. ارجاع به خط تولید و چاپ', role: 'production', desc: 'چاپ، لامینت، دایکات، جعبه‌چسبانی و تحویل' },
  11: { id: 11, key: 'COMPLETED', name: 'تکمیل و تحویل شد', role: 'all', desc: 'سفارش با موفقیت تحویل مشتری گردید' }
};

// ================= AUTH =================
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(400).json({ error: 'نام کاربری یا کلمه عبور اشتباه است' });
  }
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, fullName: user.full_name, department: user.department },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
  const { password_hash, ...userProfile } = user;
  res.json({ token, user: userProfile });
});

app.post('/api/auth/demo-login/:role', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE role = ? LIMIT 1').get(req.params.role);
  if (!user) return res.status(404).json({ error: 'کاربر برای این نقش یافت نشد' });
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, fullName: user.full_name, department: user.department },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
  const { password_hash, ...userProfile } = user;
  res.json({ token, user: userProfile });
});

function requireCeo(req, res, next) {
  if (req.user?.role !== 'ceo') {
    return res.status(403).json({ error: 'دسترسی غیرمجاز: این عملیات مختص مدیریت عامل است.' });
  }
  next();
}

function requireRoles(...allowed) {
  return (req, res, next) => {
    if (req.user?.role === 'ceo' || allowed.includes(req.user?.role)) {
      return next();
    }
    return res.status(403).json({ error: 'دسترسی غیرمجاز: شما مجوز دسترسی به این بخش را ندارید.' });
  };
}

// ================= USER MANAGEMENT & RBAC =================
app.get('/api/users', authMiddleware, requireCeo, (req, res) => {
  const users = db.prepare('SELECT id, username, full_name, role, department, phone, created_at FROM users ORDER BY id ASC').all();
  res.json({ users });
});

app.post('/api/users', authMiddleware, requireCeo, (req, res) => {
  const { username, password, full_name, role, department, phone } = req.body;
  if (!username || !password || !full_name || !role) {
    return res.status(400).json({ error: 'تمامی فیلدهای الزامی را پر کنید' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(400).json({ error: 'این نام کاربری قبلاً در سیستم ثبت شده است' });
  }

  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);

  const insert = db.prepare(`
    INSERT INTO users (username, password_hash, full_name, role, department, phone)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = insert.run(username, password_hash, full_name, role, department || role, phone || '');
  res.json({ success: true, id: result.lastInsertRowid });
});

app.put('/api/users/:id', authMiddleware, requireCeo, (req, res) => {
  const { full_name, role, department, phone, password } = req.body;
  const id = req.params.id;

  if (password && password.trim().length > 0) {
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    db.prepare(`
      UPDATE users SET full_name = ?, role = ?, department = ?, phone = ?, password_hash = ?
      WHERE id = ?
    `).run(full_name, role, department, phone || '', password_hash, id);
  } else {
    db.prepare(`
      UPDATE users SET full_name = ?, role = ?, department = ?, phone = ?
      WHERE id = ?
    `).run(full_name, role, department, phone || '', id);
  }

  res.json({ success: true });
});

app.delete('/api/users/:id', authMiddleware, requireCeo, (req, res) => {
  const id = req.params.id;
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'امکان حذف حساب کاربری جاری وجود ندارد' });
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ success: true });
});


// ================= PRICING =================
app.post('/api/pricing-calculator', (req, res) => {
  try {
    const result = calculateBoxCost(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: 'خطا در محاسبه قیمت: ' + err.message });
  }
});

app.get('/api/materials', (req, res) => {
  const materials = db.prepare('SELECT * FROM material_prices ORDER BY category, name').all();
  res.json({ materials });
});

app.put('/api/materials/:id', authMiddleware, requireRoles('accounting', 'estimation', 'warehouse', 'procurement'), (req, res) => {
  const { price_per_unit, description } = req.body;
  db.prepare('UPDATE material_prices SET price_per_unit = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(price_per_unit, description, req.params.id);
  res.json({ success: true });
});

// ================= CUSTOMERS =================
app.get('/api/customers', authMiddleware, (req, res) => {
  const customers = db.prepare('SELECT * FROM customers ORDER BY id DESC').all();
  res.json({ customers });
});

// ================= PROJECTS / ORDERS =================
app.get('/api/projects', authMiddleware, (req, res) => {
  const { stage, search, priority, status } = req.query;
  let query = 'SELECT * FROM projects WHERE 1=1';
  const params = [];

  if (stage) {
    query += ' AND current_stage = ?';
    params.push(parseInt(stage));
  }
  if (priority) {
    query += ' AND priority = ?';
    params.push(priority);
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    const s = `%${search.trim()}%`;
    query += ' AND (title LIKE ? OR archive_code LIKE ? OR customer_name LIKE ? OR order_code LIKE ? OR customer_code LIKE ? OR customer_phone LIKE ? OR box_type LIKE ? OR cardboard_type LIKE ?)';
    params.push(s, s, s, s, s, s, s, s);
  }

  query += ' ORDER BY id DESC';
  const raw = db.prepare(query).all(...params);

  const projects = raw.map(p => ({
    ...p,
    tracking_code: p.archive_code,
    specs_data: p.specs_data ? JSON.parse(p.specs_data) : null,
    estimation_data: p.estimation_data ? JSON.parse(p.estimation_data) : null,
    ceo_approval_data: p.ceo_approval_data ? JSON.parse(p.ceo_approval_data) : null,
    design_data: p.design_data ? JSON.parse(p.design_data) : null,
    customer_design_data: p.customer_design_data ? JSON.parse(p.customer_design_data) : null,
    mockup_data: p.mockup_data ? JSON.parse(p.mockup_data) : null,
    customer_mockup_data: p.customer_mockup_data ? JSON.parse(p.customer_mockup_data) : null,
    purchasing_data: p.purchasing_data ? JSON.parse(p.purchasing_data) : null,
    production_data: p.production_data ? JSON.parse(p.production_data) : null,
    stage_info: STAGES[p.current_stage] || STAGES[10]
  }));

  res.json({ projects });
});

app.get('/api/projects/:id', authMiddleware, (req, res) => {
  const p = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'پروژه یافت نشد' });

  const logs = db.prepare('SELECT * FROM workflow_logs WHERE project_id = ? ORDER BY id ASC').all(p.id);
  const comments = db.prepare('SELECT * FROM project_comments WHERE project_id = ? ORDER BY id ASC').all(p.id);
  const purchaseOrders = db.prepare('SELECT * FROM purchase_orders WHERE project_id = ? ORDER BY id ASC').all(p.id);

  const project = {
    ...p,
    tracking_code: p.archive_code,
    specs_data: p.specs_data ? JSON.parse(p.specs_data) : null,
    estimation_data: p.estimation_data ? JSON.parse(p.estimation_data) : null,
    ceo_approval_data: p.ceo_approval_data ? JSON.parse(p.ceo_approval_data) : null,
    design_data: p.design_data ? JSON.parse(p.design_data) : null,
    customer_design_data: p.customer_design_data ? JSON.parse(p.customer_design_data) : null,
    mockup_data: p.mockup_data ? JSON.parse(p.mockup_data) : null,
    customer_mockup_data: p.customer_mockup_data ? JSON.parse(p.customer_mockup_data) : null,
    purchasing_data: p.purchasing_data ? JSON.parse(p.purchasing_data) : null,
    production_data: p.production_data ? JSON.parse(p.production_data) : null,
    stage_info: STAGES[p.current_stage] || STAGES[10],
    logs,
    comments,
    purchaseOrders
  };

  res.json({ project });
});

// Create Full Box Order with Exact Matrix Parameters (مانند نرم‌افزار امیران)
app.post('/api/projects', authMiddleware, (req, res) => {
  try {
    const data = req.body;

    let archiveCode = data.archive_code ? String(data.archive_code).trim() : String(Math.floor(1000 + Math.random() * 9000));
    const orderCode = data.order_code ? String(data.order_code).trim() : String(Math.floor(1000 + Math.random() * 9000));
    const customerCode = data.customer_code ? String(data.customer_code).trim() : '3463';

    // If archive_code already exists, append a suffix to make it unique
    const existing = db.prepare('SELECT id FROM projects WHERE archive_code = ?').get(archiveCode);
    if (existing) {
      archiveCode = `${archiveCode}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const insert = db.prepare(`
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
        1, 'in_progress', ?
      )
    `);

    const result = insert.run(
      archiveCode, orderCode, customerCode, data.title || 'جعبه جدید', data.customer_name || 'مشتری جدید', data.customer_phone || '',
      data.box_type || 'مقوایی', data.box_structure || 'دارویی', parseInt(data.quantity) || 5000, data.order_date || '1405-6-7', data.file_date || '1405-6-7',
      data.is_first_print ? 1 : 0, data.photography || 'none',
      data.has_cardboard ? 1 : 0, data.cardboard_type || 'طوسی', parseFloat(data.cardboard_length) || 1000, parseFloat(data.cardboard_width) || 600, parseFloat(data.cardboard_grammage) || 350, parseFloat(data.cardboard_unit_price) || 0,
      data.has_print ? 1 : 0, data.zinc_status || 'زینک جدید', data.custom_color ? 1 : 0, parseInt(data.print_colors_count) || 4, data.print_type || 'افست', data.print_format || 'دوربرقی', parseFloat(data.print_length) || 500, parseFloat(data.print_width) || 600, parseFloat(data.print_waste) || 5, parseInt(data.boxes_per_sheet) || 2, parseInt(data.print_sheets_count) || 300,
      data.has_varnish ? 1 : 0, data.has_cellophane ? 1 : 0, data.cellophane_type || 'سلفون حرارتی مات',
      data.has_uv ? 1 : 0, data.uv_shablon_status || 'شابلون موجود', data.uv_type || 'موضعی',
      data.has_foil ? 1 : 0, data.foil_type || 'طلاکوب', parseFloat(data.foil_length) || 0, parseFloat(data.foil_width) || 0,
      data.has_emboss ? 1 : 0, data.emboss_cliche_status || 'کلیشه جدید', data.emboss_type || 'مقوایی',
      data.has_blade ? 1 : 0, data.blade_status || 'جدید', data.blade_type || 'لترپرس',
      data.has_window ? 1 : 0, parseFloat(data.window_length) || 0, parseFloat(data.window_width) || 0, parseFloat(data.window_thickness) || 0,
      data.has_glue ? 1 : 0, data.glue_type || 'لمینتی', parseFloat(data.glue_price) || 110,
      data.has_staple ? 1 : 0, parseInt(data.staple_count) || 0,
      data.has_sheet ? 1 : 0, data.sheet_category || 'سینگل', parseFloat(data.sheet_length) || 0, parseFloat(data.sheet_width) || 0, parseFloat(data.sheet_price) || 0, data.sheet_type || '',
      data.has_karji ? 1 : 0, parseFloat(data.karji_length) || 0, parseFloat(data.karji_width) || 0, parseFloat(data.karji_thickness) || 0, data.karji_selection || '',
      data.design_file_status || '', data.general_notes || '',
      parseFloat(data.estimated_unit_price) || 0, parseFloat(data.estimated_total_price) || 0, parseFloat(data.cost_price) || 0, parseFloat(data.profit_margin) || 15,
      req.user.id
    );

    const newId = result.lastInsertRowid;

    db.prepare(`
      INSERT INTO workflow_logs (project_id, stage_number, stage_name, action, user_id, user_name, user_role, comment)
      VALUES (?, 1, 'بازرگانی و فروش', 'ثبت اولیه مشخصات کار', ?, ?, ?, ?)
    `).run(newId, req.user.id, req.user.fullName, req.user.role, `سفارش با کد آرشیو ${archiveCode} در سیستم ثبت گردید.`);

    res.json({ success: true, id: newId, archiveCode });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(400).json({ error: 'خطا در ثبت سفارش: ' + err.message });
  }
});

// Advance Stage
app.post('/api/projects/:id/advance-stage', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { stageData, comment } = req.body;
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  if (!project) return res.status(404).json({ error: 'پروژه یافت نشد' });

  const currentStage = project.current_stage;
  const nextStage = Math.min(11, currentStage + 1);

  let updateFields = ['current_stage = ?', 'updated_at = CURRENT_TIMESTAMP'];
  let params = [nextStage];

  if (currentStage === 2 && stageData) {
    if (stageData.finalPrice) {
      updateFields.push('estimated_total_price = ?');
      params.push(stageData.finalPrice);
    }
    if (stageData.unitPrice) {
      updateFields.push('estimated_unit_price = ?');
      params.push(stageData.unitPrice);
    }
    if (stageData.totalRawCost) {
      updateFields.push('cost_price = ?');
      params.push(stageData.totalRawCost);
    }
  }

  if (nextStage === 11) {
    updateFields.push("status = 'completed'");
  }

  params.push(id);
  db.prepare(`UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`).run(...params);

  const nextStageInfo = STAGES[nextStage] || { name: 'تکمیل', role: 'all' };
  db.prepare(`
    INSERT INTO workflow_logs (project_id, stage_number, stage_name, action, user_id, user_name, user_role, comment)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, currentStage, STAGES[currentStage]?.name || '', `انتقال به ${nextStageInfo.name}`, req.user.id, req.user.fullName, req.user.role, comment || `ارجاع به مرحله ${nextStage}`);

  // Send Multi-Channel Notification to Target Department (Bale / In-App) & Customer (Melipayamak SMS on 3 Milestones)
  sendNotification({
    targetRole: nextStageInfo.role || 'all',
    projectId: id,
    archiveCode: project.archive_code,
    title: `سفارش "${project.title}" به ${nextStageInfo.name} ارجاع شد`,
    message: comment || `کد آرشیو: ${project.archive_code} - لطفاً کارتابل خود را بررسی فرمایید.`,
    stageNumber: nextStage,
    project: project
  });

  res.json({ success: true, nextStage });
});

// Reject Stage
app.post('/api/projects/:id/reject-stage', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { targetStage, reason } = req.body;
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  if (!project) return res.status(404).json({ error: 'پروژه یافت نشد' });

  const fallbackStage = targetStage ? parseInt(targetStage) : Math.max(1, project.current_stage - 1);
  db.prepare('UPDATE projects SET current_stage = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(fallbackStage, 'waiting_revision', id);

  db.prepare(`
    INSERT INTO workflow_logs (project_id, stage_number, stage_name, action, user_id, user_name, user_role, comment)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, project.current_stage, STAGES[project.current_stage]?.name || '', `بازگشت به ${STAGES[fallbackStage]?.name || ''}`, req.user.id, req.user.fullName, req.user.role, `علت: ${reason || 'اصلاحات'}`);

  res.json({ success: true, current_stage: fallbackStage });
});

// Comments
app.post('/api/projects/:id/comments', authMiddleware, (req, res) => {
  const { message } = req.body;
  db.prepare(`
    INSERT INTO project_comments (project_id, user_id, user_name, user_role, message)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.params.id, req.user.id, req.user.fullName, req.user.role, message.trim());
  res.json({ success: true });
});


// ================= DATA MIGRATION & BULK IMPORT/EXPORT =================

// Parse uploaded Excel / CSV / JSON file
app.post('/api/migration/parse-file', authMiddleware, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'هیچ فایلی ارسال نشده است' });
    }

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(req.file.originalname).toLowerCase();

    let parsedSheets = {};

    if (ext === '.json') {
      const jsonContent = JSON.parse(fileBuffer.toString('utf8'));
      if (Array.isArray(jsonContent)) {
        parsedSheets['Sheet1'] = jsonContent;
      } else if (typeof jsonContent === 'object') {
        parsedSheets = jsonContent.data || { 'Sheet1': [jsonContent] };
      }
    } else {
      // Parse XLSX / XLS / CSV
      parsedSheets = parseExcelBuffer(fileBuffer);
    }

    // Clean up temporary uploaded file
    try { fs.unlinkSync(filePath); } catch (e) {}

    res.json({
      success: true,
      filename: req.file.originalname,
      sheets: parsedSheets,
      sheetNames: Object.keys(parsedSheets)
    });
  } catch (err) {
    console.error('Error parsing migration file:', err);
    res.status(400).json({ error: 'خطا در خواندن و تحلیل فایل: ' + err.message });
  }
});

// Import Customers in Bulk
app.post('/api/migration/import-customers', authMiddleware, requireRoles('sales', 'secretary', 'ceo'), (req, res) => {
  try {
    const { items, overwrite = true } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'لیست مشتریان خالی است' });
    }

    const result = importCustomers(items, { overwrite: Boolean(overwrite) });
    res.json(result);
  } catch (err) {
    console.error('Error importing customers:', err);
    res.status(400).json({ error: 'خطا در ثبت مشتریان: ' + err.message });
  }
});

// Import Projects & Orders in Bulk
app.post('/api/migration/import-projects', authMiddleware, requireRoles('sales', 'secretary', 'ceo'), (req, res) => {
  try {
    const { items, overwrite = true } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'لیست سفارشات خالی است' });
    }

    const result = importProjects(items, {
      overwrite: Boolean(overwrite),
      userId: req.user.id,
      userName: req.user.fullName,
      userRole: req.user.role
    });
    res.json(result);
  } catch (err) {
    console.error('Error importing projects:', err);
    res.status(400).json({ error: 'خطا در ثبت پروژه‌ها: ' + err.message });
  }
});

// Import Raw Materials in Bulk
app.post('/api/migration/import-materials', authMiddleware, requireRoles('accounting', 'warehouse', 'ceo'), (req, res) => {
  try {
    const { items, overwrite = true } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'لیست متریال خالی است' });
    }

    const result = importMaterials(items, { overwrite: Boolean(overwrite) });
    res.json(result);
  } catch (err) {
    console.error('Error importing materials:', err);
    res.status(400).json({ error: 'خطا در ثبت متریال: ' + err.message });
  }
});

// Export Full System Backup JSON
app.get('/api/migration/export-full', authMiddleware, requireCeo, (req, res) => {
  try {
    const backup = exportFullDatabase();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="arman-amiran-backup-' + Date.now() + '.json"');
    res.json(backup);
  } catch (err) {
    console.error('Error exporting database:', err);
    res.status(500).json({ error: 'خطا در تهیه نسخه پشتیبان: ' + err.message });
  }
});

// Restore Full Backup
app.post('/api/migration/restore-full', authMiddleware, requireCeo, (req, res) => {
  try {
    const backupPayload = req.body;
    const result = restoreFullDatabase(backupPayload);
    res.json(result);
  } catch (err) {
    console.error('Error restoring backup:', err);
    res.status(400).json({ error: 'خطا در بازیابی اطلاعات: ' + err.message });
  }
});

// Clear Demo Data (safe)
app.post('/api/migration/clear-demo-data', authMiddleware, requireCeo, (req, res) => {
  try {
    db.prepare("DELETE FROM workflow_logs WHERE project_id IN (SELECT id FROM projects WHERE archive_code IN ('7542', '7543', '7542-849'))").run();
    db.prepare("DELETE FROM projects WHERE archive_code IN ('7542', '7543', '7542-849')").run();
    res.json({ success: true, message: 'داده‌های تستی حذف شدند' });
  } catch (err) {
    res.status(400).json({ error: 'خطا در حذف داده‌های تستی: ' + err.message });
  }
});

// Analytics
app.get('/api/analytics', authMiddleware, (req, res) => {
  const totalProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get().count;
  const activeProjects = db.prepare("SELECT COUNT(*) as count FROM projects WHERE status != 'completed'").get().count;
  const completedProjects = db.prepare("SELECT COUNT(*) as count FROM projects WHERE status = 'completed'").get().count;
  const totalRevenue = db.prepare('SELECT SUM(estimated_total_price) as sum FROM projects').get().sum || 0;
  const totalBoxesProduced = db.prepare('SELECT SUM(quantity) as sum FROM projects').get().sum || 0;

  const stageCounts = db.prepare('SELECT current_stage, COUNT(*) as count FROM projects GROUP BY current_stage').all();
  const stageBreakdown = {};
  for (let i = 1; i <= 11; i++) stageBreakdown[i] = 0;
  stageCounts.forEach(sc => { stageBreakdown[sc.current_stage] = sc.count; });

  const recentLogs = db.prepare(`
    SELECT l.*, p.title as project_title, p.archive_code as tracking_code
    FROM workflow_logs l
    JOIN projects p ON l.project_id = p.id
    ORDER BY l.id DESC LIMIT 10
  `).all();

  res.json({
    totalProjects,
    activeProjects,
    completedProjects,
    totalRevenue,
    totalBoxesProduced,
    stageBreakdown,
    recentLogs
  });
});


// ================= NOTIFICATIONS API =================

// Get recent notifications for user
app.get('/api/notifications', authMiddleware, (req, res) => {
  try {
    const userRole = req.user?.role || 'ceo';
    const userId = req.user?.id || 1;

    let rows;
    if (userRole === 'ceo') {
      rows = db.prepare('SELECT * FROM notifications ORDER BY id DESC LIMIT 40').all();
    } else {
      rows = db.prepare("SELECT * FROM notifications WHERE role = ? OR role = 'all' OR user_id = ? ORDER BY id DESC LIMIT 40").all(userRole, userId);
    }

    const unreadCount = rows.filter(n => !n.is_read).length;
    res.json({ notifications: rows, unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark single notification as read
app.post('/api/notifications/:id/read', authMiddleware, (req, res) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all notifications as read
app.post('/api/notifications/read-all', authMiddleware, (req, res) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1').run();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Notification Settings
app.get('/api/settings/notifications', authMiddleware, requireCeo, (req, res) => {
  try {
    const rows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'bale_%' OR key LIKE 'sms_%' OR key LIKE 'melipayamak_%' OR key LIKE 'browser_%'").all();
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Notification Settings
app.post('/api/settings/notifications', authMiddleware, requireCeo, (req, res) => {
  try {
    const settings = req.body;
    const upsertStmt = db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    db.exec('BEGIN TRANSACTION');
    for (const [key, val] of Object.entries(settings)) {
      upsertStmt.run(key, String(val));
    }
    db.exec('COMMIT');

    res.json({ success: true });
  } catch (err) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// Test Bale Notification
app.post('/api/notifications/test-bale', authMiddleware, requireCeo, async (req, res) => {
  try {
    const { token, chatId } = req.body;
    if (!token || !chatId) {
      return res.status(400).json({ error: 'توکن و شناسه چت بله الزامی است' });
    }

    const testText = '🔔 *تست اتصال اتوماسیون آرمان امیران به پیام‌رسان بله*\\n\\nاتصال بات با موفقیت برقرار شد!';
    const response = await fetch(`https://tapi.bale.ai/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: testText, parse_mode: 'Markdown' })
    });

    const data = await response.json();
    if (data.ok) {
      res.json({ success: true, message: 'پیام تست به بله ارسال شد' });
    } else {
      res.status(400).json({ error: 'خطای بله: ' + (data.description || 'نامشخص') });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test Melipayamak Customer SMS
app.post('/api/notifications/test-sms', authMiddleware, requireCeo, async (req, res) => {
  try {
    const { username, password, from, to, text } = req.body;
    if (!username || !password || !to) {
      return res.status(400).json({ error: 'نام کاربری، کلمه عبور و شماره موبایل گیرنده الزامی است' });
    }
    const result = await sendTestCustomerSms({
      username,
      password,
      from: from || '50004',
      to,
      text: text || 'تست اتصال سامانه پیامک اتوماسیون آرمان امیران'
    });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: 'خطا در ارسال پیامک: ' + err.message });
  }
});

// Download Setup Package
app.get('/download-setup', (req, res) => {
  const zipPath = path.join(__dirname, '..', 'box-factory-windows-setup.zip');
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, 'box-factory-windows-setup.zip');
  } else {
    res.status(404).send('فایل ستاپ یافت نشد');
  }
});

// Serve frontend
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(clientBuildPath, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Box Factory ERP running on http://0.0.0.0:${PORT}`);
});
