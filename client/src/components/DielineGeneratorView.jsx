import React, { useState, useEffect, useRef } from 'react';
import {
  Scissors,
  Layers,
  Download,
  Printer,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Package,
  Boxes,
  HelpCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { api } from '../api/client';

const BOX_TYPES = [
  {
    id: 'tuck_end',
    name: 'سر و ته دارویی (Tuck End)',
    desc: 'پرکاربردترین جعبه دارویی، بهداشتی و غذایی با زبانه‌های قفل‌شونده در بالا و پایین',
    icon: '💊',
    defaultDim: { l: 120, w: 60, h: 160 }
  },
  {
    id: 'snap_lock_bottom',
    name: 'سر دارویی ته قفلی (Lock-Bottom)',
    desc: 'درب بالا دارویی + ۴ زبانه زاویه‌دار ۴۵ درجه قفل‌شونده خودکار در کف جعبه',
    icon: '🔒',
    defaultDim: { l: 140, w: 80, h: 180 }
  },
  {
    id: 'keyboard',
    name: 'کیبوردی سرهم‌شونده (Mailer Box)',
    desc: 'جعبه لپ‌تاپی، پستی و آنلاین شاپ با دیواره‌های دوبل مستحکم و قفل سرخود بدون چسب',
    icon: '🎹',
    defaultDim: { l: 200, w: 150, h: 50 }
  },
  {
    id: 'american',
    name: 'آمریکایی ۴ درب (RSC Carton)',
    desc: 'کارتن مادر صنعتی استاندارد ۴ درب بالا و پایین با لبه اتصال چسب یا منگنه',
    icon: '📦',
    defaultDim: { l: 300, w: 200, h: 250 }
  },
  {
    id: 'base_lid',
    name: 'زیره و رویه (iPhone Style Base & Lid)',
    desc: 'جعبه دو تکه لوکس کادویی، موبایل، طلا و ساعت با بادخور مهندسی شده رویه',
    icon: '📱',
    defaultDim: { l: 160, w: 90, h: 40 }
  },
  {
    id: 'sleeve_drawer',
    name: 'کشویی کبریتی (Sleeve & Drawer)',
    desc: 'جعبه دو تکه شامل کاور دورپیچ بیرونی + کشوی متحرک ریلی داخلی',
    icon: '🗃️',
    defaultDim: { l: 150, w: 100, h: 35 }
  },
  {
    id: 'tray',
    name: 'کفی بدون در (Open Tray)',
    desc: 'سینی مقوایی و کارتنی روباز برای میوه، قطعات صنعتی و بسته‌بندی شیرینی',
    icon: '📥',
    defaultDim: { l: 250, w: 180, h: 60 }
  }
];

const MATERIALS = [
  { id: 'cardboard', name: 'جعبه مقوایی (ایندربرد / پشت طوسی)', thickness: '۰.۵ میلی‌متر', desc: 'مناسب جعبه‌های سبک، دارویی و آرایشی' },
  { id: 'flute_e', name: 'کارتن لمینتی E-Flute (ای فلوت)', thickness: '۱.۵ میلی‌متر', desc: 'مقاومت خمشی عالی با قابلیت چاپ افست' },
  { id: 'flute_b', name: 'کارتن B-Flute (بی فلوت)', thickness: '۳.۰ میلی‌متر', desc: 'استحکام بالا جهت حمل قطعات و کارتن متوسط' },
  { id: 'flute_c', name: 'کارتن C-Flute (سی فلوت)', thickness: '۴.۰ میلی‌متر', desc: 'کارتن مادر سنگین با بالاترین مقاومت فشاری' }
];

export default function DielineGeneratorView({ onTransferToOrder }) {
  const [selectedBoxType, setSelectedBoxType] = useState('tuck_end');
  const [lengthMm, setLengthMm] = useState(120);
  const [widthMm, setWidthMm] = useState(60);
  const [heightMm, setHeightMm] = useState(160);
  const [selectedMaterial, setSelectedMaterial] = useState('cardboard');
  const [quantity, setQuantity] = useState(10000);

  const [loading, setLoading] = useState(false);
  const [dielineData, setDielineData] = useState(null);
  const [montageData, setMontageData] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('dieline'); // 'dieline' | 'montage'
  const [zoomScale, setZoomScale] = useState(1);

  // Run generation
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await api.generateDielineMontage({
        boxType: selectedBoxType,
        length: lengthMm,
        width: widthMm,
        height: heightMm,
        material: selectedMaterial,
        quantity: quantity,
        cardboardPricePerKg: 65000
      });

      if (res.success) {
        setDielineData(res.dieline);
        setMontageData(res.nesting);
      }
    } catch (err) {
      alert(err.message || 'خطا در محاسبه خط تیغ.');
    } finally {
      setLoading(false);
    }
  };

  // Switch box type and apply default dimensions
  const handleSelectBoxType = (bType) => {
    setSelectedBoxType(bType.id);
    setLengthMm(bType.defaultDim.l);
    setWidthMm(bType.defaultDim.w);
    setHeightMm(bType.defaultDim.h);
  };

  useEffect(() => {
    handleGenerate();
  }, [selectedBoxType, selectedMaterial]);

  // Download SVG File
  const handleDownloadSvg = () => {
    if (!dielineData?.svg) return;
    const blob = new Blob([dielineData.svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dieline-${selectedBoxType}-${lengthMm}x${widthMm}x${heightMm}mm.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentBox = BOX_TYPES.find((b) => b.id === selectedBoxType);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Box Structure Model Selector Grid */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-800">
                ۱. انتخاب ساختار هندسی جعبه (۷ مدل استاندارد خط تیغ)
              </h2>
              <span className="text-xs text-slate-500">
                محاسبه خودکار خطوط برش، خطوط تا، زبانه‌های قفل‌کننده و بادخور ضخامت متریال
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            تولید برداری وکتور SVG
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {BOX_TYPES.map((item) => {
            const isSelected = selectedBoxType === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectBoxType(item)}
                className={`p-3 rounded-2xl text-center transition flex flex-col items-center justify-between gap-1.5 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 font-black scale-[1.02]'
                    : 'bg-slate-50 hover:bg-indigo-50/60 border-slate-200 text-slate-700 hover:text-indigo-900 shadow-xs'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs leading-tight">{item.name.split('(')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Designer Grid: Controls + Visual Dieline Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Control Panel: Dimensions, Material, Quantity */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-600" />
                ۲. ابعاد و ضخامت متریال (میلی‌متر)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{currentBox?.desc}</p>
            </div>

            {/* Dimensions Inputs */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">طول (L):</label>
                <div className="relative">
                  <input
                    type="number"
                    value={lengthMm}
                    onChange={(e) => setLengthMm(Number(e.target.value))}
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
                    onChange={(e) => setWidthMm(Number(e.target.value))}
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
                    onChange={(e) => setHeightMm(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-black text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="absolute left-2 top-2 text-[10px] text-slate-400">mm</span>
                </div>
              </div>
            </div>

            {/* Material Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                ۳. جنس و ضخامت فلوت (محاسبه بادخور خط تا):
              </label>
              <div className="space-y-1.5">
                {MATERIALS.map((mat) => (
                  <label
                    key={mat.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition text-xs ${
                      selectedMaterial === mat.id
                        ? 'bg-indigo-50/80 border-indigo-400 text-indigo-950 font-bold shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="mat_select"
                        value={mat.id}
                        checked={selectedMaterial === mat.id}
                        onChange={() => setSelectedMaterial(mat.id)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{mat.name}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-100">
                      {mat.thickness}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">تیراژ تولید جهت مونتاژ شیت:</label>
              <input
                type="number"
                step="1000"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 px-4 rounded-xl shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>محاسبه مجدد خط تیغ و مونتاژ شیت</span>
            </button>
          </div>

          {/* Quick Stats Card */}
          {dielineData && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
              <h4 className="font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                شناسنامه فنی ابعاد گسترده بازشده (Flat Size)
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">عرض بازشده:</span>
                  <span className="font-black text-slate-900 text-sm mt-0.5 block font-mono">
                    {dielineData.flatDimensions.flatWidthMm} mm ({dielineData.flatDimensions.flatWidthCm} cm)
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">طول بازشده:</span>
                  <span className="font-black text-slate-900 text-sm mt-0.5 block font-mono">
                    {dielineData.flatDimensions.flatHeightMm} mm ({dielineData.flatDimensions.flatHeightCm} cm)
                  </span>
                </div>
              </div>

              {dielineData.parts?.length > 1 && (
                <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-900">
                  <span className="font-bold block mb-1">قطعات مجزای خط تیغ:</span>
                  {dielineData.parts.map((p, pIdx) => (
                    <div key={pIdx} className="flex items-center justify-between mt-0.5">
                      <span>• {p.name}:</span>
                      <strong className="font-mono">{p.flatW} × {p.flatH} mm</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Canvas Area: Live Vector Dieline Viewer & Montage */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Sub Tab Switcher: Single Dieline vs Multi-Up Sheet Montage */}
          <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('dieline')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                  activeSubTab === 'dieline'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Scissors className="w-3.5 h-3.5 text-rose-400" />
                <span>نمای برداری خط تیغ تک‌قالب (Dieline Vector)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('montage')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                  activeSubTab === 'montage'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-300" />
                <span>مونتاژ و چیدمان شیت با حداقل پرتی (Montage)</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadSvg}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
                title="دانلود فایل برداری SVG جهت ایلاستریتور، کورل دراو و لیزر"
              >
                <Download className="w-3.5 h-3.5" />
                <span>دانلود وکتور SVG</span>
              </button>

              {onTransferToOrder && dielineData && (
                <button
                  type="button"
                  onClick={() => onTransferToOrder({
                    box_type: currentBox?.name,
                    box_structure: currentBox?.name,
                    cardboard_length: dielineData.flatDimensions.flatWidthMm,
                    cardboard_width: dielineData.flatDimensions.flatHeightMm,
                    length: lengthMm / 10,
                    width: widthMm / 10,
                    height: heightMm / 10
                  })}
                  className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition border border-indigo-200 flex items-center gap-1"
                >
                  <span>ثبت سفارش با این خط تیغ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* VIEW 1: SINGLE DIELINE VECTOR VIEWER */}
          {activeSubTab === 'dieline' && dielineData && (
            <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[480px]">
              {/* Legend & Help Bar */}
              <div className="absolute top-4 right-4 left-4 flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-xl z-10 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-3 h-0.5 bg-rose-500 rounded-full" />
                    خط تیغ و برش (Cut: ممتد قرمز)
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-3 h-0.5 border-b border-dashed border-blue-400" />
                    خط تا و خط‌کشی (Crease: خط‌چین آبی)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoomScale((z) => Math.min(2, z + 0.15))}
                    className="p-1 hover:text-white transition"
                    title="بزرگنمایی"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale((z) => Math.max(0.5, z - 0.15))}
                    className="p-1 hover:text-white transition"
                    title="کوچک‌نمایی"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale(1)}
                    className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 rounded hover:text-white"
                  >
                    {Math.round(zoomScale * 100)}%
                  </button>
                </div>
              </div>

              {/* Rendered SVG Vector Container */}
              <div
                className="w-full flex items-center justify-center overflow-auto p-8 transition-transform duration-200 mt-6"
                style={{ transform: `scale(${zoomScale})` }}
                dangerouslySetInnerHTML={{ __html: dielineData.svg }}
              />

              <div className="absolute bottom-3 right-4 text-[10px] text-slate-500 font-mono">
                Arman Amiran AI Parametric Dieline Engine | Scale 1:1
              </div>
            </div>
          )}

          {/* VIEW 2: MULTI-UP SHEET MONTAGE & NESTING */}
          {activeSubTab === 'montage' && montageData && (
            <div className="space-y-4">
              {/* Best Montage Recommendation Banner */}
              <div className="p-5 bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/30 rounded-3xl text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-emerald-400 font-bold block">بهترین چیدمان و کمترین پرتی مقوا:</span>
                    <h3 className="text-base font-black text-white">
                      شیت {montageData.bestChoice?.sheetName} ({montageData.bestChoice?.boxesPerSheet} جعبه در هر شیت)
                    </h3>
                    <p className="text-xs text-emerald-300/80 mt-0.5">
                      فقط {montageData.bestChoice?.wastePercentage}٪ پرت مقوا | {montageData.bestChoice?.efficiencyPercentage}٪ راندمان مفید سطح
                    </p>
                  </div>
                </div>

                <div className="text-left border-r border-emerald-500/20 pr-4">
                  <span className="text-xs text-slate-400 block">شیت مورد نیاز برای تیراژ:</span>
                  <span className="text-lg font-black text-white font-mono">
                    {montageData.bestChoice?.sheetsNeeded?.toLocaleString('fa-IR')} برگ
                  </span>
                </div>
              </div>

              {/* Sheet Assembly Visual Canvas */}
              <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col items-center justify-center min-h-[380px]">
                <div className="text-xs font-bold text-slate-400 mb-3 flex items-center justify-between w-full">
                  <span>نمای شماتیک مونتاژ و چیدمان زینک / قالب در شیت {montageData.bestChoice?.sheetLength} × {montageData.bestChoice?.sheetWidth} cm</span>
                  <span className="text-amber-400">جهت چیدمان: {montageData.bestChoice?.orientation}</span>
                </div>

                <div
                  className="relative bg-white rounded-xl shadow-2xl border-4 border-amber-400 p-3 flex flex-wrap content-start gap-1 transition-all"
                  style={{
                    width: `${Math.min(520, montageData.bestChoice?.sheetLength * 4.6)}px`,
                    height: `${Math.min(360, montageData.bestChoice?.sheetWidth * 4.6)}px`
                  }}
                >
                  {/* Gripper indicator */}
                  <div className="absolute top-0 right-0 left-0 h-2 bg-rose-500/30 text-[8px] text-rose-800 font-bold text-center leading-none">
                    لب‌پنجه ماشین چاپ (Gripper Margin: 1.5cm)
                  </div>

                  {Array.from({ length: montageData.bestChoice?.boxesPerSheet || 2 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="bg-indigo-50 border-2 border-indigo-400 hover:border-indigo-600 rounded flex flex-col items-center justify-center text-[10px] text-indigo-950 font-bold select-none cursor-pointer"
                      style={{
                        width: `${(100 / (montageData.bestChoice?.cols || 2)) - 2}%`,
                        height: `${(100 / (montageData.bestChoice?.rows || 2)) - 3}%`
                      }}
                    >
                      <span>قالب #{idx + 1}</span>
                      <span className="text-[9px] text-indigo-600">{lengthMm}×{widthMm}</span>
                    </div>
                  ))}
                </div>

                <div className="w-full grid grid-cols-3 gap-3 text-center text-xs mt-4">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-300">
                    <span className="text-slate-500 block text-[10px]">تعداد در فرم (Ups)</span>
                    <strong className="text-emerald-400 text-sm font-black">{montageData.bestChoice?.boxesPerSheet} عدد</strong>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-300">
                    <span className="text-slate-500 block text-[10px]">وزن کل مقوای سفارش</span>
                    <strong className="text-white text-sm font-black font-mono">{montageData.bestChoice?.totalWeightKg} کیلوگرم</strong>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-300">
                    <span className="text-slate-500 block text-[10px]">هزینه مقوای هر جعبه</span>
                    <strong className="text-amber-400 text-sm font-black">{montageData.bestChoice?.cardboardCostPerBox} تومان</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
