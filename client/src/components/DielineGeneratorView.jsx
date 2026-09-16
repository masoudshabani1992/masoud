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
  { id: 'reverse_tuck', category: 'folding', pacdoraId: '100020', standard: 'ECMA A20.40', name: 'جعبه دارویی دو طرف درب معکوس (RTE)', desc: 'درب بالا و پایین در جهت معکوس برای مونتاژ سریع‌تر', icon: '💄', defaultDim: { l: 100, w: 50, h: 140 } },
  { id: 'snap_lock_bottom', category: 'folding', pacdoraId: '110010', standard: 'ECMA A50.20', name: 'جعبه قفل زیرین چفتی ۱-۲-۳ (Snap-Lock)', desc: 'کف ۴ زبانه بدون نیاز به چسب با تحمل وزن بالا', icon: '🔒', defaultDim: { l: 140, w: 80, h: 180 } },
  { id: 'auto_bottom', category: 'folding', pacdoraId: '110020', standard: 'ECMA A55.20', name: 'جعبه کف اتوماتیک چسبی (Crash-Lock)', desc: 'باز شدن سریع کف با یک حرکت در خط بسته‌بندی', icon: '⚡', defaultDim: { l: 130, w: 75, h: 170 } },
  { id: 'hanging_tab', category: 'folding', pacdoraId: '120010', standard: 'ECMA A20.20+Euro', name: 'جعبه آویزدار رگالی با سوراخ یوروپانچ', desc: 'دارای لبه اضافه سوراخ‌دار آویز در قفسه‌های فروشگاهی', icon: '🏷️', defaultDim: { l: 90, w: 40, h: 130 } },

  // 2. Corrugated & Mailers (FEFCO)
  { id: 'keyboard', category: 'corrugated', pacdoraId: '150010', standard: 'FEFCO 0427', name: 'کارتن پستی کیبوردی قفل‌دار (RETF Mailer)', desc: 'کارتن پستی دیواره دوبل و قفل گوشواره‌ای محکم', icon: '📦', defaultDim: { l: 220, w: 160, h: 60 } },
  { id: 'roll_end_tuck_top', category: 'corrugated', pacdoraId: '150020', standard: 'FEFCO 0426', name: 'جعبه کیبوردی درب از بالا (RETT)', desc: 'جعبه دایکاتی با درب سرخود بازشونده از بالا', icon: '📬', defaultDim: { l: 200, w: 140, h: 50 } },
  { id: 'american', category: 'corrugated', pacdoraId: '200010', standard: 'FEFCO 0201', name: 'کارتن مادر ۴ درب استاندارد (RSC Master)', desc: 'کارتن حمل و نقل انبارداری با درب‌های وسط‌رس', icon: '🏭', defaultDim: { l: 350, w: 250, h: 280 } },
  { id: 'hsc', category: 'corrugated', pacdoraId: '200020', standard: 'FEFCO 0200', name: 'کارتن نیمه‌درب باز (HSC Half Slotted)', desc: 'کارتن روباز یا برای استفاده با کلاهک و درب مجزا', icon: '📦', defaultDim: { l: 300, w: 200, h: 220 } },
  { id: 'full_overlap', category: 'corrugated', pacdoraId: '200030', standard: 'FEFCO 0203', name: 'کارتن با درب اورلب کامل (FOL Overlap)', desc: 'درب‌های روی هم افتاده سرتاسری برای تحمل وزن فوق‌العاده', icon: '🛡️', defaultDim: { l: 320, w: 220, h: 240 } },
  { id: 'pizza_box', category: 'corrugated', pacdoraId: '160010', standard: 'FEFCO 0427-Mod', name: 'جعبه پیتزا کیبوردی با منافذ تهویه', desc: 'کارتن کم‌ارتفاع مربعی با خروجی بخار و روغن', icon: '🍕', defaultDim: { l: 320, w: 320, h: 45 } },

  // 3. Rigid & Luxury Gift Boxes
  { id: 'two_piece', category: 'rigid', pacdoraId: '300010', standard: 'Rigid Lid & Base', name: 'هاردباکس لوکس دو تکه (کف و درب جدا)', desc: 'جعبه مقوایی ضخیم مغزی با روکش سلفون یا متالایز', icon: '🎁', defaultDim: { l: 200, w: 140, h: 60 } },
  { id: 'sleeve_tray', category: 'rigid', pacdoraId: '310010', standard: 'Sleeve & Drawer', name: 'جعبه کشویی کبریتی (غلاف و کشو)', desc: 'کاور دورپیچ و سینی متحرک روان برای هدایا و طلا', icon: '🗂️', defaultDim: { l: 180, w: 100, h: 45 } },
  { id: 'book_style', category: 'rigid', pacdoraId: '320010', standard: 'Book Magnetic Box', name: 'هاردباکس لوکس کتابی با درب مگنتی', desc: 'جلد سخت کتابی با لبه آهنربایی و کشوی داخلی', icon: '📖', defaultDim: { l: 220, w: 150, h: 55 } },

  // 4. Food & Fast Food
  { id: 'gable_top', category: 'food', pacdoraId: '500010', standard: 'Gable Handle Box', name: 'جعبه دسته‌دار شیرینی و سوغات (Gable Top)', desc: 'سقف شیروانی هرمی با دسته قفلی ارگونومیک', icon: '🧁', defaultDim: { l: 180, w: 120, h: 160 } },
  { id: 'cake_box', category: 'food', pacdoraId: '510010', standard: '4-Corner Cake Box', name: 'جعبه کیک و شیرینی ۴ گوش با پنجره', desc: 'قفل گوشه‌ای با کادر طلقی دید محتویات', icon: '🎂', defaultDim: { l: 240, w: 240, h: 120 } },
  { id: 'french_fry_box', category: 'food', pacdoraId: '520010', standard: 'Fry Scoop Box', name: 'پاکت هلالی سیب‌زمینی و فست‌فود', desc: 'لبه شیب‌دار هلالی با کف تاشو ضدچربی', icon: '🍟', defaultDim: { l: 110, w: 50, h: 130 } },

  // 5. Specialty, Novelty & Displays
  { id: 'pillow', category: 'special', pacdoraId: '400010', standard: 'Pillow Box Curve', name: 'جعبه بالشتی فانتزی (Pillow Box)', desc: 'ساختار منحنی ارگونومیک برای اکسسوری و روسری', icon: '🎀', defaultDim: { l: 160, w: 110, h: 35 } },
  { id: 'hexagon_box', category: 'special', pacdoraId: '600010', standard: '6-Corner Hexagon', name: 'جعبه شش‌ضلعی لوکس قنادی و عطر', desc: '۶ وجه قرینه با قفل ستاره‌ای کف و درب', icon: '⬡', defaultDim: { l: 120, w: 120, h: 150 } },
  { id: 'triangular_box', category: 'special', pacdoraId: '610010', standard: 'Triangular Prism', name: 'جعبه منشوری سه‌گوش شکلات و اسنک', desc: '۳ وجه مساوی با درب‌های قفلی مثلثی', icon: '📐', defaultDim: { l: 140, w: 100, h: 180 } },
  { id: 'counter_display', category: 'special', pacdoraId: '700010', standard: 'Display Stand', name: 'استند پیشخوان نمایشگاهی پرفراژدار', desc: 'استند فروشگاهی با تاج بیلبورد تبلیغاتی', icon: '🏬', defaultDim: { l: 250, w: 180, h: 200 } },
  { id: 'four_corner_tray', category: 'special', pacdoraId: '710010', standard: '4-Corner Tray', name: 'سینی ۴ گوش تاشو (Four Corner Tray)', desc: 'سینی باز مقوایی پذیرایی و بسته‌بندی میوه و بطری', icon: '📥', defaultDim: { l: 260, w: 180, h: 70 } }
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

  // Left dock tabs: 'models', 'basic', 'advanced'
  const [activeNavTab, setActiveNavTab] = useState('basic');

  // Filter & Search
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
    l: (lengthMm - thicknessMm * 1.5).toFixed(1),
    w: (widthMm - thicknessMm * 1.5).toFixed(1),
    h: (heightMm - thicknessMm * 2.5).toFixed(1)
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
    exportDielineToDxf({
      boxType: selectedModel,
      length: lengthMm,
      width: widthMm,
      height: heightMm,
      glueW: activeMat.defaultThickness > 1 ? 25 : 15,
      filename: `استودیو-امیران-${activeModel.id}-${lengthMm}x${widthMm}x${heightMm}mm.dxf`
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

  const handleDownloadSvg = () => {
    if (!dielineData?.svg_content && !dielineData?.svg) return;
    const blob = new Blob([dielineData.svg_content || dielineData.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `استودیو-امیران-${activeModel.id}-${lengthMm}x${widthMm}x${heightMm}mm.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Canvas Mouse Pan Handlers
  const handleMouseDown = (e) => {
    if (activeCanvasTool === 'pan' || e.button === 1 || e.altKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleResetView = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Filtered Models
  const filteredModels = MODELS.filter((m) => {
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || 
      m.name.toLowerCase().includes(query) || 
      m.desc.toLowerCase().includes(query) || 
      m.pacdoraId.includes(query) || 
      m.standard.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
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
    <div className="flex flex-col h-[calc(100vh-130px)] min-h-[720px] bg-slate-950 text-slate-100 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl font-sans" dir="rtl">
      
      {/* 1. Studio Top Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-20">
        
        {/* Left: Studio Title & Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-amber-500/20">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base text-white tracking-tight">استودیو طراحی امیران</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ۲۲ مدل استاندارد
                </span>
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-700 hidden sm:block mx-1" />

          {/* 2D / 3D Navigation Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setStudioMode('2d_dieline')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
                studioMode === '2d_dieline'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>نقشه ۲ بعدی خط تیغ</span>
            </button>
            <button
              onClick={() => setStudioMode('3d_studio')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
                studioMode === '3d_studio'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>استودیو طراحی ۳ بعدی</span>
            </button>
          </div>
        </div>

        {/* Right: Quick Action & Download Buttons */}
        <div className="flex items-center gap-2">
          
          {/* Download AI (Illustrator) */}
          <button
            type="button"
            onClick={handleDownloadAi}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl text-xs font-bold transition active:scale-95"
            title="دانلود فایل وکتور Adobe Illustrator با تفکیک لایه‌های برش و خط تا"
          >
            <Download className="w-3.5 h-3.5" />
            <span>وکتور AI</span>
          </button>

          {/* Download DXF */}
          <button
            type="button"
            onClick={handleDownloadDxf}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-xs font-bold transition active:scale-95"
            title="دانلود فایل اتوکد AutoCAD R12 DXF برای دستگاه لیزر و قالب‌سازی"
          >
            <Download className="w-3.5 h-3.5" />
            <span>اتوکد DXF</span>
          </button>

          {/* Download PDF */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition active:scale-95"
            title="دانلود فایل پی‌دی‌اف وکتور با شناسنامه صنعتی و جدول ابعاد"
          >
            <Download className="w-3.5 h-3.5" />
            <span>وکتور PDF</span>
          </button>

          {/* Download SVG */}
          <button
            type="button"
            onClick={handleDownloadSvg}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition active:scale-95"
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-black shadow-md shadow-amber-500/20 transition active:scale-95 mr-2"
            >
              <span>انتقال به ثبت سفارش</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Studio Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* ================= LEFT SIDEBAR (DOCK & CONTROLS) ================= */}
        <div className="w-88 lg:w-96 bg-slate-900 border-l border-slate-800 flex z-10 shadow-xl flex-shrink-0">
          
          {/* Vertical Icon Dock */}
          <div className="w-16 bg-slate-950 border-l border-slate-800 flex flex-col items-center py-4 gap-4 flex-shrink-0">
            {[
              { id: 'models', label: 'مدل‌ها', icon: Box, badge: '22' },
              { id: 'basic', label: 'ابعاد', icon: Sliders },
              { id: 'advanced', label: 'مشخصات', icon: Layers }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveNavTab(tab.id)}
                  className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative ${
                    activeNavTab === tab.id
                      ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                  title={tab.label}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] font-bold">{tab.label}</span>
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[8px] font-black px-1 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sub-sidebar Form */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-right text-slate-200">
            
            {/* ================= TAB: MODELS SELECTOR (All 22 Models) ================= */}
            {activeNavTab === 'models' && (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-amber-300">کاتالوگ ۲۲ مدل استاندارد Pacdora</h3>
                  <span className="text-[10px] text-slate-400 font-mono">FEFCO / ECMA</span>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجوی نام جعبه یا کد استاندارد..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {MODEL_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition ${
                        selectedCategory === cat.id
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>

                {/* Models Grid */}
                <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-0.5">
                  {filteredModels.map((m) => (
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
                        <div className="flex items-center gap-2">
                          <span className="text-base">{m.icon}</span>
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800">
                            {m.standard}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-amber-400 font-bold">#{m.pacdoraId}</span>
                      </div>
                      <div className="text-xs font-black text-white">{m.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{m.desc}</div>
                    </div>
                  ))}

                  {filteredModels.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-500">
                      مدلی با این مشخصات یافت نشد.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= TAB: BASIC PARAMETERS ================= */}
            {activeNavTab === 'basic' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                
                {/* Active Model Indicator */}
                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{activeModel.icon}</span>
                    <div>
                      <span className="text-xs font-black text-white block">{activeModel.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{activeModel.standard} | #{activeModel.pacdoraId}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveNavTab('models')}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-bold bg-amber-500/10 px-2 py-1 rounded-lg"
                  >
                    تغییر مدل
                  </button>
                </div>

                {/* Custom Size Header */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-200">ابعاد سفارشی جعبه</span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      میلی‌متر (mm)
                    </span>
                  </div>

                  {/* Length / Width / Height Inputs */}
                  <div className="space-y-2">
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
                            const n = parseInt(inputL);
                            if (isNaN(n) || n <= 0) {
                              setInputL(String(lengthMm));
                            } else {
                              setLengthMm(n);
                            }
                          }}
                          className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-amber-400 text-xs focus:outline-none focus:border-amber-400"
                        />
                        <span className="text-[10px] text-slate-400 font-mono">mm</span>
                      </div>
                    </div>

                    {/* Width */}
                    <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2">
                      <span className="text-xs font-bold text-slate-300">عرض جعبه (Width)</span>
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
                            const n = parseInt(inputW);
                            if (isNaN(n) || n <= 0) {
                              setInputW(String(widthMm));
                            } else {
                              setWidthMm(n);
                            }
                          }}
                          className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-amber-400 text-xs focus:outline-none focus:border-amber-400"
                        />
                        <span className="text-[10px] text-slate-400 font-mono">mm</span>
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
                            const n = parseInt(inputH);
                            if (isNaN(n) || n <= 0) {
                              setInputH(String(heightMm));
                            } else {
                              setHeightMm(n);
                            }
                          }}
                          className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-amber-400 text-xs focus:outline-none focus:border-amber-400"
                        />
                        <span className="text-[10px] text-slate-400 font-mono">mm</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Size Mode Selector (Inner / Mfg / Outer) */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-300">حالت ابعادی (Dimension Mode):</span>
                  <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-center">
                    {[
                      { id: 'inner', label: 'ابعاد داخلی' },
                      { id: 'mfg', label: 'ابعاد ساخت (خط تیغ)' },
                      { id: 'outer', label: 'ابعاد خارجی' }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setSizeMode(mode.id)}
                        className={`py-1.5 rounded-lg text-[10px] font-bold transition ${
                          sizeMode === mode.id
                            ? 'bg-indigo-600 text-white shadow-sm font-black'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Material & Thickness Controls */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300">جنس و گرماژ مقوا:</span>
                  <select
                    value={selectedMaterial}
                    onChange={(e) => {
                      setSelectedMaterial(e.target.value);
                      const m = MATERIALS.find((mat) => mat.id === e.target.value);
                      if (m) setThicknessMm(m.defaultThickness);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    {MATERIALS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>

                  {/* Caliper Thickness Stepper */}
                  <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2">
                    <span className="text-xs font-bold text-slate-300">ضخامت مقوا (Caliper)</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setThicknessMm(Math.max(0.2, Math.round((thicknessMm - 0.1) * 10) / 10))}
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-xs font-bold text-amber-400 w-12 text-center">
                        {thicknessMm.toFixed(1)} mm
                      </span>
                      <button
                        onClick={() => setThicknessMm(Math.min(5.0, Math.round((thicknessMm + 0.1) * 10) / 10))}
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dimension Triad Matrix */}
                <div className="bg-slate-950/90 rounded-2xl p-3 border border-slate-800 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-slate-400 font-bold">
                    <span>ماتریس تبدیل ابعاد</span>
                    <span className="font-mono text-[10px]">L × W × H (mm)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-900/80 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">داخلی</span>
                      <span className="font-mono font-bold text-slate-200 mt-0.5 block">{inner.l}×{inner.w}×{inner.h}</span>
                    </div>
                    <div className="bg-indigo-950/60 p-2 rounded-xl border border-indigo-800/40">
                      <span className="text-[10px] text-indigo-300 font-bold block">ساخت (تیغ)</span>
                      <span className="font-mono font-bold text-amber-400 mt-0.5 block">{mfg.l}×{mfg.w}×{mfg.h}</span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">خارجی</span>
                      <span className="font-mono font-bold text-slate-200 mt-0.5 block">{outer.l}×{outer.w}×{outer.h}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB: ADVANCED SPECS ================= */}
            {activeNavTab === 'advanced' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <h3 className="text-xs font-black text-amber-300">مشخصات گسترده و فنی شیت</h3>

                {dielineData?.flatDimensions && (
                  <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">ابعاد گسترده جعبه (Flat Sheet):</span>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {dielineData.flatDimensions.flatWidthMm} × {dielineData.flatDimensions.flatHeightMm} mm
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">متراژ خط تیغ (Cut Rule):</span>
                      <span className="text-xs font-mono font-bold text-rose-400">
                        {dielineData.totalCutMm ? `${dielineData.totalCutMm} mm` : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">متراژ خط تا (Crease Rule):</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {dielineData.totalCreaseMm ? `${dielineData.totalCreaseMm} mm` : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">وزن تقریبی هر جعبه خام:</span>
                      <span className="text-xs font-mono font-bold text-indigo-400">
                        {dielineData.blankWeightG ? `${dielineData.blankWeightG} گرم` : '-'}
                      </span>
                    </div>
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
              <div className="flex flex-col items-center gap-3 text-amber-400">
                <div className="w-10 h-10 border-3 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
                <span className="text-xs font-bold">در حال محاسبه هندسه خط تیغ...</span>
              </div>
            ) : dielineData?.svg_content || dielineData?.svg ? (
              <div
                className="w-full h-full flex items-center justify-center p-6 transition-transform duration-75"
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
          <div className="h-12 bg-slate-950/90 border-t border-slate-800 px-4 flex items-center justify-between z-10 flex-shrink-0">
            
            {/* Tool Toggles (Select, Pan, Reset) */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveCanvasTool('select')}
                className={`p-1.5 rounded-lg text-xs font-bold transition ${
                  activeCanvasTool === 'select'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="مکان‌نما / انتخاب"
              >
                <MousePointer className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveCanvasTool('pan')}
                className={`p-1.5 rounded-lg text-xs font-bold transition ${
                  activeCanvasTool === 'pan'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="ابزار دست (جابجایی نقشه با درگ)"
              >
                <Hand className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-slate-800 mx-1" />

              <button
                onClick={() => setZoomScale((z) => Math.min(z + 0.2, 3.5))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="بزرگ‌نمایی"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <span className="font-mono text-xs text-slate-400 w-12 text-center">
                {Math.round(zoomScale * 100)}%
              </span>

              <button
                onClick={() => setZoomScale((z) => Math.max(z - 0.2, 0.4))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="کوچک‌نمایی"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                onClick={handleResetView}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs font-bold"
                title="بازنشانی اندازه و موقعیت"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Canvas Legend Colors */}
            <div className="hidden sm:flex items-center gap-4 text-[10px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span>
                <span>خط تیغ برش (Cut Line)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 border-t-2 border-dashed border-red-500"></span>
                <span>خط تا (Crease)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                <span>اضافه رنگ برش (Bleed 3mm)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDEBAR: 3D LIVE MOCKUP ================= */}
        <div className="w-72 lg:w-80 bg-slate-950 border-r border-slate-800 p-4 flex flex-col justify-between flex-shrink-0">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-white">ماکاپ ۳ بعدی زنده</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Three.js WebGL</span>
            </div>

            {/* Interactive 3D Box Viewport */}
            <div className="w-full h-52 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-inner flex items-center justify-center">
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

            {/* Fold Slider & Quick Presets */}
            <div className="space-y-2 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-bold">انیمیشن تا شدن جعبه:</span>
                <span className="font-mono text-amber-400 font-bold">{Math.round(mockupFold * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={mockupFold}
                onChange={(e) => setMockupFold(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="grid grid-cols-3 gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => setMockupFold(0)}
                  className={`py-1 rounded-lg text-[10px] font-bold transition ${
                    mockupFold === 0 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  شیت تخت (۰٪)
                </button>
                <button
                  type="button"
                  onClick={() => setMockupFold(0.5)}
                  className={`py-1 rounded-lg text-[10px] font-bold transition ${
                    mockupFold === 0.5 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  ۵۰٪ مونتاژ
                </button>
                <button
                  type="button"
                  onClick={() => setMockupFold(1.0)}
                  className={`py-1 rounded-lg text-[10px] font-bold transition ${
                    mockupFold === 1.0 || mockupFold === 1 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  جعبه بسته
                </button>
              </div>
            </div>
          </div>

          {/* Fullscreen 3D Studio CTA */}
          <button
            onClick={() => setStudioMode('3d_studio')}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black text-xs py-3 px-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>ورود به استودیو طراحی ۳ بعدی</span>
          </button>
        </div>
      </div>
    </div>
  );
}
