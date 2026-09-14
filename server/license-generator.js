#!/usr/bin/env node
/**
 * Master Offline License Key Generator (موتور صدور لایسنس اختصاصی)
 * DEVELOPER TOOL - FOR MASOUD SHABANI (مسعود شعبانی) ONLY
 * 
 * Generates mathematically unbreakable RSA-2048 cryptographically signed licenses
 * locked to specific Windows Server / Client Hardware IDs.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Developer RSA-2048 Master Private Key
let PRIVATE_KEY = '';
const privPath = path.join(__dirname, 'master-private.key');
if (fs.existsSync(privPath)) {
  PRIVATE_KEY = fs.readFileSync(privPath, 'utf8');
} else {
  // Fallback to embedded
  PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\n" +
    "MIIEugIBADANBgkqhkiG9w0BAQEFAASCBKQwggSgAgEAAoIBAQDZ3DOYULfFf3Gr\n" +
    "SRAKX3tNnKlLqKlbrSxyjAsHRTehw5Cz7TM+bCz1rwFtduwXyOD9yEPnN03uP11P\n" +
    "pC0+3rT2T9iI/CiLeP5aBvolOfzFpxfoCTRd9u3XnrWSacF9YSPzm6T5QgqNXgwB\n" +
    "TBUrMZ02qQqfZYxeqlbjbOg0aUYbS36ibFx73hZI9V7xFzjVaQLbcJr3oAUkIcbO\n" +
    "52zd+RMh1igVDUDlva94QIzmVhjPUTeZfyc6mlbwjuw+0rtyB9yoRb9/H3FgFvtd\n" +
    "WKu+FtdNn0XY5p28lIw9cm8B35WaVztObTt+dWZIZcZgQsil/qRu9FAO3vjaD6cV\n" +
    "/Or14rILAgMBAAECggEALjd/no1pHvW1WH/sbjbpQoK8i3dhTjiDmF1LLaSqc5+4\n" +
    "P+NPHqv2MbyJkf5LgZQ03sGwXgmmd6drlSygCJlYTHSN3CmaNFRbqR+Xy3PswsV6\n" +
    "1de2C0UKGdbqcAANcxq7dL+NFO/Eq07LPy8zwnEJCAJ+ZWg2ihKa0i5VaGD45WsP\n" +
    "ZBf8YlF69Idppt1hhw8RB9/gURezl5CvIxAzeE5+60zaPvPlkS1XAqPVL/tFtL72\n" +
    "ipMVOG/AHFKRCQ8y4bxx1ft2ieOT/Pxq/qP7RwMMKyhApQ7ijK/xTqNREEe6kmKm\n" +
    "iZ8F1QP0jg83Fbh8xNCxCLhCHSinpZRZJknyl0GUUQKBgQDsLtd3lMJGia/PM4X1\n" +
    "1Oj5Z8F4Cz08GwIF/GH6vB6TxDtKsnd+5gRNm07Gr5ovPzWnneU6EssqKkJBJXoO\n" +
    "P22skzAQT84qfNvDwB+iek3Nob59qqdcHOAtByN642Ley5s8Ewy6MWGXogSCnldG\n" +
    "DJHvG5QQnp+L/c4xJTKGCpAmAwKBgQDsI8o10taN2IcqKuxhwzD8rJU5s4HDI3Mw\n" +
    "d3+GfO0gq3qc8TF85Hlkg9O1YzGUPEJ25N4mwtmIEP1fxvFOL6/ePu6/wBSk6faN\n" +
    "70EjuYz9HBlsxXc4uD2NEaeLoY6Kd1v0ZmFOkl7Za+KY0/3EYmpoz5Yu822la/QA\n" +
    "P9+4EeUpWQKBgBfEYvRqqN42TtXYBnwFj+hBM6vj3aalxR9bFXUI5z7ReXH74aCI\n" +
    "fxhcL6I425gzkS+r6PxeFcnJdN9faRfz9BJwwV5y2XlXFTpupABStG+j/iphOPRB\n" +
    "B6IgXMaqCTIIZTe3Zwl5nKuIp1GJo5it/SWFrfG6NK3+vXgemSX5/CWHAoGAO2T1\n" +
    "I3yYgq0Hsk+BjUVvON6f2heQd+ievH4SEV2ytxjqijcQX32IGwQdZ+4/Ni3B+e2v\n" +
    "AsjXtiWv1TtQzn2oGppxqsFBcAl4/lJDbBzrnW5H5tf0GMwejzD1l2VXWPSUqHBn\n" +
    "4T9npABCynXnylGGuj4cZErONWFlyfpG5yF5JmECf2TnbRYJjP0CKff702kdvvJs\n" +
    "bQlCQl5DsUL95Tx8B/blY3HwbxJ3pYAGh7GdWgMYaovdUSpnbKpIfVCbaO+YHz6X\n" +
    "1vcvC4CpjjFkuZC/IVsoSId6M/kSjqaOqkw40MEiJm8AeyggXrflnnCZQdUnpbDK\n" +
    "nn7sRClT3uGn7/yQ7k+w=\n" +
    "-----END PRIVATE KEY-----\n";
}

function generateSignedLicenseKey({
  hardwareId,
  companyName = 'صنایع چاپ و بسته‌بندی آرمان امیران',
  issuedTo = 'مدیریت کارخانه',
  expiry = 'PERMANENT',
  maxUsers = 100,
  type = 'ENTERPRISE_UNLIMITED',
  modules = ['all']
}) {
  const cleanHid = (hardwareId || 'ANY').trim().toUpperCase();

  const payload = {
    v: 1,
    hid: cleanHid,
    company: companyName.trim(),
    issued_to: issuedTo.trim(),
    developer: 'مسعود شعبانی',
    created_at: new Date().toISOString().split('T')[0],
    expiry: expiry.trim().toUpperCase(),
    max_users: Number(maxUsers) || 100,
    type: type,
    modules: modules
  };

  const payloadJson = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(payloadJson, 'utf8').toString('base64url');

  // Sign with RSA-SHA256
  const signer = crypto.createSign('sha256');
  signer.update(payloadBase64);
  signer.end();
  const signature = signer.sign(PRIVATE_KEY, 'base64url');

  const licenseKey = `LIC1-${payloadBase64}.${signature}`;
  return { licenseKey, payload };
}

// CLI Mode
async function main() {
  const args = process.argv.slice(2);

  // Quick CLI Flag parsing
  if (args.includes('--hid') || args.includes('-h')) {
    const hidIdx = args.indexOf('--hid') !== -1 ? args.indexOf('--hid') : args.indexOf('-h');
    const hid = args[hidIdx + 1] || 'ANY';
    const company = args.includes('--company') ? args[args.indexOf('--company') + 1] : 'صنایع چاپ و بسته‌بندی آرمان امیران';
    const expiry = args.includes('--expiry') ? args[args.indexOf('--expiry') + 1] : 'PERMANENT';
    const out = args.includes('--out') ? args[args.indexOf('--out') + 1] : null;

    const res = generateSignedLicenseKey({ hardwareId: hid, companyName: company, expiry });
    console.log('\n================== لایسنس صادر گردید ==================');
    console.log('کد سخت‌افزار (Hardware ID):', res.payload.hid);
    console.log('مالک لایسنس:', res.payload.company);
    console.log('تاریخ اعتبار:', res.payload.expiry);
    console.log('کلید فعال‌سازی:\n');
    console.log(res.licenseKey);
    console.log('=======================================================\n');

    if (out) {
      fs.writeFileSync(out, res.licenseKey, 'utf8');
      console.log(`فایل لایسنس با موفقیت در مسیر "${out}" ذخیره شد.`);
    }
    return;
  }

  // Interactive Wizard
  console.log('================================================================');
  console.log('       سامانه صدور لایسنس سخت‌افزاری و ایمن آرمان امیران        ');
  console.log('       توسعه‌دهنده: مهندس مسعود شعبانی                       ');
  console.log('================================================================\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  try {
    const defaultHid = 'ANY';
    const inputHid = await question(`۱. کد سخت‌افزاری دستگاه مشتری (Hardware ID) [اینتر برای همگانی/ANY]: `);
    const hid = inputHid.trim() || defaultHid;

    const defaultCompany = 'صنایع چاپ و بسته‌بندی آرمان امیران';
    const inputCompany = await question(`۲. نام شرکت/مشتری [پیش‌فرض: ${defaultCompany}]: `);
    const company = inputCompany.trim() || defaultCompany;

    const defaultIssuedTo = 'مدیریت کارخانه';
    const inputIssuedTo = await question(`۳. نام تحویل‌گیرنده/مدیریت [پیش‌فرض: ${defaultIssuedTo}]: `);
    const issuedTo = inputIssuedTo.trim() || defaultIssuedTo;

    console.log('\nانتخاب نوع و مدت اعتبار لایسنس:');
    console.log('  1) لایسنس دائمی و نامحدود (Permanent - بدون تاریخ انقضا)');
    console.log('  2) لایسنس ۱ ساله (یک سال از امروز)');
    console.log('  3) لایسنس ۶ ماهه');
    console.log('  4) نسخه آزمایشی ۳۰ روزه (Trial)');
    console.log('  5) تاریخ انقضای دستی (فرمت: YYYY-MM-DD)');
    const expiryChoice = await question('گزینه مورد نظر (1 تا 5) [پیش‌فرض: 1]: ');

    let expiry = 'PERMANENT';
    const now = new Date();

    if (expiryChoice.trim() === '2') {
      const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      expiry = nextYear.toISOString().split('T')[0];
    } else if (expiryChoice.trim() === '3') {
      const next6M = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
      expiry = next6M.toISOString().split('T')[0];
    } else if (expiryChoice.trim() === '4') {
      const next30D = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
      expiry = next30D.toISOString().split('T')[0];
    } else if (expiryChoice.trim() === '5') {
      const customExp = await question('تاریخ انقضا را وارد نمایید (مثال: 2027-12-29): ');
      expiry = customExp.trim();
    }

    const { licenseKey, payload } = generateSignedLicenseKey({
      hardwareId: hid,
      companyName: company,
      issuedTo,
      expiry
    });

    console.log('\n================================================================');
    console.log('✅ لایسنس اختصاصی با امضای دیجیتال RSA-2048 با موفقیت صادر شد:');
    console.log('================================================================');
    console.log(`📌 شناسه سخت‌افزار (HID):   ${payload.hid}`);
    console.log(`🏢 شرکت مالک لایسنس:       ${payload.company}`);
    console.log(`👤 تحویل‌گیرنده:             ${payload.issued_to}`);
    console.log(`📅 تاریخ صدور:              ${payload.created_at}`);
    console.log(`⏳ مدت اعتبار:               ${payload.expiry === 'PERMANENT' ? 'دائمی و مادام‌العمر (Permanent)' : payload.expiry}`);
    console.log(`👨‍💻 برنامه‌نویس و پشتیبان:     ${payload.developer}`);
    console.log('----------------------------------------------------------------');
    console.log('🔑 رشته کلید لایسنس (جهت کپی و ارسال به مشتری):');
    console.log('\n' + licenseKey + '\n');
    console.log('----------------------------------------------------------------');

    // Save to license.lic
    const licPath = path.join(__dirname, 'license.lic');
    fs.writeFileSync(licPath, licenseKey, 'utf8');
    console.log(`💾 فایل لایسنس در مسیر زیر ذخیره گردید: ${licPath}`);
    console.log('================================================================\n');

  } finally {
    rl.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generateSignedLicenseKey
};
