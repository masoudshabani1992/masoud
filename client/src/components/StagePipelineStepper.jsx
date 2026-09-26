import React from 'react';
import { STAGES } from '../utils/helpers';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  Layers,
  Boxes,
  CircleDot,
  TrendingUp,
  Cpu
} from 'lucide-react';

export default function StagePipelineStepper({
  projects = [],
  selectedStageFilter = 'all',
  onSelectStage,
  activeProjectStage = null
}) {
  const activeStages = STAGES.filter((s) => s.id <= 10);

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-4 sm:p-5 shadow-xl select-none" dir="rtl">
      
      {/* Top Header of Pipeline */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Cpu className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black text-white">
                خط هوشمند ۱۰ مرحله‌ای فرآیند تولید کارخانه
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Luminous Node Pipeline
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              رهگیری زنده و لحظه‌ای جریان سفارشات در ایستگاه‌های کاری از بازرگانی تا تحویل نهایی
            </p>
          </div>
        </div>

        {/* View All Stages Filter Button */}
        {onSelectStage && (
          <button
            type="button"
            onClick={() => onSelectStage('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              selectedStageFilter === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 ring-2 ring-amber-400'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>نمایش کل ۱۰ مرحله ({projects.length})</span>
          </button>
        )}
      </div>

      {/* Luminous Connected Pipeline Nodes (Horizontal Scrollable on Mobile) */}
      <div className="relative overflow-x-auto custom-scrollbar pb-2 pt-1">
        
        {/* Connecting Energy Line */}
        <div className="absolute top-[38px] right-8 left-8 h-1 bg-gradient-to-r from-blue-600 via-purple-600 via-indigo-600 via-amber-500 to-emerald-500 rounded-full opacity-40 z-0 hidden lg:block" />

        <div className="flex items-center justify-between gap-3 min-w-[1000px] relative z-10 px-2">
          {activeStages.map((stage, idx) => {
            const count = projects.filter((p) => p.current_stage === stage.id).length;
            const isSelected = selectedStageFilter === String(stage.id);
            const isCurrentActive = activeProjectStage === stage.id;

            return (
              <div
                key={stage.id}
                onClick={() => onSelectStage && onSelectStage(isSelected ? 'all' : String(stage.id))}
                className={`flex-1 flex flex-col items-center cursor-pointer group transition-all duration-200 p-2 rounded-2xl border ${
                  isSelected
                    ? 'bg-slate-800/90 border-amber-400/80 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/40 -translate-y-1'
                    : isCurrentActive
                    ? 'bg-indigo-950/80 border-indigo-400 shadow-md ring-1 ring-indigo-400'
                    : count > 0
                    ? 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                    : 'bg-slate-900/40 border-slate-800/50 hover:bg-slate-800/50'
                }`}
              >
                {/* Node Milestone Circle */}
                <div className="relative mb-2">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs transition-all shadow-md ${
                      isSelected
                        ? 'bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 shadow-amber-500/30 scale-110'
                        : isCurrentActive
                        ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-indigo-500/30 animate-pulse'
                        : count > 0
                        ? 'bg-slate-800 text-indigo-300 border border-indigo-500/40'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {stage.id}
                  </div>

                  {/* Active Order Count Badge */}
                  {count > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-md animate-bounce">
                      {count}
                    </span>
                  )}
                </div>

                {/* Stage Title */}
                <span
                  className={`text-xs font-bold text-center line-clamp-1 transition-colors ${
                    isSelected ? 'text-amber-300 font-black' : 'text-slate-200 group-hover:text-white'
                  }`}
                >
                  {stage.shortName}
                </span>

                {/* Role Department Pill */}
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 line-clamp-1">
                  {stage.roleName}
                </span>

                {/* Progress bar indicator */}
                <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      count > 0 ? 'bg-gradient-to-r from-indigo-500 to-emerald-400 w-full' : 'w-0'
                    }`}
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
