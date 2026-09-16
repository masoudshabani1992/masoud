import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  Users,
  Send,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  AlertCircle,
  PlusCircle,
  RefreshCw,
  Search,
  ArrowRight,
  TrendingUp,
  Package,
  Phone,
  Layers,
  Sparkles,
  Award,
  ChevronLeft,
  Calendar,
  X,
  Building,
  Check,
  XCircle,
  Boxes
} from 'lucide-react';

const CARDBOARD_TYPES = [
  'ایندربرد بهداشتی (Ivory/FBB)',
  'پشت طوسی صنعتی (Duplex)',
  'کرافت قهوه‌ای (Kraft)',
  'گلاسه براق (Art Paper)',
  'فابریانو فانتزی (Textured)',
  'متالایز طلایی / نقره‌ای'
];

const GRAMMAGES = [
  { value: 230, label: '۲۳۰ گرم' },
  { value: 250, label: '۲۵۰ گرم' },
  { value: 280, label: '۲۸۰ گرم' },
  { value: 300, label: '۳۰۰ گرم (استاندارد)' },
  { value: 350, label: '۳۵۰ گرم' },
  { value: 400, label: '۴۰۰ گرم' }
];

const MATERIAL_CONSTRUCTIONS = [
  'مقوای تک‌لا (بدون سینگل)',
  'لمینت روی سینگل E-Flute (ای فلوت)',
  'لمینت روی سینگل B-Flute (بی فلوت)',
  'کارتن ۳ لایه C-Flute (کارتن مادر)',
  'کارتن ۵ لایه BC-Flute (کارتن سنگین صادراتی)',
  'هاردباکس مغزی کرجی'
];

const CELLOPHANE_TYPES = [
  'سلفون مات حرارتی',
  'سلفون براق حرارتی',
  'سلفون مخملی (Soft Touch)',
  'سلفون متالایز واترپروف',
  'بدون سلفون (ورنی / چاپ مستقیم)'
];

