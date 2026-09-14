import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { STAGES, formatToman, formatNumber, matchProduct } from '../utils/helpers';
import {
  Inbox,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  UserCheck,
  FileText,
  Calculator,
  Compass,
  Scissors,
  ShoppingCart,
  Factory,
  Layers,
  Sparkles,
  Search,
  X
} from 'lucide-react';

export default function MyTasksInbox({
  projects = [],
  onSelectProject,
  onPrintTicket
}) {
  const { currentUser, role } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Determine stage mapping for current role
  let targetStages = [];
  if (role === 'ceo') targetStages = [3];
  else if (role === 'sales') targetStages = [1, 5, 7];
  else if (role === 'estimation') targetStages = [2];
  else if (role === 'design') targetStages = [4];
  else if (role === 'mockup') targetStages = [6];
  else if (role === 'procurement') targetStages = [8];
  else if (role === 'production') targetStages = [9];
  else if (role === 'customer') targetStages = [5, 7];

  const allMyTasks = projects.filter((p) => targetStages.includes(p.current_stage));
  const myTasks = allMyTasks.filter((p) => matchProduct(p, searchTerm));

  const getRoleIcon = (stageId) => {
    switch (stageId) {
      case 2: return <Calculator className="w-5 h-5 text-amber-600" />;
      case 3: return <UserCheck className="w-5 h-5 text-purple-600" />;
      case 4: return <Compass className="w-5 h-5 text-indigo-600" />;
      case 6: return <Scissors className="w-5 h-5 text-orange-600" />;
      case 8: return <ShoppingCart className="w-5 h-5 text-cyan-600" />;
      case 9: return <Factory className="w-5 h-5 text-rose-600" />;
      default: return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const getActionPrompt = (stageId) => {
    switch (stageId) {
      case 1: return 'بررسی مشخصات اولیه و ارجاع به واحد استعلام قیمت';
      case 2: return 'محاسبه قیمت تمام شده بر اساس قیمت روز مقوا، فلوت و چاپ و ارسال به مدیرعامل';
      case 3: return 'بررسی حاشیه سود، تایید نهایی پیش‌فاکتور و ارجاع به واحد طراحی';
      case 4: return 'ترسیم خط تیغ، آماده‌سازی فایل‌های چاپی و ارسال برای تایید مشتری';
      case 5: return 'اخذ تاییدیه فایل طراحی از مشتری و ارجاع به واحد ماکت‌سازی';
      case 6: return 'برش ماکت با پلاتر، کنترل ابعاد جعبه و آپلود عکس نمونه اولیه';
      case 7: return 'اخذ تاییدیه فیزیکی ماکت از کارفرما و ارجاع به واحد تدارکات';
      case 8: return 'خرید مقوا، زینک، فلوت و اقلام مصرفی و اعلام تحویل به انبار';
      case 9: return 'چاپ افست، لامینت، دایکات و جعبه‌چسبانی تا تحویل نهایی';
      default: return 'انجام بررسی‌های لازم';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Inbox Header Banner - Grand & Full Width */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-800 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-inner">
            <Inbox className="w-9 h-9" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
              <span>کارتابل وظایف منتظر اقدام</span>
              <span className="bg-indigo-500 text-white text-xs sm:text-sm px-3.5 py-1 rounded-full font-bold shadow-sm">
                {currentUser?.department}
              </span>
            </h2>
            <p className="text-sm text-slate-300 mt-1.5 max-w-2xl">
              در این بخش تنها پروژه‌هایی نمایش داده می‌شوند که برای ادامه فرآیند تولید نیازمند اقدام فوری شما هستند.
            </p>
          </div>
        </div>

        <div className="bg-slate-800/90 px-6 py-4 rounded-2xl border border-slate-700 text-center shadow-md min-w-[140px]">
          <div className="text-3xl sm:text-4xl font-black text-amber-400">{allMyTasks.length}</div>
          <div className="text-xs sm:text-sm text-slate-300 font-bold mt-1">سفارش منتظر اقدام</div>
        </div>
      </div>

      {/* Search Bar in Tasks Inbox */}
      {allMyTasks.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-indigo-600 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو در وظایف من: نام سفارش، کد آرشیو، نام مشتری..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-11 pl-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="text-xs text-slate-600 font-bold whitespace-nowrap bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            {myTasks.length} وظیفه
          </div>
        </div>
      )}

      {/* Task List - Wide Responsive Grid */}
      {allMyTasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">هیچ وظیفه معوقه‌ای ندارید!</h3>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            تمام پروژه‌های مربوط به بخش «{currentUser?.department}» انجام شده است یا در حال حاضر در سایر مراحل زنجیره تولید قرار دارند.
          </p>
        </div>
      ) : myTasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3 shadow-sm">
          <p className="text-sm font-bold text-slate-600">وظیفه‌ای با عبارت «{searchTerm}» پیدا نشد.</p>
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            پاک کردن جستجو
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
          {myTasks.map((proj) => {
            const currentStageInfo = STAGES.find((s) => s.id === proj.current_stage);

            return (
              <div
                key={proj.id}
                className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-indigo-500 hover:shadow-xl transition-all flex flex-col justify-between space-y-5 relative overflow-hidden group"
              >
                {/* Stage colored top bar */}
                <div className={`h-2 w-full absolute top-0 right-0 ${currentStageInfo?.badgeColor?.split(' ')[0] || 'bg-indigo-600'}`}></div>

                {/* Header: Tracking Code, Stage, Priority */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
                      {proj.archive_code ? `کد: ${proj.archive_code}` : proj.tracking_code}
                    </span>
                    <span className={`text-xs sm:text-sm font-black px-3 py-1 rounded-lg ${currentStageInfo?.badgeColor}`}>
                      {currentStageInfo?.shortName}
                    </span>
                  </div>

                  {proj.priority === 'urgent' && (
                    <span className="text-xs bg-rose-100 text-rose-700 font-black px-2.5 py-1 rounded-md flex items-center gap-1.5 animate-pulse">
                      <AlertCircle className="w-4 h-4" /> فوری
                    </span>
                  )}
                  {proj.priority === 'high' && (
                    <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2.5 py-1 rounded-md">
                      اولویت بالا
                    </span>
                  )}
                </div>

                {/* Order Title & Customer */}
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {proj.title}
                  </h3>
                  <div className="text-xs sm:text-sm text-slate-600 flex items-center justify-between pt-1">
                    <span>مشتری: <strong className="text-slate-800 font-bold">{proj.customer_name}</strong></span>
                    <span>تلفن: <strong className="font-mono text-slate-700">{proj.customer_phone || '---'}</strong></span>
                  </div>
                </div>

                {/* Specs Box */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>نوع و ساختار جعبه:</span>
                    <strong className="text-slate-800 font-bold">{proj.box_type} - {proj.box_structure}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>ابعاد (طول × عرض × ارتفاع):</span>
                    <strong className="font-mono text-slate-900 font-black">
                      {proj.length_mm} × {proj.width_mm} × {proj.height_mm} mm
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>تیراژ سفارش:</span>
                    <strong className="text-indigo-700 font-black text-sm">
                      {formatNumber(proj.quantity)} عدد
                    </strong>
                  </div>
                  {proj.estimated_total_price > 0 && (
                    <div className="flex items-center justify-between text-slate-700 pt-2 border-t border-slate-200">
                      <span>مبلغ کل برآورد:</span>
                      <strong className="text-emerald-700 font-black text-sm sm:text-base">
                        {formatToman(proj.estimated_total_price)}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Task Directive / Action required */}
                <div className="bg-amber-50/90 border border-amber-200 p-3.5 rounded-xl flex items-start gap-3 text-xs sm:text-sm text-amber-950">
                  <div className="mt-0.5 shrink-0">{getRoleIcon(proj.current_stage)}</div>
                  <div>
                    <strong className="block font-black mb-0.5 text-amber-900">اقدام مورد نیاز در این مرحله:</strong>
                    <span className="leading-relaxed">{getActionPrompt(proj.current_stage)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onPrintTicket(proj)}
                    className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
                  >
                    <FileText className="w-4 h-4" />
                    <span>برگه کار / فاکتور</span>
                  </button>

                  <button
                    onClick={() => onSelectProject(proj)}
                    className="flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 active:scale-95"
                  >
                    <span>شروع اقدام و تکمیل مرحله {proj.current_stage}</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
