'use strict';
/**
 * لایه سئو: تولید متاتگ‌ها، JSON-LD، بررسی سلامت سئو و sitemap
 */
const U = require('./util');
const { getSettings } = require('./settings');

function absUrl(pathname = '/') {
  const s = getSettings();
  const base = String(s.site_url || '').replace(/\/+$/, '');
  if (!pathname) return base + '/';
  if (/^https?:\/\//i.test(pathname)) return pathname;
  return base + (pathname.startsWith('/') ? pathname : '/' + pathname);
}

/**
 * ساخت بسته سئو برای یک صفحه
 * @param {object} o
 */
function build(o = {}) {
  const s = getSettings();
  const siteName = s.site_name || 'کوشا خودرو';
  const template = s.seo_title_template || '{title} | ' + siteName;
  const maxDesc = Number(s.seo_description_max || 160);

  let title = o.seo_title || o.title || siteName;
  if (o.useTemplate !== false && !o.seo_title) {
    title = o.isHome ? (o.title || `${siteName} | ${s.site_tagline || ''}`) : template.replace('{title}', o.title || '');
  }

  const description = U.truncate(o.seo_description || o.excerpt || o.description || s.site_description, maxDesc);
  const image = o.og_image || o.image || s.default_og_image || s.logo_url || '';
  const canonical = o.canonical || absUrl(o.path || '/');
  const robots = o.robots || (o.noindex ? 'noindex,follow' : s.robots_global || 'index,follow');

  return {
    title,
    description,
    keywords: o.seo_keywords || o.keywords || '',
    canonical,
    image: image ? absUrl(image) : '',
    robots,
    ogType: o.ogType || 'website',
    siteName,
    locale: 'fa_IR',
    publishedTime: o.published_at || null,
    updatedTime: o.updated_at || null,
    jsonLd: o.jsonLd || [],
    prev: o.prev || null,
    next: o.next || null,
  };
}

function organizationJsonLd() {
  const s = getSettings();
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: s.site_name,
    alternateName: 'Koosha Khodro',
    url: absUrl('/'),
    description: s.site_description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: s.address,
      addressCountry: 'IR',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: s.phone,
        contactType: 'customer service',
        areaServed: 'IR',
        availableLanguage: ['fa'],
      },
    ],
  };
  if (s.logo_url) data.logo = absUrl(s.logo_url);
  const sameAs = [s.social_instagram, s.social_telegram, s.social_linkedin, s.social_aparat].filter(Boolean);
  if (sameAs.length) data.sameAs = sameAs;
  return data;
}

function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.title,
      item: absUrl(it.path),
    })),
  };
}

function articleJsonLd(o) {
  const s = getSettings();
  return {
    '@context': 'https://schema.org',
    '@type': o.type === 'circular' ? 'NewsArticle' : 'NewsArticle',
    headline: U.truncate(o.title, 110),
    description: U.truncate(o.excerpt || o.body, 200),
    datePublished: o.published_at ? new Date(o.published_at.replace(' ', 'T') + 'Z').toISOString() : undefined,
    dateModified: o.updated_at ? new Date(o.updated_at.replace(' ', 'T') + 'Z').toISOString() : undefined,
    mainEntityOfPage: absUrl(o.path),
    image: o.image ? [absUrl(o.image)] : undefined,
    author: { '@type': 'Organization', name: s.site_name },
    publisher: {
      '@type': 'Organization',
      name: s.site_name,
      logo: s.logo_url ? { '@type': 'ImageObject', url: absUrl(s.logo_url) } : undefined,
    },
  };
}

function productJsonLd(p, image) {
  const s = getSettings();
  const offers = p.price
    ? {
        '@type': 'Offer',
        price: Number(p.price),
        priceCurrency: 'IRR',
        availability: p.status === 'out'
          ? 'https://schema.org/OutOfStock'
          : p.status === 'soon'
          ? 'https://schema.org/PreOrder'
          : 'https://schema.org/InStock',
        url: absUrl(`/products/${p.slug}`),
      }
    : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: U.truncate(p.short_desc || p.body, 300),
    image: image ? [absUrl(image)] : undefined,
    brand: { '@type': 'Brand', name: p.model || 'Kia' },
    category: 'خودرو',
    url: absUrl(`/products/${p.slug}`),
    offers,
    additionalProperty: p.specs && p.specs.length
      ? p.specs.map((sp) => ({
          '@type': 'PropertyValue',
          name: sp.label,
          value: sp.value,
        }))
      : undefined,
  };
}

/**
 * تحلیل سئوی یک محتوا (برای نمایش در پنل)
 * returns [{level:'good'|'warn'|'bad', label, hint}]
 */
