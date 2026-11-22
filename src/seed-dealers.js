'use strict';
/** محتوای نمونه: نمایندگی‌ها و لیست قیمت */

const CITIES = [
  { city: 'تهران', province: 'تهران' },
  { city: 'مشهد', province: 'خراسان رضوی' },
  { city: 'اصفهان', province: 'اصفهان' },
  { city: 'شیراز', province: 'فارس' },
  { city: 'تبریز', province: 'آذربایجان شرقی' },
  { city: 'اهواز', province: 'خوزستان' },
  { city: 'رشت', province: 'گیلان' },
  { city: 'کرمان', province: 'کرمان' },
  { city: 'آمل', province: 'مازندران' },
  { city: 'قم', province: 'قم' },
  { city: 'کرج', province: 'البرز' },
  { city: 'یزد', province: 'یزد' },
];

const DEALERS = [
  { name: 'نمایندگی مرکزی کوشا خودرو — تهران', city: 'تهران', type: 'both', code: 'THR-001', manager: 'علی رضایی', phone: '021-91009100', addr: 'تهران، خیابان ولیعصر، برج کوشا، طبقه همکف', services: ['فروش', 'خدمات پس از فروش', 'قطعات یدکی'], lat: 35.7448, lng: 51.4107 },
  { name: 'عاملیت کوشا خودرو — مشهد', city: 'مشهد', type: 'both', code: 'MHD-002', manager: 'حمید کریمی', phone: '051-38403000', addr: 'مشهد، بلوار وکیل‌آباد، نبش دانشجو ۱۷', services: ['فروش', 'خدمات پس از فروش', 'قطعات یدکی'], lat: 36.3106, lng: 59.5189 },
  { name: 'نمایندگی کوشا خودرو — اصفهان', city: 'اصفهان', type: 'dealer', code: 'ISF-003', manager: 'سعید محمدی', phone: '031-36688000', addr: 'اصفهان، خیابان هزار جریب، جنب دانشگاه', services: ['فروش', 'قطعات یدکی'], lat: 32.6300, lng: 51.6600 },
  { name: 'عاملیت کوشا خودرو — شیراز', city: 'شیراز', type: 'both', code: 'SHR-004', manager: 'مریم احمدی', phone: '071-36270000', addr: 'شیراز، بلوار زند، روبروی بیمارستان نمازی', services: ['فروش', 'خدمات پس از فروش'], lat: 29.6300, lng: 52.5300 },
  { name: 'نمایندگی کوشا خودرو — تبریز', city: 'تبریز', type: 'dealer', code: 'TBZ-005', manager: 'رضا صادقی', phone: '041-33440000', addr: 'تبریز، خیابان ابوریحان، نبش بازار', services: ['فروش'], lat: 38.0700, lng: 46.2900 },
  { name: 'عاملیت کوشا خودرو — اهواز', city: 'اهواز', type: 'agency', code: 'AHV-006', manager: 'نادر موسوی', phone: '061-32220000', addr: 'اهواز، کیانپارس، خیابان ۱۵ شرقی', services: ['خدمات پس از فروش', 'قطعات یدکی'], lat: 31.3200, lng: 48.6700 },
  { name: 'نمایندگی کوشا خودرو — رشت', city: 'رشت', type: 'dealer', code: 'RST-007', manager: 'فرزاد نیک‌پور', phone: '013-33220000', addr: 'رشت، خیابان مطهری، جنب پارک', services: ['فروش', 'خدمات پس از فروش'], lat: 37.2800, lng: 49.5900 },
  { name: 'عاملیت کوشا خودرو — کرمان', city: 'کرمان', type: 'both', code: 'KRM-008', manager: 'امیر باقری', phone: '034-32220000', addr: 'کرمان، بلوار جهاد، نبش کوچه ۱۲', services: ['فروش', 'خدمات پس از فروش', 'قطعات یدکی'], lat: 30.2839, lng: 57.0834 },
  { name: 'نمایندگی کوشا خودرو — آمل', city: 'آمل', type: 'dealer', code: 'AML-009', manager: 'حسین طاهری', phone: '011-43220000', addr: 'آمل، خیابان هراز، جنب میدان', services: ['فروش'], lat: 36.4700, lng: 52.3500 },
  { name: 'عاملیت کوشا خودرو — قم', city: 'قم', type: 'agency', code: 'QOM-010', manager: 'محمد جعفری', phone: '025-37220000', addr: 'قم، بلوار امین، کوی ۱۲', services: ['خدمات پس از فروش'], lat: 34.6400, lng: 50.8760 },
  { name: 'نمایندگی کوشا خودرو — کرج', city: 'کرج', type: 'dealer', code: 'KRJ-011', manager: 'بابک شریفی', phone: '026-34220000', addr: 'کرج، عظیمیه، بلوار اصلی', services: ['فروش', 'قطعات یدکی'], lat: 35.8300, lng: 50.9900 },
  { name: 'عاملیت کوشا خودرو — یزد', city: 'یزد', type: 'both', code: 'YZD-012', manager: 'مهدی دهقان', phone: '035-36220000', addr: 'یزد، بلوار جمهوری، نبش کوچه ۵', services: ['فروش', 'خدمات پس از فروش'], lat: 31.8970, lng: 54.3670 },
];

