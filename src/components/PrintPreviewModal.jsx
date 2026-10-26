import React, { useState } from 'react';
import { Printer, Tag, Receipt, X, CheckCircle2 } from 'lucide-react';
import BarcodeSvg from './BarcodeSvg.jsx';
import {
  formatJalaliDateTime,
  formatNumber,
  paymentMethodLabel,
} from '../utils/format.js';
import { printBatteryLabel, printReceipt80mm } from '../utils/printEngine.js';
import { apiRequest } from '../api.js';

export default function PrintPreviewModal({ sale, settings = {}, initialTab = 'both', onClose, onPrinted }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [printedNotice, setPrintedNotice] = useState('');

  if (!sale) return null;

  const storeName = settings.store_name || 'نمایندگی صبا باتری - باتری کاوه';
  const storeAddress = settings.store_address || '';
  const storePhone = settings.store_phone || '';
  const footerNote = settings.receipt_footer || 'ضمانت اصالت و گارانتی معتبر شرکت صبا باتری';

  const handlePrintLabel = async () => {
    printBatteryLabel(sale, settings);
    setPrintedNotice(`فرمان چاپ لیبل #${sale.label_number} به پرینتر لیبل‌زن ارسال شد.`);
    try {
      await apiRequest(`/api/sales/${sale.id}/print`, {
        method: 'POST',
        body: JSON.stringify({ type: 'label' }),
      });
      if (onPrinted) onPrinted();
    } catch {
      // non-blocking
    }
  };

  const handlePrintReceipt = async () => {
    printReceipt80mm(sale, settings);
    setPrintedNotice(`فرمان چاپ فیش ۸ سانتی فاکتور ${sale.invoice_number} به پرینتر فیش‌زن ارسال شد.`);
    try {
      await apiRequest(`/api/sales/${sale.id}/print`, {
        method: 'POST',
        body: JSON.stringify({ type: 'receipt' }),
      });
      if (onPrinted) onPrinted();
    } catch {
      // non-blocking
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                چاپ دوگانه صندوق — لیبل #{sale.label_number} و فیش ۸ سانتی
              </h3>
              <p className="text-xs text-slate-300">
                فاکتور {sale.invoice_number} | صندوقدار: {sale.cashier_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('both')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'both'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              نمایش همزمان هر دو پرینتر
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('label')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'label'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              فقط لیبل‌زن (#{sale.label_number})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('receipt')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'receipt'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              فقط فیش‌زن ۸ سانتی
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-rose-600 hover:text-white transition mr-2"
              title="بستن"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {printedNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center gap-2 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{printedNotice}</span>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto bg-slate-100 flex-1">
          <div
            className={`grid gap-6 items-start ${
              activeTab === 'both' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1 max-w-md mx-auto'
            }`}
          >
            {/* 1. Thermal Label Preview */}
            {(activeTab === 'both' || activeTab === 'label') && (
              <div className={activeTab === 'both' ? 'lg:col-span-5 space-y-3' : 'space-y-3'}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-amber-600" />
                    پرینتر ۱: لیبل‌زن حرارتی ({settings.label_width_mm || 50}×{settings.label_height_mm || 30} میلی‌متر)
                  </span>
                  <span className="text-[11px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold">
                    سریال از ۱۵۰۰+
                  </span>
                </div>

                <div className="bg-white rounded-xl p-4 border-2 border-slate-900 shadow-md">
                  <div className="border border-black p-3 bg-white text-black space-y-2">
                    <div className="text-[11px] font-black border-b border-black pb-1 flex justify-between items-center">
                      <span>{storeName}</span>
                    </div>
                    <div className="flex items-baseline justify-between pt-0.5">
                      <span className="text-xs font-extrabold">
                        {sale.brand_name} {sale.amperage}Ah ({sale.quantity}×)
                      </span>
                      <span className="text-xl font-black tracking-wider" dir="ltr">
                        #{sale.label_number}
                      </span>
                    </div>
                    <div className="py-1">
                      <BarcodeSvg value={String(sale.label_number)} height={46} />
                    </div>
                    <div className="border-t border-dashed border-black pt-1 flex justify-between text-[10px] font-bold">
                      <span>
                        {sale.category_name}
                        {sale.has_scrap ? ` | داغی: ${sale.scrap_amperage}A` : ' | بدون داغی'}
                      </span>
                      <span className="tabular-nums">{formatJalaliDateTime(sale.created_at)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handlePrintLabel}
                    className="mt-4 w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                  >
                    <Tag className="w-4 h-4" />
                    چاپ با پرینتر لیبل‌زن (کد #{sale.label_number})
                  </button>
                </div>

                <div className="bg-white/80 rounded-xl p-3 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                  این لیبل دارای بارکد استاندارد <strong>Code-128</strong> است و به صورت خودکار از عدد{' '}
                  <strong>۱۵۰۰ به بالا</strong> تولید می‌شود تا روی بدنه باتری یا کارت گارانتی چسبانده شود.
                </div>
              </div>
            )}

            {/* 2. 80mm Receipt Printer Preview */}
            {(activeTab === 'both' || activeTab === 'receipt') && (
              <div className={activeTab === 'both' ? 'lg:col-span-7 space-y-3' : 'space-y-3'}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-blue-600" />
                    پرینتر ۲: فیش‌زن حرارتی سایز ۸ سانتی (عرض 80mm)
                  </span>
                  <span className="text-[11px] bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md font-bold">
                    رول ۸ سانتی استاندارد
                  </span>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-300 shadow-md">
                  {/* Simulated 80mm Paper */}
                  <div className="max-w-[310px] mx-auto bg-white text-black border border-slate-300 p-4 shadow-inner text-xs">
                    <div className="text-center border-b-2 border-black pb-2 mb-2">
                      <div className="font-black text-sm">{storeName}</div>
                      {storeAddress && <div className="text-[11px] font-semibold mt-0.5">{storeAddress}</div>}
                      {storePhone && <div className="text-[11px] font-bold mt-0.5">تلفن: {storePhone}</div>}
                    </div>

                    <div className="border-2 border-black py-1 px-2 text-center font-black text-sm mb-2">
                      شماره لیبل باتری: #{sale.label_number}
                    </div>

                    <div className="space-y-1 border-b border-dashed border-black pb-2 mb-2 text-[11px]">
                      <div className="flex justify-between">
                        <span>شماره فاکتور:</span>
                        <strong dir="ltr">{sale.invoice_number}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>تاریخ و ساعت:</span>
                        <strong className="tabular-nums">{formatJalaliDateTime(sale.created_at)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>صندوقدار:</span>
                        <strong>{sale.cashier_name}</strong>
                      </div>
                      {sale.customer_name && (
                        <div className="flex justify-between">
                          <span>مشتری:</span>
                          <strong>
                            {sale.customer_name} {sale.customer_phone ? `(${sale.customer_phone})` : ''}
                          </strong>
                        </div>
                      )}
                    </div>

                    <table className="w-full text-[11px] mb-2 border-collapse">
                      <thead>
                        <tr className="border-y-2 border-black font-extrabold">
                          <th className="py-1 text-right">شرح</th>
                          <th className="py-1 text-center">آمپر</th>
                          <th className="py-1 text-left">مبلغ (تومان)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dotted divide-black">
                        <tr>
                          <td className="py-1.5">
                            <div className="font-bold">
                              {sale.category_name} {sale.brand_name}
                            </div>
                            <div className="text-[10px]">
                              {formatNumber(sale.quantity)} عدد × آمپری {formatNumber(sale.unit_price_per_amp)}
                            </div>
                          </td>
                          <td className="py-1.5 text-center font-bold tabular-nums">
                            {formatNumber(sale.total_sold_amps)}Ah
                          </td>
                          <td className="py-1.5 text-left font-bold tabular-nums">
                            {formatNumber(sale.gross_amount)}
                          </td>
                        </tr>
                        {sale.has_scrap ? (
                          <tr>
                            <td className="py-1.5">
                              <div className="font-bold">کسر تحویل باتری داغی</div>
                              <div className="text-[10px]">
                                آمپری {formatNumber(sale.scrap_price_per_amp)} تومان
                              </div>
                            </td>
                            <td className="py-1.5 text-center font-bold tabular-nums">
                              {formatNumber(sale.total_scrap_amps)}Ah
                            </td>
                            <td className="py-1.5 text-left font-bold tabular-nums">
                              -{formatNumber(sale.scrap_deduction_amount)}
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>

                    <div className="border-t-2 border-black pt-2 space-y-1 text-[11px] font-bold">
                      <div className="flex justify-between">
                        <span>جمع باتری نو:</span>
                        <span className="tabular-nums">{formatNumber(sale.gross_amount)} تومان</span>
                      </div>
                      <div className="flex justify-between">
                        <span>کسر داغی باتری:</span>
                        <span className="tabular-nums">
                          {sale.has_scrap ? `${formatNumber(sale.scrap_deduction_amount)}- تومان` : '۰ تومان'}
                        </span>
                      </div>
                    </div>

                    <div className="border-2 border-black p-2 my-2 flex justify-between items-center font-black text-sm">
                      <span>قابل پرداخت:</span>
                      <span className="tabular-nums">{formatNumber(sale.final_sale_amount)} تومان</span>
                    </div>

                    <div className="border-b border-dashed border-black pb-2 mb-2 text-[11px] font-bold">
                      <div>روش پرداخت: {paymentMethodLabel(sale)}</div>
                      {sale.payment_ref && <div>شماره پیگیری: {sale.payment_ref}</div>}
                    </div>

                    <div className="text-center space-y-1">
                      <div className="w-44 mx-auto">
                        <BarcodeSvg value={String(sale.label_number)} height={34} />
                      </div>
                      <div className="font-black text-[11px]" dir="ltr">
                        *{sale.label_number}*
                      </div>
                      <div className="text-[10px] font-semibold">{footerNote}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handlePrintReceipt}
                    className="mt-4 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    چاپ فیش مشتری (سایز ۸ سانتی / 80mm)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
