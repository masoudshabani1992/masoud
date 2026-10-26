import React, { useEffect, useState } from 'react';
import {
  BatteryCharging,
  ShieldCheck,
  MonitorSmartphone,
  Server,
  LogIn,
  UserCheck,
  Download,
} from 'lucide-react';
import { apiRequest, setStoredToken } from '../api.js';

export default function LoginView({ onLoggedIn }) {
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
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle geometric accent */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-800 relative z-10">
        {/* Right Column (Brand & Two-Floor Architecture Summary) */}
        <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 lg:p-10 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2.5 bg-amber-500/15 border border-amber-400/30 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-bold mb-6">
              <BatteryCharging className="w-4 h-4 text-amber-400" />
              <span>نمایندگی رسمی باتری صبا</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
              سامانه جامع اتوماسیون فروش و مالی{' '}
              <span className="text-amber-400">باتری کاوه</span>
            </h1>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              یکپارچه‌سازی لحظه‌ای صندوق فروش طبقه پایین (چاپ فیش ۸ سانتی و لیبل‌زن از کد ۱۵۰۰+) با واحد مدیریت مالی و سرور ویندوزی سپیدار در طبقه بالا.
            </p>

            <div className="mt-8 space-y-4">
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <MonitorSmartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">طبقه پایین — پنل صندوقداران</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    جستجوی سریع باتری (خودرو، موتور سیکلت، UPS)، انتخاب برند (راین، اکسون، اوربیتال) و آمپراژ، کسر خودکار داغی، انتخاب کارتخوان (صادرات، پارسیان، ملت) و چاپ همزمان لیبل ۱۵۰۰+ و فیش ۸ سانتی.
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">طبقه بالا — مدیر مالی و اتصال سپیدار</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    تعیین نرخ هر آمپر برند و نرخ هر آمپر داغی، گزارشات دقیق ساعتی / روزانه / هفتگی / ماهانه، تعریف حساب صندوقدارها و تایید و ثبت خودکار اسناد در سپیدار.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>شبکه داخلی تحت وب (Windows Server Ready)</span>
            <a
              href="/api/download-package"
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              دانلود پکیج کامل ویندوز (ZIP)
            </a>
          </div>
        </div>

        {/* Left Column (Login Form + Quick Switch Demo Cards) */}
        <div className="lg:col-span-6 p-8 lg:p-10 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h2 className="text-xl font-black text-slate-900">ورود به حساب کاربری</h2>
            <p className="text-xs text-slate-500 mt-1">
              نام کاربری و رمز عبور اختصاصی خود را وارد کنید یا برای تست سریع روی یکی از نقش‌ها کلیک نمایید.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">نام کاربری</label>
              <input
                type="text"
                dir="ltr"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin / cashier1"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm font-semibold text-left"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">رمز عبور</label>
              <input
                type="password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm font-semibold text-left"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span>{loading ? 'در حال ورود...' : 'ورود به سامانه باتری کاوه'}</span>
            </button>
          </form>

          {/* Quick Role Login for Easy Testing */}
          <div className="mt-7 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-amber-600" />
                ورود سریع آزمایشی (رمز پیش‌فرض: 123456)
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {(publicInfo.accounts || []).slice(0, 4).map((acc) => {
                const isAdmin = acc.role === 'admin';
                return (
                  <button
                    key={acc.username}
                    type="button"
                    disabled={loading}
                    onClick={() => quickFillAndLogin(acc.username)}
                    className={`w-full text-right p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                      isAdmin
                        ? 'bg-amber-50/70 hover:bg-amber-100/80 border-amber-300'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                          isAdmin
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-white'
                        }`}
                      >
                        {isAdmin ? <ShieldCheck className="w-4 h-4" /> : 'POS'}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900">{acc.full_name}</div>
                        <div className="text-[11px] text-slate-500">
                          {acc.station_name || (isAdmin ? 'واحد مالی طبقه بالا' : 'صندوق فروش طبقه پایین')}
                        </div>
                      </div>
                    </div>
                    <span
                      dir="ltr"
                      className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700"
                    >
                      {acc.username}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs font-extrabold text-slate-600">
            برنامه‌نویس: مسعود شعبانی
          </div>
        </div>
      </div>
    </div>
  );
}
