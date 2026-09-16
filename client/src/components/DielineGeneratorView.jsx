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
  Maximize2
} from 'lucide-react';
import { api } from '../api/client';
import Packaging3DMockup from './Packaging3DMockup';
import Packaging3DStudioView from './Packaging3DStudioView';
import { exportDielineToPdf } from '../utils/pdfExport';
import { exportDielineToDxf } from '../utils/dxfExport';

const MODELS = [
  { id: 'tuck_end', pacdoraId: '100010', name: 'Straight Tuck End (STE)', desc: 'دو طرف درب دارویی استاندارد', icon: '💊', defaultDim: { l: 120, w: 60, h: 160 } },
  { id: 'keyboard', pacdoraId: '150010', name: 'Flip-Top Mailer Box (FEFCO 0427)', desc: 'کارتن پستی کیبوردی قفل سرخود', icon: '📦', defaultDim: { l: 200, w: 150, h: 50 } },
  { id: 'snap_lock_bottom', pacdoraId: '110020', name: '1-2-3 Snap Lock Bottom', desc: 'سر دارویی ته قفلی اتوماتیک', icon: '🔒', defaultDim: { l: 140, w: 80, h: 180 } },
  { id: 'american', pacdoraId: '200010', name: 'RSC Shipping Carton (FEFCO 0201)', desc: 'کارتن آمریکایی ۴ درب مادر', icon: '🏭', defaultDim: { l: 300, w: 200, h: 250 } }
];

const MATERIALS = [
  { id: '350g_white', name: '350g white paperboard', farsiName: 'ایندربرد ۳۵۰ گرم', defaultThickness: 0.5, colorHex: '#ffffff', iconColor: '#ffffff' },
  { id: '300g_white', name: '300g white paperboard', farsiName: 'ایندربرد ۳۰۰ گرم', defaultThickness: 0.42, colorHex: '#fafafa', iconColor: '#f1f5f9' },
  { id: '250g_duplex', name: '250g duplex paperboard', farsiName: 'پشت طوسی ۲۵۰ گرم', defaultThickness: 0.45, colorHex: '#f1f1ed', iconColor: '#e2e8f0' },
  { id: 'kraft', name: 'Kraft paperboard', farsiName: 'مقوای کرافت', defaultThickness: 0.55, colorHex: '#c89d6c', iconColor: '#b45309' },
  { id: 'flute_e', name: 'E-flute Corrugated', farsiName: 'کارتن ای فلوت ۱.۵ میل', defaultThickness: 1.5, colorHex: '#dfbe95', iconColor: '#d97706' },
  { id: 'flute_b', name: 'B-flute Corrugated', farsiName: 'کارتن بی فلوت ۳ میل', defaultThickness: 3.0, colorHex: '#be9364', iconColor: '#92400e' }
];

