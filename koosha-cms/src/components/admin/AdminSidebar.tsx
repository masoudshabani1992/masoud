"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "داشبورد", icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" },
  { href: "/admin/slider", label: "اسلایدر صفحه اول", icon: "M4 7h16M4 12h16M4 17h10" },
  { href: "/admin/products", label: "محصولات", icon: "M3 3h18v18H3zM3 9h18M9 21V9" },
  { href: "/admin/news", label: "اخبار و بخشنامه‌ها", icon: "M4 4h16v16H4zM4 9h16M9 4v16" },
  { href: "/admin/agencies", label: "عاملیت‌ها و نمایندگی‌ها", icon: "M3 21h18M5 21V7l7-4 7 4v14" },
  { href: "/admin/pages", label: "صفحات", icon: "M6 2h9l5 5v15H6zM14 2v6h6" },
  { href: "/admin/messages", label: "پیام‌های تماس", icon: "M21 10c0 7-9 13-9 13S3 17 3 10" },
  { href: "/admin/settings", label: "تنظیمات و SEO", icon: "M12 15a3 3 0 100-6 3 3 0 000 6z" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed bottom-0 right-0 top-0 z-40 hidden w-64 flex-col border-l border-line bg-white lg:flex">
      <Link href="/" target="_blank" className="flex items-center gap-3 border-b border-line px-6 py-5">
        <img src="/uploads/logo.png" alt="کوشا خودرو" className="h-9 w-9 object-contain" />
        <div>
          <div className="text-sm font-black text-ink">کوشا خودرو</div>
          <div className="text-[11px] text-ink/40">پنل مدیریت محتوا</div>
        </div>
      </Link>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {items.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition ${
                active ? "bg-ink text-white" : "text-ink/70 hover:bg-smoke"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
