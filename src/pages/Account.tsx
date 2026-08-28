import Header from '../components/Header'
import { UserIcon, CartIcon, HeartIcon, ChevronBack } from '../components/icons'

const rows = [
  { icon: CartIcon, label: 'سفارش‌های من', hint: 'پیگیری و تاریخچه خرید' },
  { icon: HeartIcon, label: 'علاقه‌مندی‌ها', hint: 'محصولات ذخیره‌شده' },
]

export default function Account() {
  return (
    <div className="pb-4">
      <Header title="حساب کاربری" />
      <div className="mx-auto max-w-lg p-4">
        <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-card">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-light">
            <UserIcon className="h-8 w-8 text-brand" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-800">مهمان عزیز</p>
            <p className="text-xs text-gray-400">برای مشاهده سفارش‌ها وارد شوید</p>
          </div>
          <a
            href="https://manooshorganic.com/my-account/"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white"
          >
            ورود
          </a>
        </div>

        <div className="mt-4 divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-card">
          {rows.map(({ icon: Icon, label, hint }) => (
            <a
              key={label}
              href="https://manooshorganic.com/my-account/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-4 active:bg-gray-50"
            >
              <Icon className="h-6 w-6 text-brand" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-[11px] text-gray-400">{hint}</p>
              </div>
              <ChevronBack className="h-4 w-4 text-gray-300" />
            </a>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-card">
          <a href="https://manooshorganic.com/" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 active:bg-gray-50">
            <span className="text-sm text-gray-700">وب‌سایت مانوش ارگانیک</span>
            <ChevronBack className="h-4 w-4 text-gray-300" />
          </a>
          <a href="tel:" className="flex items-center justify-between border-t border-gray-100 p-4 active:bg-gray-50">
            <span className="text-sm text-gray-700">تماس با پشتیبانی</span>
            <ChevronBack className="h-4 w-4 text-gray-300" />
          </a>
        </div>

        <p className="mt-6 text-center text-[11px] text-gray-400">
          اپلیکیشن مانوش ارگانیک · نسخه ۱٫۰٫۰
        </p>
      </div>
    </div>
  )
}
