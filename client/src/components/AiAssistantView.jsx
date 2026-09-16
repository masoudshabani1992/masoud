import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Brain,
  Layers,
  FileText,
  Calculator,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  ArrowRight,
  TrendingUp,
  Percent,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Maximize2,
  RefreshCw,
  Scissors,
  Sliders,
  DollarSign,
  Palette,
  Package,
  Boxes,
  Compass
} from 'lucide-react';
import { api } from '../api/client';
import DielineGeneratorView from './DielineGeneratorView';

const SAMPLE_PROMPTS = [
  {
    title: '💊 جعبه دارویی سفالکسین',
    text: 'سلام مهندس ۵۰ هزار تا جعبه دارویی سفالکسین میخواستیم مقوای ایندربرد ۳۰۰ گرمی ۴ رنگ افست با سلفون مات حرارتی و یووی موضعی روی لوگو و طلاکوب طلایی، ابعاد ۱۰ در ۵ در ۱۲ سانت با چسب اتوماتیک'
  },
  {
    title: '📦 جعبه زعفران کادویی لوکس',
    text: 'استعلام قیمت ۲۰۰۰ عدد هاردباکس لوکس دو تکه کشویی ابعاد ۱۵ در ۱۵ در ۵ سانت با مقوای گلاسه ۳۵۰ گرم و فویل طلاکوب هفت رنگ و روکش سلفون مخملی'
  },
  {
    title: '🍕 جعبه فست‌فود و پیتزا',
    text: '۱۰ هزار تا جعبه پیتزا بزرگ ابعاد ۳۲ در ۳۲ در ۴ سانت مقوای پشت طوسی ۳۵۰ گرم لمینت شده روی سینگل E-Flute با چاپ ۲ رنگ افست بدون سلفون ساختار کیبوردی'
  },
  {
    title: '💄 جعبه آرایشی کرم و سرم',
    text: '۳۰ هزار تا جعبه آرایشی ضدچروک ایندربرد ۳۰۰ گرم چاپ ۵ رنگ پنتون اختصاصی + سلفون مات + یووی موضعی برجسته ۳D و برجسته‌سازی با کلیشه ابعاد ۶ در ۶ در ۱۴ سانت'
  }
];

