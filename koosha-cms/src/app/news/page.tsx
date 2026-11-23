import type { Metadata } from "next";
import Link from "next/link";
import ScrollReveal from "@/components/site/ScrollReveal";
import NewsCard from "@/components/site/NewsCard";
import { listNews, NewsType } from "@/lib/models/news";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "اخبار و بخشنامه‌ها",
  description: "آخرین اخبار، اطلاعیه‌ها و بخشنامه‌های فروش شرکت کوشا خودرو، نماینده رسمی کیا در ایران.",
};

export default function NewsPage({ searchParams }: { searchParams: { type?: string } }) {
  const type = (searchParams.type === "CIRCULAR" || searchParams.type === "NEWS" ? searchParams.type : undefined) as
    | NewsType
    | undefined;
  const items = listNews({ onlyActive: true, type });

  return (
    <div>
      <section className="border-b border-line bg-smoke py-16">
        <div className="container-kh text-center">
          <ScrollReveal>
            <span className="section-eyebrow">تازه‌های کوشا خودرو</span>
            <h1 className="section-title">اخبار و بخشنامه‌های فروش</h1>
            <p className="mx-auto mt-5 max-w-2xl text-ink/60">
              جدیدترین اخبار، اطلاعیه‌ها و بخشنامه‌های شرایط فروش محصولات کیا توسط کوشا خودرو را دنبال کنید.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-16">
        <div className="container-kh">
          <div className="mb-10 flex justify-center gap-3">
            <Link
              href="/news"
              className={`rounded-full border px-6 py-2.5 text-sm font-bold transition ${
                !type ? "border-ink bg-ink text-white" : "border-line text-ink/60 hover:border-ink"
              }`}
            >
              همه
            </Link>
            <Link
              href="/news?type=NEWS"
              className={`rounded-full border px-6 py-2.5 text-sm font-bold transition ${
                type === "NEWS" ? "border-ink bg-ink text-white" : "border-line text-ink/60 hover:border-ink"
              }`}
            >
              اخبار
            </Link>
            <Link
              href="/news?type=CIRCULAR"
              className={`rounded-full border px-6 py-2.5 text-sm font-bold transition ${
                type === "CIRCULAR" ? "border-ink bg-ink text-white" : "border-line text-ink/60 hover:border-ink"
              }`}
            >
              بخشنامه‌ها
            </Link>
          </div>

          <ScrollReveal stagger={0.07} className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((n) => (
              <NewsCard key={n.id} item={n} />
            ))}
          </ScrollReveal>

          {items.length === 0 && <p className="py-20 text-center text-ink/50">موردی یافت نشد.</p>}
        </div>
      </section>
    </div>
  );
}
