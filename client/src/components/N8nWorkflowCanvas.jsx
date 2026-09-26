import React, { useState, useRef, useEffect, useMemo } from 'react';
import { STAGES, formatToman, formatNumber, canUserAccessProject } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import {
  Play,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Filter,
  Search,
  Sparkles,
  Layers,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  X,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
  Building2,
  Calculator,
  CreditCard,
  Crown,
  Compass,
  Palette,
  Scissors,
  ThumbsUp,
  Truck,
  Printer,
  FileText,
  Activity,
  Zap,
  HardDrive,
  Settings2,
  HelpCircle,
  Workflow
} from 'lucide-react';

// Stage icon mapping matching n8n node types
const STAGE_NODE_CONFIG = {
  1: {
    type: 'trigger',
    typeLabel: 'Trigger / ورودی',
    typeBadge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: Building2,
    gradient: 'from-indigo-500 to-blue-600',
    outputDesc: 'اطلاعات فنی جعبه، تیراژ و مشتری',
    avgTime: '۱ الی ۲ ساعت'
  },
  2: {
    type: 'compute',
    typeLabel: 'Calculator / برآورد',
    typeBadge: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: Calculator,
    gradient: 'from-amber-500 to-orange-600',
    outputDesc: 'بهای تمام‌شده متریال، چاپ و قالب',
    avgTime: '۲ الی ۴ ساعت'
  },
  3: {
    type: 'approval',
    typeLabel: 'Customer Wait / تاییدیه',
    typeBadge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: CreditCard,
    gradient: 'from-emerald-500 to-teal-600',
    outputDesc: 'پیش‌فاکتور تاییدشده و ثبت بیعانه',
    avgTime: '۲۴ ساعت'
  },
  4: {
    type: 'decision',
    typeLabel: 'Decision Gate / تصمیم‌گیری',
    typeBadge: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Crown,
    gradient: 'from-purple-600 to-pink-600',
    outputDesc: 'مجوز تولید رسمی مدیرعامل',
    avgTime: '۱ ساعت'
  },
  5: {
    type: 'design',
    typeLabel: 'CAD Transform / آتلیه',
    typeBadge: 'bg-violet-100 text-violet-800 border-violet-200',
    icon: Compass,
    gradient: 'from-violet-600 to-indigo-700',
    outputDesc: 'فایل خط تیغ CorelDRAW / AI و فرم‌بندی',
    avgTime: '۲۴ الی ۴۸ ساعت'
  },
  6: {
    type: 'approval',
    typeLabel: 'Design Approval / تایید طرح',
    typeBadge: 'bg-teal-100 text-teal-800 border-teal-200',
    icon: Palette,
    gradient: 'from-teal-500 to-emerald-600',
    outputDesc: 'تاییدیه نهایی گرافیک و رنگ چاپ',
    avgTime: '۱۲ الی ۲۴ ساعت'
  },
  7: {
    type: 'hardware',
    typeLabel: 'Cutter Output / ماکت‌سازی',
    typeBadge: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: Scissors,
    gradient: 'from-orange-500 to-amber-600',
    outputDesc: 'نمونه فیزیکی برش‌خورده با پلاتر',
    avgTime: '۲۴ ساعت'
  },
  8: {
    type: 'approval',
    typeLabel: 'Mockup Approval / تایید ماکت',
    typeBadge: 'bg-rose-100 text-rose-800 border-rose-200',
    icon: ThumbsUp,
    gradient: 'from-rose-500 to-pink-600',
    outputDesc: 'تایید ایستایی و ابعاد توسط کارفرما',
    avgTime: '۲۴ ساعت'
  },
  9: {
    type: 'procurement',
    typeLabel: 'Inventory / تدارکات',
    typeBadge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    icon: Package,
    gradient: 'from-cyan-600 to-blue-600',
    outputDesc: 'تامین شیت مقوا، ورق کارتن و متریال',
    avgTime: '۲۴ الی ۴۸ ساعت'
  },
  10: {
    type: 'factory',
    typeLabel: 'Factory Execution / چاپ و تولید',
    typeBadge: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: Printer,
    gradient: 'from-amber-600 to-yellow-600',
    outputDesc: 'چاپ افست، سلفون، دایکات و چسب',
    avgTime: '۳ الی ۷ روز'
  }
};

