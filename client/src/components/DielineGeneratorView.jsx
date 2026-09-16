import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Sliders,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Download,
  Info,
  ChevronDown,
  Plus,
  Minus,
  Check,
  MousePointer,
  Hand,
  PenTool,
  Share2,
  ExternalLink,
  Crown,
  Layers,
  FileType,
  RotateCw,
  Maximize2,
  FileSpreadsheet,
  FileCheck
} from 'lucide-react';
import { api } from '../api/client';
import Packaging3DMockup from './Packaging3DMockup';
import Packaging3DStudioView from './Packaging3DStudioView';
import { exportDielineToPdf } from '../utils/pdfExport';
import { exportDielineToDxf } from '../utils/dxfExport';
import { exportDielineToAi } from '../utils/aiExport';

const MODELS = [
  { id: 'tuck_end', pacdoraId: '100010', name: 'جعبه دارویی دو طرف درب (Straight Tuck End)', desc: 'درب و زبانه قفل استاندارد دارویی و بهداشتی', icon: '💊', defaultDim: { l: 120, w: 60, h: 160 } },
  { id: 'keyboard', pacdoraId: '150010', name: 'کارتن پستی کیبوردی (Flip-Top Mailer)', desc: 'کارتن پستی قفل سرخود FEFCO 0427', icon: '📦', defaultDim: { l: 200, w: 150, h: 50 } },
  { id: 'snap_lock_bottom', pacdoraId: '110020', name: 'جعبه کفی قفلی اتوماتیک (Auto Bottom)', desc: 'سر دارویی ته قفلی اتوماتیک ECMA A20.40', icon: '🔒', defaultDim: { l: 140, w: 80, h: 180 } },
  { id: 'american', pacdoraId: '200010', name: 'کارتن آمریکایی ۴ درب مادر (RSC Carton)', desc: 'کارتن پستی مادر FEFCO 0201', icon: '🏭', defaultDim: { l: 300, w: 200, h: 250 } }
];

const MATERIALS = [
  { id: '350g_white', name: 'مقوای ایندربرد ۳۵۰ گرم', farsiName: 'ایندربرد ۳۵۰ گرم', defaultThickness: 0.5, colorHex: '#ffffff', iconColor: '#ffffff' },
  { id: '300g_white', name: 'مقوای ایندربرد ۳۰۰ گرم', farsiName: 'ایندربرد ۳۰۰ گرم', defaultThickness: 0.42, colorHex: '#fafafa', iconColor: '#f1f5f9' },
  { id: '250g_duplex', name: 'مقوای پشت طوسی ۲۵۰ گرم', farsiName: 'پشت طوسی ۲۵۰ گرم', defaultThickness: 0.45, colorHex: '#f1f1ed', iconColor: '#e2e8f0' },
  { id: 'kraft', name: 'مقوای کرافت قهوه‌ای', farsiName: 'مقوای کرافت', defaultThickness: 0.55, colorHex: '#c89d6c', iconColor: '#b45309' },
  { id: 'flute_e', name: 'کارتن لمینتی E-Flute ۱.۵ میلی‌متر', farsiName: 'ای فلوت ۱.۵ میل', defaultThickness: 1.5, colorHex: '#dfbe95', iconColor: '#d97706' },
  { id: 'flute_b', name: 'کارتن ۳ لایه B-Flute ۳ میلی‌متر', farsiName: 'بی فلوت ۳ میل', defaultThickness: 3.0, colorHex: '#be9364', iconColor: '#92400e' }
];

