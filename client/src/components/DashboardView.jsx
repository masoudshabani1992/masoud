import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { STAGES, formatToman, formatNumber, formatDateFa } from '../utils/helpers';
import {
  BarChart3,
  TrendingUp,
  PackageCheck,
  Boxes,
  Clock,
  CheckCircle2,
  DollarSign,
  Activity,
  Layers,
  Building2,
  Users,
  Kanban
} from 'lucide-react';

export default function DashboardView({ onNavigateTab }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics()
      .then((res) => setAnalytics(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-slate-400 font-bold">در حال دریافت آمار کارخانه...</div>;
  }

  return (
    <div className="w-full space-y-6">
      {/* Consolidated Dashboard / Kanban / Archive Unified Subtab Bar */}
      {onNavigateTab && (
        <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => onNavigateTab('dashboard')}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-purple-100 text-purple-950 border border-purple-300/80 shadow-2xs flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4 text-purple-700" />
              <span>۱. داشبورد و آمار تحلیلی</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('kanban')}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-indigo-800 hover:bg-indigo-50/60 transition flex items-center gap-2"
            >
              <Kanban className="w-4 h-4 text-indigo-600" />
              <span>۲. گردش کار ۱۰ مرحله (کانبان)</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('archive')}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-amber-800 hover:bg-amber-50/60 transition flex items-center gap-2"
            >
              <Boxes className="w-4 h-4 text-amber-600" />
              <span>۳. آرشیو و جستجوی سفارشات</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-bold px-3 py-1 bg-slate-50 rounded-xl border border-slate-200 hidden sm:block">
            مرکز یکپارچه داشبورد، پیگیری و آرشیو کارخانه
          </div>
        </div>
      )}

      {/* Top Metrics Cards - Wide Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs sm:text-sm font-bold text-slate-500">کل سفارشات در جریان</span>
            <div className="text-3xl font-black text-indigo-700 mt-1">
              {analytics?.activeProjects || 0}
            </div>
            <span className="text-xs text-slate-400 mt-0.5 block">در ۱۰ مرحله خط تولید کارخانه</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
            <Boxes className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs sm:text-sm font-bold text-slate-500">تیراژ کل جعبه‌های در تولید</span>
            <div className="text-3xl font-black text-cyan-700 mt-1">
              {formatNumber(analytics?.totalBoxesProduced || 0)}
            </div>
            <span className="text-xs text-slate-400 mt-0.5 block">عدد انواع کارتن و جعبه</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shadow-inner">
            <Layers className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs sm:text-sm font-bold text-slate-500">مجموع ارزش ریالی پروژه‌ها</span>
            <div className="text-2xl font-black text-emerald-700 mt-1 line-clamp-1">
              {formatToman(analytics?.totalRevenue || 0)}
            </div>
            <span className="text-xs text-slate-400 mt-0.5 block">برآورد پیش‌فاکتورهای فعال</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <TrendingUp className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs sm:text-sm font-bold text-slate-500">سفارشات تحویل شده نهایی</span>
            <div className="text-3xl font-black text-purple-700 mt-1">
              {analytics?.completedProjects || 0}
            </div>
            <span className="text-xs text-slate-400 mt-0.5 block">اتمام کامل و تحویل مشتری</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner">
            <PackageCheck className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Production Stages Distribution Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-800">
              توزیع بار کاری در مراحل ۱۰ گانه خط تولید کارخانه
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">تعداد سفارشات فعال در هر ایستگاه زنجیره تولید</p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            گزارش زنده
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {STAGES.filter(s => s.id <= 10).map((stage) => {
            const count = analytics?.stageDistribution?.[stage.id] || 0;
            const percent = analytics?.activeProjects > 0
              ? Math.round((count / analytics.activeProjects) * 100)
              : 0;

            return (
              <div
                key={stage.id}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                  count > 0 ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50/50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700 line-clamp-1">{stage.shortName}</span>
                  <span className="text-xs font-bold text-slate-400 font-mono">مرحله {stage.id}</span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-indigo-900">{count}</span>
                  <span className="text-xs text-slate-500 font-bold">{percent}٪ از کل</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
