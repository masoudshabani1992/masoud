import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getCategories } from '../lib/api'
import Header from '../components/Header'
import { toFaDigits } from '../lib/format'
import { ChevronBack } from '../components/icons'

const EMOJI: Record<string, string> = {
  عسل: '🍯', زنبور: '🐝', روغن: '🫒', کره: '🥜', کنجد: '🌰', شیره: '🍶',
  خشکبار: '🥜', غلات: '🌾', دانه: '🌱', ادویه: '🌶️', معجون: '🧪',
  شربت: '🥤', چاشنی: '🧂', چای: '🍵', آبلیمو: '🍋', آبغوره: '🍇',
}
function emojiFor(name: string) {
  for (const k of Object.keys(EMOJI)) if (name.includes(k)) return EMOJI[k]
  return '🛒'
}

export default function Categories() {
  const { data, isLoading } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  // top-level categories (parent === 0) with products; fall back to all if none
  const top = data?.filter((c) => c.parent === 0) ?? []
  const list = top.length ? top : data ?? []

  return (
    <div className="pb-4">
      <Header title="دسته‌بندی محصولات" />
      <div className="mx-auto max-w-lg p-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {list.map((c) => (
              <Link
                key={c.id}
                to={`/category/${c.id}`}
                className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-card active:scale-[0.98] transition"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-light text-2xl">
                    {emojiFor(c.name)}
                  </span>
                  <div className="leading-tight">
                    <p className="text-sm font-bold text-gray-800">{c.name}</p>
                    <p className="text-[11px] text-gray-400">{toFaDigits(c.count)} کالا</p>
                  </div>
                </div>
                <ChevronBack className="h-4 w-4 text-gray-300" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
