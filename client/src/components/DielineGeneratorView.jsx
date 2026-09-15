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
  Cpu
} from 'lucide-react';
import { api } from '../api/client';

const BOX_TYPES = [
  {
    id: 'sleeve_drawer',
    name: 'کشویی کبریتی (Sleeve & Drawer)',
    desc: 'جعبه دو تکه شامل کاور دورپیچ بیرونی با جای انگشت + کشوی متحرک ریلی با دیواره‌های دوبل قفل‌شونده',
    icon: '🗃️',
    defaultDim: { l: 92, w: 55, h: 20 },
    isMultiPart: true,
    formulaExpl: 'ابعاد کاور با بادخور ۲ برابری ضخامت مقوا (+1.5mm) محاسبه شده و کشوی داخلی دارای پروانه‌های گوشه ۴۵ درجه و لبه‌های دوبل جهت قفل بدون چسب است.'
  },
  {
    id: 'tuck_end',
    name: 'سر و ته دارویی (Tuck End)',
    desc: 'پرکاربردترین جعبه دارویی، بهداشتی و آرایشی با زبانه‌های قفل‌شونده در بالا و پایین و لبه چسب استاندارد',
    icon: '💊',
    defaultDim: { l: 120, w: 60, h: 160 },
    isMultiPart: false,
    formulaExpl: 'شامل ۴ وجه اصلی، زبانه لب‌چسب ۱۵ میلی‌متری، زبانه‌های گردگیر گوشه با پخ ۳۰ درجه و درب قفل‌شونده با گوشواره‌های اصطکاکی.'
  },
  {
    id: 'snap_lock_bottom',
    name: 'سر دارویی ته قفلی (Lock-Bottom)',
    desc: 'درب بالا دارویی + ۴ زبانه زاویه‌دار ۴۵ درجه قفل‌شونده خودکار در کف جعبه برای تحمل وزن بالا بدون چسب کف',
    icon: '🔒',
    defaultDim: { l: 140, w: 80, h: 180 },
    isMultiPart: false,
    formulaExpl: 'کف جعبه شامل ۴ زبانه با زوایای برش ۴۵ درجه و شیار قفل مرکزی است که با فشار دست به صورت خودکار در هم چفت و قفل می‌شوند.'
  },
  {
    id: 'keyboard',
    name: 'کیبوردی سرهم‌شونده (Mailer Box)',
    desc: 'جعبه لپ‌تاپی، پستی و آنلاین‌شاپ با دیواره‌های دوبل ضخیم و قفل سرخود بدون نیاز به چسب',
    icon: '🎹',
    defaultDim: { l: 200, w: 150, h: 50 },
    isMultiPart: false,
    formulaExpl: 'دارای دیواره‌های کناری دولایه تاشو و زبانه‌های قفل‌شونده در کف و درب یکپارچه که استحکام بالایی در برابر ضربه و فشار ایجاد می‌کند.'
  },
  {
    id: 'american',
    name: 'آمریکایی ۴ درب (RSC Carton)',
    desc: 'کارتن مادر صنعتی استاندارد ۴ درب بالا و پایین با لبه اتصال چسب یا منگنه صنعتی',
    icon: '📦',
    defaultDim: { l: 300, w: 200, h: 250 },
    isMultiPart: false,
    formulaExpl: 'ارتفاع درب‌های بالا و پایین برابر نصف عرض کارتن (W/2) است تا هنگام تا شدن دقیقاً در مرکز به هم برسند.'
  },
  {
    id: 'base_lid',
    name: 'زیره و رویه (iPhone Style Base & Lid)',
    desc: 'جعبه دو تکه لوکس کادویی، موبایل، طلا و ساعت با بادخور دقیق رویه نسبت به زیره',
    icon: '📱',
    defaultDim: { l: 160, w: 90, h: 40 },
    isMultiPart: true,
    formulaExpl: 'ابعاد رویه با بادخور مهندسی شده متریال نسبت به زیره بزرگ‌تر محاسبه می‌شود تا رویه به راحتی و با مکش ملایم روی زیره قرار گیرد.'
  },
  {
    id: 'tray',
    name: 'کفی بدون در (Open Tray)',
    desc: 'سینی مقوایی و کارتنی روباز برای میوه، قطعات صنعتی و بسته‌بندی شیرینی',
    icon: '📥',
    defaultDim: { l: 250, w: 180, h: 60 },
    isMultiPart: false,
    formulaExpl: 'کفی یکپارچه با دیواره‌های تاشو و گوشه‌های تقویت‌شده با قفل‌های سرخود.'
  }
];

