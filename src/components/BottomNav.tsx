import { NavLink, useLocation } from 'react-router-dom'
import { HomeIcon, GridIcon, CartIcon, UserIcon } from './icons'
import { useCart } from '../store/cart'
import { toFaDigits } from '../lib/format'

const items = [
  { to: '/', label: 'خانه', Icon: HomeIcon, exact: true },
  { to: '/categories', label: 'دسته‌بندی', Icon: GridIcon },
  { to: '/cart', label: 'سبد خرید', Icon: CartIcon },
  { to: '/account', label: 'حساب من', Icon: UserIcon },
]

export default function BottomNav() {
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0))
  const { pathname } = useLocation()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white shadow-nav safe-bottom">
      <ul className="mx-auto flex max-w-lg items-stretch justify-around">
        {items.map(({ to, label, Icon, exact }) => {
          const active = exact ? pathname === to : pathname.startsWith(to)
          return (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                className={`relative flex flex-col items-center gap-1 py-2 text-[11px] transition ${
                  active ? 'text-brand' : 'text-gray-400'
                }`}
              >
                <span className="relative">
                  <Icon className="h-6 w-6" filled={active} />
                  {to === '/cart' && count > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                      {toFaDigits(count)}
                    </span>
                  )}
                </span>
                {label}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
