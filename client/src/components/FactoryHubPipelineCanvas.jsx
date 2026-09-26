import React, { useState, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { canAccessDepartment, formatNumber } from '../utils/helpers';
import {
  Workflow,
  Activity,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Sparkles,
  Bot,
  Users,
  BarChart3,
  Building2,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  FileSpreadsheet,
  PlusCircle,
  Boxes,
  Lock,
  CheckCircle2,
  Package,
  Printer,
  Scissors,
  Calculator,
  Crown,
  Compass,
  Palette,
  Truck,
  FileText
} from 'lucide-react';

// Department Node Configuration for Home Page Pipeline
const FACTORY_DEPT_NODES = [
  // ROW 1: Commercial & Front Office (Left to Right)
  {
    id: 'marketing',
    title: 'استعلام و بازاریابی',
    subtitle: 'Marketing & Leads',
    targetRole: 'marketer',
    tabKey: 'marketing',
    icon: Users,
    color: 'from-rose-500 to-pink-600',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    type: 'ورودی مشتریان',
    desc: 'ثبت استعلام ابعاد جعبه، تارگت فروش و ثبت لید',
    metrics: 'استعلامات جدید',
    row: 1, col: 0
  },
  {
    id: 'secretary',
    title: 'سفارشات و قراردادها',
    subtitle: 'Sales & Intake',
    targetRole: 'secretary',
    tabKey: 'new_order',
    icon: FileText,
    color: 'from-violet-500 to-indigo-600',
    badge: 'bg-violet-100 text-violet-800 border-violet-200',
    type: 'ثبت سفارش',
    desc: 'صدور قرارداد، دریافت پیش‌پرداخت و ایجاد پرونده',
    metrics: 'سفارشات ثبت‌شده',
    row: 1, col: 1
  },
  {
    id: 'accounting',
    title: 'حسابداری و برآورد قیمت',
    subtitle: 'Cost Estimation & Finance',
    targetRole: 'accounting',
    tabKey: 'calculator',
    icon: Calculator,
    color: 'from-amber-500 to-orange-600',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    type: 'محاسبه مالی',
    desc: 'آنالیز بهای مقوا، مرکب، خدمات و صدور پیش‌فاکتور',
    metrics: 'برآوردهای قیمت',
    row: 1, col: 2
  },
  {
    id: 'ceo',
    title: 'مدیریت و تاییدیه',
    subtitle: 'CEO Strategy & Approval',
    targetRole: 'ceo',
    tabKey: 'my_tasks',
    stageFilter: 4,
    icon: Crown,
    color: 'from-purple-600 to-pink-600',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    type: 'تاییدیه نهایی',
    desc: 'تایید تخفیف‌ها، مجوز تولید رسمی و استراتژی',
    metrics: 'تاییدیه‌های معوق',
    row: 1, col: 3
  },

  // ROW 2: Pre-press & Preparation (Right to Left)
  {
    id: 'design',
    title: 'استودیو طراحی امیران',
    subtitle: 'Dieline & 3D CAD Studio',
    targetRole: 'design',
    tabKey: 'dieline_generator',
    icon: Compass,
    color: 'from-indigo-600 to-blue-600',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    type: 'طراحی خط تیغ',
    desc: 'خروجی CorelDRAW 1:1، شبیه‌سازی سه‌بعدی و فرم‌بندی',
    metrics: 'طرح‌های در دست',
    row: 2, col: 3
  },
  {
    id: 'mockup',
    title: 'ماکت‌سازی و پلاتر',
    subtitle: 'Plotter & Sample Cutter',
    targetRole: 'secretary',
    tabKey: 'my_tasks',
    stageFilter: 7,
    icon: Scissors,
    color: 'from-teal-500 to-emerald-600',
    badge: 'bg-teal-100 text-teal-800 border-teal-200',
    type: 'نمونه‌گیری',
    desc: 'برش نمونه با کاترپلاتر و تست قالب قبل از تولید',
    metrics: 'ماکت‌های جاری',
    row: 2, col: 2
  },
  {
    id: 'warehouse',
    title: 'انبار مرکزی و متریال',
    subtitle: 'Cardboard & Sheet Stock',
    targetRole: 'warehouse',
    tabKey: 'warehouse_cardboard',
    icon: Package,
    color: 'from-sky-500 to-blue-600',
    badge: 'bg-sky-100 text-sky-800 border-sky-200',
    type: 'تامین و انبارش',
    desc: 'شیت مقوا، رول سینگل، ورق ۳ و ۵ لایه و مرکب',
    metrics: 'حواله‌های انبار',
    row: 2, col: 1
  },

  // ROW 3: Factory Floor & Delivery (Left to Right)
  {
    id: 'production',
    title: 'سالن چاپ افست و دیجیتال',
    subtitle: 'Offset & Digital Print Shop',
    targetRole: 'production',
    tabKey: 'production_orders',
    icon: Printer,
    color: 'from-amber-600 to-yellow-600',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    type: 'چاپ و تولید',
    desc: 'ماشین‌آلات چاپ ۴ و ۵ رنگ، زینک و آماده‌سازی فرم',
    metrics: 'فرم‌های چاپی',
    row: 3, col: 1
  },
  {
    id: 'outsource',
    title: 'خدمات تکمیلی و پس از چاپ',
    subtitle: 'UV, Foil & Cellophane',
    targetRole: 'outsource',
    tabKey: 'service_orders',
    icon: Sparkles,
    color: 'from-emerald-600 to-teal-700',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    type: 'خدمات پس از چاپ',
    desc: 'سلفون حرارتی، طلاکوب، یووی موضعی و برجسته‌کاری',
    metrics: 'سفارشات تکمیلی',
    row: 3, col: 2
  },
  {
    id: 'delivery',
    title: 'دایکات، جعبه‌چسبانی و تحویل',
    subtitle: 'Die-cutting, Gluing & Logistics',
    targetRole: 'production',
    tabKey: 'archive',
    icon: Boxes,
    color: 'from-rose-600 to-red-600',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    type: 'تحویل و بایگانی',
    desc: 'دایکات اتوماتیک، لترپرس، لب‌چسبان و تحویل به مشتری',
    metrics: 'تحویل شده امروز',
    row: 3, col: 3
  }
];

// Connected Satellite Nodes (AI, Analytics, HR)
const SATELLITE_NODES = [
  {
    id: 'ai_assistant',
    title: 'دستیار هوش مصنوعی و چیدمان شیت',
    subtitle: 'AI Packaging Assistant & Nesting',
    targetRole: 'ceo',
    tabKey: 'ai_assistant',
    icon: Bot,
    color: 'from-cyan-500 to-blue-600',
    badge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    type: 'موتور هوشمند',
    desc: 'چیدمان بهینه شیت مقوا (Nesting)، استخراج ابعاد از متن و کنترل پری‌فلایت',
    x: 60,
    y: 420
  },
  {
    id: 'analytics',
    title: 'داشبورد و آمار تحلیلی کارخانه',
    subtitle: 'BI Analytics & Audit Logs',
    targetRole: 'ceo',
    tabKey: 'dashboard',
    icon: BarChart3,
    color: 'from-purple-500 to-indigo-600',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    type: 'هوش تجاری',
    desc: 'نمودارهای تیراژ ماهانه، راندمان چاپخانه‌ها، گزارش مالی و ممیزی کاربران',
    x: 60,
    y: 640
  },
  {
    id: 'hr',
    title: 'ارزیابی عملکرد و منابع انسانی',
    subtitle: 'HR & Personnel Evaluation',
    targetRole: 'ceo',
    tabKey: 'hr',
    icon: Users,
    color: 'from-emerald-500 to-teal-600',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    type: 'ارزیابی پرسنل',
    desc: 'سیستم ۵ محوره ارزیابی کارکنان، حضور و غیاب، پاداش و بهره‌وری شیفت‌ها',
    x: 60,
    y: 860
  }
];

export default function FactoryHubPipelineCanvas({
  projects = [],
  onNavigateDepartment,
  onOpenNewOrder,
  onOpenArchive
}) {
  const { currentUser, role } = useAuth();

  // Canvas Viewport State
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 30, y: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isSimulating, setIsSimulating] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [accessDeniedModal, setAccessDeniedModal] = useState(null);

  const containerRef = useRef(null);

  // Compute Layout Node Positions
  const nodePositions = useMemo(() => {
    const nodeWidth = 320;
    const nodeHeight = 220;
    const gapX = 140;
    const gapY = 180;
    const startX = 480; // Leaving room on the left for satellite AI & BI nodes
    const startY = 80;

    const positions = {};

    FACTORY_DEPT_NODES.forEach((node) => {
      let x = startX + node.col * (nodeWidth + gapX);
      let y = startY + (node.row - 1) * (nodeHeight + gapY);
      positions[node.id] = { x, y, row: node.row, col: node.col, ...node };
    });

    return positions;
  }, []);

  // Compute Primary Flow Bezier Cables
  const connections = useMemo(() => {
    const nodeWidth = 320;
    const nodeHeight = 220;

    const pairs = [
      { from: 'marketing', to: 'secretary' },
      { from: 'secretary', to: 'accounting' },
      { from: 'accounting', to: 'ceo' },
      { from: 'ceo', to: 'design' },
      { from: 'design', to: 'mockup' },
      { from: 'mockup', to: 'warehouse' },
      { from: 'warehouse', to: 'production' },
      { from: 'production', to: 'outsource' },
      { from: 'outsource', to: 'delivery' }
    ];

    return pairs.map(({ from, to }) => {
      const p1 = nodePositions[from];
      const p2 = nodePositions[to];
      if (!p1 || !p2) return null;

      let startX, startY, endX, endY, cp1x, cp1y, cp2x, cp2y;

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
        // Vertical Turn Connection
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

      return {
        from,
        to,
        path,
        startX,
        startY,
        endX,
        endY
      };
    }).filter(Boolean);
  }, [nodePositions]);

  // Compute Satellite Connections to Main Pipeline
  const satelliteConnections = useMemo(() => {
    const nodeWidth = 320;
    const nodeHeight = 220;

    // AI connects to Design (node: 'design') and Accounting ('accounting')
    // Analytics connects to CEO ('ceo') and Delivery ('delivery')
    // HR connects to Warehouse ('warehouse') and Production ('production')
    const satPairs = [
      { satId: 'ai_assistant', targetNodeId: 'design', color: '#06b6d4' },
      { satId: 'ai_assistant', targetNodeId: 'accounting', color: '#06b6d4' },
      { satId: 'analytics', targetNodeId: 'ceo', color: '#a855f7' },
      { satId: 'hr', targetNodeId: 'production', color: '#10b981' }
    ];

    return satPairs.map(({ satId, targetNodeId, color }) => {
      const sat = SATELLITE_NODES.find(s => s.id === satId);
      const target = nodePositions[targetNodeId];
      if (!sat || !target) return null;

      const startX = sat.x + 300;
      const startY = sat.y + 70;
      const endX = target.x;
      const endY = target.y + nodeHeight / 2;

      const dx = (endX - startX) * 0.45;
      const cp1x = startX + dx;
      const cp1y = startY;
      const cp2x = endX - dx;
      const cp2y = endY;

      const path = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;

      return {
        path,
        startX,
        startY,
        endX,
        endY,
        color
      };
    }).filter(Boolean);
  }, [nodePositions]);

  // Pan & Zoom Event Handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.n8n-node-click') || e.target.closest('.n8n-control-btn')) return;
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
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.45), 1.8));
  };

  const resetView = () => {
    setZoom(0.85);
    setPan({ x: 30, y: 30 });
  };

  const fitToScreen = () => {
    setZoom(0.6);
    setPan({ x: 10, y: 10 });
  };

  // Click on Department Node Handler with Permission Check
  const handleNodeClick = (node) => {
    const hasAccess = canAccessDepartment(role, node.targetRole);
    if (!hasAccess) {
      setAccessDeniedModal({
        targetName: node.title,
        userRoleName: currentUser?.department || role
      });
      return;
    }
    onNavigateDepartment(node.tabKey, node.stageFilter);
  };

  // Get active counts for nodes
  const getNodeCount = (nodeId) => {
    switch (nodeId) {
      case 'design': return projects.filter(p => p.current_stage === 5).length;
      case 'ceo': return projects.filter(p => p.current_stage === 4).length;
      case 'marketing': return projects.filter(p => [1, 2].includes(p.current_stage)).length;
      case 'secretary': return projects.filter(p => [1, 3].includes(p.current_stage)).length;
      case 'accounting': return projects.filter(p => p.current_stage === 2).length;
      case 'production': return projects.filter(p => p.current_stage === 10).length;
      case 'outsource': return projects.filter(p => [7, 8].includes(p.current_stage)).length;
      case 'warehouse': return projects.filter(p => p.current_stage === 9).length;
      case 'mockup': return projects.filter(p => p.current_stage === 7).length;
      case 'delivery': return projects.filter(p => p.current_stage >= 10).length;
      default: return projects.length;
    }
  };

  return (
    <div className="w-full relative rounded-3xl border border-slate-200/90 shadow-sm bg-white overflow-hidden select-none">
      
      {/* Top Floating Telemetry & Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none flex-wrap gap-2">
        
        {/* Hub Title Pill */}
        <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 pointer-events-auto">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Workflow className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-xs sm:text-sm text-slate-900">
                بوم گرافیکی یکپارچه اتوماسیون کارخانه (MIS Pipeline)
              </h3>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                n8n Enterprise
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              نقشه تعاملی زنجیره ارزش تولید جعبه و کارتن با رهگیری بلادرنگ دپارتمان‌ها
            </div>
          </div>
        </div>

        {/* Action Controls & Zoom Dock */}
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-sm pointer-events-auto">
          
          {/* Simulation Toggle */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isSimulating
                ? 'bg-emerald-100 text-emerald-950 border border-emerald-300 font-black'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="فعال/غیرفعال کردن انیمیشن جریان اتوماسیون"
          >
            <Activity className={`w-3.5 h-3.5 ${isSimulating ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">جریان زنده خط تولید</span>
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
            onClick={() => setZoom(prev => Math.max(prev * 0.85, 0.45))}
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
        className="w-full h-[780px] cursor-grab active:cursor-grabbing relative overflow-hidden bg-slate-50 transition-colors"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.3) 1.5px, transparent 1.5px)',
          backgroundSize: `${26 * zoom}px ${26 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`
        }}
      >
        {/* Transformed World Space Container */}
        <div
          className="absolute inset-0 origin-top-left transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
          }}
        >
          {/* SVG Connecting Layer */}
          <svg
            className="absolute top-0 left-0 w-[2800px] h-[1800px] pointer-events-none z-0 overflow-visible"
          >
            <defs>
              <linearGradient id="hubCableGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                <stop offset="35%" stopColor="#8b5cf6" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#0ea5e9" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
              </linearGradient>

              <filter id="hubGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Render Satellite Connections */}
            {satelliteConnections.map((sat, idx) => (
              <g key={`sat-conn-${idx}`}>
                <path
                  d={sat.path}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="5"
                  strokeDasharray="6 6"
                />
                <path
                  d={sat.path}
                  fill="none"
                  stroke={sat.color}
                  strokeWidth="2.5"
                  strokeDasharray="4 8"
                  opacity="0.85"
                />
                {isSimulating && (
                  <path
                    d={sat.path}
                    fill="none"
                    stroke={sat.color}
                    strokeWidth="3.5"
                    strokeDasharray="10 20"
                    className="animate-n8n-cable"
                    filter="url(#hubGlow)"
                  />
                )}
              </g>
            ))}

            {/* Render Primary Value Stream Connections */}
            {connections.map((conn, idx) => (
              <g key={`hub-conn-${idx}`}>
                {/* Background Shadow Cable */}
                <path
                  d={conn.path}
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="7"
                  strokeLinecap="round"
                  opacity="0.6"
                />

                {/* Primary Multi-color Gradient Cable */}
                <path
                  d={conn.path}
                  fill="none"
                  stroke="url(#hubCableGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Animated Flow Particles */}
                {isSimulating && (
                  <path
                    d={conn.path}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="4.5"
                    strokeDasharray="14 28"
                    strokeLinecap="round"
                    className="animate-n8n-cable"
                    filter="url(#hubGlow)"
                  />
                )}

                {/* Port Knobs */}
                <circle cx={conn.startX} cy={conn.startY} r="5" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
                <circle cx={conn.endX} cy={conn.endY} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
              </g>
            ))}
          </svg>

          {/* Render Satellite Nodes (Left Column) */}
          <div className="absolute left-[60px] top-[60px] space-y-6">
            <div className="text-xs font-black text-slate-500 bg-slate-100/90 border border-slate-300/80 px-3 py-1.5 rounded-xl inline-flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-600" />
              <span>موتورهای هوشمند و زیرسیستم‌های یکپارچه</span>
            </div>

            {SATELLITE_NODES.map((sat) => {
              const SatIcon = sat.icon;
              const hasAccess = canAccessDepartment(role, sat.targetRole);

              return (
                <div
                  key={`sat-node-${sat.id}`}
                  onClick={() => handleNodeClick(sat)}
                  className="n8n-node-click w-[330px] bg-white rounded-3xl border-2 border-slate-200/90 shadow-xl hover:border-cyan-400 hover:shadow-2xl transition-all duration-200 cursor-pointer p-4 space-y-3 group relative"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: `${sat.y}px`
                  }}
                >
                  {/* Satellite Output Handle */}
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 border-cyan-500 flex items-center justify-center shadow-md">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${sat.color} text-white flex items-center justify-center shadow-md`}>
                        <SatIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold border ${sat.badge}`}>
                          {sat.type}
                        </span>
                        <h4 className="font-black text-xs text-slate-900 group-hover:text-cyan-700 transition-colors mt-0.5">
                          {sat.title}
                        </h4>
                      </div>
                    </div>

                    {!hasAccess && (
                      <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg" title="دسترسی محدود">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed line-clamp-2">
                    {sat.desc}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-bold pt-1 text-cyan-700">
                    <span>ورود به ماژول هوشمند</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Render Primary 10 Factory Pipeline Nodes */}
          {FACTORY_DEPT_NODES.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;

            const NodeIcon = node.icon;
            const activeCount = getNodeCount(node.id);
            const hasAccess = canAccessDepartment(role, node.targetRole);

            return (
              <div
                key={`hub-node-${node.id}`}
                onClick={() => handleNodeClick(node)}
                className={`n8n-node-click absolute w-[320px] rounded-3xl bg-white border-2 shadow-xl transition-all duration-200 cursor-pointer group hover:shadow-2xl ${
                  hasAccess
                    ? 'border-slate-200/90 hover:border-indigo-500 hover:scale-[1.02]'
                    : 'border-slate-200/70 opacity-90'
                }`}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`
                }}
              >
                {/* Left Input Port */}
                <div
                  className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center shadow-md"
                  title="ورودی جریان کار"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                </div>

                {/* Node Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${node.color} text-white flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform`}>
                      <NodeIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold border ${node.badge}`}>
                          {node.type}
                        </span>
                        {!hasAccess && (
                          <span className="p-1 bg-rose-50 text-rose-600 rounded-md" title="عدم دسترسی به پرونده">
                            <Lock className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <h4 className="font-black text-xs text-slate-800 tracking-tight mt-0.5 group-hover:text-indigo-700 transition-colors">
                        {node.title}
                      </h4>
                    </div>
                  </div>

                  {/* Pending Counter */}
                  <div className={`px-2.5 py-1 rounded-xl font-black font-mono text-xs flex items-center gap-1 shadow-xs ${
                    activeCount > 0
                      ? 'bg-indigo-600 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    <span>{formatNumber(activeCount)}</span>
                    <span className="text-[10px] font-sans font-bold">مورد</span>
                  </div>
                </div>

                {/* Node Body */}
                <div className="p-4 space-y-3 bg-slate-50/50 rounded-b-3xl">
                  <div className="text-[11px] text-slate-600 leading-relaxed font-medium line-clamp-2">
                    {node.desc}
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span className="text-slate-400 font-normal">واحد: {node.subtitle}</span>
                    <span className="text-indigo-600 group-hover:underline flex items-center gap-1">
                      <span>ورود به کارتابل</span>
                      <ArrowRight className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>

                {/* Right Output Port */}
                <div
                  className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center shadow-md"
                  title="خروجی به ایستگاه بعدی"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Telemetry Footer */}
      <div className="p-3 bg-slate-100/90 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 px-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-600" />
          <span>با درگ ماوس می‌توانید در بوم حرکت کنید، با اسکرول ماوس زوم کنید، و با کلیک روی هر دپارتمان مستقیماً وارد بخش مربوطه شوید.</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span>شبکه یکپارچه اتوماسیون MIS فعال است</span>
        </div>
      </div>

      {/* Access Denied Modal */}
      {accessDeniedModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-rose-200">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900">عدم دسترسی به دپارتمان</h3>
              <p className="text-base font-black text-rose-600">
                شما مجاز به دیدن این پرونده نیستین
              </p>
              <p className="text-xs text-slate-500">
                نقش شما ({accessDeniedModal.userRoleName}) اجازه ورود به بخش «{accessDeniedModal.targetName}» را ندارد.
              </p>
            </div>

            <button
              onClick={() => setAccessDeniedModal(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
