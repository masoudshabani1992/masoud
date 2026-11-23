import Link from "next/link";
import HeroSlider from "@/components/site/HeroSlider";
import ScrollReveal from "@/components/site/ScrollReveal";
import AnimatedCounter from "@/components/site/AnimatedCounter";
import ProductCarousel from "@/components/site/ProductCarousel";
import NewsCarousel from "@/components/site/NewsCarousel";
import { listSlides } from "@/lib/models/slider";
import { listProducts } from "@/lib/models/products";
import { listNews } from "@/lib/models/news";
import { listAgencies, listCities } from "@/lib/models/agencies";
import { getSettings } from "@/lib/models/settings";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const settings = getSettings();
  const slides = listSlides({ onlyActive: true });
  const products = listProducts({ onlyActive: true });
  const news = listNews({ onlyActive: true }).slice(0, 9);
  const agencies = listAgencies({ onlyActive: true });
  const cities = listCities();

  const heroSlides = (slides.length ? slides : []).map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    imageUrl: s.imageUrl,
    linkUrl: s.linkUrl,
    linkLabel: s.linkLabel,
  }));

  return (
    <div>
      {heroSlides.length > 0 && <HeroSlider slides={heroSlides} />}

      {/* Brand strip */}
      <section className="border-b border-line bg-smoke py-6">
        <div className="container-kh flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-bold text-ink/50">
          <span>نماینده رسمی کیا در ایران</span>
          <span className="h-1 w-1 rounded-full bg-ink/30" />
          <span>بیش از ۲۵٬۰۰۰ دستگاه واردات</span>
          <span className="h-1 w-1 rounded-full bg-ink/30" />
          <span>عضو رسمی انجمن واردکنندگان خودرو</span>
          <span className="h-1 w-1 rounded-full bg-ink/30" />
          <span>قطعات یدکی اورجینال</span>
        </div>
      </section>

      {/* About */}
      <section className="py-24">
        <div className="container-kh grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          <ScrollReveal>
            <span className="section-eyebrow">درباره کوشا خودرو</span>
            <h2 className="section-title">
              نماینده رسمی فروش و خدمات پس از فروش <span className="relative inline-block">کیا</span> در ایران
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-ink/65">
              {settings.aboutShort ||
                "شرکت کوشا خودرو با فعالیت دو دهه در حوزه واردات خودرو، عضو رسمی و فعال انجمن واردکنندگان خودرو کشور است و با واردات بیش از ۲۵٬۰۰۰ دستگاه انواع خودروی سواری و تامین و توزیع قطعات یدکی اصلی در سراسر کشور، به عنوان مرکز فروش و خدمات پس از فروش کیا در ایران شناخته می‌شود."}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/about" className="btn-primary">درباره ما بیشتر بدانید</Link>
              <Link href="/agencies" className="btn-outline">عاملیت‌ها و نمایندگی‌ها</Link>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.15} className="grid grid-cols-2 gap-6">
            <AnimatedCounter value={25000} suffix="+" label="دستگاه خودروی وارداتی" />
            <AnimatedCounter value={20} suffix="+" label="سال فعالیت در صنعت خودرو" />
            <AnimatedCounter value={agencies.length || 8} suffix="" label="عاملیت فروش و خدمات" />
            <AnimatedCounter value={cities.length || 7} suffix="" label="شهر تحت پوشش" />
          </ScrollReveal>
        </div>
      </section>

      {/* Products */}
      <section className="bg-smoke py-24">
        <div className="container-kh">
          <ScrollReveal className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="section-eyebrow">محصولات کوشا خودرو</span>
              <h2 className="section-title">خودروهای ارائه‌ شده</h2>
            </div>
            <Link href="/products" className="btn-outline">مشاهده همه محصولات</Link>
          </ScrollReveal>
          {products.length > 0 && <ProductCarousel products={products} />}
        </div>
      </section>

      {/* News & circulars */}
      <section className="py-24">
        <div className="container-kh">
          <ScrollReveal className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="section-eyebrow">تازه‌های کوشا خودرو</span>
              <h2 className="section-title">اخبار و آخرین بخشنامه‌ها</h2>
            </div>
            <div className="flex gap-3">
              <Link href="/news?type=NEWS" className="btn-outline">اخبار</Link>
              <Link href="/news?type=CIRCULAR" className="btn-primary">بخشنامه‌ها</Link>
            </div>
          </ScrollReveal>
          {news.length > 0 && <NewsCarousel items={news} />}
        </div>
      </section>

      {/* Agencies teaser */}
      <section className="relative overflow-hidden bg-ink py-24 text-white">
        <div className="container-kh relative z-10">
          <ScrollReveal className="mb-14 text-center">
            <span className="section-eyebrow text-white/60">در سراسر کشور</span>
            <h2 className="section-title text-white">عاملیت‌ها و نمایندگی‌های کوشا خودرو</h2>
            <p className="mx-auto mt-5 max-w-2xl text-white/60">
              شبکه فروش و خدمات پس از فروش کوشا خودرو در شهرهای مختلف ایران آماده ارائه خدمات به مشتریان است.
            </p>
          </ScrollReveal>
          <ScrollReveal stagger={0.08} className="flex flex-wrap items-center justify-center gap-3">
            {(cities.length ? cities : ["تهران", "تبریز", "بابلسر", "بابل", "شاهرود", "کرج", "شیراز"]).map((c) => (
              <span
                key={c}
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white/90 transition hover:border-white hover:bg-white hover:text-ink"
              >
                {c}
              </span>
            ))}
          </ScrollReveal>
          <ScrollReveal delay={0.2} className="mt-12 text-center">
            <Link href="/agencies" className="btn-outline-white">مشاهده همه عاملیت‌ها</Link>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container-kh">
          <ScrollReveal className="flex flex-col items-center justify-between gap-8 rounded-3xl border border-line bg-smoke p-10 text-center md:flex-row md:text-right">
            <div>
              <h3 className="text-2xl font-black text-ink md:text-3xl">همین حالا با کارشناسان فروش کوشا خودرو در ارتباط باشید</h3>
              <p className="mt-2 text-ink/60">{settings.address}</p>
            </div>
            <a href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`} className="btn-primary whitespace-nowrap">
              {settings.phone}
            </a>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
