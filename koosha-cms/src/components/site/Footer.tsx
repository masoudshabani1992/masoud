import Link from "next/link";

export default function Footer({
  siteName,
  logoUrl,
  aboutShort,
  phone,
  customerPhone,
  email,
  address,
  footerText,
  instagram,
  telegram,
  whatsapp,
  navPages,
}: {
  siteName: string;
  logoUrl: string;
  aboutShort: string;
  phone: string;
  customerPhone: string;
  email: string;
  address: string;
  footerText: string;
  instagram?: string;
  telegram?: string;
  whatsapp?: string;
  navPages: { slug: string; title: string }[];
}) {
  return (
    <footer className="bg-ink text-white">
      <div className="container-kh grid grid-cols-1 gap-10 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="mb-4 flex items-center gap-3">
            <img src={logoUrl} alt={siteName} className="h-10 w-10 object-contain invert" />
            <span className="text-lg font-black">{siteName}</span>
          </Link>
          <p className="text-sm leading-7 text-white/60">
            {aboutShort || "نماینده رسمی فروش و خدمات پس از فروش کیا در ایران"}
          </p>
          <div className="mt-5 flex gap-3">
            {instagram && (
              <a
                href={instagram}
                target="_blank"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 transition hover:bg-white hover:text-ink"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2c3.2 0 3.6 0 4.9.07 3.2.15 4.7 1.65 4.86 4.86.06 1.27.07 1.65.07 4.87s0 3.6-.07 4.87c-.15 3.2-1.65 4.7-4.86 4.86-1.27.06-1.64.07-4.9.07-3.2 0-3.6 0-4.86-.07-3.22-.15-4.7-1.67-4.86-4.86-.07-1.27-.07-1.64-.07-4.87s0-3.6.07-4.87C2.45 3.92 3.95 2.42 7.14 2.27 8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.14 0-3.5 0-4.75.07-2.27.1-3.33 1.18-3.43 3.43C3.75 8.75 3.75 9.1 3.75 12c0 2.9 0 3.25.07 4.5.1 2.25 1.15 3.33 3.43 3.43 1.25.06 1.6.07 4.75.07s3.5 0 4.75-.07c2.26-.1 3.33-1.17 3.43-3.43.06-1.25.07-1.6.07-4.5 0-2.9 0-3.25-.07-4.5-.1-2.25-1.16-3.33-3.43-3.43-1.25-.07-1.6-.07-4.75-.07zm0 3.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9zm0 1.8a2.7 2.7 0 100 5.4 2.7 2.7 0 000-5.4zm5.7-2a1.05 1.05 0 110 2.1 1.05 1.05 0 010-2.1z" /></svg>
              </a>
            )}
            {telegram && (
              <a
                href={telegram}
                target="_blank"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 transition hover:bg-white hover:text-ink"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.5L2.6 12c-.8.3-.8 1.4 0 1.7l4.9 1.6 1.9 5.9c.2.7 1.1.9 1.6.3l2.7-2.9 4.9 3.6c.6.5 1.5.1 1.7-.6l3-16.1c.2-.9-.7-1.6-1.4-1zM8.8 14.6l-1.3-4 10.6-6.7-8.3 8.3-1 2.4z" /></svg>
              </a>
            )}
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 transition hover:bg-white hover:text-ink"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm5.8 14.3c-.3.7-1.4 1.3-2 1.4-.5.1-1.2.2-3.4-.7-2.9-1.1-4.7-4-4.9-4.2-.1-.2-1.2-1.6-1.2-3a3.2 3.2 0 011-2.4c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6c-.1.2-.3.3-.1.6.2.4.9 1.4 1.9 2.2 1.3 1.1 2.3 1.4 2.6 1.6.3.2.5.2.7-.1l.6-.8c.2-.3.4-.2.6-.1l1.8.9c.2.1.4.2.4.4.1.2.1.8-.2 1.5z" /></svg>
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-black uppercase tracking-wide text-white/90">لینک‌های سریع</h4>
          <ul className="space-y-3 text-sm text-white/60">
            <li><Link href="/products" className="transition hover:text-white">محصولات کوشا خودرو</Link></li>
            <li><Link href="/news?type=NEWS" className="transition hover:text-white">اخبار</Link></li>
            <li><Link href="/news?type=CIRCULAR" className="transition hover:text-white">بخشنامه‌های فروش</Link></li>
            <li><Link href="/agencies" className="transition hover:text-white">عاملیت‌ها و نمایندگی‌ها</Link></li>
            {navPages.map((p) => (
              <li key={p.slug}><Link href={`/page/${p.slug}`} className="transition hover:text-white">{p.title}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-black uppercase tracking-wide text-white/90">محصولات</h4>
          <ul className="space-y-3 text-sm text-white/60">
            <li><Link href="/products/sportage-2026" className="transition hover:text-white">کیا اسپورتیج ۲۰۲۶</Link></li>
            <li><Link href="/products/k5" className="transition hover:text-white">کیا K5</Link></li>
            <li><Link href="/products/seltos" className="transition hover:text-white">کیا سلتوس</Link></li>
            <li><Link href="/products/ev5" className="transition hover:text-white">کیا EV5</Link></li>
            <li><Link href="/products/kia-accessory-shop" className="transition hover:text-white">فروشگاه اکسسوری کیا</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-black uppercase tracking-wide text-white/90">اطلاعات تماس</h4>
          <ul className="space-y-3 text-sm text-white/60">
            <li className="leading-7">{address}</li>
            <li>تلفن: <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="transition hover:text-white">{phone}</a></li>
            <li>سامانه ارتباط با مشتری: <a href={`tel:${customerPhone.replace(/[^0-9+]/g, "")}`} className="transition hover:text-white">{customerPhone}</a></li>
            <li>ایمیل: <a href={`mailto:${email}`} className="transition hover:text-white">{email}</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="container-kh flex flex-col items-center justify-between gap-2 text-xs text-white/50 md:flex-row">
          <span>{footerText}</span>
          <span>طراحی و توسعه: CMS اختصاصی کوشا خودرو</span>
        </div>
      </div>
    </footer>
  );
}
