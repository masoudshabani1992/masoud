import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useCart } from '../store/cart'
import { formatToman, toFaDigits } from '../lib/format'
import { placeOrder, type BillingInfo } from '../lib/checkout'

const IRAN_PROVINCES = [
  'تهران', 'اصفهان', 'فارس', 'خراسان رضوی', 'آذربایجان شرقی', 'آذربایجان غربی',
  'مازندران', 'گیلان', 'البرز', 'کرمان', 'خوزستان', 'قم', 'یزد', 'همدان',
  'کرمانشاه', 'گلستان', 'اردبیل', 'قزوین', 'زنجان', 'سمنان', 'مرکزی',
  'لرستان', 'کردستان', 'هرمزگان', 'بوشهر', 'سیستان و بلوچستان', 'ایلام',
  'چهارمحال و بختیاری', 'کهگیلویه و بویراحمد', 'خراسان شمالی', 'خراسان جنوبی',
]

const empty: BillingInfo = {
  first_name: '', last_name: '', phone: '', email: '',
  address_1: '', city: '', state: 'تهران', postcode: '',
}

export default function Checkout() {
  const cart = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState<BillingInfo>(empty)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const total = cart.total()
  const set = (k: keyof BillingInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const valid =
    form.first_name.trim() && form.last_name.trim() &&
    /^09\d{9}$/.test(form.phone.trim()) &&
    form.address_1.trim().length > 5 && form.city.trim()

  async function submit() {
    setError('')
    if (!valid) {
      setError('لطفاً همه فیلدهای ضروری را درست وارد کنید (شماره موبایل: ۰۹xxxxxxxxx).')
      return
    }
    setLoading(true)
    try {
      const order = await placeOrder(cart.items, {
        ...form,
        email: form.email.trim() || `${form.phone.trim()}@manoosh.app`,
      })
      cart.clear()
      // If the gateway returned a payment URL, send the customer to Zarinpal.
      if (order.payment_url) {
        navigate('/order-success', {
          state: { orderId: order.order_id, total, paymentUrl: order.payment_url },
          replace: true,
        })
        window.location.href = order.payment_url
        return
      }
      navigate('/order-success', {
        state: { orderId: order.order_id, total, paymentUrl: order.payment_url },
        replace: true,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطای ناشناخته')
    } finally {
      setLoading(false)
    }
  }

  if (cart.items.length === 0) {
    return (
      <div>
        <Header title="تکمیل خرید" showBack />
        <p className="p-16 text-center text-sm text-gray-400">سبد خرید خالی است.</p>
      </div>
    )
  }

  const field = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-brand focus:bg-white'

  return (
    <div className="pb-40">
      <Header title="تکمیل خرید" showBack />
      <div className="mx-auto max-w-lg space-y-4 p-4">
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <h2 className="mb-3 text-sm font-bold text-gray-800">اطلاعات گیرنده</h2>
          <div className="grid grid-cols-2 gap-3">
            <input className={field} placeholder="نام *" value={form.first_name} onChange={set('first_name')} />
            <input className={field} placeholder="نام خانوادگی *" value={form.last_name} onChange={set('last_name')} />
          </div>
          <input className={`${field} mt-3`} placeholder="شماره موبایل * (۰۹xxxxxxxxx)" inputMode="numeric" value={form.phone} onChange={set('phone')} />
          <input className={`${field} mt-3`} placeholder="ایمیل (اختیاری)" inputMode="email" value={form.email} onChange={set('email')} />
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-card">
          <h2 className="mb-3 text-sm font-bold text-gray-800">آدرس تحویل</h2>
          <div className="grid grid-cols-2 gap-3">
            <select className={field} value={form.state} onChange={set('state')}>
              {IRAN_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <input className={field} placeholder="شهر *" value={form.city} onChange={set('city')} />
          </div>
          <textarea
            className={`${field} mt-3 min-h-[80px] resize-none`}
            placeholder="نشانی کامل پستی *"
            value={form.address_1}
            onChange={(e) => setForm((f) => ({ ...f, address_1: e.target.value }))}
          />
          <input className={`${field} mt-3`} placeholder="کد پستی" inputMode="numeric" value={form.postcode} onChange={set('postcode')} />
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-card">
          <h2 className="mb-3 text-sm font-bold text-gray-800">شیوه پرداخت</h2>
          <div className="flex items-center gap-3 rounded-xl border border-brand bg-brand-light p-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white text-xs">✓</span>
            <div>
              <p className="text-sm font-medium text-gray-800">پرداخت آنلاین (زرین‌پال)</p>
              <p className="text-[11px] text-gray-500">پس از ثبت سفارش به درگاه بانکی منتقل می‌شوید</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>تعداد اقلام</span>
            <span>{toFaDigits(cart.items.reduce((n, i) => n + i.qty, 0))} عدد</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-dashed pt-2 text-sm">
            <span className="font-bold text-gray-800">مبلغ قابل پرداخت</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-gray-900">{formatToman(total)}</span>
              <span className="text-xs text-gray-500">تومان</span>
            </div>
          </div>
        </div>

        {error && <p className="rounded-xl bg-red-50 p-3 text-center text-sm text-accent">{error}</p>}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white p-4 shadow-nav safe-bottom">
        <div className="mx-auto max-w-lg">
          <button
            onClick={submit}
            disabled={loading}
            className="w-full rounded-xl bg-brand py-3.5 text-center font-bold text-white disabled:opacity-60"
          >
            {loading ? 'در حال انتقال به درگاه…' : 'ثبت سفارش و پرداخت'}
          </button>
        </div>
      </div>
    </div>
  )
}
