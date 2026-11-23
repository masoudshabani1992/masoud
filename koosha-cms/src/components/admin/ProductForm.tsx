"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "./ImageUploader";
import GalleryEditor from "./GalleryEditor";
import SpecsEditor from "./SpecsEditor";
import SeoFields from "./SeoFields";
import type { Product } from "@/lib/models/products";

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const isEdit = !!product;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    subtitle: product?.subtitle || "",
    category: product?.category || "",
    summary: product?.summary || "",
    description: product?.description || "",
    specs: product?.specs || [],
    imageUrl: product?.imageUrl || "",
    gallery: product?.gallery || [],
    catalogUrl: product?.catalogUrl || "",
    priceLabel: product?.priceLabel || "",
    badge: product?.badge || "",
    sortOrder: product?.sortOrder ?? 0,
    isActive: product?.isActive ?? true,
    seoTitle: product?.seoTitle || "",
    seoDescription: product?.seoDescription || "",
    seoKeywords: product?.seoKeywords || "",
    ogImage: product?.ogImage || "",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("خطا در ذخیره‌سازی");
      router.push("/admin/products");
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
              <label className="admin-label">نام محصول *</label>
              <input required className="admin-input" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <label className="admin-label">اسلاگ (آدرس URL)</label>
              <input className="admin-input" dir="ltr" placeholder="sportage-2026" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="admin-label">زیرعنوان</label>
              <input className="admin-input" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
            </div>
            <div>
              <label className="admin-label">دسته‌بندی</label>
              <input className="admin-input" placeholder="شاسی‌بلند، سدان، الکتریکی، فروشگاه اکسسوری" value={form.category} onChange={(e) => set("category", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="admin-label">خلاصه (برای کارت محصول)</label>
            <textarea rows={2} className="admin-input" value={form.summary} onChange={(e) => set("summary", e.target.value)} />
          </div>
          <div>
            <label className="admin-label">معرفی کامل محصول</label>
            <textarea rows={8} className="admin-input" value={form.description} onChange={(e) => set("description", e.target.value)} />
            <p className="mt-1 text-xs text-ink/40">هر پاراگراف را با یک خط خالی از پاراگراف بعدی جدا کنید.</p>
          </div>
        </div>

        <div className="admin-card">
          <SpecsEditor value={form.specs} onChange={(v) => set("specs", v)} />
        </div>

        <div className="admin-card">
          <GalleryEditor label="گالری تصاویر محصول" value={form.gallery} onChange={(v) => set("gallery", v)} />
        </div>

        <SeoFields
          value={{ seoTitle: form.seoTitle, seoDescription: form.seoDescription, seoKeywords: form.seoKeywords, ogImage: form.ogImage }}
          onChange={(v) => setForm((f) => ({ ...f, ...v }))}
        />
      </div>

      <div className="space-y-6">
        <div className="admin-card space-y-4">
          <ImageUploader label="تصویر شاخص محصول" value={form.imageUrl} onChange={(url) => set("imageUrl", url)} />
          <ImageUploader label="کاتالوگ محصول (PDF)" value={form.catalogUrl} onChange={(url) => set("catalogUrl", url)} accept="application/pdf,image/*" />
          <div>
            <label className="admin-label">برچسب (مثلاً: جدید)</label>
            <input className="admin-input" value={form.badge} onChange={(e) => set("badge", e.target.value)} />
          </div>
          <div>
            <label className="admin-label">برچسب قیمت</label>
            <input className="admin-input" placeholder="استعلام قیمت" value={form.priceLabel} onChange={(e) => set("priceLabel", e.target.value)} />
          </div>
          <div>
            <label className="admin-label">ترتیب نمایش</label>
            <input type="number" className="admin-input" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} />
          </div>
          <label className="flex items-center gap-2 text-sm font-bold text-ink">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
            نمایش در سایت
          </label>
        </div>

        {error && <p className="text-sm font-bold text-red-600">{error}</p>}
        <button disabled={saving} className="admin-btn w-full">
          {saving ? "در حال ذخیره..." : isEdit ? "ذخیره تغییرات" : "ایجاد محصول"}
        </button>
      </div>
    </form>
  );
}
