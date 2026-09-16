import React, { useState, useEffect } from 'react';
import {
  Scissors,
  Layers,
  Download,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Award,
  Grid,
  FileText,
  DollarSign,
  Maximize2,
  Box,
  Cpu,
  Printer,
  Bookmark,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Ruler,
  Maximize,
  Share2,
  Layers3,
  Check,
  ChevronDown,
  Palette
} from 'lucide-react';
import { api } from '../api/client';
import Packaging3DMockup from './Packaging3DMockup';

const BOX_TEMPLATES = [
  {
    id: 'keyboard',
    pacdoraId: '150010',
    fefcoCode: 'FEFCO 0427',
    name: 'کارتن پستی کیبوردی (Flip-Top Mailer RETF)',
    category: 'کارتن لمینتی و آنلاین‌شاپ',
    desc: 'ساختار استاندارد Pacdora 150010 با دیواره‌های دوبل قفل‌شونده و زبانه‌های چفت سرخود بدون نیاز به چسب',
    icon: '📦',
    defaultDim: { l: 200, w: 150, h: 50 },
    defaultMaterial: 'flute_e'
  },
  {
    id: 'tuck_end',
    pacdoraId: '100010',
    fefcoCode: 'ECMA A20.20.03',
    name: 'جعبه سر و ته دارویی (Straight Tuck End)',
    category: 'کارتن تاشو دارویی و آرایشی',
    desc: 'استاندارد جهانی دو طرف درب با گوشواره‌های قفل اصطکاکی و لبه چسب پخ‌دار ۱۵ درجه',
    icon: '💊',
    defaultDim: { l: 80, w: 15, h: 165 },
    defaultMaterial: 'cardboard_ivory'
  },
  {
    id: 'snap_lock_bottom',
    pacdoraId: '110020',
    fefcoCode: 'ECMA A20.40.01',
    name: 'سر دارویی ته قفلی خودکار (1-2-3 Snap Lock)',
    category: 'کارتن سنگین و شوینده',
    desc: 'کف ۴ تکه خودچفت‌شونده ۴۵ درجه با تحمل وزن بالا بدون نیاز به چسب کف',
    icon: '🔒',
    defaultDim: { l: 140, w: 80, h: 180 },
    defaultMaterial: 'cardboard_duplex'
  },
  {
    id: 'american',
    pacdoraId: '200010',
    fefcoCode: 'FEFCO 0201',
    name: 'کارتن آمریکایی ۴ درب (RSC Shipping Carton)',
    category: 'کارتن مادر صنعتی و حمل‌ونقل',
    desc: 'کارتن استاندارد صادراتی با درب‌های هم‌پوشان W/2 و شیار برش ۳ میلی‌متر',
    icon: '🏭',
    defaultDim: { l: 300, w: 200, h: 250 },
    defaultMaterial: 'flute_b'
  }
];

const MATERIALS = [
  {
    id: 'flute_e',
    name: 'کارتن لمینتی E-Flute (ای فلوت)',
    desc: 'ضخامت ۱.۵ میل | مقاوم در برابر ضربه با چاپ افست لمینتی',
    defaultThickness: 1.5,
    minThick: 1.2,
    maxThick: 1.8,
    colorHex: '#dfbe95',
    texture: 'corrugated_e',
    icon: '📦'
  },
  {
    id: 'cardboard_ivory',
    name: 'مقوای ایندربرد بهداشتی (Ivory Board)',
    desc: 'ضخامت ۰.۴۵ میل | سطح فوق‌العاده صیقلی برای دارویی و آرایشی',
    defaultThickness: 0.45,
    minThick: 0.3,
    maxThick: 0.7,
    colorHex: '#fdfcfb',
    texture: 'smooth_white',
    icon: '⚪'
  },
  {
    id: 'cardboard_duplex',
    name: 'مقوای پشت طوسی (Duplex Board)',
    desc: 'ضخامت ۰.۵۰ میل | مناسب بسته‌بندی اقتصادی و قطعات',
    defaultThickness: 0.50,
    minThick: 0.35,
    maxThick: 0.8,
    colorHex: '#f1f1ed',
    texture: 'duplex_gray',
    icon: '🔘'
  },
  {
    id: 'kraft_paper',
    name: 'مقوای کرافت قهوه‌ای (Kraft Paperboard)',
    desc: 'ضخامت ۰.۵۵ میل | بافت ارگانیک و طبیعی صنایع غذایی',
    defaultThickness: 0.55,
    minThick: 0.3,
    maxThick: 0.9,
    colorHex: '#c89d6c',
    texture: 'kraft_brown',
    icon: '🟤'
  },
  {
    id: 'flute_b',
    name: 'کارتن B-Flute (بی فلوت ۳ میل)',
    desc: 'ضخامت ۳.۰ میل | استحکام فشاری بالا مخصوص کارتن مادر',
    defaultThickness: 3.0,
    minThick: 2.6,
    maxThick: 3.4,
    colorHex: '#be9364',
    texture: 'corrugated_b',
    icon: '📦'
  }
];