export default function MarketingLeadsView({ onNavigateToKanban }) {
  const { currentUser, role } = useAuth();
  const isMarketer = role === 'marketer';
  const isCommercialOrCeo = role === 'sales' || role === 'ceo' || role === 'secretary' || role === 'accounting';

  const [activeTab, setActiveTab] = useState(isMarketer ? 'new_lead' : 'leads_list'); // 'new_lead' | 'leads_list'
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form States
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(5000);
  const [cardboardType, setCardboardType] = useState('ایندربرد بهداشتی (Ivory/FBB)');
  const [cardboardGrammage, setCardboardGrammage] = useState(300);
  const [materialConstruction, setMaterialConstruction] = useState('مقوای تک‌لا (بدون سینگل)');
  const [cellophaneType, setCellophaneType] = useState('سلفون مات حرارتی');
  const [boxLength, setBoxLength] = useState('');
  const [boxWidth, setBoxWidth] = useState('');
  const [boxHeight, setBoxHeight] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Estimation Modal State (for Commercial Manager / CEO)
  const [estimatingLead, setEstimatingLead] = useState(null);
  const [estimatedUnitPrice, setEstimatedUnitPrice] = useState('');
  const [estimatedTotalPrice, setEstimatedTotalPrice] = useState('');
  const [commercialNotes, setCommercialNotes] = useState('');
  const [estimatingLoading, setEstimatingLoading] = useState(false);

  // Fetch leads
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.getMarketingLeads();
      if (res.success) {
        setLeads(res.leads || []);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Handle Submit Form
  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !productName || !quantity) {
      alert('لطفاً فیلدهای ستاره‌دار (نام مشتری، شماره تماس، نام محصول و تیراژ) را تکمیل فرمایید.');
      return;
    }

    setSubmitting(true);
    setSubmitSuccess(null);
    try {
      const res = await api.createMarketingLead({
        customer_name: customerName,
        customer_phone: customerPhone,
        product_name: productName,
        quantity: Number(quantity),
        cardboard_type: cardboardType,
        cardboard_grammage: Number(cardboardGrammage),
        material_construction: materialConstruction,
        cellophane_type: cellophaneType,
        box_length: boxLength ? Number(boxLength) : null,
        box_width: boxWidth ? Number(boxWidth) : null,
        box_height: boxHeight ? Number(boxHeight) : null,
        notes: notes
      });

      if (res.success) {
        setSubmitSuccess({
          code: res.lead_code,
          msg: res.message
        });
        // Reset form
        setCustomerName('');
        setCustomerPhone('');
        setProductName('');
        setQuantity(5000);
        setBoxLength('');
        setBoxWidth('');
        setBoxHeight('');
        setNotes('');
        fetchLeads();
        if (isMarketer) {
          setActiveTab('leads_list');
        }
      }
    } catch (err) {
      alert(err.message || 'خطا در ثبت استعلام.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Estimation Modal
  const handleOpenEstimateModal = (lead) => {
    setEstimatingLead(lead);
    setEstimatedUnitPrice(lead.estimated_unit_price || '');
    setEstimatedTotalPrice(lead.estimated_total_price || (lead.estimated_unit_price ? lead.estimated_unit_price * lead.quantity : ''));
    setCommercialNotes(lead.commercial_notes || '');
  };

  // Submit Estimation (by Commercial Manager)
  const handleSubmitEstimate = async () => {
    if (!estimatedUnitPrice) {
      alert('لطفاً قیمت برآورد شده هر عدد را وارد فرمایید.');
      return;
    }

    setEstimatingLoading(true);
    try {
      const res = await api.estimateMarketingLead(estimatingLead.id, {
        estimated_unit_price: Number(estimatedUnitPrice),
        estimated_total_price: Number(estimatedTotalPrice) || (Number(estimatedUnitPrice) * estimatingLead.quantity),
        commercial_notes: commercialNotes
      });

      if (res.success) {
        alert(res.message);
        setEstimatingLead(null);
        fetchLeads();
      }
    } catch (err) {
      alert(err.message || 'خطا در ثبت برآورد قیمت.');
    } finally {
      setEstimatingLoading(false);
    }
  };

  // Convert Lead to Official Factory Order
  const handleConvertToProject = async (lead) => {
    if (!window.confirm(`آیا از تبدیل استعلام «${lead.customer_name}» (${lead.product_name}) به سفارش رسمی و گردش کار تولید اطمینان دارید؟`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await api.convertMarketingLeadToProject(lead.id);
      if (res.success) {
        alert(res.message);
        fetchLeads();
        if (onNavigateToKanban) {
          onNavigateToKanban();
        }
      }
    } catch (err) {
      alert(err.message || 'خطا در تبدیل استعلام.');
    } finally {
      setLoading(false);
    }
  };

  // Update Status (Customer Approval / Rejection)
  const handleUpdateStatus = async (leadId, status) => {
    try {
      const res = await api.updateMarketingLeadStatus(leadId, status);
      if (res.success) {
        fetchLeads();
      }
    } catch (err) {
      alert(err.message || 'خطا در تغییر وضعیت.');
    }
  };

  // Filter Leads
  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      !searchTerm ||
      (l.customer_name && l.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.product_name && l.product_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.customer_phone && l.customer_phone.includes(searchTerm)) ||
      (l.lead_code && l.lead_code.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = leads.filter(l => l.status === 'pending_commercial').length;
  const estimatedCount = leads.filter(l => l.status === 'estimated').length;
  const convertedCount = leads.filter(l => l.status === 'converted_to_order').length;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shadow-inner">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black">کارتابل بازاریابی و استعلام قیمت</h1>
              <span className="text-xs bg-teal-400/20 text-teal-200 border border-teal-400/30 px-2.5 py-0.5 rounded-full font-bold">
                {isMarketer ? 'پنل اختصاصی بازاریاب' : 'واحد بازرگانی و فروش'}
              </span>
            </div>
            <p className="text-xs text-teal-100/80 mt-1 leading-relaxed">
              ثبت مشخصات فنی مقوا، فلوت، سلفون و ارسال مستقیم به مدیر بازرگانی جهت برآورد قیمت و پیش‌فاکتور
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-950/40 p-1.5 rounded-2xl border border-white/10 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setActiveTab('new_lead')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'new_lead'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>ثبت استعلام جدید</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leads_list')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 relative ${
              activeTab === 'leads_list'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>لیست و پیگیری استعلام‌ها</span>
            {pendingCount > 0 && (
              <span className="w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Metric Counters (for Commercial/CEO & Marketer) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 block font-bold">کل استعلام‌های ثبت شده</span>
            <strong className="text-lg font-black text-slate-800 font-mono mt-0.5 block">{leads.length}</strong>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between bg-amber-50/30">
          <div>
            <span className="text-[11px] text-amber-700 block font-bold">در انتظار برآورد بازرگانی</span>
            <strong className="text-lg font-black text-amber-700 font-mono mt-0.5 block">{pendingCount}</strong>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm flex items-center justify-between bg-emerald-50/30">
          <div>
            <span className="text-[11px] text-emerald-700 block font-bold">قیمت‌گذاری شده (آماده تایید)</span>
            <strong className="text-lg font-black text-emerald-700 font-mono mt-0.5 block">{estimatedCount}</strong>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-indigo-200 shadow-sm flex items-center justify-between bg-indigo-50/30">
          <div>
            <span className="text-[11px] text-indigo-700 block font-bold">تبدیل شده به سفارش کارخانه</span>
            <strong className="text-lg font-black text-indigo-700 font-mono mt-0.5 block">{convertedCount}</strong>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* TAB 1: NEW MARKETING LEAD FORM */}
      {activeTab === 'new_lead' && (
        <form onSubmit={handleSubmitLead} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-teal-600" />
                فرم ثبت مشخصات استعلام توسط بازاریاب
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                اطلاعات مشتری و مشخصات فنی جعبه را وارد نمایید. پس از ثبت، مستقیماً برای مدیر بازرگانی ارسال می‌گردد.
              </p>
            </div>
            <span className="text-xs bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full font-bold">
              مرحله ۱: دریافت اطلاعات میدانی
            </span>
          </div>

          {submitSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>{submitSuccess.msg}</strong> (کد پیگیری: <strong className="font-mono">{submitSuccess.code}</strong>)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('leads_list')}
                className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs hover:bg-emerald-700 transition"
              >
                مشاهده در کارتابل
              </button>
            </div>
          )}

          {/* Section 1: Customer Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              ۱. مشخصات مشتری و سفارش
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  نام مشتری / شرکت: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شرکت داروسازی کیمیا / صنایع غذایی برتر"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  شماره موبایل مشتری: <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    placeholder="0912..."
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  نام محصول / عنوان جعبه: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: جعبه خمیردندان ذغالی ۱۰۰ میل"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Technical Specs (Cardboard, Flute, Cellophane) */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              ۲. مشخصات فنی متریال و تیراژ
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              {/* Quantity */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  تیراژ سفارش: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  step="500"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-800 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              {/* Cardboard Type */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">نوع مقوا:</label>
                <select
                  value={cardboardType}
                  onChange={(e) => setCardboardType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                >
                  {CARDBOARD_TYPES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Grammage */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">گرماژ مقوا:</label>
                <select
                  value={cardboardGrammage}
                  onChange={(e) => setCardboardGrammage(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                >
                  {GRAMMAGES.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>

              {/* Cellophane */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">نوع سلفون:</label>
                <select
                  value={cellophaneType}
                  onChange={(e) => setCellophaneType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                >
                  {CELLOPHANE_TYPES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Material Construction (Single / Sheet / Flute) */}
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">
                نوع جنس ساختار (سینگل / ورق / مقوا):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {MATERIAL_CONSTRUCTIONS.map((mc) => (
                  <label
                    key={mc}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center gap-2.5 ${
                      materialConstruction === mc
                        ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="material_construct"
                      checked={materialConstruction === mc}
                      onChange={() => setMaterialConstruction(mc)}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span>{mc}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Approximate Dimensions & Notes */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              ۳. ابعاد تقریبی (سانتی‌متر) و توضیحات تکمیلی
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">طول (L):</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="مثال: ۸"
                  value={boxLength}
                  onChange={(e) => setBoxLength(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">عرض (W):</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="مثال: ۱.۵"
                  value={boxWidth}
                  onChange={(e) => setBoxWidth(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ارتفاع (H):</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="مثال: ۱۶.۵"
                  value={boxHeight}
                  onChange={(e) => setBoxHeight(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                توضیحات و نیازمندی‌های مشتری (یووی، طلاکوب، نوع درب، شرایط تحویل):
              </label>
              <textarea
                rows="3"
                placeholder="توضیحات تکمیلی مشتری، نمونه رنگ، موعد تحویل و نکات خاص..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-teal-600 hover:bg-teal-700 text-white font-black text-sm px-6 py-3 rounded-2xl shadow-lg shadow-teal-100 transition flex items-center gap-2 active:scale-95"
            >
              {submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              <span>ثبت و ارسال به مدیر بازرگانی جهت برآورد قیمت</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: LEADS LIST & WORKFLOW TRACKING */}
      {activeTab === 'leads_list' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-800">
                  {isMarketer ? 'استعلام‌های ثبت شده توسط من' : 'کلیه استعلام‌های دریافتی از بازاریابان'}
                </h2>
                <span className="text-xs text-slate-500">
                  مشاهده وضعیت برآورد بازرگانی، تاییدات کارفرما و ارجاع به خط تولید
                </span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <input
                  type="text"
                  placeholder="جستجوی مشتری یا کد..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500 w-44 sm:w-56"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="pending_commercial">در انتظار برآورد</option>
                <option value="estimated">قیمت‌گذاری شده</option>
                <option value="customer_approved">تایید مشتری</option>
                <option value="converted_to_order">تبدیل به سفارش کارخانه</option>
              </select>

              <button
                type="button"
                onClick={fetchLeads}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                title="تازه‌سازی"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table / List */}
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
              <span>در حال دریافت استعلام‌ها...</span>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <Package className="w-8 h-8 mx-auto text-slate-300" />
              <p>هیچ استعلامی یافت نشد.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-3">کد استعلام</th>
                    <th className="p-3">مشتری و تلفن</th>
                    <th className="p-3">نام محصول</th>
                    <th className="p-3">تیراژ</th>
                    <th className="p-3">مشخصات فنی</th>
                    <th className="p-3">وضعیت</th>
                    <th className="p-3">برآورد قیمت</th>
                    <th className="p-3 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead) => {
                    const isPending = lead.status === 'pending_commercial';
                    const isEstimated = lead.status === 'estimated';
                    const isApproved = lead.status === 'customer_approved';
                    const isConverted = lead.status === 'converted_to_order';

                    return (
                      <tr key={lead.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-3 font-mono font-bold text-teal-700">{lead.lead_code}</td>
                        <td className="p-3">
                          <strong className="block text-slate-800">{lead.customer_name}</strong>
                          <span className="text-[11px] text-slate-400 font-mono" dir="ltr">{lead.customer_phone}</span>
                        </td>
                        <td className="p-3 font-bold text-slate-700">{lead.product_name}</td>
                        <td className="p-3 font-mono font-black text-slate-900">
                          {lead.quantity?.toLocaleString('fa-IR')} عدد
                        </td>
                        <td className="p-3 text-[11px] text-slate-600 space-y-0.5">
                          <div>• مقوا: <strong>{lead.cardboard_type}</strong> ({lead.cardboard_grammage}g)</div>
                          <div>• جنس: <strong>{lead.material_construction}</strong></div>
                          <div>• سلفون: <strong>{lead.cellophane_type}</strong></div>
                          {lead.box_length && (
                            <div className="text-slate-400 font-mono">
                              ابعاد: {lead.box_length}×{lead.box_width}×{lead.box_height} cm
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          {isPending && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit">
                              <Clock className="w-3 h-3" />
                              در انتظار بازرگانی
                            </span>
                          )}
                          {isEstimated && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3" />
                              قیمت‌گذاری شد
                            </span>
                          )}
                          {isApproved && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200 flex items-center gap-1 w-fit">
                              <Check className="w-3 h-3" />
                              تایید مشتری
                            </span>
                          )}
                          {isConverted && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1 w-fit">
                              <TrendingUp className="w-3 h-3" />
                              در حال تولید (#{lead.converted_archive_code})
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {lead.estimated_unit_price ? (
                            <div>
                              <strong className="text-emerald-700 block font-mono text-xs">
                                فی: {lead.estimated_unit_price?.toLocaleString('fa-IR')} ت
                              </strong>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                کل: {lead.estimated_total_price?.toLocaleString('fa-IR')} ت
                              </span>
                              {lead.commercial_notes && (
                                <span className="text-[10px] text-indigo-600 block truncate max-w-[120px]" title={lead.commercial_notes}>
                                  {lead.commercial_notes}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">---</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {/* Commercial Price Estimation Button */}
                            {isCommercialOrCeo && (
                              <button
                                type="button"
                                onClick={() => handleOpenEstimateModal(lead)}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-bold transition shadow-xs flex items-center gap-1"
                                title="برآورد و اعلام قیمت به بازاریاب"
                              >
                                <DollarSign className="w-3 h-3" />
                                <span>{isPending ? 'برآورد قیمت' : 'ویرایش قیمت'}</span>
                              </button>
                            )}

                            {/* Marketer: Confirm Customer Approval */}
                            {isEstimated && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(lead.id, 'customer_approved')}
                                className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[11px] font-bold transition shadow-xs flex items-center gap-1"
                                title="ثبت تاییدیه مشتری"
                              >
                                <Check className="w-3 h-3" />
                                <span>تایید مشتری</span>
                              </button>
                            )}

                            {/* Commercial/CEO: Convert to Factory Project */}
                            {isCommercialOrCeo && (isEstimated || isApproved) && !isConverted && (
                              <button
                                type="button"
                                onClick={() => handleConvertToProject(lead)}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold transition shadow-xs flex items-center gap-1"
                                title="تبدیل به سفارش کارخانه و صدور پیش‌فاکتور"
                              >
                                <TrendingUp className="w-3 h-3" />
                                <span>ارسال به تولید</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PRICE ESTIMATION MODAL (For Commercial Manager / CEO) */}
      {estimatingLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-amber-600 font-black text-sm">
                <DollarSign className="w-5 h-5" />
                <span>برآورد قیمت توسط مدیر بازرگانی ({estimatingLead.lead_code})</span>
              </div>
              <button
                type="button"
                onClick={() => setEstimatingLead(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Specs Summary */}
            <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1.5 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">مشتری / محصول:</span>
                <strong className="text-slate-800">{estimatingLead.customer_name} ({estimatingLead.product_name})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">تیراژ:</span>
                <strong className="text-slate-800 font-mono">{estimatingLead.quantity?.toLocaleString('fa-IR')} عدد</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">مشخصات متریال:</span>
                <strong className="text-slate-800">{estimatingLead.cardboard_type} - {estimatingLead.material_construction}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">سلفون:</span>
                <strong className="text-slate-800">{estimatingLead.cellophane_type}</strong>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  قیمت برآورد شده هر عدد جعبه (تومان): <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    step="100"
                    placeholder="مثال: ۲۴۵۰"
                    value={estimatedUnitPrice}
                    onChange={(e) => {
                      const uPrice = Number(e.target.value);
                      setEstimatedUnitPrice(e.target.value);
                      setEstimatedTotalPrice(uPrice * estimatingLead.quantity);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-800 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <span className="absolute left-3 top-2 text-slate-400 text-[10px]">تومان</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">قیمت کل سفارش (تومان):</label>
                <div className="relative">
                  <input
                    type="number"
                    step="1000"
                    value={estimatedTotalPrice}
                    onChange={(e) => setEstimatedTotalPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-800 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <span className="absolute left-3 top-2 text-slate-400 text-[10px]">تومان</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">توضیحات و شرایط بازرگانی:</label>
                <textarea
                  rows="2"
                  placeholder="شرایط پرداخت، تخفیف تیراژ، زمان تحویل..."
                  value={commercialNotes}
                  onChange={(e) => setCommercialNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEstimatingLead(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                انصراف
              </button>
              <button
                type="button"
                disabled={estimatingLoading}
                onClick={handleSubmitEstimate}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-xs shadow-md transition flex items-center gap-1.5"
              >
                {estimatingLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>ثبت برآورد و اعلام به بازاریاب</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
