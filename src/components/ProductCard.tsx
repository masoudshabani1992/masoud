import { Link } from 'react-router-dom'
import type { Product } from '../lib/types'
import { formatToman, priceToNumber, toFaDigits } from '../lib/format'
import { StarIcon, PlusIcon } from './icons'
import { useCart } from '../store/cart'

const FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="#f0f1f3"/><text x="50%" y="50%" font-size="18" fill="#aaa" text-anchor="middle" dominant-baseline="middle">مانوش</text></svg>`,
  )

export default function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add)
  const price = priceToNumber(product.prices?.price)
  const regular = priceToNumber(product.prices?.regular_price)
  const onSale = product.on_sale && regular > price
  const discount = onSale ? Math.round(((regular - price) / regular) * 100) : 0
  const rating = Number(product.average_rating) || 0
  const img = product.images?.[0]?.thumbnail || product.images?.[0]?.src || FALLBACK

  return (
    <div className="relative flex flex-col rounded-2xl bg-white p-2.5 shadow-card">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50">
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={(e) => ((e.target as HTMLImageElement).src = FALLBACK)}
          />
          {discount > 0 && (
            <span className="absolute right-1.5 top-1.5 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white">
              ٪{toFaDigits(discount)}
            </span>
          )}
          {!product.is_in_stock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-bold text-gray-600">
              ناموجود
            </div>
          )}
        </div>
        <h3 className="mt-2 line-clamp-2 min-h-[2.5rem] text-[13px] font-medium leading-5 text-gray-800">
          {product.name}
        </h3>
      </Link>

      <div className="mt-1.5 flex items-center gap-1 text-xs text-amber-500">
        {rating > 0 ? (
          <>
            <StarIcon className="h-3.5 w-3.5" />
            <span className="text-gray-600">{toFaDigits(rating.toFixed(1))}</span>
          </>
        ) : (
          <span className="text-transparent">.</span>
        )}
      </div>

      <div className="mt-auto flex items-end justify-between pt-2">
        <div className="flex flex-col">
          {onSale && (
            <span className="text-[11px] text-gray-400 line-through">{formatToman(regular)}</span>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-extrabold text-gray-900">{formatToman(price)}</span>
            <span className="text-[10px] text-gray-500">تومان</span>
          </div>
        </div>
        {product.is_in_stock && (
          <button
            aria-label="افزودن به سبد"
            onClick={() => add(product)}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white active:scale-95 transition"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl bg-white p-2.5 shadow-card">
      <div className="skeleton aspect-square rounded-xl" />
      <div className="skeleton mt-2 h-4 w-full rounded" />
      <div className="skeleton mt-1.5 h-4 w-2/3 rounded" />
      <div className="skeleton mt-3 h-5 w-1/2 rounded" />
    </div>
  )
}
