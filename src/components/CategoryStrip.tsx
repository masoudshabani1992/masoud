import { Link } from 'react-router-dom'
import type { Category } from '../lib/types'

const EMOJI: Record<string, string> = {
  عسل: '🍯',
  زنبور: '🐝',
  روغن: '🫒',
  کره: '🥜',
  کنجد: '🌰',
  شیره: '🍶',
  خشکبار: '🥜',
  غلات: '🌾',
  دانه: '🌱',
  ادویه: '🌶️',
  معجون: '🧪',
  شربت: '🥤',
  چاشنی: '🧂',
  چای: '🍵',
  آبلیمو: '🍋',
  آبغوره: '🍇',
}

function emojiFor(name: string): string {
  for (const key of Object.keys(EMOJI)) if (name.includes(key)) return EMOJI[key]
  return '🛒'
}

export default function CategoryStrip({ categories, loading }: { categories?: Category[]; loading?: boolean }) {
  return (
    <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 py-4">
      {loading
        ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex shrink-0 flex-col items-center gap-1.5">
              <div className="skeleton h-16 w-16 rounded-full" />
              <div className="skeleton h-3 w-12 rounded" />
            </div>
          ))
        : categories?.slice(0, 12).map((c) => (
            <Link key={c.id} to={`/category/${c.id}`} className="flex w-16 shrink-0 flex-col items-center gap-1.5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-light text-3xl">
                {c.image?.thumbnail ? (
                  <img src={c.image.thumbnail} alt={c.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  emojiFor(c.name)
                )}
              </div>
              <span className="line-clamp-1 text-center text-[11px] text-gray-700">{c.name}</span>
            </Link>
          ))}
    </div>
  )
}
