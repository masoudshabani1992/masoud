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
  Users
} from 'lucide-react';

export default function DashboardView() {
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
      {/* Top Metrics Cards - Wide Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs sm:text-sm font-bold text-slate-500">کل سفارشات در جریان</span>
            <div className="text-3xl font-black text-indigo-700 mt-1">
              {analytics?.activeProjects || 0}
            </div>
            <span className="text-xs text-slate-400 mt-0.5 block">در ۹ مرحله خط تولید کارخانه</span>
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
            <span className="text-xs text-emerald-600 font-black mt-0.5 block">تکمیل موفق ۱۰۰٪</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner">
            <PackageCheck className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* 9-Stage Pipeline Funnel Breakdown */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            <h3 className="text-base sm:text-lg font-black text-slate-800">توزیع سفارشات در مراحل ۹ گانه خط تولید کارخانه</h3>
          </div>
          <span className="text-xs sm:text-sm text-slate-500 font-medium">نمای قیف عملیاتی و تراکم کارگاهی</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 pt-2">
          {STAGES.slice(0, 9).map((stage) => {
            const count = analytics?.stageBreakdown?.[stage.id] || 0;
            return (
              <div
                key={stage.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-indigo-400 hover:shadow-md transition-all flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-black text-slate-800">{stage.title}</div>
                  <div className="text-xs text-slate-500 mt-1 font-semibold">مسئول: {stage.roleName}</div>
                </div>
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base shadow-sm ${count > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Factory Activity Stream */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <Activity className="w-6 h-6 text-amber-600" />
          <h3 className="text-base sm:text-lg font-black text-slate-800">آخرین رویدادها و اقدامات پرسنل در سیستم</h3>
        </div>

        <div className="space-y-3">
          {analytics?.recentLogs?.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/80 hover:bg-white transition-all flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-3.5">
                <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md border border-indigo-200">
                  {log.tracking_code}
                </span>
                <div>
                  <strong className="text-slate-800 font-bold">{log.user_name}</strong>
                  <span className="text-slate-500"> ({log.stage_name}): </span>
                  <span className="text-slate-700 font-medium">{log.comment}</span>
                </div>
              </div>

              <div className="text-slate-400 font-mono text-xs">
                {formatDateFa(log.created_at)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
