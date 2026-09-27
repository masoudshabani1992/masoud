const db = require('./db');

// Helper to fetch settings from SQLite
function getSetting(k, defaultVal = '') {
  try {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(k);
    return row ? row.value : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

const STAGE_NAMES = {
  1: '۱. بازرگانی و تعریف سفارش',
  2: '۲. استعلام و برآورد قیمت روز',
  3: '۳. تایید پیش‌فاکتور توسط مشتری',
  4: '۴. تایید مدیر عامل',
  5: '۵. واحد طراحی و آتلیه',
  6: '۶. تایید طرح توسط مشتری',
  7: '۷. ساخت ماکت و نمونه فیزیکی',
  8: '۸. تایید ماکت توسط مشتری',
  9: '۹. خرید متریال توسط واحد خرید',
  10: '۱۰. ارجاع به خط تولید و چاپ',
  11: 'تکمیل و تحویل بار'
};

const ROLE_PERSIAN_NAMES = {
  sales: 'واحد بازرگانی',
  estimation: 'واحد برآورد قیمت',
  accounting: 'امور مالی و حسابداری',
  ceo: 'مدیریت عامل',
  design: 'استودیو طراحی و قالب',
  mockup: 'واحد ماکت‌سازی',
  procurement: 'واحد تدارکات و خرید',
  warehouse: 'انبار مرکزی',
  production: 'سرپرست تولید و چاپ',
  secretary: 'دبیرخانه',
  marketer: 'واحد بازاریابی',
  admin: 'مدیریت ارشد سیستم',
  all: 'کلیه پرسنل'
};

function getPersianDateString() {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date());
  } catch (e) {
    return new Date().toLocaleDateString('fa-IR');
  }
}

// Template Variable Formatter for Bale Messenger
function formatBaleTemplate(template, vars = {}) {
  const defaultTemplate = 
`📦 *اتوماسیون تولید آرمان امیران*

🔔 *{نام مرحله}*
📝 *کد آرشیو:* \`{کد آرشیو}\`
👤 *مشتری:* {نام مشتری}
📦 *عنوان سفارش:* {نام کار}
📊 *تیراژ:* {تیراژ}
👥 *واحد مسئول:* {واحد مسئول}

💬 *شرح اقدام:* {شرح اقدام}

⏰ *زمان ثبت:* {زمان} ({تاریخ})`;

  let text = (template && template.trim()) ? template : defaultTemplate;

  const replacements = {
    '{نام کار}': vars.title || '',
    '{title}': vars.title || '',
    '{کد آرشیو}': vars.archive_code || '---',
    '{archive_code}': vars.archive_code || '---',
    '{نام مشتری}': vars.customer_name || 'کارفرما',
    '{customer_name}': vars.customer_name || 'کارفرما',
    '{تیراژ}': vars.quantity || '---',
    '{quantity}': vars.quantity || '---',
    '{شماره مرحله}': vars.stage_number || '',
    '{stage_number}': vars.stage_number || '',
    '{نام مرحله}': vars.stage_name || '',
    '{stage_name}': vars.stage_name || '',
    '{واحد مسئول}': vars.target_role || '',
    '{target_role}': vars.target_role || '',
    '{شرح اقدام}': vars.message || '',
    '{message}': vars.message || '',
    '{زمان}': vars.time || '',
    '{time}': vars.time || '',
    '{تاریخ}': vars.date || '',
    '{date}': vars.date || '',
    '{نوع جعبه}': vars.box_type || '',
    '{box_type}': vars.box_type || '',
    '{ابعاد}': vars.dimensions || '',
    '{dimensions}': vars.dimensions || ''
  };

  for (const [key, val] of Object.entries(replacements)) {
    text = text.split(key).join(val);
  }
  return text;
}

