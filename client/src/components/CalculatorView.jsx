import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { formatToman, formatNumber } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
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
  FileSpreadsheet,
  Inbox,
  User,
  Phone,
  ArrowRight,
  Send,
  AlertCircle
} from 'lucide-react';

export default function CalculatorView({ onApplyToProject, initialSpecs, onLeadEstimated }) {
  const { role, currentUser } = useAuth();

  const [specs, setSpecs] = useState({
    lengthMm: initialSpecs?.lengthMm || initialSpecs?.box_length || 220,
    widthMm: initialSpecs?.widthMm || initialSpecs?.box_width || 150,
    heightMm: initialSpecs?.heightMm || initialSpecs?.box_height || 70,
    quantity: initialSpecs?.quantity || 5000,
    boxType: initialSpecs?.boxType || 'carton_e_flute',
    paperType: initialSpecs?.cardboard_type || 'مقوای ایندربرد ۳۰۰ گرم',
    paperPricePerKg: 72000,
    grammage: initialSpecs?.cardboard_grammage || 300,
    hasFlute: true,
    fluteType: 'e_flute',
    flutePricePerSqm: 14500,
    printColorsCount: 4,
    plateCostPerUnit: 160000,
    printCostPerThousand: 750000,
    cellophaneType: initialSpecs?.cellophane_type?.includes('براق') ? 'gloss' : 'matte',
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

  // Marketing Leads waiting for price estimation
  const [pendingLeads, setPendingLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [activeLead, setActiveLead] = useState(null);
  const [estimatingLead, setEstimatingLead] = useState(false);
  const [estimateNotes, setEstimateNotes] = useState('');

  const fetchPendingLeads = async () => {
    try {
      setLoadingLeads(true);
      const res = await api.getMarketingLeads();
      if (res.success) {
        // filter leads that are pending commercial estimation
        const pending = (res.leads || []).filter(l => l.status === 'pending_commercial' || !l.estimated_unit_price);
        setPendingLeads(pending);
      }
    } catch (err) {
      console.error('Error fetching marketing leads in calculator:', err);
    } finally {
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    fetchPendingLeads();
  }, []);

  const handleSelectLeadForEstimation = (lead) => {
    setActiveLead(lead);
    setEstimateNotes(`برآورد قیمت استعلام ${lead.lead_code} - مشتری: ${lead.customer_name}`);

    // Map lead parameters into calculator
    setSpecs((prev) => ({
      ...prev,
      quantity: Number(lead.quantity) || 5000,
      lengthMm: Number(lead.box_length) || prev.lengthMm,
      widthMm: Number(lead.box_width) || prev.widthMm,
      heightMm: Number(lead.box_height) || prev.heightMm,
      grammage: Number(lead.cardboard_grammage) || 300,
      hasFlute: lead.material_construction?.includes('سینگل') || lead.material_construction?.includes('ای فلوت') || false,
      fluteType: lead.material_construction?.includes('بی فلوت') ? 'b_flute' : 'e_flute',
      cellophaneType: lead.cellophane_type?.includes('براق') ? 'gloss' : lead.cellophane_type?.includes('بدون') ? 'none' : 'matte'
    }));
  };

  const handleSubmitLeadEstimation = async () => {
    if (!activeLead || !calcResult) return;
    setEstimatingLead(true);
    try {
      await api.estimateMarketingLead(activeLead.id, {
        estimated_unit_price: calcResult.unitPrice,
        estimated_total_price: calcResult.finalPrice,
        commercial_notes: estimateNotes || `برآورد قیمت فی ${formatToman(calcResult.unitPrice)} تومان بر اساس تیراژ ${formatNumber(specs.quantity)} عدد.`
      });

      alert(`✅ برآورد قیمت برای استعلام «${activeLead.customer_name}» (${activeLead.lead_code}) با موفقیت ثبت شد و به کارتابل بازاریاب ارسال گردید.`);
      setActiveLead(null);
      fetchPendingLeads();
      if (onLeadEstimated) onLeadEstimated();
    } catch (err) {
      alert('خطا در ثبت برآورد قیمت: ' + err.message);
    } finally {
      setEstimatingLead(false);
    }
  };

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
      
      {/* PENDING MARKETING INQUIRIES NOTIFICATION BANNER & CARDS */}
      {pendingLeads.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-5 text-white shadow-xl space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black text-base shadow-inner">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-2">
                  <span>استعلام‌های جدید بازاریاب در انتظار برآورد قیمت ({pendingLeads.length} استعلام)</span>
                  <span className="bg-white text-orange-700 text-[11px] px-2.5 py-0.5 rounded-full font-black animate-pulse">
                    اقدام فوری
                  </span>
                </h3>
                <p className="text-xs text-orange-100 mt-0.5">
                  جهت برآورد قیمت، روی استعلام مورد نظر کلیک کنید تا مشخصات مستقیماً در ماشین‌حساب بارگذاری شود.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchPendingLeads}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLeads ? 'animate-spin' : ''}`} />
              <span>به‌روزرسانی</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {pendingLeads.map((lead) => {
              const isSelected = activeLead?.id === lead.id;
              return (
                <div
                  key={lead.id}
                  onClick={() => handleSelectLeadForEstimation(lead)}
                  className={`p-3.5 rounded-2xl transition-all cursor-pointer border flex flex-col justify-between gap-2 shadow-sm ${
                    isSelected
                      ? 'bg-white text-slate-900 border-white ring-4 ring-amber-300 shadow-lg scale-[1.02]'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded ${
                        isSelected ? 'bg-amber-100 text-amber-900' : 'bg-black/20 text-white'
                      }`}>
                        {lead.lead_code}
                      </span>
                      <span className={`text-xs font-bold ${isSelected ? 'text-amber-700' : 'text-amber-200'}`}>
                        {Number(lead.quantity).toLocaleString('fa-IR')} عدد
                      </span>
                    </div>

                    <h4 className={`font-black text-xs sm:text-sm line-clamp-1 ${isSelected ? 'text-slate-900' : 'text-white'}`}>
                      {lead.customer_name} - {lead.product_name}
                    </h4>

                    <div className={`text-[11px] leading-relaxed line-clamp-2 ${isSelected ? 'text-slate-600' : 'text-orange-100'}`}>
                      {lead.cardboard_type} {lead.cardboard_grammage} گرم | {lead.material_construction} | {lead.cellophane_type}
                      {lead.box_length ? ` (${lead.box_length}×${lead.box_width}×${lead.box_height}mm)` : ''}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/20 pt-2 text-[11px] font-bold">
                    <span className={isSelected ? 'text-indigo-600' : 'text-orange-200'}>
                      بازاریاب: {lead.marketer_name || 'کارشناس'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-white/20 text-white'
                    }`}>
                      <span>{isSelected ? 'در حال برآورد' : 'انتخاب استعلام'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ACTIVE SELECTED LEAD ESTIMATION BANNER */}
      {activeLead && (
        <div className="bg-indigo-50 border-2 border-indigo-400 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                  {activeLead.lead_code}
                </span>
                <h4 className="font-black text-sm text-indigo-950">
                  در حال برآورد قیمت برای: {activeLead.customer_name} ({activeLead.product_name})
                </h4>
              </div>
              <p className="text-xs text-indigo-700 mt-0.5">
                تیراژ: <strong>{Number(activeLead.quantity).toLocaleString('fa-IR')}</strong> عدد | تلفن: {activeLead.customer_phone} | بازاریاب: {activeLead.marketer_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSubmitLeadEstimation}
              disabled={estimatingLead || !calcResult}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
            >
              {estimatingLead ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>تایید و ارسال قیمت به بازاریاب (فی {formatToman(calcResult?.unitPrice || 0)})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLead(null)}
              className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              انصراف
            </button>
          </div>
        </div>
      )}

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

                {/* Direct Action for Active Lead */}
                {activeLead && (
                  <button
                    type="button"
                    onClick={handleSubmitLeadEstimation}
                    disabled={estimatingLead}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs shadow-md shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {estimatingLead ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-amber-300" />}
                    <span>ارسال این قیمت به کارتابل بازاریاب</span>
                  </button>
                )}

                {/* Apply Button to Project if available */}
                {onApplyToProject && !activeLead && (
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