const MATERIALS = [
  { id: 'cardboard', name: 'جعبه مقوایی (ایندربرد / پشت طوسی)', thickness: '۰.۵ میلی‌متر', defaultGsm: 300, desc: 'مناسب جعبه‌های سبک، دارویی و آرایشی' },
  { id: 'flute_e', name: 'کارتن لمینتی E-Flute (ای فلوت)', thickness: '۱.۵ میلی‌متر', defaultGsm: 450, desc: 'مقاومت خمشی عالی با قابلیت چاپ افست لمینتی' },
  { id: 'flute_b', name: 'کارتن B-Flute (بی فلوت)', thickness: '۳.۰ میلی‌متر', defaultGsm: 550, desc: 'استحکام بالا جهت حمل قطعات و کارتن متوسط' },
  { id: 'flute_c', name: 'کارتن C-Flute (سی فلوت)', thickness: '۴.۰ میلی‌متر', defaultGsm: 650, desc: 'کارتن مادر سنگین با بالاترین مقاومت فشاری' }
];

export default function DielineGeneratorView({ onTransferToOrder }) {
  const [selectedBoxType, setSelectedBoxType] = useState('sleeve_drawer');
  const [lengthMm, setLengthMm] = useState(92);
  const [widthMm, setWidthMm] = useState(55);
  const [heightMm, setHeightMm] = useState(20);
  const [selectedMaterial, setSelectedMaterial] = useState('cardboard');
  const [quantity, setQuantity] = useState(10000);
  const [cardboardPricePerKg, setCardboardPricePerKg] = useState(65000);
  const [customSheetW, setCustomSheetW] = useState('');
  const [customSheetH, setCustomSheetH] = useState('');

  const [loading, setLoading] = useState(false);
  const [dielineData, setDielineData] = useState(null);
  const [montageResult, setMontageResult] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('montage'); // 'dieline' | 'montage'
  const [montageMode, setMontageMode] = useState('combo'); // 'combo' | 'part1' | 'part2'
  const [selectedSheetId, setSelectedSheetId] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [hoveredItem, setHoveredItem] = useState(null);

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
          setSelectedSheetId(res.bestChoice?.sheetId);
        }
      }
    } catch (err) {
      alert(err.message || 'خطا در محاسبه خط تیغ و مونتاژ.');
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

  // Download Single Dieline SVG
  const handleDownloadDielineSvg = () => {
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

  // Download Full Multi-Up Sheet Montage SVG
  const handleDownloadSheetMontageSvg = () => {
    const currentSheet = montageResult?.allSheets?.find(s => s.sheetId === selectedSheetId) || montageResult?.bestChoice;
    if (!currentSheet?.montageSvg) return;
    const blob = new Blob([currentSheet.montageSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sheet-montage-${selectedBoxType}-${currentSheet.sheetLength}x${currentSheet.sheetWidth}cm-${currentSheet.boxesPerSheet}ups.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentBox = BOX_TYPES.find((b) => b.id === selectedBoxType);
  const activeSheet = montageResult?.allSheets?.find(s => s.sheetId === selectedSheetId) || montageResult?.bestChoice;

  return (
    <div className="space-y-6" dir="rtl">
      {/* 1. Box Model Selector */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-800">
                ۱. انتخاب ساختار هندسی جعبه (۷ مدل استاندارد خط تیغ)
              </h2>
              <span className="text-xs text-slate-500">
                محاسبه ریاضی خطوط برش، خطوط تا، بادخور ضخامت متریال و چیدمان بدون پرتی
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            دقت ۱۰۰٪ برداری با تفکیک خط تیغ و تا
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

      {/* Main Grid: Inputs + Interactive Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Parameters & Dieline Specifications */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-600" />
                ۲. ابعاد نهایی جعبه و جنس متریال (میلی‌متر)
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
                <label className="font-bold text-slate-700 block mb-1">ارتفاع/عمق (H):</label>
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
                ۳. جنس مقوا / کارتن (محاسبه بادخور خط تا):
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="absolute left-2 top-2 text-[10px] text-slate-400">تومان</span>
                </div>
              </div>
            </div>

            {/* Custom Sheet (Optional) */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-700 block text-[11px]">
                شیت اختصاصی / رول بازکنی سفارشی (اختیاری - بر حسب سانتی‌متر):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="طول شیت (مثلاً ۶۳)"
                  value={customSheetW}
                  onChange={(e) => setCustomSheetW(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                />
                <input
                  type="number"
                  placeholder="عرض شیت (مثلاً ۸۸)"
                  value={customSheetH}
                  onChange={(e) => setCustomSheetH(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 px-4 rounded-xl shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>محاسبه مجدد خط تیغ و بهینه‌سازی چیدمان شیت</span>
            </button>
          </div>

          {/* Dieline Mathematical Accuracy Proof */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
            <h4 className="font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              آیا این خط تیغ دقیق و آماده تولید است؟
            </h4>

            <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-[11px] text-emerald-950 space-y-1.5 leading-relaxed">
              <p className="font-bold text-emerald-900 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                بله، این خط تیغ با استانداردهای کارخانه‌ای محاسبه شده است:
              </p>
              <ul className="space-y-1 text-slate-700 mr-3 list-disc">
                <li>{currentBox?.formulaExpl}</li>
                <li>ضخامت متریال ({MATERIALS.find(m => m.id === selectedMaterial)?.thickness}) در خطوط تا و بادخورها لحاظ شده است.</li>
                <li>خطوط قرمز نشان‌دهنده تیغ برش (Cut) و خطوط آبی خط‌چین نشان‌دهنده خط‌کشی و تا (Crease) هستند.</li>
                <li>وکتور SVG خروجی استاندارد ۱:۱ جهت بازگشایی در CorelDraw، Illustrator و دستگاه لیزر قالب‌سازی است.</li>
              </ul>
            </div>

            {dielineData?.parts?.length > 1 && (
              <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-[11px] text-indigo-950 space-y-2">
                <span className="font-black block text-indigo-900">مشخصات مجزای قطعات بازشده:</span>
                {dielineData.parts.map((p, pIdx) => (
                  <div key={pIdx} className="flex items-center justify-between border-t border-indigo-100/60 pt-1.5">
                    <span className="font-medium">• {p.name}:</span>
                    <strong className="font-mono bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-700">
                      {p.flatW} × {p.flatH} mm ({p.areaCm2} cm²)
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Visual Montage & Dieline Canvas */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Top Control Bar: Mode Switcher & Download Actions */}
          <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
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
                <span>مونتاژ و چیدمان شیت با حداقل پرتی</span>
              </button>

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
                <span>نمای مهندسی خط تیغ تک</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {activeSubTab === 'montage' ? (
                <button
                  type="button"
                  onClick={handleDownloadSheetMontageSvg}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
                  title="دانلود وکتور SVG کامل فرم چیدمان شیت برای لیتوگرافی و قالب‌سازی"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>دانلود وکتور فرم شیت</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDownloadDielineSvg}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
                  title="دانلود وکتور SVG خط تیغ تک"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>دانلود وکتور خط تیغ</span>
                </button>
              )}

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
                  <span>ثبت سفارش</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* VIEW 1: INTERACTIVE MULTI-UP SHEET MONTAGE & PACKING */}
          {activeSubTab === 'montage' && montageResult && (
            <div className="space-y-4">
              
              {/* Multi-Part Montage Mode Switcher (برای جعبه‌های کشویی یا زیره رویه) */}
              {currentBox?.isMultiPart && (
                <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-900 font-black">
                    <Grid className="w-4 h-4 text-amber-700" />
                    <span>روش فرم‌بندی جعبه دو تکه:</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setMontageMode('combo'); handleGenerate('combo'); }}
                      className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                        montageMode === 'combo'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      🌟 فرم ترکیبی جفتی (چاپ همزمان کاور + کشو در یک شیت)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMontageMode('part1'); handleGenerate('part1'); }}
                      className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                        montageMode === 'part1'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      📦 فرم اختصاصی کشو
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMontageMode('part2'); handleGenerate('part2'); }}
                      className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                        montageMode === 'part2'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      📄 فرم اختصاصی کاور
                    </button>
                  </div>
                </div>
              )}

              {/* Sheet Selection Pills */}
              <div className="bg-white rounded-2xl p-3 border border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
                <span className="text-slate-400 font-bold whitespace-nowrap pl-2 border-l border-slate-200">انتخاب شیت:</span>
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
                      {isBest && <span className="text-amber-300">★</span>}
                    </button>
                  );
                })}
              </div>

              {/* Sheet Montage Visual Canvas */}
              {activeSheet && (
                <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden min-h-[460px]">
                  
                  {/* Top Canvas Bar */}
                  <div className="w-full flex items-center justify-between text-xs text-slate-300 border-b border-slate-800 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        فرم چیدمان شیت {activeSheet.sheetLength} × {activeSheet.sheetWidth} سانتی‌متر
                      </span>
                      <span className="bg-indigo-900/80 text-indigo-300 border border-indigo-700 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                        {activeSheet.boxesPerSheet} عدد در هر شیت
                      </span>
                    </div>

                    <div className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                      <span>راندمان سطح: {activeSheet.efficiencyPercentage}٪</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-rose-400">باطله: {activeSheet.wastePercentage}٪</span>
                    </div>
                  </div>

                  {/* Rendered Interactive SVG Sheet */}
                  <div
                    className="w-full flex items-center justify-center overflow-auto p-4 transition-transform duration-200"
                    style={{ transform: `scale(${zoomScale})` }}
                    dangerouslySetInnerHTML={{ __html: activeSheet.montageSvg }}
                  />

                  {/* Zoom Controls */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-2xl z-10 backdrop-blur-sm">
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

                  <div className="absolute bottom-4 right-4 text-[10px] text-slate-400 font-mono">
                    جهت فرم: {activeSheet.orientation}
                  </div>
                </div>
              )}

              {/* Economic & Material Statistics Cards */}
              {activeSheet && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
                    <span className="text-slate-400 block text-[11px] mb-1">تعداد در فرم (Ups)</span>
                    <strong className="text-indigo-600 text-base font-black font-mono">
                      {activeSheet.boxesPerSheet} عدد
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

          {/* VIEW 2: SINGLE DIELINE VECTOR VIEWER */}
          {activeSubTab === 'dieline' && dielineData && (
            <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]">
              {/* Legend & Help Bar */}
              <div className="absolute top-4 right-4 left-4 flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/95 border border-slate-800 px-4 py-2 rounded-2xl z-10 backdrop-blur-sm shadow-md">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 font-bold text-rose-400">
                    <span className="w-3 h-0.5 bg-rose-500 rounded-full" />
                    خط تیغ و برش (Cut Line: قرمز)
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-blue-400">
                    <span className="w-3 h-0.5 border-b-2 border-dashed border-blue-400" />
                    خط تا و خط‌کشی (Crease Line: آبی)
                  </span>
                  <span className="text-slate-400">
                    ابعاد: <strong className="text-amber-300 font-mono">{lengthMm} × {widthMm} × {heightMm} mm</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoomScale((z) => Math.min(2.5, z + 0.2))}
                    className="p-1 hover:text-white transition"
                    title="بزرگنمایی"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale((z) => Math.max(0.4, z - 0.2))}
                    className="p-1 hover:text-white transition"
                    title="کوچک‌نمایی"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale(1)}
                    className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 rounded hover:text-white"
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
                Arman Amiran AI Parametric Dieline Engine | Real Scale 1:1 Vector
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