export default function DielineGeneratorView({ onTransferToOrder }) {
  // Navigation Mode: '2d_dieline' or '3d_studio'
  const [studioMode, setStudioMode] = useState('2d_dieline');

  // Left dock tabs: 'models', 'basic', 'advanced' (Removed 'more' as requested)
  const [activeNavTab, setActiveNavTab] = useState('basic');

  // Model & Dimensions State
  const [selectedModel, setSelectedModel] = useState('tuck_end');
  const [lengthMm, setLengthMm] = useState(120);
  const [widthMm, setWidthMm] = useState(60);
  const [heightMm, setHeightMm] = useState(160);

  // String input states for seamless typing
  const [inputL, setInputL] = useState('120');
  const [inputW, setInputW] = useState('60');
  const [inputH, setInputH] = useState('160');

  // Material & Thickness
  const [selectedMaterial, setSelectedMaterial] = useState('350g_white');
  const [thicknessMm, setThicknessMm] = useState(0.5);

  // Size Mode: 'mfg' (ابعاد ساخت) | 'inner' (ابعاد داخلی) | 'outer' (ابعاد بیرونی)
  const [sizeMode, setSizeMode] = useState('mfg');

  // 3D Mockup Fold Slider (0 = Flat, 1 = Folded)
  const [mockupFold, setMockupFold] = useState(1);

  // Canvas zoom, pan, and tools
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [activeCanvasTool, setActiveCanvasTool] = useState('select'); // 'select', 'pan'

  // Server Dieline CAD Data
  const [dielineData, setDielineData] = useState(null);
  const [loadingDieline, setLoadingDieline] = useState(false);

  // Sync inputs when model changes
  const handleSelectModel = (m) => {
    setSelectedModel(m.id);
    setLengthMm(m.defaultDim.l);
    setWidthMm(m.defaultDim.w);
    setHeightMm(m.defaultDim.h);
    setInputL(String(m.defaultDim.l));
    setInputW(String(m.defaultDim.w));
    setInputH(String(m.defaultDim.h));
    setActiveNavTab('basic');
  };

  // Fetch Dieline Vector & Calculations
  const fetchDieline = async () => {
    try {
      setLoadingDieline(true);
      const res = await api.generateDieline({
        boxType: selectedModel,
        type: selectedModel,
        length: lengthMm,
        width: widthMm,
        height: heightMm,
        thickness: thicknessMm,
        customThickness: thicknessMm,
        size_mode: sizeMode,
        sizeMode: sizeMode,
        material: selectedMaterial,
        material_type: selectedMaterial
      });
      if (res && (res.svg || res.svg_content)) {
        setDielineData(res);
      }
    } catch (err) {
      console.error('Error generating dieline:', err);
    } finally {
      setLoadingDieline(false);
    }
  };

  useEffect(() => {
    fetchDieline();
  }, [selectedModel, lengthMm, widthMm, heightMm, thicknessMm, sizeMode, selectedMaterial]);

  // Dimension Triad Calculations (Manufacture, Inner, Outer)
  const mfg = {
    l: lengthMm,
    w: widthMm,
    h: heightMm
  };
  const inner = {
    l: (lengthMm - thicknessMm * 1.2).toFixed(1),
    w: (widthMm - thicknessMm * 1.2).toFixed(1),
    h: (heightMm - thicknessMm * 2.2).toFixed(1)
  };
  const outer = {
    l: (lengthMm + thicknessMm * 0.8).toFixed(1),
    w: (widthMm + thicknessMm * 0.8).toFixed(1),
    h: (heightMm + thicknessMm * 1.8).toFixed(1)
  };

  const activeMat = MATERIALS.find((m) => m.id === selectedMaterial) || MATERIALS[0];
  const activeModel = MODELS.find((m) => m.id === selectedModel) || MODELS[0];

  // Export Handlers
  const handleDownloadPdf = () => {
    exportDielineToPdf(dielineData, {
      modelName: activeModel.name,
      length: lengthMm,
      width: widthMm,
      height: heightMm,
      thickness: thicknessMm,
      material: activeMat.farsiName,
      unit: 'mm'
    });
  };

  const handleDownloadDxf = () => {
    exportDielineToDxf(dielineData, {
      modelName: activeModel.name,
      length: lengthMm,
      width: widthMm,
      height: heightMm,
      thickness: thicknessMm,
      material: activeMat.name
    });
  };

  const handleDownloadAi = () => {
    exportDielineToAi(dielineData, {
      modelName: activeModel.name,
      length: lengthMm,
      width: widthMm,
      height: heightMm,
      thickness: thicknessMm,
      material: activeMat.farsiName
    });
  };

  // Interactive Pan / Mouse Drag Handlers
  const handleMouseDownCanvas = (e) => {
    if (activeCanvasTool === 'pan') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMoveCanvas = (e) => {
    if (isPanning && activeCanvasTool === 'pan') {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUpCanvas = () => {
    setIsPanning(false);
  };

  const handleResetCanvas = () => {
    setZoomScale(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  // Render Full 3D Studio if active
  if (studioMode === '3d_studio') {
    return (
      <Packaging3DStudioView
        initialBoxSpecs={{
          modelId: selectedModel === 'tuck_end' ? 'tuck_end' : selectedModel === 'keyboard' ? 'mailer' : 'auto_bottom',
          length: lengthMm,
          width: widthMm,
          height: heightMm,
          thickness: thicknessMm
        }}
        onSwitchTo2DDieline={() => setStudioMode('2d_dieline')}
        onTransferToOrder={onTransferToOrder}
      />
    );
  }

  return (
    <div className="w-full flex flex-col h-[calc(100vh-140px)] min-h-[750px] bg-slate-950 text-slate-100 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl select-none font-sans" dir="rtl">
      
      {/* ========================================================
          1. TOP HEADER (استودیو طراحی امیران)
         ======================================================== */}
      <header className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4 z-20 flex-shrink-0">
        
        {/* Right: Brand Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              <Box className="w-5 h-5" />
            </div>
            <span className="font-black text-white text-base tracking-tight">استودیو طراحی امیران</span>
          </div>
          <span className="text-slate-600 text-sm">/</span>
          <span className="text-amber-400 font-bold text-xs sm:text-sm">مولد نقشه خط تیغ و شبیه‌ساز سه‌بعدی</span>
        </div>

        {/* Center: Active Model Name & Code */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-300 font-medium">
          <span className="bg-slate-800/90 px-2.5 py-1 rounded-xl border border-slate-700 text-amber-300 font-mono">
            کد مدل: #{activeModel.pacdoraId}
          </span>
          <span className="font-bold text-slate-200">{activeModel.name}</span>
        </div>

        {/* Left: Actions */}
        <div className="flex items-center gap-2.5">
          
          {/* 3D Design Studio Mode Switcher */}
          <button
            type="button"
            onClick={() => setStudioMode('3d_studio')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-sm border border-indigo-500 active:scale-95"
            title="طراحی و رندرینگ ۳ بعدی آنلاین با افکت‌های طلاکوب و صحنه‌های استودیویی"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>طراحی آنلاین ۳ بعدی</span>
            <ExternalLink className="w-3 h-3 text-indigo-200" />
          </button>

          {/* Golden Crown Download Button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 transition shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Crown className="w-4 h-4 fill-slate-950" />
            <span>دانلود نقشه خط تیغ (PDF)</span>
          </button>
        </div>
      </header>

      {/* ========================================================
          2. MAIN WORKSPACE (3-PANEL LAYOUT)
         ======================================================== */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ====================================================
            RIGHT PANEL: DOCK + PARAMETERS (RTL Layout)
           ==================================================== */}
        <div className="w-80 lg:w-92 bg-slate-900 border-l border-slate-800 flex z-10 shadow-xl flex-shrink-0">
          
          {/* Vertical Icon Dock (مدل‌ها / ابعاد / مشخصات فنی - Help tab removed) */}
          <div className="w-16 bg-slate-950 border-l border-slate-800 flex flex-col items-center py-4 gap-4 flex-shrink-0">
            {[
              { id: 'models', label: 'مدل‌ها', icon: Box },
              { id: 'basic', label: 'ابعاد', icon: Sliders },
              { id: 'advanced', label: 'مشخصات', icon: Layers }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveNavTab(tab.id)}
                  className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition ${
                    activeNavTab === tab.id
                      ? 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-900/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  title={tab.label}
                >
                  <Icon className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-bold">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-sidebar Form */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 text-right text-slate-200">
            
            {/* TAB: MODELS SELECTOR */}
            {activeNavTab === 'models' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-amber-300">انتخاب مدل جعبه و کارتن</h3>
                  <span className="text-[10px] text-slate-400 font-mono">FEFCO / ECMA</span>
                </div>
                <div className="space-y-2">
                  {MODELS.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleSelectModel(m)}
                      className={`p-3 rounded-2xl border text-right cursor-pointer transition ${
                        selectedModel === m.id
                          ? 'bg-indigo-950/70 border-amber-400 ring-2 ring-amber-400/20'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">{m.icon}</span>
                        <span className="text-[10px] font-mono text-amber-400 font-bold">#{m.pacdoraId}</span>
                      </div>
                      <div className="text-xs font-black text-white">{m.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{m.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: BASIC PARAMETERS (ابعاد بر اساس میلی‌متر - اینچ حذف شد) */}
            {activeNavTab === 'basic' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                
                {/* Custom Size Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-200">ابعاد سفارشی جعبه</span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      میلی‌متر (mm)
                    </span>
                  </div>

                  {/* Length / Width / Height Inputs - Fluid Unrestricted Typing */}
                  <div className="space-y-2.5">
                    {/* Length */}
                    <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2">
                      <span className="text-xs font-bold text-slate-300">طول جعبه (Length)</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={inputL}
                          onChange={(e) => {
                            const val = e.target.value;
                            setInputL(val);
                            const n = parseInt(val);
                            if (!isNaN(n) && n > 0) setLengthMm(n);
                          }}
                          onBlur={() => {
                            const n = parseInt(inputL) || 120;
                            setLengthMm(Math.max(10, n));
                            setInputL(String(Math.max(10, n)));
                          }}
                          className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-black text-sm text-amber-300 focus:outline-none focus:border-amber-400"
                        />
                        <span className="text-xs text-slate-500 font-mono">mm</span>
                      </div>
                    </div>

                    {/* Width */}
                    <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2">
                      <span className="text-xs font-bold text-slate-300">عرض / عطف (Width)</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={inputW}
                          onChange={(e) => {
                            const val = e.target.value;
                            setInputW(val);
                            const n = parseInt(val);
                            if (!isNaN(n) && n > 0) setWidthMm(n);
                          }}
                          onBlur={() => {
                            const n = parseInt(inputW) || 60;
                            setWidthMm(Math.max(10, n));
                            setInputW(String(Math.max(10, n)));
                          }}
                          className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-black text-sm text-amber-300 focus:outline-none focus:border-amber-400"
                        />
                        <span className="text-xs text-slate-500 font-mono">mm</span>
                      </div>
                    </div>

                    {/* Height */}
                    <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2">
                      <span className="text-xs font-bold text-slate-300">ارتفاع جعبه (Height)</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={inputH}
                          onChange={(e) => {
                            const val = e.target.value;
                            setInputH(val);
                            const n = parseInt(val);
                            if (!isNaN(n) && n > 0) setHeightMm(n);
                          }}
                          onBlur={() => {
                            const n = parseInt(inputH) || 160;
                            setHeightMm(Math.max(10, n));
                            setInputH(String(Math.max(10, n)));
                          }}
                          className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-black text-sm text-amber-300 focus:outline-none focus:border-amber-400"
                        />
                        <span className="text-xs text-slate-500 font-mono">mm</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Choose Material Section */}
                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-200">انتخاب متریال و نوع مقوا</span>
                  <div className="relative">
                    <select
                      value={selectedMaterial}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedMaterial(val);
                        const mat = MATERIALS.find((m) => m.id === val);
                        if (mat) setThicknessMm(mat.defaultThickness);
                      }}
                      className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-bold focus:outline-none focus:border-indigo-500"
                    >
                      {MATERIALS.map((m) => (
                        <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Thickness Stepper: [-] 0.5 [+] */}
                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-200">ضخامت کالیپر (Thickness)</span>
                  <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setThicknessMm((t) => Math.max(0.2, parseFloat((t - 0.1).toFixed(2))))}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 font-black transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-sm font-black text-white">{thicknessMm}</span>
                      <span className="text-xs text-slate-500 font-mono">mm</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setThicknessMm((t) => parseFloat((t + 0.1).toFixed(2)))}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 font-black transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Size Mode Selector (Manufacture, Inner, Outer) */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-black text-slate-200">مبنای محاسبه ابعاد (Size mode)</span>
                  <div className="space-y-1.5">
                    {[
                      { id: 'mfg', label: 'ابعاد ساخت خط تیغ (Manufacture)', desc: 'ابعاد خط تیغ ساخت' },
                      { id: 'inner', label: 'ابعاد مفید داخل جعبه (Inner)', desc: 'ابعاد مفید فضای داخل جعبه' },
                      { id: 'outer', label: 'ابعاد فضای اشغال بیرونی (Outer)', desc: 'ابعاد اشغال فضای بیرونی' }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setSizeMode(mode.id)}
                        className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold transition border flex items-center justify-between ${
                          sizeMode === mode.id
                            ? 'bg-indigo-600/30 text-white border-indigo-500 shadow-xs'
                            : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span>{mode.label}</span>
                        {sizeMode === mode.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB: ADVANCED / TECHNICAL MATRIX */}
            {activeNavTab === 'advanced' && (
              <div className="space-y-4 text-xs animate-in fade-in duration-150">
                <h3 className="font-black text-amber-300">ماتریس مشخصات فنی قالب و شیت</h3>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-300">
                    <span className="font-sans">محیط خط تیغ برش:</span>
                    <strong className="text-blue-400">{dielineData?.technical_matrix?.cut_perimeter_mm || 0} mm</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="font-sans">طول خط تا و پرفراژ:</span>
                    <strong className="text-rose-400">{dielineData?.technical_matrix?.crease_perimeter_mm || 0} mm</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="font-sans">مساحت شیت گسترده:</span>
                    <strong className="text-amber-300">{dielineData?.technical_matrix?.blank_area_cm2 || 0} cm²</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="font-sans">وزن تقریبی هر شیت:</span>
                    <strong className="text-emerald-400">{dielineData?.technical_matrix?.blank_weight_g || 0} گرم</strong>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ====================================================
            CENTER 2D VECTOR CAD CANVAS (Interactive Pan & Zoom)
           ==================================================== */}
        <div
          className={`flex-1 relative bg-slate-950 flex flex-col items-center justify-center overflow-hidden ${
            activeCanvasTool === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          }`}
          onMouseDown={handleMouseDownCanvas}
          onMouseMove={handleMouseMoveCanvas}
          onMouseUp={handleMouseUpCanvas}
        >
          
          {/* Top Center Legend (اضافه رنگ / خط تیغ / خط تا) */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-800 px-4 py-1.5 rounded-2xl flex items-center gap-5 text-xs text-slate-300 backdrop-blur-md shadow-lg z-10 pointer-events-none">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-[#10b981]" />
              <span className="text-[11px] font-bold text-emerald-400">اضافه رنگ (Bleed)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-[#3b82f6]" />
              <span className="text-[11px] font-bold text-blue-400">خط تیغ برش (Trim)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-t border-dashed border-[#ef4444]" />
              <span className="text-[11px] font-bold text-rose-400">خط تا (Crease)</span>
            </div>
          </div>

          {/* Top Left Dimension Triad Overlay */}
          <div className="absolute top-4 left-4 bg-slate-900/95 border border-slate-800 p-3 rounded-2xl text-[11px] space-y-1.5 backdrop-blur-md shadow-xl z-10 font-mono text-left pointer-events-none" dir="ltr">
            <div className="text-slate-200">
              <span className="text-slate-400 font-sans">Manufacture: </span>
              <strong className="text-amber-300 font-bold">{mfg.l} × {mfg.w} × {mfg.h} mm</strong>
            </div>
            <div className="text-slate-300">
              <span className="text-slate-400 font-sans">Inner: </span>
              <strong className="text-cyan-300">{inner.l} × {inner.w} × {inner.h} mm</strong>
            </div>
            <div className="text-slate-300">
              <span className="text-slate-400 font-sans">Outer: </span>
              <strong className="text-emerald-300">{outer.l} × {outer.w} × {outer.h} mm</strong>
            </div>
          </div>

          {/* SVG Vector Dieline Display Area with Pan & Zoom */}
          <div
            className="w-full h-full flex items-center justify-center p-8 transition-transform duration-75 select-none"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`
            }}
          >
            {loadingDieline ? (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <span className="text-xs font-bold">در حال محاسبه هندسه وکتور خط تیغ...</span>
              </div>
            ) : dielineData?.svg_content || dielineData?.svg ? (
              <div
                className="w-full max-w-[85%] max-h-[85%] flex items-center justify-center drop-shadow-2xl bg-white rounded-2xl p-4 border border-slate-700/50"
                dangerouslySetInnerHTML={{ __html: dielineData.svg_content || dielineData.svg }}
              />
            ) : (
              <div className="text-slate-500 text-xs font-bold">در حال بارگذاری نقشه...</div>
            )}
          </div>

          {/* Bottom Floating Canvas Toolbar (Interactive Hand, Cursor, Zoom) */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-slate-800 px-3 py-1.5 rounded-2xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-10" dir="ltr">
            <button
              type="button"
              onClick={() => setActiveCanvasTool('select')}
              className={`p-2 rounded-xl text-xs transition ${
                activeCanvasTool === 'select' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="نشانگر انتخاب (Cursor)"
            >
              <MousePointer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveCanvasTool('pan')}
              className={`p-2 rounded-xl text-xs transition ${
                activeCanvasTool === 'pan' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="ابزار دست (جابجایی و درگ نقشه)"
            >
              <Hand className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-slate-800 my-auto mx-1" />

            <button
              type="button"
              onClick={() => setZoomScale((z) => Math.min(3.0, parseFloat((z + 0.15).toFixed(2))))}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="بزرگ‌نمایی"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-amber-300 w-12 text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomScale((z) => Math.max(0.3, parseFloat((z - 0.15).toFixed(2))))}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="کوچک‌نمایی"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetCanvas}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="بازنشانی زوم و موقعیت به ۱۰۰٪"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* ====================================================
            LEFT PANEL: 3D MINI MOCKUP + DOWNLOADS (RTL Left Side)
           ==================================================== */}
        <div className="w-80 lg:w-92 bg-slate-900 border-r border-slate-800 flex flex-col p-4 overflow-y-auto space-y-5 z-10 text-right shadow-xl flex-shrink-0">
          
          {/* 3D Mini Mockup Widget Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-3 relative overflow-hidden shadow-inner">
            {/* Top Widget Bar */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-200">پیش‌نمایش موکاپ ۳ بعدی</span>
              <button
                type="button"
                onClick={() => setStudioMode('3d_studio')}
                className="flex items-center gap-1 text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition"
              >
                <span>استودیو کامل ۳ بعدی</span>
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>

            {/* Three.js Interactive 3D Box Viewport */}
            <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
              <Packaging3DMockup
                boxType={selectedModel}
                length={lengthMm}
                width={widthMm}
                height={heightMm}
                thickness={thicknessMm}
                materialColor={activeMat.colorHex}
                foldAngle={mockupFold}
              />
            </div>

            {/* Folding Slider: Open ---O--- Close */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] text-slate-400 font-bold">
                <span>شیت گسترده (۰٪)</span>
                <span className="font-mono text-amber-400">{Math.round(mockupFold * 100)}%</span>
                <span>بسته کامل (۱۰۰٪)</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={mockupFold}
                onChange={(e) => setMockupFold(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* File Formats Download Options */}
          <div className="space-y-2.5">
            <span className="text-xs font-black text-slate-200">فرمت‌های قابل دانلود (File formats)</span>
            <div className="grid grid-cols-2 gap-2">
              
              {/* AI Format (Fixed) */}
              <button
                type="button"
                onClick={handleDownloadAi}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center gap-2.5 transition text-right group"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-black text-xs">
                  Ai
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-300">وکتور Illustrator</div>
                  <div className="text-[10px] text-slate-400 font-mono">قالب .AI لایه‌بندی</div>
                </div>
              </button>

              {/* PDF Format */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center gap-2.5 transition text-right group"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-xs">
                  PDF
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-300">نقشه چاپ PDF</div>
                  <div className="text-[10px] text-slate-400 font-mono">آماده چاپ ۱:۱</div>
                </div>
              </button>

              {/* DXF Format (Laser Cutting) */}
              <button
                type="button"
                onClick={handleDownloadDxf}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center gap-2.5 transition text-right group"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-xs">
                  DXF
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-300">نقشه لیزر DXF</div>
                  <div className="text-[10px] text-slate-400 font-mono">اتوکد R12 لایه‌ای</div>
                </div>
              </button>

              {/* 3D Mockup Launch */}
              <button
                type="button"
                onClick={() => setStudioMode('3d_studio')}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center gap-2.5 transition text-right group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs">
                  3D
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-300">استودیو ۳ بعدی</div>
                  <div className="text-[10px] text-slate-400 font-mono">رندر 4K استودیو</div>
                </div>
              </button>

            </div>
          </div>

          {/* You Will Get Bullet Points */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-right">
            <span className="text-xs font-black text-amber-300">مزایای قالب‌های استودیو امیران:</span>
            <ul className="text-[11px] text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>تولید و دانلود آنی فایل‌های خط تیغ استاندارد</li>
              <li>مقیاس دقیق ۱:۱ صنعتی و کالیپر مهندسی</li>
              <li>فایل‌های وکتور بدون واترمارک و قابل ویرایش در Illustrator</li>
              <li>ماتریس فنی طول خط برش و خط تا جهت قالب‌سازی لیزری</li>
            </ul>
          </div>

          {/* Transfer to Order Button */}
          {onTransferToOrder && (
            <button
              type="button"
              onClick={() => onTransferToOrder({
                box_type: selectedModel,
                length: lengthMm,
                width: widthMm,
                height: heightMm,
                sheet_thickness: thicknessMm,
                material_name: activeMat.farsiName
              })}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition shadow-md shadow-indigo-900/40 text-center"
            >
              انتقال ابعاد به فرم ثبت سفارش کارخانه
            </button>
          )}

        </div>

      </div>

    </div>
  );
}
