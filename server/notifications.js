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

    // 3. CHANNEL 1: Dispatch to Bale Messenger (for Factory Personnel)
    if (isBaleEnabled && baleBotToken && baleChatId) {
      try {
        const custName = project?.customer_name || 'کارفرما';
        const qty = project?.quantity ? `${Number(project.quantity).toLocaleString('fa-IR')} عدد` : '';

        const baleText = 
`📦 *اتوماسیون تولید آرمان امیران*

🔔 *${title}*
📝 *کد آرشیو:* \`${archiveCode || '---'}\`
👤 *مشتری:* ${custName}
📊 *تیراژ:* ${qty}
📂 *مرحله جدید:* ${stageNumber}
👥 *واحد مسئول:* ${targetRole}

💬 *شرح اقدام:* ${message}

⏰ *زمان:* ${new Date().toLocaleTimeString('fa-IR')}`;

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
      const cleanArchiveCode = archiveCode || project.archive_code || '';

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
  getSetting
};
