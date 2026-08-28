import { useEffect, useRef, useState } from 'react'
import { toFaDigits } from '../lib/format'

const banners = [
  { color: 'from-emerald-500 to-green-600', title: 'عسل طبیعی مانوش', sub: 'مستقیم از کندوهای ارگانیک', emoji: '🍯' },
  { color: 'from-amber-500 to-orange-500', title: 'روغن‌های درمانی', sub: 'خالص و طبیعی', emoji: '🫒' },
  { color: 'from-rose-500 to-red-500', title: 'تخفیف‌های هفتگی', sub: 'تا ۳۰٪ تخفیف روی محصولات منتخب', emoji: '🎁' },
]

export default function BannerSlider() {
  const [i, setI] = useState(0)
  const timer = useRef<number>()

  useEffect(() => {
    timer.current = window.setInterval(() => setI((v) => (v + 1) % banners.length), 4000)
    return () => window.clearInterval(timer.current)
  }, [])

  return (
    <div className="px-4 pt-3">
      <div className="relative h-36 overflow-hidden rounded-2xl">
        {banners.map((b, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 flex items-center justify-between bg-gradient-to-l ${b.color} px-5 text-white transition-opacity duration-700 ${
              idx === i ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div>
              <h3 className="text-xl font-extrabold drop-shadow">{b.title}</h3>
              <p className="mt-1 text-sm opacity-90">{b.sub}</p>
            </div>
            <span className="text-6xl drop-shadow-lg">{b.emoji}</span>
          </div>
        ))}
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              aria-label={`اسلاید ${toFaDigits(idx + 1)}`}
              onClick={() => setI(idx)}
              className={`h-1.5 rounded-full transition-all ${idx === i ? 'w-5 bg-white' : 'w-1.5 bg-white/60'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
