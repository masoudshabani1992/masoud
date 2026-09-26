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
  FileCheck,
  Search,
  Grid,
  Filter
} from 'lucide-react';
import { api } from '../api/client';
import Packaging3DMockup from './Packaging3DMockup';
import Packaging3DStudioView from './Packaging3DStudioView';
import { exportDielineToPdf } from '../utils/pdfExport';
import { exportDielineToDxf } from '../utils/dxfExport';
import { exportDielineToAi } from '../utils/aiExport';
import { exportDielineToCdr } from '../utils/cdrExport';

const MODEL_CATEGORIES = [
  { id: 'all', name: 'همه مدل‌ها (۲۲)', icon: '✨' },
  { id: 'folding', name: 'دارویی و بهداشتی (ECMA)', icon: '💊' },
  { id: 'corrugated', name: 'پستی و کارتن مادر (FEFCO)', icon: '🚚' },
  { id: 'rigid', name: 'هاردباکس لوکس', icon: '🎁' },
  { id: 'food', name: 'غذا و شیرینی', icon: '🍰' },
  { id: 'special', name: 'خاص و استند', icon: '🏬' }
];

const MODELS = [
  // 1. Folding Cartons (ECMA)
  { id: 'tuck_end', category: 'folding', pacdoraId: '100010', standard: 'ECMA A20.20', name: 'جعبه دارویی دو طرف درب هماهنگ (STE)', desc: 'درب و زبانه‌های قفل هم‌جهت دارویی و بهداشتی', icon: '💊', defaultDim: { l: 120, w: 60, h: 160 } },
  { id: 'reverse_tuck', category: 'folding', pacdoraId: '100020', standard: 'ECMA A20.40', name: 'جعبه دارویی دو طرف درب معکوس (RTE)', desc: 'درب بالا و پایین در جهت‌های مخالف هم', icon: '💄', defaultDim: { l: 100, w: 50, h: 140 } },
  { id: 'snap_lock_bottom', category: 'folding', pacdoraId: '100030', standard: 'ECMA A50.20', name: 'جعبه قفل زیرین چفتی ۱-۲-۳ (Snap Lock)', desc: 'کفی مقاوم چفتی ۱-۲-۳ دستی بدون نیاز به چسب', icon: '🔒', defaultDim: { l: 140, w: 80, h: 180 } },
  { id: 'auto_bottom', category: 'folding', pacdoraId: '100040', standard: 'ECMA A55.20', name: 'جعبه کفی قفلی اتوماتیک (Crash Lock)', desc: 'کف‌چسب اتوماتیک سرعت بالا در خطوط بسته‌بندی', icon: '⚡', defaultDim: { l: 130, w: 75, h: 170 } },
  { id: 'hanging_tab', category: 'folding', pacdoraId: '100050', standard: 'ECMA F10.02', name: 'جعبه آویزدار رگالی سوراخ یوروپانچ (Euro Tab)', desc: 'زبانه آویز دارویی و سوپرمارکتی استاندارد', icon: '🏷️', defaultDim: { l: 90, w: 40, h: 130 } },

  // 2. Corrugated & Mailers (FEFCO)
  { id: 'mailer', category: 'corrugated', pacdoraId: '150010', standard: 'FEFCO 0427', name: 'کارتن پستی کیبوردی قفل‌دار (FEFCO 0427)', desc: 'محبوب‌ترین کارتن پستی، تجارت الکترونیک و ارسال کالا', icon: '📦', defaultDim: { l: 220, w: 160, h: 60 } },
  { id: 'roll_end_tuck_top', category: 'corrugated', pacdoraId: '150020', standard: 'FEFCO 0426', name: 'جعبه کیبوردی درب از بالا (RETT)', desc: 'دیواره دوبل بدون چسب با استحکام بالا', icon: '📬', defaultDim: { l: 200, w: 140, h: 50 } },
  { id: 'american', category: 'corrugated', pacdoraId: '150030', standard: 'FEFCO 0201', name: 'کارتن مادر ۴ درب استاندارد (RSC 0201)', desc: 'کارتن حمل و نقل استاندارد خطوط تولید صنایع', icon: '🏭', defaultDim: { l: 350, w: 250, h: 280 } },
  { id: 'hsc', category: 'corrugated', pacdoraId: '150040', standard: 'FEFCO 0200', name: 'کارتن نیمه‌درب باز بدون درب بالا (HSC 0200)', desc: 'کارتن سورتینگ انبار و جابجایی کارگاهی', icon: '📦', defaultDim: { l: 300, w: 200, h: 220 } },
  { id: 'full_overlap', category: 'corrugated', pacdoraId: '150050', standard: 'FEFCO 0203', name: 'کارتن با درب‌های اورلب کامل (FOL 0203)', desc: 'مقاومت فشاری فوق‌العاده بالا برای محصولات سنگین', icon: '🛡️', defaultDim: { l: 320, w: 220, h: 240 } },
  { id: 'pizza_box', category: 'corrugated', pacdoraId: '150060', standard: 'FEFCO 0421', name: 'جعبه پیتزا کیبوردی با منافذ بخار و تهویه', desc: 'قالب اختصاصی فست‌فود و پیتزای استاندارد', icon: '🍕', defaultDim: { l: 320, w: 320, h: 45 } },

  // 3. Rigid & Luxury Gift Boxes
  { id: 'rigid_box', category: 'rigid', pacdoraId: '180010', standard: 'RIGID 01', name: 'هاردباکس لوکس دو تکه (کف و درب جدا)', desc: 'جعبه هدیه، طلا، عطر و ادکلن با مقوای کرجی سخت', icon: '🎁', defaultDim: { l: 200, w: 140, h: 60 } },
  { id: 'sleeve_box', category: 'rigid', pacdoraId: '180020', standard: 'ECMA D20.20', name: 'جعبه کشویی کبریتی (غلاف و کشو)', desc: 'جعبه دولایه فانتزی با کشوی روان داخلی', icon: '🗂️', defaultDim: { l: 180, w: 100, h: 45 } },
  { id: 'book_style', category: 'rigid', pacdoraId: '180030', standard: 'RIGID 02', name: 'هاردباکس کتابی با درب مگنتی آهنربایی', desc: 'جعبه کتابی نفیس سررسید، قرآن و هدایای مدیران', icon: '📖', defaultDim: { l: 220, w: 150, h: 55 } },

  // 4. Food & Fast Food
  { id: 'gable_top', category: 'food', pacdoraId: '190010', standard: 'FOOD 01', name: 'جعبه دسته‌دار شیرینی و سوغات (Gable Top)', desc: 'جعبه دسته‌دار قفل سرخود مناسب کیک و شیرینی', icon: '🧁', defaultDim: { l: 180, w: 120, h: 160 } },
  { id: 'cake_box', category: 'food', pacdoraId: '190020', standard: 'FOOD 02', name: 'جعبه کیک و شیرینی ۴ گوش با پنجره طلق', desc: 'کفی و درب پنجره‌دار شفاف برای ویترین قنادی', icon: '🎂', defaultDim: { l: 240, w: 240, h: 120 } },
  { id: 'french_fry_box', category: 'food', pacdoraId: '190030', standard: 'FOOD 03', name: 'پاکت هلالی سیب‌زمینی و فست‌فود', desc: 'پاکت مخروطی ارگونومیک با قفل کف اتومات', icon: '🍟', defaultDim: { l: 110, w: 50, h: 130 } },

  // 5. Specialty, Novelty & Displays
  { id: 'pillow_box', category: 'special', pacdoraId: '200010', standard: 'NOVELTY 01', name: 'جعبه بالشتی فانتزی (Pillow Box)', desc: 'جعبه قوس‌دار فانتزی روسری، شال، صابون و بدلیجات', icon: '🎀', defaultDim: { l: 160, w: 110, h: 35 } },
  { id: 'hexagon_box', category: 'special', pacdoraId: '200020', standard: 'NOVELTY 02', name: 'جعبه شش‌ضلعی لوکس قنادی و عطر', desc: 'جعبه ۶ ضلعی هندسی خاص با درب سرخود', icon: '⬡', defaultDim: { l: 120, w: 120, h: 150 } },
  { id: 'triangular_box', category: 'special', pacdoraId: '200030', standard: 'NOVELTY 03', name: 'جعبه منشوری سه‌گوش شکلات و اسنک', desc: 'طراحی ۳ ضلعی متمایز برای قفسه‌های فروشگاهی', icon: '📐', defaultDim: { l: 140, w: 100, h: 180 } },
  { id: 'counter_display', category: 'special', pacdoraId: '210010', standard: 'DISPLAY 01', name: 'استند پیشخوان نمایشگاهی پرفراژدار (POP Display)', desc: 'جعبه حمل تبدیل‌شونده به استند رومیزی فروشگاهی', icon: '🏬', defaultDim: { l: 250, w: 180, h: 200 } },
  { id: 'four_corner_tray', category: 'special', pacdoraId: '210020', standard: 'TRAY 01', name: 'سینی ۴ گوش تاشو بدون چسب (Four Corner Tray)', desc: 'سینی کفی تاشو با گوشواره‌های چفتی دوبل', icon: '📥', defaultDim: { l: 260, w: 180, h: 70 } }
];

