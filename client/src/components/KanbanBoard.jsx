import React, { useState } from 'react';
import { STAGES, formatToman, formatNumber, matchProduct } from '../utils/helpers';
import N8nWorkflowCanvas from './N8nWorkflowCanvas';
import {
  Search,
  Filter,
  Eye,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  ChevronLeft,
  Boxes,
  ArrowRight,
  X,
  RefreshCw,
  LayoutGrid,
  Table as TableIcon,
  Layers,
  Sparkles,
  ShieldCheck,
  UserCheck,
  BarChart3,
  Kanban,
  Workflow
} from 'lucide-react';

export default function KanbanBoard({
  projects = [],
  onSelectProject,
  onPrintTicket,
  currentRole,
  onNavigateTab
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStageFilter, setSelectedStageFilter] = useState('all');
  const [viewMode, setViewMode] = useState('n8n'); // 'n8n' (visual canvas), 'grid' (3x3), 'table'

  const filteredProjects = projects.filter((p) => {
    const matchSearch = matchProduct(p, searchTerm);
    const matchPriority = selectedPriority === 'all' || p.priority === selectedPriority;
    const matchStage = selectedStageFilter === 'all' || p.current_stage === parseInt(selectedStageFilter);

    return matchSearch && matchPriority && matchStage;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPriority('all');
    setSelectedStageFilter('all');
  };

  const hasActiveFilters = searchTerm !== '' || selectedPriority !== 'all' || selectedStageFilter !== 'all';

  // Display stages to render (either all 9 or filtered single stage)
  const displayedStages = selectedStageFilter === 'all'
    ? STAGES
    : STAGES.filter((s) => s.id === parseInt(selectedStageFilter));

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Consolidated Dashboard / Kanban / Archive Unified Subtab Bar */}
      {onNavigateTab && (
        <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => onNavigateTab('dashboard')}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-purple-800 hover:bg-purple-50/60 transition flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span>۱. داشبورد و آمار تحلیلی</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('kanban')}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-indigo-100 text-indigo-950 border border-indigo-300/80 shadow-2xs flex items-center gap-2"
            >
              <Kanban className="w-4 h-4 text-indigo-700" />
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
      
      {/* Search & Filter Header Bar - 100% Responsive with Grid Layout */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-indigo-600 absolute right-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجوی سریع: نام مشتری، شماره موبایل، نام محصول یا شماره پرونده (کد آرشیو)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-10 py-3 text-xs sm:text-sm rounded-2xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium bg-slate-50/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors"
                title="پاک کردن جستجو"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns & View Mode Switcher */}
          <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto">
            
            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">همه اولویت‌ها</option>
              <option value="urgent">فوری / اضطراری</option>
              <option value="high">اولویت بالا</option>
              <option value="normal">اولویت عادی</option>
            </select>

            {/* Stage Filter */}
            <select
              value={selectedStageFilter}
              onChange={(e) => setSelectedStageFilter(e.target.value)}
              className="px-3.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">نمایش هر ۱۰ مرحله خط تولید</option>
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  مرحله {s.id}: {s.title}
                </option>
              ))}
            </select>

            {/* View Mode Toggle (n8n Workflow Canvas vs Grid vs Table) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('n8n')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  viewMode === 'n8n'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="بوم تعاملی گردش کار ۱۰ مرحله‌ای به سبک n8n"
              >
                <Workflow className="w-3.5 h-3.5" />
                <span>بوم گرافیکی (n8n)</span>
              </button>

              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="نمای شبکه‌ای ۳×۳ دپارتمان‌ها (بدون اسکرول افقی)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>نمای شبکه‌ای (Grid)</span>
              </button>

              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  viewMode === 'table'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="نمای فشرده جدولی"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>نمای جدولی</span>
              </button>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl font-bold transition-colors border border-rose-200"
              >
                <X className="w-3.5 h-3.5" />
                <span>حذف فیلترها</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Summary Badges Bar */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-bold">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>
              نمایش <strong className="text-indigo-700 font-black">{filteredProjects.length.toLocaleString('fa-IR')}</strong> سفارش فعال در خط تولید
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {STAGES.map((st) => {
              const count = projects.filter(p => p.current_stage === st.id).length;
              return (
                <button
                  key={st.id}
                  onClick={() => setSelectedStageFilter(selectedStageFilter === String(st.id) ? 'all' : String(st.id))}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 border ${
                    selectedStageFilter === String(st.id)
                      ? 'bg-slate-900 text-amber-300 border-slate-800 shadow-xs ring-1 ring-slate-900'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{st.id}. {st.shortName}</span>
                  <span className={`px-1.5 py-0.2 rounded-full font-black text-[10px] ${count > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-500'}`}>
                    {count.toLocaleString('fa-IR')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* VIEW MODE 0: INTERACTIVE n8n WORKFLOW CANVAS */}
      {viewMode === 'n8n' && (
        <N8nWorkflowCanvas
          projects={filteredProjects}
          onSelectProject={onSelectProject}
          searchTerm={searchTerm}
          selectedPriority={selectedPriority}
        />
      )}

      {/* VIEW MODE 1: ELEGANT 3x3 GRID (Zero Horizontal Scrolling) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
          {displayedStages.map((stage) => {
            const stageProjects = filteredProjects.filter((p) => p.current_stage === stage.id);
            const isMyRoleStage =
              currentRole === 'ceo' ||
              (stage.role === currentRole) ||
              (currentRole === 'sales' && [1, 5, 7].includes(stage.id));

            return (
              <div
                key={stage.id}
                className={`bg-white rounded-3xl border-2 flex flex-col shadow-sm transition-all duration-200 hover:shadow-md ${
                  isMyRoleStage
                    ? 'border-indigo-400 ring-2 ring-indigo-500/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Stage Header */}
                <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 rounded-t-3xl">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-slate-900 text-amber-300 font-black text-xs flex items-center justify-center shadow-xs">
                        {stage.id}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${stage.badgeColor}`}>
                        {stage.shortName}
                      </span>
                    </div>

                    <span className="text-xs font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      {stageProjects.length.toLocaleString('fa-IR')} سفارش
                    </span>
                  </div>

                  <h3 className="font-black text-sm sm:text-base text-slate-900 line-clamp-1">{stage.title}</h3>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <span>دپارتمان:</span>
                      <strong className="text-slate-800 font-bold">{stage.roleName}</strong>
                    </span>
                    {isMyRoleStage && (
                      <span className="text-indigo-700 font-black bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200 text-[11px] flex items-center gap-1">
                        <UserCheck className="w-3 h-3" />
                        <span>کارتابل شما</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Vertical Scrollable Jobs List Inside Stage */}
                <div className="p-3.5 space-y-3 flex-1 overflow-y-auto max-h-[440px]">
                  {stageProjects.length === 0 ? (
                    <div className="h-44 flex flex-col items-center justify-center text-slate-400 text-xs sm:text-sm text-center p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      <Boxes className="w-8 h-8 text-slate-300 mb-2" />
                      <span className="font-bold">سفارشی در این مرحله قرار ندارد</span>
                    </div>
                  ) : (
                    stageProjects.map((proj) => (
                      <div
                        key={proj.id}
                        onClick={() => onSelectProject(proj)}
                        className="bg-slate-50/80 hover:bg-white rounded-2xl p-4 border border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer group relative text-right space-y-3"
                      >
                        {/* Top: Archive Code & Priority */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-100/70 px-2.5 py-0.5 rounded-md border border-indigo-200">
                              کد آرشیو: {proj.archive_code || proj.tracking_code}
                            </span>
                            {proj.order_code && (
                              <span className="font-mono text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                سفارش: {proj.order_code}
                              </span>
                            )}
                          </div>

                          {proj.priority === 'urgent' && (
                            <span className="text-[11px] bg-rose-100 text-rose-700 font-black px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse border border-rose-200">
                              <AlertCircle className="w-3 h-3" /> فوری
                            </span>
                          )}
                          {proj.priority === 'high' && (
                            <span className="text-[11px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md border border-amber-200">
                              اولویت بالا
                            </span>
                          )}
                        </div>

                        {/* Title & Customer */}
                        <div>
                          <h4 className="font-black text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 leading-snug">
                            {proj.title}
                          </h4>
                          <div className="text-xs text-slate-600 mt-1 flex items-center justify-between">
                            <span className="truncate font-bold text-slate-700">{proj.customer_name}</span>
                            <span className="text-slate-500 text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                              {proj.box_structure || 'ساده'}
                            </span>
                          </div>
                        </div>

                        {/* Specs Matrix Pills */}
                        <div className="bg-white p-2.5 rounded-xl text-xs text-slate-600 space-y-1.5 border border-slate-200/80">
                          <div className="flex items-center justify-between">
                            <span>جنس و گرماژ:</span>
                            <strong className="font-bold text-slate-800">
                              {proj.cardboard_type || 'پشت طوسی'} ({proj.cardboard_grammage || 350} گرم)
                            </strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>تیراژ سفارش:</span>
                            <strong className="font-black text-indigo-700">
                              {formatNumber(proj.quantity)} عدد
                            </strong>
                          </div>
                          
                          {/* Finishes Badges */}
                          <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-slate-100 text-[10px]">
                            {proj.has_cellophane ? <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-200">سلفون</span> : null}
                            {proj.has_uv ? <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-bold border border-purple-200">UV موضعی</span> : null}
                            {proj.has_foil ? <span className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-bold border border-amber-200">طلاکوب</span> : null}
                            {proj.has_blade ? <span className="bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded font-bold border border-sky-200">تیغ بوبست</span> : null}
                            {proj.has_sheet ? <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold border border-indigo-200">سینگل E</span> : null}
                          </div>
                        </div>

                        {/* Price & Action Buttons */}
                        <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-200/60">
                          <div className="text-xs">
                            <span className="text-slate-500 text-[11px] block">مبلغ کل:</span>
                            <strong className="text-emerald-700 font-black text-xs">
                              {proj.estimated_total_price > 0 ? formatToman(proj.estimated_total_price) : 'در حال برآورد'}
                            </strong>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onPrintTicket(proj);
                              }}
                              className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                              title="چاپ برگه کارگاه"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectProject(proj);
                              }}
                              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs shadow-indigo-100"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>ورود به مرحله</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: FULL TABLE VIEW (Alternative compact representation) */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-black">
                  <th className="p-3.5">کد آرشیو</th>
                  <th className="p-3.5">کد سفارش</th>
                  <th className="p-3.5">نام کار</th>
                  <th className="p-3.5">مشتری</th>
                  <th className="p-3.5">مرحله جاری</th>
                  <th className="p-3.5">تیراژ</th>
                  <th className="p-3.5">مشخصات مقوا</th>
                  <th className="p-3.5">خدمات تکمیلی</th>
                  <th className="p-3.5">مبلغ کل</th>
                  <th className="p-3.5 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredProjects.map((proj) => {
                  const stageObj = STAGES.find(s => s.id === proj.current_stage) || STAGES[0];
                  return (
                    <tr
                      key={proj.id}
                      onClick={() => onSelectProject(proj)}
                      className="hover:bg-indigo-50/50 cursor-pointer transition-colors"
                    >
                      <td className="p-3.5 font-mono font-black text-indigo-700 bg-slate-50/50">
                        {proj.archive_code || proj.tracking_code}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">
                        {proj.order_code || '-'}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {proj.title}
                      </td>
                      <td className="p-3.5 text-slate-700">
                        {proj.customer_name}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-black ${stageObj.badgeColor}`}>
                          {stageObj.title}
                        </span>
                      </td>
                      <td className="p-3.5 font-black text-indigo-700">
                        {formatNumber(proj.quantity)} عدد
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {proj.cardboard_type} {proj.cardboard_grammage} گرم
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1 flex-wrap">
                          {proj.has_cellophane ? <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded font-bold">سلفون</span> : null}
                          {proj.has_uv ? <span className="text-[10px] bg-purple-50 text-purple-700 px-1 py-0.5 rounded font-bold">UV</span> : null}
                          {proj.has_foil ? <span className="text-[10px] bg-amber-50 text-amber-800 px-1 py-0.5 rounded font-bold">طلاکوب</span> : null}
                          {proj.has_sheet ? <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded font-bold">سینگل</span> : null}
                        </div>
                      </td>
                      <td className="p-3.5 font-black text-emerald-700">
                        {proj.estimated_total_price > 0 ? formatToman(proj.estimated_total_price) : '-'}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProject(proj);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          مشاهده
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
