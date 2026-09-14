import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/helpers';
import {
  Boxes,
  Lock,
  User,
  LogIn,
  ShieldCheck,
  Building2,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function LoginView() {
  const { login, switchRole } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError('لطفاً نام کاربری و رمز عبور را وارد نمایید.');
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err.message || 'نام کاربری یا کلمه عبور اشتباه است.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (roleId) => {
    setError(null);
    setLoading(true);
    try {
      await switchRole(roleId);
    } catch (err) {
      setError('خطا در ورود: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-12 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Right Column: Factory Branding & Fast Roles */}
        <div className="md:col-span-5 bg-gradient-to-b from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 flex flex-col justify-between border-l border-indigo-950/40">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/20 font-black text-sm">
                امیران
              </div>
              <div>
                <h2 className="text-lg font-black text-white">اتوماسیون تولید (MIS)</h2>
                <span className="text-xs text-amber-300 font-bold">شرکت آرمان امیران</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pt-2 font-medium">
              سامانه یکپارچه مدیریت فرآیند ۹ مرحله‌ای تولید کارتن و جعبه‌سازی با تفکیک سطوح دسترسی پرسنل و کارتابل‌های اختصاصی.
            </p>

            {/* Quick Demo Access Roles */}
            <div className="pt-3 border-t border-indigo-800/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-1">
                <span>ورود سریع با نقش‌های کارخانه:</span>
                <span className="text-[10px] text-slate-400">رمز: ۱۲۳۴۵۶</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleQuickLogin(r.id)}
                    className="p-2 bg-indigo-950/70 hover:bg-indigo-600/50 border border-indigo-800/60 hover:border-indigo-400 rounded-xl text-right transition-all group"
                  >
                    <div className="font-black text-white text-[11px] group-hover:text-amber-300 transition-colors truncate">
                      {r.name}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">
                      {r.desc.split('،')[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-xs text-amber-300 font-bold text-center pt-4 border-t border-indigo-900/50 mt-4">
            برنامه نویس: مسعود شعبانی
          </div>
        </div>

        {/* Left Column: Login Form */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-slate-900">ورود به اتوماسیون شرکت آرمان امیران</h1>
            <p className="text-sm text-slate-500 font-medium">
              Production automation system of Arman Amiran Company
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">نام کاربری (Username):</label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="مثال: ceo یا sales یا designer"
                  className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-xl font-bold text-sm text-slate-900 transition-all font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">کلمه عبور (Password):</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-xl font-bold text-sm text-slate-900 transition-all font-mono"
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>حساب‌های پیش‌فرض کارخانه:</span>
              </div>
              <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                <span>مدیرعامل: <code className="text-indigo-700 font-bold">ceo</code></span>
                <span>فروش: <code className="text-indigo-700 font-bold">sales</code></span>
                <span>برآورد: <code className="text-indigo-700 font-bold">estimate</code></span>
                <span>طراحی: <code className="text-indigo-700 font-bold">designer</code></span>
                <span>تولید: <code className="text-indigo-700 font-bold">production</code></span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <LogIn className="w-5 h-5" />
              <span>{loading ? 'در حال بررسی اطلاعات...' : 'ورود به پنل کارخانه'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