// Send Notification across multi-channels
// - Personnel: Real-time In-App DB + Audio Chime + Bale Messenger Bot
// - Customers: Melipayamak SMS on 3 Critical Milestones (Price Approval, Design Approval, Production Entry)
async function sendNotification({
  targetRole = 'all',
  userId = null,
  projectId = null,
  archiveCode = '',
  title = '',
  message = '',
  stageNumber = 1,
  project = null
}) {
  try {
    // 1. Insert In-App Notification into SQLite
    const insertStmt = db.prepare(`
      INSERT INTO notifications (user_id, role, project_id, archive_code, title, message, stage_number, is_read)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `);
    insertStmt.run(userId, targetRole, projectId, archiveCode || '', title, message, stageNumber);

    // 2. Fetch Notification Channels Configuration
    const isBaleEnabled = getSetting('bale_enabled', 'false') === 'true';
    const baleBotToken = getSetting('bale_bot_token', '');
    const baleChatId = getSetting('bale_chat_id', '');

    const isSmsEnabled = getSetting('sms_enabled', 'false') === 'true';
    const melipayamakUsername = getSetting('melipayamak_username', '');
    const melipayamakPassword = getSetting('melipayamak_password', '');
    const melipayamakFrom = getSetting('melipayamak_from', '50004');

    // 3. CHANNEL 1: Dispatch to Bale Messenger (Configurable Stages & Customizable Templates)
    let activeBaleStages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const baleStagesSetting = getSetting('bale_stages', '');
    if (baleStagesSetting) {
      try {
        activeBaleStages = JSON.parse(baleStagesSetting);
      } catch (e) {
        activeBaleStages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      }
    }

    const isStageAllowedInBale = activeBaleStages.includes(Number(stageNumber));

    if (isBaleEnabled && baleBotToken && baleChatId && isStageAllowedInBale) {
      try {
        // Stage-specific template or General template
        const stageSpecificTemplate = getSetting(`bale_template_stage_${stageNumber}`, '');
        const generalTemplate = getSetting('bale_message_template', '');
        const chosenTemplate = stageSpecificTemplate || generalTemplate;

        const custName = project?.customer_name || 'کارفرما';
        const qty = project?.quantity ? `${Number(project.quantity).toLocaleString('fa-IR')} عدد` : '---';
        const dimStr = (project?.length_mm && project?.width_mm && project?.height_mm) 
          ? `${project.length_mm}×${project.width_mm}×${project.height_mm} mm`
          : (project?.dimensions || '');

        const baleText = formatBaleTemplate(chosenTemplate, {
          title: project?.title || title || 'سفارش بسته‌بندی',
          archive_code: archiveCode || project?.archive_code || project?.tracking_code || '---',
          customer_name: custName,
          quantity: qty,
          stage_number: String(stageNumber),
          stage_name: STAGE_NAMES[stageNumber] || `مرحله ${stageNumber}`,
          target_role: ROLE_PERSIAN_NAMES[targetRole] || targetRole,
          message: message || title,
          time: new Date().toLocaleTimeString('fa-IR'),
          date: getPersianDateString(),
          box_type: project?.box_type_name || project?.box_type || '',
          dimensions: dimStr
        });

        fetch(`https://tapi.bale.ai/bot${baleBotToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: baleChatId,
            text: baleText,
            parse_mode: 'Markdown'
          })
        }).catch(err => console.error('Bale notification network error:', err.message));
      } catch (err) {
        console.error('Error preparing Bale message:', err.message);
      }
    }

    // 4. CHANNEL 2: Dispatch Melipayamak SMS to Customer on 3 Key Milestones
    if (isSmsEnabled && melipayamakUsername && melipayamakPassword && project) {
      const customerPhone = project.customer_phone || '';
      const customerName = project.customer_name || 'کارفرمای گرامی';
      const jobTitle = project.title || 'سفارش بسته‌بندی';
      const cleanArchiveCode = archiveCode || project.archive_code || project.tracking_code || '';

      let customerSmsText = null;

      // MILESTONE 1: تایید پیش‌فاکتور و مالی (Stage 4 or 5)
      if (stageNumber === 4 || stageNumber === 5) {
        const customTemplate = getSetting('sms_template_price', '');
        customerSmsText = customTemplate || 
          `مشتری گرامی ${customerName}، پیش‌فاکتور سفارش "${jobTitle}" (کد آرشیو: ${cleanArchiveCode}) با موفقیت تایید شد و جهت آماده‌سازی خط تیغ و طراحی ارجاع گردید.\nصنایع چاپ و بسته‌بندی آرمان امیران`;
      }

      // MILESTONE 2: تایید طراحی و متون (Stage 7)
      else if (stageNumber === 7) {
        const customTemplate = getSetting('sms_template_design', '');
        customerSmsText = customTemplate ||
          `مشتری گرامی ${customerName}، طرح گرافیکی و خط تیغ سفارش "${jobTitle}" (کد: ${cleanArchiveCode}) تایید نهایی شد و فرآیند ساخت ماکت و تامین متریال آغاز گردید.\nصنایع بسته‌بندی آرمان امیران`;
      }

      // MILESTONE 3: ارسال به خط تولید و سالن چاپ (Stage 10)
      else if (stageNumber === 10) {
        const customTemplate = getSetting('sms_template_production', '');
        customerSmsText = customTemplate ||
          `مشتری گرامی ${customerName}، سفارش "${jobTitle}" (کد آرشیو: ${cleanArchiveCode}) وارد خط چاپ و سالن تولید گردید. زمان بارگیری و تحویل اطلاع‌رسانی خواهد شد.\nصنایع بسته‌بندی آرمان امیران`;
      }

      // Send SMS to Customer if milestone reached and valid phone exists
      if (customerSmsText && customerPhone && customerPhone.length >= 10) {
        try {
          fetch('https://rest.payamak-panel.com/api/SendSMS/SendSMS', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: melipayamakUsername,
              password: melipayamakPassword,
              to: customerPhone,
              from: melipayamakFrom,
              text: customerSmsText,
              isFlash: false
            })
          }).catch(err => console.error('Melipayamak Customer SMS network error:', err.message));
        } catch (err) {
          console.error('Error dispatching customer SMS:', err.message);
        }
      }
    }

    return { success: true };
  } catch (err) {
    console.error('Error in sendNotification:', err);
    return { success: false, error: err.message };
  }
}

// Send Direct Test Customer SMS
async function sendTestCustomerSms({ username, password, from, to, text }) {
  const response = await fetch('https://rest.payamak-panel.com/api/SendSMS/SendSMS', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      password,
      to,
      from,
      text,
      isFlash: false
    })
  });
  return response.json();
}

module.exports = {
  sendNotification,
  sendTestCustomerSms,
  getSetting,
  formatBaleTemplate,
  STAGE_NAMES,
  ROLE_PERSIAN_NAMES,
  getPersianDateString
};