const MATERIALS = [
  { id: '350g_white', name: 'ایندربرد ۳۵۰ گرم (FBB)', defaultThickness: 0.5, colorHex: '#ffffff', farsiName: 'ایندربرد ۳۵۰ گرم' },
  { id: '300g_white', name: 'ایندربرد ۳۰۰ گرم (FBB)', defaultThickness: 0.42, colorHex: '#fafafa', farsiName: 'ایندربرد ۳۰۰ گرم' },
  { id: '250g_duplex', name: 'پشت طوسی ۲۵۰ گرم (Duplex)', defaultThickness: 0.45, colorHex: '#f1f1ed', farsiName: 'پشت طوسی ۲۵۰ گرم' },
  { id: 'kraft', name: 'مقوای کرافت قهوه‌ای (Kraft)', defaultThickness: 0.55, colorHex: '#c89d6c', farsiName: 'مقوای کرافت' },
  { id: 'e_flute', name: 'کارتن سه لایه E-Flute (ای فلوت ۱.۵mm)', defaultThickness: 1.5, colorHex: '#e5d0ba', farsiName: 'کارتن E-Flute' },
  { id: 'b_flute', name: 'کارتن سه لایه B-Flute (بی فلوت ۳.۰mm)', defaultThickness: 3.0, colorHex: '#d8c2a7', farsiName: 'کارتن B-Flute' },
  { id: 'c_flute', name: 'کارتن سه لایه C-Flute (سی فلوت ۴.۰mm)', defaultThickness: 4.0, colorHex: '#cfb799', farsiName: 'کارتن C-Flute' }
];

