import React from 'react';
import { STAGES } from '../utils/helpers';
import {
  Check,
  Building2,
  Calculator,
  CreditCard,
  Crown,
  Compass,
  Palette,
  Scissors,
  ThumbsUp,
  Package,
  Printer,
  Workflow
} from 'lucide-react';

const STAGE_ICONS = {
  1: Building2,
  2: Calculator,
  3: CreditCard,
  4: Crown,
  5: Compass,
  6: Palette,
  7: Scissors,
  8: ThumbsUp,
  9: Package,
  10: Printer
};

export default function ProjectN8nPipelineCanvas({
  project,
  onSelectStage
}) {
  const currentStage = project?.current_stage || 1;
  const stagesList = STAGES.slice(0, 10);
  const currentStageObj = STAGES.find(s => s.id === currentStage) || STAGES[0];

  return (
    <div className="w-full bg-slate-950 border-b border-slate-800 relative overflow-hidden select-none">
      
      {/* Top Floating Telemetry & Stage Status Header */}
      <div className="px-3 sm:px-4 py-2 bg-slate-900/90 border-b border-slate-800/90 flex items-center justify-between flex-wrap gap-2 text-xs">
        
        {/* Left Live Status Badge */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black">
            <Workflow className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-bold text-[11px]">موقعیت زنده پرونده:</span>
            <span className="font-black text-amber-300 flex items-center gap-1 bg-amber-950/80 border border-amber-500/50 px-2 py-0.5 rounded-md text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
              <span>مرحله {currentStage}: {currentStageObj.shortName} ({currentStageObj.roleName})</span>
            </span>
          </div>
        </div>

        {/* Path Status Summary */}
        <div className="flex items-center gap-2 text-[11px] font-bold">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{currentStage > 1 ? `${currentStage - 1} مرحله تکمیل` : 'شروع خط'}</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-amber-300 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>گام {currentStage} فعال</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">
            {10 - currentStage} گام باقیمانده
          </span>
        </div>

      </div>

      {/* Single-Row Panoramic n8n Pipeline (Zero Scroll) */}
      <div className="w-full p-3 sm:p-4 relative bg-slate-950" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1.2px, transparent 1.2px)',
        backgroundSize: '16px 16px'
      }}>
        
        {/* SVG Cable Background Layer for Animated Flows */}
        <div className="w-full">
          {/* 10-Node Grid Layout in a Single Responsive Row */}
          <div className="grid grid-cols-10 gap-1.5 sm:gap-2.5 w-full items-center relative">
            
            {stagesList.map((stage, idx) => {
              const IconComp = STAGE_ICONS[stage.id] || Building2;
              const isCompleted = stage.id < currentStage;
              const isCurrent = stage.id === currentStage;
              const isPending = stage.id > currentStage;
              
              // Is the cable leading to next stage lit?
              const isNextCableLit = stage.id < currentStage;

              return (
                <div key={`n8n-node-row-${stage.id}`} className="relative flex flex-col items-center min-w-0">
                  
                  {/* Connecting Cable to Previous Stage (RTL: to the left) */}
                  {idx < stagesList.length - 1 && (
                    <div className="absolute top-[28px] -left-[9px] sm:-left-[12px] w-[18px] sm:w-[24px] h-[3px] z-0 pointer-events-none">
                      {/* Background Cable */}
                      <div className={`w-full h-full rounded-full ${
                        isNextCableLit
                          ? 'bg-gradient-to-l from-emerald-500 via-sky-400 to-amber-400 shadow-xs'
                          : 'bg-slate-800 border-t border-slate-700/60'
                      }`} />

                      {/* Animated Flowing Pulse */}
                      {isNextCableLit && (
                        <div className="absolute inset-0 bg-gradient-to-l from-amber-300 via-sky-200 to-emerald-200 rounded-full animate-pulse opacity-90" />
                      )}
                    </div>
                  )}

                  {/* n8n Stage Node Card */}
                  <div
                    onClick={() => onSelectStage && onSelectStage(stage.id)}
                    className={`w-full rounded-xl sm:rounded-2xl border-2 transition-all duration-200 cursor-pointer text-center relative z-10 p-1.5 sm:p-2 flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-slate-900 border-amber-400 ring-2 sm:ring-4 ring-amber-400/40 shadow-xl scale-[1.04] shadow-amber-500/20'
                        : isCompleted
                        ? 'bg-slate-900/95 border-emerald-500/80 hover:border-emerald-400 shadow-md'
                        : 'bg-slate-900/60 border-slate-800 opacity-70 hover:opacity-100 hover:border-slate-600'
                    }`}
                  >
                    {/* Node Input Handle (Right Port in RTL) */}
                    <div
                      className={`absolute -right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border flex items-center justify-center ${
                        isCurrent
                          ? 'bg-amber-400 border-white shadow-xs'
                          : isCompleted
                          ? 'bg-emerald-500 border-emerald-200'
                          : 'bg-slate-700 border-slate-600'
                      }`}
                    >
                      <div className="w-1 h-1 rounded-full bg-white" />
                    </div>

                    {/* Step Icon & Number Badge */}
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <div
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-[10px] sm:text-xs shadow-xs ${
                          isCurrent
                            ? 'bg-amber-400 text-slate-950 shadow-md animate-bounce'
                            : isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : stage.id}
                      </div>
                    </div>

                    {/* Stage Short Name */}
                    <div className="w-full">
                      <h4
                        className={`font-black text-[10px] sm:text-[11px] leading-tight truncate w-full ${
                          isCurrent
                            ? 'text-amber-300 font-black'
                            : isCompleted
                            ? 'text-emerald-300 font-bold'
                            : 'text-slate-300'
                        }`}
                        title={stage.title}
                      >
                        {stage.shortName}
                      </h4>

                      {/* Department Subtitle */}
                      <span className="text-[8px] sm:text-[9px] text-slate-400 font-medium truncate block mt-0.5">
                        {stage.roleName.replace('واحد ', '')}
                      </span>
                    </div>

                    {/* Status Pill Badge */}
                    <div className="mt-1 pt-1 border-t border-slate-800/80">
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 px-1 py-0.2 rounded-md text-[8px] sm:text-[9px] font-black bg-amber-400 text-slate-950 animate-pulse w-full justify-center">
                          <span className="w-1 h-1 rounded-full bg-slate-950 animate-ping inline-block" />
                          <span>اقدام جاری</span>
                        </span>
                      ) : isCompleted ? (
                        <span className="inline-block px-1 py-0.2 rounded-md text-[8px] sm:text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/40 w-full truncate">
                          تکمیل
                        </span>
                      ) : (
                        <span className="inline-block text-[8px] sm:text-[9px] text-slate-500 font-bold w-full truncate">
                          انتظار
                        </span>
                      )}
                    </div>

                    {/* Node Output Handle (Left Port in RTL) */}
                    <div
                      className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border flex items-center justify-center ${
                        isCompleted
                          ? 'bg-emerald-500 border-white shadow-xs'
                          : isCurrent
                          ? 'bg-amber-400 border-amber-200'
                          : 'bg-slate-700 border-slate-600'
                      }`}
                    >
                      <div className="w-1 h-1 rounded-full bg-white" />
                    </div>

                  </div>
                </div>
              );
            })}

          </div>
        </div>

      </div>

    </div>
  );
}
