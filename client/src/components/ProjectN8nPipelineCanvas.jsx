import React, { useState, useMemo } from 'react';
import { STAGES, formatNumber } from '../utils/helpers';
import {
  Check,
  CheckCircle2,
  Clock,
  Activity,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
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
  Sparkles,
  Workflow,
  ArrowRight,
  Eye,
  AlertCircle
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
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 20, y: 15 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedStageId, setSelectedStageId] = useState(currentStage);

  // Layout node positions (S-curve 3 rows layout)
  // Row 1 (Stages 1, 2, 3, 4) Left to Right
  // Row 2 (Stages 7, 6, 5) Right to Left
  // Row 3 (Stages 8, 9, 10) Left to Right
  const nodePositions = useMemo(() => {
    const nodeWidth = 240;
    const nodeHeight = 150;
    const gapX = 90;
    const gapY = 90;
    const startX = 30;
    const startY = 30;

    const positions = {};

    // ROW 1: Stages 1 -> 2 -> 3 -> 4
    positions[1] = { x: startX, y: startY, row: 1 };
    positions[2] = { x: startX + (nodeWidth + gapX), y: startY, row: 1 };
    positions[3] = { x: startX + (nodeWidth + gapX) * 2, y: startY, row: 1 };
    positions[4] = { x: startX + (nodeWidth + gapX) * 3, y: startY, row: 1 };

    // ROW 2: Stages 7 <- 6 <- 5
    positions[5] = { x: startX + (nodeWidth + gapX) * 3, y: startY + nodeHeight + gapY, row: 2 };
    positions[6] = { x: startX + (nodeWidth + gapX) * 2, y: startY + nodeHeight + gapY, row: 2 };
    positions[7] = { x: startX + (nodeWidth + gapX) * 1, y: startY + nodeHeight + gapY, row: 2 };

    // ROW 3: Stages 8 -> 9 -> 10
    positions[8] = { x: startX + (nodeWidth + gapX) * 1, y: startY + (nodeHeight + gapY) * 2, row: 3 };
    positions[9] = { x: startX + (nodeWidth + gapX) * 2, y: startY + (nodeHeight + gapY) * 2, row: 3 };
    positions[10] = { x: startX + (nodeWidth + gapX) * 3, y: startY + (nodeHeight + gapY) * 2, row: 3 };

    return positions;
  }, []);

  // Compute connections with Bezier Curves and active glow state
  const connections = useMemo(() => {
    const nodeWidth = 240;
    const nodeHeight = 150;

    const pairs = [
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 3, to: 4 },
      { from: 4, to: 5 },
      { from: 5, to: 6 },
      { from: 6, to: 7 },
      { from: 7, to: 8 },
      { from: 8, to: 9 },
      { from: 9, to: 10 }
    ];

    return pairs.map(({ from, to }) => {
      const p1 = nodePositions[from];
      const p2 = nodePositions[to];

      let startX, startY, endX, endY, cp1x, cp1y, cp2x, cp2y;

      if (p1.row === p2.row) {
        if (p1.x < p2.x) {
          // Flow Right
          startX = p1.x + nodeWidth;
          startY = p1.y + nodeHeight / 2;
          endX = p2.x;
          endY = p2.y + nodeHeight / 2;
          const dx = (endX - startX) * 0.5;
          cp1x = startX + dx;
          cp1y = startY;
          cp2x = endX - dx;
          cp2y = endY;
        } else {
          // Flow Left
          startX = p1.x;
          startY = p1.y + nodeHeight / 2;
          endX = p2.x + nodeWidth;
          endY = p2.y + nodeHeight / 2;
          const dx = (startX - endX) * 0.5;
          cp1x = startX - dx;
          cp1y = startY;
          cp2x = endX + dx;
          cp2y = endY;
        }
      } else {
        // Vertical Turn
        startX = p1.x + nodeWidth / 2;
        startY = p1.y + nodeHeight;
        endX = p2.x + nodeWidth / 2;
        endY = p2.y;
        const dy = (endY - startY) * 0.5;
        cp1x = startX;
        cp1y = startY + dy;
        cp2x = endX;
        cp2y = endY - dy;
      }

      const path = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
      
      // Is this cable completed or currently feeding into active node?
      const isCompleted = to < currentStage;
      const isActiveFlow = to === currentStage;
      const isPending = to > currentStage;

      return {
        from,
        to,
        path,
        startX,
        startY,
        endX,
        endY,
        isCompleted,
        isActiveFlow,
        isPending
      };
    });
  }, [nodePositions, currentStage]);

  // Pan handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.n8n-proj-node') || e.target.closest('.n8n-ctrl')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const currentStageObj = STAGES.find(s => s.id === currentStage) || STAGES[0];

  return (
    <div className="w-full bg-slate-900 border-b border-slate-700 relative overflow-hidden select-none">
      
      {/* Top Floating Telemetry & Stage Status Header */}
      <div className="p-3 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
        
        {/* Left Live Status Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black">
            <Workflow className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold">موقعیت زنده پرونده در خط تولید:</span>
              <span className="font-black text-amber-300 flex items-center gap-1 bg-amber-950/80 border border-amber-500/50 px-2.5 py-0.5 rounded-md">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                <span>مرحله {currentStage}: {currentStageObj.shortName}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setZoom(prev => Math.min(prev * 1.15, 1.4))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
            title="بزرگ‌نمایی (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <span className="font-mono text-[11px] font-bold text-slate-300 px-1">
            {Math.round(zoom * 100)}٪
          </span>

          <button
            onClick={() => setZoom(prev => Math.max(prev * 0.85, 0.5))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
            title="کوچک‌نمایی (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => { setZoom(0.85); setPan({ x: 20, y: 15 }); }}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
            title="بازنشانی نما"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Main n8n Visual Canvas */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="w-full h-[460px] cursor-grab active:cursor-grabbing relative overflow-hidden bg-slate-950"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1.5px, transparent 1.5px)',
          backgroundSize: `${22 * zoom}px ${22 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`
        }}
      >
        <div
          className="absolute inset-0 origin-top-left transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
          }}
        >
          {/* SVG Cable Layer */}
          <svg className="absolute top-0 left-0 w-[1600px] h-[900px] pointer-events-none z-0 overflow-visible">
            <defs>
              <linearGradient id="activeProjCableGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="60%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>

              <filter id="projGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {connections.map((conn, idx) => {
              const isLit = conn.to <= currentStage;

              return (
                <g key={`proj-conn-${idx}`}>
                  {/* Background Base Cable */}
                  <path
                    d={conn.path}
                    fill="none"
                    stroke={isLit ? '#1e293b' : '#334155'}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={conn.isPending ? '6 6' : 'none'}
                    opacity="0.7"
                  />

                  {/* Lit Completed / Active Cable */}
                  {isLit && (
                    <path
                      d={conn.path}
                      fill="none"
                      stroke="url(#activeProjCableGrad)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Flowing Light Pulses on the Cable Reaching Active Stage */}
                  {isLit && (
                    <path
                      d={conn.path}
                      fill="none"
                      stroke="#fef08a"
                      strokeWidth="4"
                      strokeDasharray="10 20"
                      strokeLinecap="round"
                      className="animate-n8n-cable"
                      filter="url(#projGlow)"
                    />
                  )}

                  {/* Port Handles */}
                  <circle
                    cx={conn.startX}
                    cy={conn.startY}
                    r="4.5"
                    fill={conn.from <= currentStage ? '#10b981' : '#64748b'}
                    stroke="#0f172a"
                    strokeWidth="2"
                  />
                  <circle
                    cx={conn.endX}
                    cy={conn.endY}
                    r="4.5"
                    fill={conn.to <= currentStage ? '#fbbf24' : '#475569'}
                    stroke="#0f172a"
                    strokeWidth="2"
                  />
                </g>
              );
            })}
          </svg>

          {/* Render 10 n8n Stage Nodes for this Project */}
          {STAGES.slice(0, 10).map((stage) => {
            const pos = nodePositions[stage.id];
            if (!pos) return null;

            const IconComp = STAGE_ICONS[stage.id] || Building2;
            const isCompleted = stage.id < currentStage;
            const isCurrent = stage.id === currentStage;
            const isPending = stage.id > currentStage;
            const isSelected = selectedStageId === stage.id;

            return (
              <div
                key={`proj-stage-node-${stage.id}`}
                onClick={() => {
                  setSelectedStageId(stage.id);
                  if (onSelectStage) onSelectStage(stage.id);
                }}
                className={`n8n-proj-node absolute w-[240px] rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-900 border-amber-400 ring-4 ring-amber-400/40 shadow-2xl scale-105 z-30 animate-pulse-glow'
                    : isCompleted
                    ? 'bg-slate-900/95 border-emerald-500/80 hover:border-emerald-400 shadow-lg z-10'
                    : 'bg-slate-900/60 border-slate-700/80 opacity-70 hover:opacity-100 hover:border-slate-500 z-10'
                }`}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`
                }}
              >
                {/* Node Input Port */}
                <div
                  className={`absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center shadow-md ${
                    isCurrent
                      ? 'bg-amber-400 border-white animate-pulse'
                      : isCompleted
                      ? 'bg-emerald-500 border-emerald-200'
                      : 'bg-slate-700 border-slate-600'
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>

                {/* Node Header */}
                <div className={`p-3 rounded-t-2xl border-b flex items-center justify-between ${
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-500/30'
                    : isCompleted
                    ? 'bg-emerald-950/40 border-emerald-500/20'
                    : 'bg-slate-800/40 border-slate-800'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-xs ${
                      isCurrent
                        ? 'bg-amber-400 text-slate-950 animate-bounce'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isCompleted ? <Check className="w-4 h-4" /> : stage.id}
                    </div>

                    <div>
                      <h4 className={`font-black text-xs ${
                        isCurrent ? 'text-amber-300' : isCompleted ? 'text-emerald-300' : 'text-slate-300'
                      }`}>
                        {stage.shortName}
                      </h4>
                      <span className="text-[9px] text-slate-400 font-bold block">
                        {stage.roleName}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-slate-950 animate-pulse">
                      درحال پردازش
                    </span>
                  )}
                  {isCompleted && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/40">
                      تکمیل
                    </span>
                  )}
                  {isPending && (
                    <span className="text-[9px] text-slate-500 font-bold">
                      در انتظار
                    </span>
                  )}
                </div>

                {/* Node Content */}
                <div className="p-2.5 space-y-1 text-[10px]">
                  <p className="text-slate-400 line-clamp-1 font-medium">
                    {stage.desc}
                  </p>

                  <div className="pt-1 flex items-center justify-between border-t border-slate-800 text-slate-500">
                    <span>گام {stage.id} از ۱۰</span>
                    {isCurrent && (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                        <span>اقدام جاری</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Node Output Port */}
                <div
                  className={`absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center shadow-md ${
                    isCompleted
                      ? 'bg-emerald-500 border-white'
                      : isCurrent
                      ? 'bg-amber-400 border-amber-200'
                      : 'bg-slate-700 border-slate-600'
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
