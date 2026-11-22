'use strict';
/** اسلایدهای نمونه صفحه اصلی */

const SLIDES = [
  {
    kicker: 'نماینده رسمی کیا در ایران',
    title: 'کیا را با خیال راحت از کوشا خودرو بخرید',
    subtitle:
      'از سال ۱۳۸۷ در کنار شما هستیم؛ واردات رسمی محصولات کیا، تأمین قطعات اصلی و شبکه گسترده خدمات پس از فروش در سراسر کشور.',
    image: 'hero-1.jpg',
    overlay: 62,
    align: 'right',
    btn1_label: 'مشاهده محصولات',
    btn1_url: '/products',
    btn2_label: 'بخشنامه‌ها و اطلاعیه‌ها',
    btn2_url: '/circulars',
  },
  {
    kicker: 'خدمات پس از فروش',
    title: 'سرویس دوره‌ای کیا در بیش از ۳۰ نمایندگی',
    subtitle:
      'قطعات اصلی از کره جنوبی، تکنسین‌های آموزش‌دیده و نوبت‌دهی آنلاین؛ خودروی شما همیشه در بهترین وضعیت می‌ماند.',
    image: 'hero-2.jpg',
    overlay: 58,
    align: 'right',
    btn1_label: 'یافتن نمایندگی نزدیک',
    btn1_url: '/dealers',
    btn2_label: 'تماس با پشتیبانی',
    btn2_url: '/contact',
  },
  {
    kicker: 'لیست قیمت عاملیت‌ها',
    title: 'قیمت شفاف برای نمایندگی‌ها در هر شهر',
    subtitle:
      'لیست قیمت سراسری و شهری با سهم عاملیت، قیمت مصرف‌کننده و زمان تحویل؛ آماده چاپ و قابل استعلام.',
    image: 'hero-3.jpg',
    overlay: 60,
    align: 'right',
    btn1_label: 'مشاهده لیست قیمت',
    btn1_url: '/prices',
    btn2_label: 'شبکه نمایندگی‌ها',
    btn2_url: '/dealers',
  },
];

function seedSlides() {
  const { run, get } = require('./db');
  if (get('SELECT id FROM slides LIMIT 1')) return;

  SLIDES.forEach((sl, i) => {
    const url = '/img/slides/' + sl.image;
    let m = get('SELECT id FROM media WHERE url = ?', [url]);
    let imageId = m ? m.id : null;
    if (!imageId) {
      const r = run(
        'INSERT INTO media (filename, original_name, url, mime, size, alt) VALUES (?,?,?,?,?,?)',
        [sl.image, sl.image, url, 'image/jpeg', 0, sl.title]
      );
      imageId = Number(r.lastInsertRowid);
    }
    run(
      `INSERT INTO slides (kicker, title, subtitle, image_id, overlay, align,
        btn1_label, btn1_url, btn2_label, btn2_url, active, sort)
       VALUES (?,?,?,?,?,?,?,?,?,?,1,?)`,
      [sl.kicker, sl.title, sl.subtitle, imageId, sl.overlay, sl.align,
        sl.btn1_label, sl.btn1_url, sl.btn2_label, sl.btn2_url, i]
    );
  });
}

module.exports = { seedSlides };
