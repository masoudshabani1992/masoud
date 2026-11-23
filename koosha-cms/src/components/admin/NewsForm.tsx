"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "./ImageUploader";
import SeoFields from "./SeoFields";
import type { NewsItem } from "@/lib/models/news";

export default function NewsForm({ item }: { item?: NewsItem }) {
  const router = useRouter();
  const isEdit = !!item;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: item?.title || "",
    slug: item?.slug || "",
    type: item?.type || "NEWS",
    excerpt: item?.excerpt || "",
    content: item?.content || "",
    coverImage: item?.coverImage || "",
    sourceUrl: item?.sourceUrl || "",
    publishedAt: item?.publishedAt ? item.publishedAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
    isActive: item?.isActive ?? true,
    isFeatured: item?.isFeatured ?? false,
    seoTitle: item?.seoTitle || "",
    seoDescription: item?.seoDescription || "",
    seoKeywords: item?.seoKeywords || "",
    ogImage: item?.ogImage || "",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = isEdit ? `/api/admin/news/${item!.id}` : "/api/admin/news";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("خطا در ذخیره‌سازی");
      router.push("/admin/news");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="admin-card space-y-4">
          <div>
            <label className="admin-label">عنوان *</label>
            <input required className="admin-input" value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="admin-label">اسلاگ (آدرس URL)</label>
              <input className="admin-input" dir="ltr" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
            </div>
            <div>
              <label className="admin-label">تاریخ انتشار</label>
              <input type="date" className="admin-input" value={form.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="admin-label">خلاصه</label>
            <textarea rows={2} className="admin-input" value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
          </div>
          <div>
            <label className="admin-label">متن کامل *</label>
            <textarea required rows={10} className="admin-input" value={form.content} onChange={(e) => set("content", e.target.value)} />
            <p className="mt-1 text-xs text-ink/40">هر پاراگراف را با یک خط خالی از پاراگراف بعدی جدا کنید.</p>
          </div>
          <div>
            <label className="admin-label">لینک منبع (اختیاری)</label>
            <input className="admin-input" dir="ltr" value={form.sourceUrl} onChange={(e) => set("sourceUrl", e.target.value)} />
          </div>
        </div>

        <SeoFields
          value={{ seoTitle: form.seoTitle, seoDescription: form.seoDescription, seoKeywords: form.seoKeywords, ogImage: form.ogImage }}
          onChange={(v) => setForm((f) => ({ ...f, ...v }))}
        />
      </div>

      <div className="space-y-6">
        <div className="admin-card space-y-4">
          <div>
            <label className="admin-label">نوع محتوا</label>
            <select className="admin-input" value={form.type} onChange={(e) => set("type", e.target.value as any)}>
              <option value="NEWS">خبر</option>
              <option value="CIRCULAR">بخشنامه</option>
            </select>
          </div>
          <ImageUploader label="تصویر شاخص" value={form.coverImage} onChange={(url) => set("coverImage", url)} />
          <label className="flex items-center gap-2 text-sm font-bold text-ink">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
            نمایش در سایت
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-ink">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} />
            ویژه
          </label>
        </div>

        {error && <p className="text-sm font-bold text-red-600">{error}</p>}
        <button disabled={saving} className="admin-btn w-full">
          {saving ? "در حال ذخیره..." : isEdit ? "ذخیره تغییرات" : "انتشار"}
        </button>
      </div>
    </form>
  );
}
