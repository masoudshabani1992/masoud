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
<<<<<<< HEAD
  Boxes
=======
  Boxes,
  Printer,
  MessageSquare,
  History,
  PhoneCall,
  User,
  ShieldCheck,
  ArrowUpRight,
  ExternalLink,
  ChevronDown,
  Info
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
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

<<<<<<< HEAD
=======
const STAGE_NAMES = {
  1: '۱. بازرگانی و تعریف سفارش',
  2: '۲. برآورد و پیش‌فاکتور',
  3: '۳. تایید پیش‌فاکتور و بیعانه',
  4: '۴. تایید مدیرعامل',
  5: '۵. طراحی و خط تیغ',
  6: '۶. تایید طرح مشتری',
  7: '۷. ماکت و کلیشه/قالب',
  8: '۸. تایید ماکت مشتری',
  9: '۹. تامین مقوا و ملزومات',
  10: '۱۰. سالن تولید و تحویل'
};

>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
export default function MarketingLeadsView({ onNavigateToKanban }) {
  const { currentUser, role } = useAuth();
  const isMarketer = role === 'marketer';
  const isCommercialOrCeo = role === 'sales' || role === 'ceo' || role === 'secretary' || role === 'accounting';

<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState(isMarketer ? 'new_lead' : 'leads_list'); // 'new_lead' | 'leads_list'
=======
  const [activeTab, setActiveTab] = useState('leads_list'); // 'leads_list' | 'new_lead' | 'profile_stats'
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

<<<<<<< HEAD
  // Form States
=======
  // New Lead Form States
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
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

<<<<<<< HEAD
=======
  // Modals State
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState(null);
  const [selectedLeadForFollowup, setSelectedLeadForFollowup] = useState(null);
  const [selectedLeadForPrint, setSelectedLeadForPrint] = useState(null);
  
  // Follow-up Form
  const [followupNote, setFollowupNote] = useState('');
  const [followupOutcome, setFollowupOutcome] = useState('پیگیری تلفنی با مشتری');
  const [followupStatus, setFollowupStatus] = useState('');
  const [followupLoading, setFollowupLoading] = useState(false);

>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
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
<<<<<<< HEAD
        if (isMarketer) {
          setActiveTab('leads_list');
        }
=======
        setActiveTab('leads_list');
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
      }
    } catch (err) {
      alert(err.message || 'خطا در ثبت استعلام.');
    } finally {
      setSubmitting(false);
    }
  };

<<<<<<< HEAD
  // Open Estimation Modal
=======
  // Open Estimation Modal (Commercial / CEO)
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
  const handleOpenEstimateModal = (lead) => {
    setEstimatingLead(lead);
    setEstimatedUnitPrice(lead.estimated_unit_price || '');
    setEstimatedTotalPrice(lead.estimated_total_price || (lead.estimated_unit_price ? lead.estimated_unit_price * lead.quantity : ''));
    setCommercialNotes(lead.commercial_notes || '');
  };

<<<<<<< HEAD
  // Submit Estimation (by Commercial Manager)
=======
  // Submit Estimation (Commercial Manager)
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
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

