/**
 * Arman Amiran Box Factory ERP - Cryptographic Offline Hardware Licensing System
 * Developed by: Masoud Shabani (مسعود شعبانی)
 *
 * Security Features:
 * 1. Hardware Fingerprinting (Windows Machine GUID + CPU + Motherboard UUID + MAC)
 * 2. Asymmetric RSA-2048 Cryptographic Digital Signatures (Cannot be forged without Private Key)
 * 3. Anti-Copy / Anti-Clone Protection (Machine-Locked)
 * 4. Anti-Clock-Tampering (Prevents rolling back Windows system clock)
 * 5. Full Offline Functionality (No Internet Connection Required)
 */

const crypto = require('crypto');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Public Key embedded for signature verification (Publicly safe to distribute)
const PUBLIC_KEY = "-----BEGIN PUBLIC KEY-----\n" +
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2dwzmFC3xX9xq0kQCl97\n" +
  "TZypS6ipW60scowLB0U3ocOQs+0zPmws9a8BbXbsF8jg/chD5zdN7j9dT6QtPt60\n" +
  "9k/YiPwoi3j+Wgb6JTn8xacX6Ak0Xfbt1561kmnBfWEj85uk+UIKjV4MAUwVKzGd\n" +
  "NqkKn2WMXqpW42zoNGlGG0t+omxce94WSPVe8Rc41WkC23Ca96AFJCHGzuds3fkT\n" +
  "IdYoFQ1A5b2veECM5lYYz1E3mX8nOppW8I7sPtK7cgfcqEW/fx9xYBb7XVirvhbX\n" +
  "TZ9F2OadvJSMPXJvAd+Vmlc7Tm07fnVmSGXGYELIpf6kbvRQDt742g+nFfzq9eKy\n" +
  "CwIDAQAB\n" +
  "-----END PUBLIC KEY-----\n";

const LICENSE_FILE_PATH = path.join(__dirname, 'license.lic');

/**
 * Generate unique Hardware Fingerprint (Hardware ID)
 */
function getHardwareFingerprint() {
  const parts = [];
  parts.push(os.arch());
  parts.push(os.cpus()[0]?.model || '');
  parts.push(os.cpus().length.toString());

  // MAC addresses of non-internal network adapters
  const nets = os.networkInterfaces();
  const macs = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (!net.internal && net.mac && net.mac !== '00:00:00:00:00:00') {
        macs.push(net.mac.toLowerCase());
      }
    }
  }
  macs.sort();
  parts.push(macs.join(','));

  // Platform specific deep hardware identification
  if (process.platform === 'win32') {
    try {
      const reg = execSync('reg query "HKLM\\SOFTWARE\\Microsoft\\Cryptography" /v MachineGuid', { encoding: 'utf8', timeout: 2500 });
      parts.push(reg.trim());
    } catch (e) {}

    try {
      const uuid = execSync('wmic csproduct get uuid', { encoding: 'utf8', timeout: 2500 });
      parts.push(uuid.trim());
    } catch (e) {}

    try {
      const cpu = execSync('wmic cpu get processorid', { encoding: 'utf8', timeout: 2500 });
      parts.push(cpu.trim());
    } catch (e) {}
  } else {
    // Linux / Container
    try {
      if (fs.existsSync('/etc/machine-id')) {
        parts.push(fs.readFileSync('/etc/machine-id', 'utf8').trim());
      } else if (fs.existsSync('/var/lib/dbus/machine-id')) {
        parts.push(fs.readFileSync('/var/lib/dbus/machine-id', 'utf8').trim());
      }
    } catch (e) {}
  }

  // Fallback if environment is completely sterile
  if (parts.filter(Boolean).length === 0) {
    parts.push(os.hostname());
  }

  const raw = parts.join('|||');
  const hash = crypto.createHash('sha256').update(raw).digest('hex').toUpperCase();

  const code = 'ARM-' + [
    hash.substring(0, 4),
    hash.substring(4, 8),
    hash.substring(8, 12),
    hash.substring(12, 16)
  ].join('-');

  return { code, hash };
}

/**
 * Initialize License Database Schema
 */
function initLicenseSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS license_store (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      license_key TEXT,
      hardware_id TEXT,
      company_name TEXT,
      issued_to TEXT,
      expiry_date TEXT,
      is_permanent INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 0,
      last_verified_at TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS license_audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      details TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
  `);
}

/**
 * Verify cryptographic license string
 */
function verifyLicenseString(licenseKeyString, currentHardwareCode, db = null) {
  if (!licenseKeyString || typeof licenseKeyString !== 'string') {
    return { valid: false, reason: 'کلید لایسنس وارد نشده است.' };
  }

  const cleanKey = licenseKeyString.trim();
  if (!cleanKey.startsWith('LIC1-') || !cleanKey.includes('.')) {
    return { valid: false, reason: 'ساختار کلید لایسنس نامعتبر است. فرمت صحیح: LIC1-...' };
  }

  try {
    const parts = cleanKey.split('.');
    if (parts.length !== 2) {
      return { valid: false, reason: 'فرمت رمزنگاری لایسنس مخدوش شده است.' };
    }

    const payloadBase64 = parts[0].replace(/^LIC1-/, '');
    const signatureBase64 = parts[1];

    // Cryptographic RSA-SHA256 signature verification
    const verifier = crypto.createVerify('sha256');
    verifier.update(payloadBase64);
    verifier.end();
    const isVerified = verifier.verify(PUBLIC_KEY, signatureBase64, 'base64url');

    if (!isVerified) {
      return { valid: false, reason: 'امضای دیجیتال لایسنس نامعتبر است یا لایسنس دستکاری شده است.' };
    }

    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson);

    // Validate Version
    if (payload.v !== 1) {
      return { valid: false, reason: 'نسخه ساختار لایسنس با این نسخه سامانه سازگار نیست.' };
    }

    // Validate Hardware Match
    const licenseHid = (payload.hid || '').trim().toUpperCase();
    const serverHid = (currentHardwareCode || '').trim().toUpperCase();

    if (licenseHid !== 'ANY' && licenseHid !== serverHid) {
      return {
        valid: false,
        reason: `این لایسنس مخصوص دستگاه دیگری (${licenseHid}) صادر شده است و بر روی این سرور (${serverHid}) قابل اجرا نیست.`
      };
    }

    // Validate Expiry Date
    const isPermanent = payload.expiry === 'PERMANENT' || payload.expiry === 'permanent';
    let daysRemaining = null;

    if (!isPermanent) {
      const expDate = new Date(payload.expiry);
      const now = new Date();

      if (isNaN(expDate.getTime())) {
        return { valid: false, reason: 'تاریخ انقضای لایسنس نامعتبر است.' };
      }

      const diffMs = expDate.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (daysRemaining < 0) {
        return {
          valid: false,
          reason: `مهلت استفاده از لایسنس در تاریخ ${payload.expiry} به پایان رسیده است. لطفاً جهت تمدید با مهندس مسعود شعبانی تماس بگیرید.`
        };
      }
    }

    // Anti-Clock-Tampering Check (if db is provided)
    if (db) {
      try {
        const lastRow = db.prepare('SELECT last_verified_at FROM license_store WHERE id = 1').get();
        if (lastRow && lastRow.last_verified_at) {
          const lastTime = new Date(lastRow.last_verified_at).getTime();
          const currentTime = Date.now();
          // If system clock was moved backwards by more than 1 hour (3600000 ms)
          if (currentTime < lastTime - 3600000) {
            return {
              valid: false,
              reason: 'تشخیص تغییر عمدی تاریخ ساعت ویندوز سرور (Clock Rollback Detected). جهت امنیت، سیستم قفل شد.'
            };
          }
        }
      } catch (e) {}
    }

    return {
      valid: true,
      payload,
      isPermanent,
      daysRemaining,
      rawKey: cleanKey
    };
  } catch (err) {
    return { valid: false, reason: 'خطا در اعتبارسنجی لایسنس: ' + err.message };
  }
}

let cachedLicenseStatus = null;
let lastLicenseCheckTime = 0;

/**
 * Get current system license status
 */
function getSystemLicenseStatus(db) {
  const now = Date.now();
  if (cachedLicenseStatus && (now - lastLicenseCheckTime < 15000)) {
    return cachedLicenseStatus;
  }

  try {
    initLicenseSchema(db);
  } catch (e) {}

  const hw = getHardwareFingerprint();

  // 1. Check SQLite license_store
  let stored = null;
  try {
    stored = db.prepare('SELECT * FROM license_store WHERE id = 1').get();
  } catch (e) {}

  let keyToVerify = stored?.license_key;

  // 2. Fallback check filesystem license.lic if db is empty
  if (!keyToVerify && fs.existsSync(LICENSE_FILE_PATH)) {
    try {
      keyToVerify = fs.readFileSync(LICENSE_FILE_PATH, 'utf8').trim();
    } catch (e) {}
  }

  if (!keyToVerify) {
    cachedLicenseStatus = {
      isActive: false,
      hardwareId: hw.code,
      license: null,
      errorReason: 'سامانه فاقد لایسنس فعال است. لطفاً کد شناسایی سخت‌افزار سرور را به توسعه‌دهنده نرم‌افزار ارائه فرمایید.'
    };
    lastLicenseCheckTime = now;
    return cachedLicenseStatus;
  }

  const result = verifyLicenseString(keyToVerify, hw.code, db);

  if (result.valid) {
    const nowIso = new Date().toISOString();
    // Update DB record safely
    try {
      db.prepare(`
        INSERT INTO license_store (id, license_key, hardware_id, company_name, issued_to, expiry_date, is_permanent, is_active, last_verified_at)
        VALUES (1, ?, ?, ?, ?, ?, ?, 1, ?)
        ON CONFLICT(id) DO UPDATE SET
          license_key = excluded.license_key,
          hardware_id = excluded.hardware_id,
          company_name = excluded.company_name,
          issued_to = excluded.issued_to,
          expiry_date = excluded.expiry_date,
          is_permanent = excluded.is_permanent,
          is_active = 1,
          last_verified_at = excluded.last_verified_at
      `).run(
        result.rawKey,
        hw.code,
        result.payload.company || 'صنایع چاپ و بسته‌بندی آرمان امیران',
        result.payload.issued_to || 'مدیریت کارخانه',
        result.payload.expiry || 'PERMANENT',
        result.isPermanent ? 1 : 0,
        nowIso
      );
    } catch (e) {}

    cachedLicenseStatus = {
      isActive: true,
      hardwareId: hw.code,
      license: {
        company: result.payload.company,
        issuedTo: result.payload.issued_to,
        developer: result.payload.developer || 'مهندس مسعود شعبانی',
        createdAt: result.payload.created_at,
        expiry: result.payload.expiry,
        isPermanent: result.isPermanent,
        daysRemaining: result.daysRemaining,
        maxUsers: result.payload.max_users || 100,
        type: result.payload.type || 'ENTERPRISE_UNLIMITED',
        modules: result.payload.modules || ['all']
      },
      errorReason: null
    };
    lastLicenseCheckTime = now;
    return cachedLicenseStatus;
  } else {
    // License exists but is invalid/expired
    try {
      db.prepare('UPDATE license_store SET is_active = 0 WHERE id = 1').run();
    } catch (e) {}

    cachedLicenseStatus = {
      isActive: false,
      hardwareId: hw.code,
      license: null,
      errorReason: result.reason
    };
    lastLicenseCheckTime = now;
    return cachedLicenseStatus;
  }
}

/**
 * Activate or update license with new key
 */
function activateLicense(db, licenseKeyString) {
  initLicenseSchema(db);
  const hw = getHardwareFingerprint();
  const result = verifyLicenseString(licenseKeyString, hw.code, db);

  if (!result.valid) {
    return { success: false, error: result.reason, hardwareId: hw.code };
  }

  const nowIso = new Date().toISOString();

  // Save to DB
  db.prepare(`
    INSERT INTO license_store (id, license_key, hardware_id, company_name, issued_to, expiry_date, is_permanent, is_active, last_verified_at)
    VALUES (1, ?, ?, ?, ?, ?, ?, 1, ?)
    ON CONFLICT(id) DO UPDATE SET
      license_key = excluded.license_key,
      hardware_id = excluded.hardware_id,
      company_name = excluded.company_name,
      issued_to = excluded.issued_to,
      expiry_date = excluded.expiry_date,
      is_permanent = excluded.is_permanent,
      is_active = 1,
      last_verified_at = excluded.last_verified_at
  `).run(
    result.rawKey,
    hw.code,
    result.payload.company,
    result.payload.issued_to,
    result.payload.expiry,
    result.isPermanent ? 1 : 0,
    nowIso
  );

  // Save to license.lic file on disk
  try {
    fs.writeFileSync(LICENSE_FILE_PATH, result.rawKey, 'utf8');
  } catch (e) {}

  // Log action
  try {
    db.prepare('INSERT INTO license_audit_log (action, details) VALUES (?, ?)').run(
      'LICENSE_ACTIVATED',
      `فعال‌سازی لایسنس برای: ${result.payload.company} - اعتبار: ${result.payload.expiry}`
    );
  } catch (e) {}

  return {
    success: true,
    license: {
      company: result.payload.company,
      issuedTo: result.payload.issued_to,
      developer: result.payload.developer || 'مهندس مسعود شعبانی',
      createdAt: result.payload.created_at,
      expiry: result.payload.expiry,
      isPermanent: result.isPermanent,
      daysRemaining: result.daysRemaining,
      maxUsers: result.payload.max_users || 100,
      type: result.payload.type || 'ENTERPRISE_UNLIMITED'
    }
  };
}

module.exports = {
  PUBLIC_KEY,
  getHardwareFingerprint,
  initLicenseSchema,
  verifyLicenseString,
  getSystemLicenseStatus,
  activateLicense
};
