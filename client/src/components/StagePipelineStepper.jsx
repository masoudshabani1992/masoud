import React from 'react';
import { STAGES } from '../utils/helpers';
import {
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CircleDot,
  CheckCircle2,
  Clock,
  Boxes,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  Workflow
} from 'lucide-react';

const STAGE_THEMES = {
  1: { bg: 'bg-blue-50/70', border: 'border-blue-100', text: 'text-blue-900', numBg: 'bg-blue-600 text-white', bar: 'bg-blue-500', badge: 'bg-blue-100/80 text-blue-800' },
  2: { bg: 'bg-amber-50/70', border: 'border-amber-100', text: 'text-amber-900', numBg: 'bg-amber-500 text-slate-950', bar: 'bg-amber-500', badge: 'bg-amber-100/80 text-amber-800' },
  3: { bg: 'bg-emerald-50/70', border: 'border-emerald-100', text: 'text-emerald-900', numBg: 'bg-emerald-600 text-white', bar: 'bg-emerald-500', badge: 'bg-emerald-100/80 text-emerald-800' },
  4: { bg: 'bg-purple-50/70', border: 'border-purple-100', text: 'text-purple-900', numBg: 'bg-purple-600 text-white', bar: 'bg-purple-500', badge: 'bg-purple-100/80 text-purple-800' },
  5: { bg: 'bg-indigo-50/70', border: 'border-indigo-100', text: 'text-indigo-900', numBg: 'bg-indigo-600 text-white', bar: 'bg-indigo-500', badge: 'bg-indigo-100/80 text-indigo-800' },
  6: { bg: 'bg-teal-50/70', border: 'border-teal-100', text: 'text-teal-900', numBg: 'bg-teal-600 text-white', bar: 'bg-teal-500', badge: 'bg-teal-100/80 text-teal-800' },
  7: { bg: 'bg-orange-50/70', border: 'border-orange-100', text: 'text-orange-900', numBg: 'bg-orange-500 text-white', bar: 'bg-orange-500', badge: 'bg-orange-100/80 text-orange-800' },
  8: { bg: 'bg-rose-50/70', border: 'border-rose-100', text: 'text-rose-900', numBg: 'bg-rose-600 text-white', bar: 'bg-rose-500', badge: 'bg-rose-100/80 text-rose-800' },
  9: { bg: 'bg-cyan-50/70', border: 'border-cyan-100', text: 'text-cyan-900', numBg: 'bg-cyan-600 text-white', bar: 'bg-cyan-500', badge: 'bg-cyan-100/80 text-cyan-800' },
  10: { bg: 'bg-emerald-50/80', border: 'border-emerald-200', text: 'text-emerald-950', numBg: 'bg-emerald-700 text-white', bar: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-900' }
};

export default function StagePipelineStepper({
  projects = [],
  selectedStageFilter = 'all',
  onSelectStage,
  activeProjectStage = null
}) {
  const activeStages = STAGES.filter((s) => s.id <= 10);
  const totalActive = projects.filter((p) => p.current_stage <= 10).length;
  const urgentCount = projects.filter((p) => p.priority === 'urgent' && p.current_stage <= 10).length;

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)] select-none" dir="rtl">
      
      {/* Top Header Bar (Nixtio Clean HR Dashboard Style) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
        
        {/* Left: Branding & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Workflow className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                چرخه ۱۰ مرحله‌ای خط تولید کارخانه
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700">
                گزارش زنده
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              توزیع بار کاری و جریان سفارشات در ایستگاه‌های ده‌گانه از بازرگانی تا تولید نهایی
            </p>
          </div>
        </div>

        {/* Right: Metrics & Filter Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs font-bold text-slate-600 flex items-center gap-2">
            <span>کل سفارشات فعال:</span>
            <span className="font-mono font-black text-indigo-700">{totalActive}</span>
          </div>

          {urgentCount > 0 && (
            <div className="px-3 py-1.5 rounded-2xl bg-rose-50 border border-rose-100 text-xs font-bold text-rose-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>فوری:</span>
              <span className="font-mono font-black text-rose-800">{urgentCount}</span>
            </div>
          )}

          {onSelectStage && selectedStageFilter !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectStage('all')}
              className="px-3 py-1.5 rounded-2xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition flex items-center gap-1 shadow-xs"
            >
              <span>نمایش همه ({projects.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* 10 Stage Cards Carousel (Horizontal Clean Card Strip) */}
      <div className="overflow-x-auto custom-scrollbar pb-2 pt-1">
        <div className="flex items-stretch justify-between gap-3 min-w-[1050px]">
          {activeStages.map((stage) => {
            const count = projects.filter((p) => p.current_stage === stage.id).length;
            const isSelected = selectedStageFilter === String(stage.id);
            const isCurrentActive = activeProjectStage === stage.id;
            const theme = STAGE_THEMES[stage.id] || STAGE_THEMES[1];
            const percent = totalActive > 0 ? Math.round((count / totalActive) * 100) : 0;

            return (
              <div
                key={stage.id}
                onClick={() => onSelectStage && onSelectStage(isSelected ? 'all' : String(stage.id))}
                className={`flex-1 flex flex-col justify-between p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20 -translate-y-1'
                    : isCurrentActive
                    ? 'bg-white border-indigo-400 shadow-sm ring-1 ring-indigo-400'
                    : `${theme.bg} ${theme.border} hover:bg-white hover:shadow-sm`
                }`}
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center font-mono ${theme.numBg}`}>
                    {stage.id}
                  </span>

                  <span className={`px-2 py-0.5 rounded-lg font-mono text-[11px] font-black ${
                    count > 0 ? theme.badge : 'bg-slate-200/60 text-slate-500'
                  }`}>
                    {count} کار
                  </span>
                </div>

                {/* Stage Title */}
                <div className="space-y-0.5 mb-2">
                  <h4 className="text-xs font-black text-slate-900 line-clamp-1">
                    {stage.shortName}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium block truncate">
                    {stage.roleName}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="pt-2 border-t border-slate-200/40 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>سهم از کل:</span>
                    <span className="font-mono font-bold text-slate-700">{percent}٪</span>
                  </div>
                  <div className="w-full bg-slate-200/70 h-1 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${theme.bar}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
