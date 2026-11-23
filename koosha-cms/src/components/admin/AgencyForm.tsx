"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Agency } from "@/lib/models/agencies";

export default function AgencyForm({ agency }: { agency?: Agency }) {
  const router = useRouter();
  const isEdit = !!agency;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: agency?.name || "",
    city: agency?.city || "",
    province: agency?.province || "",
    ownerName: agency?.ownerName || "",
    code: agency?.code || "",
    address: agency?.address || "",
    phone: agency?.phone || "",
    phone2: agency?.phone2 || "",
    postalCode: agency?.postalCode || "",
    workHours: agency?.workHours || "",
    coveredCars: agency?.coveredCars || "",
    type: agency?.type || "عاملیت فروش و خدمات پس از فروش",
    sortOrder: agency?.sortOrder ?? 0,
    isActive: agency?.isActive ?? true,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = isEdit ? `/api/admin/agencies/${agency!.id}` : "/api/admin/agencies";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("خطا در ذخیره‌سازی");
      router.push("/admin/agencies");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="admin-card max-w-3xl space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="admin-label">نام عاملیت *</label>
          <input required className="admin-input" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label className="admin-label">شهر *</label>
          <input required className="admin-input" value={form.city} onChange={(e) => set("city", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="admin-label">استان</label>
          <input className="admin-input" value={form.province} onChange={(e) => set("province", e.target.value)} />
        </div>
        <div>
          <label className="admin-label">صاحب امتیاز</label>
          <input className="admin-input" value={form.ownerName} onChange={(e) => set("ownerName", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="admin-label">کد عاملیت</label>
          <input className="admin-input" value={form.code} onChange={(e) => set("code", e.target.value)} />
        </div>
        <div>
          <label className="admin-label">نوع</label>
          <input className="admin-input" value={form.type} onChange={(e) => set("type", e.target.value)} />
        </div>
      </div>
      <div>
        <label className="admin-label">آدرس</label>
        <textarea rows={2} className="admin-input" value={form.address} onChange={(e) => set("address", e.target.value)} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="admin-label">تلفن</label>
          <input className="admin-input" dir="ltr" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div>
          <label className="admin-label">تلفن دوم</label>
          <input className="admin-input" dir="ltr" value={form.phone2} onChange={(e) => set("phone2", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="admin-label">کد پستی</label>
          <input className="admin-input" dir="ltr" value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} />
        </div>
        <div>
          <label className="admin-label">ساعات کاری</label>
          <input className="admin-input" value={form.workHours} onChange={(e) => set("workHours", e.target.value)} />
        </div>
      </div>
      <div>
        <label className="admin-label">خودروهای تحت پوشش</label>
        <input className="admin-input" value={form.coveredCars} onChange={(e) => set("coveredCars", e.target.value)} />
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
        {saving ? "در حال ذخیره..." : isEdit ? "ذخیره تغییرات" : "ایجاد عاملیت"}
      </button>
    </form>
  );
}
