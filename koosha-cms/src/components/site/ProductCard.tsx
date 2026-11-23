import Link from "next/link";
import type { Product } from "@/lib/models/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="card-kh group flex h-full flex-col overflow-hidden"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-smoke">
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
        {product.badge && (
          <span className="absolute right-3 top-3 rounded-full bg-ink px-3 py-1 text-[11px] font-bold text-white">
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {product.category && (
          <span className="mb-1 text-[11px] font-bold uppercase tracking-wider text-ink/40">
            {product.category}
          </span>
        )}
        <h3 className="text-lg font-black text-ink">{product.name}</h3>
        {product.subtitle && <p className="mt-1 text-sm text-ink/60">{product.subtitle}</p>}
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="text-sm font-bold text-ink">
            {product.priceLabel || "استعلام قیمت"}
          </span>
          <span className="flex items-center gap-1 text-sm font-bold text-ink transition group-hover:gap-2">
            مشاهده
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
