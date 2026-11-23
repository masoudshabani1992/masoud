import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { getSettings } from "@/lib/models/settings";
import { listPages } from "@/lib/models/pages";
import { seedDemoData } from "@/lib/seed";

seedDemoData();

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSettings();
  return {
    title: {
      default: settings.seoTitle || settings.siteName,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.seoDescription,
    keywords: settings.seoKeywords,
    icons: { icon: settings.favicon || "/uploads/logo.png" },
    openGraph: {
      title: settings.seoTitle || settings.siteName,
      description: settings.seoDescription,
      siteName: settings.siteName,
      locale: "fa_IR",
      type: "website",
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = getSettings();
  const navPages = listPages({ onlyActive: true }).filter((p) => p.showInMenu);

  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <style>{`:root{--font-vazir:'Vazirmatn';}`}</style>
      </head>
      <body>
        <Header
          siteName={settings.siteName}
          logoUrl={settings.logoUrl}
          phone={settings.phone}
          navPages={navPages.map((p) => ({ slug: p.slug, title: p.title }))}
        />
        <main className="min-h-[60vh]">{children}</main>
        <Footer
          siteName={settings.siteName}
          logoUrl={settings.logoUrl}
          aboutShort={settings.aboutShort}
          phone={settings.phone}
          customerPhone={settings.customerPhone}
          email={settings.email}
          address={settings.address}
          footerText={settings.footerText}
          instagram={settings.instagram}
          telegram={settings.telegram}
          whatsapp={settings.whatsapp}
          navPages={navPages.map((p) => ({ slug: p.slug, title: p.title }))}
        />
      </body>
    </html>
  );
}
