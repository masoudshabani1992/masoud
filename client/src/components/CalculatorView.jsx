import React, { useState, useEffect, useCallback } from 'react';
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
  AlertCircle,
  Box
} from 'lucide-react';

/**
 * Pure Synchronous Cost Calculation Engine (Instant 60fps Client-side Math)
 */
function computeInstantPricing(s) {
  const qty = Math.max(1, parseInt(s.quantity) || 5000);
  const l = (parseFloat(s.lengthMm) || 220) / 10; // cm
  const w = (parseFloat(s.widthMm) || 150) / 10;  // cm
  const h = (parseFloat(s.heightMm) || 70) / 10;   // cm

  // Blank flat dimension approximation
  const flatW_cm = Math.max(20, (l * 2) + (w * 2) + 2.0);
  const flatH_cm = Math.max(15, h + (w * 2) + 4.0);

  // Standard sheet fit (70x100 cm)
  const sheetW_cm = 100;
  const sheetH_cm = 70;
  const upsCols = Math.floor(sheetW_cm / flatW_cm) || 1;
  const upsRows = Math.floor(sheetH_cm / flatH_cm) || 1;
  const upPerSheet = Math.max(1, upsCols * upsRows);

  const netSheets = Math.ceil(qty / upPerSheet);
  const wastePercent = parseFloat(s.wastagePercent) || 5;
  const wasteSheets = Math.ceil(netSheets * (wastePercent / 100));
  const totalSheetsRequired = netSheets + wasteSheets;

  const sheetAreaM2 = (sheetW_cm * sheetH_cm) / 10000;
  const grammage = parseFloat(s.grammage) || 300;
  const totalPaperWeightKg = Math.round(((totalSheetsRequired * sheetAreaM2 * grammage) / 1000) * 10) / 10;

  // 1. Paper / Cardboard Cost
  const paperPricePerKg = parseFloat(s.paperPricePerKg) || 72000;
  const paperCost = Math.round(totalPaperWeightKg * paperPricePerKg);

  // 2. Flute / Single Cost
  let fluteCost = 0;
  let laminationCost = 0;
  if (s.hasFlute) {
    const totalFluteAreaM2 = totalSheetsRequired * sheetAreaM2;
    const flutePrice = parseFloat(s.flutePricePerSqm) || 14500;
    fluteCost = Math.round(totalFluteAreaM2 * flutePrice);
    laminationCost = Math.round(totalFluteAreaM2 * (parseFloat(s.laminationCostPerSqm) || 5500));
  }

  // 3. Printing & Plates
  const colors = parseInt(s.printColorsCount) || 4;
  const plateCost = colors * (parseFloat(s.plateCostPerUnit) || 160000);
  const printThousand = Math.ceil(totalSheetsRequired / 1000);
  const printRate = parseFloat(s.printCostPerThousand) || 750000;
  const printCost = Math.max(1, printThousand) * printRate;

  // 4. Cellophane
  let cellophaneCost = 0;
  if (s.cellophaneType && s.cellophaneType !== 'none') {
    const celloRate = parseFloat(s.cellophanePricePerSqm) || 4200;
    cellophaneCost = Math.round(totalSheetsRequired * sheetAreaM2 * celloRate);
  }

  // 5. UV
  let uvCost = 0;
  if (s.hasUv) {
    uvCost = 350000 + Math.ceil(totalSheetsRequired / 1000) * (parseFloat(s.uvCostPerThousand) || 650000);
  }

  // 6. Foil / Stamping
  let foilCost = 0;
  if (s.hasFoil) {
    foilCost = (parseFloat(s.foilClicheCost) || 850000) + Math.ceil(totalSheetsRequired / 1000) * (parseFloat(s.foilCostPerThousand) || 750000);
  }

  // 7. Emboss
  let embossCost = 0;
  if (s.hasEmboss) {
    embossCost = 450000 + Math.ceil(totalSheetsRequired / 1000) * (parseFloat(s.embossCostPerThousand) || 380000);
  }

  // 8. Die Cut & Mould
  const dieCutMouldCost = parseFloat(s.dieCutMouldCost) || 1200000;
  const dieCutRate = parseFloat(s.dieCutCostPerThousand) || 420000;
  const dieCutCost = dieCutMouldCost + Math.ceil(totalSheetsRequired / 1000) * dieCutRate;

  // 9. Gluing
  let gluingCost = 0;
  if (s.gluingType && s.gluingType !== 'none') {
    const glueRate = parseFloat(s.gluingCostPerThousand) || 190000;
    gluingCost = Math.ceil(qty / 1000) * glueRate;
  }

  // Total Raw Cost
  const totalRawCost = paperCost + fluteCost + laminationCost + plateCost + printCost +
                       cellophaneCost + uvCost + foilCost + embossCost + dieCutCost + gluingCost;

  // Margin & Final Prices (Instant calculation)
  const marginPercent = parseFloat(s.profitMarginPercent) ?? 20;
  const profitAmount = Math.round(totalRawCost * (marginPercent / 100));
  const finalPrice = totalRawCost + profitAmount;
  const unitPrice = Math.round(finalPrice / qty);

  return {
    quantity: qty,
    imposition: {
      netSheets,
      wasteSheets,
      totalSheetsRequired,
      upPerSheet,
      totalPaperWeightKg,
      sheetAreaM2: Math.round(sheetAreaM2 * 100) / 100
    },
    costBreakdown: {
      paperCost,
      fluteCost,
      laminationCost,
      plateCost,
      printCost,
      cellophaneCost,
      uvCost,
      foilCost,
      embossCost,
      dieCutCost,
      gluingCost
    },
    totalRawCost,
    profitMarginPercent: marginPercent,
    finalPrice,
    unitPrice
  };
}

