"use client";

export interface Spec {
  label: string;
  value: string;
}

export default function SpecsEditor({
  value,
  onChange,
}: {
  value: Spec[];
  onChange: (specs: Spec[]) => void;
}) {
  function update(i: number, field: "label" | "value", v: string) {
    const next = value.map((s, idx) => (idx === i ? { ...s, [field]: v } : s));
    onChange(next);
  }

  return (
    <div>
      <label className="admin-label">مشخصات فنی</label>
      <div className="space-y-2">
        {value.map((s, i) => (
          <div key={i} className="flex gap-2">
            <input
              className="admin-input"
              placeholder="عنوان (مثلاً: موتور)"
              value={s.label}
              onChange={(e) => update(i, "label", e.target.value)}
            />
            <input
              className="admin-input"
              placeholder="مقدار (مثلاً: ۱.۵ لیتر توربو)"
              value={s.value}
              onChange={(e) => update(i, "value", e.target.value)}
            />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              className="shrink-0 rounded-lg border border-line px-3 text-red-600 hover:border-red-600"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...value, { label: "", value: "" }])}
          className="admin-btn-outline"
        >
          + افزودن مشخصه
        </button>
      </div>
    </div>
  );
}