export default function DielineGeneratorView({ onTransferToOrder }) {
  const [selectedTemplate, setSelectedTemplate] = useState('keyboard');
  const [sizeMode, setSizeMode] = useState('inner'); // 'inner' | 'mfg' | 'outer'
  const [lengthMm, setLengthMm] = useState(200);
  const [widthMm, setWidthMm] = useState(150);
  const [heightMm, setHeightMm] = useState(50);
  const [selectedMaterial, setSelectedMaterial] = useState('flute_e');
  const [customThickness, setCustomThickness] = useState(1.5);
  const [quantity, setQuantity] = useState(5000);
  const [cardboardPricePerKg, setCardboardPricePerKg] = useState(42000);

  // Active Studio Mode: '3d_mockup' | '2d_dieline' | 'sheet_montage'
  const [studioTab, setStudioTab] = useState('3d_mockup');
  const [loading, setLoading] = useState(false);
  const [dielineData, setDielineData] = useState(null);
  const [montageResult, setMontageResult] = useState(null);
  const [selectedSheetId, setSelectedSheetId] = useState('sheet_70x100');
  const [zoomScale, setZoomScale] = useState(1);
  const [cadTheme, setCadTheme] = useState('light'); // 'light' or 'dark'

  // Apply Sample: Pacdora 150010 Mailer Box
  const handleApplyPacdoraMailer = () => {
    setSelectedTemplate('keyboard');
    setSizeMode('inner');
    setLengthMm(200);
    setWidthMm(150);
    setHeightMm(50);
    setSelectedMaterial('flute_e');
    setCustomThickness(1.5);
  };

  // Run calculation & API Sync
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const payload = {
        boxType: selectedTemplate,
        length: Number(lengthMm),
        width: Number(widthMm),
        height: Number(heightMm),
        material: selectedMaterial,
        materialId: selectedMaterial,
        customThickness: Number(customThickness),
        sizeMode: sizeMode,
        quantity: Number(quantity),
        cardboardPricePerKg: Number(cardboardPricePerKg)
      };

      const res = await api.generateDielineMontage(payload);

      if (res.success) {
        setDielineData(res.dieline);
        setMontageResult(res);
        if (!selectedSheetId || !res.allSheets?.some(s => s.sheetId === selectedSheetId)) {
          setSelectedSheetId(res.bestChoice?.sheetId || 'sheet_70x100');
        }
      }
    } catch (err) {
      alert(err.message || 'خطا در محاسبه خط تیغ و شبیه‌سازی.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBoxTemplate = (tmpl) => {
    setSelectedTemplate(tmpl.id);
    setLengthMm(tmpl.defaultDim.l);
    setWidthMm(tmpl.defaultDim.w);
    setHeightMm(tmpl.defaultDim.h);
    setSelectedMaterial(tmpl.defaultMaterial);
    const matObj = MATERIALS.find(m => m.id === tmpl.defaultMaterial);
    if (matObj) setCustomThickness(matObj.defaultThickness);
  };

  const handleSelectMaterial = (matId) => {
    setSelectedMaterial(matId);
    const matObj = MATERIALS.find(m => m.id === matId);
    if (matObj) setCustomThickness(matObj.defaultThickness);
  };

  useEffect(() => {
    handleGenerate();
  }, [selectedTemplate, selectedMaterial, sizeMode, customThickness]);

  // Download 1:1 Vector SVG (Pacdora & ArtiosCAD standard)
  const handleDownloadSvg = () => {
    if (!dielineData?.svg) return;
    const blob = new Blob([dielineData.svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pacdora-Studio-${selectedTemplate}-${lengthMm}x${widthMm}x${heightMm}mm.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentTmpl = BOX_TEMPLATES.find(t => t.id === selectedTemplate) || BOX_TEMPLATES[0];
  const currentMat = MATERIALS.find(m => m.id === selectedMaterial) || MATERIALS[0];
  const triad = dielineData?.triadDimensions || {
    inner: { l: lengthMm, w: widthMm, h: heightMm },
    mfg: { l: lengthMm, w: widthMm, h: heightMm },
    outer: { l: lengthMm + 3, w: widthMm + 3, h: heightMm + 3 }
  };
  const activeSheet = montageResult?.allSheets?.find(s => s.sheetId === selectedSheetId) || montageResult?.bestChoice;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner: Pacdora & ArtiosCAD Studio */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 text-white shadow-xl flex items-center justify-between flex-wrap gap-4 border border-indigo-500/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-inner font-black text-lg">
            3D
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white">
                استودیو طراحی جعبه، خط تیغ و موکاپ ۳ بعدی (مشابه Pacdora Studio)
              </h2>
              <span className="text-[11px] bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-black">
                Model: {currentTmpl.pacdoraId}
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-1">
              محاسبه ۳ بعدی ابعاد، تبدیل خودکار (Inner / Mfg / Outer)، موکاپ با قابلیت باز و بسته‌شدن و فرم‌بندی زنده
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleApplyPacdoraMailer}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>بارگذاری نمونه کیبوردی Pacdora 150010</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Parametric Controls Panel (Pacdora Style) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* 1. Box Model Selector */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-black text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Box className="w-4 h-4 text-indigo-600" />
                ۱. مدل قالب جعبه (Box Model)
              </span>
              <span className="text-[10px] text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded-md font-bold">
                {currentTmpl.fefcoCode}
              </span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {BOX_TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplate === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectBoxTemplate(tmpl)}
                    className={`p-3 rounded-2xl text-right transition border flex flex-col justify-between gap-1 ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{tmpl.icon}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${isSelected ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 text-slate-700'}`}>
                        #{tmpl.pacdoraId}
                      </span>
                    </div>
                    <span className="text-xs leading-snug mt-1 font-black">{tmpl.name.split('(')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Dimension Mode & Custom Inputs */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 mb-1">
                <Sliders className="w-4 h-4 text-indigo-600" />
                ۲. ابعاد سفارشی و مبنای اندازه‌گیری (Size Mode)
              </h3>
              <p className="text-[11px] text-slate-500">انتخاب مبنای ابعاد (ابعاد مفید داخلی، خط تیغ یا ابعاد بیرونی)</p>
            </div>

            {/* Size Mode Switcher */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl text-center text-xs font-bold">
              <button
                type="button"
                onClick={() => setSizeMode('inner')}
                className={`py-2 rounded-xl transition ${
                  sizeMode === 'inner' ? 'bg-white text-indigo-700 shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ابعاد داخلی (Inner)
              </button>
              <button
                type="button"
                onClick={() => setSizeMode('mfg')}
                className={`py-2 rounded-xl transition ${
                  sizeMode === 'mfg' ? 'bg-white text-indigo-700 shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                خط تیغ (Mfg)
              </button>
              <button
                type="button"
                onClick={() => setSizeMode('outer')}
                className={`py-2 rounded-xl transition ${
                  sizeMode === 'outer' ? 'bg-white text-indigo-700 shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ابعاد بیرونی (Outer)
              </button>
            </div>

            {/* Inputs: Length, Width, Height */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">طول (L):</label>
                <div className="relative">
                  <input
                    type="number"
                    value={lengthMm}
                    onChange={(e) => setLengthMm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-black text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="absolute left-2 top-2 text-[10px] text-slate-400">mm</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">عرض (W):</label>
                <div className="relative">
                  <input
                    type="number"
                    value={widthMm}
                    onChange={(e) => setWidthMm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-black text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="absolute left-2 top-2 text-[10px] text-slate-400">mm</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ارتفاع (H):</label>
                <div className="relative">
                  <input
                    type="number"
                    value={heightMm}
                    onChange={(e) => setHeightMm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-black text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="absolute left-2 top-2 text-[10px] text-slate-400">mm</span>
                </div>
              </div>
            </div>

            {/* 3. Material & Custom Thickness */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <label className="text-xs font-bold text-slate-700 block">
                ۳. جنس متریال و بافت (Material):
              </label>
              
              <div className="space-y-1.5">
                {MATERIALS.map((mat) => (
                  <label
                    key={mat.id}
                    onClick={() => handleSelectMaterial(mat.id)}
                    className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition text-xs ${
                      selectedMaterial === mat.id
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{mat.icon}</span>
                      <span>{mat.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-100">
                      {mat.defaultThickness} mm
                    </span>
                  </label>
                ))}
              </div>

              {/* Custom Thickness Slider */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 mt-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>ضخامت اختصاصی (Thickness):</span>
                  <strong className="text-indigo-600 font-mono">{customThickness} mm</strong>
                </div>
                <input
                  type="range"
                  min={currentMat.minThick}
                  max={currentMat.maxThick}
                  step="0.05"
                  value={customThickness}
                  onChange={(e) => setCustomThickness(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>به‌روزرسانی استودیو و بازتولید فایل‌ها</span>
            </button>
          </div>

          {/* Pacdora Size Triad Matrix Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2.5 text-xs">
            <h4 className="font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Ruler className="w-4 h-4 text-emerald-600" />
              ماتریس ابعاد مهندسی (Size Comparison)
            </h4>

            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-600 font-sans font-bold">ابعاد مفید داخلی (Inner):</span>
                <strong className="text-slate-900">{triad.inner.l} × {triad.inner.w} × {triad.inner.h} mm</strong>
              </div>
              <div className="flex items-center justify-between p-2 bg-indigo-50/70 rounded-xl border border-indigo-200">
                <span className="text-indigo-900 font-sans font-bold">ابعاد خط تیغ ساخت (Mfg):</span>
                <strong className="text-indigo-700 font-black">{triad.mfg.l} × {triad.mfg.w} × {triad.mfg.h} mm</strong>
              </div>
              <div className="flex items-center justify-between p-2 bg-amber-50/70 rounded-xl border border-amber-200">
                <span className="text-amber-900 font-sans font-bold">ابعاد اشغال فضای بیرونی (Outer):</span>
                <strong className="text-amber-800 font-black">{triad.outer.l} × {triad.outer.w} × {triad.outer.h} mm</strong>
              </div>
            </div>

            {dielineData && (
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 font-sans text-[11px] flex justify-between items-center">
                <span className="font-bold">ابعاد شیت گسترده:</span>
                <strong className="font-mono text-emerald-700 font-black">
                  {dielineData.flatDimensions.flatWidthMm} × {dielineData.flatDimensions.flatHeightMm} mm
                </strong>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Studio Canvas (3D Mockup / 2D Dieline / Sheet Montage) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Studio Navigation Top Bar */}
          <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setStudioTab('3d_mockup')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                  studioTab === '3d_mockup'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Box className="w-3.5 h-3.5 text-amber-300" />
                <span>نمای سه بعدی جعبه (3D Mockup)</span>
              </button>

              <button
                type="button"
                onClick={() => setStudioTab('2d_dieline')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                  studioTab === '2d_dieline'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Scissors className="w-3.5 h-3.5 text-rose-400" />
                <span>نقشه خط تیغ ۲ بعدی (2D Dieline)</span>
              </button>

              <button
                type="button"
                onClick={() => setStudioTab('sheet_montage')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                  studioTab === 'sheet_montage'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>فرم‌بندی شیت چاپ (Imposition)</span>
              </button>
            </div>

            {/* Download & Export Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadSvg}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
                title="دانلود وکتور SVG خط تیغ با ابعاد استاندارد"
              >
                <Download className="w-3.5 h-3.5" />
                <span>دانلود وکتور SVG</span>
              </button>

              {onTransferToOrder && dielineData && (
                <button
                  type="button"
                  onClick={() => onTransferToOrder({
                    box_type: currentTmpl.name,
                    box_structure: currentTmpl.fefcoCode,
                    cardboard_length: dielineData.flatDimensions.flatWidthMm,
                    cardboard_width: dielineData.flatDimensions.flatHeightMm,
                    length: triad.mfg.l / 10,
                    width: triad.mfg.w / 10,
                    height: triad.mfg.h / 10
                  })}
                  className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition border border-indigo-200 flex items-center gap-1"
                >
                  <span>ثبت سفارش</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: 3D REAL-TIME INTERACTIVE PACKAGING MOCKUP */}
          {studioTab === '3d_mockup' && (
            <div className="h-[520px]">
              <Packaging3DMockup
                boxType={selectedTemplate}
                length={triad.mfg.l}
                width={triad.mfg.w}
                height={triad.mfg.h}
                thickness={customThickness}
                materialColor={currentMat.colorHex}
                textureType={currentMat.texture}
              />
            </div>
          )}

          {/* TAB 2: 2D VECTOR DIELINE WITH EDGE-BY-EDGE CAD DIMENSIONS */}
          {studioTab === '2d_dieline' && dielineData && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[520px]">
              {/* Legend Bar */}
              <div className="w-full flex items-center justify-between text-[11px] text-slate-700 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl mb-4 flex-wrap gap-2 shadow-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 font-bold text-rose-600">
                    <span className="w-3 h-0.5 bg-rose-600 rounded-full" />
                    تیغ برش (Cut: قرمز)
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-blue-600">
                    <span className="w-3 h-0.5 border-b-2 border-dashed border-blue-600" />
                    خط‌تا (Crease: آبی خط‌چین)
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                    <span className="w-3 h-0.5 bg-emerald-600 rounded-full" />
                    اندازه‌گذاری تمام اضلاع (CAD)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoomScale((z) => Math.min(2.5, z + 0.2))}
                    className="p-1 hover:bg-slate-200 rounded text-slate-700 transition"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale((z) => Math.max(0.4, z - 0.2))}
                    className="p-1 hover:bg-slate-200 rounded text-slate-700 transition"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale(1)}
                    className="text-[10px] font-mono px-2 py-0.5 bg-slate-200 rounded hover:bg-slate-300 text-slate-800 font-bold"
                  >
                    {Math.round(zoomScale * 100)}%
                  </button>
                </div>
              </div>

              {/* Rendered SVG */}
              <div
                className="w-full flex items-center justify-center overflow-auto p-4 transition-transform duration-200 bg-white rounded-2xl border border-slate-100 shadow-inner"
                style={{ transform: `scale(${zoomScale})` }}
                dangerouslySetInnerHTML={{ __html: dielineData.svg }}
              />

              <div className="w-full flex items-center justify-between text-[10px] text-slate-400 font-mono mt-3 px-2">
                <span>Pacdora & ESKO ArtiosCAD 23.07 Vector Engine</span>
                <span>Scale 1:1 Ready for Laser Die Cutting</span>
              </div>
            </div>
          )}

          {/* TAB 3: SHEET MONTAGE IMPOSITION */}
          {studioTab === 'sheet_montage' && montageResult && (
            <div className="space-y-4">
              {/* Sheet Selector */}
              <div className="bg-white rounded-2xl p-3 border border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
                <span className="text-slate-400 font-bold whitespace-nowrap pl-2 border-l border-slate-200">انتخاب شیت چاپ:</span>
                {montageResult.allSheets?.map((sh) => {
                  const isSelected = (selectedSheetId || montageResult.bestChoice?.sheetId) === sh.sheetId;
                  const isBest = montageResult.bestChoice?.sheetId === sh.sheetId;
                  return (
                    <button
                      key={sh.sheetId}
                      type="button"
                      onClick={() => setSelectedSheetId(sh.sheetId)}
                      className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-md font-black'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>{sh.sheetName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {sh.boxesPerSheet} قالب ({sh.wastePercentage}٪ پرت)
                      </span>
                      {isBest && <span className="text-amber-300">★ کمترین پرتی</span>}
                    </button>
                  );
                })}
              </div>

              {/* Sheet Canvas */}
              {activeSheet && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl flex flex-col items-center justify-center relative overflow-hidden min-h-[460px]">
                  <div className="w-full flex items-center justify-between text-xs border-b border-slate-200 pb-3 mb-4 text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900">
                        نقشه مونتاژ شیت {activeSheet.sheetLength} × {activeSheet.sheetWidth} cm
                      </span>
                      <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                        {activeSheet.boxesPerSheet} قالب در فرم
                      </span>
                    </div>

                    <div className="text-emerald-600 font-bold flex items-center gap-1.5 text-xs">
                      <span>راندمان: {activeSheet.efficiencyPercentage}٪</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-rose-600">باطله: {activeSheet.wastePercentage}٪</span>
                    </div>
                  </div>

                  <div
                    className="w-full flex items-center justify-center overflow-auto p-4 transition-transform duration-200 bg-white rounded-2xl border border-slate-100"
                    style={{ transform: `scale(${zoomScale})` }}
                    dangerouslySetInnerHTML={{ __html: activeSheet.montageSvg }}
                  />
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
