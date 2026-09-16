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
  Maximize
} from 'lucide-react';
import { api } from '../api/client';

const BOX_TYPES = [
  {
    id: 'tuck_end',
    name: 'سر و ته دارویی (دو طرف درب مقوایی)',
    ecmaCode: 'ECMA A20.20.03.01',
    desc: 'استاندارد جهانی کارتن‌های تاشو دارویی و بهداشتی با گوشواره‌های قفل اصطکاکی (Friction Lock) و زبانه‌های پخ‌دار',
    icon: '💊',
    defaultDim: { l: 80, w: 15, h: 165 },
    isMultiPart: false,
    formulaExpl: 'منطبق بر کد بین‌المللی ECMA A20.20.03.01 شامل ۴ وجه اصلی، زبانه لب‌چسب ۱۵ میلی‌متری با پخ ۱۵ درجه، گردگیرهای گوشه با زاویه برش ۳۰ درجه و درب‌های قفل اصطکاکی با انحنای R=5mm.'
  },
  {
    id: 'sleeve_drawer',
    name: 'کشویی کبریتی (Sleeve & Drawer)',
    ecmaCode: 'ECMA F10.02.01',
    desc: 'کاور دورپیچ بیرونی با جای انگشت + کشوی متحرک ریلی داخلی با دیواره‌های دوبل قفل‌شونده',
    icon: '🗃️',
    defaultDim: { l: 92, w: 55, h: 20 },
    isMultiPart: true,
    formulaExpl: 'منطبق بر کد بین‌المللی ECMA F10.02.01 با محاسبه بادخور ۲ برابری ضخامت مقوا (+1.5mm) در کاور دورپیچ و پروانه‌های گوشه ۴۵ درجه در کشوی دوبل.'
  },
  {
    id: 'snap_lock_bottom',
    name: 'سر دارویی ته قفلی (Lock-Bottom)',
    ecmaCode: 'ECMA A20.40.01',
    desc: 'درب بالا دارویی + ۴ زبانه قفل‌شونده خودکار ۴۵ درجه در کف برای تحمل وزن بالا بدون چسب کف',
    icon: '🔒',
    defaultDim: { l: 140, w: 80, h: 180 },
    isMultiPart: false,
    formulaExpl: 'منطبق بر استاندارد ECMA A20.40.01 با زوایای برش ۴۵ درجه و شیار قفل مرکزی خودچفت‌شونده.'
  },
  {
    id: 'keyboard',
    name: 'کیبوردی سرهم‌شونده (Mailer Box)',
    ecmaCode: 'FEFCO 0427 / ECMA C20.20',
    desc: 'جعبه لپ‌تاپی، پستی و آنلاین‌شاپ با دیواره‌های دوبل ضخیم و قفل سرخود بدون نیاز به چسب',
    icon: '🎹',
    defaultDim: { l: 200, w: 150, h: 50 },
    isMultiPart: false,
    formulaExpl: 'منطبق بر استاندارد FEFCO 0427 با دیواره‌های کناری دولایه تاشو و زبانه‌های قفل‌شونده در کف و درب یکپارچه.'
  },
  {
    id: 'american',
    name: 'آمریکایی ۴ درب (RSC Carton)',
    ecmaCode: 'FEFCO 0201',
    desc: 'کارتن مادر صنعتی استاندارد ۴ درب بالا و پایین با لبه اتصال چسب یا منگنه صنعتی',
    icon: '📦',
    defaultDim: { l: 300, w: 200, h: 250 },
    isMultiPart: false,
    formulaExpl: 'منطبق بر استاندارد FEFCO 0201 با ارتفاع درب‌های هم‌پوشان برابر نصف عرض کارتن (W/2).'
  },
  {
    id: 'base_lid',
    name: 'زیره و رویه (iPhone Style Base & Lid)',
    ecmaCode: 'FEFCO 0301 / ECMA D20.20',
    desc: 'جعبه دو تکه لوکس کادویی، موبایل، طلا و ساعت با بادخور دقیق رویه نسبت به زیره',
    icon: '📱',
    defaultDim: { l: 160, w: 90, h: 40 },
    isMultiPart: true,
    formulaExpl: 'منطبق بر استاندارد FEFCO 0301 با بادخور تلسکوپی رویه جهت ایجاد مکش هوایی ملایم.'
  },
  {
    id: 'tray',
    name: 'کفی بدون در (Open Tray)',
    ecmaCode: 'FEFCO 0422',
    desc: 'سینی مقوایی و کارتنی روباز برای میوه، قطعات صنعتی و بسته‌بندی شیرینی',
    icon: '📥',
    defaultDim: { l: 250, w: 180, h: 60 },
    isMultiPart: false,
    formulaExpl: 'منطبق بر استاندارد FEFCO 0422 با دیواره‌های تقویت‌شده و زبانه‌های قفل گوشه.'
  }
];