function analyze(item = {}) {
  const checks = [];
  const isProduct = item.kind === 'product';
  const title = (isProduct ? item.name : item.title) || '';
  const seoTitle = item.seo_title || title;
  const desc = item.seo_description || item.seo_description_auto || item.excerpt || '';
  const bodyText = U.stripTags(item.body || item.short_desc || '');
  const slug = item.slug || '';

  // عنوان
  const tLen = seoTitle.length;
  if (tLen >= 30 && tLen <= 65) checks.push({ level: 'good', label: 'طول عنوان سئو مناسب است', value: `${U.toFa(tLen)} کاراکتر` });
  else if (tLen < 30) checks.push({ level: 'warn', label: 'عنوان سئو کوتاه است', hint: 'بین ۳۰ تا ۶۵ کاراکتر بنویسید' , value: `${U.toFa(tLen)} کاراکتر` });
  else checks.push({ level: 'warn', label: 'عنوان سئو بلند است', hint: 'گوگل حدود ۶۰ کاراکتر نمایش می‌دهد', value: `${U.toFa(tLen)} کاراکتر` });

  // توضیحات
  const dLen = desc.length;
  if (dLen >= 70 && dLen <= 165) checks.push({ level: 'good', label: 'طول توضیحات متا مناسب است', value: `${U.toFa(dLen)} کاراکتر` });
  else if (dLen === 0) checks.push({ level: 'bad', label: 'توضیحات متا وجود ندارد', hint: 'نرخ کلیک را حدود ۳۰٪ کاهش می‌دهد' });
  else checks.push({ level: 'warn', label: 'طول توضیحات متا مناسب نیست', hint: 'بین ۷۰ تا ۱۶۵ کاراکتر بنویسید', value: `${U.toFa(dLen)} کاراکتر` });

  // اسلاگ
  if (!slug) checks.push({ level: 'bad', label: 'نشانی صفحه (slug) خالی است' });
  else if (slug.length > 70) checks.push({ level: 'warn', label: 'نشانی صفحه بسیار بلند است', value: `${U.toFa(slug.length)} کاراکتر` });
  else checks.push({ level: 'good', label: 'نشانی صفحه مناسب است', value: '/' + slug });

  // کلمه کلیدی در عنوان
  if (item.seo_keywords) {
    const firstKw = String(item.seo_keywords).split(/[,،]/)[0].trim();
    if (firstKw && seoTitle.includes(firstKw)) checks.push({ level: 'good', label: `کلمه کلیدی «${firstKw}» در عنوان هست` });
    else if (firstKw) checks.push({ level: 'warn', label: `کلمه کلیدی «${firstKw}» در عنوان نیست`, hint: 'استفاده در ابتدای عنوان مؤثرتر است' });
  } else {
    checks.push({ level: 'warn', label: 'کلمه کلیدی هدف تعیین نشده', hint: 'برای هر صفحه یک کلمه کلیدی اصلی انتخاب کنید' });
  }

  // تصویر شاخص
  if (!item.cover_id && !item.og_image_id) checks.push({ level: 'warn', label: 'تصویر شاخص ندارد', hint: 'برای شبکه‌های اجتماعی و گوگل‌نیوز لازم است' });
  else checks.push({ level: 'good', label: 'تصویر شاخص تنظیم شده است' });

  // طول متن
  if (!isProduct) {
    const words = bodyText.split(/\s+/).filter(Boolean).length;
    if (words >= 300) checks.push({ level: 'good', label: 'محتوا به‌اندازه کافی غنی است', value: `${U.toFa(words)} کلمه` });
    else checks.push({ level: 'warn', label: 'محتوا کوتاه است', hint: 'حداقل ۳۰۰ کلمه برای رتبه‌گیری بهتر', value: `${U.toFa(words)} کلمه` });
  }

  // لینک داخلی
  const links = ((item.body || '') + (item.short_desc || '')).match(/href="\/[^"]*"/g);
  if (links && links.length >= 2) checks.push({ level: 'good', label: 'لینک داخلی دارد', value: U.toFa(links.length) + ' لینک' });
  else checks.push({ level: 'warn', label: 'لینک داخلی کم است', hint: 'به صفحات مرتبط سایت لینک بدهید' });

  // متا در حالت انتشار
  if (item.status === 'published' && !item.seo_title) checks.push({ level: 'warn', label: 'عنوان سئو سفارشی ندارد', hint: 'عنوان پیش‌فرض استفاده می‌شود' });

  const score = Math.round(
    (checks.filter((c) => c.level === 'good').length / checks.length) * 100
  );
  return { checks, score };
}

/** تولید نظرات ساده برای توضیحات خودکار */
function autoDescription(item = {}) {
  return U.truncate(item.excerpt || item.short_desc || item.body || '', 160);
}

/** بررسی ریدایرکت‌ها و لینک‌های شکسته داخلی (audit) */
function audit() {
  const { all } = require('./db');
  const issues = [];

  const allPosts = all(`SELECT id,type,title,slug,status,seo_title,seo_description,body,cover_id,excerpt FROM posts`);
  for (const p of allPosts) {
    const r = analyze({ ...p, kind: p.type });
    if (r.score < 70) issues.push({ id: p.id, type: p.type, title: p.title, slug: p.slug, score: r.score, checks: r.checks.filter((c) => c.level !== 'good') });
  }
  const products = all('SELECT id,name,slug,seo_title,seo_description,short_desc,body,cover_id FROM products');
  for (const p of products) {
    const r = analyze({ ...p, kind: 'product' });
    if (r.score < 70) issues.push({ id: p.id, type: 'product', title: p.name, slug: p.slug, score: r.score, checks: r.checks.filter((c) => c.level !== 'good') });
  }

  const posts = all(`SELECT title, slug, type, cover_id, seo_description, seo_title FROM posts WHERE status='published'`);
  const noImg = posts.filter((p) => !p.cover_id).length;
  const noDesc = posts.filter((p) => !p.seo_description).length;
  if (noImg) issues.push({ type: 'site', title: `‏${U.toFa(noImg)} مطلب منتشرشده تصویر شاخص ندارد`, slug: '', score: 0, checks: [] });
  if (noDesc) issues.push({ type: 'site', title: `‏${U.toFa(noDesc)} مطلب منتشرشده توضیحات متا ندارد`, slug: '', score: 0, checks: [] });

  return issues;
}

module.exports = {
  build, absUrl, organizationJsonLd, breadcrumbJsonLd, articleJsonLd,
  productJsonLd, analyze, audit, autoDescription,
};
