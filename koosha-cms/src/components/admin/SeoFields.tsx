"use client";

import ImageUploader from "./ImageUploader";

export interface SeoValue {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
}

export default function SeoFields({
  value,
  onChange,
}: {
  value: SeoValue;
  onChange: (v: SeoValue) => void;
}) {
  return (
    <div className="admin-card space-y-4">
      <h3 className="text-sm font-black text-ink">تنظیمات سئو (SEO)</h3>
      <div>
        <label className="admin-label">عنوان سئو (Meta Title)</label>
        <input
          className="admin-input"
          value={value.seoTitle}
          onChange={(e) => onChange({ ...value, seoTitle: e.target.value })}
        />
      </div>
      <div>
        <label className="admin-label">توضیحات متا (Meta Description)</label>
        <textarea
          rows={3}
          className="admin-input"
          value={value.seoDescription}
          onChange={(e) => onChange({ ...value, seoDescription: e.target.value })}
        />
      </div>
      <div>
        <label className="admin-label">کلمات کلیدی (Keywords)</label>
        <input
          className="admin-input"
          placeholder="با کاما از هم جدا کنید"
          value={value.seoKeywords}
          onChange={(e) => onChange({ ...value, seoKeywords: e.target.value })}
        />
      </div>
      <ImageUploader
        label="تصویر اشتراک‌گذاری (OG Image)"
        value={value.ogImage}
        onChange={(url) => onChange({ ...value, ogImage: url })}
      />
    </div>
  );
}
