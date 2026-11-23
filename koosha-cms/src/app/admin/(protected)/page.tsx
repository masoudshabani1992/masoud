import Link from "next/link";
import { listProducts } from "@/lib/models/products";
import { listNews } from "@/lib/models/news";
import { listPages } from "@/lib/models/pages";
import { listAgencies } from "@/lib/models/agencies";
import { listSlides } from "@/lib/models/slider";
import { listMessages } from "@/lib/models/messages";

export default function AdminDashboard() {
  const products = listProducts();
  const news = listNews();
  const pages = listPages();
  const agencies = listAgencies();
  const slides = listSlides();
  const messages = listMessages();
  const unread = messages.filter((m) => !m.isRead).length;

  const cards = [
    { label: "محصولات", value: products.length, href: "/admin/products" },
    { label: "اخبار و بخشنامه‌ها", value: news.length, href: "/admin/news" },
    { label: "اسلایدهای صفحه اول", value: slides.length, href: "/admin/slider" },
    { label: "عاملیت‌ها", value: agencies.length, href: "/admin/agencies" },
    { label: "صفحات", value: pages.length, href: "/admin/pages" },
    { label: "پیام‌های جدید", value: unread, href: "/admin/messages" },
  ];

  return (
    <div>
      <h1 className="mb-8 text-2xl font-black text-ink">داشبورد مدیریت کوشا خودرو</h1>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="admin-card transition hover:border-ink">
            <div className="text-3xl font-black text-ink">{c.value}</div>
            <div className="mt-2 text-sm font-bold text-ink/50">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-10 admin-card">
        <h2 className="mb-4 text-lg font-black text-ink">راهنمای شروع</h2>
        <ul className="list-inside list-disc space-y-2 text-sm leading-7 text-ink/65">
          <li>برای تغییر اسلایدر صفحه اصلی، به بخش «اسلایدر صفحه اول» بروید.</li>
          <li>برای افزودن یا ویرایش خودروها و کاتالوگ محصول، به بخش «محصولات» مراجعه کنید.</li>
          <li>اخبار و بخشنامه‌های فروش را از بخش «اخبار و بخشنامه‌ها» مدیریت کنید.</li>
          <li>عاملیت‌ها و نمایندگی‌های شهرهای مختلف را در بخش «عاملیت‌ها» ثبت کنید.</li>
          <li>برای هر محصول، خبر، بخشنامه و صفحه می‌توانید عنوان و توضیحات سئو اختصاصی تعریف کنید.</li>
        </ul>
      </div>
    </div>
  );
}
