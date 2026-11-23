"use client";

import { useRef, useState } from "react";

export default function ImageUploader({
  label,
  value,
  onChange,
  accept = "image/*",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در آپلود");
      onChange(data.url);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  const isPdf = value?.toLowerCase().endsWith(".pdf");

  return (
    <div>
      <label className="admin-label">{label}</label>
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-smoke">
          {value ? (
            isPdf ? (
              <span className="text-[10px] font-bold text-ink/50">PDF</span>
            ) : (
              <img src={value} alt="" className="h-full w-full object-cover" />
            )
          ) : (
            <span className="text-[10px] text-ink/30">بدون تصویر</span>
          )}
        </div>
        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="admin-btn-outline"
          >
            {uploading ? "در حال آپلود..." : "انتخاب فایل"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="mr-2 text-xs font-bold text-red-600 hover:underline"
            >
              حذف
            </button>
          )}
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
      </div>
      <input type="hidden" value={value} readOnly />
    </div>
  );
}
