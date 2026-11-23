"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "./ImageUploader";
import SeoFields from "./SeoFields";
import type { Page } from "@/lib/models/pages";

export default function PageForm({ page }: { page?: Page }) {
  const router = useRouter();
  const isEdit = !!page;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: page?.title || "",
    slug: page?.slug || "",
    content: page?.content || "",
    coverImage: page?.coverImage || "",
    showInMenu: page?.showInMenu ?? false,
    menuOrder: page?.menuOrder ?? 0,
    isActive: page?.isActive ?? true,
    seoTitle: page?.seoTitle || "",
    seoDescription: page?.seoDescription || "",
    seoKeywords: page?.seoKeywords || "",
    ogImage: page?.ogImage || "",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = isEdit ? `/api/admin/pages/${page!.id}` : "/api/admin/pages";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("خطا در ذخیره‌سازی");
      router.push("/admin/pages");
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="admin-label">عنوان صفحه *</label>
              <input required className="admin-input" value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div>
              <label className="admin-label">اسلاگ (آدرس URL)</label>
              <input className="admin-input" dir="ltr" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="admin-label">محتوای صفحه *</label>
            <textarea required rows={12} className="admin-input" value={form.content} onChange={(e) => set("content", e.target.value)} />
            <p className="mt-1 text-xs text-ink/40">هر پاراگراف را با یک خط خالی از پاراگراف بعدی جدا کنید.</p>
          </div>
        </div>

        <SeoFields
          value={{ seoTitle: form.seoTitle, seoDescription: form.seoDescription, seoKeywords: form.seoKeywords, ogImage: form.ogImage }}
          onChange={(v) => setForm((f) => ({ ...f, ...v }))}
        />
      </div>

      <div className="space-y-6">
        <div className="admin-card space-y-4">
          <ImageUploader label="تصویر کاور" value={form.coverImage} onChange={(url) => set("coverImage", url)} />
          <div>
            <label className="admin-label">ترتیب نمایش در منو</label>
            <input type="number" className="admin-input" value={form.menuOrder} onChange={(e) => set("menuOrder", Number(e.target.value))} />
          </div>
          <label className="flex items-center gap-2 text-sm font-bold text-ink">
            <input type="checkbox" checked={form.showInMenu} onChange={(e) => set("showInMenu", e.target.checked)} />
            نمایش در منوی سایت
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-ink">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
            فعال
          </label>
        </div>

        {error && <p className="text-sm font-bold text-red-600">{error}</p>}
        <button disabled={saving} className="admin-btn w-full">
          {saving ? "در حال ذخیره..." : isEdit ? "ذخیره تغییرات" : "ایجاد صفحه"}
        </button>
      </div>
    </form>
  );
}
