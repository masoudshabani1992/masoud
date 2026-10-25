import { Link, useLocation } from 'react-router-dom'
import { formatToman, toFaDigits } from '../lib/format'

interface State {
  orderId?: number
  total?: number
  paymentUrl?: string
}

export default function OrderSuccess() {
  const { state } = useLocation() as { state: State | null }
  const orderId = state?.orderId
  const total = state?.total ?? 0
  const paymentUrl = state?.paymentUrl

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-8 text-center">
      <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-brand-light">
        <svg className="h-14 w-14 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <h1 className="text-xl font-extrabold text-gray-900">سفارش شما ثبت شد!</h1>
      <p className="mt-2 text-sm text-gray-500">
        {paymentUrl
          ? 'در حال انتقال به درگاه پرداخت زرین‌پال… اگر منتقل نشدید، دکمه زیر را بزنید.'
          : 'از خرید شما سپاسگزاریم. سفارش شما در حال پردازش است.'}
      </p>

      <div className="mt-6 w-full max-w-xs space-y-2 rounded-2xl bg-white p-4 text-sm shadow-card">
        {orderId && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">شماره سفارش</span>
            <span className="font-bold text-gray-800">{toFaDigits(orderId)}#</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-gray-500">مبلغ</span>
          <span className="font-bold text-gray-800">{formatToman(total)} تومان</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">شیوه پرداخت</span>
          <span className="font-bold text-gray-800">پرداخت آنلاین (زرین‌پال)</span>
        </div>
      </div>

      {paymentUrl && (
        <a href={paymentUrl} rel="noreferrer" className="mt-5 w-full max-w-xs rounded-xl bg-accent py-3 font-bold text-white">
          پرداخت آنلاین
        </a>
      )}

      <Link to="/" className="mt-4 w-full max-w-xs rounded-xl bg-brand py-3 font-bold text-white">
        بازگشت به فروشگاه
      </Link>
    </div>
  )
}
