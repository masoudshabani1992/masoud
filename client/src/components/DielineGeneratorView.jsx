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
  RotateCw
} from 'lucide-react';
import { api } from '../api/client';
import Packaging3DMockup from './Packaging3DMockup';
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
  // Navigation & Tabs
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
  const [dielineData, setDielineData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Format Selection for Download
  const [activeFormat, setActiveFormat] = useState('pdf'); // 'ai', 'pdf', 'dxf', '3d'

  // Fetch / Generate Parametric Dieline
  const handleGenerateDieline = async () => {
    setLoading(true);
    try {
      const payload = {
        boxType: selectedModel,
        length: Number(lengthMm),
        width: Number(widthMm),
        height: Number(heightMm),
        materialId: selectedMaterial,
        customThickness: Number(thicknessMm),
        sizeMode: sizeMode
      };

      const res = await api.generateDielineMontage(payload);
      if (res.success) {
        setDielineData(res.dieline);
      }
    } catch (err) {
      console.error('Error generating dieline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerateDieline();
  }, [selectedModel, lengthMm, widthMm, heightMm, selectedMaterial, thicknessMm, sizeMode]);

  // Handle Stepper Thickness (+ / -)
  const handleStepThickness = (delta) => {
    setThicknessMm((prev) => {
      const nextVal = Math.max(0.1, Math.min(6.0, Math.round((prev + delta) * 100) / 100));
      return nextVal;
    });
  };

  // Switch Model
  const handleSelectModel = (modelId) => {
    setSelectedModel(modelId);
    const m = MODELS.find((item) => item.id === modelId);
    if (m) {
      setLengthMm(m.defaultDim.l);
      setWidthMm(m.defaultDim.w);
      setHeightMm(m.defaultDim.h);
    }
    setActiveNavTab('basic');
  };

  // Downloads
  const handleDownloadFile = async (format = activeFormat) => {
    if (!dielineData?.svg) return;
    setIsExporting(true);

    try {
      const currentModelObj = MODELS.find((m) => m.id === selectedModel) || MODELS[0];
      const currentMatObj = MATERIALS.find((m) => m.id === selectedMaterial) || MATERIALS[0];

      if (format === 'pdf') {
        await exportDielineToPdf({
          svgString: dielineData.svg,
          boxName: currentModelObj.name,
          boxCode: currentModelObj.pacdoraId,
          pacdoraId: currentModelObj.pacdoraId,
          dimensions: { l: lengthMm, w: widthMm, h: heightMm },
          thicknessMm: thicknessMm,
          materialName: currentMatObj.name,
          ruleCutMeters: dielineData.ruleLengthMeters?.cutRuleMeters || 1.6,
          ruleCreaseMeters: dielineData.ruleLengthMeters?.creaseRuleMeters || 1.8,
          flatWidthMm: dielineData.flatDimensions.flatWidthMm,
          flatHeightMm: dielineData.flatDimensions.flatHeightMm,
          filename: `Pacdora-Dieline-${selectedModel}-${lengthMm}x${widthMm}x${heightMm}mm.pdf`
        });
      } else if (format === 'dxf') {
        exportDielineToDxf({
          boxType: selectedModel,
          length: lengthMm,
          width: widthMm,
          height: heightMm,
          filename: `Pacdora-Dieline-${selectedModel}-${lengthMm}x${widthMm}x${heightMm}mm.dxf`
        });
      } else if (format === 'ai' || format === 'svg') {
        const blob = new Blob([dielineData.svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Pacdora-Dieline-${selectedModel}-${lengthMm}x${widthMm}x${heightMm}mm.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === '3d') {
        alert('موکاپ ۳ بعدی با ابعاد دقیق آماده است. جهت دانلود فایل سه‌بعدی از دکمه PDF یا SVG استفاده فرمایید.');
      }
    } catch (err) {
      alert('خطا در صدور فایل: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const currentModelObj = MODELS.find((m) => m.id === selectedModel) || MODELS[0];
  const currentMatObj = MATERIALS.find((m) => m.id === selectedMaterial) || MATERIALS[0];
  const triad = dielineData?.triadDimensions || {
    mfg: { l: lengthMm, w: widthMm, h: heightMm },
    inner: { l: lengthMm - 0.6, w: widthMm - 0.6, h: heightMm - 1.1 },
    outer: { l: lengthMm + 0.4, w: widthMm + 0.4, h: heightMm + 0.9 }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-95px)] min-h-[700px] w-full bg-[#f1f3f6] rounded-3xl overflow-hidden border border-slate-200 shadow-2xl select-none font-sans" dir="ltr">
      
      {/* 1. TOP HEADER BAR (Exact Match to Image-1) */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-20">
        {/* Left: Pacdora Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center text-white font-black text-sm shadow-md">
            P
          </div>
          <span className="font-bold text-sm text-slate-800 tracking-tight">Dieline generator</span>
          
          <div className="h-4 w-[1px] bg-slate-200 mx-1" />
          
          <button className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition" title="Menu">
            <Sliders className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Design Online + Share + Download the Dieline (Yellow Crown Button) */}
        <div className="flex items-center gap-2.5">
          {onTransferToOrder && dielineData && (
            <button
              type="button"
              onClick={() => onTransferToOrder({
                box_type: currentModelObj.name,
                box_structure: currentModelObj.pacdoraId,
                cardboard_length: dielineData.flatDimensions.flatWidthMm,
                cardboard_width: dielineData.flatDimensions.flatHeightMm,
                length: lengthMm / 10,
                width: widthMm / 10,
                height: heightMm / 10
              })}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-1.5 transition"
            >
              <span>ثبت سفارش در کارخانه</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5 transition"
          >
            <span>Design Online</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            type="button"
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleDownloadFile('pdf')}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 shadow-md shadow-amber-200 flex items-center gap-2 transition active:scale-95"
          >
            <Crown className="w-4 h-4 fill-amber-300 text-amber-300" />
            <span>{isExporting ? 'Generating...' : 'Download the dieline (PDF)'}</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN 3-PANEL STUDIO BODY */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFTMOST ICON DOCK + PARAMETER SIDEBAR (Exact Match to Image-4) */}
        <div className="w-80 bg-white border-r border-slate-200 flex shrink-0 shadow-sm z-10">
          
          {/* Vertical Icon Strip (Leftmost) */}
          <div className="w-16 border-r border-slate-100 flex flex-col items-center py-4 space-y-5 bg-slate-50/50 shrink-0">
            <button
              type="button"
              onClick={() => setActiveNavTab('models')}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold transition w-full py-2 ${
                activeNavTab === 'models' ? 'text-indigo-600 border-r-2 border-indigo-600 bg-white' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Box className="w-5 h-5" />
              <span>Models</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveNavTab('basic')}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold transition w-full py-2 ${
                activeNavTab === 'basic' ? 'text-blue-600 border-r-2 border-blue-600 bg-white font-black' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Sliders className="w-5 h-5 text-blue-600" />
              <span>Basic</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveNavTab('advanced')}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold transition w-full py-2 ${
                activeNavTab === 'advanced' ? 'text-indigo-600 border-r-2 border-indigo-600 bg-white' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Layers className="w-5 h-5" />
              <span>Advanced</span>
            </button>

            <div className="w-8 h-[1px] bg-slate-200 my-1" />

            <button
              type="button"
              onClick={() => setActiveNavTab('more')}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold transition w-full py-2 ${
                activeNavTab === 'more' ? 'text-indigo-600 border-r-2 border-indigo-600 bg-white' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <div className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center text-xs">⋯</div>
              <span>More</span>
            </button>
          </div>

          {/* Parameter Panel Body */}
          <div className="flex-1 p-5 overflow-y-auto space-y-6 text-slate-800">
            
            {/* TAB: BASIC (Exact Match to Image-4) */}
            {activeNavTab === 'basic' && (
              <div className="space-y-5">
                
                {/* 1. Custom Size Header + mm/in toggle */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-slate-900">Custom size</h3>
                      <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                    </div>

                    {/* mm / in Pill Toggle */}
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setUnitMode('mm')}
                        className={`px-2.5 py-0.5 rounded-md transition ${unitMode === 'mm' ? 'bg-blue-600 text-white font-black' : 'text-slate-600'}`}
                      >
                        mm
                      </button>
                      <button
                        type="button"
                        onClick={() => setUnitMode('in')}
                        className={`px-2.5 py-0.5 rounded-md transition ${unitMode === 'in' ? 'bg-blue-600 text-white font-black' : 'text-slate-600'}`}
                      >
                        in
                      </button>
                    </div>
                  </div>

                  {/* Length & Width Inputs */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium block mb-1">Length</span>
                      <div className="relative">
                        <input
                          type="number"
                          value={lengthMm}
                          onChange={(e) => setLengthMm(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
                        />
                        <span className="absolute right-3 top-2 text-[11px] text-slate-400">{unitMode}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 font-medium block mb-1">Width</span>
                      <div className="relative">
                        <input
                          type="number"
                          value={widthMm}
                          onChange={(e) => setWidthMm(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
                        />
                        <span className="absolute right-3 top-2 text-[11px] text-slate-400">{unitMode}</span>
                      </div>
                    </div>
                  </div>

                  {/* Height Input */}
                  <div className="text-xs">
                    <span className="text-slate-500 font-medium block mb-1">Height</span>
                    <div className="relative w-1/2 pr-1.5">
                      <input
                        type="number"
                        value={heightMm}
                        onChange={(e) => setHeightMm(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
                      />
                      <span className="absolute right-4 top-2 text-[11px] text-slate-400">{unitMode}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Choose Material */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-slate-900">Choose material</h3>
                    <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </div>

                  <div className="relative">
                    <select
                      value={selectedMaterial}
                      onChange={(e) => {
                        setSelectedMaterial(e.target.value);
                        const m = MATERIALS.find((mat) => mat.id === e.target.value);
                        if (m) setThicknessMm(m.defaultThickness);
                      }}
                      className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 pr-8 focus:outline-none focus:border-blue-500 shadow-xs cursor-pointer"
                    >
                      {MATERIALS.map((mat) => (
                        <option key={mat.id} value={mat.id}>
                          {mat.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* 3. Thickness Stepper */}
                <div className="space-y-2 pt-1">
                  <h3 className="font-bold text-sm text-slate-900">Thickness</h3>

                  <div className="flex items-center justify-between border border-slate-200 rounded-xl p-1 bg-white shadow-xs">
                    <button
                      type="button"
                      onClick={() => handleStepThickness(-0.05)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="font-bold text-xs text-slate-900 font-mono">
                      {thicknessMm.toFixed(2)} mm
                    </span>

                    <button
                      type="button"
                      onClick={() => handleStepThickness(+0.05)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 4. Size Mode Selector (Manufacture / Inner / Outer) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-slate-900">Size mode</h3>
                    <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setSizeMode('mfg')}
                        className={`p-2.5 rounded-xl text-center transition border font-bold ${
                          sizeMode === 'mfg'
                            ? 'border-blue-600 text-blue-700 bg-blue-50/50 shadow-xs'
                            : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                        }`}
                      >
                        Manufacture dimensions
                      </button>

                      <button
                        type="button"
                        onClick={() => setSizeMode('inner')}
                        className={`p-2.5 rounded-xl text-center transition border font-bold ${
                          sizeMode === 'inner'
                            ? 'border-blue-600 text-blue-700 bg-blue-50/50 shadow-xs'
                            : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                        }`}
                      >
                        Inner dimensions
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSizeMode('outer')}
                      className={`w-1/2 p-2.5 rounded-xl text-center transition border font-bold text-xs ${
                        sizeMode === 'outer'
                          ? 'border-blue-600 text-blue-700 bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                      }`}
                    >
                      Outer dimensions
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: MODELS */}
            {activeNavTab === 'models' && (
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900">Pacdora Standard Models</h3>
                <div className="space-y-2">
                  {MODELS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectModel(m.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                        selectedModel === m.id ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{m.icon}</span>
                        <div>
                          <div className="text-xs font-bold leading-tight">{m.name}</div>
                          <div className="text-[10px] text-slate-400">{m.desc}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">#{m.pacdoraId}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: ADVANCED */}
            {activeNavTab === 'advanced' && (
              <div className="space-y-4 text-xs">
                <h3 className="font-bold text-sm text-slate-900">Advanced Geometry Parameters</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Glue flap width (لب‌چسب)</label>
                    <input type="number" defaultValue={15} className="w-full p-2 border rounded-lg bg-white" />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Bleed margin (مارجین بلید)</label>
                    <input type="number" defaultValue={3} className="w-full p-2 border rounded-lg bg-white" />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Crease compensation (ضریب خمش K)</label>
                    <input type="number" step="0.1" defaultValue={0.4} className="w-full p-2 border rounded-lg bg-white" />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: MORE */}
            {activeNavTab === 'more' && (
              <div className="space-y-3 text-xs text-slate-600">
                <h3 className="font-bold text-sm text-slate-900">About Pacdora Dieline Studio</h3>
                <p>
                  این استودیو با استفاده از دقیق‌ترین فرمول‌های هندسی و استانداردهای بین‌المللی ECMA و FEFCO، نقشه‌های خط تیغ مقیاس ۱:۱ جهت برش لیزر و لیتوگرافی تولید می‌کند.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* CENTER: 2D INTERACTIVE CAD CANVAS (Exact Match to Image-1 & Image-3) */}
        <div className="flex-1 bg-[#f8fafc] flex flex-col relative overflow-hidden">
          
          {/* Main SVG Vector Canvas */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            {dielineData ? (
              <div
                className="transition-transform duration-150 drop-shadow-sm"
                style={{ transform: `scale(${zoomScale})` }}
                dangerouslySetInnerHTML={{ __html: dielineData.svg }}
              />
            ) : (
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating CAD dieline...</span>
              </div>
            )}
          </div>

          {/* BOTTOM FLOATING CANVAS TOOLBAR (Exact Match to Image-1 & Image-3) */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl px-3 py-1.5 shadow-xl flex items-center gap-2 z-10">
            <button
              type="button"
              onClick={() => setActiveCanvasTool('select')}
              className={`p-1.5 rounded-xl transition ${activeCanvasTool === 'select' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-700'}`}
              title="Select"
            >
              <MousePointer className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setActiveCanvasTool('pan')}
              className={`p-1.5 rounded-xl transition ${activeCanvasTool === 'pan' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-700'}`}
              title="Pan"
            >
              <Hand className="w-4 h-4" />
            </button>

            <div className="h-4 w-[1px] bg-slate-200 mx-0.5" />

            <button
              type="button"
              onClick={() => setZoomScale((z) => Math.min(2.5, z + 0.15))}
              className="p-1.5 text-slate-500 hover:text-slate-900 transition"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setZoomScale((z) => Math.max(0.4, z - 0.15))}
              className="p-1.5 text-slate-500 hover:text-slate-900 transition"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="h-4 w-[1px] bg-slate-200 mx-0.5" />

            <button
              type="button"
              className="p-1.5 text-slate-500 hover:text-slate-900 transition"
              title="Measure"
            >
              <PenTool className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setZoomScale(1)}
              className="p-1.5 text-slate-500 hover:text-slate-900 transition text-[10px] font-mono font-bold"
              title="Reset Zoom"
            >
              {Math.round(zoomScale * 100)}%
            </button>
          </div>
        </div>

        {/* RIGHT SIDEBAR: 3D MINI MOCKUP + FILE FORMATS (Exact Match to Image-1 & Image-2) */}
        <div className="w-72 bg-white border-l border-slate-200 p-4 flex flex-col justify-between shrink-0 overflow-y-auto space-y-4 shadow-sm z-10">
          
          <div className="space-y-4">
            {/* 1. 3D Mini Mockup Widget (Exact Match to Image-2) */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-inner h-56 flex flex-col justify-between p-2.5">
              
              {/* 3D Watermark Tag */}
              <div className="absolute top-2.5 right-2.5 bg-white/80 backdrop-blur-xs p-1 rounded-lg border border-slate-200 shadow-xs text-[10px] font-black text-slate-700 flex items-center gap-1 z-10">
                <span>3D</span>
                <RotateCw className="w-2.5 h-2.5" />
              </div>

              {/* Real-time 3D WebGL Canvas */}
              <div className="w-full flex-1">
                <Packaging3DMockup
                  boxType={selectedModel}
                  length={lengthMm}
                  width={widthMm}
                  height={heightMm}
                  thickness={thicknessMm}
                  materialColor={currentMatObj.colorHex}
                  foldAngle={mockupFold}
                />
              </div>

              {/* Open -------O------- Close Slider (Exact Match to Image-2) */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl px-3 py-1.5 shadow-md flex items-center justify-between gap-2 z-10">
                <span className="text-[11px] font-bold text-slate-700">Open</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={mockupFold}
                  onChange={(e) => setMockupFold(parseFloat(e.target.value))}
                  className="w-24 accent-slate-900 cursor-pointer h-1 bg-slate-200 rounded-lg"
                />
                <span className="text-[11px] font-bold text-slate-400">Close</span>
              </div>
            </div>

            {/* 2. File Formats Section (Exact Match to Image-1) */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-xs text-slate-800">File formats</h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* AI */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveFormat('ai');
                    handleDownloadFile('ai');
                  }}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${
                    activeFormat === 'ai' ? 'border-blue-600 bg-blue-50/40 text-blue-900 font-bold' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-6 h-6 rounded-md bg-amber-800 text-amber-200 font-black text-[10px] flex items-center justify-center">Ai</span>
                  <span className="text-[11px]">AI dieline</span>
                </button>

                {/* PDF (Selected Red Badge) */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveFormat('pdf');
                    handleDownloadFile('pdf');
                  }}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${
                    activeFormat === 'pdf' ? 'border-blue-600 bg-blue-50/40 text-blue-900 font-black shadow-xs ring-1 ring-blue-500/20' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-6 h-6 rounded-md bg-rose-600 text-white font-black text-[10px] flex items-center justify-center">PDF</span>
                  <span className="text-[11px]">PDF dieline</span>
                </button>

                {/* DXF */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveFormat('dxf');
                    handleDownloadFile('dxf');
                  }}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${
                    activeFormat === 'dxf' ? 'border-blue-600 bg-blue-50/40 text-blue-900 font-bold' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-200 font-black text-[9px] flex items-center justify-center">DXF</span>
                  <span className="text-[11px]">DXF dieline</span>
                </button>

                {/* 3D mockup */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveFormat('3d');
                    handleDownloadFile('3d');
                  }}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${
                    activeFormat === '3d' ? 'border-blue-600 bg-blue-50/40 text-blue-900 font-bold' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-6 h-6 rounded-md bg-emerald-600 text-white font-black text-[9px] flex items-center justify-center">JPG</span>
                  <span className="text-[11px]">3D mockup</span>
                </button>
              </div>
            </div>

            {/* 3. You will get Section (Exact Match to Image-1) */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
              <h4 className="font-bold text-xs text-slate-800">You will get</h4>
              <ul className="space-y-1.5 list-disc list-inside leading-relaxed text-slate-500">
                <li>All dieline files can be generated and downloaded within a few minutes.</li>
                <li>All dieline files are rigorously structurally inspected. Dimensions, thickness, and material descriptions are included. Ready for printing.</li>
                <li>All dieline files are without watermarks and can be locally edited using Adobe Illustrator.</li>
              </ul>
            </div>
          </div>

          {/* Quick PDF Direct Action */}
          <button
            type="button"
            onClick={() => handleDownloadFile('pdf')}
            disabled={isExporting}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95"
          >
            {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>دانلود فوری PDF خط تیغ</span>
          </button>
        </div>

      </div>
    </div>
  );
}