export default function N8nWorkflowCanvas({
  projects = [],
  onSelectProject,
  searchTerm = '',
  selectedPriority = 'all'
}) {
  const { currentUser, role } = useAuth();
  
  // Canvas Viewport State (Zoom & Pan)
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 50, y: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isSimulating, setIsSimulating] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [highlightedProjectId, setHighlightedProjectId] = useState(null);
  const [canvasTheme, setCanvasTheme] = useState('light'); // 'light' or 'dark'

  const containerRef = useRef(null);

  // Compute Layout Node Positions (S-curve n8n flow layout)
  // Row 1 (Nodes 1, 2, 3, 4) Left to Right
  // Row 2 (Nodes 5, 6, 7) Right to Left
  // Row 3 (Nodes 8, 9, 10) Left to Right
  const nodePositions = useMemo(() => {
    const nodeWidth = 320;
    const nodeHeight = 220;
    const gapX = 140;
    const gapY = 180;
    const startX = 60;
    const startY = 80;

    const positions = {};

    // ROW 1: Stages 1 -> 2 -> 3 -> 4 (Left to Right in standard layout, RTL adjusted)
    positions[1] = { x: startX, y: startY, row: 1 };
    positions[2] = { x: startX + (nodeWidth + gapX), y: startY, row: 1 };
    positions[3] = { x: startX + (nodeWidth + gapX) * 2, y: startY, row: 1 };
    positions[4] = { x: startX + (nodeWidth + gapX) * 3, y: startY, row: 1 };

    // ROW 2: Stages 7 <- 6 <- 5 (Right to Left turn)
    positions[5] = { x: startX + (nodeWidth + gapX) * 3, y: startY + nodeHeight + gapY, row: 2 };
    positions[6] = { x: startX + (nodeWidth + gapX) * 2, y: startY + nodeHeight + gapY, row: 2 };
    positions[7] = { x: startX + (nodeWidth + gapX) * 1, y: startY + nodeHeight + gapY, row: 2 };

    // ROW 3: Stages 8 -> 9 -> 10 (Left to Right turn)
    positions[8] = { x: startX + (nodeWidth + gapX) * 1, y: startY + (nodeHeight + gapY) * 2, row: 3 };
    positions[9] = { x: startX + (nodeWidth + gapX) * 2, y: startY + (nodeHeight + gapY) * 2, row: 3 };
    positions[10] = { x: startX + (nodeWidth + gapX) * 3, y: startY + (nodeHeight + gapY) * 2, row: 3 };

    return positions;
  }, []);

  // Compute connections with Cubic Bezier Curves
  const connections = useMemo(() => {
    const nodeWidth = 320;
    const nodeHeight = 220;

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

      // Handle connection direction based on row arrangement
      if (p1.row === p2.row) {
        if (p1.x < p2.x) {
          // Flow Right: Out from Right, In to Left
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
          // Flow Left: Out from Left, In to Right
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
        // Vertical Turn Connection (Between rows)
        if (p1.row === 1 && p2.row === 2) {
          // From 4 down to 5
          startX = p1.x + nodeWidth / 2;
          startY = p1.y + nodeHeight;
          endX = p2.x + nodeWidth / 2;
          endY = p2.y;
          const dy = (endY - startY) * 0.5;
          cp1x = startX;
          cp1y = startY + dy;
          cp2x = endX;
          cp2y = endY - dy;
        } else {
          // From 7 down to 8
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
      }

      const path = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
      
      // Count projects currently transitioning / active at target stage
      const activeCount = projects.filter(p => p.current_stage === to).length;

      return {
        from,
        to,
        path,
        startX,
        startY,
        endX,
        endY,
        activeCount
      };
    });
  }, [nodePositions, projects]);

  // Pan & Zoom Event Handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.n8n-interactive-node') || e.target.closest('.n8n-control-btn')) return;
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

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.4), 1.8));
  };

  const resetView = () => {
    setZoom(0.85);
    setPan({ x: 50, y: 40 });
  };

  const fitToScreen = () => {
    setZoom(0.65);
    setPan({ x: 20, y: 20 });
  };

  // Projects filtered by selected node
  const selectedStageProjects = useMemo(() => {
    if (!selectedNodeId) return [];
    return projects.filter(p => p.current_stage === selectedNodeId);
  }, [selectedNodeId, projects]);

  const selectedStageInfo = STAGES.find(s => s.id === selectedNodeId);
  const selectedStageCfg = selectedNodeId ? STAGE_NODE_CONFIG[selectedNodeId] : null;

  return (
    <div className="w-full relative rounded-3xl border border-slate-200/90 shadow-sm bg-white overflow-hidden select-none">
      
      {/* Top Floating Telemetry & Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none flex-wrap gap-2">
        
        {/* Workflow Title Pill */}
        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2.5 pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
            <Workflow className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-xs sm:text-sm text-slate-900">
                بوم گرافیکی گردش کار ۱۰ مرحله‌ای کارخانه
              </h3>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                n8n Pipeline
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              جریان تعاملی نودهای تولید کارتن و جعبه با رهگیری لحظه‌ای
            </div>
          </div>
        </div>

        {/* Action Controls & Zoom Dock */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-sm pointer-events-auto">
          
          {/* Simulation Toggle */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isSimulating
                ? 'bg-emerald-100 text-emerald-950 border border-emerald-300 font-black'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="فعال/غیرفعال کردن انیمیشن جریان کابل‌ها"
          >
            <Activity className={`w-3.5 h-3.5 ${isSimulating ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">جریان زنده نودها</span>
          </button>

          <span className="w-px h-5 bg-slate-200" />

          {/* Zoom In */}
          <button
            onClick={() => setZoom(prev => Math.min(prev * 1.15, 1.8))}
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
            title="بزرگ‌نمایی (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Zoom Percentage */}
          <span className="font-mono text-xs font-black text-slate-700 px-1">
            {Math.round(zoom * 100)}٪
          </span>

          {/* Zoom Out */}
          <button
            onClick={() => setZoom(prev => Math.max(prev * 0.85, 0.4))}
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
            title="کوچک‌نمایی (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Reset View */}
          <button
            onClick={resetView}
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
            title="تنظیم نمای پیش‌فرض"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Fit to Screen */}
          <button
            onClick={fitToScreen}
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
            title="جانمایی در صفحه"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Main Interactive Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`w-full h-[720px] cursor-grab active:cursor-grabbing relative overflow-hidden transition-colors ${
          canvasTheme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'
        }`}
        style={{
          backgroundImage: canvasTheme === 'dark'
            ? 'radial-gradient(circle, rgba(255,255,255,0.1) 1.5px, transparent 1.5px)'
            : 'radial-gradient(circle, rgba(148,163,184,0.3) 1.5px, transparent 1.5px)',
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`
        }}
      >
        {/* World Space Container transformed by Pan & Zoom */}
        <div
          className="absolute inset-0 origin-top-left transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
          }}
        >
          {/* SVG Layer for Bezier Connecting Cables & Energy Pulses */}
          <svg
            className="absolute top-0 left-0 w-[2400px] h-[1600px] pointer-events-none z-0 overflow-visible"
          >
            <defs>
              {/* Linear Gradients for Cables */}
              <linearGradient id="cableGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
              </linearGradient>

              {/* Glowing Filter for Active Cables */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Render Connection Lines */}
            {connections.map((conn, idx) => (
              <g key={`conn-${idx}`}>
                {/* Background Shadow Cable */}
                <path
                  d={conn.path}
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity="0.7"
                />

                {/* Primary Colored Cable */}
                <path
                  d={conn.path}
                  fill="none"
                  stroke="url(#cableGradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Animated Energy Flow Particles */}
                {isSimulating && (
                  <path
                    d={conn.path}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="4"
                    strokeDasharray="12 24"
                    strokeLinecap="round"
                    className="animate-n8n-cable"
                    filter="url(#glow)"
                  />
                )}

                {/* Connector Handle Dots */}
                <circle cx={conn.startX} cy={conn.startY} r="5" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
                <circle cx={conn.endX} cy={conn.endY} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
              </g>
            ))}
          </svg>

          {/* Render 10 n8n Stage Nodes */}
          {STAGES.map((stage) => {
            const pos = nodePositions[stage.id];
            if (!pos) return null;

            const cfg = STAGE_NODE_CONFIG[stage.id];
            const IconComponent = cfg.icon;
            
            // Count active orders currently in this stage
            const stageProjects = projects.filter((p) => p.current_stage === stage.id);
            const activeCount = stageProjects.length;
            const isSelected = selectedNodeId === stage.id;

            return (
              <div
                key={`n8n-node-${stage.id}`}
                onClick={() => setSelectedNodeId(isSelected ? null : stage.id)}
                className={`n8n-interactive-node absolute w-[320px] rounded-3xl bg-white border-2 shadow-xl transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 ring-4 ring-indigo-500/30 scale-105 shadow-2xl z-30'
                    : 'border-slate-200/90 hover:border-indigo-400 hover:shadow-2xl z-10'
                }`}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`
                }}
              >
                {/* Node Input Port (Left Handle) */}
                <div
                  className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center shadow-md group"
                  title="ورودی فرآیند (Input Port)"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                </div>

                {/* Node Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${cfg.gradient} text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs text-slate-900">
                          مرحله {stage.id}
                        </span>
                        <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold border ${cfg.typeBadge}`}>
                          {cfg.typeLabel}
                        </span>
                      </div>
                      <h4 className="font-black text-xs text-slate-800 tracking-tight mt-0.5">
                        {stage.shortName}
                      </h4>
                    </div>
                  </div>

                  {/* Active Job Counter Badge */}
                  <div className={`px-2.5 py-1 rounded-xl font-black font-mono text-xs flex items-center gap-1 shadow-xs ${
                    activeCount > 0
                      ? 'bg-indigo-600 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    <span>{activeCount}</span>
                    <span className="text-[10px] font-sans font-bold">سفارش</span>
                  </div>
                </div>

                {/* Node Body Content */}
                <div className="p-4 space-y-3 bg-slate-50/50 rounded-b-3xl">
                  
                  <div className="text-[11px] text-slate-600 leading-relaxed font-medium line-clamp-2">
                    {stage.desc}
                  </div>

                  {/* Stage Parameters & Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-[10px]">
                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-slate-400 block font-bold">واحد مسئول:</span>
                      <span className="font-black text-slate-800 truncate block mt-0.5">
                        {stage.roleName}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-slate-400 block font-bold">زمان تخمینی:</span>
                      <span className="font-black text-indigo-700 truncate block mt-0.5">
                        {cfg.avgTime}
                      </span>
                    </div>
                  </div>

                  {/* Node Output Deliverable Summary */}
                  <div className="text-[10px] text-slate-500 flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">خروجی: <strong>{cfg.outputDesc}</strong></span>
                  </div>

                </div>

                {/* Node Output Port (Right Handle) */}
                <div
                  className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center shadow-md group"
                  title="خروجی فرآیند (Output Port)"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side Inspector Drawer for Selected Node */}
      {selectedNodeId && (
        <div className="absolute top-0 left-0 bottom-0 w-96 bg-white/95 backdrop-blur-xl border-r border-slate-200 shadow-2xl z-40 flex flex-col justify-between animate-slide-in-right">
          
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${selectedStageCfg.gradient} text-white flex items-center justify-center shadow-xs`}>
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">
                  {selectedStageInfo?.title}
                </h3>
                <span className="text-[10px] text-indigo-600 font-bold">
                  {selectedStageProjects.length} پرونده فعال در این مرحله
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedNodeId(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Project List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedStageProjects.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Package className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500">هیچ سفارشی در این مرحله در انتظار نیست.</p>
                <span className="text-[10px] text-slate-400">تمام سفارشات این بخش تکمیل شده‌اند.</span>
              </div>
            ) : (
              selectedStageProjects.map((p) => (
                <div
                  key={`node-proj-${p.id}`}
                  onClick={() => onSelectProject && onSelectProject(p)}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-md bg-white transition cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-slate-900 group-hover:text-indigo-600">
                      {p.title}
                    </span>
                    <span className="font-mono text-xs font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      #{p.archive_code || p.id}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 flex items-center justify-between">
                    <span>مشتری: <strong>{p.customer_name}</strong></span>
                    <span className="font-mono">{formatNumber(p.quantity || 1000)} عدد</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                    <span>نوع جعبه: {p.box_type || 'مقوایی'}</span>
                    <span className="text-indigo-600 font-bold group-hover:underline">مشاهده پرونده ←</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <button
              onClick={() => setSelectedNodeId(null)}
              className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-xs"
            >
              بستن پنل رهگیری
            </button>
          </div>
        </div>
      )}

      {/* Bottom Hint Banner */}
      <div className="p-3 bg-slate-100/90 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 px-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-600" />
          <span>راهنما: با درگ ماوس می‌توانید روی بوم جابجا شوید، با اسکرول ماوس زوم کنید، و با کلیک روی هر نود سفارشات فعال آن مرحله را ببینید.</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span>جریان ۱۰ مرحله‌ای فعال</span>
        </div>
      </div>
    </div>
  );
}
