import Link from "next/link";
import type { NewsItem } from "@/lib/models/news";
import { formatJalaliDate, excerptFromHtml } from "@/lib/utils";

export default function NewsCard({ item }: { item: NewsItem }) {
  const isCircular = item.type === "CIRCULAR";
  return (
    <Link
      href={`/news/${item.slug}`}
      className="card-kh group flex h-full flex-col overflow-hidden"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-smoke">
        {item.coverImage ? (
          <img
            src={item.coverImage}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-ink text-white/70">
            <span className="text-sm font-bold">کوشا خودرو</span>
          </div>
        )}
        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold ${
            isCircular ? "bg-white text-ink border border-ink" : "bg-ink text-white"
          }`}
        >
          {isCircular ? "بخشنامه" : "خبر"}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="mb-2 text-xs font-bold text-ink/40">{formatJalaliDate(item.publishedAt)}</span>
        <h3 className="line-clamp-2 text-base font-black leading-7 text-ink">{item.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/60">
          {item.excerpt || excerptFromHtml(item.content)}
        </p>
        <span className="mt-auto flex items-center gap-1 pt-4 text-sm font-bold text-ink">
          ادامه مطلب
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
