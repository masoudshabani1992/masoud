import type { Metadata } from "next";
import Link from "next/link";
import ScrollReveal from "@/components/site/ScrollReveal";
import ProductCard from "@/components/site/ProductCard";
import { listProducts } from "@/lib/models/products";
import { getSettings } from "@/lib/models/settings";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const settings = getSettings();
  return {
    title: "محصولات کوشا خودرو",
    description: `مشاهده محصولات کیا در ${settings.siteName}: اسپورتیج، K5، K3، پگاس، سلتوس، EV5 و فروشگاه اکسسوری کیا.`,
  };
}

export default function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const products = listProducts({ onlyActive: true });
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  const activeCategory = searchParams.category;
  const filtered = activeCategory ? products.filter((p) => p.category === activeCategory) : products;

  return (
    <div>
      <section className="border-b border-line bg-smoke py-16">
        <div className="container-kh text-center">
          <ScrollReveal>
            <span className="section-eyebrow">خودروهای کیا در ایران</span>
            <h1 className="section-title">محصولات کوشا خودرو</h1>
            <p className="mx-auto mt-5 max-w-2xl text-ink/60">
              سبد کاملی از محصولات کیا شامل شاسی‌بلند، سدان و خودروهای الکتریکی، به همراه فروشگاه اکسسوری اصلی کیا.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-16">
        <div className="container-kh">
          <div className="mb-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className={`rounded-full border px-5 py-2 text-sm font-bold transition ${
                !activeCategory ? "border-ink bg-ink text-white" : "border-line text-ink/60 hover:border-ink"
              }`}
            >
              همه محصولات
            </Link>
            {categories.map((c) => (
              <Link
                key={c}
                href={`/products?category=${encodeURIComponent(c)}`}
                className={`rounded-full border px-5 py-2 text-sm font-bold transition ${
                  activeCategory === c ? "border-ink bg-ink text-white" : "border-line text-ink/60 hover:border-ink"
                }`}
              >
                {c}
              </Link>
            ))}
          </div>

          <ScrollReveal stagger={0.08} className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ScrollReveal>

          {filtered.length === 0 && (
            <p className="py-20 text-center text-ink/50">محصولی در این دسته‌بندی ثبت نشده است.</p>
          )}
        </div>
      </section>
    </div>
  );
}
