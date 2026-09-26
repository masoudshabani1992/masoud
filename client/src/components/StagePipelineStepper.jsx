import React, { useState } from 'react';
import { STAGES } from '../utils/helpers';
import {
  Cpu,
  Layers,
  Sparkles,
  Activity,
  ArrowRight,
  TrendingUp,
  CircleDot,
  CheckCircle2,
  Clock,
  Zap,
  Box,
  Eye,
  ChevronLeft,
  ChevronRight,
  Share2,
  ShieldCheck,
  Building2
} from 'lucide-react';

export default function StagePipelineStepper({
  projects = [],
  selectedStageFilter = 'all',
  onSelectStage,
  activeProjectStage = null
}) {
  const [viewMode, setViewMode] = useState('pipeline'); // 'pipeline' or 'topology'
  const activeStages = STAGES.filter((s) => s.id <= 10);

  // Stage Metrics
  const totalActive = projects.filter((p) => p.current_stage <= 10).length;
  const urgentCount = projects.filter((p) => p.priority === 'urgent' && p.current_stage <= 10).length;
  const totalBoxes = projects.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);

  return (
    <div className="w-full glass-panel-ai rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden select-none" dir="rtl">
      
      {/* Background Cyber Ambient Lights */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar with Control AI Telemetry & Mode Switcher */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-800/80">
        
        {/* Left: Branding & Subtitle */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
            <Cpu className="w-6 h-6 text-cyan-200 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                مرکز پایش و توپولوژی ۱۰ مرحله‌ای خط تولید
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>Live Factory Telemetry</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              پایش بلادرنگ جریان سفارشات، گلوگاه‌های تولید و تراکم کاری ایستگاه‌های ده‌گانه کارخانه
            </p>
          </div>
        </div>

        {/* Right: Metrics Pills & View Mode Switcher */}
        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto justify-between md:justify-end">
          
          {/* Quick HUD Metrics */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex items-center gap-2">
              <span className="text-slate-400 font-bold">سفارشات در جریان:</span>
              <span className="font-mono font-black text-cyan-400">{totalActive}</span>
            </div>

            {urgentCount > 0 && (
              <div className="px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs flex items-center gap-1.5 text-rose-300">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="font-bold">فوری:</span>
                <span className="font-mono font-black text-white">{urgentCount}</span>
              </div>
            )}
          </div>

          {/* View Mode Toggle Button */}
          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800/90">
            <button
              type="button"
              onClick={() => setViewMode('pipeline')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                viewMode === 'pipeline'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              نمای خطی ایستگاه‌ها
            </button>

            <button
              type="button"
              onClick={() => setViewMode('topology')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                viewMode === 'topology'
                  ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              نمای گراف نودها (Node Web)
            </button>
          </div>

          {/* Reset Filter Button */}
          {onSelectStage && selectedStageFilter !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectStage('all')}
              className="px-3 py-1.5 rounded-xl text-xs font-black bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition flex items-center gap-1"
            >
              <span>نمایش همه ({projects.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= VIEW 1: HORIZONTAL LUMINOUS PIPELINE ================= */}
      {viewMode === 'pipeline' && (
        <div className="relative z-10">
          <div className="relative overflow-x-auto custom-scrollbar pb-3 pt-2">
            
            {/* SVG Connecting Flow Lines with Pulsing Signal Particles */}
            <svg
              className="absolute top-[44px] right-6 left-6 w-[calc(100%-48px)] h-4 pointer-events-none hidden lg:block z-0"
              style={{ minWidth: '1000px' }}
            >
              <line
                x1="0"
                y1="8"
                x2="100%"
                y2="8"
                stroke="rgba(51, 65, 85, 0.4)"
                strokeWidth="2"
              />
              <line
                x1="0"
                y1="8"
                x2="100%"
                y2="8"
                stroke="url(#gradientFlow)"
                strokeWidth="2.5"
                className="pipeline-pulse-line"
              />
              <defs>
                <linearGradient id="gradientFlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="25%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="75%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>

            {/* 10 Stage Node Cards */}
            <div className="flex items-stretch justify-between gap-3 min-w-[1050px] relative z-10 px-1">
              {activeStages.map((stage) => {
                const count = projects.filter((p) => p.current_stage === stage.id).length;
                const isSelected = selectedStageFilter === String(stage.id);
                const isCurrentActive = activeProjectStage === stage.id;
                const stageUrgent = projects.filter((p) => p.current_stage === stage.id && p.priority === 'urgent').length;

                return (
                  <div
                    key={stage.id}
                    onClick={() => onSelectStage && onSelectStage(isSelected ? 'all' : String(stage.id))}
                    className={`flex-1 flex flex-col justify-between cursor-pointer group transition-all duration-300 p-3.5 rounded-2xl border ${
                      isSelected
                        ? 'bg-slate-900/95 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)] ring-2 ring-cyan-400/50 -translate-y-1'
                        : isCurrentActive
                        ? 'bg-indigo-950/80 border-indigo-400 shadow-lg ring-1 ring-indigo-400'
                        : count > 0
                        ? 'bg-slate-900/60 border-slate-700/80 hover:bg-slate-900 hover:border-slate-500'
                        : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-900/40'
                    }`}
                  >
                    {/* Top Node Indicator */}
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs transition-all shadow-md ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 font-black shadow-cyan-500/50 scale-105'
                            : count > 0
                            ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                            : 'bg-slate-950 text-slate-500 border border-slate-800'
                        }`}
                      >
                        {stage.id}
                      </div>

                      {/* Active Order Count Pill */}
                      <span
                        className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-black transition-all ${
                          count > 0
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                            : 'bg-slate-800/80 text-slate-500'
                        }`}
                      >
                        {count} کار
                      </span>
                    </div>

                    {/* Stage Title */}
                    <div className="space-y-0.5 mb-2">
                      <h4
                        className={`text-xs font-black line-clamp-1 transition-colors ${
                          isSelected ? 'text-cyan-300' : 'text-slate-200 group-hover:text-white'
                        }`}
                      >
                        {stage.shortName}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium block truncate">
                        {stage.roleName}
                      </span>
                    </div>

                    {/* Urgent Warning or Progress Bar */}
                    <div className="pt-2 border-t border-slate-800/60">
                      {stageUrgent > 0 ? (
                        <div className="flex items-center justify-between text-[10px] font-bold text-rose-400">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            <span>{stageUrgent} فوری</span>
                          </span>
                        </div>
                      ) : (
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              count > 0 ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 w-full' : 'w-0'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 2: CONTROL AI INTERACTIVE TOPOLOGY GRAPH ================= */}
      {viewMode === 'topology' && (
        <div className="relative z-10 bg-slate-950/80 rounded-2xl border border-slate-800 p-6 min-h-[360px] flex items-center justify-center overflow-hidden">
          
          {/* Background Concentric Orbits & HUD Grid */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-[280px] h-[280px] rounded-full border border-cyan-500/40" />
            <div className="w-[480px] h-[480px] rounded-full border border-indigo-500/30" />
            <div className="w-[680px] h-[680px] rounded-full border border-purple-500/20" />
          </div>

          {/* Central Factory Core Hub */}
          <div className="relative z-20 flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/60 shadow-[0_0_40px_rgba(6,182,212,0.3)] text-center max-w-xs">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white mb-2 shadow-lg shadow-cyan-500/30">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-black text-sm text-white">هسته مرکزی خط تولید</h3>
            <span className="text-[11px] text-cyan-300 font-bold mt-0.5">کارخانه کارتن و جعبه‌سازی</span>

            <div className="grid grid-cols-2 gap-2 w-full mt-3 pt-3 border-t border-slate-800 text-xs">
              <div className="bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">کل سفارشات:</span>
                <span className="font-mono font-black text-white">{totalActive}</span>
              </div>
              <div className="bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">تیراژ کل:</span>
                <span className="font-mono font-black text-amber-400">{totalBoxes.toLocaleString('fa-IR')}</span>
              </div>
            </div>
          </div>

          {/* Orbiting Stage Nodes Web */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {activeStages.map((st, i) => {
              const count = projects.filter((p) => p.current_stage === st.id).length;
              const angle = (i / activeStages.length) * 2 * Math.PI;
              const radius = 175; // px from center
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <div
                  key={st.id}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  onClick={() => onSelectStage && onSelectStage(String(st.id))}
                  className="absolute pointer-events-auto cursor-pointer group"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shadow-lg transition-all group-hover:scale-125 ${
                        count > 0
                          ? 'bg-slate-900 text-cyan-300 border-2 border-cyan-400 shadow-cyan-500/30'
                          : 'bg-slate-950 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {st.id}
                    </div>
                    <span className="mt-1 px-2 py-0.5 rounded-md bg-slate-950/90 border border-slate-800 text-[10px] font-bold text-slate-300 whitespace-nowrap shadow-md group-hover:text-cyan-300 group-hover:border-cyan-500">
                      {st.shortName} ({count})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
