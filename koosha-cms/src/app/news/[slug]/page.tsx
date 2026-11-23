import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ScrollReveal from "@/components/site/ScrollReveal";
import NewsCard from "@/components/site/NewsCard";
import { getNewsBySlug, listNews } from "@/lib/models/news";
import { formatJalaliDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const item = getNewsBySlug(params.slug);
  if (!item) return {};
  return {
    title: item.seoTitle || item.title,
    description: item.seoDescription || item.excerpt,
    keywords: item.seoKeywords,
    openGraph: {
      title: item.seoTitle || item.title,
      description: item.seoDescription || item.excerpt,
      images: item.ogImage || item.coverImage ? [item.ogImage || item.coverImage] : undefined,
    },
  };
}

export default function NewsDetailPage({ params }: { params: { slug: string } }) {
  const item = getNewsBySlug(params.slug);
  if (!item || !item.isActive) notFound();
  const related = listNews({ onlyActive: true, type: item.type }).filter((n) => n.id !== item.id).slice(0, 3);

  return (
    <article>
      <section className="border-b border-line bg-smoke py-14">
        <div className="container-kh">
          <nav className="mb-6 text-xs text-ink/40">
            <Link href="/" className="hover:text-ink">خانه</Link> /{" "}
            <Link href="/news" className="hover:text-ink">اخبار و بخشنامه‌ها</Link>
          </nav>
          <span
            className={`mb-4 inline-block rounded-full px-3 py-1 text-xs font-bold ${
              item.type === "CIRCULAR" ? "border border-ink text-ink" : "bg-ink text-white"
            }`}
          >
            {item.type === "CIRCULAR" ? "بخشنامه" : "خبر"}
          </span>
          <h1 className="max-w-3xl text-3xl font-black leading-tight text-ink md:text-5xl">{item.title}</h1>
          <p className="mt-4 text-sm font-bold text-ink/40">{formatJalaliDate(item.publishedAt)}</p>
        </div>
      </section>

      {item.coverImage && (
        <div className="container-kh -mt-10 md:-mt-16">
          <div className="overflow-hidden rounded-3xl shadow-xl">
            <img src={item.coverImage} alt={item.title} className="aspect-[16/8] w-full object-cover" />
          </div>
        </div>
      )}

      <section className="py-16">
        <div className="container-kh grid grid-cols-1 gap-14 lg:grid-cols-3">
          <ScrollReveal className="kh-prose lg:col-span-2 text-ink/80">
            {item.content.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {item.sourceUrl && (
              <p className="mt-8 text-sm text-ink/40">
                منبع:{" "}
                <a href={item.sourceUrl} target="_blank" className="underline">
                  {item.sourceUrl}
                </a>
              </p>
            )}
          </ScrollReveal>

          <div className="space-y-6">
            <div className="admin-card">
              <h3 className="mb-4 text-lg font-black text-ink">نیاز به مشاوره دارید؟</h3>
              <p className="mb-5 text-sm text-ink/60">کارشناسان فروش کوشا خودرو آماده پاسخگویی هستند.</p>
              <a href="tel:02149970000" className="btn-primary w-full">۰۲۱-۴۹۹۷۰۰۰۰</a>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-smoke py-20">
          <div className="container-kh">
            <ScrollReveal className="mb-12 text-center">
              <span className="section-eyebrow">مطالب مرتبط</span>
              <h2 className="section-title">ادامه اخبار</h2>
            </ScrollReveal>
            <ScrollReveal stagger={0.08} className="grid grid-cols-1 gap-7 md:grid-cols-3">
              {related.map((n) => (
                <NewsCard key={n.id} item={n} />
              ))}
            </ScrollReveal>
          </div>
        </section>
      )}
    </article>
  );
}