export default function DielineGeneratorView({ onTransferToOrder }) {
  // Navigation View Mode: '2d_dieline' or '3d_studio'
  const [studioMode, setStudioMode] = useState('2d_dieline');

  // Sidebar Sub-tab: 'basic' (Dimensions & Mockup) | 'models' (All 22 Models) | 'specs' (Sheet Specs)
  const [activeNavTab, setActiveNavTab] = useState('basic');

  // Selected Packaging Box Model
  const [selectedModel, setSelectedModel] = useState('tuck_end');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Primary Box Dimensions (mm)
  const [lengthMm, setLengthMm] = useState(120);
  const [widthMm, setWidthMm] = useState(60);
  const [heightMm, setHeightMm] = useState(160);

  // Text inputs for free typing
  const [inputL, setInputL] = useState('120');
  const [inputW, setInputW] = useState('60');
  const [inputH, setInputH] = useState('160');

  // Material & Caliper Thickness (mm)
  const [selectedMaterial, setSelectedMaterial] = useState('350g_white');
  const [thicknessMm, setThicknessMm] = useState(0.5);

  // Size Mode: 'mfg' (ابعاد ساخت) | 'inner' (ابعاد داخلی) | 'outer' (ابعاد بیرونی)
  const [sizeMode, setSizeMode] = useState('mfg');

  // 3D Mockup Fold Slider (0 = Flat, 1 = Folded)
  const [mockupFold, setMockupFold] = useState(1.0);

  // Canvas zoom, pan, and tools
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [activeCanvasTool, setActiveCanvasTool] = useState('select'); // 'select', 'pan'

  // Server Dieline CAD Vector State
  const [dielineData, setDielineData] = useState(null);
  const [loadingDieline, setLoadingDieline] = useState(false);

  // Active Model Object
  const activeModel = MODELS.find((m) => m.id === selectedModel) || MODELS[0];
  const activeMat = MATERIALS.find((m) => m.id === selectedMaterial) || MATERIALS[0];

  // Fetch Dieline SVG from Server Engine
  const fetchDielineVector = async () => {
    try {
      setLoadingDieline(true);
      const res = await api.generateDieline({
        model: selectedModel,
        length: lengthMm,
        width: widthMm,
        height: heightMm,
        thickness: thicknessMm,
        material: selectedMaterial,
        sizeMode: sizeMode,
        includeDimensions: true,
        includeBleed: true
      });
      if (res && (res.svg_content || res.svg)) {
        setDielineData(res);
      }
    } catch (err) {
      console.error('Error generating dieline CAD vector:', err);
    } finally {
      setLoadingDieline(false);
    }
  };

  useEffect(() => {
    fetchDielineVector();
  }, [selectedModel, lengthMm, widthMm, heightMm, thicknessMm, selectedMaterial, sizeMode]);

  // Model Selection Handler
  const handleSelectModel = (model) => {
    setSelectedModel(model.id);
    if (model.defaultDim) {
      setLengthMm(model.defaultDim.l);
      setWidthMm(model.defaultDim.w);
      setHeightMm(model.defaultDim.h);
      setInputL(String(model.defaultDim.l));
      setInputW(String(model.defaultDim.w));
      setInputH(String(model.defaultDim.h));
    }
    setActiveNavTab('basic');
  };

  // Canvas Pan Handlers
  const handleMouseDown = (e) => {
    if (activeCanvasTool === 'pan') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning && activeCanvasTool === 'pan') {
      setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleResetView = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Exporters
  const handleDownloadCdr = async () => {
    await exportDielineToCdr(dielineData, {
      modelName: activeModel.name,
      length: lengthMm,
      width: widthMm,
      height: heightMm,
      thickness: thicknessMm,
      material: activeMat.farsiName
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

  const handleDownloadDxf = () => {
    exportDielineToDxf(dielineData, {
      modelName: activeModel.name,
      length: lengthMm,
      width: widthMm,
      height: heightMm,
      thickness: thicknessMm,
      material: activeMat.farsiName
    });
  };

  const handleDownloadPdf = async () => {
    if (!dielineData) return;
    await exportDielineToPdf({
      svgString: dielineData.svg_content || dielineData.svg,
      boxName: activeModel.name,
      boxCode: activeModel.standard,
      pacdoraId: activeModel.pacdoraId,
      dimensions: { l: lengthMm, w: widthMm, h: heightMm },
      thicknessMm: thicknessMm,
      materialName: activeMat.farsiName,
      ruleCutMeters: dielineData.totalCutMm ? (dielineData.totalCutMm / 1000).toFixed(2) : 1.5,
      ruleCreaseMeters: dielineData.totalCreaseMm ? (dielineData.totalCreaseMm / 1000).toFixed(2) : 2.0,
      flatWidthMm: dielineData.flatDimensions?.flatWidthMm || 380,
      flatHeightMm: dielineData.flatDimensions?.flatHeightMm || 390,
      filename: `استودیو-امیران-${activeModel.name}-${lengthMm}x${widthMm}x${heightMm}mm.pdf`
    });
  };

  const handleDownloadSvg = () => {
    const svgCode = dielineData?.svg_content || dielineData?.svg;
    if (!svgCode) return;
    const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `استودیو-امیران-${activeModel.name}-${lengthMm}x${widthMm}x${heightMm}mm.svg`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const filteredModels = MODELS.filter((m) => {
    const matchCat = selectedCategory === 'all' || m.category === selectedCategory;
    const matchSearch =
      !searchQuery ||
      m.name.includes(searchQuery) ||
      m.desc.includes(searchQuery) ||
      m.pacdoraId.includes(searchQuery) ||
      m.standard.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Render Full 3D Studio if active
  if (studioMode === '3d_studio') {
    return (
      <Packaging3DStudioView
        initialBoxSpecs={{
          modelId: selectedModel,
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
    <div className="flex flex-col h-full max-h-full bg-slate-950 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl font-sans" dir="rtl">
      
      {/* 1. Studio Compact Top Bar (Single Line) */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between flex-shrink-0 z-20">
        
        {/* Left: Studio Title & Mode Switcher */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-amber-500/20">
              <Box className="w-4 h-4" />
            </div>
            <span className="font-black text-xs sm:text-sm text-white tracking-tight">استودیو طراحی امیران</span>
          </div>

          <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* 2D / 3D Navigation Switcher */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setStudioMode('2d_dieline')}
              className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1.5 ${
                studioMode === '2d_dieline'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>نقشه ۲ بعدی</span>
            </button>
            <button
              onClick={() => setStudioMode('3d_studio')}
              className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1.5 ${
                studioMode === '3d_studio'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>استودیو ۳ بعدی</span>
            </button>
          </div>
        </div>

        {/* Right: Quick Action & Download Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          
          {/* Download CDR (CorelDRAW) */}
          <button
            type="button"
            onClick={handleDownloadCdr}
            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-black transition active:scale-95 shadow-xs"
            title="دانلود فایل وکتور CorelDRAW با پسوند .CDR و هیرلاین ۰.۰۷۶mm برای لیزر"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>کرل‌دراو CDR</span>
          </button>

          {/* Download AI (Illustrator) */}
          <button
            type="button"
            onClick={handleDownloadAi}
            className="flex items-center gap-1 px-2.5 py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg text-xs font-bold transition active:scale-95"
            title="دانلود فایل وکتور Adobe Illustrator با تفکیک لایه‌ها"
          >
            <Download className="w-3.5 h-3.5" />
            <span>وکتور AI</span>
          </button>

          {/* Download DXF */}
          <button
            type="button"
            onClick={handleDownloadDxf}
            className="flex items-center gap-1 px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-bold transition active:scale-95"
            title="دانلود فایل اتوکد AutoCAD R12 DXF برای لیزر"
          >
            <Download className="w-3.5 h-3.5" />
            <span>اتوکد DXF</span>
          </button>

          {/* Download PDF */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex items-center gap-1 px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold transition active:scale-95"
            title="دانلود فایل PDF وکتور با شناسنامه صنعتی"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>

          {/* Download SVG */}
          <button
            type="button"
            onClick={handleDownloadSvg}
            className="flex items-center gap-1 px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-bold transition active:scale-95"
            title="دانلود فایل SVG"
          >
            <Download className="w-3.5 h-3.5" />
            <span>SVG</span>
          </button>

          {/* Transfer to Order Form */}
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
              className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-lg text-xs font-black shadow-md shadow-amber-500/20 transition active:scale-95 mr-1"
            >
              <span>ثبت سفارش</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Studio Workspace (Split 2-Column: Compact Left Dock + 2D CAD Canvas) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* ================= LEFT SIDEBAR (COMPACT SINGLE SCREEN) ================= */}
        <div className="w-80 lg:w-84 bg-slate-900 border-l border-slate-800 flex flex-col z-10 shadow-xl flex-shrink-0 overflow-hidden">
          
          {/* Top Mini Dock Tabs */}
          <div className="p-2 border-b border-slate-800 bg-slate-950 flex items-center gap-1">
            {[
              { id: 'basic', label: 'ابعاد و ماکاپ', icon: Sliders },
              { id: 'models', label: 'مدل‌ها (۲۲)', icon: Box },
              { id: 'specs', label: 'مشخصات شیت', icon: Layers }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveNavTab(tab.id)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeNavTab === tab.id
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Area (Fits perfectly on screen) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-right text-slate-200">
            
            {/* ================= TAB 1: BASIC (DIMENSIONS + COMPACT 3D MOCKUP) ================= */}
            {activeNavTab === 'basic' && (
              <div className="space-y-2.5 animate-in fade-in duration-150 text-xs">
                
                {/* 1. Active Model Chip */}
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{activeModel.icon}</span>
                    <div className="truncate">
                      <span className="text-xs font-bold text-white block truncate">{activeModel.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{activeModel.standard} | #{activeModel.pacdoraId}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveNavTab('models')}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 shrink-0"
                  >
                    تغییر
                  </button>
                </div>

                {/* 2. Dimensions Grid (Length, Width, Height in 3 Columns) */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-300">ابعاد جعبه (میلی‌متر)</span>
                    <span className="font-mono text-[10px] text-amber-400">L × W × H</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {/* Length */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block text-center">طول (L)</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={inputL}
                        onChange={(e) => {
                          setInputL(e.target.value);
                          const n = parseInt(e.target.value);
                          if (!isNaN(n) && n > 0) setLengthMm(n);
                        }}
                        onBlur={() => {
                          const n = parseInt(inputL);
                          if (isNaN(n) || n <= 0) setInputL(String(lengthMm));
                          else setLengthMm(n);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1 text-center font-mono font-bold text-amber-400 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Width */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block text-center">عرض (W)</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={inputW}
                        onChange={(e) => {
                          setInputW(e.target.value);
                          const n = parseInt(e.target.value);
                          if (!isNaN(n) && n > 0) setWidthMm(n);
                        }}
                        onBlur={() => {
                          const n = parseInt(inputW);
                          if (isNaN(n) || n <= 0) setInputW(String(widthMm));
                          else setWidthMm(n);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1 text-center font-mono font-bold text-amber-400 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Height */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block text-center">ارتفاع (H)</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={inputH}
                        onChange={(e) => {
                          setInputH(e.target.value);
                          const n = parseInt(e.target.value);
                          if (!isNaN(n) && n > 0) setHeightMm(n);
                        }}
                        onBlur={() => {
                          const n = parseInt(inputH);
                          if (isNaN(n) || n <= 0) setInputH(String(heightMm));
                          else setHeightMm(n);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1 text-center font-mono font-bold text-amber-400 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Material & Caliper Stepper */}
                <div className="grid grid-cols-2 gap-1.5">
                  {/* Material Dropdown */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block">جنس مقوا:</span>
                    <select
                      value={selectedMaterial}
                      onChange={(e) => {
                        setSelectedMaterial(e.target.value);
                        const m = MATERIALS.find((mat) => mat.id === e.target.value);
                        if (m) setThicknessMm(m.defaultThickness);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-200 focus:outline-none focus:border-amber-400 truncate"
                    >
                      {MATERIALS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Thickness Stepper */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block">ضخامت (mm):</span>
                    <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg px-2 py-0.5">
                      <button
                        onClick={() => setThicknessMm(Math.max(0.2, Math.round((thicknessMm - 0.1) * 10) / 10))}
                        className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white text-xs"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {thicknessMm.toFixed(1)}
                      </span>
                      <button
                        onClick={() => setThicknessMm(Math.min(5.0, Math.round((thicknessMm + 0.1) * 10) / 10))}
                        className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Dimension Mode Pills (Mfg / Inner / Outer) */}
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-center">
                  {[
                    { id: 'mfg', label: 'ابعاد ساخت' },
                    { id: 'inner', label: 'داخلی' },
                    { id: 'outer', label: 'خارجی' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setSizeMode(mode.id)}
                      className={`py-1 rounded-lg text-[10px] font-bold transition ${
                        sizeMode === mode.id
                          ? 'bg-indigo-600 text-white shadow-xs font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {/* 5. Compact 3D Mini Mockup with Fold Presets */}
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="w-full h-28 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shadow-inner">
                    <Packaging3DMockup
                      boxType={selectedModel}
                      length={lengthMm}
                      width={widthMm}
                      height={heightMm}
                      thickness={thicknessMm}
                      materialColor={activeMat.colorHex}
                      foldAngle={mockupFold}
                      isRotating={true}
                    />
                  </div>

                  {/* Fold Quick Buttons */}
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => setMockupFold(0)}
                      className={`py-1 rounded-md text-[10px] font-bold transition ${
                        mockupFold === 0 ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      شیت تخت (۰٪)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMockupFold(0.5)}
                      className={`py-1 rounded-md text-[10px] font-bold transition ${
                        mockupFold === 0.5 ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      ۵۰٪ مونتاژ
                    </button>
                    <button
                      type="button"
                      onClick={() => setMockupFold(1.0)}
                      className={`py-1 rounded-md text-[10px] font-bold transition ${
                        mockupFold === 1.0 || mockupFold === 1 ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      جعبه بسته
                    </button>
                  </div>
                </div>

                {/* 6. Fullscreen 3D Studio CTA Button */}
                <button
                  onClick={() => setStudioMode('3d_studio')}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>ورود به استودیو طراحی ۳ بعدی</span>
                </button>
              </div>
            )}

            {/* ================= TAB 2: MODELS CATALOG (All 22 Models) ================= */}
            {activeNavTab === 'models' && (
              <div className="space-y-2.5 animate-in fade-in duration-150">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجوی مدل یا کد استاندارد..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-7 py-1.5 text-xs font-bold text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2" />
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                  {MODEL_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition ${
                        selectedCategory === cat.id
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Models List */}
                <div className="space-y-1.5 max-h-[calc(100vh-210px)] overflow-y-auto pr-0.5">
                  {filteredModels.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleSelectModel(m)}
                      className={`p-2 rounded-xl border text-right cursor-pointer transition ${
                        selectedModel === m.id
                          ? 'bg-indigo-950/70 border-amber-400 ring-1 ring-amber-400/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{m.icon}</span>
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1 rounded">
                            {m.standard}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-amber-400 font-bold">#{m.pacdoraId}</span>
                      </div>
                      <div className="text-xs font-bold text-white truncate">{m.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= TAB 3: SHEET SPECS ================= */}
            {activeNavTab === 'specs' && (
              <div className="space-y-3 animate-in fade-in duration-150 text-xs">
                <h3 className="text-xs font-black text-amber-300">مشخصات گسترده و فنی شیت</h3>

                {dielineData?.flatDimensions ? (
                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">ابعاد گسترده شیت:</span>
                      <span className="font-mono font-bold text-amber-400">
                        {dielineData.flatDimensions.flatWidthMm} × {dielineData.flatDimensions.flatHeightMm} mm
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">متراژ خط تیغ:</span>
                      <span className="font-mono font-bold text-rose-400">
                        {dielineData.totalCutMm ? `${dielineData.totalCutMm} mm` : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">متراژ خط تا:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {dielineData.totalCreaseMm ? `${dielineData.totalCreaseMm} mm` : '-'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 text-center py-6 text-xs">
                    اطلاعات گسترده در حال محاسبه است...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================= CENTER: 2D VECTOR CAD CANVAS ================= */}
        <div className="flex-1 bg-slate-900 flex flex-col relative overflow-hidden">
          
          {/* Canvas Interactive Viewport */}
          <div
            className={`flex-1 relative flex items-center justify-center overflow-hidden ${
              activeCanvasTool === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {loadingDieline ? (
              <div className="flex flex-col items-center gap-2 text-amber-400">
                <div className="w-8 h-8 border-3 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
                <span className="text-xs font-bold">در حال محاسبه هندسه خط تیغ...</span>
              </div>
            ) : dielineData?.svg_content || dielineData?.svg ? (
              <div
                className="w-full h-full flex items-center justify-center p-4 transition-transform duration-75"
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`
                }}
                dangerouslySetInnerHTML={{ __html: dielineData.svg_content || dielineData.svg }}
              />
            ) : (
              <div className="text-xs text-slate-500">نقشه خط تیغ آماده نمایش است</div>
            )}
          </div>

          {/* Bottom Floating Canvas Toolbar */}
          <div className="h-10 bg-slate-950/90 border-t border-slate-800 px-3 flex items-center justify-between z-10 flex-shrink-0">
            
            {/* Tool Toggles (Select, Pan, Zoom, Reset) */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveCanvasTool('select')}
                className={`p-1 rounded-md text-xs font-bold transition ${
                  activeCanvasTool === 'select'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="مکان‌نما / انتخاب"
              >
                <MousePointer className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveCanvasTool('pan')}
                className={`p-1 rounded-md text-xs font-bold transition ${
                  activeCanvasTool === 'pan'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="ابزار دست (جابجایی نقشه با درگ)"
              >
                <Hand className="w-3.5 h-3.5" />
              </button>

              <div className="h-3.5 w-px bg-slate-800 mx-1" />

              <button
                onClick={() => setZoomScale((z) => Math.min(z + 0.2, 3.5))}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="بزرگ‌نمایی"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <span className="font-mono text-[11px] text-slate-400 w-10 text-center">
                {Math.round(zoomScale * 100)}%
              </span>

              <button
                onClick={() => setZoomScale((z) => Math.max(z - 0.2, 0.4))}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="کوچک‌نمایی"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleResetView}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="بازنشانی اندازه و موقعیت"
              >
                <RotateCw className="w-3 h-3" />
              </button>
            </div>

            {/* Canvas Legend Colors */}
            <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-400">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-red-500"></span>
                <span>خط تیغ برش (Cut)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-0.5 border-t border-dashed border-green-500"></span>
                <span>خط تا (Crease)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-blue-500"></span>
                <span>اندازه‌گذاری (mm)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
