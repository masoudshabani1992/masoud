import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCategory, getProducts, type ProductQuery } from '../lib/api'
import Header from '../components/Header'
import ProductGrid from '../components/ProductGrid'

const SORTS: { key: NonNullable<ProductQuery['orderby']>; order: 'asc' | 'desc'; label: string }[] = [
  { key: 'date', order: 'desc', label: 'جدیدترین' },
  { key: 'popularity', order: 'desc', label: 'پرفروش‌ترین' },
  { key: 'price', order: 'asc', label: 'ارزان‌ترین' },
  { key: 'price', order: 'desc', label: 'گران‌ترین' },
]

export default function CategoryPage() {
  const { id } = useParams()
  const [sortIdx, setSortIdx] = useState(0)
  const sort = SORTS[sortIdx]

  const cat = useQuery({ queryKey: ['category', id], queryFn: () => getCategory(id!), enabled: !!id })
  const products = useQuery({
    queryKey: ['products', 'cat', id, sort.key, sort.order],
    queryFn: () => getProducts({ category: id, orderby: sort.key, order: sort.order, per_page: 30 }),
    enabled: !!id,
  })

  return (
    <div className="pb-4">
      <Header title={cat.data?.name || 'محصولات'} showBack />
      <div className="sticky top-14 z-20 bg-[#f4f5f7]/95 backdrop-blur">
        <div className="no-scrollbar mx-auto flex max-w-lg gap-2 overflow-x-auto px-4 py-2.5">
          {SORTS.map((s, i) => (
            <button
              key={s.label}
              onClick={() => setSortIdx(i)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                i === sortIdx ? 'bg-brand text-white' : 'bg-white text-gray-600'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-lg p-4">
        {!products.isLoading && products.data?.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-400">محصولی در این دسته یافت نشد.</p>
        ) : (
          <ProductGrid products={products.data} loading={products.isLoading} />
        )}
      </div>
    </div>
  )
}
