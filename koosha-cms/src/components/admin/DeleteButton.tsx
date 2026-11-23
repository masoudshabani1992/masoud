"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({ url, confirmText = "آیا از حذف این مورد مطمئن هستید؟" }: { url: string; confirmText?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!confirm(confirmText)) return;
    setLoading(true);
    try {
      await fetch(url, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={onDelete} disabled={loading} className="admin-btn-danger">
      {loading ? "..." : "حذف"}
    </button>
  );
}
