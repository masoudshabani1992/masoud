import React, { useEffect, useState } from 'react';
import {
  Activity,
  BatteryCharging,
  Recycle,
  Wallet,
  FileCheck2,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  Printer,
  CreditCard,
} from 'lucide-react';
import { apiRequest } from '../api.js';
import {
  formatJalaliDateTime,
  formatNumber,
  formatToman,
  paymentMethodLabel,
  sepidarStatusMeta,
} from '../utils/format.js';

export default function AdminDashboardView({
  onNavigate,
  onOpenPrintModal,
  onRefreshBootstrap,
}) {
  const [todayData, setTodayData] = useState(null);
  const [pendingSales, setPendingSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [toast, setToast] = useState('');

  const loadDashboard = async () => {
    try {
      const [todayRes, pendingRes] = await Promise.all([
        apiRequest('/api/reports?period=today'),
        apiRequest('/api/sales?sepidarStatus=pending'),
      ]);
      setTodayData(todayRes);
      setPendingSales(pendingRes.sales || []);
    } catch {
      // ignore transient error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const timer = setInterval(loadDashboard, 12000);
    return () => clearInterval(timer);
  }, []);

  const quickApprove = async (sale) => {
    setApprovingId(sale.id);
    setToast('');
    try {
      const res = await apiRequest(`/api/admin/sepidar/approve/${sale.id}`, {
        method: 'POST',
      });
      setToast(
        res.sepidarResult?.queuedForBot
          ? `فاکتور ${sale.invoice_number} تایید شد و در صف اجرای خودکار «ربات ویندوزی سپیدار» قرار گرفت.`
          : `فاکتور ${sale.invoice_number} تایید و با شماره سند ${res.sale?.sepidar_doc_number || ''} در سپیدار ثبت شد.`
      );
      await loadDashboard();
      if (onRefreshBootstrap) onRefreshBootstrap();
    } catch (err) {
      setToast(`خطا: ${err.message}`);
    } finally {
      setApprovingId(null);
    }
  };

  const kpi = todayData?.report?.kpi || {
    totalInvoices: 0,
    totalBatteriesSold: 0,
    totalSoldAmps: 0,
    totalScrapAmps: 0,
    finalNetAmount: 0,
    grossSalesAmount: 0,
    scrapDeductionAmount: 0,
  };

  return (
    <div className="space-y-6">
      {/* Live Status Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black">
                مانیتورینگ زنده فروش طبقه پایین — باتری کاوه
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                آنلاین
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              واحد مدیریت مالی (طبقه بالا) — مشاهده لحظه‌ای صندوق‌ها، تراز کارتخوان‌ها و ارسال مستقیم اسناد به سرور سپیدار
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={loadDashboard}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            بروزرسانی لحظه‌ای
          </button>
          <button
            type="button"
            onClick={() => onNavigate('sepidar')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer"
          >
            <span>کارتابل سپیدار ({formatNumber(pendingSales.length)})</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {toast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-extrabold flex items-center justify-between">
          <span>{toast}</span>
          <button
            type="button"
            onClick={() => setToast('')}
            className="text-emerald-700 hover:underline px-2"
          >
            بستن
          </button>
        </div>
      )}

      {/* Today's 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">تعداد فروش امروز</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BatteryCharging className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 tabular-nums">
            {formatNumber(kpi.totalBatteriesSold)} <span className="text-sm font-bold text-slate-500">دستگاه</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 font-semibold tabular-nums">
            در قالب {formatNumber(kpi.totalInvoices)} فقره فاکتور امروز
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">جمع آمپراژ فروخته شده امروز</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xs">
              Ah
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 tabular-nums">
            {formatNumber(kpi.totalSoldAmps)} <span className="text-sm font-bold text-slate-500">آمپر</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 font-semibold tabular-nums">
            فروش ناخالص: {formatToman(kpi.grossSalesAmount)}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">جمع آمپراژ داغی دریافتی امروز</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Recycle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-rose-700 tabular-nums">
            {formatNumber(kpi.totalScrapAmps)} <span className="text-sm font-bold text-rose-500">آمپر</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 font-semibold tabular-nums">
            کسر شده بابت داغی: {formatToman(kpi.scrapDeductionAmount)}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">خالص دریافتی صندوق امروز</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xl font-black text-emerald-700 tabular-nums">
            {formatToman(kpi.finalNetAmount)}
          </div>
          <div className="mt-1 text-xs text-amber-700 font-bold tabular-nums">
            {formatNumber(pendingSales.length)} سند در انتظار تایید سپیدار
          </div>
        </div>
      </div>

      {/* Pending Sepidar Queue + POS Terminal Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Invoices for Quick Approval */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-black text-slate-900">
                اسناد ثبت‌شده در طبقه پایین (منتظر تایید مدیر مالی برای سپیدار)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('sepidar')}
              className="text-xs font-extrabold text-blue-700 hover:underline cursor-pointer"
            >
              مدیریت کامل اسناد سپیدار ←
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-50 text-slate-600 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">لیبل</th>
                  <th className="px-4 py-3">صندوقدار</th>
                  <th className="px-4 py-3">باتری فروخته شده</th>
                  <th className="px-4 py-3">داغی</th>
                  <th className="px-4 py-3">خالص دریافتی</th>
                  <th className="px-4 py-3">روش پرداخت</th>
                  <th className="px-4 py-3 text-center">عملیات سریع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingSales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-emerald-700 font-bold">
                      تمامی اسناد صندوق تایید و در سیستم سپیدار ثبت شده‌اند.
                    </td>
                  </tr>
                ) : (
                  pendingSales.slice(0, 8).map((sale) => (
                    <tr key={sale.id} className="hover:bg-amber-50/30">
                      <td className="px-4 py-3 font-black" dir="ltr">
                        #{sale.label_number}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">{sale.cashier_name}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {sale.category_name} {sale.brand_name} ({formatNumber(sale.amperage)}Ah × {formatNumber(sale.quantity)})
                      </td>
                      <td className="px-4 py-3 text-rose-700 font-semibold tabular-nums">
                        {sale.has_scrap ? `${formatNumber(sale.total_scrap_amps)}Ah` : '-'}
                      </td>
                      <td className="px-4 py-3 font-black text-slate-900 tabular-nums">
                        {formatToman(sale.final_sale_amount)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {paymentMethodLabel(sale)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            disabled={approvingId === sale.id}
                            onClick={() => quickApprove(sale)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{approvingId === sale.id ? 'ثبت...' : 'تایید و ثبت سپیدار'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenPrintModal && onOpenPrintModal(sale, 'both')}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                            title="مشاهده فیش و لیبل"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Payment & POS Bank Breakdown */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              تراز دریافت‌های امروز به تفکیک بانک/صندوق
            </h3>
          </div>

          <div className="space-y-2.5">
            {(todayData?.report?.byPosBank || []).map((b) => (
              <div
                key={b.bankName}
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-100"
              >
                <div>
                  <div className="text-xs font-extrabold text-slate-900">کارتخوان بانک {b.bankName}</div>
                  <div className="text-[11px] text-slate-500">{formatNumber(b.invoiceCount)} تراکنش</div>
                </div>
                <div className="text-xs font-black text-emerald-800 tabular-nums">
                  {formatToman(b.netAmount)}
                </div>
              </div>
            ))}

            {(todayData?.report?.byPayment || [])
              .filter((p) => p.key !== 'pos_total')
              .map((p) => (
                <div
                  key={p.key}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <div>
                    <div className="text-xs font-extrabold text-slate-800">{p.title}</div>
                    <div className="text-[11px] text-slate-500">{formatNumber(p.invoiceCount)} فاکتور</div>
                  </div>
                  <div className="text-xs font-black text-slate-900 tabular-nums">
                    {formatToman(p.netAmount)}
                  </div>
                </div>
              ))}
          </div>

          {/* Today's Cashier Snapshot */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="text-xs font-extrabold text-slate-700">کارکرد صندوقدارها در امروز:</div>
            {(todayData?.report?.byCashier || []).length === 0 ? (
              <div className="text-xs text-slate-400">هنوز فروشی در امروز ثبت نشده است.</div>
            ) : (
              (todayData?.report?.byCashier || []).map((c) => (
                <div
                  key={c.cashierId}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0"
                >
                  <span className="font-bold text-slate-800">{c.cashierName}</span>
                  <span className="text-slate-600 tabular-nums font-semibold">
                    {formatNumber(c.batteryCount)} باتری ({formatNumber(c.soldAmps)}Ah) — {formatToman(c.netAmount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Today's Invoices Full Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900">ریز آخرین فاکتورهای امروز</h3>
          <button
            type="button"
            onClick={() => onNavigate('reports')}
            className="text-xs font-extrabold text-blue-700 hover:underline cursor-pointer"
          >
            مشاهده گزارشات ساعتی، روزانه، هفتگی و ماهانه ←
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-50 text-slate-600 font-extrabold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">لیبل</th>
                <th className="px-4 py-3">فاکتور</th>
                <th className="px-4 py-3">زمان ثبت</th>
                <th className="px-4 py-3">صندوقدار</th>
                <th className="px-4 py-3">نوع و برند</th>
                <th className="px-4 py-3">آمپراژ فروخته شده</th>
                <th className="px-4 py-3">آمپراژ داغی</th>
                <th className="px-4 py-3">خالص پرداختی</th>
                <th className="px-4 py-3">وضعیت سپیدار</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(todayData?.sales || []).slice(0, 10).map((s) => {
                const st = sepidarStatusMeta(s.sepidar_status, s.bot_queue_status);
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-black" dir="ltr">
                      #{s.label_number}
                    </td>
                    <td className="px-4 py-2.5 font-bold" dir="ltr">
                      {s.invoice_number}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 tabular-nums">
                      {formatJalaliDateTime(s.created_at)}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-slate-800">{s.cashier_name}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">
                      {s.category_name} — {s.brand_name}
                    </td>
                    <td className="px-4 py-2.5 font-bold text-blue-700 tabular-nums">
                      {formatNumber(s.total_sold_amps)} آمپر
                    </td>
                    <td className="px-4 py-2.5 font-bold text-rose-700 tabular-nums">
                      {s.has_scrap ? `${formatNumber(s.total_scrap_amps)} آمپر` : '۰'}
                    </td>
                    <td className="px-4 py-2.5 font-black text-slate-900 tabular-nums">
                      {formatToman(s.final_sale_amount)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${st.badgeClass}`}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
