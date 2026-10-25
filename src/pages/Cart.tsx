import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useCart } from '../store/cart'
import { formatToman, toFaDigits } from '../lib/format'
import { PlusIcon, MinusIcon, TrashIcon, CartIcon } from '../components/icons'

const FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="100%" height="100%" fill="#f0f1f3"/></svg>`)

export default function Cart() {
  const cart = useCart()
  const navigate = useNavigate()
  const total = cart.total()
  const count = cart.items.reduce((n, i) => n + i.qty, 0)

  if (cart.items.length === 0) {
    return (
      <div>
        <Header title="سبد خرید" />
        <div className="flex flex-col items-center justify-center px-8 py-24 text-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-brand-light">
            <CartIcon className="h-12 w-12 text-brand" />
          </div>
          <p className="text-base font-bold text-gray-700">سبد خرید شما خالی است</p>
          <p className="mt-1 text-sm text-gray-400">محصولات مورد علاقه‌تان را اضافه کنید</p>
          <Link to="/" className="mt-6 rounded-xl bg-brand px-8 py-3 font-bold text-white">
            مشاهده محصولات
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-40">
      <Header title={`سبد خرید (${toFaDigits(count)})`} />
      <div className="mx-auto max-w-lg space-y-3 p-4">
        {cart.items.map((item) => (
          <div key={item.id} className="flex gap-3 rounded-2xl bg-white p-3 shadow-card">
            <Link to={`/product/${item.id}`} className="shrink-0">
              <img
                src={item.image || FALLBACK}
                alt={item.name}
                className="h-20 w-20 rounded-xl object-cover"
                onError={(e) => ((e.target as HTMLImageElement).src = FALLBACK)}
              />
            </Link>
            <div className="flex flex-1 flex-col">
              <Link to={`/product/${item.id}`} className="line-clamp-2 text-[13px] font-medium leading-5 text-gray-800">
                {item.name}
              </Link>
              <div className="mt-auto flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-1">
                  <button onClick={() => cart.increment(item.id)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white">
                    <PlusIcon className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold">{toFaDigits(item.qty)}</span>
                  {item.qty > 1 ? (
                    <button onClick={() => cart.decrement(item.id)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-brand shadow-sm">
                      <MinusIcon className="h-4 w-4" />
                    </button>
                  ) : (
                    <button onClick={() => cart.remove(item.id)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-accent shadow-sm">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-extrabold text-gray-900">{formatToman(item.price * item.qty)}</span>
                  <span className="text-[10px] text-gray-500">تومان</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button onClick={() => cart.clear()} className="w-full py-2 text-center text-xs text-gray-400">
          حذف همه محصولات
        </button>
      </div>

      {/* Sticky summary */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white p-4 shadow-nav safe-bottom">
        <div className="mx-auto max-w-lg">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-gray-500">مبلغ قابل پرداخت</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-gray-900">{formatToman(total)}</span>
              <span className="text-xs text-gray-500">تومان</span>
            </div>
          </div>
          <button onClick={() => navigate('/checkout')} className="w-full rounded-xl bg-brand py-3.5 text-center font-bold text-white">
            ادامه فرآیند خرید
          </button>
        </div>
      </div>
    </div>
  )
}