<<<<<<< HEAD
  // Convert Lead to Official Factory Order
  const handleConvertToProject = async (lead) => {
    if (!window.confirm(`آیا از تبدیل استعلام «${lead.customer_name}» (${lead.product_name}) به سفارش رسمی و گردش کار تولید اطمینان دارید؟`)) {
=======
  // Open Follow-up Modal
  const handleOpenFollowupModal = (lead) => {
    setSelectedLeadForFollowup(lead);
    setFollowupNote('');
    setFollowupOutcome('پیگیری تلفنی با مشتری');
    setFollowupStatus(lead.status);
  };

  // Submit Follow-up Log
  const handleSubmitFollowup = async (e) => {
    e.preventDefault();
    if (!followupNote.trim()) {
      alert('لطفاً متن یادداشت پیگیری را وارد نمایید.');
      return;
    }

    setFollowupLoading(true);
    try {
      const res = await api.addMarketingLeadFollowup(selectedLeadForFollowup.id, {
        note: followupNote,
        outcome: followupOutcome,
        new_status: followupStatus || selectedLeadForFollowup.status
      });

      if (res.success) {
        alert(res.message || 'یادداشت پیگیری ثبت شد.');
        setSelectedLeadForFollowup(null);
        fetchLeads();
      }
    } catch (err) {
      alert(err.message || 'خطا در ثبت پیگیری.');
    } finally {
      setFollowupLoading(false);
    }
  };

  // Convert Lead to Official Factory Order
  const handleConvertToProject = async (lead) => {
    if (!window.confirm(`آیا از تبدیل استعلام «${lead.customer_name}» (${lead.product_name}) به سفارش رسمی و شروع فرآیند تولید در کارخانه اطمینان دارید؟`)) {
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
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

<<<<<<< HEAD
  // Update Status (Customer Approval / Rejection)
  const handleUpdateStatus = async (leadId, status) => {
    try {
      const res = await api.updateMarketingLeadStatus(leadId, status);
      if (res.success) {
        fetchLeads();
      }
=======
  // Quick Status Update
  const handleQuickStatusChange = async (leadId, status, rejectionReason = '') => {
    try {
      await api.updateMarketingLeadStatus(leadId, {
        status,
        rejection_reason: rejectionReason
      });
      fetchLeads();
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
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

<<<<<<< HEAD
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
=======
  // Calculate Metrics
  const totalLeads = leads.length;
  const pendingCount = leads.filter(l => l.status === 'pending_commercial').length;
  const estimatedCount = leads.filter(l => l.status === 'estimated').length;
  const approvedCount = leads.filter(l => l.status === 'customer_approved').length;
  const convertedCount = leads.filter(l => l.status === 'converted_to_order').length;
  const rejectedCount = leads.filter(l => l.status === 'customer_rejected').length;

  const totalConvertedValue = leads
    .filter(l => l.status === 'converted_to_order' || l.status === 'customer_approved')
    .reduce((sum, l) => sum + (l.estimated_total_price || 0), 0);

  const conversionRate = totalLeads > 0 ? Math.round(((approvedCount + convertedCount) / totalLeads) * 100) : 0;

  return (
    <div className="space-y-6 animate-fadeIn pb-12" dir="rtl">
      {/* Top Header Card with Marketer Profile Specs */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-teal-800/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 -translate-x-12 -translate-y-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 translate-x-12 translate-y-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-900/40 border border-teal-400/30">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white">پروفایل و کارتابل پیگیری استعلامات بازاریاب</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                  {currentUser?.fullName || currentUser?.full_name || 'کارشناس بازاریابی'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-teal-100/80 mt-1 max-w-2xl leading-relaxed">
                سامانه رهگیری لحظه‌ای نتیجه استعلام‌ها، مشاهده قیمت‌های اعلام‌شده توسط واحد بازرگانی، ثبت لاگ تماس و پیگیری مشتری، و صدور پیش‌فاکتور رسمی.
              </p>
            </div>
          </div>

          {/* Action Tabs */}
          <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-white/10 backdrop-blur-sm shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('leads_list')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                activeTab === 'leads_list'
                  ? 'bg-teal-500 text-slate-950 shadow-md ring-2 ring-teal-400'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>استعلام‌های من ({totalLeads})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('new_lead')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                activeTab === 'new_lead'
                  ? 'bg-teal-500 text-slate-950 shadow-md ring-2 ring-teal-400'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>ثبت استعلام جدید</span>
            </button>
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* TAB 1: NEW MARKETING LEAD FORM */}
=======
      {/* Marketer Performance & Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Leads */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>کل استعلام‌ها</span>
            <Boxes className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900 font-mono">{totalLeads}</span>
            <span className="text-[10px] text-slate-400">موردی</span>
          </div>
        </div>

        {/* Pending Estimation (Yellow) */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'pending_commercial' ? 'all' : 'pending_commercial')}
          className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
            statusFilter === 'pending_commercial'
              ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400 shadow-md'
              : 'bg-white border-amber-200 hover:border-amber-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-amber-800 text-xs font-bold">
            <span>در انتظار برآورد</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-amber-900 font-mono">{pendingCount}</span>
            <span className="text-[10px] text-amber-700">واحد بازرگانی</span>
          </div>
        </button>

        {/* Estimated / Price Ready (Green) */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'estimated' ? 'all' : 'estimated')}
          className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
            statusFilter === 'estimated'
              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400 shadow-md'
              : 'bg-white border-emerald-200 hover:border-emerald-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-800 text-xs font-bold">
            <span>قیمت‌گذاری شده</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-emerald-900 font-mono">{estimatedCount}</span>
            <span className="text-[10px] text-emerald-700">آماده اعلام</span>
          </div>
        </button>

        {/* Customer Approved (Sky) */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'customer_approved' ? 'all' : 'customer_approved')}
          className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
            statusFilter === 'customer_approved'
              ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-400 shadow-md'
              : 'bg-white border-sky-200 hover:border-sky-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-sky-800 text-xs font-bold">
            <span>تایید مشتری</span>
            <Check className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-sky-900 font-mono">{approvedCount}</span>
            <span className="text-[10px] text-sky-700">آماده پیش‌فاکتور</span>
          </div>
        </button>

        {/* In Production (Indigo) */}
        <button
          onClick={() => setStatusFilter(statusFilter === 'converted_to_order' ? 'all' : 'converted_to_order')}
          className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
            statusFilter === 'converted_to_order'
              ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-400 shadow-md'
              : 'bg-white border-indigo-200 hover:border-indigo-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-indigo-800 text-xs font-bold">
            <span>در حال تولید سالن</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-indigo-900 font-mono">{convertedCount}</span>
            <span className="text-[10px] text-indigo-700">سفارش رسمی</span>
          </div>
        </button>

        {/* Conversion Rate & Total Value */}
        <div className="bg-gradient-to-tr from-slate-900 to-teal-900 text-white p-4 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-teal-300 text-xs font-bold">
            <span>نرخ تبدیل موفق</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-amber-300 font-mono">{conversionRate}٪</span>
            <span className="text-[10px] text-teal-200">
              {totalConvertedValue > 0 ? `${(totalConvertedValue / 1000000).toFixed(1)} م ت` : 'موفق'}
            </span>
          </div>
        </div>
      </div>

      {/* TAB 1: LEADS LIST & REALTIME TRACKER */}
      {activeTab === 'leads_list' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                همه ({totalLeads})
              </button>
              <button
                onClick={() => setStatusFilter('pending_commercial')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
                  statusFilter === 'pending_commercial'
                    ? 'bg-amber-500 text-white font-black'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>در انتظار برآورد ({pendingCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter('estimated')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
                  statusFilter === 'estimated'
                    ? 'bg-emerald-600 text-white font-black'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>قیمت‌گذاری شده ({estimatedCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter('customer_approved')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
                  statusFilter === 'customer_approved'
                    ? 'bg-sky-600 text-white font-black'
                    : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>تایید مشتری ({approvedCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter('converted_to_order')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
                  statusFilter === 'converted_to_order'
                    ? 'bg-indigo-600 text-white font-black'
                    : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>در حال تولید ({convertedCount})</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full md:w-80">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="جستجو در کد MKT، مشتری، تلفن..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-teal-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={fetchLeads}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                title="بروزرسانی داده‌ها"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Leads Cards Grid */}
          {loading ? (
            <div className="p-16 bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
              <p className="text-sm font-bold">در حال بارگذاری استعلام‌های بازاریاب...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-16 bg-white rounded-3xl border border-slate-200 text-center space-y-3 text-slate-400">
              <Package className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="text-base font-bold text-slate-700">هیچ استعلامی با این مشخصات یافت نشد.</p>
              <button
                onClick={() => setActiveTab('new_lead')}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold"
              >
                ثبت استعلام جدید
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredLeads.map((lead) => {
                const isPending = lead.status === 'pending_commercial';
                const isEstimated = lead.status === 'estimated';
                const isApproved = lead.status === 'customer_approved';
                const isConverted = lead.status === 'converted_to_order';
                const isRejected = lead.status === 'customer_rejected';

                let statusBadge = (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>در انتظار برآورد واحد بازرگانی</span>
                  </span>
                );

                if (isEstimated) {
                  statusBadge = (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>قیمت‌گذاری شد (آماده مذاکره با مشتری)</span>
                    </span>
                  );
                } else if (isApproved) {
                  statusBadge = (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-900 border border-sky-300 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-sky-600" />
                      <span>تایید قیمت توسط مشتری</span>
                    </span>
                  );
                } else if (isConverted) {
                  statusBadge = (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-950 border border-indigo-300 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                      <span>در حال تولید در سالن کارخانه (پرونده #{lead.converted_archive_code || lead.project_archive_code})</span>
                    </span>
                  );
                } else if (isRejected) {
                  statusBadge = (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>عدم توافق / انصراف مشتری</span>
                    </span>
                  );
                }

                const followupsCount = lead.followup_logs?.length || 0;

                return (
                  <div
                    key={lead.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden"
                  >
                    {/* Top Row: Lead Code, Status Badge, and Fast Actions */}
                    <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-xl bg-teal-50 text-teal-800 font-mono font-black text-xs border border-teal-200">
                          {lead.lead_code}
                        </span>
                        <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{lead.created_at?.split(' ')[0] || lead.created_at?.split('T')[0] || '1405/01/15'}</span>
                        </span>
                        {lead.marketer_name && (
                          <span className="text-xs text-slate-500 font-bold hidden sm:inline">
                            بازاریاب: <strong>{lead.marketer_name}</strong>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {statusBadge}
                      </div>
                    </div>

                    {/* Middle Specs & Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Customer and Product */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400">مشتری و عنوان جعبه:</span>
                        <div className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                          <Building className="w-4 h-4 text-teal-600 shrink-0" />
                          <span>{lead.customer_name}</span>
                        </div>
                        <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lead.product_name}</span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5" dir="ltr">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lead.customer_phone}</span>
                        </div>
                      </div>

                      {/* Technical Specs & Dimensions */}
                      <div className="space-y-1 text-xs text-slate-700 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                        <div>
                          <span className="text-slate-400">تیراژ:</span>{' '}
                          <strong className="font-mono text-slate-900 text-sm">{Number(lead.quantity).toLocaleString('fa-IR')} عدد</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">مقوا:</span>{' '}
                          <strong>{lead.cardboard_type} ({lead.cardboard_grammage}g)</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">ساختار:</span>{' '}
                          <strong>{lead.material_construction}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">سلفون:</span>{' '}
                          <strong>{lead.cellophane_type}</strong>
                        </div>
                        {lead.box_length && (
                          <div className="text-slate-500 font-mono text-[11px]">
                            ابعاد: {lead.box_length} × {lead.box_width} × {lead.box_height} cm
                          </div>
                        )}
                      </div>

                      {/* Price Estimation & Factory Status */}
                      <div className="space-y-2 bg-gradient-to-br from-slate-50 to-emerald-50/40 p-3.5 rounded-2xl border border-emerald-100 flex flex-col justify-between">
                        {lead.estimated_unit_price > 0 ? (
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-emerald-800 block">برآورد قیمت واحد بازرگانی:</span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs text-slate-500">قیمت هر عدد:</span>
                              <strong className="text-base font-black text-emerald-700 font-mono">
                                {Number(lead.estimated_unit_price).toLocaleString('fa-IR')} تومان
                              </strong>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs text-slate-500">مبلغ کل برآورد:</span>
                              <strong className="text-xs font-black text-slate-800 font-mono">
                                {Number(lead.estimated_total_price || (lead.estimated_unit_price * lead.quantity)).toLocaleString('fa-IR')} تومان
                              </strong>
                            </div>
                            {lead.commercial_notes && (
                              <div className="text-[11px] text-indigo-700 font-medium bg-white/80 p-1.5 rounded-lg border border-indigo-100 mt-1">
                                <strong>توضیحات بازرگانی:</strong> {lead.commercial_notes}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 space-y-1 py-2">
                            <Clock className="w-5 h-5 text-amber-500" />
                            <span className="text-xs font-bold text-amber-800">در حال محاسبه قیمت توسط واحد برآورد</span>
                            <span className="text-[10px] text-slate-400">به محض تعیین قیمت در این قسمت نمایش داده خواهد شد</span>
                          </div>
                        )}

                        {/* Live Production Stage (if converted) */}
                        {isConverted && (
                          <div className="pt-2 border-t border-indigo-100 text-xs text-indigo-900 flex items-center justify-between">
                            <span>مرحله در سالن تولید:</span>
                            <strong className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold text-[11px]">
                              {STAGE_NAMES[lead.project_current_stage] || 'در صف تولید'}
                            </strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Timeline Stepper */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="grid grid-cols-5 gap-1 text-center text-[10px] sm:text-xs">
                        {/* Step 1: Registered */}
                        <div className="p-2 rounded-xl bg-teal-50 text-teal-900 font-bold border border-teal-200">
                          <div className="w-5 h-5 mx-auto rounded-full bg-teal-600 text-white flex items-center justify-center font-bold mb-1 text-[10px]">✓</div>
                          <span>۱. ثبت استعلام</span>
                        </div>

                        {/* Step 2: In Estimation */}
                        <div className={`p-2 rounded-xl font-bold border ${
                          lead.estimated_unit_price ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-amber-50 text-amber-900 border-amber-200 animate-pulse'
                        }`}>
                          <div className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center font-bold mb-1 text-[10px] ${
                            lead.estimated_unit_price ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                          }`}>
                            {lead.estimated_unit_price ? '✓' : '۲'}
                          </div>
                          <span>۲. برآورد قیمت</span>
                        </div>

                        {/* Step 3: Price Quoted */}
                        <div className={`p-2 rounded-xl font-bold border ${
                          lead.estimated_unit_price ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}>
                          <div className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center font-bold mb-1 text-[10px] ${
                            lead.estimated_unit_price ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
                          }`}>
                            {lead.estimated_unit_price ? '✓' : '۳'}
                          </div>
                          <span>۳. اعلام فی به مشتری</span>
                        </div>

                        {/* Step 4: Customer Feedback */}
                        <div className={`p-2 rounded-xl font-bold border ${
                          isApproved || isConverted ? 'bg-sky-50 text-sky-900 border-sky-200' : isRejected ? 'bg-rose-50 text-rose-900 border-rose-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}>
                          <div className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center font-bold mb-1 text-[10px] ${
                            isApproved || isConverted ? 'bg-sky-600 text-white' : isRejected ? 'bg-rose-600 text-white' : 'bg-slate-300 text-slate-600'
                          }`}>
                            {isApproved || isConverted ? '✓' : isRejected ? '✕' : '۴'}
                          </div>
                          <span>۴. بازخورد مشتری</span>
                        </div>

                        {/* Step 5: Factory Production */}
                        <div className={`p-2 rounded-xl font-bold border ${
                          isConverted ? 'bg-indigo-50 text-indigo-900 border-indigo-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}>
                          <div className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center font-bold mb-1 text-[10px] ${
                            isConverted ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-600'
                          }`}>
                            {isConverted ? '✓' : '۵'}
                          </div>
                          <span>۵. خط تولید کارخانه</span>
                        </div>
                      </div>
                    </div>

                    {/* Follow-up Logs Preview (if any) */}
                    {followupsCount > 0 && (
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-slate-700">
                          <span className="flex items-center gap-1 text-teal-800">
                            <History className="w-3.5 h-3.5" />
                            <span>آخرین یادداشت‌های پیگیری با مشتری ({followupsCount} مورد):</span>
                          </span>
                          <button
                            onClick={() => handleOpenFollowupModal(lead)}
                            className="text-teal-700 hover:underline text-[11px]"
                          >
                            + ثبت پیگیری جدید
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-100 flex items-center justify-between">
                          <span>{lead.followup_logs[0]?.note}</span>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0 mr-2">{lead.followup_logs[0]?.date_shamsi}</span>
                        </div>
                      </div>
                    )}

                    {/* Bottom Action Buttons Bar */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {/* Follow-up Log Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenFollowupModal(lead)}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 shadow-xs"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
                          <span>ثبت پیگیری و تماس</span>
                        </button>

                        {/* Print Proforma / Quote Sheet */}
                        {lead.estimated_unit_price > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedLeadForPrint(lead)}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 shadow-xs"
                          >
                            <Printer className="w-3.5 h-3.5 text-indigo-600" />
                            <span>چاپ پیش‌فاکتور استعلام</span>
                          </button>
                        )}
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Marketer: Confirm Customer Acceptance */}
                        {isEstimated && (
                          <button
                            type="button"
                            onClick={() => handleQuickStatusChange(lead.id, 'customer_approved')}
                            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>تایید قیمت توسط مشتری</span>
                          </button>
                        )}

                        {/* Marketer: Reject */}
                        {(isEstimated || isPending) && !isRejected && (
                          <button
                            type="button"
                            onClick={() => {
                              const reason = prompt('لطفاً دلیل عدم توافق یا انصراف مشتری را وارد نمایید:');
                              if (reason !== null) {
                                handleQuickStatusChange(lead.id, 'customer_rejected', reason);
                              }
                            }}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition border border-rose-200"
                          >
                            انصراف مشتری
                          </button>
                        )}

                        {/* Commercial / CEO: Estimate Price Button */}
                        {isCommercialOrCeo && (
                          <button
                            type="button"
                            onClick={() => handleOpenEstimateModal(lead)}
                            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>{isPending ? 'برآورد و اعلام قیمت' : 'ویرایش قیمت'}</span>
                          </button>
                        )}

                        {/* Commercial / CEO: Convert to Production Order */}
                        {isCommercialOrCeo && (isEstimated || isApproved) && !isConverted && (
                          <button
                            type="button"
                            onClick={() => handleConvertToProject(lead)}
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>ارسال به خط تولید کارخانه</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: NEW MARKETING LEAD SUBMISSION FORM */}
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
      {activeTab === 'new_lead' && (
        <form onSubmit={handleSubmitLead} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-teal-600" />
<<<<<<< HEAD
                فرم ثبت مشخصات استعلام توسط بازاریاب
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                اطلاعات مشتری و مشخصات فنی جعبه را وارد نمایید. پس از ثبت، مستقیماً برای مدیر بازرگانی ارسال می‌گردد.
              </p>
            </div>
            <span className="text-xs bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full font-bold">
              مرحله ۱: دریافت اطلاعات میدانی
=======
                فرم ثبت استعلام جدید توسط بازاریاب
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                اطلاعات مشتری و مشخصات فنی جعبه را وارد فرمایید تا مستقیماً به کارتابل مدیر بازرگانی و ماشین حساب برآورد ارسال گردد.
              </p>
            </div>
            <span className="text-xs bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full font-bold">
              ثبت استعلام میدانی
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
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
<<<<<<< HEAD
                مشاهده در کارتابل
=======
                مشاهده در کارتابل پیگیری
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
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
<<<<<<< HEAD
                  placeholder="مثال: شرکت داروسازی کیمیا / صنایع غذایی برتر"
=======
                  placeholder="مثال: صنایع دارویی سینا / میهن یدک"
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
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
<<<<<<< HEAD
                  placeholder="مثال: جعبه خمیردندان ذغالی ۱۰۰ میل"
=======
                  placeholder="مثال: جعبه شربت گیاهی ۱۲۰ میل"
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
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
<<<<<<< HEAD
                  تیراژ سفارش: <span className="text-rose-500">*</span>
=======
                  تیراژ سفارش (عدد): <span className="text-rose-500">*</span>
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
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
<<<<<<< HEAD
                نوع جنس ساختار (سینگل / ورق / مقوا):
=======
                نوع ساختار جنس (سینگل / ورق کارتن / مقوا):
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
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
<<<<<<< HEAD
                توضیحات و نیازمندی‌های مشتری (یووی، طلاکوب، نوع درب، شرایط تحویل):
=======
                توضیحات و نیازمندی‌های مشتری (یووی موضعی، طلاکوب، طلق پنجره، نوع تحویل):
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
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
<<<<<<< HEAD
              <span>ثبت و ارسال به مدیر بازرگانی جهت برآورد قیمت</span>
=======
              <span>ثبت استعلام و ارسال به مدیر بازرگانی جهت برآورد قیمت</span>
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
            </button>
          </div>
        </form>
      )}

<<<<<<< HEAD
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
=======
      {/* MODAL 1: FOLLOW-UP LOGGER (ثبت پیگیری و لاگ تماس) */}
      {selectedLeadForFollowup && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-teal-800 font-black text-sm">
                <PhoneCall className="w-5 h-5 text-teal-600" />
                <span>ثبت پیگیری و مذاکره با مشتری ({selectedLeadForFollowup.lead_code})</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLeadForFollowup(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">مشتری:</span>
                <strong className="text-slate-900">{selectedLeadForFollowup.customer_name} ({selectedLeadForFollowup.product_name})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">شماره تماس:</span>
                <strong className="text-slate-900 font-mono" dir="ltr">{selectedLeadForFollowup.customer_phone}</strong>
              </div>
              {selectedLeadForFollowup.estimated_unit_price > 0 && (
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>قیمت اعلامی واحد بازرگانی:</span>
                  <span className="font-mono">فی {Number(selectedLeadForFollowup.estimated_unit_price).toLocaleString('fa-IR')} ت</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmitFollowup} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">نوع اقدام / پیگیری:</label>
                <select
                  value={followupOutcome}
                  onChange={(e) => setFollowupOutcome(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="تماس تلفنی با کارفرما">تماس تلفنی با کارفرما</option>
                  <option value="جلسه حضوری و ارائه نمونه">جلسه حضوری و ارائه نمونه</option>
                  <option value="ارسال پیش‌فاکتور رسمی در پیام‌رسان">ارسال پیش‌فاکتور رسمی در پیام‌رسان</option>
                  <option value="مذاکره روی تخفیف تیراژ">مذاکره روی تخفیف تیراژ</option>
                  <option value="تایید قیمت و نهایی‌سازی پیش‌پرداخت">تایید قیمت و نهایی‌سازی پیش‌پرداخت</option>
                  <option value="انصراف موقت مشتری">انصراف موقت مشتری</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  شرح مذاکره و نتیجه تماس با مشتری: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="مثال: با مدیر خرید شرکت تماس گرفته شد، قیمت تایید شد و قرار شد فردا چک بیعانه ارسال گردد..."
                  value={followupNote}
                  onChange={(e) => setFollowupNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">تغییر وضعیت استعلام به:</label>
                <select
                  value={followupStatus}
                  onChange={(e) => setFollowupStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="estimated">قیمت اعلام شده (در حال مذاکره)</option>
                  <option value="customer_approved">تایید قطعی قیمت توسط مشتری</option>
                  <option value="customer_rejected">انصراف / عدم توافق قیمت</option>
                </select>
              </div>

              {/* Previous Follow-up History */}
              {selectedLeadForFollowup.followup_logs?.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 max-h-40 overflow-y-auto">
                  <span className="text-[11px] font-bold text-slate-500">تاریخچه پیگیری‌های قبلی:</span>
                  {selectedLeadForFollowup.followup_logs.map((log, i) => (
                    <div key={i} className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-0.5">
                      <div className="flex justify-between font-bold text-teal-900">
                        <span>{log.outcome}</span>
                        <span className="font-mono text-[10px] text-slate-400">{log.date_shamsi}</span>
                      </div>
                      <p className="text-slate-600">{log.note}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLeadForFollowup(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={followupLoading}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black text-xs shadow-md transition flex items-center gap-1.5"
                >
                  {followupLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>ذخیره در پرونده استعلام</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINTABLE OFFICIAL QUOTATION SHEET (پیش‌فاکتور استعلام) */}
      {selectedLeadForPrint && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 no-print">
              <span className="text-sm font-bold text-slate-700">پیش‌نمایش پیش‌فاکتور و برگه رسمی استعلام قیمت</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>چاپ / ذخیره PDF</span>
                </button>
                <button
                  onClick={() => setSelectedLeadForPrint(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  بستن
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div className="border-2 border-slate-800 p-6 rounded-2xl space-y-5 bg-white text-slate-900" dir="rtl">
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">شرکت صنایع بسته‌بندی آرمان امیران</h2>
                  <p className="text-xs text-slate-600">استودیو طراحی امیران | برگه رسمی اعلام قیمت و پیش‌فاکتور استعلام</p>
                </div>
                <div className="text-left font-mono text-xs space-y-0.5" dir="ltr">
                  <div><strong>INQUIRY:</strong> #{selectedLeadForPrint.lead_code}</div>
                  <div><strong>DATE:</strong> 1405/01/15</div>
                  <div><strong>REP:</strong> {selectedLeadForPrint.marketer_name || 'کارشناس بازاریابی'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div><span className="text-slate-500">نام مشتری / کارفرما:</span> <strong>{selectedLeadForPrint.customer_name}</strong></div>
                  <div><span className="text-slate-500">شماره تماس:</span> <strong className="font-mono">{selectedLeadForPrint.customer_phone}</strong></div>
                  <div><span className="text-slate-500">نام محصول / جعبه:</span> <strong>{selectedLeadForPrint.product_name}</strong></div>
                  <div><span className="text-slate-500">تیراژ درخواستی:</span> <strong className="font-mono text-teal-700">{Number(selectedLeadForPrint.quantity).toLocaleString('fa-IR')} عدد</strong></div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div><span className="text-slate-500">جنس و گراماژ:</span> <strong>{selectedLeadForPrint.cardboard_type} ({selectedLeadForPrint.cardboard_grammage}g)</strong></div>
                  <div><span className="text-slate-500">نوع ساختار:</span> <strong>{selectedLeadForPrint.material_construction}</strong></div>
                  <div><span className="text-slate-500">پوشش و سلفون:</span> <strong>{selectedLeadForPrint.cellophane_type}</strong></div>
                  {selectedLeadForPrint.box_length && (
                    <div><span className="text-slate-500">ابعاد جعبه:</span> <strong className="font-mono">{selectedLeadForPrint.box_length}×{selectedLeadForPrint.box_width}×{selectedLeadForPrint.box_height} cm</strong></div>
                  )}
                </div>
              </div>

              {/* Price Table */}
              <table className="w-full text-xs text-right border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <th className="p-2 border border-slate-300">شرح خدمات و کالا</th>
                    <th className="p-2 border border-slate-300 text-center">تیراژ</th>
                    <th className="p-2 border border-slate-300 text-center">قیمت واحد (تومان)</th>
                    <th className="p-2 border border-slate-300 text-center">مبلغ کل (تومان)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2.5 border border-slate-300 font-bold">
                      تولید {selectedLeadForPrint.product_name} با مشخصات فنی فوق
                    </td>
                    <td className="p-2.5 border border-slate-300 text-center font-mono font-bold">
                      {Number(selectedLeadForPrint.quantity).toLocaleString('fa-IR')}
                    </td>
                    <td className="p-2.5 border border-slate-300 text-center font-mono font-black text-emerald-700">
                      {Number(selectedLeadForPrint.estimated_unit_price).toLocaleString('fa-IR')}
                    </td>
                    <td className="p-2.5 border border-slate-300 text-center font-mono font-black text-slate-900">
                      {Number(selectedLeadForPrint.estimated_total_price || (selectedLeadForPrint.estimated_unit_price * selectedLeadForPrint.quantity)).toLocaleString('fa-IR')}
                    </td>
                  </tr>
                </tbody>
              </table>

              {selectedLeadForPrint.commercial_notes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-0.5">
                  <strong>شرایط و ملاحظات بازرگانی:</strong>
                  <p>{selectedLeadForPrint.commercial_notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-300 text-xs">
                <div className="p-3 border border-slate-300 rounded-xl text-center space-y-4">
                  <span className="font-bold text-slate-700">مهر و امضای کارشناس بازاریابی</span>
                  <div className="h-12 flex items-center justify-center text-slate-400 text-[10px]">
                    {selectedLeadForPrint.marketer_name || 'کارشناس بازاریابی'}
                  </div>
                </div>
                <div className="p-3 border border-slate-300 rounded-xl text-center space-y-4">
                  <span className="font-bold text-slate-700">مهر و امضای مدیریت بازرگانی کارخانه</span>
                  <div className="h-12 flex items-center justify-center text-slate-400 text-[10px]">
                    شرکت صنایع بسته‌بندی آرمان امیران
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: COMMERCIAL PRICE ESTIMATION (برآورد قیمت مدیر بازرگانی) */}
      {estimatingLead && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp" dir="rtl">
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-amber-600 font-black text-sm">
                <DollarSign className="w-5 h-5" />
                <span>برآورد قیمت توسط مدیر بازرگانی ({estimatingLead.lead_code})</span>
              </div>
              <button
                type="button"
                onClick={() => setEstimatingLead(null)}
<<<<<<< HEAD
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
=======
                className="text-slate-400 hover:text-slate-600 p-1"
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
              >
                <X className="w-5 h-5" />
              </button>
            </div>

<<<<<<< HEAD
            {/* Specs Summary */}
            <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1.5 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">مشتری / محصول:</span>
=======
            <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">مشتری و محصول:</span>
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
                <strong className="text-slate-800">{estimatingLead.customer_name} ({estimatingLead.product_name})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">تیراژ:</span>
<<<<<<< HEAD
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
=======
                <strong className="text-slate-800 font-mono">{Number(estimatingLead.quantity).toLocaleString('fa-IR')} عدد</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">متریال و ساختار:</span>
                <strong className="text-slate-800">{estimatingLead.cardboard_type} - {estimatingLead.material_construction}</strong>
              </div>
            </div>

>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
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
<<<<<<< HEAD
                <label className="font-bold text-slate-700 block mb-1">قیمت کل سفارش (تومان):</label>
=======
                <label className="font-bold text-slate-700 block mb-1">قیمت کل برآورد شده سفارش (تومان):</label>
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
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
<<<<<<< HEAD
                <label className="font-bold text-slate-700 block mb-1">توضیحات و شرایط بازرگانی:</label>
                <textarea
                  rows="2"
                  placeholder="شرایط پرداخت، تخفیف تیراژ، زمان تحویل..."
=======
                <label className="font-bold text-slate-700 block mb-1">توضیحات و شرایط بازرگانی جهت ابلاغ به بازاریاب:</label>
                <textarea
                  rows="2"
                  placeholder="شرایط پرداخت بیعانه، موعد تحویل، نحوه ارسال و تخفیف..."
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
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
<<<<<<< HEAD
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-xs shadow-md transition flex items-center gap-1.5"
              >
                {estimatingLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>ثبت برآورد و اعلام به بازاریاب</span>
=======
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black text-xs shadow-md transition flex items-center gap-1.5"
              >
                {estimatingLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>ثبت برآورد و اعلام به کارتابل بازاریاب</span>
>>>>>>> a9d1c26 (feat: implement dedicated marketer inquiry tracking, timeline steppers, follow-up logs, and printable quotation sheets)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
