import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Clock,
  CalendarDays,
  Users,
  Download,
  Printer,
  Filter,
  BatteryCharging,
  Recycle,
  Wallet,
  Eye,
} from 'lucide-react';
import { apiRequest, buildCsvDownloadUrl } from '../api.js';
import JalaliDatePicker from './JalaliDatePicker.jsx';
import {
  formatJalaliDateTime,
  formatNumber,
  formatToman,
  paymentMethodLabel,
  sepidarStatusMeta,
} from '../utils/format.js';

export default function AdminReportsView({ bootstrap, onOpenPrintModal }) {
  const [period, setPeriod] = useState('all'); // 'today' | 'yesterday' | 'week' | 'month' | 'all' | 'custom'
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [hourFrom, setHourFrom] = useState('');
  const [hourTo, setHourTo] = useState('');
  const [cashierId, setCashierId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [posTerminalId, setPosTerminalId] = useState('');
  const [sepidarStatus, setSepidarStatus] = useState('');

  const [subTab, setSubTab] = useState('time_breakdown'); // 'time_breakdown' | 'hourly' | 'cashiers' | 'products_pos' | 'invoices'
  const [timeScale, setTimeScale] = useState('daily'); // 'daily' | 'weekly' | 'monthly'

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentQueryObj = {
    period,
    dateFrom: period === 'custom' ? dateFrom : '',
    dateTo: period === 'custom' ? dateTo : '',
    hourFrom,
    hourTo,
    cashierId,
    categoryId,
    brandId,
    paymentMethod,
    posTerminalId: paymentMethod === 'pos' ? posTerminalId : '',
    sepidarStatus,
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(currentQueryObj)) {
        if (v !== '' && v !== null && v !== undefined) {
          params.set(k, String(v));
        }
      }
      const res = await apiRequest(`/api/reports?${params.toString()}`);
      setData(res);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [
    period,
    dateFrom,
    dateTo,
    hourFrom,
    hourTo,
    cashierId,
    categoryId,
    brandId,
    paymentMethod,
    posTerminalId,
    sepidarStatus,
  ]);

  const resetFilters = () => {
    setPeriod('all');
    setDateFrom('');
    setDateTo('');
    setHourFrom('');
    setHourTo('');
    setCashierId('');
    setCategoryId('');
    setBrandId('');
    setPaymentMethod('');
    setPosTerminalId('');
    setSepidarStatus('');
  };

  const report = data?.report || {
    kpi: {},
    hourly: [],
    daily: [],
    weekly: [],
    monthly: [],
    byCashier: [],
    byBrand: [],
    byCategory: [],
    byAmperage: [],
    byPayment: [],
    byPosBank: [],
  };
  const salesList = data?.sales || [];
  const kpi = report.kpi || {};

  const maxHourlySoldAmps = Math.max(1, ...report.hourly.map((h) => h.soldAmps || 0));

  const activeTimeRows =
    timeScale === 'daily'
      ? report.daily
      : timeScale === 'weekly'
      ? report.weekly
      : report.monthly;

  return (
    <div className="space-y-6">
      {/* Header & Period Quick Buttons */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-600" />
              سیستم گزارش جامع فروش، آمپراژ، داغی و عملکرد صندوقداران
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              گزارش‌گیری دقیق بر اساس ساعت، روز، هفته و ماه به همراه خروجی اکسل
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={buildCsvDownloadUrl(currentQueryObj)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-4 h-4" />
              دانلود اکسل (CSV) این گزارش
            </a>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              چاپ صفحه گزارش
            </button>
          </div>
        </div>

        {/* Period Quick Selector */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          {[
            { id: 'today', label: 'امروز (ساعتی)' },
            { id: 'yesterday', label: 'دیروز' },
            { id: 'week', label: 'هفته جاری (۷ روز اخیر)' },
            { id: 'month', label: 'ماه جاری (۳۰ روز اخیر)' },
            { id: 'all', label: 'کل دوره ثبت‌شده' },
            { id: 'custom', label: 'بازه تاریخ دلخواه' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                period === p.id
                  ? 'bg-slate-900 text-amber-400 shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom Jalali Date Range if selected */}
        {period === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/60 border border-amber-200 p-3.5 rounded-xl">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-800 mb-1.5">
                از تاریخ (تقویم شمسی):
              </label>
              <JalaliDatePicker
                value={dateFrom}
                onChange={setDateFrom}
                placeholder="انتخاب تاریخ شروع شمسی..."
              />
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-slate-800 mb-1.5">
                تا تاریخ (تقویم شمسی):
              </label>
              <JalaliDatePicker
                value={dateTo}
                onChange={setDateTo}
                placeholder="انتخاب تاریخ پایان شمسی..."
              />
            </div>
          </div>
        )}

        {/* Advanced Multi-Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1 whitespace-nowrap">کاربر فاکتورزن (صندوقدار)</label>
            <select
              value={cashierId}
              onChange={(e) => setCashierId(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold"
            >
              <option value="">همه کاربران</option>
              {(bootstrap?.cashiers || []).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1 whitespace-nowrap">نوع باتری</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold"
            >
              <option value="">همه انواع</option>
              {(bootstrap?.categories || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1 whitespace-nowrap">برند باتری</label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold"
            >
              <option value="">همه برندها</option>
              {(bootstrap?.brands || []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1 whitespace-nowrap">روش پرداخت</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold"
            >
              <option value="">همه روش‌ها</option>
              <option value="pos">کارتخوان بانکی</option>
              <option value="transfer">واریز به حساب</option>
              <option value="cash">نقد</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1 whitespace-nowrap">از ساعت</label>
            <select
              value={hourFrom}
              onChange={(e) => setHourFrom(e.target.value)}
              className="w-full px-2 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold"
            >
              <option value="">۰۰:۰۰</option>
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  از {String(h).padStart(2, '0')}:۰۰
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1 whitespace-nowrap">تا ساعت</label>
            <select
              value={hourTo}
              onChange={(e) => setHourTo(e.target.value)}
              className="w-full px-2 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold"
            >
              <option value="">۲۳:۵۹</option>
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  تا {String(h).padStart(2, '0')}:۵۹
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              className="w-full py-2 px-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 shrink-0" />
              پاکسازی فیلتر
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border-2 border-blue-100 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-600">
            <span>تعداد کل باتری فروخته شده</span>
            <BatteryCharging className="w-5 h-5 text-blue-600" />
          </div>
          <div className="mt-2.5 text-3xl font-black text-slate-900 tabular-nums">
            {formatNumber(kpi.totalBatteriesSold || 0)}{' '}
            <span className="text-sm font-bold text-slate-500">عدد</span>
          </div>
          <div className="mt-1 text-xs font-semibold text-slate-500 tabular-nums">
            ثبت شده در {formatNumber(kpi.totalInvoices || 0)} فقره فاکتور فروش
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-amber-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-600">
            <span>جمع کامل آمپراژ فروخته شده</span>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-black">Ah</span>
          </div>
          <div className="mt-2.5 text-3xl font-black text-amber-700 tabular-nums">
            {formatNumber(kpi.totalSoldAmps || 0)}{' '}
            <span className="text-sm font-bold text-slate-500">آمپر</span>
          </div>
          <div className="mt-1 text-xs font-semibold text-slate-500 tabular-nums">
            ارزش ناخالص باتری نو: {formatToman(kpi.grossSalesAmount || 0)}
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-rose-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-600">
            <span>جمع کل آمپراژ داغی دریافتی</span>
            <Recycle className="w-5 h-5 text-rose-600" />
          </div>
          <div className="mt-2.5 text-3xl font-black text-rose-700 tabular-nums">
            {formatNumber(kpi.totalScrapAmps || 0)}{' '}
            <span className="text-sm font-bold text-slate-500">آمپر</span>
          </div>
          <div className="mt-1 text-xs font-semibold text-slate-500 tabular-nums">
            ارزش کسر شده داغی: {formatToman(kpi.scrapDeductionAmount || 0)}
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-emerald-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-600">
            <span>جمع خالص فروش دریافتی</span>
            <Wallet className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-2.5 text-2xl font-black text-emerald-700 tabular-nums">
            {formatToman(kpi.finalNetAmount || 0)}
          </div>
          <div className="mt-1 text-xs font-semibold text-slate-500 tabular-nums">
            تایید سپیدار: {formatNumber(kpi.syncedSepidarCount || 0)} | در انتظار: {formatNumber(kpi.pendingSepidarCount || 0)}
          </div>
        </div>
      </div>

      {/* Report Sub-Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex flex-wrap border-b border-slate-200 bg-slate-50 px-4 pt-3 gap-2">
          {[
            { id: 'time_breakdown', label: 'تفکیک روزانه / هفتگی / ماهانه', icon: CalendarDays },
            { id: 'hourly', label: 'گزارش ساعتی (۲۴ ساعت شبانه‌روز)', icon: Clock },
            { id: 'cashiers', label: 'عملکرد صندوقداران (ثبت‌کننده فاکتور)', icon: Users },
            { id: 'products_pos', label: 'تفکیک برند، آمپراژ و کارتخوان‌ها', icon: BarChart3 },
            { id: 'invoices', label: `ریز کامل فاکتورها (${formatNumber(salesList.length)})`, icon: Eye },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = subTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubTab(tab.id)}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-extrabold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
                  active
                    ? 'bg-white text-slate-900 border-amber-500 shadow-2xs'
                    : 'text-slate-600 border-transparent hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 text-amber-600" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-5">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs font-bold">
              در حال محاسبه گزارش...
            </div>
          ) : (
            <>
              {/* TAB 1: DAILY / WEEKLY / MONTHLY */}
              {subTab === 'time_breakdown' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-black text-slate-900">
                      جدول خلاصه فروش و آمپراژ به تفکیک بازه زمانی
                    </h3>
                    <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                      {[
                        { id: 'daily', label: 'بر اساس روز' },
                        { id: 'weekly', label: 'بر اساس هفته' },
                        { id: 'monthly', label: 'بر اساس ماه' },
                      ].map((ts) => (
                        <button
                          key={ts.id}
                          type="button"
                          onClick={() => setTimeScale(ts.id)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                            timeScale === ts.id
                              ? 'bg-slate-900 text-amber-400'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {ts.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-right">
                      <thead className="bg-slate-50 text-slate-700 font-extrabold border-y border-slate-200">
                        <tr>
                          <th className="px-4 py-3">دوره زمانی (شمسی)</th>
                          <th className="px-4 py-3">تعداد فاکتور</th>
                          <th className="px-4 py-3">تعداد باتری فروخته شده</th>
                          <th className="px-4 py-3">جمع آمپراژ فروخته شده</th>
                          <th className="px-4 py-3">جمع آمپراژ داغی</th>
                          <th className="px-4 py-3">فروش ناخالص</th>
                          <th className="px-4 py-3">کسر داغی</th>
                          <th className="px-4 py-3">خالص دریافتی</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeTimeRows.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">
                              داده‌ای در این فیلتر وجود ندارد.
                            </td>
                          </tr>
                        ) : (
                          activeTimeRows.map((row) => (
                            <tr key={row.key} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-black text-slate-900">{row.label}</td>
                              <td className="px-4 py-3 tabular-nums font-bold">{formatNumber(row.invoiceCount)}</td>
                              <td className="px-4 py-3 tabular-nums font-black text-blue-700">
                                {formatNumber(row.batteryCount)} عدد
                              </td>
                              <td className="px-4 py-3 tabular-nums font-black text-amber-700">
                                {formatNumber(row.soldAmps)} Ah
                              </td>
                              <td className="px-4 py-3 tabular-nums font-black text-rose-700">
                                {formatNumber(row.scrapAmps)} Ah
                              </td>
                              <td className="px-4 py-3 tabular-nums text-slate-600">
                                {formatToman(row.grossAmount)}
                              </td>
                              <td className="px-4 py-3 tabular-nums text-rose-600">
                                {formatToman(row.scrapAmount)}
                              </td>
                              <td className="px-4 py-3 tabular-nums font-black text-emerald-700">
                                {formatToman(row.netAmount)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: HOURLY REPORT (00:00 .. 23:00) */}
              {subTab === 'hourly' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 mb-1">
                      نمودار توزیع ساعتی آمپراژ فروخته‌شده (ساعت به ساعت به وقت تهران)
                    </h3>
                    <p className="text-xs text-slate-500">
                      مشخص می‌کند در چه ساعت‌هایی از شبانه‌روز بیشترین فروش و تحویل داغی ثبت شده است.
                    </p>
                  </div>

                  {/* Visual 24-hour Bar Chart */}
                  <div className="bg-slate-900 rounded-2xl p-4 text-white overflow-x-auto">
                    <div className="min-w-[680px] grid grid-cols-24 gap-1.5 items-end h-44 pt-6">
                      {report.hourly.map((h) => {
                        const pct = h.soldAmps > 0 ? Math.max(10, Math.round((h.soldAmps / maxHourlySoldAmps) * 100)) : 3;
                        return (
                          <div key={h.hour} className="flex flex-col items-center h-full justify-end group">
                            {h.soldAmps > 0 && (
                              <span className="text-[10px] font-bold text-amber-300 mb-1 tabular-nums">
                                {formatNumber(h.soldAmps)}
                              </span>
                            )}
                            <div
                              style={{ height: `${pct}%` }}
                              className={`w-full rounded-t-md transition ${
                                h.soldAmps > 0 ? 'bg-amber-400 group-hover:bg-amber-300' : 'bg-slate-800'
                              }`}
                              title={`${h.label}: ${h.batteryCount} باتری | ${h.soldAmps} آمپر`}
                            />
                            <span className="text-[10px] text-slate-400 mt-1.5 tabular-nums">
                              {formatNumber(h.hour)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Hours Detailed Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-right">
                      <thead className="bg-slate-50 text-slate-700 font-extrabold border-y border-slate-200">
                        <tr>
                          <th className="px-4 py-3">بازه ساعت</th>
                          <th className="px-4 py-3">تعداد فاکتور</th>
                          <th className="px-4 py-3">تعداد باتری فروخته شده</th>
                          <th className="px-4 py-3">جمع آمپراژ فروخته شده</th>
                          <th className="px-4 py-3">جمع آمپراژ داغی</th>
                          <th className="px-4 py-3">خالص فروش آن ساعت</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {report.hourly
                          .filter((h) => h.invoiceCount > 0)
                          .map((h) => (
                            <tr key={h.hour} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-black text-slate-900 tabular-nums">{h.label}</td>
                              <td className="px-4 py-3 tabular-nums font-bold">{formatNumber(h.invoiceCount)}</td>
                              <td className="px-4 py-3 tabular-nums font-black text-blue-700">
                                {formatNumber(h.batteryCount)} عدد
                              </td>
                              <td className="px-4 py-3 tabular-nums font-black text-amber-700">
                                {formatNumber(h.soldAmps)} آمپر
                              </td>
                              <td className="px-4 py-3 tabular-nums font-black text-rose-700">
                                {formatNumber(h.scrapAmps)} آمپر
                              </td>
                              <td className="px-4 py-3 tabular-nums font-black text-emerald-700">
                                {formatToman(h.netAmount)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: CASHIER PERFORMANCE (کاربری که فاکتور زده کی بوده) */}
              {subTab === 'cashiers' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900">
                    گزارش عملکرد کاربران ثبت‌کننده فاکتور (صندوقداران)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-right">
                      <thead className="bg-slate-50 text-slate-700 font-extrabold border-y border-slate-200">
                        <tr>
                          <th className="px-4 py-3">نام صندوقدار (کاربر ثبت‌کننده)</th>
                          <th className="px-4 py-3">تعداد فاکتور</th>
                          <th className="px-4 py-3">تعداد باتری فروخته شده</th>
                          <th className="px-4 py-3">جمع آمپراژ فروخته شده</th>
                          <th className="px-4 py-3">جمع آمپراژ داغی دریافتی</th>
                          <th className="px-4 py-3">دریافت کارتخوان</th>
                          <th className="px-4 py-3">واریز به حساب</th>
                          <th className="px-4 py-3">دریافت نقد</th>
                          <th className="px-4 py-3">جمع خالص فروش</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {report.byCashier.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-8 text-center text-slate-400 font-bold">
                              فروشی ثبت نشده است.
                            </td>
                          </tr>
                        ) : (
                          report.byCashier.map((c) => (
                            <tr key={c.cashierId} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-black text-slate-900">{c.cashierName}</td>
                              <td className="px-4 py-3 tabular-nums font-bold">{formatNumber(c.invoiceCount)}</td>
                              <td className="px-4 py-3 tabular-nums font-black text-blue-700">
                                {formatNumber(c.batteryCount)} عدد
                              </td>
                              <td className="px-4 py-3 tabular-nums font-black text-amber-700">
                                {formatNumber(c.soldAmps)} Ah
                              </td>
                              <td className="px-4 py-3 tabular-nums font-black text-rose-700">
                                {formatNumber(c.scrapAmps)} Ah
                              </td>
                              <td className="px-4 py-3 tabular-nums">{formatToman(c.posAmount)}</td>
                              <td className="px-4 py-3 tabular-nums">{formatToman(c.transferAmount)}</td>
                              <td className="px-4 py-3 tabular-nums">{formatToman(c.cashAmount)}</td>
                              <td className="px-4 py-3 tabular-nums font-black text-emerald-700">
                                {formatToman(c.netAmount)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: BRAND / CATEGORY / AMPERAGE / POS BREAKDOWN */}
              {subTab === 'products_pos' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Brands */}
                  <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-black text-slate-900">فروش به تفکیک برند باتری</h4>
                    <div className="space-y-2">
                      {report.byBrand.map((b) => (
                        <div
                          key={b.brandName}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs"
                        >
                          <div>
                            <div className="font-black text-slate-900">برند {b.brandName}</div>
                            <div className="text-[11px] text-slate-500 tabular-nums">
                              {formatNumber(b.batteryCount)} عدد | داغی دریافتی: {formatNumber(b.scrapAmps)}Ah
                            </div>
                          </div>
                          <div className="text-left tabular-nums">
                            <div className="font-black text-amber-700">{formatNumber(b.soldAmps)} آمپر</div>
                            <div className="text-[11px] font-bold text-emerald-700">{formatToman(b.netAmount)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* POS Banks & Payment Methods */}
                  <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-black text-slate-900">
                      تراز به تفکیک دستگاه‌های کارتخوان (صادرات / پارسیان / ملت) و نقدی
                    </h4>
                    <div className="space-y-2">
                      {report.byPosBank.map((p) => (
                        <div
                          key={p.bankName}
                          className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs"
                        >
                          <div>
                            <div className="font-black text-emerald-950">کارتخوان بانک {p.bankName}</div>
                            <div className="text-[11px] text-emerald-700 tabular-nums">
                              {formatNumber(p.invoiceCount)} فاکتور ({formatNumber(p.batteryCount)} باتری)
                            </div>
                          </div>
                          <div className="font-black text-emerald-800 tabular-nums">
                            {formatToman(p.netAmount)}
                          </div>
                        </div>
                      ))}
                      {report.byPayment
                        .filter((x) => x.key !== 'pos_total')
                        .map((x) => (
                          <div
                            key={x.key}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs"
                          >
                            <div className="font-bold text-slate-800">
                              {x.title} ({formatNumber(x.invoiceCount)} فاکتور)
                            </div>
                            <div className="font-black text-slate-900 tabular-nums">
                              {formatToman(x.netAmount)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-black text-slate-900">فروش به تفکیک نوع باتری (خودرو، موتور، UPS)</h4>
                    <div className="space-y-2">
                      {report.byCategory.map((c) => (
                        <div
                          key={c.categoryName}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs"
                        >
                          <div className="font-black text-slate-900">{c.categoryName}</div>
                          <div className="text-left tabular-nums font-bold text-slate-700">
                            {formatNumber(c.batteryCount)} عدد | {formatNumber(c.soldAmps)}Ah —{' '}
                            <span className="text-emerald-700 font-black">{formatToman(c.netAmount)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Amperage Breakdown */}
                  <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-black text-slate-900">فروش به تفکیک واحد آمپراژ باتری</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {report.byAmperage.map((a) => (
                        <div
                          key={a.amperage}
                          className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-center"
                        >
                          <div className="text-base font-black text-blue-900 tabular-nums">
                            {formatNumber(a.amperage)} آمپر
                          </div>
                          <div className="text-xs font-bold text-slate-700 mt-1 tabular-nums">
                            {formatNumber(a.batteryCount)} عدد ({formatNumber(a.soldAmps)}Ah)
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: DETAILED INVOICES */}
              {subTab === 'invoices' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right">
                    <thead className="bg-slate-50 text-slate-700 font-extrabold border-y border-slate-200">
                      <tr>
                        <th className="px-3 py-3">لیبل</th>
                        <th className="px-3 py-3">فاکتور</th>
                        <th className="px-3 py-3">تاریخ و ساعت</th>
                        <th className="px-3 py-3">کاربر ثبت‌کننده</th>
                        <th className="px-3 py-3">شرح باتری</th>
                        <th className="px-3 py-3">آمپراژ فروخته شده</th>
                        <th className="px-3 py-3">آمپراژ داغی</th>
                        <th className="px-3 py-3">خالص دریافتی</th>
                        <th className="px-3 py-3">روش پرداخت</th>
                        <th className="px-3 py-3">وضعیت سپیدار</th>
                        <th className="px-3 py-3 text-center">چاپ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {salesList.map((s) => {
                        const st = sepidarStatusMeta(s.sepidar_status, s.bot_queue_status);
                        return (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2.5 font-black whitespace-nowrap" dir="ltr">
                              #{s.label_number}
                            </td>
                            <td className="px-3 py-2.5 font-bold whitespace-nowrap" dir="ltr">
                              {s.invoice_number}
                            </td>
                            <td className="px-3 py-2.5 tabular-nums text-slate-600 whitespace-nowrap">
                              {formatJalaliDateTime(s.created_at)}
                            </td>
                            <td className="px-3 py-2.5 font-bold text-slate-900 whitespace-nowrap">{s.cashier_name}</td>
                            <td className="px-3 py-2.5 font-semibold whitespace-nowrap">
                              {s.category_name} {s.brand_name} ({formatNumber(s.amperage)}Ah × {formatNumber(s.quantity)})
                            </td>
                            <td className="px-3 py-2.5 font-bold text-amber-700 tabular-nums whitespace-nowrap">
                              {formatNumber(s.total_sold_amps)}Ah
                            </td>
                            <td className="px-3 py-2.5 font-bold text-rose-700 tabular-nums whitespace-nowrap">
                              {s.has_scrap ? `${formatNumber(s.total_scrap_amps)}Ah` : '۰'}
                            </td>
                            <td className="px-3 py-2.5 font-black text-emerald-700 tabular-nums whitespace-nowrap">
                              {formatToman(s.final_sale_amount)}
                            </td>
                            <td className="px-3 py-2.5 font-semibold whitespace-nowrap">{paymentMethodLabel(s)}</td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${st.badgeClass}`}>
                                {st.label}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => onOpenPrintModal && onOpenPrintModal(s, 'both')}
                                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] whitespace-nowrap cursor-pointer"
                              >
                                فیش / لیبل
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
