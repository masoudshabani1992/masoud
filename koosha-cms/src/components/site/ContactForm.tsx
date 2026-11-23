"use client";

import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="admin-card space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="admin-label">نام و نام خانوادگی *</label>
          <input name="name" required className="admin-input" placeholder="نام شما" />
        </div>
        <div>
          <label className="admin-label">شماره تماس</label>
          <input name="phone" className="admin-input" placeholder="09xxxxxxxxx" dir="ltr" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="admin-label">ایمیل</label>
          <input name="email" type="email" className="admin-input" placeholder="email@example.com" dir="ltr" />
        </div>
        <div>
          <label className="admin-label">موضوع</label>
          <input name="subject" className="admin-input" placeholder="موضوع پیام" />
        </div>
      </div>
      <div>
        <label className="admin-label">متن پیام *</label>
        <textarea name="message" required rows={5} className="admin-input" placeholder="پیام خود را بنویسید..." />
      </div>
      <button disabled={status === "sending"} className="btn-primary w-full sm:w-auto">
        {status === "sending" ? "در حال ارسال..." : "ارسال پیام"}
      </button>
      {status === "sent" && <p className="text-sm font-bold text-green-600">پیام شما با موفقیت ارسال شد.</p>}
      {status === "error" && <p className="text-sm font-bold text-red-600">خطا در ارسال پیام. دوباره تلاش کنید.</p>}
    </form>
  );
}
