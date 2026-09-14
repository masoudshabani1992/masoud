import React, { useState, useEffect, useRef } from 'react';
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
  Send,
  Boxes,
  Sliders,
  DollarSign,
  Palette,
  Package
} from 'lucide-react';
import { api } from '../api/client';

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
  const [activeTab, setActiveTab] = useState('nlp'); // 'nlp' | 'nesting' | 'preflight' | 'copilot'

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
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  // Tab 4: Copilot QA State
  const [faqList, setFaqList] = useState([]);
  const [copilotSearch, setCopilotSearch] = useState('');

  // Initial loading
  useEffect(() => {
    // Run default sample nesting
    handleRunNesting();
    api.aiGetKnowledgeBase().then((res) => setFaqList(res.faq || [])).catch(() => {});
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
        // Automatically trigger preflight on the parsed specs
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
                  دستیار هوش مصنوعی و مهندسی بسته‌بندی آرمان امیران
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI Packaging Engine v2.5
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                استخراج خودکار سفارش از روی پیام‌های متنی و وویس مشتریان، بهینه‌سازی فرم‌بندی چیدمان شیت جهت کاهش باطله مقوا، بازرسی هوشمند خط تیغ و محاسبه آنی پیش‌فاکتور.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 shrink-0">
            <button
              onClick={() => setActiveTab('nlp')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'nlp'
                  ? 'bg-indigo-600 text-white shadow-md font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>استخراج سفارش از متن</span>
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
              <span>بهینه‌ساز پرت مقوا</span>
            </button>

            <button
              onClick={() => setActiveTab('preflight')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'preflight'
                  ? 'bg-indigo-600 text-white shadow-md font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>بازرسی خط تیغ</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= TAB 1: NLP ORDER EXTRACTION ================= */}
      {activeTab === 'nlp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Input and sample prompts */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  متن یا پیام استعلام مشتری را وارد نمایید:
                </span>
                <span className="text-xs text-slate-400">تحلیل پردازش زبان طبیعی (NLP)</span>
              </div>

              <textarea
                rows={5}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="پیام مشتری از واتساپ، بله یا تلگرام را اینجا پیست کنید... (مثال: ۵۰ هزار تا جعبه دارویی ایندربرد ۳۰۰ گرم ۴ رنگ با سلفون مات و طلاکوب ۱۰ در ۵ در ۱۲)"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition resize-none leading-relaxed"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleParsePrompt()}
                  disabled={nlpLoading || !promptText.trim()}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs py-3 px-4 rounded-xl shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
                >
                  {nlpLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>در حال استخراج مشخصات و محاسبه قیمت...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>تحلیل هوشمند و صدور پیش‌فاکتور</span>
                    </>
                  )}
                </button>

                {promptText && (
                  <button
                    type="button"
                    onClick={() => { setPromptText(''); setNlpResult(null); }}
                    className="px-3 py-3 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                  >
                    پاک کردن
                  </button>
                )}
              </div>
            </div>

            {/* Ready Sample Templates */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-amber-500" />
                نمونه استعلام‌های آماده جهت تست سریع:
              </h3>

              <div className="space-y-2">
                {SAMPLE_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPromptText(item.text);
                      handleParsePrompt(item.text);
                    }}
                    className="w-full text-right p-2.5 rounded-xl border border-slate-100 hover:border-indigo-300 bg-slate-50 hover:bg-indigo-50/50 transition text-xs group flex items-start justify-between gap-2"
                  >
                    <div>
                      <span className="font-black text-slate-800 group-hover:text-indigo-600 block">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {item.text}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 shrink-0 mt-1 transition-transform group-hover:-translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: AI Extraction & Instant Quotation Card */}
          <div className="lg:col-span-7 space-y-4">
            {nlpResult ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-800">
                        مشخصات استخراج‌شده توسط هوش مصنوعی
                      </h2>
                      <span className="text-xs text-slate-500">
                        شناسایی دقیق جنس مقوا، تیراژ، رنگ‌های چاپ، خدمات تکمیلی و ابعاد
                      </span>
                    </div>
                  </div>

                  {onTransferToOrderForm && (
                    <button
                      type="button"
                      onClick={() => onTransferToOrderForm(nlpResult.data)}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl transition shadow-md shadow-indigo-100 flex items-center gap-1.5"
                    >
                      <span>انتقال به فرم سفارش</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Detected Tags Cloud */}
                <div className="flex flex-wrap gap-2">
                  {nlpResult.data.detected_tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Technical Specs Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">تیراژ کل</span>
                    <span className="font-black text-slate-800 text-sm mt-0.5 block">
                      {nlpResult.data.quantity?.toLocaleString('fa-IR')} عدد
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">جنس و گرماژ</span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                      {nlpResult.data.cardboard_type} {nlpResult.data.cardboard_grammage} گرم
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">ابعاد (طول×عرض×ارتفاع)</span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block font-mono">
                      {nlpResult.data.length}×{nlpResult.data.width}×{nlpResult.data.height} cm
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">چاپ و رنگ</span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                      {nlpResult.data.print_type}
                    </span>
                  </div>
                </div>

                {/* Instant Financial Calculation Banner */}
                <div className="p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-emerald-800 font-bold block">برآورد قیمت تمام‌شده روز:</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-emerald-700">
                        {Math.round((nlpResult.estimate?.unitPrice || 0) / 10).toLocaleString('fa-IR')}
                      </span>
                      <span className="text-xs font-bold text-emerald-800">تومان (هر عدد)</span>
                      <span className="text-xs text-slate-400 font-mono">
                        ({(nlpResult.estimate?.unitPrice || 0).toLocaleString('fa-IR')} ریال)
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:border-r sm:border-emerald-500/20 sm:pr-4">
                    <span className="text-xs text-slate-500 block">مبلغ کل فاکتور:</span>
                    <span className="text-lg font-black text-slate-800">
                      {Math.round((nlpResult.estimate?.finalPrice || 0) / 10).toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                </div>

                {/* Customer Ready Quotation Message (WhatsApp / Bale Format) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      متن پیش‌فاکتور آماده ارسال به مشتری (بله / واتساپ / پیامک):
                    </label>
                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                    >
                      {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSummary ? 'کپی شد!' : 'کپی متن پیام'}</span>
                    </button>
                  </div>

                  <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl text-xs font-sans whitespace-pre-line leading-relaxed border border-slate-800 select-all">
                    {nlpResult.summaryText}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 text-slate-400">
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
                  <Brain className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-700">منتظر دریافت استعلام</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                    متن استعلام مشتری را در کادر سمت راست بنویسید یا روی یکی از نمونه‌های آماده کلیک کنید تا مشخصات و قیمت آنی صادر شود.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: SHEET NESTING & IMPOSITION OPTIMIZER ================= */}
      {activeTab === 'nesting' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-800">ابعاد بازشده جعبه و تیراژ</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">طول بازشده (cm):</label>
                  <input
                    type="number"
                    value={nestFlatL}
                    onChange={(e) => setNestFlatL(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">عرض بازشده (cm):</label>
                  <input
                    type="number"
                    value={nestFlatW}
                    onChange={(e) => setNestFlatW(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">تیراژ سفارش:</label>
                  <input
                    type="number"
                    step="1000"
                    value={nestQty}
                    onChange={(e) => setNestQty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">گرماژ مقوا (GSM):</label>
                  <input
                    type="number"
                    value={nestGsm}
                    onChange={(e) => setNestGsm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">قیمت هر کیلو مقوا (تومان):</label>
                <input
                  type="number"
                  step="1000"
                  value={nestCardboardPriceKg}
                  onChange={(e) => setNestCardboardPriceKg(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={handleRunNesting}
                disabled={nestingLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 px-4 rounded-xl shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2"
              >
                {nestingLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                <span>محاسبه بهینه‌ترین چیدمان و پرت مقوا</span>
              </button>
            </div>

            {/* Savings Callout */}
            {nestingResult?.savingsVsWorst > 0 && (
              <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-black text-emerald-900 block">
                    صرفه‌جویی با انتخاب شیت برتر:
                  </span>
                  <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                    با انتخاب شیت <strong>{nestingResult.bestChoice?.sheetName}</strong>، مبلغ{' '}
                    <strong>{nestingResult.savingsVsWorst?.toLocaleString('fa-IR')} تومان</strong> در هزینه خرید مقوا نسبت به بدترین شیت صرفه‌جویی می‌شود!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Visualization & Comparison Column */}
          <div className="lg:col-span-8 space-y-4">
            {/* Sheet Choices Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {nestingResult?.allChoices?.map((item, idx) => {
                const isSelected = selectedSheetIndex === idx;
                const isBest = idx === 0;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedSheetIndex(idx)}
                    className={`p-4 rounded-2xl text-right transition border flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-300 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black text-slate-800 truncate">{item.sheetName}</span>
                        {isBest && (
                          <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-full shrink-0">
                            ★ بهترین شیت
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                        <span>تعداد در فرم (Ups):</span>
                        <span className="font-black text-indigo-700 text-sm">{item.boxesPerSheet} عدد</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                        <span>درصد پرت مقوا:</span>
                        <span className={`font-bold ${item.wastePercentage < 15 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {item.wastePercentage}٪
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                        <span>شیت مورد نیاز:</span>
                        <span className="font-bold text-slate-700">{item.sheetsNeeded?.toLocaleString('fa-IR')} برگ</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-2 mt-3 flex items-center justify-between text-xs">
                      <span className="text-slate-400">هزینه کل مقوا:</span>
                      <span className="font-black text-slate-900">
                        {item.totalCardboardCost?.toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 2D Interactive Layout Preview */}
            {currentSheet && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-black text-slate-800">
                      نمای شماتیک چیدمان و فرم‌بندی شیت: {currentSheet.sheetName}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">
                    جهت چیدمان: <strong>{currentSheet.orientation}</strong>
                  </span>
                </div>

                {/* Visual Sheet Canvas Container */}
                <div className="p-6 bg-slate-900 rounded-2xl flex items-center justify-center overflow-x-auto min-h-[300px]">
                  <div
                    className="relative bg-white rounded-lg shadow-2xl border-4 border-amber-400 p-2 flex flex-wrap content-start gap-1 transition-all"
                    style={{
                      width: `${Math.min(500, currentSheet.sheetLength * 4.5)}px`,
                      height: `${Math.min(350, currentSheet.sheetWidth * 4.5)}px`
                    }}
                  >
                    {/* Gripper / Margin indicator */}
                    <div className="absolute top-0 right-0 left-0 h-2 bg-rose-500/30 text-[9px] text-rose-800 font-bold text-center leading-none">
                      لب‌پنجه ماشین چاپ (Gripper)
                    </div>

                    {/* Render Box Tiles */}
                    {Array.from({ length: currentSheet.boxesPerSheet }).map((_, bIdx) => (
                      <div
                        key={bIdx}
                        className="bg-indigo-50 border-2 border-indigo-400 hover:border-indigo-600 hover:bg-indigo-100 rounded flex flex-col items-center justify-center text-[10px] text-indigo-900 font-bold transition cursor-pointer select-none"
                        style={{
                          width: `${(100 / (currentSheet.cols || 2)) - 2}%`,
                          height: `${(100 / (currentSheet.rows || 2)) - 3}%`
                        }}
                      >
                        <span>#{bIdx + 1}</span>
                        <span className="text-[9px] text-indigo-600">{nestFlatL}×{nestFlatW}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[11px]">راندمان سطح مقوا</span>
                    <strong className="text-emerald-700 text-sm font-black">{currentSheet.efficiencyPercentage}٪ مفید</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[11px]">درصد باطله و برش</span>
                    <strong className="text-amber-700 text-sm font-black">{currentSheet.wastePercentage}٪ پرت</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[11px]">هزینه مقوای هر جعبه</span>
                    <strong className="text-slate-800 text-sm font-black">{currentSheet.cardboardCostPerBox} تومان</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: PREFLIGHT AUDIT ================= */}
      {activeTab === 'preflight' && (
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
              onClick={() => {
                if (nlpResult?.data) {
                  api.aiPreflightAudit(nlpResult.data).then((res) => setAuditResult(res));
                } else {
                  api.aiPreflightAudit({ length: 15, width: 10, cardboard_grammage: 300, has_uv: 1, has_cellophane: 0 }).then((res) => setAuditResult(res));
                }
              }}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>بازرسی مجدد</span>
            </button>
          </div>

          {/* Audit Result Cards */}
          <div className="space-y-4">
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

            <h4 className="text-xs font-black text-slate-800 pt-2 flex items-center gap-1.5">
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
