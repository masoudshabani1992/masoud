/**
 * CLI Migration Tool for Box Factory ERP (Arman Amiran Packaging MIS)
 * Usage:
 *   node server/migrate-tool.js <path-to-excel-or-json-file> [customers|projects|materials]
 */

const fs = require('fs');
const path = require('path');
const {
  importCustomers,
  importProjects,
  importMaterials,
  restoreFullDatabase,
  parseExcelBuffer
} = require('./migration');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
======================================================================
  ابزار انتقال و ورود اطلاعات کارخانه چاپ و بسته‌بندی آرمان امیران
======================================================================
راهنمای استفاده:
  node server/migrate-tool.js <مسیر فایل اکسل یا جیسون> [نوع اطلاعات]

انواع اطلاعات:
  - projects   : آرشیو سفارشات و مشخصات فنی (پیش‌فرض)
  - customers  : لیست مشتریان و شرکت‌ها
  - materials  : تعرفه مواد اولیه و خدمات
  - auto       : تشخیص هوشمند بر اساس نام شیت یا ستون‌ها

مثال‌ها:
  node server/migrate-tool.js orders.xlsx projects
  node server/migrate-tool.js customers.xlsx customers
  node server/migrate-tool.js backup.json
======================================================================
`);
  process.exit(0);
}

const targetFilePath = path.resolve(args[0]);
const targetType = (args[1] || 'auto').toLowerCase();

if (!fs.existsSync(targetFilePath)) {
  console.error(`❌ فایل یافت نشد: ${targetFilePath}`);
  process.exit(1);
}

console.log(`📂 در حال خواندن فایل: ${targetFilePath}...`);

try {
  const ext = path.extname(targetFilePath).toLowerCase();
  const fileBuffer = fs.readFileSync(targetFilePath);

  if (ext === '.json') {
    const json = JSON.parse(fileBuffer.toString('utf8'));
    if (json.data) {
      console.log('🔄 در حال بازیابی نسخه پشتیبان کامل سیستم...');
      const res = restoreFullDatabase(json);
      console.log('✅ بازیابی با موفقیت انجام شد:');
      console.log(`   - مشتریان: ${res.restoredCustomers}`);
      console.log(`   - سفارشات: ${res.restoredProjects}`);
      console.log(`   - متریال: ${res.restoredMaterials}`);
    } else if (Array.isArray(json)) {
      if (targetType === 'customers') {
        const res = importCustomers(json, { overwrite: true });
        console.log(`✅ ${res.inserted} مشتری جدید ثبت و ${res.updated} رکورد به‌روزرسانی شد.`);
      } else {
        const res = importProjects(json, { overwrite: true });
        console.log(`✅ ${res.inserted} سفارش جدید ثبت و ${res.updated} رکورد به‌روزرسانی شد.`);
      }
    }
  } else {
    // Excel / CSV
    const sheets = parseExcelBuffer(fileBuffer);
    const sheetNames = Object.keys(sheets);
    console.log(`📊 شیت‌های شناسایی‌شده: ${sheetNames.join(', ')}`);

    sheetNames.forEach((sn) => {
      const rows = sheets[sn];
      if (!rows || rows.length === 0) return;

      console.log(`\n⏳ در حال پردازش شیت "${sn}" با ${rows.length} رکورد...`);

      // Determine type
      let type = targetType;
      if (type === 'auto') {
        const firstRow = rows[0] || {};
        const keys = Object.keys(firstRow).join(' ');
        if (keys.includes('کد مشتری') && !keys.includes('کد آرشیو') && !keys.includes('نوع مقوا')) {
          type = 'customers';
        } else if (keys.includes('قیمت واحد') && keys.includes('دسته‌بندی')) {
          type = 'materials';
        } else {
          type = 'projects';
        }
      }

      if (type === 'customers') {
        const res = importCustomers(rows, { overwrite: true });
        console.log(`✅ [مشتریان] ${res.inserted} جدید ثبت و ${res.updated} به‌روزرسانی شد.`);
      } else if (type === 'materials') {
        const res = importMaterials(rows, { overwrite: true });
        console.log(`✅ [متریال] ${res.inserted} جدید ثبت و ${res.updated} به‌روزرسانی شد.`);
      } else {
        const res = importProjects(rows, { overwrite: true });
        console.log(`✅ [سفارشات] ${res.inserted} جدید ثبت و ${res.updated} به‌روزرسانی شد.`);
      }
    });

    console.log('\n🎉 تمامی اطلاعات با موفقیت وارد پایگاه داده گردید!');
  }
} catch (err) {
  console.error('❌ خطا در عملیات انتقال:', err.message);
  process.exit(1);
}
