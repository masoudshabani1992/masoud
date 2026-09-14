import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { formatToman, formatNumber } from '../utils/helpers';
import {
  Calculator,
  Layers,
  Sparkles,
  Printer,
  Scissors,
  CheckCircle,
  RefreshCw,
  Sliders,
  DollarSign,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

export default function CalculatorView({ onApplyToProject, initialSpecs }) {
  const [specs, setSpecs] = useState({
    lengthMm: initialSpecs?.lengthMm || 220,
    widthMm: initialSpecs?.widthMm || 150,
    heightMm: initialSpecs?.heightMm || 70,
    quantity: initialSpecs?.quantity || 5000,
    boxType: initialSpecs?.boxType || 'carton_e_flute',
    paperType: 'مقوای ایندربرد ۳۰۰ گرم چنگمینگ',
    paperPricePerKg: 72000,
    grammage: 300,
    hasFlute: true,
    fluteType: 'e_flute',
    flutePricePerSqm: 14500,
    printColorsCount: 4,
    plateCostPerUnit: 160000,
    printCostPerThousand: 750000,
    cellophaneType: 'matte',
    cellophanePricePerSqm: 4200,
    hasUv: true,
    uvCostPerThousand: 650000,
    hasFoil: false,
    foilCostPerThousand: 750000,
    foilClicheCost: 850000,
    hasEmboss: false,
    embossCostPerThousand: 380000,
    laminationCostPerSqm: 5500,
    dieCutMouldCost: 1200000,
    dieCutCostPerThousand: 420000,
    gluingType: 'side_glue',
    gluingCostPerThousand: 190000,
    profitMarginPercent: 20,
    wastagePercent: 5
  });

  const [calcResult, setCalcResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const presets = [
    {
      name: 'کارتن لمینتی E فلوت صادراتی',
      config: {
        grammage: 300,
        paperPricePerKg: 72000,
        hasFlute: true,
        fluteType: 'e_flute',
        flutePricePerSqm: 14500,
        printColorsCount: 4,
        cellophaneType: 'matte',
        hasUv: true,
        hasFoil: true,
        gluingType: 'side_glue',
        profitMarginPercent: 20
      }
    },
    {
      name: 'جعبه مقوایی دارویی ایندربرد ۲۵۰ گرم',
      config: {
        grammage: 250,
        paperPricePerKg: 68000,
        hasFlute: false,
        flutePricePerSqm: 0,
        printColorsCount: 4,
        cellophaneType: 'gloss',
        hasUv: false,
        hasFoil: false,
        gluingType: 'lock_bottom',
        profitMarginPercent: 20
      }
    },
    {
      name: 'جعبه فست فود کرافت سنگین ۲۸۰ گرم',
      config: {
        grammage: 280,
        paperPricePerKg: 48000,
        hasFlute: false,
        flutePricePerSqm: 0,
        printColorsCount: 2,
        cellophaneType: 'none',
        hasUv: false,
        hasFoil: false,
        gluingType: 'none',
        profitMarginPercent: 18
      }
    },
    {
      name: 'کارتن ۳ لایه B فلوت صنعتی',
      config: {
        grammage: 300,
        paperPricePerKg: 54000,
        hasFlute: true,
        fluteType: 'b_flute',
        flutePricePerSqm: 16500,
        printColorsCount: 4,
        cellophaneType: 'none',
        hasUv: false,
        hasFoil: false,
        gluingType: 'side_glue',
        profitMarginPercent: 15
      }
    }
  ];

  const applyPreset = (preset) => {
    setSpecs((prev) => ({ ...prev, ...preset.config }));
  };

  const calculate = async () => {
    setLoading(true);
    try {
      const res = await api.calculatePrice(specs);
      setCalcResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculate();
  }, [specs]);

  const updateField = (field, value) => {
    setSpecs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-white p-6 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center text-white">
            <Calculator className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>ماشین حساب صنعتی برآورد قیمت جعبه و کارتن</span>
              <span className="bg-amber-400 text-amber-950 text-xs px-2.5 py-0.5 rounded-full font-bold">
                فرمول استعلام روز
              </span>
            </h2>
            <p className="text-xs text-amber-100 mt-1">
              محاسبه خودکار وزن مقوا بر اساس گرماژ، شیت‌بندی، زینک، چاپ افست، فلوت، خدمات تکمیلی، پرت تولید و سود کارخانه
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-amber-200 font-medium">الگوهای سریع:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p)}
              className="text-[11px] bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg font-medium transition-all"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Input Controls */}
        <div className="lg:col-span-2 space-y-5">
          {/* Section 1: Dimensions & Quantity */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>۱. ابعاد جعبه و تیراژ سفارش</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">طول (L) میلی‌متر</label>
                <input
                  type="number"
                  value={specs.lengthMm}
                  onChange={(e) => updateField('lengthMm', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">عرض (W) میلی‌متر</label>
                <input
                  type="number"
                  value={specs.widthMm}
                  onChange={(e) => updateField('widthMm', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">ارتفاع (H) میلی‌متر</label>
                <input
                  type="number"
                  value={specs.heightMm}
                  onChange={(e) => updateField('heightMm', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-indigo-700 mb-1">تیراژ (تعداد)</label>
                <input
                  type="number"
                  step="500"
                  value={specs.quantity}
                  onChange={(e) => updateField('quantity', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border-2 border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 font-mono font-bold text-indigo-800"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Material & Flute */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>۲. متریال مقوا، سینگل و فلوتینگ</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">نوع و گرماژ مقوا</label>
                <select
                  value={specs.grammage}
                  onChange={(e) => {
                    const g = parseInt(e.target.value);
                    let p = 68000;
                    if (g === 300) p = 72000;
                    if (g === 350) p = 76000;
                    if (g === 230) p = 48000;
                    setSpecs((prev) => ({ ...prev, grammage: g, paperPricePerKg: p }));
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="250">ایندربرد ۲۵۰ گرم (دارویی/بهداشتی)</option>
                  <option value="300">ایندربرد ۳۰۰ گرم (صادراتی لوکس)</option>
                  <option value="350">ایندربرد ۳۵۰ گرم (سنگین/مقاوم)</option>
                  <option value="230">کرافت سنگین ۲۳۰ گرم (طبیعی/فودگرید)</option>
                  <option value="280">کرافت فودگرید ۲۸۰ گرم</option>
                  <option value="250">پشت طوسی ۲۵۰ گرم (صنعتی)</option>
                  <option value="300">پشت طوسی ۳۰۰ گرم (قطعات خودرو)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">قیمت هر کیلو مقوا (تومان)</label>
                <input
                  type="number"
                  value={specs.paperPricePerKg}
                  onChange={(e) => updateField('paperPricePerKg', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">کنگره و لامینت سینگل فلوت</label>
                <select
                  value={specs.hasFlute ? specs.fluteType : 'none'}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === 'none') {
                      setSpecs((prev) => ({ ...prev, hasFlute: false, flutePricePerSqm: 0 }));
                    } else if (v === 'e_flute') {
                      setSpecs((prev) => ({ ...prev, hasFlute: true, fluteType: 'e_flute', flutePricePerSqm: 14500 }));
                    } else if (v === 'b_flute') {
                      setSpecs((prev) => ({ ...prev, hasFlute: true, fluteType: 'b_flute', flutePricePerSqm: 16500 }));
                    } else if (v === '3ply') {
                      setSpecs((prev) => ({ ...prev, hasFlute: true, fluteType: '3ply', flutePricePerSqm: 24000 }));
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  <option value="none">بدون فلوت (صرفاً مقوایی)</option>
                  <option value="e_flute">سینگل فیس E فلوت (کنگره ریز ۱.۵ میلی‌متر)</option>
                  <option value="b_flute">سینگل فیس B فلوت (کنگره متوسط ۳ میلی‌متر)</option>
                  <option value="3ply">ورق ۳ لایه کارتن آماده</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Printing & Pre-Press */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Printer className="w-4 h-4 text-cyan-600" />
              <span>۳. چاپ افست، زینک و لیتوگرافی</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">تعداد رنگ چاپ افست</label>
                <select
                  value={specs.printColorsCount}
                  onChange={(e) => updateField('printColorsCount', parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  <option value="1">تک رنگ (سیاه / پنتون)</option>
                  <option value="2">دو رنگ</option>
                  <option value="4">چهار رنگ کامل (CMYK)</option>
                  <option value="5">پنج رنگ (CMYK + رنگ پنتون طلایی/نقره‌ای)</option>
                  <option value="6">شش رنگ (CMYK + 2 پنتون)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">هزینه هر زینک CTP (تومان)</label>
                <input
                  type="number"
                  value={specs.plateCostPerUnit}
                  onChange={(e) => updateField('plateCostPerUnit', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">نرخ هر ۱۰۰۰ دور چاپ (تومان)</label>
                <input
                  type="number"
                  value={specs.printCostPerThousand}
                  onChange={(e) => updateField('printCostPerThousand', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Finishing & Die-Cutting */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>۴. خدمات تکمیلی، دایکات و جعبه‌چسبانی</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">نوع سلفون</label>
                <select
                  value={specs.cellophaneType}
                  onChange={(e) => {
                    const t = e.target.value;
                    let p = 0;
                    if (t === 'matte') p = 4200;
                    if (t === 'gloss') p = 3800;
                    setSpecs((prev) => ({ ...prev, cellophaneType: t, cellophanePricePerSqm: p }));
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  <option value="none">بدون سلفون</option>
                  <option value="matte">سلفون حرارتی مات</option>
                  <option value="gloss">سلفون حرارتی براق</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">یووی موضعی</label>
                <select
                  value={specs.hasUv ? 'yes' : 'no'}
                  onChange={(e) => updateField('hasUv', e.target.value === 'yes')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  <option value="no">ندارد</option>
                  <option value="yes">یووی موضعی شابلونی دارد</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">طلاکوب حرارتی</label>
                <select
                  value={specs.hasFoil ? 'yes' : 'no'}
                  onChange={(e) => updateField('hasFoil', e.target.value === 'yes')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  <option value="no">ندارد</option>
                  <option value="yes">طلاکوب / نقره‌کوب دارد</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">نوع جعبه‌چسبانی</label>
                <select
                  value={specs.gluingType}
                  onChange={(e) => updateField('gluingType', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  <option value="side_glue">اتوماتیک لب‌چسب</option>
                  <option value="lock_bottom">اتوماتیک لاک‌باتم (ته قفلی)</option>
                  <option value="manual">چسب دستی</option>
                  <option value="none">بدون چسب (کیبوردی قفلی)</option>
                </select>
              </div>
            </div>

            {/* Profit Margin Slider */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>درصد حاشیه سود کارخانه:</span>
                  <span className="text-indigo-600 font-mono font-bold text-sm">
                    %{specs.profitMarginPercent}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={specs.profitMarginPercent}
                  onChange={(e) => updateField('profitMarginPercent', parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Calculation Summary & Live Pricing Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border-2 border-indigo-500/30 p-5 shadow-lg shadow-indigo-100 space-y-4 sticky top-28">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-800">خلاصه برآورد و قیمت تمام شده</h3>
              </div>
              <button
                onClick={calculate}
                className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                title="محاسبه مجدد"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
              </button>
            </div>

            {calcResult && (
              <div className="space-y-4">
                {/* Highlight Boxes: Total & Unit Price */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-200 text-center space-y-1">
                  <span className="text-xs text-indigo-700 font-medium">قیمت نهایی هر عدد جعبه:</span>
                  <div className="text-2xl font-black text-indigo-900">
                    {formatToman(calcResult.unitPrice)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    برای تیراژ <strong className="text-slate-700">{formatNumber(specs.quantity)}</strong> عدد
                  </div>
                </div>

                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs text-emerald-800 font-bold">مبلغ کل فاکتور:</span>
                  <strong className="text-emerald-900 font-black text-base">
                    {formatToman(calcResult.finalPrice)}
                  </strong>
                </div>

                {/* Technical Imposition Data */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>تعداد در هر شیت چاپی:</span>
                    <strong className="text-slate-800 font-bold">{calcResult.imposition.upPerSheet} عدد</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>تعداد کل شیت مصرفی:</span>
                    <strong className="text-slate-800 font-bold">{formatNumber(calcResult.imposition.totalSheetsRequired)} برگ</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>وزن کل مقوای مصرفی:</span>
                    <strong className="text-slate-800 font-bold">{formatNumber(calcResult.imposition.totalPaperWeightKg)} کیلوگرم</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>بهای تمام شده خام:</span>
                    <strong className="text-slate-700 font-mono">{formatToman(calcResult.totalRawCost)}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>سود کارخانه (%{calcResult.profitMarginPercent}):</span>
                    <strong className="text-indigo-700 font-mono">
                      {formatToman(calcResult.finalPrice - calcResult.totalRawCost)}
                    </strong>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-1.5 text-[11px] text-slate-600 border-t border-slate-100 pt-3">
                  <div className="font-bold text-slate-700 mb-1">ریز هزینه‌های تولید:</div>
                  <div className="flex justify-between"><span>مقوا:</span><span>{formatToman(calcResult.costBreakdown.paperCost)}</span></div>
                  {calcResult.costBreakdown.fluteCost > 0 && (
                    <div className="flex justify-between"><span>فلوت و لامینت:</span><span>{formatToman(calcResult.costBreakdown.fluteCost + calcResult.costBreakdown.laminationCost)}</span></div>
                  )}
                  <div className="flex justify-between"><span>زینک و لیتوگرافی:</span><span>{formatToman(calcResult.costBreakdown.plateCost)}</span></div>
                  <div className="flex justify-between"><span>چاپ افست:</span><span>{formatToman(calcResult.costBreakdown.printCost)}</span></div>
                  {calcResult.costBreakdown.cellophaneCost > 0 && (
                    <div className="flex justify-between"><span>سلفون‌کشی:</span><span>{formatToman(calcResult.costBreakdown.cellophaneCost)}</span></div>
                  )}
                  {calcResult.costBreakdown.uvCost > 0 && (
                    <div className="flex justify-between"><span>یووی موضعی:</span><span>{formatToman(calcResult.costBreakdown.uvCost)}</span></div>
                  )}
                  {calcResult.costBreakdown.foilCost > 0 && (
                    <div className="flex justify-between"><span>طلاکوب:</span><span>{formatToman(calcResult.costBreakdown.foilCost)}</span></div>
                  )}
                  <div className="flex justify-between"><span>قالب و دایکات:</span><span>{formatToman(calcResult.costBreakdown.dieCutCost)}</span></div>
                  {calcResult.costBreakdown.gluingCost > 0 && (
                    <div className="flex justify-between"><span>جعبه‌چسبانی:</span><span>{formatToman(calcResult.costBreakdown.gluingCost)}</span></div>
                  )}
                </div>

                {/* Apply Button */}
                {onApplyToProject && (
                  <button
                    type="button"
                    onClick={() => onApplyToProject(calcResult)}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>تایید و ثبت در پیش‌فاکتور پروژه</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
