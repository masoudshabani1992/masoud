import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { matchProduct, formatNumber } from '../utils/helpers';
import {
  Save,
  Printer,
  FileText,
  Calculator,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Plus,
  History,
  Boxes,
  ArrowRight,
  Layers,
  Sparkles,
  Scissors,
  Bookmark,
  Check,
  Building2,
  Phone,
  Calendar,
  Hash,
  ChevronLeft,
  Search,
  X
} from 'lucide-react';

export default function IndustrialOrderForm({ onOrderSaved, onCancel, initialData }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    order_code: initialData?.order_code || String(Math.floor(1000 + Math.random() * 9000)),
    archive_code: initialData?.archive_code || String(Math.floor(1000 + Math.random() * 9000)),
    customer_code: initialData?.customer_code || String(Math.floor(1000 + Math.random() * 9000)),
    customer_name: initialData?.customer_name || '',
    customer_phone: initialData?.customer_phone || '',
    quantity: initialData?.quantity || 5000,
    order_date: initialData?.order_date || '1405/06/25',
    file_date: initialData?.file_date || '1405/06/25',
    is_first_print: initialData?.is_first_print ?? true,
    photography: initialData?.photography || 'طراحی توسط امیران',
    old_archive_code: initialData?.old_archive_code || '',

    // Cardboard (مقوا)
    has_cardboard: initialData?.has_cardboard ?? true,
    cardboard_type: initialData?.cardboard_type || 'مقوای ایندربرد (FBB)',
    cardboard_length: initialData?.cardboard_length || 1000,
    cardboard_width: initialData?.cardboard_width || 600,
    cardboard_grammage: initialData?.cardboard_grammage || 350,
    cardboard_unit_price: initialData?.cardboard_unit_price || 2020000,

    // Print (چاپ)
    has_print: initialData?.has_print ?? true,
    zinc_status: initialData?.zinc_status || 'زینک جدید',
    custom_color: initialData?.custom_color ?? false,
    print_colors_count: initialData?.print_colors_count || 4,
    print_type: initialData?.print_type || 'افست',
    print_format: initialData?.print_format || 'دوربرقی',
    print_length: initialData?.print_length || 500,
    print_width: initialData?.print_width || 600,
    print_waste: initialData?.print_waste || 5,
    boxes_per_sheet: initialData?.boxes_per_sheet || 2,
    print_sheets_count: initialData?.print_sheets_count || 300,

    // Varnish (ورنی)
    has_varnish: initialData?.has_varnish ?? true,

    // Cellophane (سلفون)
    has_cellophane: initialData?.has_cellophane ?? true,
    cellophane_type: initialData?.cellophane_type || 'سلفون حرارتی مات',

    // UV (یووی)
    has_uv: initialData?.has_uv ?? false,
    uv_shablon_status: initialData?.uv_shablon_status || 'شابلون موجود',
    uv_type: initialData?.uv_type || 'موضعی',

    // Foil (فویل / طلاکوب)
    has_foil: initialData?.has_foil ?? true,
    foil_type: initialData?.foil_type || 'طلاکوب',
    foil_length: initialData?.foil_length || 200,
    foil_width: initialData?.foil_width || 150,

    // Emboss (برجسته)
    has_emboss: initialData?.has_emboss ?? true,
    emboss_cliche_status: initialData?.emboss_cliche_status || 'کلیشه جدید',
    emboss_type: initialData?.emboss_type || 'مقوایی',

    // Die / Blade (تیغ)
    has_blade: initialData?.has_blade ?? true,
    blade_status: initialData?.blade_status || 'جدید',
    blade_type: initialData?.blade_type || 'دایکات بوبست',

    // Window (طلق)
    has_window: initialData?.has_window ?? false,
    window_length: initialData?.window_length || 0,
    window_width: initialData?.window_width || 0,
    window_thickness: initialData?.window_thickness || 0,

    // Glue (چسب)
    has_glue: initialData?.has_glue ?? true,
    glue_type: initialData?.glue_type || 'لمینتی',
    glue_price: initialData?.glue_price || 110,

    // Staple (منگنه)
    has_staple: initialData?.has_staple ?? false,
    staple_count: initialData?.staple_count || 0,

    // Sheet / Single (سینگل / ورق)
    has_sheet: initialData?.has_sheet ?? true,
    sheet_category: initialData?.sheet_category || 'سینگل E فلوت',
    sheet_length: initialData?.sheet_length || 0,
    sheet_width: initialData?.sheet_width || 0,
    sheet_price: initialData?.sheet_price || 0,
    sheet_type: initialData?.sheet_type || '',

    // Karji (کرجی / طلق)
    has_karji: initialData?.has_karji ?? false,
    karji_length: initialData?.karji_length || 0,
    karji_width: initialData?.karji_width || 0,
    karji_thickness: initialData?.karji_thickness || 0,
    karji_selection: initialData?.karji_selection || '',

    // Design & General Notes
    design_file_status: initialData?.design_file_status || 'دریافت خط تیغ',
    general_notes: initialData?.general_notes || 'کنترل دقیق روی خط تا و تیغ بوبست، لبه‌چسبانی با چسب گرم استاندارد'
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Archive Search / Product History Modal
  const [showArchivePicker, setShowArchivePicker] = useState(false);
  const [archiveSearchTerm, setArchiveSearchTerm] = useState('');
  const [pastProjects, setPastProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  const openArchivePicker = async () => {
    setShowArchivePicker(true);
    setLoadingProjects(true);
    try {
      const res = await api.getProjects();
      setPastProjects(res.projects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleSelectPastProduct = (p) => {
    setFormData((prev) => ({
      ...prev,
      title: `${p.title} (سفارش مجدد)`,
      old_archive_code: p.archive_code || p.tracking_code,
      customer_name: p.customer_name || prev.customer_name,
      customer_phone: p.customer_phone || prev.customer_phone,
      customer_code: p.customer_code || prev.customer_code,
      quantity: p.quantity || prev.quantity,
      has_cardboard: p.has_cardboard ?? prev.has_cardboard,
      cardboard_type: p.cardboard_type || prev.cardboard_type,
      cardboard_length: p.cardboard_length || prev.cardboard_length,
      cardboard_width: p.cardboard_width || prev.cardboard_width,
      cardboard_grammage: p.cardboard_grammage || prev.cardboard_grammage,
      cardboard_unit_price: p.cardboard_unit_price || prev.cardboard_unit_price,
      has_print: p.has_print ?? prev.has_print,
      zinc_status: p.zinc_status || prev.zinc_status,
      custom_color: p.custom_color ?? prev.custom_color,
      print_colors_count: p.print_colors_count || prev.print_colors_count,
      print_type: p.print_type || prev.print_type,
      print_format: p.print_format || prev.print_format,
      print_length: p.print_length || prev.print_length,
      print_width: p.print_width || prev.print_width,
      print_waste: p.print_waste || prev.print_waste,
      boxes_per_sheet: p.boxes_per_sheet || prev.boxes_per_sheet,
      print_sheets_count: p.print_sheets_count || prev.print_sheets_count,
      has_varnish: p.has_varnish ?? prev.has_varnish,
      has_cellophane: p.has_cellophane ?? prev.has_cellophane,
      cellophane_type: p.cellophane_type || prev.cellophane_type,
      has_uv: p.has_uv ?? prev.has_uv,
      uv_shablon_status: p.uv_shablon_status || prev.uv_shablon_status,
      uv_type: p.uv_type || prev.uv_type,
      has_foil: p.has_foil ?? prev.has_foil,
      foil_type: p.foil_type || prev.foil_type,
      foil_length: p.foil_length || prev.foil_length,
      foil_width: p.foil_width || prev.foil_width,
      has_emboss: p.has_emboss ?? prev.has_emboss,
      emboss_cliche_status: p.emboss_cliche_status || prev.emboss_cliche_status,
      emboss_type: p.emboss_type || prev.emboss_type,
      has_blade: p.has_blade ?? prev.has_blade,
      blade_status: p.blade_status || prev.blade_status,
      blade_type: p.blade_type || prev.blade_type,
      has_window: p.has_window ?? prev.has_window,
      window_length: p.window_length || prev.window_length,
      window_width: p.window_width || prev.window_width,
      window_thickness: p.window_thickness || prev.window_thickness,
      has_glue: p.has_glue ?? prev.has_glue,
      glue_type: p.glue_type || prev.glue_type,
      glue_price: p.glue_price || prev.glue_price,
      has_staple: p.has_staple ?? prev.has_staple,
      staple_count: p.staple_count || prev.staple_count,
      has_sheet: p.has_sheet ?? prev.has_sheet,
      sheet_category: p.sheet_category || prev.sheet_category,
      sheet_length: p.sheet_length || prev.sheet_length,
      sheet_width: p.sheet_width || prev.sheet_width,
      sheet_price: p.sheet_price || prev.sheet_price,
      sheet_type: p.sheet_type || prev.sheet_type,
      has_karji: p.has_karji ?? prev.has_karji,
      karji_length: p.karji_length || prev.karji_length,
      karji_width: p.karji_width || prev.karji_width,
      karji_thickness: p.karji_thickness || prev.karji_thickness,
      karji_selection: p.karji_selection || prev.karji_selection
    }));
    setShowArchivePicker(false);
  };

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerateNewArchiveCode = () => {
    const newCode = String(Math.floor(1000 + Math.random() * 9000));
    updateField('archive_code', newCode);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!formData.title || !formData.title.trim()) {
      setErrorMsg('لطفاً نام سفارش / جعبه را وارد فرمایید.');
      return;
    }
    if (!formData.customer_name || !formData.customer_name.trim()) {
      setErrorMsg('لطفاً نام کارفرما / مشتری را وارد فرمایید.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createProject({
        ...formData,
        box_type: `${formData.cardboard_type} - ${formData.sheet_category || ''}`,
        box_structure: `${formData.blade_type} / ${formData.glue_type}`
      });
      setSuccessMsg(`سفارش «${formData.title}» با کد آرشیو ${res.archiveCode || formData.archive_code} با موفقیت ثبت شد و وارد مرحله اول خط تولید شد.`);
      setTimeout(() => {
        if (onOrderSaved) onOrderSaved(res);
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'خطا در برقراری ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Page Title & Breadcrumb Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-amber-300 shadow-inner">
            <Boxes className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                فرم جامع ثبت و اتوماسیون سفارشات کارتن و جعبه‌سازی
              </h2>
              <span className="bg-amber-400 text-slate-900 text-xs font-black px-2.5 py-0.5 rounded-full">
                مرحله ۱ - ثبت و استعلام
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-1">
              ماتریس کامل مشخصات فنی، متریال، ابعاد، تیراژ، چاپ، سلفون، طلاکوب، دایکات و تیغ کارتن‌سازی
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {successMsg && (
            <span className="text-emerald-300 bg-emerald-950/90 border border-emerald-500/50 px-4 py-2 rounded-xl text-sm font-bold animate-pulse">
              ✓ {successMsg}
            </span>
          )}

          {errorMsg && (
            <span className="text-rose-200 bg-rose-950/90 border border-rose-500/50 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{errorMsg}</span>
            </span>
          )}

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold transition-all border border-slate-700"
            >
              بازگشت به کارتابل
            </button>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'در حال ذخیره...' : 'ذخیره و ثبت در سامانه'}</span>
          </button>
        </div>
      </div>

      {/* Main Form Content Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Base Order Information */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-3">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-black text-slate-800">مشخصات پایه سفارش و کارفرما</h3>
            </div>
            
            {/* Search and Load from Archive Button */}
            <button
              type="button"
              onClick={openArchivePicker}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-all shadow-xs"
            >
              <Search className="w-4 h-4 text-amber-600" />
              <span>فراخوانی مشخصات از سوابق و آرشیو محصولات</span>
            </button>
          </div>

          {formData.old_archive_code && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-600" />
                <span>مشخصات فنی بر اساس کد آرشیو قبلی: <strong className="font-mono font-black">{formData.old_archive_code}</strong> بارگذاری شد.</span>
              </div>
              <button
                type="button"
                onClick={() => updateField('old_archive_code', '')}
                className="text-amber-700 hover:text-amber-900 text-xs font-bold"
              >
                حذف ارجاع
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
            
            {/* نام کار */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">نام کار و سفارش:</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl px-3.5 py-2.5 font-black text-base text-slate-900 transition-all"
                placeholder="مثال: جعبه دارویی شربت ۲۵۰ میل"
                required
              />
            </div>

            {/* نام کارفرما / مشتری */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">نام کارفرما / شرکت مشتری:</label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => updateField('customer_name', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl px-3.5 py-2.5 font-bold text-sm text-slate-800 transition-all"
                placeholder="نام مشتری..."
                required
              />
            </div>

            {/* شماره تماس مشتری */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">تلفن مشتری:</label>
              <input
                type="text"
                value={formData.customer_phone}
                onChange={(e) => updateField('customer_phone', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2.5 font-mono font-bold text-sm text-center text-slate-800"
                placeholder="0912..."
              />
            </div>

            {/* کد مشتری */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">کد مشتری:</label>
              <input
                type="text"
                value={formData.customer_code}
                onChange={(e) => updateField('customer_code', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2.5 font-mono font-bold text-sm text-center text-slate-800"
              />
            </div>

            {/* کد آرشیو / استعلام */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-700">کد آرشیو / استعلام:</label>
                <button
                  type="button"
                  onClick={handleGenerateNewArchiveCode}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> جدید
                </button>
              </div>
              <input
                type="text"
                value={formData.archive_code}
                onChange={(e) => updateField('archive_code', e.target.value)}
                className="w-full bg-rose-600 text-white text-center font-mono font-black text-lg rounded-xl px-3.5 py-2 shadow-md shadow-rose-200"
              />
            </div>

            {/* کد سفارش */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">کد سفارش‌گیرنده:</label>
              <input
                type="text"
                value={formData.order_code}
                onChange={(e) => updateField('order_code', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2.5 font-mono font-bold text-sm text-center text-slate-800"
              />
            </div>

            {/* تیراژ سفارش */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-sm font-black text-indigo-900">تیراژ سفارش (تعداد جعبه):</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => updateField('quantity', parseInt(e.target.value) || 0)}
                className="w-full bg-indigo-50/50 border-2 border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 rounded-xl px-4 py-2.5 font-mono font-black text-xl text-indigo-950 text-center"
              />
            </div>

            {/* تاریخ سفارش */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">تاریخ سفارش:</label>
              <input
                type="text"
                value={formData.order_date}
                onChange={(e) => updateField('order_date', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono text-sm text-center"
              />
            </div>

            {/* وضعیت چاپ اول */}
            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="flex items-center gap-2.5 p-2.5 bg-rose-50 border border-rose-200 rounded-xl cursor-pointer hover:bg-rose-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.is_first_print}
                  onChange={(e) => updateField('is_first_print', e.target.checked)}
                  className="w-5 h-5 accent-rose-600 rounded"
                />
                <span className="text-sm font-black text-rose-800">سفارش چاپ اول است</span>
              </label>
            </div>

          </div>
        </div>

        {/* Section 2: 4-Column Technical Matrix (مقوا، چاپ، سلفون، یووی) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          
          {/* ================= 1. مقوا ================= */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
            <div className="bg-slate-900 text-white p-4 font-black flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>۱. مشخصات مقوا</span>
              </div>
              <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer bg-slate-800 px-2.5 py-1 rounded-lg">
                <span>استفاده از مقوا</span>
                <input
                  type="checkbox"
                  checked={formData.has_cardboard}
                  onChange={(e) => updateField('has_cardboard', e.target.checked)}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>
            </div>

            <div className="p-5 space-y-4 text-sm flex-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">نوع مقوا:</label>
                <select
                  value={formData.cardboard_type}
                  onChange={(e) => updateField('cardboard_type', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-bold text-sm bg-slate-50 focus:bg-white"
                >
                  <option value="ایندربرد (FBB)">ایندربرد (FBB)</option>
                  <option value="پشت طوسی (Duplex)">پشت طوسی (Duplex)</option>
                  <option value="کرافت بهداشتی فودگرید">کرافت بهداشتی فودگرید</option>
                  <option value="پشت سفید">پشت سفید</option>
                  <option value="گلاسه">گلاسه</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">طول مقوا (mm):</label>
                  <input
                    type="number"
                    value={formData.cardboard_length}
                    onChange={(e) => updateField('cardboard_length', parseFloat(e.target.value) || 0)}
                    className="w-full border border-amber-200 bg-amber-50 rounded-xl p-2.5 font-mono font-black text-center text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">عرض مقوا (mm):</label>
                  <input
                    type="number"
                    value={formData.cardboard_width}
                    onChange={(e) => updateField('cardboard_width', parseFloat(e.target.value) || 0)}
                    className="w-full border border-purple-200 bg-purple-50 rounded-xl p-2.5 font-mono font-black text-center text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">گرماژ مقوا (گرم):</label>
                <input
                  type="number"
                  value={formData.cardboard_grammage}
                  onChange={(e) => updateField('cardboard_grammage', parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-center text-sm bg-slate-50"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="text-xs font-black text-emerald-800">فی هر بند / کیلو (ریال/تومان):</label>
                <input
                  type="number"
                  value={formData.cardboard_unit_price}
                  onChange={(e) => updateField('cardboard_unit_price', parseFloat(e.target.value) || 0)}
                  className="w-full border-2 border-emerald-300 bg-emerald-50 rounded-xl p-2.5 font-mono font-black text-center text-sm text-emerald-900"
                />
              </div>
            </div>
          </div>

          {/* ================= 2. چاپ ================= */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
            <div className="bg-slate-900 text-white p-4 font-black flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-cyan-400" />
                <span>۲. چاپ و لیتوگرافی</span>
              </div>
              <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer bg-slate-800 px-2.5 py-1 rounded-lg">
                <span>چاپ</span>
                <input
                  type="checkbox"
                  checked={formData.has_print}
                  onChange={(e) => updateField('has_print', e.target.checked)}
                  className="w-4 h-4 accent-cyan-400"
                />
              </label>
            </div>

            <div className="p-5 space-y-4 text-sm flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">وضعیت زینک:</label>
                  <select
                    value={formData.zinc_status}
                    onChange={(e) => updateField('zinc_status', e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2 font-bold text-xs bg-slate-50"
                  >
                    <option value="زینک جدید">زینک جدید</option>
                    <option value="زینک موجود">زینک موجود</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">تعداد رنگ:</label>
                  <select
                    value={formData.print_colors_count}
                    onChange={(e) => updateField('print_colors_count', parseInt(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl p-2 font-bold text-xs bg-slate-50 text-center"
                  >
                    <option value="1">۱ رنگ</option>
                    <option value="2">۲ رنگ</option>
                    <option value="4">۴ رنگ CMYK</option>
                    <option value="5">۵ رنگ (با پنتون)</option>
                    <option value="6">۶ رنگ</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">دستگاه چاپ و فرمت:</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.print_type}
                    onChange={(e) => updateField('print_type', e.target.value)}
                    className="border border-slate-300 rounded-xl p-2 text-center text-xs font-bold"
                    placeholder="نوع چاپ"
                  />
                  <input
                    type="text"
                    value={formData.print_format}
                    onChange={(e) => updateField('print_format', e.target.value)}
                    className="border border-slate-300 rounded-xl p-2 text-center text-xs"
                    placeholder="فرمت شیت"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">طول شیت چاپ:</label>
                  <input
                    type="number"
                    value={formData.print_length}
                    onChange={(e) => updateField('print_length', parseFloat(e.target.value) || 0)}
                    className="w-full border border-amber-200 bg-amber-50 rounded-xl p-2 font-mono font-bold text-center text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">عرض شیت چاپ:</label>
                  <input
                    type="number"
                    value={formData.print_width}
                    onChange={(e) => updateField('print_width', parseFloat(e.target.value) || 0)}
                    className="w-full border border-purple-200 bg-purple-50 rounded-xl p-2 font-mono font-bold text-center text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="text-xs font-black text-indigo-900">تعداد جعبه در هر شیت فرم:</label>
                <input
                  type="number"
                  value={formData.boxes_per_sheet}
                  onChange={(e) => updateField('boxes_per_sheet', parseInt(e.target.value) || 1)}
                  className="w-full border-2 border-indigo-300 bg-indigo-50 rounded-xl p-2 font-mono font-black text-center text-sm text-indigo-900"
                />
              </div>
            </div>
          </div>

          {/* ================= 3. سلفون و ورنی ================= */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
            <div className="bg-slate-900 text-white p-4 font-black flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>۳. پوشش، سلفون و ورنی</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <label className="flex items-center gap-1 cursor-pointer bg-slate-800 px-2 py-1 rounded">
                  <span>ورنی</span>
                  <input
                    type="checkbox"
                    checked={formData.has_varnish}
                    onChange={(e) => updateField('has_varnish', e.target.checked)}
                    className="w-3.5 h-3.5 accent-indigo-400"
                  />
                </label>
                <label className="flex items-center gap-1 cursor-pointer bg-slate-800 px-2 py-1 rounded">
                  <span>سلفون</span>
                  <input
                    type="checkbox"
                    checked={formData.has_cellophane}
                    onChange={(e) => updateField('has_cellophane', e.target.checked)}
                    className="w-3.5 h-3.5 accent-indigo-400"
                  />
                </label>
              </div>
            </div>

            <div className="p-5 space-y-2 text-sm flex-1">
              <label className="text-xs font-bold text-slate-600 block mb-2">نوع سلفون و پوشش محافظتی:</label>
              {[
                'سلفون حرارتی مات',
                'سلفون حرارتی براق',
                'واتربیس مات',
                'واتربیس براق',
                'سلفون مخملی Soft-Touch',
                'سلفون متالایز / طرح‌دار'
              ].map((type, idx) => (
                <label
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                    formData.cellophane_type === type
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-black shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <span className="text-xs sm:text-sm">{type}</span>
                  <input
                    type="radio"
                    name="cellophane_option"
                    checked={formData.cellophane_type === type}
                    onChange={() => updateField('cellophane_type', type)}
                    className="w-4 h-4 accent-indigo-600"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* ================= 4. یووی UV ================= */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
            <div className="bg-slate-900 text-white p-4 font-black flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-400" />
                <span>۴. یووی (UV) و ورنی</span>
              </div>
              <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer bg-slate-800 px-2.5 py-1 rounded-lg">
                <span>یووی</span>
                <input
                  type="checkbox"
                  checked={formData.has_uv}
                  onChange={(e) => updateField('has_uv', e.target.checked)}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>
            </div>

            <div className="p-5 space-y-3 text-sm flex-1">
              <div className="space-y-1 mb-2">
                <label className="text-xs font-bold text-slate-600">وضعیت شابلون / سیلندر:</label>
                <select
                  value={formData.uv_shablon_status}
                  onChange={(e) => updateField('uv_shablon_status', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2 font-bold text-xs bg-slate-50"
                >
                  <option value="شابلون موجود">شابلون موجود</option>
                  <option value="شابلون جدید">شابلون جدید</option>
                </select>
              </div>

              <label className="text-xs font-bold text-slate-600 block mb-1">نوع تکنیک یووی:</label>
              {['موضعی براق', 'شنی', 'اکلیلی', 'سیلندری کامل', 'هیبریدی مات و براق'].map((uType, idx) => (
                <label
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                    formData.uv_type === uType
                      ? 'bg-amber-50 border-amber-400 text-amber-950 font-black shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <span className="text-xs sm:text-sm">{uType}</span>
                  <input
                    type="radio"
                    name="uv_option"
                    checked={formData.uv_type === uType}
                    onChange={() => updateField('uv_type', uType)}
                    className="w-4 h-4 accent-amber-600"
                  />
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Section 3: 4-Column Technical Matrix Row 2 (طلاکوب، برجسته، قالب/تیغ، چسب) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          
          {/* طلاکوب و فویل */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-black text-sm text-slate-800">فویل / طلاکوب</span>
              <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                <span>فعال</span>
                <input
                  type="checkbox"
                  checked={formData.has_foil}
                  onChange={(e) => updateField('has_foil', e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
              </label>
            </div>

            <div className="space-y-2">
              {['طلاکوب', 'نقره‌کوب', 'هولوگرام امنیتی', 'رنگی متالیک'].map((f, idx) => (
                <label key={idx} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer">
                  <span>{f}</span>
                  <input
                    type="radio"
                    name="foil_opt"
                    checked={formData.foil_type === f}
                    onChange={() => updateField('foil_type', f)}
                    className="accent-amber-500"
                  />
                </label>
              ))}

              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                <input
                  type="number"
                  placeholder="طول کلیشه (mm)"
                  value={formData.foil_length}
                  onChange={(e) => updateField('foil_length', parseFloat(e.target.value) || 0)}
                  className="border border-amber-200 bg-amber-50 rounded-xl p-2 text-center text-xs font-mono font-bold"
                />
                <input
                  type="number"
                  placeholder="عرض کلیشه (mm)"
                  value={formData.foil_width}
                  onChange={(e) => updateField('foil_width', parseFloat(e.target.value) || 0)}
                  className="border border-purple-200 bg-purple-50 rounded-xl p-2 text-center text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* برجسته‌سازی و امباس */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-black text-sm text-slate-800">برجسته (Embossing)</span>
              <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                <span>فعال</span>
                <input
                  type="checkbox"
                  checked={formData.has_emboss}
                  onChange={(e) => updateField('has_emboss', e.target.checked)}
                  className="w-4 h-4 accent-indigo-500"
                />
              </label>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">وضعیت کلیشه برجسته:</label>
                <select
                  value={formData.emboss_cliche_status}
                  onChange={(e) => updateField('emboss_cliche_status', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2 text-xs font-bold bg-slate-50"
                >
                  <option value="کلیشه جدید">کلیشه جدید</option>
                  <option value="کلیشه موجود">کلیشه موجود</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">نوع برجستگی و خط بریل:</label>
                <input
                  type="text"
                  value={formData.emboss_type}
                  onChange={(e) => updateField('emboss_type', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2 text-center text-xs font-bold"
                  placeholder="مثال: لوگو + خط بریل دارویی"
                />
              </div>
            </div>
          </div>

          {/* قالب، تیغ و دایکات */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-black text-sm text-slate-800">قالب، تیغ و دایکات</span>
              <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                <span>فعال</span>
                <input
                  type="checkbox"
                  checked={formData.has_blade}
                  onChange={(e) => updateField('has_blade', e.target.checked)}
                  className="w-4 h-4 accent-rose-500"
                />
              </label>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">وضعیت قالب تیغ:</label>
                <select
                  value={formData.blade_status}
                  onChange={(e) => updateField('blade_status', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2 text-xs font-bold bg-slate-50"
                >
                  <option value="قالب جدید لیزری">قالب جدید لیزری</option>
                  <option value="قالب موجود در آرشیو">قالب موجود در آرشیو</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">دستگاه دایکات کارخانه:</label>
                <select
                  value={formData.blade_type}
                  onChange={(e) => updateField('blade_type', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2 text-xs font-bold bg-slate-50"
                >
                  <option value="دایکات بوبست اتوماتیک">دایکات بوبست اتوماتیک</option>
                  <option value="لترپرس">لترپرس</option>
                  <option value="دایکات فکی">دایکات فکی</option>
                </select>
              </div>
            </div>
          </div>

          {/* چسب و جعبه‌چسبانی */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-black text-sm text-slate-800">چسب / لب‌چسب / لاک‌باتم</span>
              <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                <span>فعال</span>
                <input
                  type="checkbox"
                  checked={formData.has_glue}
                  onChange={(e) => updateField('has_glue', e.target.checked)}
                  className="w-4 h-4 accent-indigo-500"
                />
              </label>
            </div>

            <div className="space-y-2">
              {['لب‌چسب ساده لمینتی', 'لاک‌باتم ۶ نقطه اتوماتیک', 'چسب دوطرفه', 'منگنه کارتن'].map((g, idx) => (
                <label key={idx} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer">
                  <span>{g}</span>
                  <input
                    type="radio"
                    name="glue_opt"
                    checked={formData.glue_type === g}
                    onChange={() => updateField('glue_type', g)}
                    className="accent-indigo-600"
                  />
                </label>
              ))}

              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-xs font-bold text-slate-600">فی چسب هر عدد:</span>
                <input
                  type="number"
                  value={formData.glue_price}
                  onChange={(e) => updateField('glue_price', parseFloat(e.target.value) || 0)}
                  className="border border-slate-300 rounded-xl p-2 text-center font-mono w-24 font-bold text-xs"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Section 4: ورق، سینگل و یادداشت‌های فنی کارگاهی */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* ورق سینگل کارتن */}
          <div className="md:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-black text-sm text-slate-800">سینگل / ورق کارتن لمینت</span>
              <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                <span>فعال</span>
                <input
                  type="checkbox"
                  checked={formData.has_sheet}
                  onChange={(e) => updateField('has_sheet', e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
              </label>
            </div>

            <div className="space-y-2">
              {['سینگل E فلوت', 'سینگل B فلوت', 'سینگل C فلوت', 'ورق ۳ لایه', 'ورق ۵ لایه'].map((sh, idx) => (
                <label key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer">
                  <span>{sh}</span>
                  <input
                    type="radio"
                    name="sheet_category_opt"
                    checked={formData.sheet_category === sh}
                    onChange={() => updateField('sheet_category', sh)}
                    className="accent-indigo-600"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* توضیحات فنی خط تولید */}
          <div className="md:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <span className="font-black text-sm text-slate-800 block border-b pb-3">
              توضیحات و دستورالعمل‌های فنی سالن تولید، لیتوگرافی و کنترل کیفیت:
            </span>
            <textarea
              rows="5"
              value={formData.general_notes}
              onChange={(e) => updateField('general_notes', e.target.value)}
              placeholder="دستور کار ویژه، نحوه بسته‌بندی در کارتن مادر، نکات حساس روی انطباق رنگ و خط تا..."
              className="w-full border border-slate-300 rounded-xl p-4 text-sm font-medium bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 leading-relaxed"
            ></textarea>
          </div>

        </div>

        {/* Section 5: Bottom Action Submit Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4 text-white">
          <div className="text-sm text-slate-300 flex items-center gap-3">
            <span>کد آرشیو: <strong className="text-amber-400 font-mono text-base font-black">{formData.archive_code}</strong></span>
            <span className="text-slate-600">|</span>
            <span>مشتری: <strong className="text-white font-bold">{formData.customer_name}</strong></span>
            <span className="text-slate-600">|</span>
            <span>تیراژ: <strong className="text-cyan-400 font-mono font-black">{formData.quantity} عدد</strong></span>
          </div>

          <div className="flex items-center gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold transition-all border border-slate-700"
              >
                انصراف و بازگشت
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-base font-black shadow-lg shadow-indigo-600/40 flex items-center gap-2.5 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{loading ? 'در حال پردازش...' : 'تایید نهایی و ورود به خط تولید ۹ مرحله‌ای'}</span>
            </button>
          </div>
        </div>

      </form>

      {/* Archive Picker Modal */}
      {showArchivePicker && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">انتخاب و فراخوانی از آرشیو محصولات و سفارشات قبلی</h3>
                  <p className="text-xs text-slate-400">با انتخاب هر سفارش، ماتریس کامل متریال و مشخصات چاپ در این فرم بارگذاری می‌شود.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowArchivePicker(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Filter Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <div className="relative">
                <Search className="w-4 h-4 text-indigo-600 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="جستجو بر اساس نام محصول، کد آرشیو، نام مشتری، نوع مقوا، ابعاد..."
                  value={archiveSearchTerm}
                  onChange={(e) => setArchiveSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                  autoFocus
                />
              </div>
            </div>

            {/* Modal Body / Items List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
              {loadingProjects ? (
                <div className="py-12 text-center text-slate-400 font-bold text-xs">در حال بارگذاری آرشیو...</div>
              ) : pastProjects.filter((p) => matchProduct(p, archiveSearchTerm)).length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  هیچ موردی مطابق با جستجوی شما یافت نشد.
                </div>
              ) : (
                pastProjects
                  .filter((p) => matchProduct(p, archiveSearchTerm))
                  .map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPastProduct(p)}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 cursor-pointer transition-all flex flex-wrap items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            کد: {p.archive_code || p.tracking_code}
                          </span>
                          <span className="font-black text-sm text-slate-900 group-hover:text-indigo-600">
                            {p.title}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-3">
                          <span>مشتری: <strong className="text-slate-700">{p.customer_name}</strong></span>
                          <span>•</span>
                          <span>مقوا: <strong className="text-slate-700">{p.cardboard_type || '---'}</strong></span>
                          <span>•</span>
                          <span>چاپ: <strong className="text-slate-700">{p.print_type || 'افست'}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {p.length_mm}×{p.width_mm}×{p.height_mm} mm
                        </span>
                        <button
                          type="button"
                          className="px-3 py-1.5 bg-indigo-600 group-hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                        >
                          فراخوانی مشخصات
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowArchivePicker(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