export default function AiAssistantView({ onTransferToOrderForm }) {
  const [activeTab, setActiveTab] = useState('dieline'); // 'dieline' | 'nlp' | 'nesting' | 'preflight'

  // Tab 1: NLP Order State
  const [promptText, setPromptText] = useState('');
  const [nlpLoading, setNlpLoading] = useState(false);
  const [nlpResult, setNlpResult] = useState(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Tab 2: Nesting Optimizer State
  const [nestFlatL, setNestFlatL] = useState(24);
  const [nestFlatW, setNestFlatW] = useState(16);
  const [nestQty, setNestQty] = useState(20000);
  const [nestGsm, setNestGsm] = useState(300);
  const [nestCardboardPriceKg, setNestCardboardPriceKg] = useState(65000);
  const [nestingLoading, setNestingLoading] = useState(false);
  const [nestingResult, setNestingResult] = useState(null);
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0);

  // Tab 3: Preflight Audit State
  const [preflightL, setPreflightL] = useState(22);
  const [preflightW, setPreflightW] = useState(15);
  const [preflightH, setPreflightH] = useState(8);
  const [preflightGrammage, setPreflightGrammage] = useState(300);
  const [preflightCardboard, setPreflightCardboard] = useState('ایندربرد');
  const [preflightHasUv, setPreflightHasUv] = useState(true);
  const [preflightHasCellophane, setPreflightHasCellophane] = useState(false);
  const [preflightHasFlute, setPreflightHasFlute] = useState(false);
  const [preflightGlueWidth, setPreflightGlueWidth] = useState(15);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  // Run Preflight Audit
  const handleRunPreflight = async (specsOverride = null) => {
    setAuditLoading(true);
    try {
      const payload = specsOverride || {
        length: Number(preflightL) || 20,
        width: Number(preflightW) || 15,
        height: Number(preflightH) || 8,
        cardboard_grammage: Number(preflightGrammage) || 300,
        cardboard_type: preflightCardboard,
        has_uv: preflightHasUv ? 1 : 0,
        has_cellophane: preflightHasCellophane ? 1 : 0,
        has_flute: preflightHasFlute ? 1 : 0,
        glue_width: Number(preflightGlueWidth) || 15
      };
      const res = await api.aiPreflightAudit(payload);
      setAuditResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setAuditLoading(false);
    }
  };

  // Initial runs
  useEffect(() => {
    handleRunNesting();
    handleRunPreflight();
  }, []);

  // 1. NLP Parser Handler
  const handleParsePrompt = async (textToParse = null) => {
    const text = textToParse || promptText;
    if (!text.trim()) return;

    setNlpLoading(true);
    setNlpResult(null);

    try {
      const res = await api.aiParsePrompt(text.trim());
      if (res.success) {
        setNlpResult(res);
        api.aiPreflightAudit(res.data).then((aRes) => setAuditResult(aRes)).catch(() => {});
      }
    } catch (err) {
      alert(err.message || 'خطا در پردازش هوش مصنوعی.');
    } finally {
      setNlpLoading(false);
    }
  };

  // 2. Nesting Optimizer Handler
  const handleRunNesting = async () => {
    setNestingLoading(true);
    try {
      const res = await api.aiOptimizeNesting({
        flatLength: nestFlatL,
        flatWidth: nestFlatW,
        quantity: nestQty,
        grammage: nestGsm,
        cardboardPricePerKg: nestCardboardPriceKg
      });
      if (res.success) {
        setNestingResult(res);
        setSelectedSheetIndex(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNestingLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (nlpResult?.summaryText) {
      navigator.clipboard.writeText(nlpResult.summaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    }
  };

  const currentSheet = nestingResult?.allChoices?.[selectedSheetIndex] || nestingResult?.bestChoice;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top AI Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-amber-400 p-0.5 shadow-lg shadow-indigo-500/20 shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-amber-300">
                <Brain className="w-9 h-9 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  استودیو طراحی امیران و دستیار هوشمند بسته‌بندی
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Amiran Design Studio & AI v2.5
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                تولید نقشه‌های وکتور خط تیغ استانداردهای ECMA و FEFCO، خروجی‌های 1:1 ایلاستریتور (.AI)، اتوکد (.DXF) و PDF، پیش‌نمایش ۳ بعدی و بازرسی هوشمند چاپ.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 shrink-0 flex-wrap">
            <button
              onClick={() => setActiveTab('dieline')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'dieline'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>استودیو خط تیغ امیران</span>
            </button>

            <button
              onClick={() => setActiveTab('nlp')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'nlp'
                  ? 'bg-indigo-600 text-white shadow-md font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>استخراج سفارش از متن (NLP)</span>
            </button>

            <button
              onClick={() => setActiveTab('nesting')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'nesting'
                  ? 'bg-indigo-600 text-white shadow-md font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>محاسبه باطله شیت</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('preflight');
                handleRunPreflight();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'preflight'
                  ? 'bg-indigo-600 text-white shadow-md font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>بازرسی فنی چاپ (Preflight)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= TAB 0: DIELINE STUDIO ================= */}
      {activeTab === 'dieline' && (
        <DielineGeneratorView
          onTransferToOrder={(specs) => {
            if (onTransferToOrderForm) onTransferToOrderForm(specs);
          }}
        />
      )}

      {/* ================= TAB 1: NLP PROMPT PARSER ================= */}
      {activeTab === 'nlp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Prompt Input & Examples */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    1
                  </div>
                  <h3 className="text-base font-black text-slate-800">
                    ورود متن استعلام یا پیام مشتری (واتساپ / تلگرام / تلفن)
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-slate-400">پردازش زبان طبیعی فارسی</span>
              </div>

              <div className="relative">
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="متن استعلام مشتری را اینجا کپی کنید..."
                  rows={6}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition leading-relaxed resize-none font-medium"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleParsePrompt()}
                  disabled={nlpLoading || !promptText.trim()}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black text-sm py-3 px-6 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
                >
                  {nlpLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>در حال استخراج مشخصات فنی...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>استخراج مشخصات و برآورد قیمت</span>
                    </>
                  )}
                </button>

                {promptText && (
                  <button
                    type="button"
                    onClick={() => setPromptText('')}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-xs font-bold transition"
                  >
                    پاکسازی
                  </button>
                )}
              </div>
            </div>

            {/* Quick Sample Prompts */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>استعلام‌های نمونه آماده برای تست سریع سیستم:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SAMPLE_PROMPTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPromptText(sample.text);
                      handleParsePrompt(sample.text);
                    }}
                    className="text-right p-3.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-2xl transition group space-y-1"
                  >
                    <span className="text-xs font-black text-slate-800 group-hover:text-indigo-700 block">
                      {sample.title}
                    </span>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {sample.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Extracted Specs & Transfer */}
          <div className="lg:col-span-6 space-y-6">
            {!nlpResult && !nlpLoading && (
              <div className="bg-slate-50 rounded-3xl p-12 border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center min-h-[420px] text-slate-400 space-y-3">
                <Bot className="w-14 h-14 text-slate-300 stroke-[1.5]" />
                <p className="text-sm font-bold text-slate-600">هنوز متنی پردازش نشده است</p>
                <p className="text-xs max-w-sm">
                  یک متن استعلام وارد کنید یا یکی از نمونه‌های آماده را کلیک کنید تا هوش مصنوعی ابعاد، گرماژ، تیراژ و خدمات پس از چاپ را استخراج کند.
                </p>
              </div>
            )}

            {nlpLoading && (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center min-h-[420px] space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-sm font-black text-slate-800">هوش مصنوعی در حال تحلیل متن...</p>
                <p className="text-xs text-slate-500">
                  شناسایی ابعاد ۳ گانه، گراماژ مقوا، نوع چاپ، روکش سلفون، طلاکوب و یووی موضعی
                </p>
              </div>
            )}

            {nlpResult && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <div>
                      <h3 className="text-base font-black text-slate-800">
                        مشخصات فنی استخراج شده توسط هوش مصنوعی
                      </h3>
                      <span className="text-xs text-emerald-600 font-bold">
                        ضریب اطمینان تشخیص: {nlpResult.confidenceScore}%
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                  >
                    {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSummary ? 'کپی شد' : 'کپی خلاصه استعلام'}</span>
                  </button>
                </div>

                {/* Technical Table Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block">عنوان سفارش</span>
                    <span className="text-xs font-black text-slate-800 mt-0.5 block truncate">
                      {nlpResult.data?.title || 'جعبه سفارشی'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block">ابعاد (طول × عرض × ارتفاع)</span>
                    <span className="text-xs font-black text-indigo-700 mt-0.5 block" dir="ltr">
                      {nlpResult.data?.length || '-'} × {nlpResult.data?.width || '-'} × {nlpResult.data?.height || '-'} cm
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block">تیراژ درخواستی</span>
                    <span className="text-xs font-black text-slate-800 mt-0.5 block">
                      {(nlpResult.data?.quantity || 0).toLocaleString()} عدد
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block">نوع و گرماژ مقوا</span>
                    <span className="text-xs font-black text-slate-800 mt-0.5 block">
                      {nlpResult.data?.cardboard_type || 'ایندربرد'} ({nlpResult.data?.cardboard_grammage || 300}g)
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block">تعداد رنگ چاپ</span>
                    <span className="text-xs font-black text-slate-800 mt-0.5 block">
                      {nlpResult.data?.print_colors || 4} رنگ افست
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block">پوشش سلفون</span>
                    <span className="text-xs font-black text-slate-800 mt-0.5 block">
                      {nlpResult.data?.cellophane_type || (nlpResult.data?.has_cellophane ? 'سلفون مات' : 'ندارد')}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block">یووی موضعی</span>
                    <span className={`text-xs font-black mt-0.5 block ${nlpResult.data?.has_uv ? 'text-amber-600' : 'text-slate-400'}`}>
                      {nlpResult.data?.has_uv ? 'دارد (موضعی)' : 'ندارد'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block">فویل طلاکوب</span>
                    <span className={`text-xs font-black mt-0.5 block ${nlpResult.data?.has_foiling ? 'text-amber-600' : 'text-slate-400'}`}>
                      {nlpResult.data?.has_foiling ? 'دارد (طلاکوب)' : 'ندارد'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block">سینگل E-Flute لمینت</span>
                    <span className={`text-xs font-black mt-0.5 block ${nlpResult.data?.has_corrugated ? 'text-teal-600' : 'text-slate-400'}`}>
                      {nlpResult.data?.has_corrugated ? 'دارد (سینگل لمینتی)' : 'ندارد'}
                    </span>
                  </div>
                </div>

                {/* Transfer Action Button */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onTransferToOrderForm && onTransferToOrderForm(nlpResult.data)}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                    <span>انتقال به فرم ثبت سفارش رسمی و صدور پیش‌فاکتور</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: NESTING OPTIMIZER ================= */}
      {activeTab === 'nesting' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-slate-800">تنظیمات شیت و ابعاد گسترده</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  طول گسترده جعبه با لبه چسب و درب (سانتی‌متر):
                </label>
                <input
                  type="number"
                  value={nestFlatL}
                  onChange={(e) => setNestFlatL(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  عرض گسترده جعبه با لبه‌ها (سانتی‌متر):
                </label>
                <input
                  type="number"
                  value={nestFlatW}
                  onChange={(e) => setNestFlatW(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تیراژ سفارش (عدد):
                </label>
                <input
                  type="number"
                  value={nestQty}
                  onChange={(e) => setNestQty(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  گرماژ مقوا (گرم بر متر مربع):
                </label>
                <select
                  value={nestGsm}
                  onChange={(e) => setNestGsm(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="250">۲۵۰ گرم (پشت طوسی)</option>
                  <option value="280">۲۸۰ گرم (ایندربرد)</option>
                  <option value="300">۳۰۰ گرم (ایندربرد / بهداشتی)</option>
                  <option value="350">۳۵۰ گرم (سنگین دارویی/غذایی)</option>
                  <option value="400">۴۰۰ گرم (ایندربرد ضخیم)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  قیمت هر کیلوگرم مقوا (تومان):
                </label>
                <input
                  type="number"
                  value={nestCardboardPriceKg}
                  onChange={(e) => setNestCardboardPriceKg(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={handleRunNesting}
                disabled={nestingLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                {nestingLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Calculator className="w-4 h-4" />
                    <span>محاسبه بهینه‌ترین شیت و صرفه‌جویی</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Visualizer */}
          <div className="lg:col-span-8 space-y-6">
            {nestingResult && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-800">
                        نتایج رتبه‌بندی شیت‌های استاندارد بر اساس حداقل باطله
                      </h3>
                      <p className="text-xs text-slate-500">
                        شیت پیشنهادی هوش مصنوعی: {nestingResult.bestChoice?.sheetName} با {nestingResult.bestChoice?.wastePercent}% باطله
                      </p>
                    </div>
                  </div>

                  {nestingResult.savingsVsWorst > 0 && (
                    <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-black">
                      صرفه‌جویی مالی: {Math.round(nestingResult.savingsVsWorst).toLocaleString()} تومان
                    </div>
                  )}
                </div>

                {/* Sheet Selection Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {nestingResult.allChoices?.map((sheet, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSheetIndex(idx)}
                      className={`p-4 rounded-2xl border text-right transition ${
                        selectedSheetIndex === idx
                          ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800">{sheet.sheetName}</span>
                        {idx === 0 && (
                          <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-md text-[10px] font-black">
                            بهترین
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-xs space-y-1 text-slate-600">
                        <div className="flex justify-between">
                          <span>تعداد در شیت:</span>
                          <strong className="text-slate-800 font-mono font-bold">{sheet.upsPerSheet} عدد</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>درصد باطله:</span>
                          <strong className={`font-mono font-bold ${sheet.wastePercent < 15 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {sheet.wastePercent}%
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span>هزینه کل مقوا:</span>
                          <strong className="text-slate-800 font-mono font-bold">
                            {(sheet.totalCardboardCost || 0).toLocaleString()} ت
                          </strong>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* SVG Visualizer */}
                {currentSheet && (
                  <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-amber-300">
                        پیش‌نمایش شماتیک چیدمان زینک و قالب در شیت {currentSheet.sheetName} ({currentSheet.upsPerSheet} تایی)
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {currentSheet.upsL} در طول × {currentSheet.upsW} در عرض
                      </span>
                    </div>

                    <div className="w-full bg-slate-950 p-6 rounded-xl border border-slate-800 flex items-center justify-center overflow-auto">
                      <div
                        className="border-2 border-dashed border-amber-500/60 bg-amber-500/5 relative p-2 grid gap-1.5 rounded"
                        style={{
                          width: `${Math.min(currentSheet.sheetL * 6, 520)}px`,
                          height: `${Math.min(currentSheet.sheetW * 6, 360)}px`,
                          gridTemplateColumns: `repeat(${currentSheet.upsL}, 1fr)`,
                          gridTemplateRows: `repeat(${currentSheet.upsW}, 1fr)`
                        }}
                      >
                        {Array.from({ length: currentSheet.upsPerSheet }).map((_, uIdx) => (
                          <div
                            key={uIdx}
                            className="bg-indigo-600/30 border border-indigo-400/70 rounded flex items-center justify-center text-[10px] font-mono font-bold text-indigo-200"
                          >
                            #{uIdx + 1}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: PREFLIGHT AUDIT ================= */}
      {activeTab === 'preflight' && (
        <div className="space-y-6">
          {/* Preflight Interactive Test Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    بازرسی هوشمند فنی، خط تیغ و آماده‌سازی چاپ (AI Preflight)
                  </h3>
                  <p className="text-xs text-slate-500">
                    بررسی استانداردهای چاپ افست، جهت الیاف مقوا، لایه سلفون، یووی موضعی و لبه چسب
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRunPreflight()}
                disabled={auditLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                {auditLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>اجرای بازرسی فنی</span>
              </button>
            </div>

            {/* Interactive Inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">طول جعبه (cm):</label>
                <input
                  type="number"
                  value={preflightL}
                  onChange={(e) => setPreflightL(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">عرض جعبه (cm):</label>
                <input
                  type="number"
                  value={preflightW}
                  onChange={(e) => setPreflightW(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">ارتفاع (cm):</label>
                <input
                  type="number"
                  value={preflightH}
                  onChange={(e) => setPreflightH(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">گرماژ مقوا (g):</label>
                <input
                  type="number"
                  value={preflightGrammage}
                  onChange={(e) => setPreflightGrammage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">نوع مقوا:</label>
                <select
                  value={preflightCardboard}
                  onChange={(e) => setPreflightCardboard(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                >
                  <option value="ایندربرد">ایندربرد (FBB)</option>
                  <option value="پشت طوسی">پشت طوسی</option>
                  <option value="کرافت">کرافت</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">عرض لب‌چسب (mm):</label>
                <input
                  type="number"
                  value={preflightGlueWidth}
                  onChange={(e) => setPreflightGlueWidth(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                />
              </div>
            </div>

            {/* Checkbox Toggles */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={preflightHasUv}
                  onChange={(e) => setPreflightHasUv(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span>یووی موضعی (Spot UV)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={preflightHasCellophane}
                  onChange={(e) => setPreflightHasCellophane(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span>سلفون مات حرارتی</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={preflightHasFlute}
                  onChange={(e) => setPreflightHasFlute(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span>سینگل E-Flute لمینت</span>
              </label>
            </div>
          </div>

          {/* Preflight Results */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>هشدارهای فنی و باگ‌های احتمالی خط تولید:</span>
            </h4>

            {auditResult?.issues?.length === 0 && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>کلیه استانداردهای خط تیغ و آماده‌سازی چاپ با موفقیت پاس شدند. هیچ باگ بحرانی شناسایی نشد.</span>
              </div>
            )}

            <div className="space-y-3">
              {auditResult?.issues?.map((issue, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3.5"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-amber-900">{issue.title}</span>
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-800 rounded-md text-[10px] font-bold">
                        {issue.category}
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">{issue.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h4 className="text-xs font-black text-slate-800 pt-4 flex items-center gap-1.5 border-t border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              دستورالعمل‌ها و استانداردهای پیشنهادی هوش مصنوعی برای تولید بدون باطله:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {auditResult?.suggestions?.map((sug, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1.5">
                  <span className="text-xs font-black text-slate-800 block">{sug.title}</span>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block">
                    {sug.category}
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">{sug.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
