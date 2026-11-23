"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface NavPage {
  slug: string;
  title: string;
}

export default function Header({
  siteName,
  logoUrl,
  phone,
  navPages,
}: {
  siteName: string;
  logoUrl: string;
  phone: string;
  navPages: NavPage[];
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const links = [
    { href: "/", label: "خانه" },
    { href: "/products", label: "محصولات" },
    { href: "/news?type=NEWS", label: "اخبار" },
    { href: "/news?type=CIRCULAR", label: "بخشنامه‌ها" },
    { href: "/agencies", label: "عاملیت‌ها و نمایندگی‌ها" },
    ...navPages.map((p) => ({ href: `/page/${p.slug}`, label: p.title })),
    { href: "/contact", label: "تماس با ما" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled ? "border-line bg-white/95 backdrop-blur shadow-sm" : "border-transparent bg-white"
      }`}
    >
      <div className="container-kh flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <img src={logoUrl} alt={siteName} className="h-10 w-10 object-contain" />
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-black text-ink">{siteName}</span>
            <span className="text-[10px] font-medium tracking-wide text-ink/50">
              نماینده رسمی کیا در ایران
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="relative text-sm font-bold text-ink/80 transition hover:text-ink after:absolute after:-bottom-1 after:right-0 after:h-[2px] after:w-0 after:bg-ink after:transition-all hover:after:w-full"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            {phone}
          </a>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="منو"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-white px-5 pb-6 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-3 text-sm font-bold text-ink/80 hover:bg-smoke"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="btn-primary mt-4 w-full">
            {phone}
          </a>
        </div>
      )}
    </header>
  );
}
