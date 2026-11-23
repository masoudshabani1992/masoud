import { db, initDb } from "../db";

initDb();

export interface Settings {
  siteName: string;
  tagline: string;
  logoUrl: string;
  logoDarkUrl: string;
  favicon: string;
  phone: string;
  customerPhone: string;
  email: string;
  address: string;
  instagram: string;
  telegram: string;
  whatsapp: string;
  aboutShort: string;
  aboutContent: string;
  footerText: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

function mapRow(row: any): Settings {
  return {
    siteName: row.site_name,
    tagline: row.tagline,
    logoUrl: row.logo_url,
    logoDarkUrl: row.logo_dark_url,
    favicon: row.favicon,
    phone: row.phone,
    customerPhone: row.customer_phone,
    email: row.email,
    address: row.address,
    instagram: row.instagram,
    telegram: row.telegram,
    whatsapp: row.whatsapp,
    aboutShort: row.about_short,
    aboutContent: row.about_content,
    footerText: row.footer_text,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    seoKeywords: row.seo_keywords,
  };
}

export function getSettings(): Settings {
  const row = db.prepare("SELECT * FROM settings WHERE id = 1").get();
  return mapRow(row);
}

export function updateSettings(input: Partial<Settings>): Settings {
  const current = getSettings();
  db.prepare(
    `UPDATE settings SET site_name=@siteName, tagline=@tagline, logo_url=@logoUrl, logo_dark_url=@logoDarkUrl, favicon=@favicon, phone=@phone, customer_phone=@customerPhone, email=@email, address=@address, instagram=@instagram, telegram=@telegram, whatsapp=@whatsapp, about_short=@aboutShort, about_content=@aboutContent, footer_text=@footerText, seo_title=@seoTitle, seo_description=@seoDescription, seo_keywords=@seoKeywords, updated_at=datetime('now')
     WHERE id = 1`
  ).run({
    siteName: input.siteName ?? current.siteName,
    tagline: input.tagline ?? current.tagline,
    logoUrl: input.logoUrl ?? current.logoUrl,
    logoDarkUrl: input.logoDarkUrl ?? current.logoDarkUrl,
    favicon: input.favicon ?? current.favicon,
    phone: input.phone ?? current.phone,
    customerPhone: input.customerPhone ?? current.customerPhone,
    email: input.email ?? current.email,
    address: input.address ?? current.address,
    instagram: input.instagram ?? current.instagram,
    telegram: input.telegram ?? current.telegram,
    whatsapp: input.whatsapp ?? current.whatsapp,
    aboutShort: input.aboutShort ?? current.aboutShort,
    aboutContent: input.aboutContent ?? current.aboutContent,
    footerText: input.footerText ?? current.footerText,
    seoTitle: input.seoTitle ?? current.seoTitle,
    seoDescription: input.seoDescription ?? current.seoDescription,
    seoKeywords: input.seoKeywords ?? current.seoKeywords,
  });
  return getSettings();
}
