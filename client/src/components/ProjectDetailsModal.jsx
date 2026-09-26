import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { STAGES, formatToman, formatNumber, formatDateFa, canAdvanceStage } from '../utils/helpers';
import CalculatorView from './CalculatorView';
import FilePreviewModal from './FilePreviewModal';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Upload,
  FileText,
  MessageSquare,
  History,
  Send,
  Building,
  UserCheck,
  Compass,
  Scissors,
  ShoppingCart,
  Factory,
  Layers,
  Sparkles,
  Printer,
  FileCheck,
  Plus,
  Eye,
  Check,
  ShieldCheck,
  Download,
  Calculator,
  Lock,
  CreditCard,
  Handshake,
  Trash2,
  ExternalLink,
  Paperclip
} from 'lucide-react';

export default function ProjectDetailsModal({ projectId, onClose, onUpdated, onPrintTicket }) {
  const { currentUser, role } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('workflow'); // 'workflow', 'notes', 'history', 'specs'
  const [newComment, setNewComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // File Preview Modal & Upload States
  const [previewFile, setPreviewFile] = useState(null);
  const [customDielineUrl, setCustomDielineUrl] = useState(null);
  const [customDielineName, setCustomDielineName] = useState(null);
  const [customMockupUrl, setCustomMockupUrl] = useState(null);
  const [uploadingDieline, setUploadingDieline] = useState(false);
  const [uploadingMockup, setUploadingMockup] = useState(false);

  // Management / Financial Permissions
  const isCeoOrAdmin = role === 'ceo' || currentUser?.permissions?.can_manage_users || currentUser?.permissions?.can_delete_projects;
  const canViewFinancials = role === 'ceo' || role === 'sales' || role === 'accounting' || role === 'estimation';

  const handleDeleteProject = async () => {
    if (!project) return;
    const confirmDelete = window.confirm(
      `هشدار مدیریتی:\nآیا از حذف کامل و دائمی پرونده «${project.title}» (کد آرشیو: ${project.archive_code || project.tracking_code}) اطمینان دارید؟\nتمامی لاگ‌ها، پیوست‌ها و مراحل این سفارش به صورت کامل حذف خواهند شد.`
    );
    if (!confirmDelete) return;

    setActionLoading(true);
    try {
      const res = await api.deleteProject(project.id);
      if (res.success) {
        alert(res.message || 'پرونده با موفقیت حذف گردید.');
        onClose();
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      alert('خطا در حذف پرونده: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Form states for stage 3
  const [depositAmount, setDepositAmount] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  const handleDielineUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDieline(true);
    try {
      const res = await api.uploadToStorage(file, 'dieline', 'project', project?.id);
      if (res?.file_url) {
        setCustomDielineUrl(res.file_url);
        setCustomDielineName(res.original_filename || file.name);
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setCustomDielineUrl(uploadEvent.target.result);
        setCustomDielineName(file.name);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingDieline(false);
    }
  };

  const handleMockupUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMockup(true);
    try {
      const res = await api.uploadToStorage(file, 'mockup', 'project', project?.id);
      if (res?.file_url) {
        setCustomMockupUrl(res.file_url);
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setCustomMockupUrl(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingMockup(false);
    }
  };

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await api.getProject(projectId);
      setProject(res.project);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  if (!projectId) return null;

  const isAuthorizedForStage = canAdvanceStage(role, project?.current_stage);

  const handleAdvance = async (stageData = {}, customComment = '') => {
    if (!project) return;
    if (!isAuthorizedForStage) {
      alert(`خطای دسترسی: اقدام در مرحله ${project.current_stage} مختص واحد مسئول آن مرحله است.`);
      return;
    }
    setActionLoading(true);
    try {
      await api.advanceStage(project.id, stageData, customComment);
      await fetchProjectDetails();
      if (onUpdated) onUpdated();
    } catch (err) {
      alert('خطا در ارجاع مرحله: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (targetStage = null) => {
    if (!rejectReason.trim()) {
      alert('لطفا علت بازگشت / اصلاحیه را وارد کنید.');
      return;
    }
    setActionLoading(true);
    try {
      await api.rejectStage(project.id, targetStage, rejectReason);
      setShowRejectForm(false);
      setRejectReason('');
      await fetchProjectDetails();
      if (onUpdated) onUpdated();
    } catch (err) {
      alert('خطا در بازگشت مرحله: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.addComment(project.id, newComment);
      setNewComment('');
      fetchProjectDetails();
    } catch (err) {
      alert('خطا در ارسال یادداشت: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-amber-300 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                  {project?.archive_code ? `کد آرشیو: ${project.archive_code}` : project?.tracking_code}
                </span>
                <h2 className="text-base font-black text-white line-clamp-1">
                  {project?.title || 'جزئیات سفارش'}
                </h2>
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                <span>مشتری: <strong className="text-slate-200 font-bold">{project?.customer_name}</strong></span>
                <span>•</span>
                <span>تیراژ: <strong className="text-amber-300 font-black">{formatNumber(project?.quantity)} عدد</strong></span>
                <span>•</span>
                <span>نوع مقوا: <strong className="text-slate-200">{project?.cardboard_type} ({project?.cardboard_grammage}g)</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {project && (
              <button
                onClick={() => onPrintTicket(project)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>چاپ برگه کارگاه</span>
              </button>
            )}

            {isCeoOrAdmin && project && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteProject}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/70 hover:bg-rose-700 text-rose-300 hover:text-white text-xs font-bold rounded-xl border border-rose-800/80 transition-colors"
                title="حذف دائمی این پرونده توسط مدیریت"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">حذف پرونده</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 10-Step Visual Progression Pipeline */}
        <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[850px] gap-1">
            {STAGES.slice(0, 10).map((st) => {
              const isPassed = (project?.current_stage || 1) > st.id;
              const isCurrent = (project?.current_stage || 1) === st.id;

              return (
                <div key={st.id} className="flex-1 flex flex-col items-center relative group">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      isCurrent
                        ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/30 scale-110 shadow-lg'
                        : isPassed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {isPassed ? <Check className="w-4 h-4" /> : st.id}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-bold truncate max-w-[80px] text-center ${
                      isCurrent ? 'text-amber-300 font-black' : isPassed ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {st.shortName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 px-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('workflow')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-black border-b-2 transition-all ${
                activeTab === 'workflow'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>عملیات مرحله جاری (گام {project?.current_stage})</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-black border-b-2 transition-all ${
                activeTab === 'notes'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>یادداشت‌های فنی ({project?.comments?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-black border-b-2 transition-all ${
                activeTab === 'history'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4 text-purple-600" />
              <span>لاگ اقدامات ({project?.logs?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('specs')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-black border-b-2 transition-all ${
                activeTab === 'specs'
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>ماتریس مشخصات فنی</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            نقش شما: <strong className="text-slate-800 font-bold">{currentUser?.department}</strong>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-20 text-center text-slate-400">در حال بارگذاری اطلاعات پروژه...</div>
          ) : !project ? (
            <div className="py-20 text-center text-rose-500">پروژه یافت نشد.</div>
          ) : (
            <>
              {/* TAB 1: WORKFLOW ACTION */}
              {activeTab === 'workflow' && (
                <div className="space-y-6">
                  
                  {/* Current Stage Status Banner */}
                  <div className="bg-indigo-50/70 border-2 border-indigo-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-200">
                        {project.current_stage}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-indigo-600">مرحله جاری گردش کار:</span>
                        <h3 className="text-sm font-extrabold text-slate-900">
                          {STAGES.find((s) => s.id === project.current_stage)?.title || 'تکمیل شده'}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowRejectForm(!showRejectForm)}
                        className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>درخواست اصلاحیه / بازگشت به مرحله قبل</span>
                      </button>
                    </div>
                  </div>

                  {/* Stage Permission Notice */}
                  {!isAuthorizedForStage && project.current_stage < 11 && (
                    <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl flex items-center gap-2.5 text-xs text-amber-950 font-bold">
                      <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>اقدام در مرحله {project.current_stage} مختص واحد «{STAGES.find((s) => s.id === project.current_stage)?.roleName}» است.</span>
                    </div>
                  )}

                  {/* Reject Box Form */}
                  {showRejectForm && (
                    <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl space-y-3 animate-in fade-in duration-150">
                      <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>بازگرداندن سفارش جهت بازبینی و اصلاحات فنی</span>
                      </h4>
                      <textarea
                        rows="2"
                        placeholder="علت بازگشت و اصلاحات مورد نیاز را بنویسید..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full p-2.5 text-xs rounded-xl border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setShowRejectForm(false)}
                          className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg"
                        >
                          انصراف
                        </button>
                        <button
                          onClick={() => handleReject()}
                          disabled={actionLoading}
                          className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
                        >
                          {actionLoading ? 'در حال ثبت...' : 'ثبت و بازگشت به گام قبل'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ================= STAGE SPECIFIC ACTION PANELS ================= */}

                  {/* STAGE 1: بازرگانی و فروش */}
                  {project.current_stage === 1 && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                          <Building className="w-4 h-4 text-blue-600" />
                          <span>اقدامات واحد بازرگانی و فروش</span>
                        </h4>
                        <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                          در انتظار ارسال به استعلام قیمت
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        مشخصات اولیه سفارش ثبت شده است. کارشناس بازرگانی می‌تواند پس از بررسی نهایی اطلاعات جعبه، آن را جهت برآورد قیمت دقیق مقوا و چاپ به واحد برآورد ارجاع دهد.
                      </p>
                      <button
                        onClick={() => handleAdvance({}, 'مشخصات اولیه تایید و جهت استعلام قیمت به واحد مربوطه ارجاع شد.')}
                        disabled={actionLoading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <ArrowRight className="w-4 h-4 rotate-180" />
                        <span>تایید مشخصات و ارجاع به واحد استعلام قیمت (مرحله ۲)</span>
                      </button>
                    </div>
                  )}

                  {/* STAGE 2: استعلام و برآورد قیمت روز */}
                  {project.current_stage === 2 && (
                    <div className="space-y-4">
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                        <h4 className="text-xs font-bold text-amber-900 flex items-center gap-2 mb-1">
                          <Calculator className="w-4 h-4 text-amber-700" />
                          <span>واحد استعلام و برآورد قیمت روز متریال</span>
                        </h4>
                        <p className="text-xs text-amber-800">
                          لطفا با استفاده از ماشین‌حساب صنعتی زیر بر اساس قیمت روز مقوا، سینگل فلوت، زینک و چاپ، بهای تمام شده را محاسبه نمایید. پس از تأیید، سفارش جهت تایید قیمت به مرحله <strong>۳. تایید مشتری</strong> منتقل خواهد شد.
                        </p>
                      </div>

                      <CalculatorView
                        initialSpecs={{
                          quantity: project.quantity,
                          boxType: project.box_type,
                          cardboard_grammage: project.cardboard_grammage,
                          cardboard_type: project.cardboard_type
                        }}
                        onApplyToProject={(calcData) => {
                          handleAdvance(calcData, `برآورد قیمت روز انجام شد. مبلغ کل: ${formatToman(calcData.finalPrice)} (واحد: ${formatToman(calcData.unitPrice)}). ارسال به مشتری جهت تأیید پیش‌فاکتور.`);
                        }}
                      />
                    </div>
                  )}

                  {/* STAGE 3: NEW STAGE -> تایید مشتری (پیش‌فاکتور و مالی) */}
                  {project.current_stage === 3 && (
                    <div className="bg-white p-6 rounded-3xl border-2 border-emerald-300 shadow-md space-y-5">
                      <div className="flex items-center justify-between border-b border-emerald-100 pb-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                            <Handshake className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900">
                              مرحله ۳: تایید قیمت و پیش‌فاکتور توسط مشتری
                            </h4>
                            <span className="text-xs text-emerald-700 font-bold">
                              ارائه قیمت به کارفرما، دریافت تاییدیه مالی و پیش‌پرداخت
                            </span>
                          </div>
                        </div>

                        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                          در انتظار تایید مشتری
                        </span>
                      </div>

                      {/* Quotation Summary Card */}
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                        <div>
                          <span className="text-[11px] text-slate-500 font-bold">مبلغ کل پیش‌فاکتور:</span>
                          <div className="text-base font-black text-emerald-800 mt-0.5">
                            {formatToman(project.estimated_total_price)}
                          </div>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 font-bold">قیمت واحد هر عدد جعبه:</span>
                          <div className="text-base font-black text-indigo-800 mt-0.5">
                            {formatToman(project.estimated_unit_price)}
                          </div>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 font-bold">تیراژ سفارش:</span>
                          <div className="text-base font-black text-slate-800 mt-0.5">
                            {formatNumber(project.quantity)} عدد
                          </div>
                        </div>
                      </div>

                      {/* Customer Confirmation Form */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            مبلغ بیعانه / پیش‌پرداخت دریافتی (تومان):
                          </label>
                          <input
                            type="text"
                            placeholder="مثال: ۱۵,۰۰۰,۰۰۰"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            نحوه پرداخت و شماره پیگیری / چک:
                          </label>
                          <input
                            type="text"
                            placeholder="مثال: چک صیادی ۴۵ روزه یا حواله پایا"
                            value={paymentRef}
                            onChange={(e) => setPaymentRef(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          یادداشت‌ها و هماهنگی با مشتری:
                        </label>
                        <textarea
                          rows="2"
                          placeholder="تاییدیه تلفنی یا کتبی کارفرما دریافت شد و زمان تحویل ۲۰ روز کاری هماهنگ گردید..."
                          value={customerNotes}
                          onChange={(e) => setCustomerNotes(e.target.value)}
                          className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                        />
                      </div>

                      <button
                        onClick={() =>
                          handleAdvance(
                            {
                              customerApproved: true,
                              depositAmount,
                              paymentRef,
                              customerNotes,
                              approvedDate: new Date().toISOString()
                            },
                            `پیش‌فاکتور و مبلغ ${formatToman(project.estimated_total_price)} توسط مشتری تایید شد. (بیعانه: ${depositAmount || 'طبق توافق'}) - ارسال به مرحله ۴ جهت تایید نهایی مدیرعامل.`
                          )
                        }
                        disabled={actionLoading}
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-xs sm:text-sm shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                        <span>ثبت تاییدیه قطعی مشتری و ارجاع به مدیر عامل (مرحله ۴)</span>
                      </button>
                    </div>
                  )}

                  {/* STAGE 4: تایید مدیر عامل */}
                  {project.current_stage === 4 && (
                    <div className="bg-white p-5 rounded-2xl border border-purple-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                        <h4 className="text-xs font-bold text-purple-900 flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-purple-600" />
                          <span>میز کار مدیریت عامل - بررسی سود و صدور دستور تولید</span>
                        </h4>
                        <span className="text-xs text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                          نیازمند تایید مدیرعامل
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                          <span className="text-[11px] text-slate-500">بهای تمام شده خام:</span>
                          <div className="text-base font-black text-slate-800 mt-1">
                            {formatToman(project.cost_price || 0)}
                          </div>
                        </div>
                        <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-center">
                          <span className="text-[11px] text-emerald-700">قیمت تایید شده مشتری:</span>
                          <div className="text-base font-black text-emerald-900 mt-1">
                            {formatToman(project.estimated_total_price || 0)}
                          </div>
                        </div>
                        <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-200 text-center">
                          <span className="text-[11px] text-purple-700">حاشیه سود کارخانه:</span>
                          <div className="text-base font-black text-purple-900 mt-1">
                            %{project.profit_margin || 20}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          handleAdvance(
                            {
                              approved: true,
                              ceoName: currentUser?.fullName || 'مدیرعامل',
                              date: new Date().toISOString()
                            },
                            'پیش‌فاکتور و حاشیه سود توسط مدیرعامل تایید گردید و جهت طراحی خط تیغ ارجاع شد.'
                          )
                        }
                        disabled={actionLoading}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <ShieldCheck className="w-5 h-5" />
                        <span>تایید رسمی مدیرعامل و ارجاع به واحد طراحی (مرحله ۵)</span>
                      </button>
                    </div>
                  )}

                  {/* STAGE 5: واحد طراحی و آتلیه */}
                  {project.current_stage === 5 && (
                    <div className="bg-white p-5 rounded-2xl border-2 border-indigo-200 shadow-sm space-y-5">
                      <div className="flex items-center justify-between border-b border-indigo-100 pb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Compass className="w-5 h-5 text-indigo-600" />
                          <div>
                            <h4 className="text-xs sm:text-sm font-black text-indigo-950">
                              واحد طراحی و پیش‌از‌چاپ - مدیریت خط تیغ، وکتور و رندر ۳بعدی
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              بررسی، پیش‌نمایش درجا، بارگذاری و دانلود فایل‌های استاندارد خط تیغ و موکاپ
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-indigo-700 font-bold bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
                          مرحله جاری: ۵. طراحی و تیغ
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 1. کارت خط تیغ Dieline */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                              <Compass className="w-4 h-4 text-indigo-600" />
                              <span>فایل خط تیغ (Dieline / CAD / Vector)</span>
                            </span>
                            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                              PDF • AI • EPS • DXF
                            </span>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <Paperclip className="w-4 h-4 text-indigo-500 shrink-0" />
                              <span className="font-mono text-xs font-bold text-slate-800 truncate">
                                {customDielineName || project.dieline_filename || `dieline-${project.archive_code || project.tracking_code}.pdf`}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  const url = customDielineUrl || project.dieline_file_url || `/dieline-single-80x15x165mm.svg`;
                                  const name = customDielineName || project.dieline_filename || `dieline-${project.archive_code || project.tracking_code}.pdf`;
                                  setPreviewFile({ file_url: url, original_filename: name });
                                }}
                                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-indigo-200"
                                title="پیش‌نمایش آنلاین فایل خط تیغ"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>مشاهده</span>
                              </button>

                              <a
                                href={customDielineUrl || project.dieline_file_url || `/dieline-single-80x15x165mm.svg`}
                                download={customDielineName || project.dieline_filename || `dieline-${project.archive_code || project.tracking_code}.pdf`}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-slate-200"
                                title="دانلود فایل خط تیغ"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>دانلود</span>
                              </a>
                            </div>
                          </div>

                          {/* Dieline Actions: Upload */}
                          <div className="flex items-center gap-2 pt-1">
                            <label className="flex-1 py-2 px-3 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold text-center cursor-pointer transition flex items-center justify-center gap-1.5 shadow-2xs">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{uploadingDieline ? 'در حال بارگذاری...' : 'آپلود خط تیغ جدید'}</span>
                              <input
                                type="file"
                                accept=".pdf,.ai,.eps,.cdr,.dxf,.svg,image/*"
                                onChange={handleDielineUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        {/* 2. کارت موکاپ و رندر ۳بعدی */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-amber-500" />
                              <span>موکاپ و رندر ۳بعدی جعبه (3D Mockup)</span>
                            </span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                              رندر گرافیکی
                            </span>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                                <Sparkles className="w-4 h-4" />
                              </div>
                              <span className="font-mono text-xs font-bold text-slate-800 truncate">
                                {customMockupUrl ? 'رندر ۳بعدی اختصاصی' : (project.design_data?.mockupName || `mockup-3d-${project.archive_code || project.tracking_code}.png`)}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  const url = customMockupUrl || project.design_data?.preview3d || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800';
                                  setPreviewFile({ file_url: url, original_filename: `mockup-3d-${project.archive_code || project.tracking_code}.png` });
                                }}
                                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-amber-200"
                                title="مشاهده آنلاین رندر ۳بعدی"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>مشاهده</span>
                              </button>

                              <a
                                href={customMockupUrl || project.design_data?.preview3d || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800'}
                                download={`mockup-${project.archive_code || project.tracking_code}.png`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-slate-200"
                                title="دانلود موکاپ"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>دانلود</span>
                              </a>
                            </div>
                          </div>

                          {/* Mockup Upload */}
                          <div className="flex items-center gap-2 pt-1">
                            <label className="flex-1 py-2 px-3 bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold text-center cursor-pointer transition flex items-center justify-center gap-1.5 shadow-2xs">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{uploadingMockup ? 'در حال بارگذاری...' : 'آپلود رندر / موکاپ جدید'}</span>
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleMockupUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          handleAdvance(
                            {
                              dielineFile: customDielineName || project.dieline_filename || `dieline-${project.archive_code || project.tracking_code}.pdf`,
                              dielineUrl: customDielineUrl || project.dieline_file_url,
                              mockupUrl: customMockupUrl || project.design_data?.preview3d,
                              designerName: currentUser?.fullName || 'واحد طراحی',
                              date: new Date().toISOString()
                            },
                            'فایل‌های نهایی خط تیغ و رندر ۳بعدی آماده شد و جهت تاییدیه طرح به مرحله ۶ ارجاع گردید.'
                          )
                        }
                        disabled={actionLoading}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>تایید نهایی فایل‌های طراحی و ارسال به مرحله ۶ (تایید طرح توسط مشتری)</span>
                      </button>
                    </div>
                  )}

                  {/* STAGE 6: تایید طرح توسط مشتری */}
                  {project.current_stage === 6 && (
                    <div className="bg-white p-5 rounded-2xl border border-teal-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-teal-100 pb-3">
                        <h4 className="text-xs font-bold text-teal-900 flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-teal-600" />
                          <span>مرحله ۶: تایید طرح گرافیکی و متون جعبه توسط مشتری</span>
                        </h4>
                        <span className="text-xs text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded">
                          نیازمند تایید کارفرما
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          handleAdvance(
                            {
                              customerDesignApproved: true,
                              approvedDate: new Date().toISOString()
                            },
                            'طرح گرافیکی، متون و رنگ‌بندی جعبه توسط مشتری تایید شد و جهت ساخت ماکت ارجاع گردید.'
                          )
                        }
                        disabled={actionLoading}
                        className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>تایید طرح توسط مشتری و ارجاع به ماکت‌سازی (مرحله ۷)</span>
                      </button>
                    </div>
                  )}

                  {/* STAGE 7: ساخت ماکت فیزیکی */}
                  {project.current_stage === 7 && (
                    <div className="bg-white p-5 rounded-2xl border border-orange-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-orange-100 pb-3">
                        <h4 className="text-xs font-bold text-orange-900 flex items-center gap-2">
                          <Scissors className="w-4 h-4 text-orange-600" />
                          <span>واحد ماکت‌سازی و کاترپلاتر - ساخت نمونه فیزیکی جعبه</span>
                        </h4>
                        <span className="text-xs text-orange-700 font-bold bg-orange-50 px-2 py-0.5 rounded">
                          در حال برش ماکت
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          handleAdvance(
                            {
                              mockupReady: true,
                              completedDate: new Date().toISOString()
                            },
                            'ماکت فیزیکی با کاترپلاتر برش خورد و جهت تایید ابعاد و ایستایی برای مشتری ارسال شد.'
                          )
                        }
                        disabled={actionLoading}
                        className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs shadow-md shadow-orange-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>ماکت فیزیکی آماده شد - ارسال جهت تایید ماکت مشتری (مرحله ۸)</span>
                      </button>
                    </div>
                  )}

                  {/* STAGE 8: تایید ماکت توسط مشتری */}
                  {project.current_stage === 8 && (
                    <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                        <h4 className="text-xs font-bold text-rose-900 flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-rose-600" />
                          <span>مرحله ۸: تایید فیزیکی و تست ماکت توسط مشتری</span>
                        </h4>
                        <span className="text-xs text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">
                          تست ابعاد و ایستایی جعبه
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          handleAdvance(
                            {
                              customerMockupApproved: true,
                              date: new Date().toISOString()
                            },
                            'ماکت فیزیکی، استحکام و نحوه باز و بست توسط مشتری تایید شد و دستور خرید متریال صادر گردید.'
                          )
                        }
                        disabled={actionLoading}
                        className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>تایید ماکت توسط مشتری و ارجاع به واحد خرید متریال (مرحله ۹)</span>
                      </button>
                    </div>
                  )}

                  {/* STAGE 9: خرید متریال و ورود انبار */}
                  {project.current_stage === 9 && (
                    <div className="bg-white p-5 rounded-2xl border border-cyan-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-cyan-100 pb-3">
                        <h4 className="text-xs font-bold text-cyan-900 flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4 text-cyan-600" />
                          <span>واحد خرید و تدارکات - تامین مقوا، ورق، زینک و ملزومات</span>
                        </h4>
                        <span className="text-xs text-cyan-700 font-bold bg-cyan-50 px-2 py-0.5 rounded">
                          تامین اقلام پیش از تولید
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          handleAdvance(
                            {
                              materialsReceived: true,
                              receiptDate: new Date().toISOString()
                            },
                            'کلیه اقلام مقوا، ورق فلوتینگ و زینک خریداری و تحویل سالن تولید شد.'
                          )
                        }
                        disabled={actionLoading}
                        className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-xs shadow-md shadow-cyan-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <Factory className="w-5 h-5" />
                        <span>تکمیل خرید متریال و ارجاع نهایی به سالن چاپ و تولید (مرحله ۱۰)</span>
                      </button>
                    </div>
                  )}

                  {/* STAGE 10: سالن چاپ و تولید */}
                  {project.current_stage === 10 && (
                    <div className="bg-white p-5 rounded-2xl border border-amber-300 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                        <h4 className="text-xs font-bold text-amber-950 flex items-center gap-2">
                          <Factory className="w-4 h-4 text-amber-700" />
                          <span>سالن چاپ و خط تولید کارخانه - اجرای کامل فرآیند ساخت</span>
                        </h4>
                        <span className="text-xs text-amber-900 font-black bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                          در حال تولید و جعبه‌چسبانی
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          handleAdvance(
                            {
                              status: 'completed',
                              completedDate: new Date().toISOString(),
                              qcPassed: true
                            },
                            'تولید کلیه تیراژ، کنترل کیفی و بسته‌بندی با موفقیت انجام شد و سفارش آماده تحویل به مشتری است.'
                          )
                        }
                        disabled={actionLoading}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>اتمام کامل تولید و ثبت تحویل نهایی سفارش (مرحله ۱۱)</span>
                      </button>
                    </div>
                  )}

                  {/* STAGE 11: COMPLETED */}
                  {project.current_stage === 11 && (
                    <div className="bg-emerald-50 border-2 border-emerald-300 p-8 rounded-3xl text-center space-y-3">
                      <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <h4 className="text-base font-black text-emerald-950">
                        سفارش با موفقیت تولید و تحویل مشتری گردید!
                      </h4>
                      <p className="text-xs text-emerald-800 max-w-md mx-auto">
                        تمام ۱۰ مرحله فرآیند جعبه‌سازی از بازرگانی، استعلام قیمت، تایید مشتری، تایید مدیرعامل، طراحی، ساخت ماکت، خرید متریال تا تولید و کنترل کیفیت با موفقیت به اتمام رسید.
                      </p>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: INTERNAL TEAM NOTES */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 max-h-80 overflow-y-auto space-y-3">
                    {project.comments?.length === 0 ? (
                      <div className="text-center text-slate-400 text-xs py-8">
                        هنوز یادداشتی برای این پروژه ثبت نشده است.
                      </div>
                    ) : (
                      project.comments?.map((c) => (
                        <div key={c.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <strong className="text-indigo-700 font-bold">{c.user_name}</strong>
                            <span className="text-slate-400 font-mono">{formatDateFa(c.created_at)}</span>
                          </div>
                          <p className="text-xs text-slate-800 whitespace-pre-wrap">{c.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="پیام یا یادداشت فنی جدید بنویسید..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-4 h-4 rotate-180" />
                      <span>ارسال</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: AUDIT TRAIL / LOGS */}
              {activeTab === 'history' && (
                <div className="space-y-3">
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-xs text-right">
                      <thead className="bg-slate-900 text-white font-bold">
                        <tr>
                          <th className="p-3">مرحله</th>
                          <th className="p-3">اقدام صورت‌گرفته</th>
                          <th className="p-3">کاربر / نقش</th>
                          <th className="p-3">توضیحات</th>
                          <th className="p-3">تاریخ و زمان</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {project.logs?.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50">
                            <td className="p-3 font-black text-indigo-700">{log.stage_name}</td>
                            <td className="p-3 text-slate-800 font-bold">{log.action}</td>
                            <td className="p-3 text-slate-600">{log.user_name}</td>
                            <td className="p-3 text-slate-500">{log.comment}</td>
                            <td className="p-3 text-slate-400 font-mono">{formatDateFa(log.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: SPECS MATRIX */}
              {activeTab === 'specs' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Right Column: Physical & Structural Specs */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <h4 className="font-bold text-slate-900 border-b pb-2">مشخصات فیزیکی و ساختار جعبه</h4>
                    <div className="flex justify-between py-1"><span>نوع جعبه:</span><strong className="text-slate-800">{project.box_type || 'مقوا تک‌لا'}</strong></div>
                    <div className="flex justify-between py-1"><span>ساختار درب و قفل:</span><strong className="text-slate-800">{project.box_structure || 'درب دارویی ساده (Tuck End)'}</strong></div>
                    <div className="flex justify-between py-1"><span>ابعاد داخلی (L×W×H):</span><strong className="font-mono text-slate-900 font-bold">{project.box_length || project.length_mm || '-'} × {project.box_width || project.width_mm || '-'} × {project.box_height || project.height_mm || '-'} mm</strong></div>
                    <div className="flex justify-between py-1"><span>نوع مقوا:</span><strong className="text-slate-800">{project.cardboard_type || 'ایندربرد'} ({project.cardboard_grammage || 300} گرم)</strong></div>
                    <div className="flex justify-between py-1"><span>تیراژ:</span><strong className="font-black text-indigo-700">{formatNumber(project.quantity)} عدد</strong></div>
                    <div className="flex justify-between py-1"><span>ماشین چاپ:</span><strong className="text-slate-800">{project.print_type ? `${project.print_type} (${project.print_colors_count || 4} رنگ)` : 'افست ۴ رنگ CMYK'}</strong></div>
                    <div className="flex justify-between py-1"><span>سلفون:</span><strong className="text-slate-800">{project.has_cellophane ? (project.cellophane_type || 'سلفون مات') : 'ندارد'}</strong></div>
                    <div className="flex justify-between py-1"><span>طلاکوب:</span><strong className="text-slate-800">{project.has_foil ? (project.foil_type || 'طلاکوب حرارتی') : 'ندارد'}</strong></div>
                    <div className="flex justify-between py-1"><span>تیغ / قالب:</span><strong className="text-slate-800">{project.has_blade ? (project.blade_type || 'دایکات لترپرس') : 'ندارد'}</strong></div>
                    <div className="flex justify-between py-1"><span>جعبه‌چسبانی:</span><strong className="text-slate-800">{project.has_glue ? (project.glue_type || 'اتوماتیک') : 'ندارد'}</strong></div>
                  </div>

                  {/* Left Column: If Financial Role (CEO / Sales / Accounting) -> Proforma Pricing. Else (Design, Production, Mockup, Warehouse) -> Prepress & Dieline Files */}
                  {canViewFinancials ? (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                      <h4 className="font-bold text-slate-900 border-b pb-2">اطلاعات مالی و پیش‌فاکتور (مختص بازرگانی و مدیرعامل)</h4>
                      <div className="flex justify-between py-1"><span>قیمت هر عدد جعبه:</span><strong className="text-indigo-700 font-black">{formatToman(project.estimated_unit_price)}</strong></div>
                      <div className="flex justify-between py-1"><span>مبلغ کل پیش‌فاکتور:</span><strong className="text-emerald-700 font-black text-sm">{formatToman(project.estimated_total_price)}</strong></div>
                      <div className="flex justify-between py-1"><span>بهای تمام شده خام:</span><strong className="text-slate-700 font-bold">{formatToman(project.cost_price)}</strong></div>
                      <div className="flex justify-between py-1"><span>حاشیه سود کارخانه:</span><strong className="text-purple-800 font-bold">%{project.profit_margin || 15}</strong></div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
                      <div className="border-b pb-2 flex items-center justify-between">
                        <h4 className="font-bold text-slate-900">مشخصات فنی فرم‌بندی و فایل‌های طراحی</h4>
                        <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold">واحد پیش‌ازچاپ و طراحی</span>
                      </div>
                      
                      <div className="space-y-1.5 text-slate-700">
                        <div className="flex justify-between py-0.5"><span>ابعاد شیت چاپی:</span><strong className="font-mono">{project.print_length || 500} × {project.print_width || 700} mm</strong></div>
                        <div className="flex justify-between py-0.5"><span>تعداد در هر فرم (لت):</span><strong className="font-mono">{project.boxes_per_sheet || 2} عدد در شیت</strong></div>
                        <div className="flex justify-between py-0.5"><span>وضعیت زینک:</span><strong>{project.zinc_status || 'زینک جدید'}</strong></div>
                        <div className="flex justify-between py-0.5"><span>فرم چاپی:</span><strong>{project.print_format || 'دوربرقی'}</strong></div>
                        <div className="flex justify-between py-0.5"><span>درصد باطله چاپ:</span><strong className="font-mono">%{project.print_waste || 5}</strong></div>
                      </div>

                      {/* Dieline & Mockup Direct Action Box for Designers */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 mt-2">
                        <div className="text-[11px] font-bold text-slate-800">فایل‌های پیوست نقشه و موکاپ:</div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              const url = customDielineUrl || project.dieline_file_url || `/dieline-single-80x15x165mm.svg`;
                              const name = customDielineName || project.dieline_filename || `dieline-${project.archive_code || project.tracking_code}.pdf`;
                              setPreviewFile({ file_url: url, original_filename: name });
                            }}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold transition flex items-center gap-1 border border-indigo-200"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>پیش‌نمایش خط تیغ</span>
                          </button>

                          <a
                            href={customDielineUrl || project.dieline_file_url || `/dieline-single-80x15x165mm.svg`}
                            download={customDielineName || project.dieline_filename || `dieline-${project.archive_code || project.tracking_code}.pdf`}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition flex items-center gap-1 border border-slate-200"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>دانلود خط تیغ</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              const url = customMockupUrl || project.design_data?.preview3d || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800';
                              setPreviewFile({ file_url: url, original_filename: `mockup-${project.archive_code || project.tracking_code}.png` });
                            }}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold transition flex items-center gap-1 border border-amber-200"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>مشاهده موکاپ ۳بعدی</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* File Preview Modal for Dieline & Artwork */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}
