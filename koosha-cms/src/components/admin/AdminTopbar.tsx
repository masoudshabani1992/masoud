"use client";

import { useRouter } from "next/navigation";

export default function AdminTopbar({ username }: { username: string }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-white px-5 md:px-8">
      <span className="text-sm font-bold text-ink/50">خوش آمدید، {username}</span>
      <button onClick={logout} className="admin-btn-outline">
        خروج
      </button>
    </header>
  );
}
