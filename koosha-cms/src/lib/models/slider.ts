import { db, initDb } from "../db";
import { genId } from "../utils";

initDb();

export interface SliderItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  linkLabel: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function mapRow(row: any): SliderItem {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    imageUrl: row.image_url,
    linkUrl: row.link_url,
    linkLabel: row.link_label,
    sortOrder: row.sort_order,
    isActive: !!row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listSlides({ onlyActive = false }: { onlyActive?: boolean } = {}): SliderItem[] {
  const rows = onlyActive
    ? db.prepare("SELECT * FROM slider_items WHERE is_active = 1 ORDER BY sort_order ASC").all()
    : db.prepare("SELECT * FROM slider_items ORDER BY sort_order ASC").all();
  return rows.map(mapRow);
}

export function getSlideById(id: string): SliderItem | null {
  const row = db.prepare("SELECT * FROM slider_items WHERE id = ?").get(id);
  return row ? mapRow(row) : null;
}

export interface SlideInput {
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  linkLabel?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export function createSlide(input: SlideInput): SliderItem {
  const id = genId();
  db.prepare(
    `INSERT INTO slider_items (id, title, subtitle, image_url, link_url, link_label, sort_order, is_active)
     VALUES (@id, @title, @subtitle, @imageUrl, @linkUrl, @linkLabel, @sortOrder, @isActive)`
  ).run({
    id,
    title: input.title,
    subtitle: input.subtitle || "",
    imageUrl: input.imageUrl,
    linkUrl: input.linkUrl || "",
    linkLabel: input.linkLabel || "مشاهده بیشتر",
    sortOrder: input.sortOrder ?? 0,
    isActive: input.isActive === false ? 0 : 1,
  });
  return getSlideById(id)!;
}

export function updateSlide(id: string, input: Partial<SlideInput>): SliderItem | null {
  const current = getSlideById(id);
  if (!current) return null;
  db.prepare(
    `UPDATE slider_items SET title=@title, subtitle=@subtitle, image_url=@imageUrl, link_url=@linkUrl, link_label=@linkLabel, sort_order=@sortOrder, is_active=@isActive, updated_at=datetime('now')
     WHERE id=@id`
  ).run({
    id,
    title: input.title ?? current.title,
    subtitle: input.subtitle ?? current.subtitle,
    imageUrl: input.imageUrl ?? current.imageUrl,
    linkUrl: input.linkUrl ?? current.linkUrl,
    linkLabel: input.linkLabel ?? current.linkLabel,
    sortOrder: input.sortOrder ?? current.sortOrder,
    isActive: input.isActive === undefined ? (current.isActive ? 1 : 0) : input.isActive ? 1 : 0,
  });
  return getSlideById(id);
}

export function deleteSlide(id: string) {
  db.prepare("DELETE FROM slider_items WHERE id = ?").run(id);
}