const slugify = (s) => s.replace(/\s+/g, '-').replace(/[«»]/g, '');

function seedDealers() {
  const { run, get, all } = require('./db');
  if (get('SELECT id FROM dealers LIMIT 1')) return;

  // نمایندگی‌ها
  const ids = {};
  DEALERS.forEach((d, i) => {
    const slug = slugify(d.name);
    const r = run(
      `INSERT INTO dealers (name, slug, code, type, city, province, address, phone, hours, lat, lng, manager, services, active, sort, seo_title, seo_description)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?,?)`,
      [d.name, slug, d.code, d.type, d.city, (CITIES.find((c) => c.city === d.city) || {}).province || '',
        d.addr, d.phone, 'شنبه تا چهارشنبه ۸:۳۰ تا ۱۷:۳۰ · پنجشنبه ۸:۳۰ تا ۱۳:۰۰', d.lat, d.lng, d.manager,
        JSON.stringify(d.services), i,
        `${d.name} | آدرس، تلفن و لیست قیمت`,
        `آدرس، شماره تماس، ساعات کاری و لیست قیمت محصولات کیا در ${d.name}.`]
    );
    ids[d.city] = { id: Number(r.lastInsertRowid), slug };
  });

  const products = all('SELECT id, name, slug, price FROM products ORDER BY sort, id');
  const priceOf = (slug) => (products.find((p) => p.slug === slug) || {}).price || null;

  const base = [
    { slug: 'kia-sportage-2025', year: '۲۰۲۵', color: 'سفید صدفی', public: 8762200000, delivery: '۲۰ روز کاری', stock: 4 },
    { slug: 'kia-k5-turbo', year: '۲۰۲۵', color: 'خاکستری متالیک', public: 7760600000, delivery: '۳۰ روز کاری', stock: 3 },
    { slug: 'kia-seltos-2023', year: '۲۰۲۳', color: 'آبی نفتی', public: 6480000000, delivery: '۴۵ روز کاری', stock: 2 },
    { slug: 'kia-sonet-2023', year: '۲۰۲۳', color: 'نقره‌ای', public: 5120000000, delivery: '۶۰ روز کاری', stock: 5 },
  ];

  function items(listId, discountPct, factor) {
    base.forEach((b, i) => {
      const prod = products.find((p) => p.slug === b.slug) || {};
      const pub = Math.round(b.public * (factor || 1));
      const disc = Math.round((pub * discountPct) / 100);
      run(
        `INSERT INTO price_items (price_list_id, product_id, label, model_year, color, base_price, dealer_discount, final_price, public_price, stock, delivery, note, sort)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [listId, prod.id || null, prod.name || b.slug, b.year, b.color, pub, disc, pub - disc, pub,
          b.stock, b.delivery, '', i]
      );
    });
  }

  function list(data) {
    const r = run(
      `INSERT INTO price_lists (title, slug, scope, city, dealer_id, customer_type, effective_from, effective_to, notes, status, seo_title, seo_description)
       VALUES (?,?,?,?,?,?,?,?,?,'published',?,?)`,
      [data.title, data.slug, data.scope, data.city || null, data.dealer_id || null, data.customer_type || 'dealer',
        data.from, data.to, data.notes || '', data.seo_title || data.title,
        data.seo_desc || `${data.title} — قیمت پایه، سهم عاملیت و قیمت پیشنهادی مصرف‌کننده محصولات کیا.`]
    );
    const id = Number(r.lastInsertRowid);
    items(id, data.discount, data.factor);
    return id;
  }

  // ۱) لیست عمومی (سطح کشور)
  list({
    title: 'لیست قیمت عمومی عاملیت‌ها و نمایندگی‌ها',
    slug: 'general-dealer-prices',
    scope: 'general',
    customer_type: 'dealer',
    discount: 4,
    from: '2026-11-01',
    to: '2026-12-20',
    notes: 'این لیست برای همه عاملیت‌ها و نمایندگی‌های سراسر کشور اعمال می‌شود. قیمت‌ها به تومان و شامل سهم عاملیت است.',
  });

  // ۲) لیست‌های شهری (نمونه: تهران و مشهد با شرایط حمل متفاوت)
  list({
    title: 'لیست قیمت نمایندگی‌های تهران',
    slug: 'price-list-tehran',
    scope: 'city',
    city: 'تهران',
    customer_type: 'dealer',
    discount: 4.5,
    factor: 1.01,
    from: '2026-11-05',
    to: '2026-12-20',
    notes: 'قیمت‌های تهران شامل هزینه حمل مرکز توزیع و با سهم عاملیت ۴.۵ درصد است.',
  });
  list({
    title: 'لیست قیمت نمایندگی‌های مشهد',
    slug: 'price-list-mashhad',
    scope: 'city',
    city: 'مشهد',
    customer_type: 'dealer',
    discount: 4,
    factor: 1.015,
    from: '2026-11-08',
    to: '2026-12-20',
    notes: 'قیمت‌های مشهد شامل هزینه حمل تا انبار عاملیت است.',
  });

  // ۳) لیست مخصوص یک عاملیت
  const tehran = ids['تهران'];
  if (tehran) {
    const lid = list({
      title: 'لیست قیمت اختصاصی — نمایندگی مرکزی تهران',
      slug: 'price-list-dealer-thr-001',
      scope: 'dealer',
      dealer_id: tehran.id,
      customer_type: 'dealer',
      discount: 5,
      from: '2026-11-10',
      to: '2026-12-20',
      notes: 'قیمت اختصاصی نمایندگی مرکزی تهران با سهم عاملیت ۵ درصد و اولویت تخصیص خودرو.',
    });
    run('UPDATE dealers SET price_list_id = ? WHERE id = ?', [lid, tehran.id]);
  }

  // اتصال لیست‌های شهری به نمایندگی‌های همان شهر
  all("SELECT id, city FROM price_lists WHERE scope = 'city'").forEach((cl) => {
    run('UPDATE dealers SET price_list_id = ? WHERE city = ? AND price_list_id IS NULL', [cl.id, cl.city]);
  });
  // سایر نمایندگی‌ها → لیست عمومی
  const general = get("SELECT id FROM price_lists WHERE scope = 'general' LIMIT 1");
  if (general) run('UPDATE dealers SET price_list_id = ? WHERE price_list_id IS NULL', [general.id]);
}

module.exports = { seedDealers, CITIES };
