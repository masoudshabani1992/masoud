import type { Metadata } from "next";
import ScrollReveal from "@/components/site/ScrollReveal";
import ContactForm from "@/components/site/ContactForm";
import { getSettings } from "@/lib/models/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تماس با ما",
  description: "راه‌های ارتباط با شرکت کوشا خودرو، نماینده رسمی فروش و خدمات پس از فروش کیا در ایران.",
};

export default function ContactPage() {
  const settings = getSettings();
  return (
    <div>
      <section className="border-b border-line bg-smoke py-16">
        <div className="container-kh text-center">
          <ScrollReveal>
            <span className="section-eyebrow">در ارتباط باشید</span>
            <h1 className="section-title">تماس با کوشا خودرو</h1>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-16">
        <div className="container-kh grid grid-cols-1 gap-12 lg:grid-cols-5">
          <ScrollReveal className="space-y-6 lg:col-span-2">
            <div className="admin-card">
              <h3 className="mb-2 text-sm font-bold text-ink/50">دفتر تهران (فروش و خدمات پس از فروش)</h3>
              <p className="text-lg font-black text-ink">{settings.address}</p>
            </div>
            <div className="admin-card">
              <h3 className="mb-2 text-sm font-bold text-ink/50">تلفن تماس</h3>
              <a href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`} dir="ltr" className="block text-lg font-black text-ink hover:underline">
                {settings.phone}
              </a>
            </div>
            <div className="admin-card">
              <h3 className="mb-2 text-sm font-bold text-ink/50">سامانه ارتباط با مشتری</h3>
              <a href={`tel:${settings.customerPhone.replace(/[^0-9+]/g, "")}`} dir="ltr" className="block text-lg font-black text-ink hover:underline">
                {settings.customerPhone}
              </a>
            </div>
            <div className="admin-card">
              <h3 className="mb-2 text-sm font-bold text-ink/50">ایمیل</h3>
              <a href={`mailto:${settings.email}`} dir="ltr" className="block text-lg font-black text-ink hover:underline">
                {settings.email}
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1} className="lg:col-span-3">
            <ContactForm />
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
