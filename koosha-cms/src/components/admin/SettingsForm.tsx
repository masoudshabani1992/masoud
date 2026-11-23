"use client";

import { useState } from "react";
import ImageUploader from "./ImageUploader";
import type { Settings } from "@/lib/models/settings";

export default function SettingsForm({ settings }: { settings: Settings }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(settings);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="admin-card space-y-4">
          <h3 className="text-sm font-black text-ink">اطلاعات کلی</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="admin-label">نام سایت</label>
              <input className="admin-input" value={form.siteName} onChange={(e) => set("siteName", e.target.value)} />
            </div>
            <div>
              <label className="admin-label">شعار (Tagline)</label>
              <input className="admin-input" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="admin-label">درباره ما (خلاصه - فوتر و صفحه اصلی)</label>
            <textarea rows={3} className="admin-input" value={form.aboutShort} onChange={(e) => set("aboutShort", e.target.value)} />
          </div>
          <div>
            <label className="admin-label">درباره ما (متن کامل صفحه درباره ما)</label>
            <textarea rows={8} className="admin-input" value={form.aboutContent} onChange={(e) => set("aboutContent", e.target.value)} />
          </div>
        </div>

        <div className="admin-card space-y-4">
          <h3 className="text-sm font-black text-ink">اطلاعات تماس</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="admin-label">تلفن</label>
              <input className="admin-input" dir="ltr" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div>
              <label className="admin-label">سامانه ارتباط با مشتری</label>
              <input className="admin-input" dir="ltr" value={form.customerPhone} onChange={(e) => set("customerPhone", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="admin-label">ایمیل</label>
              <input className="admin-input" dir="ltr" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div>
              <label className="admin-label">آدرس</label>
              <input className="admin-input" value={form.address} onChange={(e) => set("address", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="admin-label">اینستاگرام</label>
              <input className="admin-input" dir="ltr" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} />
            </div>
            <div>
              <label className="admin-label">تلگرام</label>
              <input className="admin-input" dir="ltr" value={form.telegram} onChange={(e) => set("telegram", e.target.value)} />
            </div>
            <div>
              <label className="admin-label">واتساپ</label>
              <input className="admin-input" dir="ltr" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="admin-label">متن کپی‌رایت فوتر</label>
            <input className="admin-input" value={form.footerText} onChange={(e) => set("footerText", e.target.value)} />
          </div>
        </div>

        <div className="admin-card space-y-4">
          <h3 className="text-sm font-black text-ink">سئو پیش‌فرض سایت</h3>
          <div>
            <label className="admin-label">عنوان سئو</label>
            <input className="admin-input" value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
          </div>
          <div>
            <label className="admin-label">توضیحات متا</label>
            <textarea rows={3} className="admin-input" value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} />
          </div>
          <div>
            <label className="admin-label">کلمات کلیدی</label>
            <input className="admin-input" value={form.seoKeywords} onChange={(e) => set("seoKeywords", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="admin-card space-y-4">
          <ImageUploader label="لوگو" value={form.logoUrl} onChange={(url) => set("logoUrl", url)} />
          <ImageUploader label="فاوآیکون" value={form.favicon} onChange={(url) => set("favicon", url)} />
        </div>
        {saved && <p className="text-sm font-bold text-green-600">تغییرات ذخیره شد.</p>}
        <button disabled={saving} className="admin-btn w-full">
          {saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
        </button>
      </div>
    </form>
  );
}
