import React, { useEffect, useState } from 'react';
import {
  BatteryCharging,
  ShieldCheck,
  MonitorSmartphone,
  Server,
  LogIn,
  UserCheck,
  Download,
  Moon,
  Sun,
} from 'lucide-react';
import { apiRequest, setStoredToken } from '../api.js';

export default function LoginView({ onLoggedIn, isDark, onToggleDark }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [publicInfo, setPublicInfo] = useState({
    storeName: 'نمایندگی صبا باتری - باتری کاوه',
    storeSubtitle: 'اتوماسیون یکپارچه فروش، صندوق و اتصال به سپیدار',
    accounts: [
      {
        username: 'admin',
        full_name: 'مدیر مالی (دفتر طبقه بالا)',
        role: 'admin',
        station_name: 'طبقه بالا - مدیریت مالی و سپیدار',
      },
      {
        username: 'cashier1',
        full_name: 'علی رضایی',
        role: 'cashier',
        station_name: 'طبقه پایین - صندوق ۱',
      },
      {
        username: 'cashier2',
        full_name: 'محمد کریمی',
        role: 'cashier',
        station_name: 'طبقه پایین - صندوق ۲',
      },
    ],
  });

  useEffect(() => {
    apiRequest('/api/public-info')
      .then((data) => {
        if (data && Array.isArray(data.accounts) && data.accounts.length > 0) {
          setPublicInfo(data);
        }
      })
      .catch(() => {});
  }, []);

  const submitLogin = async (u, p) => {
    setError('');
    setLoading(true);
    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: u, password: p }),
      });
      setStoredToken(data.token);
      onLoggedIn(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitLogin(username, password);
  };

  const quickFillAndLogin = (accUsername) => {
    setUsername(accUsername);
    setPassword('123456');
    submitLogin(accUsername, '123456');
  };

  return (
    <div
      style={{ backgroundColor: 'var(--surface-ground)', color: 'var(--p-text-color)' }}
      className="min-h-screen flex flex-col"
    >
      {/* Hiddify v14.0.5 Vivid Blue Top Header Bar */}
      <header className="hiddify-topbar">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white">
            <BatteryCharging className="w-5 h-5" />
          </span>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-extrabold leading-tight">
              {publicInfo.storeName}
            </span>
            <span className="text-[10px] text-white/75 font-medium tabular-nums" dir="ltr">
              14.0.5
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/download-package"
            className="hiddify-topbar-action hiddify-topbar-action--pill"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">دانلود پکیج ویندوز (ZIP)</span>
          </a>
          {onToggleDark ? (
            <button
              type="button"
              onClick={onToggleDark}
              title="تغییر پوسته شب / روز"
              className="hiddify-topbar-action"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          ) : null}
        </div>
      </header>

      {/* Main Centered Login Card */}
      <div className="flex-1 flex items-center justify-center pt-20 pb-8 px-4 sm:px-6">
        <div
          style={{
            backgroundColor: 'var(--p-content-background)',
            borderColor: 'var(--p-content-border-color)',
          }}
          className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-2xl shadow-xl overflow-hidden border"
        >
          {/* Right Branding Column (Hiddify v14.0.5 Vivid Blue Sweep) */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 48%, #2563eb 100%)',
            }}
            className="lg:col-span-6 text-white p-8 lg:p-10 flex flex-col justify-between"
          >
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white px-3.5 py-1 rounded-full text-xs font-bold mb-6">
                <ShieldCheck className="w-4 h-4" />
                <span>پنل مدیریت یکپارچه · نسخه ۱۴.۰.۵</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                اتوماسیون فروش، صندوق و مالی باتری کاوه
              </h1>
              <p className="mt-3 text-xs sm:text-sm text-blue-100 leading-relaxed">
                ارتباط لحظه‌ای صندوق فروش طبقه پایین (چاپ بارکد لیبل ۱۵۰۰+ و فیش ۸ سانتی) با داشبورد مدیریتی و نرم‌افزار سپیدار در طبقه بالا.
              </p>

              <div className="mt-7 space-y-3.5">
                <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
                    <MonitorSmartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">صندوق فروش و چاپ دوگانه</h3>
                    <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                      محاسبه خودکار آمپر نو و کسر داغی، انتخاب کارتخوان (صادرات، پارسیان، ملت) و چاپ لیبل ۱۵۰۰+ و فیش ۸ سانتی.
                    </p>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">داشبورد ۱۴.۰.۵ و ربات ویندوزی سپیدار</h3>
                    <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                      نمودارهای زنده فروش و آمپراژ، تقویم شمسی و ثبت خودکار اسناد تاییدشده در سپیدار بدون نیاز به وب‌سرویس.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs text-blue-100">
              <span>مبتنی بر شبکه محلی ویندوز سرور</span>
              <a
                href="/api/download-package"
                className="px-3.5 py-1.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-extrabold flex items-center gap-1.5 transition shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                دانلود پکیج کامل ویندوز (ZIP)
              </a>
            </div>
          </div>

          {/* Left Form Column */}
          <div className="lg:col-span-6 p-8 lg:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold" style={{ color: 'var(--p-text-color)' }}>
                ورود به پنل مدیریت و صندوق
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--p-text-muted-color)' }}>
                نام کاربری و رمز عبور خود را وارد کنید یا روی یکی از حساب‌های آماده زیر کلیک نمایید.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-500 text-xs font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5">نام کاربری</label>
                <input
                  type="text"
                  dir="ltr"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin / cashier1 / cashier2"
                  style={{
                    backgroundColor: 'var(--surface-ground)',
                    borderColor: 'var(--p-content-border-color)',
                    color: 'var(--p-text-color)',
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden text-sm font-semibold text-left"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">رمز عبور</label>
                <input
                  type="password"
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  style={{
                    backgroundColor: 'var(--surface-ground)',
                    borderColor: 'var(--p-content-border-color)',
                    color: 'var(--p-text-color)',
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden text-sm font-semibold text-left"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'در حال ورود...' : 'ورود به پنل'}</span>
              </button>
            </form>

            {/* Quick Login Accounts */}
            <div
              style={{ borderColor: 'var(--p-content-border-color)' }}
              className="mt-6 pt-5 border-t"
            >
              <div
                style={{ color: 'var(--p-text-muted-color)' }}
                className="text-[11px] font-bold mb-2.5 flex items-center justify-between"
              >
                <span>ورود سریع با یک کلیک (رمز پیش‌فرض: ۱۲۳۴۵۶)</span>
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
              </div>

              <div className="space-y-2">
                {publicInfo.accounts.map((acc) => (
                  <button
                    key={acc.username}
                    type="button"
                    disabled={loading}
                    onClick={() => quickFillAndLogin(acc.username)}
                    style={{
                      backgroundColor: 'var(--surface-ground)',
                      borderColor: 'var(--p-content-border-color)',
                    }}
                    className="w-full p-2.5 rounded-xl border hover:border-blue-500/50 transition flex items-center justify-between text-right cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-extrabold">{acc.full_name}</div>
                      <div style={{ color: 'var(--p-text-muted-color)' }} className="text-[11px]">
                        {acc.station_name}
                      </div>
                    </div>
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-bold ${
                        acc.role === 'admin'
                          ? 'bg-blue-500/15 text-blue-600'
                          : 'bg-emerald-500/15 text-emerald-600'
                      }`}
                    >
                      {acc.role === 'admin' ? 'مدیر مالی' : 'صندوقدار'} ({acc.username})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Credit */}
      <footer
        style={{ borderColor: 'var(--p-content-border-color)', color: 'var(--p-text-muted-color)' }}
        className="border-t py-3 px-6 text-center text-xs font-bold"
      >
        نمایندگی صبا باتری (باتری کاوه) · پنل نسخه ۱۴.۰.۵ &nbsp;|&nbsp;{' '}
        <span style={{ color: 'var(--p-text-color)' }} className="font-extrabold">
          برنامه‌نویس: مسعود شعبانی
        </span>
      </footer>
    </div>
  );
}
