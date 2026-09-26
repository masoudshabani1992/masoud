import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatToman, formatNumber, formatDateFa, STAGES } from '../utils/helpers';
import {
  Printer,
  X,
  Building2,
  FileText,
  CheckCircle2,
  Boxes,
  Layers,
  Sparkles,
  QrCode
} from 'lucide-react';

export default function PrintTicketModal({ project, onClose }) {
  const { role } = useAuth();
  const canViewInvoice = role === 'ceo' || role === 'sales' || role === 'accounting';

  const [docType, setDocType] = useState(canViewInvoice ? 'invoice' : 'job_ticket'); // 'job_ticket' or 'invoice'

  if (!project) return null;

  const handlePrint = () => {
    window.print();
  };

  // Determine correct dimensions without undefined fallback
  const length = project.box_length || project.length_mm || project.cardboard_length || project.length || '';
  const width = project.box_width || project.width_mm || project.cardboard_width || project.width || '';
  const height = project.box_height || project.height_mm || project.cardboard_height || project.height || '';
  const dimensionString = (length && width && height)
    ? `${length} × ${width} × ${height} mm`
    : (project.dimensions || 'طبق فایل خط تیغ');

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[95vh] flex flex-col">
        {/* Controls Bar (Hidden on print) */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">نوع سند چاپی:</span>
            <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setDocType('job_ticket')}
                className={`px-3 py-1 text-xs rounded-md font-bold transition-all ${
                  docType === 'job_ticket' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                حواله و دستور کار تولید (Job Card)
              </button>

              {/* پیش‌فاکتور فروش فقط برای مدیرعامل و بازرگانی مجاز است */}
              {canViewInvoice && (
                <button
                  type="button"
                  onClick={() => setDocType('invoice')}
                  className={`px-3 py-1 text-xs rounded-md font-bold transition-all ${
                    docType === 'invoice' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  پیش‌فاکتور رسمی فروش
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>چاپ سند (A4)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body (Printable Area) */}
        <div className="p-8 overflow-y-auto flex-1 bg-white text-slate-900 font-sans text-xs space-y-6">
          
          {/* Header of Invoice / Job Ticket */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                <Boxes className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <h1 className="text-base font-black text-slate-900">
                  مجتمع چاپ و بسته‌بندی امیران
                </h1>
                <p className="text-[10px] text-slate-600">
                  تولیدکننده تخصصی انواع کارتن‌های لمینتی صادراتی، جعبه‌های دارویی، فست‌فود و هاردباکس
                </p>
              </div>
            </div>

            <div className="text-left font-mono space-y-1">
              <div className="text-sm font-black text-indigo-900 bg-indigo-50 px-3 py-1 rounded border border-indigo-200">
                {docType === 'job_ticket' ? 'برگه دستور کار تولید' : 'پیش‌فاکتور فروش'}
              </div>
              <div className="text-[11px] text-slate-600">کد رهگیری: <strong>{project.archive_code || project.tracking_code}</strong></div>
              <div className="text-[11px] text-slate-600">تاریخ: <strong>{formatDateFa(project.created_at)}</strong></div>
            </div>
          </div>

          {/* Customer & Order Metadata */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="space-y-1.5">
              <div>نام مشتری / شرکت: <strong className="text-slate-900">{project.customer_name}</strong></div>
              <div>شماره تماس: <strong className="font-mono">{project.customer_phone || '---'}</strong></div>
              <div>عنوان پروژه: <strong className="text-indigo-900">{project.title}</strong></div>
            </div>
            <div className="space-y-1.5">
              <div>نوع محصول: <strong className="text-slate-900">{project.box_type || 'مقوا تک‌لا'}</strong></div>
              <div>مدل درب و قفل: <strong className="text-slate-900">{project.box_structure || 'درب دارویی ساده (Tuck End)'}</strong></div>
              <div>مرحله جاری در کارخانه: <strong className="text-amber-700">{STAGES.find(s => s.id === project.current_stage)?.name || STAGES.find(s => s.id === project.current_stage)?.title}</strong></div>
            </div>
          </div>

          {/* Technical Specifications Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>مشخصات فنی و تیراژ تولید</span>
            </h3>
            <table className="w-full border-collapse border border-slate-300 text-center">
              <thead className="bg-slate-100 font-bold">
                <tr>
                  <th className="border border-slate-300 p-2">ابعاد داخلی (L×W×H)</th>
                  <th className="border border-slate-300 p-2">تیراژ سفارش</th>
                  <th className="border border-slate-300 p-2">نوع مقوا / گراماژ</th>
                  <th className="border border-slate-300 p-2">فلوتینگ / سینگل</th>
                  <th className="border border-slate-300 p-2">چاپ افست</th>
                  <th className="border border-slate-300 p-2">خدمات تکمیلی</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-2.5 font-mono font-bold text-slate-900">
                    {dimensionString}
                  </td>
                  <td className="border border-slate-300 p-2.5 font-bold text-indigo-900 font-mono">
                    {formatNumber(project.quantity)} عدد
                  </td>
                  <td className="border border-slate-300 p-2.5">
                    {project.cardboard_type || project.specs_data?.paperType || 'ایندربرد ۳۰۰ گرم'}
                  </td>
                  <td className="border border-slate-300 p-2.5">
                    {project.has_sheet ? (project.sheet_type || project.sheet_category || 'سینگل فیس') : (project.specs_data?.insideFlute || 'بدون سینگل (تک‌لا)')}
                  </td>
                  <td className="border border-slate-300 p-2.5">
                    {project.print_type ? `${project.print_type} (${project.print_colors_count || 4} رنگ)` : (project.specs_data?.printColors || 'افست ۴ رنگ CMYK')}
                  </td>
                  <td className="border border-slate-300 p-2.5">
                    {[
                      project.has_cellophane ? (project.cellophane_type || 'سلفون') : null,
                      project.has_uv ? (project.uv_type || 'یووی') : null,
                      project.has_foil ? (project.foil_type || 'طلاکوب') : null,
                      project.has_blade ? (project.blade_type || 'دایکات') : null,
                      project.has_glue ? (project.glue_type || 'جعبه‌چسبانی') : null
                    ].filter(Boolean).join('، ') || 'سلفون مات، یووی موضعی، دایکات'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* If Invoice View: Price Table (تنها برای مدیرعامل و بازرگانی) */}
          {docType === 'invoice' && canViewInvoice && (
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 text-xs">جدول مالی پیش‌فاکتور</h3>
              <table className="w-full border-collapse border border-slate-300 text-center">
                <thead className="bg-slate-100 font-bold">
                  <tr>
                    <th className="border border-slate-300 p-2">ردیف</th>
                    <th className="border border-slate-300 p-2">شرح کالا و خدمات</th>
                    <th className="border border-slate-300 p-2">تعداد</th>
                    <th className="border border-slate-300 p-2">قیمت واحد (تومان)</th>
                    <th className="border border-slate-300 p-2">مبلغ کل (تومان)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 p-2">۱</td>
                    <td className="border border-slate-300 p-2 font-medium text-right pr-3">
                      تولید و چاپ اختصاصی {project.title}
                    </td>
                    <td className="border border-slate-300 p-2 font-mono">{formatNumber(project.quantity)}</td>
                    <td className="border border-slate-300 p-2 font-mono">{formatToman(project.estimated_unit_price)}</td>
                    <td className="border border-slate-300 p-2 font-mono font-bold text-emerald-800">
                      {formatToman(project.estimated_total_price)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan="4" className="border border-slate-300 p-2.5 text-left pl-4">جمع کل قابل پرداخت:</td>
                    <td className="border border-slate-300 p-2.5 font-mono text-emerald-900 text-sm">
                      {formatToman(project.estimated_total_price)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-600 space-y-1">
                <div>• مدت اعتبار این پیش‌فاکتور ۳ روز کاری از تاریخ صدور می‌باشد.</div>
                <div>• نحوه پرداخت: ۵۰ درصد پیش‌پرداخت همزمان با تایید طرح و الباقی قبل از بارگیری تسویه می‌گردد.</div>
                <div>• تلورانس تیراژ در صنایع چاپ و بسته‌بندی ±۵٪ قابل قبول است.</div>
              </div>
            </div>
          )}

          {/* If Job Ticket View: Factory Workstations Routing */}
          {docType === 'job_ticket' && (
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 text-xs">گردش ایستگاه‌های خط تولید و کنترل کیفیت کارخانه</h3>
              <table className="w-full border-collapse border border-slate-300 text-center text-[11px]">
                <thead className="bg-slate-100 font-bold">
                  <tr>
                    <th className="border border-slate-300 p-2">ایستگاه کاری</th>
                    <th className="border border-slate-300 p-2">دستگاه / خط</th>
                    <th className="border border-slate-300 p-2">مشخصات اقدام</th>
                    <th className="border border-slate-300 p-2">امضا اپراتور</th>
                    <th className="border border-slate-300 p-2">تایید QC</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 p-2 font-bold">۱. لیتوگرافی</td>
                    <td className="border border-slate-300 p-2">CTP دیجیتال</td>
                    <td className="border border-slate-300 p-2 text-right pr-2">تهیه ۴ لنگه زینک سایز بزرگ</td>
                    <td className="border border-slate-300 p-2">..........</td>
                    <td className="border border-slate-300 p-2">✓ تایید</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2 font-bold">۲. چاپ افست</td>
                    <td className="border border-slate-300 p-2">هایدلبرگ CD</td>
                    <td className="border border-slate-300 p-2 text-right pr-2">چاپ ۴ رنگ + کنترل رجیستر</td>
                    <td className="border border-slate-300 p-2">..........</td>
                    <td className="border border-slate-300 p-2">✓ تایید</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2 font-bold">۳. سلفون‌کشی</td>
                    <td className="border border-slate-300 p-2">حرارتی اتومات</td>
                    <td className="border border-slate-300 p-2 text-right pr-2">سلفون مات بدون حباب و چروک</td>
                    <td className="border border-slate-300 p-2">..........</td>
                    <td className="border border-slate-300 p-2">✓ تایید</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2 font-bold">۴. لامینت</td>
                    <td className="border border-slate-300 p-2">لمینیتور شیت</td>
                    <td className="border border-slate-300 p-2 text-right pr-2">چسباندن روی سینگل E فلوت</td>
                    <td className="border border-slate-300 p-2">..........</td>
                    <td className="border border-slate-300 p-2">..........</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2 font-bold">۵. دایکات</td>
                    <td className="border border-slate-300 p-2">بوبست ۱۰۶</td>
                    <td className="border border-slate-300 p-2 text-right pr-2">تیغ‌زنی قالب لیزری و پوشال‌برداری</td>
                    <td className="border border-slate-300 p-2">..........</td>
                    <td className="border border-slate-300 p-2">..........</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2 font-bold">۶. جعبه‌چسبانی</td>
                    <td className="border border-slate-300 p-2">خط اتومات</td>
                    <td className="border border-slate-300 p-2 text-right pr-2">چسب داغ لب‌چسب و بسته‌بندی</td>
                    <td className="border border-slate-300 p-2">..........</td>
                    <td className="border border-slate-300 p-2">..........</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Signatures Footer */}
          <div className="grid grid-cols-4 gap-4 text-center pt-8 border-t border-slate-300">
            <div className="space-y-8">
              <div className="font-bold text-slate-800">واحد بازرگانی و فروش</div>
              <div className="text-[11px] text-slate-400">امضا و تاریخ</div>
            </div>
            <div className="space-y-8">
              <div className="font-bold text-slate-800">واحد طراحی و ماکت‌سازی</div>
              <div className="text-[11px] text-slate-400">امضا و تاریخ</div>
            </div>
            <div className="space-y-8">
              <div className="font-bold text-slate-800">سرپرست تولید و چاپ</div>
              <div className="text-[11px] text-slate-400">امضا و تاریخ</div>
            </div>
            <div className="space-y-8">
              <div className="font-bold text-slate-800">تایید نهایی مدیریت عامل</div>
              <div className="text-[11px] text-slate-400">مهر و امضا رسمی</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
