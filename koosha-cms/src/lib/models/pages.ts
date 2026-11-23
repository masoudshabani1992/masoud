import { db, initDb } from "../db";
import { genId, slugify } from "../utils";

initDb();

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  coverImage: string;
  showInMenu: boolean;
  menuOrder: number;
  isActive: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
  createdAt: string;
  updatedAt: string;
}

function mapRow(row: any): Page {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    content: row.content,
    coverImage: row.cover_image,
    showInMenu: !!row.show_in_menu,
    menuOrder: row.menu_order,
    isActive: !!row.is_active,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    seoKeywords: row.seo_keywords,
    ogImage: row.og_image,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listPages({ onlyActive = false }: { onlyActive?: boolean } = {}): Page[] {
  const rows = onlyActive
    ? db.prepare("SELECT * FROM pages WHERE is_active = 1 ORDER BY menu_order ASC").all()
    : db.prepare("SELECT * FROM pages ORDER BY menu_order ASC, created_at DESC").all();
  return rows.map(mapRow);
}

export function getPageBySlug(slug: string): Page | null {
  const row = db.prepare("SELECT * FROM pages WHERE slug = ?").get(slug);
  return row ? mapRow(row) : null;
}

export function getPageById(id: string): Page | null {
  const row = db.prepare("SELECT * FROM pages WHERE id = ?").get(id);
  return row ? mapRow(row) : null;
}

export interface PageInput {
  slug?: string;
  title: string;
  content?: string;
  coverImage?: string;
  showInMenu?: boolean;
  menuOrder?: number;
  isActive?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImage?: string;
}

export function createPage(input: PageInput): Page {
  const id = genId();
  let slug = slugify(input.slug || input.title);
  const existing = db.prepare("SELECT id FROM pages WHERE slug = ?").get(slug);
  if (existing) slug = `${slug}-${id.slice(0, 5)}`;
  db.prepare(
    `INSERT INTO pages (id, slug, title, content, cover_image, show_in_menu, menu_order, is_active, seo_title, seo_description, seo_keywords, og_image)
     VALUES (@id, @slug, @title, @content, @coverImage, @showInMenu, @menuOrder, @isActive, @seoTitle, @seoDescription, @seoKeywords, @ogImage)`
  ).run({
    id,
    slug,
    title: input.title,
    content: input.content || "",
    coverImage: input.coverImage || "",
    showInMenu: input.showInMenu ? 1 : 0,
    menuOrder: input.menuOrder ?? 0,
    isActive: input.isActive === false ? 0 : 1,
    seoTitle: input.seoTitle || "",
    seoDescription: input.seoDescription || "",
    seoKeywords: input.seoKeywords || "",
    ogImage: input.ogImage || "",
  });
  return getPageById(id)!;
}

export function updatePage(id: string, input: PageInput): Page | null {
  const current = getPageById(id);
  if (!current) return null;
  let slug = input.slug ? slugify(input.slug) : current.slug;
  if (slug !== current.slug) {
    const existing = db.prepare("SELECT id FROM pages WHERE slug = ? AND id != ?").get(slug, id);
    if (existing) slug = `${slug}-${id.slice(0, 5)}`;
  }
  db.prepare(
    `UPDATE pages SET slug=@slug, title=@title, content=@content, cover_image=@coverImage, show_in_menu=@showInMenu, menu_order=@menuOrder, is_active=@isActive, seo_title=@seoTitle, seo_description=@seoDescription, seo_keywords=@seoKeywords, og_image=@ogImage, updated_at=datetime('now')
     WHERE id=@id`
  ).run({
    id,
    slug,
    title: input.title ?? current.title,
    content: input.content ?? current.content,
    coverImage: input.coverImage ?? current.coverImage,
    showInMenu: input.showInMenu === undefined ? (current.showInMenu ? 1 : 0) : input.showInMenu ? 1 : 0,
    menuOrder: input.menuOrder ?? current.menuOrder,
    isActive: input.isActive === undefined ? (current.isActive ? 1 : 0) : input.isActive ? 1 : 0,
    seoTitle: input.seoTitle ?? current.seoTitle,
    seoDescription: input.seoDescription ?? current.seoDescription,
    seoKeywords: input.seoKeywords ?? current.seoKeywords,
    ogImage: input.ogImage ?? current.ogImage,
  });
  return getPageById(id);
}

export function deletePage(id: string) {
  db.prepare("DELETE FROM pages WHERE id = ?").run(id);
}
