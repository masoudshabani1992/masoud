import { useQuery } from '@tanstack/react-query'
import { getCategories, getProducts } from '../lib/api'
import SearchBar from '../components/SearchBar'
import BannerSlider from '../components/BannerSlider'
import CategoryStrip from '../components/CategoryStrip'
import ProductRail from '../components/ProductRail'

export default function Home() {
  const categories = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  const newest = useQuery({
    queryKey: ['products', 'newest'],
    queryFn: () => getProducts({ orderby: 'date', order: 'desc', per_page: 10 }),
  })
  const onSale = useQuery({
    queryKey: ['products', 'onsale'],
    queryFn: () => getProducts({ on_sale: true, per_page: 10 }),
  })
  const popular = useQuery({
    queryKey: ['products', 'popular'],
    queryFn: () => getProducts({ orderby: 'popularity', order: 'desc', per_page: 10 }),
  })

  return (
    <div className="pb-4">
      <header className="bg-brand px-4 pb-3 pt-3 safe-top">
        <div className="mx-auto max-w-lg">
          <div className="mb-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <div className="leading-tight">
                <p className="text-sm font-extrabold">مانوش ارگانیک</p>
                <p className="text-[10px] opacity-80">محصولات طبیعی و ارگانیک</p>
              </div>
            </div>
          </div>
          <SearchBar />
        </div>
      </header>

      <div className="mx-auto max-w-lg">
        <BannerSlider />
        <CategoryStrip categories={categories.data} loading={categories.isLoading} />

        <ProductRail
          title="🔥 پیشنهاد شگفت‌انگیز"
          products={onSale.data}
          loading={onSale.isLoading}
          moreTo="/search?filter=onsale"
          accent
        />
        <ProductRail
          title="جدیدترین محصولات"
          products={newest.data}
          loading={newest.isLoading}
          moreTo="/search?filter=newest"
        />
        <ProductRail
          title="پرفروش‌ترین‌ها"
          products={popular.data}
          loading={popular.isLoading}
          moreTo="/search?filter=popular"
        />
      </div>
    </div>
  )
}
