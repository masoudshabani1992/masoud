import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProduct, getProducts } from '../lib/api'
import Header from '../components/Header'
import ProductRail from '../components/ProductRail'
import { formatToman, priceToNumber, stripHtml, toFaDigits } from '../lib/format'
import { StarIcon, PlusIcon, MinusIcon, HeartIcon } from '../components/icons'
import { useCart } from '../store/cart'

const FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#f0f1f3"/><text x="50%" y="50%" font-size="28" fill="#bbb" text-anchor="middle" dominant-baseline="middle">مانوش</text></svg>`,
  )

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeImg, setActiveImg] = useState(0)
  const [fav, setFav] = useState(false)

  const { data: p, isLoading } = useQuery({ queryKey: ['product', id], queryFn: () => getProduct(id!), enabled: !!id })
  const catId = p?.categories?.[0]?.id
  const related = useQuery({
    queryKey: ['products', 'related', catId],
    queryFn: () => getProducts({ category: catId, per_page: 8 }),
    enabled: !!catId,
  })

  const cart = useCart()
  const inCartQty = p ? cart.qtyOf(p.id) : 0

  if (isLoading) {
    return (
      <div>
        <Header showBack />
        <div className="mx-auto max-w-lg p-4">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="skeleton mt-4 h-6 w-3/4 rounded" />
          <div className="skeleton mt-2 h-6 w-1/2 rounded" />
          <div className="skeleton mt-6 h-24 w-full rounded" />
        </div>
      </div>
    )
  }

  if (!p) {
    return (
      <div>
        <Header showBack title="محصول" />
        <p className="p-16 text-center text-sm text-gray-400">محصول یافت نشد.</p>
      </div>
    )
  }

  const price = priceToNumber(p.prices?.price)
  const regular = priceToNumber(p.prices?.regular_price)
  const onSale = p.on_sale && regular > price
  const discount = onSale ? Math.round(((regular - price) / regular) * 100) : 0
  const rating = Number(p.average_rating) || 0
  const images = p.images?.length ? p.images : [{ id: 0, src: FALLBACK, thumbnail: FALLBACK, name: '', alt: '' }]
  const desc = stripHtml(p.description || p.short_description || '')

  return (
    <div className="pb-28">
      <Header
        showBack
        right={
          <button
            aria-label="علاقه‌مندی"
            onClick={() => setFav((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full active:bg-white/10"
          >
            <HeartIcon className="h-6 w-6" filled={fav} />
          </button>
        }
      />
      <div className="mx-auto max-w-lg">
        {/* Gallery */}
        <div className="bg-white p-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50">
            <img
              src={images[activeImg]?.src || FALLBACK}
              alt={p.name}
              className="h-full w-full object-contain"
              onError={(e) => ((e.target as HTMLImageElement).src = FALLBACK)}
            />
            {discount > 0 && (
              <span className="absolute right-3 top-3 rounded-full bg-accent px-2.5 py-1 text-sm font-bold text-white">
                ٪{toFaDigits(discount)} تخفیف
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id + '-' + i}
                  onClick={() => setActiveImg(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${
                    i === activeImg ? 'border-brand' : 'border-transparent'
                  }`}
                >
                  <img src={img.thumbnail || img.src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-2 bg-white p-4">
          <h1 className="text-lg font-bold leading-7 text-gray-900">{p.name}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm">
            {rating > 0 && (
              <span className="flex items-center gap-1 text-amber-500">
                <StarIcon className="h-4 w-4" />
                <span className="text-gray-600">{toFaDigits(rating.toFixed(1))}</span>
                <span className="text-gray-400">({toFaDigits(p.review_count)} دیدگاه)</span>
              </span>
            )}
            <span className={`text-xs font-medium ${p.is_in_stock ? 'text-brand' : 'text-accent'}`}>
              {p.is_in_stock ? '✓ موجود در انبار' : 'ناموجود'}
            </span>
          </div>
          {p.categories?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {p.categories.map((c) => (
                <Link key={c.id} to={`/category/${c.id}`} className="rounded-full bg-brand-light px-3 py-1 text-xs text-brand-dark">
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        {desc && (
          <div className="mt-2 bg-white p-4">
            <h2 className="mb-2 text-sm font-bold text-gray-800">معرفی محصول</h2>
            <p className="text-sm leading-7 text-gray-600">{desc.slice(0, 600)}{desc.length > 600 ? '…' : ''}</p>
          </div>
        )}

        {/* Related */}
        {related.data && related.data.filter((x) => x.id !== p.id).length > 0 && (
          <div className="mt-2 bg-white">
            <ProductRail title="محصولات مشابه" products={related.data.filter((x) => x.id !== p.id)} />
          </div>
        )}
      </div>

      {/* Sticky buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white p-3 shadow-nav safe-bottom">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="flex flex-col">
            {onSale && <span className="text-xs text-gray-400 line-through">{formatToman(regular)}</span>}
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-gray-900">{formatToman(price)}</span>
              <span className="text-xs text-gray-500">تومان</span>
            </div>
          </div>

          {inCartQty > 0 ? (
            <div className="flex flex-1 items-center justify-between rounded-xl bg-brand-light px-2 py-1.5">
              <button onClick={() => cart.increment(p.id)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
                <PlusIcon className="h-5 w-5" />
              </button>
              <span className="font-bold text-brand-dark">{toFaDigits(inCartQty)} در سبد</span>
              <button onClick={() => cart.decrement(p.id)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand">
                <MinusIcon className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <button
              disabled={!p.is_in_stock}
              onClick={() => cart.add(p)}
              className="flex-1 rounded-xl bg-brand py-3 text-center font-bold text-white disabled:bg-gray-300"
            >
              {p.is_in_stock ? 'افزودن به سبد خرید' : 'ناموجود'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