export default function CalculatorView({ onApplyToProject, initialSpecs, onLeadEstimated }) {
  const { role, currentUser } = useAuth();

  const [specs, setSpecs] = useState({
    lengthMm: initialSpecs?.lengthMm || initialSpecs?.box_length || 220,
    widthMm: initialSpecs?.widthMm || initialSpecs?.box_width || 150,
    heightMm: initialSpecs?.heightMm || initialSpecs?.box_height || 70,
    quantity: initialSpecs?.quantity || 8000,
    boxType: initialSpecs?.boxType || 'carton_e_flute',
    paperType: initialSpecs?.cardboard_type || 'مقوای ایندربرد ۲۵۰ گرم (دارویی/بهداشتی)',
    paperPricePerKg: 72000,
    grammage: initialSpecs?.cardboard_grammage || 250,
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

  // Initialize with instant local calculation so there is 0 latency
  const [calcResult, setCalcResult] = useState(() => computeInstantPricing(specs));
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

    const updatedSpecs = {
      ...specs,
      quantity: Number(lead.quantity) || 5000,
      lengthMm: Number(lead.box_length) || specs.lengthMm,
      widthMm: Number(lead.box_width) || specs.widthMm,
      heightMm: Number(lead.box_height) || specs.heightMm,
      grammage: Number(lead.cardboard_grammage) || 300,
      hasFlute: lead.material_construction?.includes('سینگل') || lead.material_construction?.includes('ای فلوت') || false,
      fluteType: lead.material_construction?.includes('بی فلوت') ? 'b_flute' : 'e_flute',
      cellophaneType: lead.cellophane_type?.includes('براق') ? 'gloss' : lead.cellophane_type?.includes('بدون') ? 'none' : 'matte'
    };

    setSpecs(updatedSpecs);
    setCalcResult(computeInstantPricing(updatedSpecs));
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
    const updated = { ...specs, ...preset.config };
    setSpecs(updated);
    setCalcResult(computeInstantPricing(updated));
  };

  // Instant Real-time Field Updater
  const updateField = (field, value) => {
    setSpecs((prev) => {
      const updated = { ...prev, [field]: value };
      // Compute immediately synchronously so slider & fields update at 60 FPS
      const instantRes = computeInstantPricing(updated);
      setCalcResult(instantRes);
      return updated;
    });
  };

  // Immediate Profit Margin Slider Handler (Guarantees instant price recalculation)
  const handleProfitMarginChange = (val) => {
    const margin = parseInt(val) || 0;
    setSpecs((prev) => {
      const updated = { ...prev, profitMarginPercent: margin };
      if (calcResult && calcResult.totalRawCost) {
        const profitAmount = Math.round(calcResult.totalRawCost * (margin / 100));
        const finalPrice = calcResult.totalRawCost + profitAmount;
        const unitPrice = Math.round(finalPrice / (updated.quantity || 1));
        setCalcResult((prevRes) => ({
          ...prevRes,
          profitMarginPercent: margin,
          finalPrice,
          unitPrice
        }));
      } else {
        setCalcResult(computeInstantPricing(updated));
      }
      return updated;
    });
  };

  return (
    <div className="space-y-6 select-none font-sans" dir="rtl">
      
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

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Input Controls & Sliders */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Presets Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-500">پریست‌های سریع استعلام صنعتی:</span>
            <div className="flex flex-wrap gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 text-slate-700 transition"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 1: ابعاد و تیراژ */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Box className="w-4 h-4 text-indigo-600" />
              <span>۱. مشخصات ابعاد و تیراژ سفارش</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">طول (mm)</label>
                <input
                  type="number"
                  value={specs.lengthMm}
                  onChange={(e) => updateField('lengthMm', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-200 bg-slate-50 text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">عرض (mm)</label>
                <input
                  type="number"
                  value={specs.widthMm}
                  onChange={(e) => updateField('widthMm', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-200 bg-slate-50 text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">ارتفاع (mm)</label>
                <input
                  type="number"
                  value={specs.heightMm}
                  onChange={(e) => updateField('heightMm', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-200 bg-slate-50 text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">تیراژ سفارش (عدد)</label>
                <input
                  type="number"
                  step="500"
                  value={specs.quantity}
                  onChange={(e) => updateField('quantity', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-indigo-300 bg-indigo-50/50 text-indigo-900 text-center"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: متریال مقوا و سینگل */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>۲. متریال مقوا، سینگل و فلوتینگ</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">نوع و گرماژ مقوا</label>
                <select
                  value={specs.paperType}
                  onChange={(e) => {
                    const val = e.target.value;
                    let g = 300;
                    if (val.includes('۲۵۰')) g = 250;
                    if (val.includes('۳۰۰')) g = 300;
                    if (val.includes('۳۵۰')) g = 350;
                    if (val.includes('۴۰۰')) g = 400;
                    updateField('paperType', val);
                    updateField('grammage', g);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  <option value="ایندربرد ۲۵۰ گرم (دارویی/بهداشتی)">ایندربرد ۲۵۰ گرم (دارویی/بهداشتی)</option>
                  <option value="ایندربرد ۳۰۰ گرم (صادراتی)">ایندربرد ۳۰۰ گرم (صادراتی)</option>
                  <option value="ایندربرد ۳۵۰ گرم (جعبه سنگین)">ایندربرد ۳۵۰ گرم (جعبه سنگین)</option>
                  <option value="پشت طوسی ۲۵۰ گرم">پشت طوسی ۲۵۰ گرم</option>
                  <option value="پشت طوسی ۳۰۰ گرم">پشت طوسی ۳۰۰ گرم</option>
                  <option value="کرافت سنگین ۲۸۰ گرم">کرافت سنگین ۲۸۰ گرم</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">قیمت هر کیلو مقوا (تومان)</label>
                <input
                  type="number"
                  step="1000"
                  value={specs.paperPricePerKg}
                  onChange={(e) => updateField('paperPricePerKg', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-200 bg-white text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">کنگره و لامینت سینگل فلوت</label>
                <select
                  value={specs.hasFlute ? specs.fluteType : 'none'}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === 'none') {
                      updateField('hasFlute', false);
                    } else {
                      updateField('hasFlute', true);
                      updateField('fluteType', v);
                      updateField('flutePricePerSqm', v === 'b_flute' ? 16500 : 14500);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  <option value="none">بدون سینگل (جعبه مقوایی ساده)</option>
                  <option value="e_flute">سینگل فیس E فلوت (کنگره ریز)</option>
                  <option value="b_flute">سینگل فیس B فلوت (کنگره درشت)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: چاپ و لیتوگرافی */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Printer className="w-4 h-4 text-indigo-600" />
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
                  <option value={1}>تک رنگ (سیاه و سفید یا ساختگی)</option>
                  <option value={2}>دو رنگ تفکیکی</option>
                  <option value={4}>چهار رنگ کامل (CMYK)</option>
                  <option value={5}>پنج رنگ (CMYK + رنگ پنتون)</option>
                  <option value={6}>شش رنگ کامل</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">هزینه هر زینک CTP (تومان)</label>
                <input
                  type="number"
                  step="10000"
                  value={specs.plateCostPerUnit}
                  onChange={(e) => updateField('plateCostPerUnit', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-200 bg-white text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">نرخ هر ۱۰۰۰ دور چاپ (تومان)</label>
                <input
                  type="number"
                  step="50000"
                  value={specs.printCostPerThousand}
                  onChange={(e) => updateField('printCostPerThousand', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-200 bg-white text-center"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: خدمات تکمیلی و درصد سود کارخانه */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>۴. خدمات تکمیلی، دایکات و جعبه‌چسبانی</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">نوع سلفون</label>
                <select
                  value={specs.cellophaneType}
                  onChange={(e) => updateField('cellophaneType', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  <option value="none">بدون سلفون</option>
                  <option value="gloss">سلفون حرارتی براق</option>
                  <option value="matte">سلفون حرارتی مات</option>
                  <option value="velvet">سلفون مخملی لوکس</option>
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
                  <option value="yes">یووی موضعی شابلون</option>
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
                  <option value="yes">طلاکوب / نقره‌کوب</option>
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

            {/* Profit Margin Slider (Real-time Live Calculation) */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span className="text-slate-800 font-black">درصد حاشیه سود کارخانه:</span>
                  <span className="text-indigo-600 font-mono font-black text-base bg-indigo-50 px-3 py-0.5 rounded-lg border border-indigo-200">
                    %{specs.profitMarginPercent}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={specs.profitMarginPercent}
                  onChange={(e) => handleProfitMarginChange(e.target.value)}
                  onInput={(e) => handleProfitMarginChange(e.target.value)}
                  className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
                  <span>۵٪</span>
                  <span>۲۰٪</span>
                  <span>۳۵٪</span>
                  <span>۵۰٪</span>
                </div>
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
                type="button"
                onClick={() => setCalcResult(computeInstantPricing(specs))}
                className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                title="محاسبه مجدد"
              >
                <RefreshCw className="w-4 h-4 text-indigo-600" />
              </button>
            </div>

            {calcResult && (
              <div className="space-y-4">
                {/* Highlight Boxes: Total & Unit Price */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-200 text-center space-y-1">
                  <span className="text-xs text-indigo-700 font-medium">قیمت نهایی هر عدد جعبه:</span>
                  <div className="text-2xl font-black text-indigo-900 font-mono">
                    {formatToman(calcResult.unitPrice)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    برای تیراژ <strong className="text-slate-700 font-mono">{formatNumber(specs.quantity)}</strong> عدد
                  </div>
                </div>

                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs text-emerald-800 font-bold">مبلغ کل فاکتور:</span>
                  <strong className="text-emerald-900 font-black text-base font-mono">
                    {formatToman(calcResult.finalPrice)}
                  </strong>
                </div>

                {/* Technical Imposition Data */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5 text-slate-600 font-sans">
                  <div className="flex items-center justify-between">
                    <span>تعداد در هر شیت چاپی:</span>
                    <strong className="text-slate-800 font-bold font-mono">{calcResult.imposition.upPerSheet} عدد</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>تعداد کل شیت مصرفی:</span>
                    <strong className="text-slate-800 font-bold font-mono">{formatNumber(calcResult.imposition.totalSheetsRequired)} برگ</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>وزن کل مقوای مصرفی:</span>
                    <strong className="text-slate-800 font-bold font-mono">{formatNumber(calcResult.imposition.totalPaperWeightKg)} کیلوگرم</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>بهای تمام شده خام:</span>
                    <strong className="text-slate-700 font-mono">{formatToman(calcResult.totalRawCost)}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>سود کارخانه (%{calcResult.profitMarginPercent}):</span>
                    <strong className="text-indigo-700 font-mono font-black">
                      {formatToman(calcResult.finalPrice - calcResult.totalRawCost)}
                    </strong>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-1.5 text-[11px] text-slate-600 border-t border-slate-100 pt-3">
                  <div className="font-bold text-slate-700 mb-1">ریز هزینه‌های تولید:</div>
                  <div className="flex justify-between"><span>مقوا:</span><span className="font-mono">{formatToman(calcResult.costBreakdown.paperCost)}</span></div>
                  {calcResult.costBreakdown.fluteCost > 0 && (
                    <div className="flex justify-between"><span>فلوت و لامینت:</span><span className="font-mono">{formatToman(calcResult.costBreakdown.fluteCost + calcResult.costBreakdown.laminationCost)}</span></div>
                  )}
                  <div className="flex justify-between"><span>زینک و لیتوگرافی:</span><span className="font-mono">{formatToman(calcResult.costBreakdown.plateCost)}</span></div>
                  <div className="flex justify-between"><span>چاپ افست:</span><span className="font-mono">{formatToman(calcResult.costBreakdown.printCost)}</span></div>
                  {calcResult.costBreakdown.cellophaneCost > 0 && (
                    <div className="flex justify-between"><span>سلفون‌کشی:</span><span className="font-mono">{formatToman(calcResult.costBreakdown.cellophaneCost)}</span></div>
                  )}
                  {calcResult.costBreakdown.uvCost > 0 && (
                    <div className="flex justify-between"><span>یووی موضعی:</span><span className="font-mono">{formatToman(calcResult.costBreakdown.uvCost)}</span></div>
                  )}
                  {calcResult.costBreakdown.foilCost > 0 && (
                    <div className="flex justify-between"><span>طلاکوب:</span><span className="font-mono">{formatToman(calcResult.costBreakdown.foilCost)}</span></div>
                  )}
                  <div className="flex justify-between"><span>قالب و دایکات:</span><span className="font-mono">{formatToman(calcResult.costBreakdown.dieCutCost)}</span></div>
                  {calcResult.costBreakdown.gluingCost > 0 && (
                    <div className="flex justify-between"><span>جعبه‌چسبانی:</span><span className="font-mono">{formatToman(calcResult.costBreakdown.gluingCost)}</span></div>
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
