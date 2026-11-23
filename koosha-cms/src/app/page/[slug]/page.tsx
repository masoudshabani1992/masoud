import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ScrollReveal from "@/components/site/ScrollReveal";
import { getPageBySlug } from "@/lib/models/pages";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const page = getPageBySlug(params.slug);
  if (!page) return {};
  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription,
    keywords: page.seoKeywords,
    openGraph: page.ogImage ? { images: [page.ogImage] } : undefined,
  };
}

export default function GenericPage({ params }: { params: { slug: string } }) {
  const page = getPageBySlug(params.slug);
  if (!page || !page.isActive) notFound();

  return (
    <div>
      <section className="border-b border-line bg-smoke py-16">
        <div className="container-kh text-center">
          <ScrollReveal>
            <h1 className="section-title">{page.title}</h1>
          </ScrollReveal>
        </div>
      </section>

      {page.coverImage && (
        <div className="container-kh -mt-0 pt-10">
          <div className="overflow-hidden rounded-3xl">
            <img src={page.coverImage} alt={page.title} className="aspect-[16/7] w-full object-cover" />
          </div>
        </div>
      )}

      <section className="py-16">
        <div className="container-kh mx-auto max-w-3xl">
          <ScrollReveal className="kh-prose text-ink/80">
            {page.content.split("\n\n").filter(Boolean).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
