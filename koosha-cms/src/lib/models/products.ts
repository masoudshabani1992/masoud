import { db, initDb } from "../db";
import { genId, safeJsonParse, slugify } from "../utils";

initDb();

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: string;
  summary: string;
  description: string;
  specs: ProductSpec[];
  imageUrl: string;
  gallery: string[];
  catalogUrl: string;
  priceLabel: string;
  badge: string;
  sortOrder: number;
  isActive: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
  createdAt: string;
  updatedAt: string;
}

function mapRow(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    subtitle: row.subtitle,
    category: row.category,
    summary: row.summary,
    description: row.description,
    specs: safeJsonParse<ProductSpec[]>(row.specs, []),
    imageUrl: row.image_url,
    gallery: safeJsonParse<string[]>(row.gallery, []),
    catalogUrl: row.catalog_url,
    priceLabel: row.price_label,
    badge: row.badge,
    sortOrder: row.sort_order,
    isActive: !!row.is_active,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    seoKeywords: row.seo_keywords,
    ogImage: row.og_image,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listProducts({ onlyActive = false }: { onlyActive?: boolean } = {}): Product[] {
  const rows = onlyActive
    ? db.prepare("SELECT * FROM products WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC").all()
    : db.prepare("SELECT * FROM products ORDER BY sort_order ASC, created_at DESC").all();
  return rows.map(mapRow);
}

export function getProductBySlug(slug: string): Product | null {
  const row = db.prepare("SELECT * FROM products WHERE slug = ?").get(slug);
  return row ? mapRow(row) : null;
}

export function getProductById(id: string): Product | null {
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
  return row ? mapRow(row) : null;
}

export interface ProductInput {
  slug?: string;
  name: string;
  subtitle?: string;
  category?: string;
  summary?: string;
  description?: string;
  specs?: ProductSpec[];
  imageUrl?: string;
  gallery?: string[];
  catalogUrl?: string;
  priceLabel?: string;
  badge?: string;
  sortOrder?: number;
  isActive?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImage?: string;
}

export function createProduct(input: ProductInput): Product {
  const id = genId();
  let slug = slugify(input.slug || input.name);
  const existing = db.prepare("SELECT id FROM products WHERE slug = ?").get(slug);
  if (existing) slug = `${slug}-${id.slice(0, 5)}`;
  db.prepare(
    `INSERT INTO products (id, slug, name, subtitle, category, summary, description, specs, image_url, gallery, catalog_url, price_label, badge, sort_order, is_active, seo_title, seo_description, seo_keywords, og_image)
     VALUES (@id, @slug, @name, @subtitle, @category, @summary, @description, @specs, @imageUrl, @gallery, @catalogUrl, @priceLabel, @badge, @sortOrder, @isActive, @seoTitle, @seoDescription, @seoKeywords, @ogImage)`
  ).run({
    id,
    slug,
    name: input.name,
    subtitle: input.subtitle || "",
    category: input.category || "",
    summary: input.summary || "",
    description: input.description || "",
    specs: JSON.stringify(input.specs || []),
    imageUrl: input.imageUrl || "",
    gallery: JSON.stringify(input.gallery || []),
    catalogUrl: input.catalogUrl || "",
    priceLabel: input.priceLabel || "",
    badge: input.badge || "",
    sortOrder: input.sortOrder ?? 0,
    isActive: input.isActive === false ? 0 : 1,
    seoTitle: input.seoTitle || "",
    seoDescription: input.seoDescription || "",
    seoKeywords: input.seoKeywords || "",
    ogImage: input.ogImage || "",
  });
  return getProductById(id)!;
}

export function updateProduct(id: string, input: ProductInput): Product | null {
  const current = getProductById(id);
  if (!current) return null;
  let slug = input.slug ? slugify(input.slug) : current.slug;
  if (slug !== current.slug) {
    const existing = db.prepare("SELECT id FROM products WHERE slug = ? AND id != ?").get(slug, id);
    if (existing) slug = `${slug}-${id.slice(0, 5)}`;
  }
  db.prepare(
    `UPDATE products SET slug=@slug, name=@name, subtitle=@subtitle, category=@category, summary=@summary, description=@description, specs=@specs, image_url=@imageUrl, gallery=@gallery, catalog_url=@catalogUrl, price_label=@priceLabel, badge=@badge, sort_order=@sortOrder, is_active=@isActive, seo_title=@seoTitle, seo_description=@seoDescription, seo_keywords=@seoKeywords, og_image=@ogImage, updated_at=datetime('now')
     WHERE id=@id`
  ).run({
    id,
    slug,
    name: input.name ?? current.name,
    subtitle: input.subtitle ?? current.subtitle,
    category: input.category ?? current.category,
    summary: input.summary ?? current.summary,
    description: input.description ?? current.description,
    specs: JSON.stringify(input.specs ?? current.specs),
    imageUrl: input.imageUrl ?? current.imageUrl,
    gallery: JSON.stringify(input.gallery ?? current.gallery),
    catalogUrl: input.catalogUrl ?? current.catalogUrl,
    priceLabel: input.priceLabel ?? current.priceLabel,
    badge: input.badge ?? current.badge,
    sortOrder: input.sortOrder ?? current.sortOrder,
    isActive: input.isActive === undefined ? (current.isActive ? 1 : 0) : input.isActive ? 1 : 0,
    seoTitle: input.seoTitle ?? current.seoTitle,
    seoDescription: input.seoDescription ?? current.seoDescription,
    seoKeywords: input.seoKeywords ?? current.seoKeywords,
    ogImage: input.ogImage ?? current.ogImage,
  });
  return getProductById(id);
}

export function deleteProduct(id: string) {
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
}
