import type { Metadata } from "next";
import Link from "next/link";
import ScrollReveal from "@/components/site/ScrollReveal";
import AgencyCard from "@/components/site/AgencyCard";
import { listAgencies, listCities } from "@/lib/models/agencies";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "عاملیت‌ها و نمایندگی‌ها",
  description: "فهرست عاملیت‌های فروش و خدمات پس از فروش کوشا خودرو در شهرهای مختلف ایران.",
};

export default function AgenciesPage({ searchParams }: { searchParams: { city?: string } }) {
  const cities = listCities();
  const activeCity = searchParams.city;
  const agencies = listAgencies({ onlyActive: true }).filter((a) => !activeCity || a.city === activeCity);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-line bg-ink py-20 text-white">
        <img
          src="/uploads/agencies-banner.jpg"
          alt="عاملیت‌های کوشا خودرو"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40" />
        <div className="container-kh relative z-10 text-center">
          <ScrollReveal>
            <span className="section-eyebrow text-white/60">در سراسر ایران</span>
            <h1 className="section-title text-white">عاملیت‌ها و نمایندگی‌های کوشا خودرو</h1>
            <p className="mx-auto mt-5 max-w-2xl text-white/70">
              برای ثبت‌نام خرید خودرو و دریافت خدمات پس از فروش، به نزدیک‌ترین عاملیت مجاز کوشا خودرو مراجعه کنید.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-16">
        <div className="container-kh">
          <div className="mb-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/agencies"
              className={`rounded-full border px-5 py-2 text-sm font-bold transition ${
                !activeCity ? "border-ink bg-ink text-white" : "border-line text-ink/60 hover:border-ink"
              }`}
            >
              همه شهرها
            </Link>
            {cities.map((c) => (
              <Link
                key={c}
                href={`/agencies?city=${encodeURIComponent(c)}`}
                className={`rounded-full border px-5 py-2 text-sm font-bold transition ${
                  activeCity === c ? "border-ink bg-ink text-white" : "border-line text-ink/60 hover:border-ink"
                }`}
              >
                {c}
              </Link>
            ))}
          </div>

          <ScrollReveal stagger={0.07} className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {agencies.map((a) => (
              <AgencyCard key={a.id} agency={a} />
            ))}
          </ScrollReveal>

          {agencies.length === 0 && <p className="py-20 text-center text-ink/50">عاملیتی ثبت نشده است.</p>}
        </div>
      </section>
    </div>
  );
}
