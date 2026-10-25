import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProducts, type ProductQuery } from '../lib/api'
import SearchBar from '../components/SearchBar'
import ProductGrid from '../components/ProductGrid'
import { ChevronBack } from '../components/icons'
import { useNavigate } from 'react-router-dom'

const SUGGESTIONS = ['عسل', 'روغن زیتون', 'کره بادام', 'ارده', 'چای', 'خشکبار']

export default function Search() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const q = params.get('q') || ''
  const filter = params.get('filter') || ''
  const [debounced, setDebounced] = useState(q)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 250)
    return () => clearTimeout(t)
  }, [q])

  const query: ProductQuery = { per_page: 30 }
  if (debounced) query.search = debounced
  if (filter === 'onsale') query.on_sale = true
  if (filter === 'newest') { query.orderby = 'date'; query.order = 'desc' }
  if (filter === 'popular') { query.orderby = 'popularity'; query.order = 'desc' }

  const active = !!debounced || !!filter
  const products = useQuery({
    queryKey: ['products', 'search', debounced, filter],
    queryFn: () => getProducts(query),
    enabled: active,
  })

  const title =
    filter === 'onsale' ? 'پیشنهاد شگفت‌انگیز' :
    filter === 'newest' ? 'جدیدترین محصولات' :
    filter === 'popular' ? 'پرفروش‌ترین‌ها' : ''

  return (
    <div className="pb-4">
      <header className="sticky top-0 z-30 bg-brand px-4 py-3 safe-top">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <button
            aria-label="بازگشت"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white active:bg-white/10"
          >
            <ChevronBack className="h-6 w-6" />
          </button>
          <SearchBar readOnly={false} defaultValue={q} />
        </div>
      </header>

      <div className="mx-auto max-w-lg p-4">
        {!active ? (
          <div>
            <p className="mb-3 text-sm font-bold text-gray-700">جستجوهای پرطرفدار</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(s)}`)}
                  className="rounded-full bg-white px-4 py-2 text-sm text-gray-700 shadow-card"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {title && <h2 className="mb-3 text-base font-bold text-gray-800">{title}</h2>}
            {!products.isLoading && products.data?.length === 0 ? (
              <p className="py-16 text-center text-sm text-gray-400">نتیجه‌ای یافت نشد 🔍</p>
            ) : (
              <ProductGrid products={products.data} loading={products.isLoading} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
