import type { Product } from '../lib/types'
import ProductCard, { ProductCardSkeleton } from './ProductCard'

export default function ProductGrid({
  products,
  loading,
  skeletonCount = 6,
}: {
  products?: Product[]
  loading?: boolean
  skeletonCount?: number
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {loading
        ? Array.from({ length: skeletonCount }).map((_, i) => <ProductCardSkeleton key={i} />)
        : products?.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
