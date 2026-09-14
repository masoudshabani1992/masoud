const db = require('./db');

// Send Notification across multi-channels (In-App DB, Bale Messenger, Melipayamak SMS)
async function sendNotification({
  targetRole = 'all',
  userId = null,
  projectId = null,
  archiveCode = '',
  title = '',
  message = '',
  stageNumber = 1
}) {
  try {
    // 1. Insert into SQLite notifications table
    const insertStmt = db.prepare(`
      INSERT INTO notifications (user_id, role, project_id, archive_code, title, message, stage_number, is_read)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `);
    insertStmt.run(userId, targetRole, projectId, archiveCode || '', title, message, stageNumber);

    // 2. Fetch Notification Settings from settings table
    const getSetting = (k, defaultVal = '') => {
      try {
        const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(k);
        return row ? row.value : defaultVal;
      } catch (e) {
        return defaultVal;
      }
    };

    const isBaleEnabled = getSetting('bale_enabled', 'false') === 'true';
    const baleBotToken = getSetting('bale_bot_token', '');
    const baleChatId = getSetting('bale_chat_id', '');

    const isSmsEnabled = getSetting('sms_enabled', 'false') === 'true';
    const melipayamakUsername = getSetting('melipayamak_username', '');
    const melipayamakPassword = getSetting('melipayamak_password', '');
    const melipayamakFrom = getSetting('melipayamak_from', '50004');

    // 3. Dispatch to Bale Messenger if configured
    if (isBaleEnabled && baleBotToken && baleChatId) {
      try {
        const baleText = `📦 *اتوماسیون تولید آرمان امیران*\n\n🔔 *${title}*\n📝 کد آرشیو: \`${archiveCode}\`\n📂 مرحله: ${stageNumber}\n👤 واحد مسئول: ${targetRole}\n\n💬 ${message}\n\n⏰ ${new Date().toLocaleTimeString('fa-IR')}`;
        
        // Native fetch
        fetch(`https://tapi.bale.ai/bot${baleBotToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: baleChatId,
            text: baleText,
            parse_mode: 'Markdown'
          })
        }).catch(err => console.error('Bale notification error:', err.message));
      } catch (err) {
        console.error('Error preparing Bale notification:', err.message);
      }
    }

    // 4. Dispatch to Melipayamak SMS if configured
    if (isSmsEnabled && melipayamakUsername && melipayamakPassword) {
      try {
        // Find phone numbers of users with targetRole
        let phoneNumbers = [];
        if (targetRole === 'all') {
          const rows = db.prepare("SELECT phone FROM users WHERE phone IS NOT NULL AND phone != ''").all();
          phoneNumbers = rows.map(r => r.phone);
        } else {
          const rows = db.prepare("SELECT phone FROM users WHERE (role = ? OR role = 'ceo') AND phone IS NOT NULL AND phone != ''").all(targetRole);
          phoneNumbers = rows.map(r => r.phone);
        }

        if (phoneNumbers.length > 0) {
          const smsText = `شرکت آرمان امیران\n${title}\nکد آرشیو: ${archiveCode}\n${message}`;
          
          phoneNumbers.forEach(to => {
            fetch('https://rest.payamak-panel.com/api/SendSMS/SendSMS', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: melipayamakUsername,
                password: melipayamakPassword,
                to,
                from: melipayamakFrom,
                text: smsText,
                isFlash: false
              })
            }).catch(err => console.error('Melipayamak SMS send error:', err.message));
          });
        }
      } catch (err) {
        console.error('Error dispatching Melipayamak SMS:', err.message);
      }
    }

    return { success: true };
  } catch (err) {
    console.error('Error in sendNotification:', err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendNotification
};
