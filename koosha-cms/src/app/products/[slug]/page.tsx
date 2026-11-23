import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ScrollReveal from "@/components/site/ScrollReveal";
import ProductCarousel from "@/components/site/ProductCarousel";
import { getProductBySlug, listProducts } from "@/lib/models/products";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.summary,
    keywords: product.seoKeywords,
    openGraph: {
      title: product.seoTitle || product.name,
      description: product.seoDescription || product.summary,
      images: product.ogImage || product.imageUrl ? [product.ogImage || product.imageUrl] : undefined,
    },
  };
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product || !product.isActive) notFound();

  const gallery = [product.imageUrl, ...product.gallery].filter(Boolean);
  const related = listProducts({ onlyActive: true }).filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div>
      <section className="relative overflow-hidden bg-ink text-white">
        <img src={product.imageUrl} alt={product.name} className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
        <div className="container-kh relative z-10 flex min-h-[420px] flex-col justify-end gap-4 py-16">
          <nav className="text-xs text-white/50">
            <Link href="/" className="hover:text-white">خانه</Link> /{" "}
            <Link href="/products" className="hover:text-white">محصولات</Link> /{" "}
            <span className="text-white">{product.name}</span>
          </nav>
          {product.category && <span className="section-eyebrow text-white/60">{product.category}</span>}
          <h1 className="text-4xl font-black md:text-6xl">{product.name}</h1>
          {product.subtitle && <p className="max-w-2xl text-white/70">{product.subtitle}</p>}
        </div>
      </section>

      <section className="py-16">
        <div className="container-kh grid grid-cols-1 gap-14 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ScrollReveal className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {gallery.map((img, i) => (
                <div
                  key={i}
                  className={`overflow-hidden rounded-2xl bg-smoke ${i === 0 ? "sm:col-span-2 aspect-[16/9]" : "aspect-[4/3]"}`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </ScrollReveal>

            {product.description && (
              <ScrollReveal className="kh-prose mt-12 max-w-none text-ink/80">
                <h2 className="mb-4 text-2xl font-black text-ink">معرفی {product.name}</h2>
                {product.description.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </ScrollReveal>
            )}
          </div>

          <div className="lg:col-span-2">
            <ScrollReveal className="sticky top-28 space-y-6">
              <div className="admin-card">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-sm font-bold text-ink/60">قیمت</span>
                  <span className="text-xl font-black text-ink">{product.priceLabel || "استعلام از عاملیت‌ها"}</span>
                </div>
                <div className="flex flex-col gap-3">
                  <Link href="/agencies" className="btn-primary w-full">ثبت‌نام در عاملیت‌ها</Link>
                  {product.catalogUrl ? (
                    <a href={product.catalogUrl} target="_blank" className="btn-outline w-full">
                      دانلود کاتالوگ محصول
                    </a>
                  ) : (
                    <a href="tel:02149970000" className="btn-outline w-full">تماس با کارشناس فروش</a>
                  )}
                </div>
              </div>

              {product.specs.length > 0 && (
                <div className="admin-card">
                  <h3 className="mb-4 text-lg font-black text-ink">مشخصات فنی</h3>
                  <dl className="divide-y divide-line">
                    {product.specs.map((s, i) => (
                      <div key={i} className="flex items-center justify-between py-3 text-sm">
                        <dt className="text-ink/55">{s.label}</dt>
                        <dd className="font-bold text-ink">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </ScrollReveal>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-smoke py-20">
          <div className="container-kh">
            <ScrollReveal className="mb-12 text-center">
              <span className="section-eyebrow">سایر محصولات</span>
              <h2 className="section-title">محصولات مرتبط</h2>
            </ScrollReveal>
            <ProductCarousel products={related} />
          </div>
        </section>
      )}
    </div>
  );
}
