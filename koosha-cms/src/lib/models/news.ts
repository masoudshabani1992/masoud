import { db, initDb } from "../db";
import { genId, slugify } from "../utils";

initDb();

export type NewsType = "NEWS" | "CIRCULAR";

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  type: NewsType;
  excerpt: string;
  content: string;
  coverImage: string;
  sourceUrl: string;
  publishedAt: string;
  isActive: boolean;
  isFeatured: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
  createdAt: string;
  updatedAt: string;
}

function mapRow(row: any): NewsItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type: row.type,
    excerpt: row.excerpt,
    content: row.content,
    coverImage: row.cover_image,
    sourceUrl: row.source_url,
    publishedAt: row.published_at,
    isActive: !!row.is_active,
    isFeatured: !!row.is_featured,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    seoKeywords: row.seo_keywords,
    ogImage: row.og_image,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listNews(
  { onlyActive = false, type }: { onlyActive?: boolean; type?: NewsType } = {}
): NewsItem[] {
  let query = "SELECT * FROM news_items WHERE 1=1";
  const params: any[] = [];
  if (onlyActive) query += " AND is_active = 1";
  if (type) {
    query += " AND type = ?";
    params.push(type);
  }
  query += " ORDER BY published_at DESC";
  const rows = db.prepare(query).all(...params);
  return rows.map(mapRow);
}

export function getNewsBySlug(slug: string): NewsItem | null {
  const row = db.prepare("SELECT * FROM news_items WHERE slug = ?").get(slug);
  return row ? mapRow(row) : null;
}

export function getNewsById(id: string): NewsItem | null {
  const row = db.prepare("SELECT * FROM news_items WHERE id = ?").get(id);
  return row ? mapRow(row) : null;
}

export interface NewsInput {
  slug?: string;
  title: string;
  type?: NewsType;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  sourceUrl?: string;
  publishedAt?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImage?: string;
}

export function createNews(input: NewsInput): NewsItem {
  const id = genId();
  let slug = slugify(input.slug || input.title);
  const existing = db.prepare("SELECT id FROM news_items WHERE slug = ?").get(slug);
  if (existing) slug = `${slug}-${id.slice(0, 5)}`;
  db.prepare(
    `INSERT INTO news_items (id, slug, title, type, excerpt, content, cover_image, source_url, published_at, is_active, is_featured, seo_title, seo_description, seo_keywords, og_image)
     VALUES (@id, @slug, @title, @type, @excerpt, @content, @coverImage, @sourceUrl, @publishedAt, @isActive, @isFeatured, @seoTitle, @seoDescription, @seoKeywords, @ogImage)`
  ).run({
    id,
    slug,
    title: input.title,
    type: input.type || "NEWS",
    excerpt: input.excerpt || "",
    content: input.content || "",
    coverImage: input.coverImage || "",
    sourceUrl: input.sourceUrl || "",
    publishedAt: input.publishedAt || new Date().toISOString(),
    isActive: input.isActive === false ? 0 : 1,
    isFeatured: input.isFeatured ? 1 : 0,
    seoTitle: input.seoTitle || "",
    seoDescription: input.seoDescription || "",
    seoKeywords: input.seoKeywords || "",
    ogImage: input.ogImage || "",
  });
  return getNewsById(id)!;
}

export function updateNews(id: string, input: NewsInput): NewsItem | null {
  const current = getNewsById(id);
  if (!current) return null;
  let slug = input.slug ? slugify(input.slug) : current.slug;
  if (slug !== current.slug) {
    const existing = db.prepare("SELECT id FROM news_items WHERE slug = ? AND id != ?").get(slug, id);
    if (existing) slug = `${slug}-${id.slice(0, 5)}`;
  }
  db.prepare(
    `UPDATE news_items SET slug=@slug, title=@title, type=@type, excerpt=@excerpt, content=@content, cover_image=@coverImage, source_url=@sourceUrl, published_at=@publishedAt, is_active=@isActive, is_featured=@isFeatured, seo_title=@seoTitle, seo_description=@seoDescription, seo_keywords=@seoKeywords, og_image=@ogImage, updated_at=datetime('now')
     WHERE id=@id`
  ).run({
    id,
    slug,
    title: input.title ?? current.title,
    type: input.type ?? current.type,
    excerpt: input.excerpt ?? current.excerpt,
    content: input.content ?? current.content,
    coverImage: input.coverImage ?? current.coverImage,
    sourceUrl: input.sourceUrl ?? current.sourceUrl,
    publishedAt: input.publishedAt ?? current.publishedAt,
    isActive: input.isActive === undefined ? (current.isActive ? 1 : 0) : input.isActive ? 1 : 0,
    isFeatured: input.isFeatured === undefined ? (current.isFeatured ? 1 : 0) : input.isFeatured ? 1 : 0,
    seoTitle: input.seoTitle ?? current.seoTitle,
    seoDescription: input.seoDescription ?? current.seoDescription,
    seoKeywords: input.seoKeywords ?? current.seoKeywords,
    ogImage: input.ogImage ?? current.ogImage,
  });
  return getNewsById(id);
}

export function deleteNews(id: string) {
  db.prepare("DELETE FROM news_items WHERE id = ?").run(id);
}
