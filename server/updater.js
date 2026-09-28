/**
 * In-App One-Click Live Auto-Updater for Box Factory ERP
 * Downloads latest update directly from GitHub repository and performs safe in-place upgrade
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const AdmZip = require('adm-zip');

const ROOT_DIR = path.resolve(__dirname, '..');
const BACKUP_BASE_DIR = path.join(ROOT_DIR, 'backups');
const UPDATES_TMP_DIR = path.join(ROOT_DIR, 'updates_tmp');

const GITHUB_ZIP_URL = 'https://github.com/masoudshabani1992/masoud/raw/arena/01a0454a-masoud/box-factory-windows-setup.zip';
const GITHUB_PKG_URL = 'https://raw.githubusercontent.com/masoudshabani1992/masoud/arena/01a0454a-masoud/package.json';

function getCurrentVersionInfo() {
  try {
    const pkgPath = path.join(ROOT_DIR, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      return {
        version: pkg.version || '2.8.7',
        build: 90,
        description: pkg.description || 'سامانه اتوماسیون کارخانه جعبه‌سازی'
      };
    }
  } catch (e) {}
  return { version: '2.8.7', build: 90 };
}

function fetchJsonUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'BoxFactory-Updater' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchJsonUrl(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }
      let rawData = '';
      res.on('data', chunk => { rawData += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(rawData));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('درخواست بررسی نسخه به پایان مهلت زمانی (Timeout) رسید.'));
    });
  });
}

function downloadFile(url, destPath, onProgress) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'BoxFactory-Updater' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadFile(res.headers.location, destPath, onProgress));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`دانلود با خطای سرور ${res.statusCode} مواجه شد.`));
      }

      const totalSize = parseInt(res.headers['content-length'] || '0', 10);
      let downloadedSize = 0;

      const fileStream = fs.createWriteStream(destPath);
      res.on('data', chunk => {
        downloadedSize += chunk.length;
        if (onProgress && totalSize > 0) {
          onProgress(Math.round((downloadedSize / totalSize) * 100), downloadedSize, totalSize);
        }
      });

      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve(destPath);
      });

      fileStream.on('error', err => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    });

    req.on('error', reject);
    req.setTimeout(60000, () => {
      req.destroy();
      reject(new Error('دانلود بسته آپدیت با مهلت زمانی مواجه شد.'));
    });
  });
}

async function checkForUpdates() {
  const current = getCurrentVersionInfo();
  try {
    const remotePkg = await fetchJsonUrl(GITHUB_PKG_URL).catch(() => null);
    const remoteVersion = remotePkg?.version || current.version;
    const updateAvailable = remoteVersion !== current.version;

    return {
      currentVersion: current.version,
      currentBuild: current.build,
      latestVersion: remoteVersion,
      updateAvailable,
      lastChecked: new Date().toISOString(),
      changelog: [
        '✨ سیستم احراز هویت بیومتریک با اثر انگشت (Touch ID) و تشخیص چهره (Face ID)',
        '🚀 سیستم به‌روزرسانی زنده و خودکار ۱-کلیکی بدون نیاز به دانلود و نصب دستی',
        '⚡ پکیج بهینه‌سازی شده برای استقرار روی سرورهای ویندوز شبکه داخلی',
        '📊 رفع کامل خطای ثبت استعلامات میدانی بازاریابی و انطباق با پایگاه داده'
      ]
    };
  } catch (err) {
    return {
      currentVersion: current.version,
      currentBuild: current.build,
      latestVersion: current.version,
      updateAvailable: false,
      notice: 'عدم دسترسی به گیت‌هاب؛ سامانه در حالت آفلاین به سر می‌برد.',
      changelog: []
    };
  }
}

function createSafetyBackup() {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
  const backupFolder = path.join(BACKUP_BASE_DIR, `backup-${dateStr}`);

  if (!fs.existsSync(backupFolder)) {
    fs.mkdirSync(backupFolder, { recursive: true });
  }

  // Backup factory.db
  const dbPath = path.join(ROOT_DIR, 'server', 'factory.db');
  if (fs.existsSync(dbPath)) {
    const destDb = path.join(backupFolder, 'factory.db');
    fs.copyFileSync(dbPath, destDb);
  }

  // Backup license.lic
  const licPath = path.join(ROOT_DIR, 'server', 'license.lic');
  if (fs.existsSync(licPath)) {
    const destLic = path.join(backupFolder, 'license.lic');
    fs.copyFileSync(licPath, destLic);
  }

  return { backupFolder, dateStr };
}

async function performLiveOneClickUpdate(onProgress) {
  // Step 1: Safety Backup
  if (onProgress) onProgress({ step: 1, percent: 15, message: 'در حال تهیه فایل پشتیبان امن از دیتابیس و لایسنس...' });
  const backupInfo = createSafetyBackup();

  // Step 2: Ensure temp directory
  if (!fs.existsSync(UPDATES_TMP_DIR)) {
    fs.mkdirSync(UPDATES_TMP_DIR, { recursive: true });
  }
  const zipPath = path.join(UPDATES_TMP_DIR, 'update_latest.zip');

  // Step 3: Download latest release ZIP from GitHub
  if (onProgress) onProgress({ step: 2, percent: 35, message: 'در حال دریافت بسته نصبی جدید از گیت‌هاب...' });
  
  let downloaded = false;
  // If running in local repository where box-factory-windows-setup.zip already exists, copy directly or download
  const localZipPath = path.join(ROOT_DIR, 'box-factory-windows-setup.zip');
  if (fs.existsSync(localZipPath)) {
    fs.copyFileSync(localZipPath, zipPath);
    downloaded = true;
  } else {
    try {
      await downloadFile(GITHUB_ZIP_URL, zipPath, (p) => {
        if (onProgress) onProgress({ step: 2, percent: 35 + Math.round(p * 0.35), message: `در حال دریافت فایل آپدیت (${p}%)...` });
      });
      downloaded = true;
    } catch (err) {
      // If offline or github raw failed, check local fallback
      if (fs.existsSync(localZipPath)) {
        fs.copyFileSync(localZipPath, zipPath);
        downloaded = true;
      } else {
        throw new Error('خطا در دریافت بسته به‌روزرسانی: ' + err.message);
      }
    }
  }

  // Step 4: Extract and In-Place Overwrite (Preserving DB, License & Storage)
  if (onProgress) onProgress({ step: 3, percent: 75, message: 'در حال استخراج و به‌روزرسانی فایل‌های رابط کاربری و سرور...' });
  
  const zip = new AdmZip(zipPath);
  const zipEntries = zip.getEntries();

  zipEntries.forEach(entry => {
    // STRICTLY PROTECT existing database, license, and user storage files
    if (
      entry.entryName.includes('factory.db') ||
      entry.entryName.includes('license.lic') ||
      entry.entryName.startsWith('storage/') ||
      entry.entryName.startsWith('Storage/')
    ) {
      return;
    }

    if (!entry.isDirectory) {
      const destPath = path.join(ROOT_DIR, entry.entryName);
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.writeFileSync(destPath, entry.getData());
    }
  });

  // Step 5: Re-run SQLite migrations
  if (onProgress) onProgress({ step: 4, percent: 95, message: 'در حال اعمال ساختارهای جدید دیتابیس...' });
  try {
    const { initDb } = require('./db');
    if (typeof initDb === 'function') {
      initDb();
    }
  } catch (e) {}

  // Cleanup temp zip
  try {
    fs.unlinkSync(zipPath);
  } catch (e) {}

  if (onProgress) onProgress({ step: 5, percent: 100, message: 'به‌روزرسانی با موفقیت تکمیل گردید!' });

  const finalVer = getCurrentVersionInfo();

  return {
    success: true,
    version: finalVer.version,
    build: finalVer.build,
    backupFolder: backupInfo.backupFolder,
    message: `سامانه با موفقیت به نسخه ${finalVer.version} ارتقا یافت.`
  };
}

module.exports = {
  checkForUpdates,
  performLiveOneClickUpdate,
  getCurrentVersionInfo,
  createSafetyBackup
};