export default function DielineGeneratorView({ onTransferToOrder }) {
  // Mode: '2d_dieline' or '3d_studio'
  const [studioMode, setStudioMode] = useState('2d_dieline');

  // Navigation & Tabs in 2D Mode
  const [activeNavTab, setActiveNavTab] = useState('basic'); // 'models', 'basic', 'advanced', 'more'
  const [unitMode, setUnitMode] = useState('mm'); // 'mm' or 'in'

  // Model & Dimensions (Default matching Image-1 & Image-4)
  const [selectedModel, setSelectedModel] = useState('tuck_end');
  const [lengthMm, setLengthMm] = useState(120);
  const [widthMm, setWidthMm] = useState(60);
  const [heightMm, setHeightMm] = useState(160);

  // Material & Thickness
  const [selectedMaterial, setSelectedMaterial] = useState('350g_white');
  const [thicknessMm, setThicknessMm] = useState(0.5);

  // Size Mode: 'mfg' | 'inner' | 'outer'
  const [sizeMode, setSizeMode] = useState('mfg');

  // 3D Mockup Fold Slider (0 = Open, 1 = Close)
  const [mockupFold, setMockupFold] = useState(1);

  // Canvas interaction
  const [zoomScale, setZoomScale] = useState(1);
  const [activeCanvasTool, setActiveCanvasTool] = useState('select'); // 'select', 'pan'

  // Server Dieline CAD Data
  const [dielineData, setDielineData] = useState(null);
  const [loadingDieline, setLoadingDieline] = useState(false);

  // If in 3D Studio mode, render full 3D Modeling Studio directly
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

  // Unit conversion helpers
  const toDisplay = (valMm) => {
    if (unitMode === 'in') return (valMm / 25.4).toFixed(2);
    return Math.round(valMm);
  };

  const fromDisplay = (val) => {
    const num = parseFloat(val) || 0;
    if (unitMode === 'in') return num * 25.4;
    return num;
  };

  // Fetch / Compute Dieline from Backend Vector Engine
  const fetchDieline = async () => {
    try {
      setLoadingDieline(true);
      const res = await api.generateDieline({
        type: selectedModel,
        length: lengthMm,
        width: widthMm,
        height: heightMm,
        thickness: thicknessMm,
        size_mode: sizeMode,
        material_type: selectedMaterial
      });
      if (res.success) {
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

  // Dimension Triad Calculations (Exact Pacdora Formula)
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

  // Export Direct Functions
  const handleDownloadPdf = () => {
    const activeMatObj = MATERIALS.find((m) => m.id === selectedMaterial) || MATERIALS[0];
    exportDielineToPdf(dielineData, {
      modelName: MODELS.find((m) => m.id === selectedModel)?.name || 'Custom Dieline',
      length: lengthMm,
      width: widthMm,
      height: heightMm,
      thickness: thicknessMm,
      material: activeMatObj.farsiName,
      unit: unitMode
    });
  };

  const handleDownloadDxf = () => {
    const activeMatObj = MATERIALS.find((m) => m.id === selectedMaterial) || MATERIALS[0];
    exportDielineToDxf(dielineData, {
      modelName: MODELS.find((m) => m.id === selectedModel)?.name || 'Custom Dieline',
      length: lengthMm,
      width: widthMm,
      height: heightMm,
      thickness: thicknessMm,
      material: activeMatObj.name
    });
  };

  const handleDownloadAi = () => {
    if (!dielineData?.svg_content) return;
    const blob = new Blob([dielineData.svg_content], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pacdora-Dieline-${selectedModel}-${lengthMm}x${widthMm}x${heightMm}mm.ai`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const activeMat = MATERIALS.find((m) => m.id === selectedMaterial) || MATERIALS[0];

  return (
    <div className="w-full flex flex-col h-[calc(100vh-140px)] min-h-[750px] bg-[#111827] text-slate-100 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl select-none font-sans" dir="ltr">
      
      {/* ========================================================
          1. PACDORA TOP HEADER BAR (Exact Match with Image-1)
         ======================================================== */}
      <header className="h-14 px-4 bg-[#1f2937] border-b border-slate-700/80 flex items-center justify-between gap-4 z-20 flex-shrink-0">
        
        {/* Left: Pacdora Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              P
            </div>
            <span className="font-extrabold text-white text-base tracking-tight">pacdora</span>
          </div>
          <span className="text-slate-500 text-sm">/</span>
          <span className="text-slate-300 font-bold text-sm">Dieline generator</span>
        </div>

        {/* Center: Model Name and Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 text-slate-200 font-mono">
            Model #{MODELS.find((m) => m.id === selectedModel)?.pacdoraId || '100010'}
          </span>
          <span>{MODELS.find((m) => m.id === selectedModel)?.name}</span>
        </div>

        {/* Right: Design Online + Share + Download the Dieline (Yellow Crown Button) */}
        <div className="flex items-center gap-2.5">
          
          {/* Share Button */}
          <button
            type="button"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition border border-slate-700/60"
            title="اشتراک‌گذاری قالب"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          {/* Design Online Button -> Launches Full 3D Modeling Studio */}
          <button
            type="button"
            onClick={() => setStudioMode('3d_studio')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-sm border border-indigo-500"
            title="طراحی و رندرینگ سه‌بعدی آنلاین در استودیو Pacdora 3D"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Design Online</span>
            <ExternalLink className="w-3 h-3 text-indigo-200" />
          </button>

          {/* Yellow Crown Download Dieline Button (Exact Match) */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 transition shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Crown className="w-4 h-4 fill-slate-950" />
            <span>Download the dieline</span>
          </button>
        </div>
      </header>

      {/* ========================================================
          2. MAIN WORKSPACE (3-PANEL LAYOUT)
         ======================================================== */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ====================================================
            LEFT PANEL: ICON DOCK + PARAMETERS SIDEBAR
           ==================================================== */}
        <div className="w-80 lg:w-88 bg-[#1e293b] border-r border-slate-800 flex z-10 shadow-xl flex-shrink-0">
          
          {/* Vertical Icon Dock (Models / Basic / Advanced / More) */}
          <div className="w-16 bg-[#0f172a] border-r border-slate-800/80 flex flex-col items-center py-4 gap-4 flex-shrink-0">
            {[
              { id: 'models', label: 'Models', icon: Box },
              { id: 'basic', label: 'Basic', icon: Sliders },
              { id: 'advanced', label: 'Advanced', icon: Layers },
              { id: 'more', label: 'More', icon: Info }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveNavTab(tab.id)}
                  className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition ${
                    activeNavTab === tab.id
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  title={tab.label}
                >
                  <Icon className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Left Sub-sidebar (Parameters Form matching Image-4) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 text-left text-slate-200">
            
            {/* TAB: MODELS SELECTOR */}
            {activeNavTab === 'models' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Select Box Model</h3>
                <div className="space-y-2">
                  {MODELS.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedModel(m.id);
                        setLengthMm(m.defaultDim.l);
                        setWidthMm(m.defaultDim.w);
                        setHeightMm(m.defaultDim.h);
                        setActiveNavTab('basic');
                      }}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition ${
                        selectedModel === m.id
                          ? 'bg-indigo-950/60 border-amber-400 ring-2 ring-amber-400/20'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">{m.icon}</span>
                        <span className="text-[10px] font-mono text-slate-400">#{m.pacdoraId}</span>
                      </div>
                      <div className="text-xs font-black text-white">{m.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5" dir="rtl">{m.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: BASIC PARAMETERS (Exact Match with Image-4) */}
            {activeNavTab === 'basic' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                
                {/* Custom Size Header with mm / in Unit Switch */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Custom size</span>
                    {/* [ mm | in ] pill toggle */}
                    <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-700">
                      <button
                        type="button"
                        onClick={() => setUnitMode('mm')}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition ${
                          unitMode === 'mm' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        mm
                      </button>
                      <button
                        type="button"
                        onClick={() => setUnitMode('in')}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition ${
                          unitMode === 'in' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        in
                      </button>
                    </div>
                  </div>

                  {/* Length / Width / Height Inputs */}
                  <div className="space-y-2.5">
                    {/* Length */}
                    <div className="flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2">
                      <span className="text-xs font-semibold text-slate-400">Length</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step={unitMode === 'in' ? '0.1' : '1'}
                          value={toDisplay(lengthMm)}
                          onChange={(e) => setLengthMm(Math.max(10, fromDisplay(e.target.value)))}
                          className="w-20 bg-transparent text-right font-mono font-black text-sm text-amber-300 focus:outline-none"
                        />
                        <span className="text-xs text-slate-500 font-mono">{unitMode}</span>
                      </div>
                    </div>

                    {/* Width */}
                    <div className="flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2">
                      <span className="text-xs font-semibold text-slate-400">Width</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step={unitMode === 'in' ? '0.1' : '1'}
                          value={toDisplay(widthMm)}
                          onChange={(e) => setWidthMm(Math.max(10, fromDisplay(e.target.value)))}
                          className="w-20 bg-transparent text-right font-mono font-black text-sm text-amber-300 focus:outline-none"
                        />
                        <span className="text-xs text-slate-500 font-mono">{unitMode}</span>
                      </div>
                    </div>

                    {/* Height */}
                    <div className="flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2">
                      <span className="text-xs font-semibold text-slate-400">Height</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step={unitMode === 'in' ? '0.1' : '1'}
                          value={toDisplay(heightMm)}
                          onChange={(e) => setHeightMm(Math.max(10, fromDisplay(e.target.value)))}
                          className="w-20 bg-transparent text-right font-mono font-black text-sm text-amber-300 focus:outline-none"
                        />
                        <span className="text-xs text-slate-500 font-mono">{unitMode}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Choose Material Section */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300">Choose material</span>
                  
                  {/* Material Dropdown */}
                  <div className="relative">
                    <select
                      value={selectedMaterial}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedMaterial(val);
                        const mat = MATERIALS.find((m) => m.id === val);
                        if (mat) setThicknessMm(mat.defaultThickness);
                      }}
                      className="w-full appearance-none bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-indigo-500"
                    >
                      {MATERIALS.map((m) => (
                        <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                          {m.name} ({m.farsiName})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Thickness Stepper: [-] 0.5 [+] */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300">Thickness</span>
                  <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setThicknessMm((t) => Math.max(0.2, parseFloat((t - 0.1).toFixed(2))))}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 font-black transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-sm font-black text-white">{thicknessMm}</span>
                      <span className="text-xs text-slate-500 font-mono">{unitMode}</span>
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
                  <span className="text-xs font-bold text-slate-300">Size mode</span>
                  <div className="space-y-1.5">
                    {[
                      { id: 'mfg', label: 'Manufacture dimensions', desc: 'ابعاد خط تیغ ساخت' },
                      { id: 'inner', label: 'Inner dimensions', desc: 'ابعاد مفید داخل جعبه' },
                      { id: 'outer', label: 'Outer dimensions', desc: 'ابعاد فضای بیرونی' }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setSizeMode(mode.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition border flex items-center justify-between ${
                          sizeMode === mode.id
                            ? 'bg-indigo-600/30 text-white border-indigo-500 shadow-xs'
                            : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
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

            {/* TAB: ADVANCED / MORE */}
            {(activeNavTab === 'advanced' || activeNavTab === 'more') && (
              <div className="space-y-4 text-xs animate-in fade-in duration-150">
                <h3 className="font-bold text-slate-300">FEFCO / ECMA Standards</h3>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Generated dieline conforms to ISO 12647 prepress standards and AutoCAD R12 DXF specifications with dedicated CUT and CREASE laser layers.
                </p>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-[11px] text-amber-300">
                  Cut Length: {dielineData?.technical_matrix?.cut_perimeter_mm || 0} mm<br />
                  Crease Length: {dielineData?.technical_matrix?.crease_perimeter_mm || 0} mm<br />
                  Sheet Weight: ~{Math.round(dielineData?.technical_matrix?.blank_weight_g || 0)} g
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ====================================================
            CENTER 2D VECTOR CAD CANVAS (Exact Match with Image-3)
           ==================================================== */}
        <div className="flex-1 relative bg-[#0b0f19] flex flex-col items-center justify-center overflow-hidden">
          
          {/* Top Center Legend (Bleed, Trim, Crease - Exact Match) */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-800/90 px-4 py-1.5 rounded-2xl flex items-center gap-5 text-xs text-slate-300 backdrop-blur-md shadow-lg z-10">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-[#10b981]" />
              <span className="text-[11px] font-semibold text-emerald-400">Bleed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-[#3b82f6]" />
              <span className="text-[11px] font-semibold text-blue-400">Trim</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-t border-dashed border-[#ef4444]" />
              <span className="text-[11px] font-semibold text-rose-400">Crease</span>
            </div>
          </div>

          {/* Top Left Dimension Triad Overlay (Exact Match with Image-3) */}
          <div className="absolute top-4 left-4 bg-slate-900/95 border border-slate-800 p-3 rounded-2xl text-[11px] space-y-1 backdrop-blur-md shadow-xl z-10 font-mono">
            <div className="text-slate-200">
              <span className="text-slate-400 font-sans">Manufacture dimensions: </span>
              <strong className="text-white font-bold">{mfg.l} * {mfg.w} * {mfg.h} {unitMode}</strong>
            </div>
            <div className="text-slate-300">
              <span className="text-slate-400 font-sans">Inner dimensions: </span>
              <strong>{inner.l} * {inner.w} * {inner.h} {unitMode}</strong>
            </div>
            <div className="text-slate-300">
              <span className="text-slate-400 font-sans">Outer dimensions: </span>
              <strong>{outer.l} * {outer.w} * {outer.h} {unitMode}</strong>
            </div>
          </div>

          {/* SVG Vector Dieline Display Area */}
          <div
            className="w-full h-full flex items-center justify-center p-8 transition-transform duration-150 overflow-hidden cursor-crosshair"
            style={{ transform: `scale(${zoomScale})` }}
          >
            {loadingDieline ? (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <span className="text-xs">Generating parametric dieline vector...</span>
              </div>
            ) : dielineData?.svg_content ? (
              <div
                className="w-full max-w-[90%] max-h-[85%] flex items-center justify-center drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)]"
                dangerouslySetInnerHTML={{ __html: dielineData.svg_content }}
              />
            ) : null}
          </div>

          {/* Bottom Floating Canvas Toolbar (Cursor, Hand, Zoom, Reset - Exact Match) */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-slate-800 px-3 py-1.5 rounded-2xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-10">
            <button
              type="button"
              onClick={() => setActiveCanvasTool('select')}
              className={`p-2 rounded-xl text-xs transition ${
                activeCanvasTool === 'select' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Select / Cursor"
            >
              <MousePointer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveCanvasTool('pan')}
              className={`p-2 rounded-xl text-xs transition ${
                activeCanvasTool === 'pan' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Pan / Hand"
            >
              <Hand className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-slate-800 my-auto mx-1" />

            <button
              type="button"
              onClick={() => setZoomScale((z) => Math.min(2.5, z + 0.15))}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-slate-300 w-12 text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomScale((z) => Math.max(0.4, z - 0.15))}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomScale(1.0)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Reset Zoom"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* ====================================================
            RIGHT PANEL: 3D MINI MOCKUP + DOWNLOADS (Image-2)
           ==================================================== */}
        <div className="w-80 lg:w-92 bg-[#1e293b] border-l border-slate-800 flex flex-col p-4 overflow-y-auto space-y-5 z-10 text-left shadow-xl flex-shrink-0">
          
          {/* 3D Mini Mockup Widget Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-3 relative overflow-hidden shadow-inner">
            {/* Top Widget Bar */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">3D mockup preview</span>
              <button
                type="button"
                onClick={() => setStudioMode('3d_studio')}
                className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition"
              >
                <span>Full 3D Studio</span>
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>

            {/* Three.js Interactive Folding Box */}
            <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
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

            {/* Folding Slider: Open ---O--- Close (Exact Match with Image-2) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                <span>Open</span>
                <span className="font-mono text-amber-400">{Math.round(mockupFold * 100)}%</span>
                <span>Close</span>
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

          {/* File Formats Download Options (Image-2 Grid) */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-300">File formats</span>
            <div className="grid grid-cols-2 gap-2">
              
              {/* AI Format */}
              <button
                type="button"
                onClick={handleDownloadAi}
                className="p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-700/80 rounded-xl flex items-center gap-2.5 transition text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-black text-xs">
                  Ai
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-300">Ai dieline</div>
                  <div className="text-[10px] text-slate-400">Vector CAD</div>
                </div>
              </button>

              {/* PDF Format */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-700/80 rounded-xl flex items-center gap-2.5 transition text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-xs">
                  PDF
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-300">PDF dieline</div>
                  <div className="text-[10px] text-slate-400">Print Ready</div>
                </div>
              </button>

              {/* DXF Format (Laser Cutting) */}
              <button
                type="button"
                onClick={handleDownloadDxf}
                className="p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-700/80 rounded-xl flex items-center gap-2.5 transition text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-xs">
                  DXF
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-300">DXF dieline</div>
                  <div className="text-[10px] text-slate-400">AutoCAD R12</div>
                </div>
              </button>

              {/* 3D Mockup Launch */}
              <button
                type="button"
                onClick={() => setStudioMode('3d_studio')}
                className="p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-700/80 rounded-xl flex items-center gap-2.5 transition text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs">
                  3D
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-300">3D mockup</div>
                  <div className="text-[10px] text-slate-400">4K Studio</div>
                </div>
              </button>

            </div>
          </div>

          {/* You Will Get Bullet Points (Exact Match with Image-2) */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <span className="text-xs font-bold text-slate-300">You will get:</span>
            <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc list-inside">
              <li>Generates within seconds for immediate download</li>
              <li>Fully customizable with precise 1:1 scale specifications</li>
              <li>Exported vectors are watermark-free and editable in Adobe Illustrator</li>
              <li>Integrated technical matrix for die-making and sheet imposition</li>
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
