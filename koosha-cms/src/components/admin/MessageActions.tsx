"use client";

import { useRouter } from "next/navigation";

export default function MessageActions({ id, isRead }: { id: string; isRead: boolean }) {
  const router = useRouter();

  async function markRead() {
    await fetch(`/api/admin/messages/${id}`, { method: "PUT" });
    router.refresh();
  }

  async function remove() {
    if (!confirm("آیا از حذف این پیام مطمئن هستید؟")) return;
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      {!isRead && (
        <button onClick={markRead} className="admin-btn-outline">
          علامت خوانده‌شده
        </button>
      )}
      <button onClick={remove} className="admin-btn-danger">
        حذف
      </button>
    </div>
  );
}
