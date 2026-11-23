"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "./ImageUploader";
import type { SliderItem } from "@/lib/models/slider";

export default function SlideForm({ slide }: { slide?: SliderItem }) {
  const router = useRouter();
  const isEdit = !!slide;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: slide?.title || "",
    subtitle: slide?.subtitle || "",
    imageUrl: slide?.imageUrl || "",
    linkUrl: slide?.linkUrl || "",
    linkLabel: slide?.linkLabel || "مشاهده بیشتر",
    sortOrder: slide?.sortOrder ?? 0,
    isActive: slide?.isActive ?? true,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = isEdit ? `/api/admin/slider/${slide!.id}` : "/api/admin/slider";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("خطا در ذخیره‌سازی");
      router.push("/admin/slider");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="admin-card max-w-xl space-y-4">
      <ImageUploader label="تصویر اسلاید (حداقل 1600x900)" value={form.imageUrl} onChange={(url) => set("imageUrl", url)} />
      <div>
        <label className="admin-label">عنوان *</label>
        <input required className="admin-input" value={form.title} onChange={(e) => set("title", e.target.value)} />
      </div>
      <div>
        <label className="admin-label">توضیح کوتاه</label>
        <textarea rows={2} className="admin-input" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="admin-label">لینک دکمه</label>
          <input className="admin-input" dir="ltr" placeholder="/products/sportage-2026" value={form.linkUrl} onChange={(e) => set("linkUrl", e.target.value)} />
        </div>
        <div>
          <label className="admin-label">متن دکمه</label>
          <input className="admin-input" value={form.linkLabel} onChange={(e) => set("linkLabel", e.target.value)} />
        </div>
      </div>
      <div>
        <label className="admin-label">ترتیب نمایش</label>
        <input type="number" className="admin-input w-32" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} />
      </div>
      <label className="flex items-center gap-2 text-sm font-bold text-ink">
        <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
        نمایش در سایت
      </label>

      {error && <p className="text-sm font-bold text-red-600">{error}</p>}
      <button disabled={saving} className="admin-btn">
        {saving ? "در حال ذخیره..." : isEdit ? "ذخیره تغییرات" : "ایجاد اسلاید"}
      </button>
    </form>
  );
}
