import { Link } from 'react-router-dom'
import type { Product } from '../lib/types'
import ProductCard, { ProductCardSkeleton } from './ProductCard'
import { ChevronLeft } from './icons'

interface Props {
  title: string
  products?: Product[]
  loading?: boolean
  moreTo?: string
  accent?: boolean
}

export default function ProductRail({ title, products, loading, moreTo, accent }: Props) {
  return (
    <section className="py-3">
      <div className="mb-2 flex items-center justify-between px-4">
        <h2 className={`text-base font-bold ${accent ? 'text-accent' : 'text-gray-800'}`}>{title}</h2>
        {moreTo && (
          <Link to={moreTo} className="flex items-center gap-0.5 text-xs text-brand">
            مشاهده همه
            <ChevronLeft className="h-4 w-4" />
          </Link>
        )}
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-36 shrink-0">
                <ProductCardSkeleton />
              </div>
            ))
          : products?.map((p) => (
              <div key={p.id} className="w-36 shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
      </div>
    </section>
  )
}
