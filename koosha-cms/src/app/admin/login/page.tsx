"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در ورود");
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-5" dir="rtl">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <img src="/uploads/logo.png" alt="کوشا خودرو" className="mx-auto mb-3 h-14 w-14 object-contain" />
          <h1 className="text-xl font-black text-ink">ورود به پنل مدیریت کوشا خودرو</h1>
        </div>
        <div className="space-y-4">
          <div>
            <label className="admin-label">نام کاربری</label>
            <input
              className="admin-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="admin-label">رمز عبور</label>
            <input
              type="password"
              className="admin-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm font-bold text-red-600">{error}</p>}
          <button disabled={loading} className="admin-btn w-full">
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </div>
      </form>
    </div>
  );
}
