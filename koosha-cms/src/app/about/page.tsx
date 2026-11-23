import type { Metadata } from "next";
import Link from "next/link";
import ScrollReveal from "@/components/site/ScrollReveal";
import AnimatedCounter from "@/components/site/AnimatedCounter";
import { getPageBySlug } from "@/lib/models/pages";
import { getSettings } from "@/lib/models/settings";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const page = getPageBySlug("about");
  return {
    title: page?.seoTitle || "درباره کوشا خودرو",
    description: page?.seoDescription || "درباره شرکت کوشا خودرو، نماینده رسمی فروش و خدمات پس از فروش کیا در ایران",
  };
}

export default function AboutPage() {
  const page = getPageBySlug("about");
  const settings = getSettings();
  const content = page?.content || settings.aboutContent;

  return (
    <div>
      <section className="relative overflow-hidden border-b border-line bg-ink py-24 text-white">
        <img
          src={page?.coverImage || "/uploads/hero-3.jpg"}
          alt="درباره کوشا خودرو"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40" />
        <div className="container-kh relative z-10 text-center">
          <ScrollReveal>
            <span className="section-eyebrow text-white/60">شرکت کوشا خودرو</span>
            <h1 className="section-title text-white">{page?.title || "درباره کوشا خودرو"}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-white/70">
              فروش و خدمات پس از فروش کیا در ایران
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20">
        <div className="container-kh grid grid-cols-1 gap-16 lg:grid-cols-3">
          <ScrollReveal className="kh-prose lg:col-span-2 text-ink/80">
            {content.split("\n\n").filter(Boolean).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/products" className="btn-primary">مشاهده محصولات</Link>
              <Link href="/agencies" className="btn-outline">عاملیت‌ها و نمایندگی‌ها</Link>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1} className="admin-card h-fit space-y-5">
            <div>
              <h3 className="mb-1 text-sm font-bold text-ink/50">دفتر تهران</h3>
              <p className="font-bold text-ink">{settings.address}</p>
            </div>
            <div>
              <h3 className="mb-1 text-sm font-bold text-ink/50">تلفن تماس</h3>
              <p dir="ltr" className="font-bold text-ink">{settings.phone}</p>
            </div>
            <div>
              <h3 className="mb-1 text-sm font-bold text-ink/50">سامانه ارتباط با مشتری</h3>
              <p dir="ltr" className="font-bold text-ink">{settings.customerPhone}</p>
            </div>
            <div>
              <h3 className="mb-1 text-sm font-bold text-ink/50">ایمیل</h3>
              <p dir="ltr" className="font-bold text-ink">{settings.email}</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="bg-smoke py-20">
        <div className="container-kh grid grid-cols-2 gap-8 md:grid-cols-4">
          <AnimatedCounter value={25000} suffix="+" label="دستگاه خودروی وارداتی" />
          <AnimatedCounter value={20} suffix="+" label="سال فعالیت" />
          <AnimatedCounter value={8} label="عاملیت فعال" />
          <AnimatedCounter value={7} label="شهر تحت پوشش" />
        </div>
      </section>
    </div>
  );
}