const MATERIALS = [
  { id: 'cardboard', name: 'جعبه مقوایی (ایندربرد / پشت طوسی)', thickness: '۰.۵ میلی‌متر', defaultGsm: 300, desc: 'کارتن‌های تاشو سبک، دارویی و آرایشی' },
  { id: 'flute_e', name: 'کارتن لمینتی E-Flute (ای فلوت)', thickness: '۱.۵ میلی‌متر', defaultGsm: 450, desc: 'مقاومت خمشی عالی با قابلیت چاپ افست لمینتی' },
  { id: 'flute_b', name: 'کارتن B-Flute (بی فلوت)', thickness: '۳.۰ میلی‌متر', defaultGsm: 550, desc: 'استحکام بالا جهت حمل قطعات و کارتن متوسط' },
  { id: 'flute_c', name: 'کارتن C-Flute (سی فلوت)', thickness: '۴.۰ میلی‌متر', defaultGsm: 650, desc: 'کارتن مادر سنگین با بالاترین مقاومت فشاری' }
];

export default function DielineGeneratorView({ onTransferToOrder }) {
  const [selectedBoxType, setSelectedBoxType] = useState('tuck_end');
  const [lengthMm, setLengthMm] = useState(80);
  const [widthMm, setWidthMm] = useState(15);
  const [heightMm, setHeightMm] = useState(165);
  const [selectedMaterial, setSelectedMaterial] = useState('cardboard');
  const [quantity, setQuantity] = useState(10000);
  const [cardboardPricePerKg, setCardboardPricePerKg] = useState(65000);
  const [customSheetW, setCustomSheetW] = useState('');
  const [customSheetH, setCustomSheetH] = useState('');

  const [loading, setLoading] = useState(false);
  const [dielineData, setDielineData] = useState(null);
  const [montageResult, setMontageResult] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('dieline'); // Default to dieline view to clearly show all side dimensions
  const [montageMode, setMontageMode] = useState('auto');
  const [selectedSheetId, setSelectedSheetId] = useState('sheet_70x100');
  const [zoomScale, setZoomScale] = useState(1);
  const [cadTheme, setCadTheme] = useState('light'); // 'light' or 'dark'

  // Apply Sample: Tuck End 8 x 1.5 x 16.5 cm
  const handleApplyTuckEndSample = () => {
    setSelectedBoxType('tuck_end');
    setLengthMm(80);
    setWidthMm(15);
    setHeightMm(165);
    setSelectedMaterial('cardboard');
    setSelectedSheetId('sheet_70x100');
  };

  // Run calculation
  const handleGenerate = async (forcedMode = null) => {
    setLoading(true);
    const effectiveMode = forcedMode || montageMode;
    try {
      const payload = {
        boxType: selectedBoxType,
        length: Number(lengthMm),
        width: Number(widthMm),
        height: Number(heightMm),
        material: selectedMaterial,
        quantity: Number(quantity),
        cardboardPricePerKg: Number(cardboardPricePerKg),
        montageMode: effectiveMode
      };

      if (customSheetW && customSheetH && Number(customSheetW) > 10 && Number(customSheetH) > 10) {
        payload.customSheet = {
          widthMm: Number(customSheetW) * 10,
          heightMm: Number(customSheetH) * 10
        };
      }

      const res = await api.generateDielineMontage(payload);

      if (res.success) {
        setDielineData(res.dieline);
        setMontageResult(res);
        if (!selectedSheetId || !res.allSheets?.some(s => s.sheetId === selectedSheetId)) {
          setSelectedSheetId(res.bestChoice?.sheetId || 'sheet_70x100');
        }
      }
    } catch (err) {
      alert(err.message || 'خطا در محاسبه خط تیغ و مونتاژ.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBoxType = (bType) => {
    setSelectedBoxType(bType.id);
    setLengthMm(bType.defaultDim.l);
    setWidthMm(bType.defaultDim.w);
    setHeightMm(bType.defaultDim.h);
  };

  useEffect(() => {
    handleGenerate();
  }, [selectedBoxType, selectedMaterial]);

  // Download Single Dieline SVG
  const handleDownloadDielineSvg = () => {
    if (!dielineData?.svg) return;
    const blob = new Blob([dielineData.svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ArtiosCAD-Dieline-${selectedBoxType}-${lengthMm}x${widthMm}x${heightMm}mm-Dimensions.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download Full Multi-Up Sheet Montage SVG
  const handleDownloadSheetMontageSvg = () => {
    const currentSheet = montageResult?.allSheets?.find(s => s.sheetId === selectedSheetId) || montageResult?.bestChoice;
    if (!currentSheet?.montageSvg) return;
    const blob = new Blob([currentSheet.montageSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ArtiosCAD-Sheet-Layout-${selectedBoxType}-${currentSheet.sheetLength}x${currentSheet.sheetWidth}cm-${currentSheet.boxesPerSheet}ups.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentBox = BOX_TYPES.find((b) => b.id === selectedBoxType);
  const activeSheet = montageResult?.allSheets?.find(s => s.sheetId === selectedSheetId) || montageResult?.bestChoice;

  // Compute Edge Breakdown Details for Table
  const L = Number(lengthMm);
  const W = Number(widthMm);
  const H = Number(heightMm);
  const glueW = dielineData?.material?.glueWidth || 15;
  const flapH = W;
  const tuckH = Math.max(12, Math.min(24, Math.round(W * 0.75 + 3)));

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 text-white shadow-xl flex items-center justify-between flex-wrap gap-4 border border-indigo-500/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-amber-300 shadow-inner font-black text-sm">
            CAD
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-white">
                موتور خط تیغ و مونتاژ ESKO ArtiosCAD با اندازه‌گذاری کامل تمام اضلاع
              </h2>
              <span className="text-[11px] bg-emerald-400 text-slate-950 px-2.5 py-0.5 rounded-full font-black">
                ابعاد روی تک‌تک اضلاع و لبه‌ها
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-1">
              درج فلش‌های اندازه‌گذاری فنی (CAD Dimensions)، ابعاد هر وجه، لبه چسب، زبانه درب، گردگیرها و ابعاد کلی گسترده
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleApplyTuckEndSample}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>بارگذاری نمونه درخواستی (۸ × ۱.۵ × ۱۶.۵ سانت)</span>
        </button>
      </div>

      {/* 1. ECMA / FEFCO Standards Selector */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-800">
                ۱. انتخاب ساختار جعبه و استاندارد ArtiosCAD
              </h2>
              <span className="text-xs text-slate-500">
                کدهای استاندارد بین‌المللی کارتن تاشو (ECMA) و مقوای فلوتینگ (FEFCO)
              </span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            {currentBox?.ecmaCode}
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
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${isSelected ? 'bg-indigo-800 text-indigo-200' : 'text-slate-400'}`}>
                  {item.ecmaCode.split('/')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Inputs + Interactive ArtiosCAD Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Parameters & CAD Rule Meterage */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-600" />
                ۲. ابعاد نهایی، کالیپر و متریال
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{currentBox?.desc}</p>
            </div>

            {/* Inputs */}
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

            {/* Material */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                ۳. جنس متریال و کالیپر (Caliper):
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

            {/* Quantity & Cardboard Price */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">تیراژ سفارش:</label>
                <input
                  type="number"
                  step="1000"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">قیمت هر کیلو مقوا:</label>
                <div className="relative">
                  <input
                    type="number"
                    step="1000"
                    value={cardboardPricePerKg}
                    onChange={(e) => setCardboardPricePerKg(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <span className="absolute left-2 top-2 text-[10px] text-slate-400">تومان</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 px-4 rounded-xl shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>محاسبه و رسم ابعاد اضلاع در ArtiosCAD</span>
            </button>
          </div>

          {/* Edge Dimensions Breakdown Table */}
          {dielineData && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
              <h4 className="font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Ruler className="w-4 h-4 text-indigo-600" />
                جدول ابعاد دقیق تمام اضلاع و لبه‌ها (CAD Spec)
              </h4>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between p-2 bg-blue-50/60 rounded-xl border border-blue-100">
                  <span className="text-slate-700 font-sans font-bold">طول بدنه رو و پشت (L):</span>
                  <strong className="text-blue-700 font-black">{L} mm ({L / 10} cm)</strong>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50/60 rounded-xl border border-purple-100">
                  <span className="text-slate-700 font-sans font-bold">عرض عطف‌های چپ و راست (W):</span>
                  <strong className="text-purple-700 font-black">{W} mm ({W / 10} cm)</strong>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-700 font-sans font-bold">ارتفاع کامل بدنه (H):</span>
                  <strong className="text-slate-900 font-black">{H} mm ({H / 10} cm)</strong>
                </div>
                <div className="flex items-center justify-between p-2 bg-sky-50/60 rounded-xl border border-sky-100">
                  <span className="text-slate-700 font-sans font-bold">عرض زبانه لب‌چسب:</span>
                  <strong className="text-sky-700 font-black">{glueW} mm</strong>
                </div>
                <div className="flex items-center justify-between p-2 bg-rose-50/60 rounded-xl border border-rose-100">
                  <span className="text-slate-700 font-sans font-bold">ارتفاع درب‌های بالا و پایین:</span>
                  <strong className="text-rose-700 font-black">{flapH} mm (درب) + {tuckH} mm (زبانه)</strong>
                </div>
                <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-xl border border-emerald-200 font-sans">
                  <span className="text-emerald-950 font-bold">کل ابعاد گسترده (شیت):</span>
                  <strong className="text-emerald-700 font-mono font-black">
                    {dielineData.flatDimensions.flatWidthMm} × {dielineData.flatDimensions.flatHeightMm} mm
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Rule Length Specs */}
          {dielineData && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
              <h4 className="font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Scissors className="w-4 h-4 text-emerald-600" />
                متراژ تیغ و خط‌تا برای قالب‌سازی
              </h4>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
                  <span className="text-rose-600 block text-[10px] font-bold">تیغ برش (Cut)</span>
                  <strong className="font-black text-rose-950 text-xs mt-0.5 block font-mono">
                    {dielineData.ruleLengthMeters?.cutRuleMeters} متر
                  </strong>
                </div>
                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-blue-600 block text-[10px] font-bold">خط‌تا (Crease)</span>
                  <strong className="font-black text-blue-950 text-xs mt-0.5 block font-mono">
                    {dielineData.ruleLengthMeters?.creaseRuleMeters} متر
                  </strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-bold">کل متراژ قالب</span>
                  <strong className="font-black text-slate-900 text-xs mt-0.5 block font-mono">
                    {dielineData.ruleLengthMeters?.totalRuleMeters} متر
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Visual Canvas with Edge Dimensions */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Top Control Bar: View Switcher & Download */}
          <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveSubTab('dieline')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                  activeSubTab === 'dieline'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Ruler className="w-3.5 h-3.5 text-amber-300" />
                <span>نقشه خط تیغ با اندازه‌گذاری تمام اضلاع (CAD Dieline)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('montage')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                  activeSubTab === 'montage'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>چیدمان و مونتاژ شیت چاپ</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {activeSubTab === 'dieline' ? (
                <button
                  type="button"
                  onClick={handleDownloadDielineSvg}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
                  title="دانلود وکتور SVG خط تیغ با تمام خطوط و مقادیر اندازه‌گذاری"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>دانلود SVG با ابعاد اضلاع</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDownloadSheetMontageSvg}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>دانلود وکتور شیت مونتاژ</span>
                </button>
              )}

              {onTransferToOrder && dielineData && (
                <button
                  type="button"
                  onClick={() => onTransferToOrder({
                    box_type: currentBox?.name,
                    box_structure: currentBox?.ecmaCode,
                    cardboard_length: dielineData.flatDimensions.flatWidthMm,
                    cardboard_width: dielineData.flatDimensions.flatHeightMm,
                    length: lengthMm / 10,
                    width: widthMm / 10,
                    height: heightMm / 10
                  })}
                  className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition border border-indigo-200 flex items-center gap-1"
                >
                  <span>ثبت سفارش</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* VIEW 1: SINGLE DIELINE VECTOR VIEWER WITH EDGE DIMENSIONS */}
          {activeSubTab === 'dieline' && dielineData && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[560px]">
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
                    خطوط اندازه‌گذاری اضلاع (CAD)
                  </span>
                  <span className="text-slate-500">
                    ابعاد بسته: <strong className="text-slate-900 font-mono font-black">{lengthMm} × {widthMm} × {heightMm} mm</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoomScale((z) => Math.min(2.5, z + 0.2))}
                    className="p-1 hover:bg-slate-200 rounded text-slate-700 transition"
                    title="بزرگنمایی"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale((z) => Math.max(0.4, z - 0.2))}
                    className="p-1 hover:bg-slate-200 rounded text-slate-700 transition"
                    title="کوچک‌نمایی"
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

              {/* Rendered SVG Vector Container */}
              <div
                className="w-full flex items-center justify-center overflow-auto p-4 transition-transform duration-200 bg-white rounded-2xl border border-slate-100 shadow-inner"
                style={{ transform: `scale(${zoomScale})` }}
                dangerouslySetInnerHTML={{ __html: dielineData.svg }}
              />

              <div className="w-full flex items-center justify-between text-[10px] text-slate-400 font-mono mt-3 px-2">
                <span>ESKO ArtiosCAD 23.07 Edge Dimensioning Engine</span>
                <span>Scale 1:1 Vector Drawing</span>
              </div>
            </div>
          )}

          {/* VIEW 2: INTERACTIVE SHEET MONTAGE */}
          {activeSubTab === 'montage' && montageResult && (
            <div className="space-y-4">
              
              {/* Sheet Selection Pills */}
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

              {/* Sheet Montage Canvas */}
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

                  {/* Zoom Controls */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-2xl z-10 backdrop-blur-sm text-white">
                    <button
                      type="button"
                      onClick={() => setZoomScale((z) => Math.min(2.0, z + 0.15))}
                      className="p-1 text-slate-300 hover:text-white transition"
                      title="بزرگنمایی"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomScale((z) => Math.max(0.5, z - 0.15))}
                      className="p-1 text-slate-300 hover:text-white transition"
                      title="کوچک‌نمایی"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomScale(1)}
                      className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded hover:text-white"
                    >
                      {Math.round(zoomScale * 100)}%
                    </button>
                  </div>
                </div>
              )}

              {/* Economic & Material Statistics Cards */}
              {activeSheet && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
                    <span className="text-slate-400 block text-[11px] mb-1">تعداد در فرم (Ups)</span>
                    <strong className="text-indigo-600 text-base font-black font-mono">
                      {activeSheet.boxesPerSheet} قالب
                    </strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">در هر شیت مقوا</span>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
                    <span className="text-slate-400 block text-[11px] mb-1">شیت مورد نیاز تیراژ</span>
                    <strong className="text-slate-900 text-base font-black font-mono">
                      {activeSheet.sheetsNeeded?.toLocaleString('fa-IR')} برگ
                    </strong>
                    <span className="text-[10px] text-emerald-600 block mt-0.5 font-bold">شامل ۵٪ اضافه چاپ</span>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
                    <span className="text-slate-400 block text-[11px] mb-1">وزن کل مقوای سفارش</span>
                    <strong className="text-slate-900 text-base font-black font-mono">
                      {activeSheet.totalWeightKg?.toLocaleString('fa-IR')} kg
                    </strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">گرماژ {montageResult.grammage} gsm</span>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
                    <span className="text-slate-400 block text-[11px] mb-1">هزینه مقوای هر جعبه</span>
                    <strong className="text-amber-600 text-base font-black font-mono">
                      {activeSheet.cardboardCostPerBox?.toLocaleString('fa-IR')} تومان
                    </strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      کل: {activeSheet.totalCardboardCost?.toLocaleString('fa-IR')} ت
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
