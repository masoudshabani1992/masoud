import React, { useState, useMemo } from 'react';
import { STAGES, BOX_TYPES, formatToman, formatNumber, formatDateFa, matchProduct } from '../utils/helpers';
import {
  Search,
  Filter,
  Eye,
  FileText,
  Copy,
  Boxes,
  Layers,
  Sparkles,
  Scissors,
  CheckCircle2,
  Clock,
  AlertCircle,
  PackageCheck,
  RefreshCw,
  X,
  Printer,
  Calendar,
  Building2,
  Phone,
  Tag,
  SlidersHorizontal,
  Download
} from 'lucide-react';

export default function ProductsArchiveView({
  projects = [],
  onSelectProject,
  onPrintTicket,
  onReorderProject,
  onRefresh
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('all');
  const [selectedBoxType, setSelectedBoxType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all', 'in_progress', 'completed'
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'quantity_desc', 'price_desc'

  // Filtered & Sorted Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // 1. Universal Search Filter
      const matchesSearch = matchProduct(p, searchTerm);
      if (!matchesSearch) return false;

      // 2. Stage Filter
      if (selectedStage !== 'all' && p.current_stage !== parseInt(selectedStage)) {
        return false;
      }

      // 3. Box Type Filter
      if (selectedBoxType !== 'all') {
        const pBoxType = (p.box_type || '') + ' ' + (p.cardboard_type || '');
        if (!pBoxType.includes(selectedBoxType)) return false;
      }

      // 4. Status Filter
      if (selectedStatus === 'in_progress' && p.current_stage >= 10) return false;
      if (selectedStatus === 'completed' && p.current_stage < 10) return false;

      // 5. Priority Filter
      if (selectedPriority !== 'all' && p.priority !== selectedPriority) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return b.id - a.id;
      if (sortBy === 'oldest') return a.id - b.id;
      if (sortBy === 'quantity_desc') return (b.quantity || 0) - (a.quantity || 0);
      if (sortBy === 'price_desc') return (b.estimated_total_price || 0) - (a.estimated_total_price || 0);
      return 0;
    });
  }, [projects, searchTerm, selectedStage, selectedBoxType, selectedStatus, selectedPriority, sortBy]);

  // Summary Metrics
  const totalCount = projects.length;
  const inProgressCount = projects.filter((p) => p.current_stage < 10).length;
  const completedCount = projects.filter((p) => p.current_stage >= 10).length;
  const totalBoxes = projects.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStage('all');
    setSelectedBoxType('all');
    setSelectedStatus('all');
    setSelectedPriority('all');
    setSortBy('newest');
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedStage !== 'all' ||
    selectedBoxType !== 'all' ||
    selectedStatus !== 'all' ||
    selectedPriority !== 'all';

  return (
    <div className="w-full space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-800 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-amber-300 shadow-inner">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                آرشیو و جستجوی جامع محصولات و سفارشات
              </h2>
              <span className="bg-indigo-500 text-white text-xs font-bold px-3 py-0.5 rounded-full shadow-sm">
                بانک اطلاعات جعبه‌سازی
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              جستجوی هوشمند در کلیه محصولات با نام کار، کد آرشیو، کد سفارش، نام مشتری، نوع مقوا، ابعاد، تیراژ و مشخصات فنی چاپ
            </p>
          </div>
        </div>

        {/* Quick Stats in Banner */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-800/90 px-4 py-2.5 rounded-xl border border-slate-700 text-center">
            <span className="text-[11px] text-slate-400 block font-bold">کل محصولات</span>
            <span className="text-lg font-black text-white">{totalCount}</span>
          </div>
          <div className="bg-slate-800/90 px-4 py-2.5 rounded-xl border border-slate-700 text-center">
            <span className="text-[11px] text-slate-400 block font-bold">در حال تولید</span>
            <span className="text-lg font-black text-amber-400">{inProgressCount}</span>
          </div>
          <div className="bg-slate-800/90 px-4 py-2.5 rounded-xl border border-slate-700 text-center">
            <span className="text-[11px] text-slate-400 block font-bold">تحویل شده</span>
            <span className="text-lg font-black text-emerald-400">{completedCount}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Controls Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        
        {/* Universal Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-indigo-600 absolute right-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجوی سریع: نام کار، کد آرشیو (مثلاً 4821)، کد رهگیری، نام مشتری، نوع مقوا (ایندربرد/پشت طوسی)، ساختار و ابعاد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-12 py-3.5 text-sm rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium bg-slate-50/50 focus:bg-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs transition-colors"
              title="پاک کردن جستجو"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Grid */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>فیلترها:</span>
            </div>

            {/* Stage Filter */}
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">همه مراحل (۱ تا ۹)</option>
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id <= 9 ? `گام ${s.id}: ${s.shortName}` : s.shortName}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="in_progress">در گردش خط تولید</option>
              <option value="completed">تکمیل و تحویل شده</option>
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">همه اولویت‌ها</option>
              <option value="urgent">فوری / اضطراری</option>
              <option value="high">اولویت بالا</option>
              <option value="normal">عادی</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="newest">جدیدترین به قدیمی‌ترین</option>
              <option value="oldest">قدیمی‌ترین به جدیدترین</option>
              <option value="quantity_desc">بیشترین تیراژ</option>
              <option value="price_desc">بیشترین مبلغ سفارش</option>
            </select>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl font-bold transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>حذف فیلترها</span>
              </button>
            )}
          </div>

          <div className="text-xs text-slate-600 font-bold bg-slate-100 px-3 py-1.5 rounded-lg">
            نمایش <strong className="text-indigo-600 font-black">{filteredProjects.length}</strong> محصول از {projects.length} مورد
          </div>
        </div>
      </div>

      {/* Products & Orders Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredProjects.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">هیچ محصول یا سفارشی مطابق جستجو یافت نشد!</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              عبارت جستجو «{searchTerm}» یا فیلترهای انتخابی را بررسی نمایید.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>نمایش تمام محصولات</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right divide-y divide-slate-200">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="py-3.5 px-4">کد آرشیو / رهگیری</th>
                  <th className="py-3.5 px-4">نام کاربری / محصول (Job Name)</th>
                  <th className="py-3.5 px-4">مشتری و تماس</th>
                  <th className="py-3.5 px-4">ابعاد جعبه (mm)</th>
                  <th className="py-3.5 px-4">تیراژ</th>
                  <th className="py-3.5 px-4">مشخصات متریال و چاپ</th>
                  <th className="py-3.5 px-4">مرحله گردش کار</th>
                  <th className="py-3.5 px-4">مبلغ کل برآورد</th>
                  <th className="py-3.5 px-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredProjects.map((proj) => {
                  const stageInfo = STAGES.find((s) => s.id === proj.current_stage) || STAGES[0];
                  const isCompleted = proj.current_stage >= 10;

                  return (
                    <tr
                      key={proj.id}
                      className="hover:bg-indigo-50/40 transition-colors group"
                    >
                      {/* Codes Column */}
                      <td className="py-3 px-4 font-mono">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 inline-block w-fit">
                            {proj.archive_code ? `کد: ${proj.archive_code}` : proj.tracking_code}
                          </span>
                          {proj.order_code && (
                            <span className="text-[10px] text-slate-500">
                              سفارش: {proj.order_code}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Product Title */}
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                          {proj.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                            {proj.box_type || 'جعبه مقوایی'}
                          </span>
                          {proj.priority === 'urgent' && (
                            <span className="bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
                              فوری
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{proj.customer_name}</div>
                        {proj.customer_phone && (
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{proj.customer_phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Dimensions */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {proj.length_mm} × {proj.width_mm} × {proj.height_mm}
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <span className="bg-slate-100 px-2 py-1 rounded text-indigo-700">
                          {formatNumber(proj.quantity)} عدد
                        </span>
                      </td>

                      {/* Technical Specs Summary */}
                      <td className="py-3 px-4 text-slate-600">
                        <div className="space-y-0.5 max-w-[220px]">
                          <div className="truncate font-medium text-slate-800">
                            {proj.cardboard_type || 'مقوا'} {proj.cardboard_grammage ? `(${proj.cardboard_grammage}g)` : ''}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {proj.print_type || 'چاپ افست'} • {proj.cellophane_type || 'سلفون'}
                          </div>
                        </div>
                      </td>

                      {/* Stage Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black ${stageInfo.badgeColor}`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          <span>{stageInfo.shortName}</span>
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-bold">
                        {proj.estimated_total_price > 0 ? (
                          <div className="text-emerald-700 font-black">
                            {formatToman(proj.estimated_total_price)}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">در انتظار برآورد</span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectProject(proj)}
                            className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                            title="مشاهده و ورود به مرحله گردش کار"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onPrintTicket(proj)}
                            className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                            title="چاپ برگه کار و پیش‌فاکتور"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {onReorderProject && (
                            <button
                              onClick={() => onReorderProject(proj)}
                              className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                              title="تکرار / ثبت سفارش جدید با مشخصات این محصول"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
