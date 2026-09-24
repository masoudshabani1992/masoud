import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api/client';
import { matchProduct } from '../utils/helpers';
import {
  Package,
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Building,
  Calendar,
  Truck,
  Layers,
  RefreshCw,
  Box,
  MapPin,
  Sparkles,
  Scroll,
  Film,
  Maximize2,
  Droplet,
  Clock,
  CreditCard,
  XCircle,
  ArrowUpDown,
  X
} from 'lucide-react';

export default function WarehouseInventoryView({ initialCategory = 'cardboard' }) {
  const [receipts, setReceipts] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({
    cardboard: 0,
    sheet_carton: 0,
    single_face: 0,
    cellophane: 0,
    pvc_film: 0,
    ink: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'cardboard');
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [statusForm, setStatusForm] = useState({ status_color: 'white', notes: '' });

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // New receipt form state
  const [newReceipt, setNewReceipt] = useState({
    warehouse_category: 'cardboard',
    registration_date: '1405/02/01',
    order_code: '',
    archive_code: '',
    customer_name: '',
    order_name: '',
    supplier: 'بازرگانی راماسیم',
    material: 'مقوای ایندربرد بهداشتی (FBB)',
    grammage: 300,
    size: '70*100',
    unit: 'شیت',
    required_qty: 10000,
    unloading_location: 'انبار چهاردانگه (مرکزی)',
    received_qty_1: 10000,
    received_date_1: '1405/02/02',
    received_qty_2: 0,
    received_date_2: '',
    status: 'received',
    status_color: 'white',
    notes: ''
  });

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await api.getWarehouseReceipts({
        category: selectedCategory,
        supplier: selectedSupplier,
        location: selectedLocation,
        status: selectedStatus,
        color: selectedColor,
        search: searchQuery
      });
      setReceipts(res.receipts || []);
      if (res.counts) {
        setCategoryCounts(res.counts);
      }
    } catch (err) {
      console.error('Error fetching warehouse receipts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [selectedCategory, selectedSupplier, selectedLocation, selectedStatus, selectedColor]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReceipts();
  };

  const handleCreateReceipt = async (e) => {
    e.preventDefault();
    try {
      await api.createWarehouseReceipt({
        ...newReceipt,
        warehouse_category: selectedCategory
      });
      setShowAddModal(false);
      fetchReceipts();
      alert('رسید ورود کالا به انبار با موفقیت ثبت گردید.');
    } catch (err) {
      alert('خطا در ثبت رسید انبار: ' + err.message);
    }
  };

  const handleOpenStatusModal = (receipt) => {
    setActiveReceipt(receipt);
    setStatusForm({
      status_color: receipt.status_color || 'white',
      notes: receipt.notes || ''
    });
    setShowStatusModal(true);
  };

  const handleQuickColorChange = async (receipt, newColor) => {
    try {
      await api.updateWarehouseStatusColor(receipt.id, { status_color: newColor });
      fetchReceipts();
    } catch (err) {
      alert('خطا در تغییر وضعیت انبار: ' + err.message);
    }
  };

  const handleSaveStatus = async () => {
    if (!activeReceipt) return;
    try {
      await api.updateWarehouseStatusColor(activeReceipt.id, {
        status_color: statusForm.status_color
      });
      setShowStatusModal(false);
      fetchReceipts();
    } catch (err) {
      alert('خطا در ذخیره وضعیت: ' + err.message);
    }
  };

  const filteredReceipts = useMemo(() => {
    return receipts.filter((rec) => matchProduct(rec, searchQuery));
  }, [receipts, searchQuery]);

  const handleExportExcel = () => {
    window.open('/api/warehouse-receipts/export-excel', '_blank');
  };

  // Suppliers list from current data
  const suppliers = Array.from(new Set(receipts.map((r) => r.supplier).filter(Boolean)));
  const locations = Array.from(new Set(receipts.map((r) => r.unloading_location).filter(Boolean)));

  const totalReceived = receipts.reduce((sum, r) => sum + (r.total_received || ((r.received_qty_1 || 0) + (r.received_qty_2 || 0))), 0);
  const totalRequired = receipts.reduce((sum, r) => sum + (r.required_qty || 0), 0);

  // Warehouse Category Specs Meta
  const WAREHOUSE_CATEGORIES = [
    { id: 'cardboard', label: '۱. مقوا', icon: Package, desc: 'ایندربرد، پشت طوسی، گلاسه، کرافت، تحریر', unit: 'شیت / بند', color: 'sky' },
    { id: 'sheet_carton', label: '۲. ورق', icon: Layers, desc: 'ورق کارتن ۳ لایه، ۵ لایه، E/B/C فلوت', unit: 'ورق', color: 'amber' },
    { id: 'single_face', label: '۳. سینگل', icon: Scroll, desc: 'رول و شیت سینگل فلوت بهداشتی و صنعتی', unit: 'طاقه / شیت', color: 'teal' },
    { id: 'cellophane', label: '۴. سلفون', icon: Film, desc: 'حرارتی مات، براق، مخملی، واتربیس، شنی', unit: 'طاقه / رول', color: 'indigo' },
    { id: 'pvc_film', label: '۵. طلق', icon: Maximize2, desc: 'طلق شفاف PVC، طلق سخت PET، پنجره جعبه', unit: 'شیت / رول', color: 'purple' },
    { id: 'ink', label: '۶. مرکب', icon: Droplet, desc: 'مرکب افست CMYK، طلایی، نقره‌ای، پنتون، ورنی', unit: 'قوطی / حلب', color: 'rose' }
  ];

  const currentCategoryMeta = WAREHOUSE_CATEGORIES.find((c) => c.id === selectedCategory) || WAREHOUSE_CATEGORIES[0];

  const whiteCount = receipts.filter((r) => !r.status_color || r.status_color === 'white').length;
  const yellowCount = receipts.filter((r) => r.status_color === 'yellow').length;
  const redCount = receipts.filter((r) => r.status_color === 'red').length;
  const greenCount = receipts.filter((r) => r.status_color === 'green').length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-sky-800/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 -translate-x-12 -translate-y-12 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 translate-x-12 translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold">
              <Package className="w-3.5 h-3.5" />
              <span>انبار مرکزی مواد اولیه و ملزومات کارخانه</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>دفتر انبار: {currentCategoryMeta.label}</span>
              <span className="text-xs px-2.5 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 rounded-lg font-bold">
                استودیو طراحی امیران
              </span>
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              مدیریت تفکیکی انبار در ۶ شاخه اصلی: <strong className="text-white">۱. مقوا</strong>، <strong className="text-amber-300">۲. ورق</strong>، <strong className="text-teal-300">۳. سینگل</strong>، <strong className="text-indigo-300">۴. سلفون</strong>، <strong className="text-purple-300">۵. طلق</strong> و <strong className="text-rose-300">۶. مرکب</strong> در ۴ رنگ وضعیت: سفید (صف انبار)، زرد (پرونده مالی)، قرمز (مرجوع/کنسل) و سبز (تکمیل و تایید) همراه با خروجی اکسل ۶ شیت.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportExcel}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-2 border border-emerald-400/30"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>دانلود فایل اکسل ۶ شیت انبار</span>
            </button>

            <button
              onClick={() => {
                setNewReceipt({
                  ...newReceipt,
                  warehouse_category: selectedCategory,
                  unit: currentCategoryMeta.unit.split('/')[0].trim()
                });
                setShowAddModal(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-slate-950 rounded-xl font-black text-xs sm:text-sm shadow-lg shadow-sky-900/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>ثبت رسید ورود به انبار {currentCategoryMeta.label.split('.')[1]}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Core Warehouse Category Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {WAREHOUSE_CATEGORIES.map((cat) => {
          const IconComp = cat.icon;
          const isActive = selectedCategory === cat.id;
          const count = categoryCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between h-28 relative overflow-hidden group ${
                isActive
                  ? 'bg-white border-sky-500 shadow-xl ring-2 ring-sky-500/30 scale-[1.02]'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isActive ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                }`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <span className="font-mono text-sm font-black text-slate-900 px-2 py-0.5 bg-slate-100 rounded-lg">
                  {count}
                </span>
              </div>

              <div>
                <h3 className={`font-black text-xs sm:text-sm ${isActive ? 'text-sky-950' : 'text-slate-800'}`}>
                  {cat.label}
                </h3>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{cat.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 4 Status Color Cards for Warehouse */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setSelectedColor(selectedColor === 'white' ? 'all' : 'white')}
          className={`p-4 rounded-2xl border transition-all text-right flex items-center justify-between ${
            selectedColor === 'white'
              ? 'bg-white border-sky-500 shadow-xl ring-4 ring-sky-500/20 scale-[1.02]'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400" />
                <h3 className="font-black text-slate-900 text-xs sm:text-sm">صف انبار (سفید)</h3>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">در نوبت ورود یا تحویل به سالن</p>
            </div>
          </div>
          <span className="text-xl font-black text-slate-800 font-mono px-2.5 py-0.5 bg-slate-100 rounded-lg">
            {whiteCount}
          </span>
        </button>

        <button
          onClick={() => setSelectedColor(selectedColor === 'yellow' ? 'all' : 'yellow')}
          className={`p-4 rounded-2xl border transition-all text-right flex items-center justify-between ${
            selectedColor === 'yellow'
              ? 'bg-amber-50 border-amber-500 shadow-xl ring-4 ring-amber-500/20 scale-[1.02]'
              : 'bg-white border-slate-200 hover:border-amber-200 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-400 flex items-center justify-center text-amber-700">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <h3 className="font-black text-amber-950 text-xs sm:text-sm">پرونده مالی (زرد)</h3>
              </div>
              <p className="text-[10px] text-amber-700 mt-0.5">در انتظار فاکتور و تسویه خرید</p>
            </div>
          </div>
          <span className="text-xl font-black text-amber-800 font-mono px-2.5 py-0.5 bg-amber-100 rounded-lg">
            {yellowCount}
          </span>
        </button>

        <button
          onClick={() => setSelectedColor(selectedColor === 'red' ? 'all' : 'red')}
          className={`p-4 rounded-2xl border transition-all text-right flex items-center justify-between ${
            selectedColor === 'red'
              ? 'bg-rose-50 border-rose-500 shadow-xl ring-4 ring-rose-500/20 scale-[1.02]'
              : 'bg-white border-slate-200 hover:border-rose-200 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-400 flex items-center justify-center text-rose-700">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h3 className="font-black text-rose-950 text-xs sm:text-sm">مرجوع / کنسل (قرمز)</h3>
              </div>
              <p className="text-[10px] text-rose-700 mt-0.5">مرجوعی، معیوب یا لغو شده</p>
            </div>
          </div>
          <span className="text-xl font-black text-rose-800 font-mono px-2.5 py-0.5 bg-rose-100 rounded-lg">
            {redCount}
          </span>
        </button>

        <button
          onClick={() => setSelectedColor(selectedColor === 'green' ? 'all' : 'green')}
          className={`p-4 rounded-2xl border transition-all text-right flex items-center justify-between ${
            selectedColor === 'green'
              ? 'bg-emerald-50 border-emerald-500 shadow-xl ring-4 ring-emerald-500/20 scale-[1.02]'
              : 'bg-white border-slate-200 hover:border-emerald-200 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-400 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="font-black text-emerald-950 text-xs sm:text-sm">تکمیل و تایید (سبز)</h3>
              </div>
              <p className="text-[10px] text-emerald-700 mt-0.5">تخلیه کامل، QC و تسویه</p>
            </div>
          </div>
          <span className="text-xl font-black text-emerald-800 font-mono px-2.5 py-0.5 bg-emerald-100 rounded-lg">
            {greenCount}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Supplier filter */}
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="all">همه تامین‌کنندگان</option>
            {suppliers.map((s, idx) => (
              <option key={idx} value={s}>{s}</option>
            ))}
          </select>

          {/* Location filter */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="all">همه محل‌های تخلیه</option>
            {locations.map((loc, idx) => (
              <option key={idx} value={loc}>{loc}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="all">همه وضعیت‌های انبار</option>
            <option value="received">دریافت کامل (۱۰۰٪)</option>
            <option value="partial">دارای کسری</option>
            <option value="excess">مازاد بر تیراژ</option>
          </select>

          {selectedColor !== 'all' && (
            <button
              onClick={() => setSelectedColor('all')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
            >
              همه رنگ‌ها ({receipts.length})
            </button>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-96">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-sky-600 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`جستجو در ${currentCategoryMeta.label}: تامین‌کننده، مشتری، پرونده...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-sky-500 focus:outline-none transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                title="پاک کردن جستجو"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            جستجو
          </button>
        </form>
      </div>

      {/* Main Table Matching Factory Structure */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
            <p className="text-sm font-bold">در حال بارگذاری دفاتر انبار...</p>
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="p-16 text-center space-y-3 text-slate-400">
            <Package className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
            <p className="text-base font-bold text-slate-600">هیچ رکوردی در بخش «{currentCategoryMeta.label}» با این مشخصات یافت نشد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-200 font-bold border-b border-slate-800 text-[11px] select-none">
                  <th className="py-3 px-3 text-center w-28">وضعیت ۴ رنگ</th>
                  <th className="py-3 px-3 text-center w-8">ردیف</th>
                  <th className="py-3 px-3">تاریخ ثبت</th>
                  <th className="py-3 px-3">شماره سفارش / بایگانی</th>
                  <th className="py-3 px-3">مشتری</th>
                  <th className="py-3 px-3">نام سفارش / عنوان کالا</th>
                  <th className="py-3 px-3">تامین کننده</th>
                  <th className="py-3 px-3">جنس / مشخصات فنی</th>
                  <th className="py-3 px-3 text-center">تیراژ سفارش</th>
                  <th className="py-3 px-3">محل تخلیه انبار</th>
                  <th className="py-3 px-3 text-center">پارت ۱</th>
                  <th className="py-3 px-3 text-center">پارت ۲</th>
                  <th className="py-3 px-3 text-center">جمع کل دریافتی</th>
                  <th className="py-3 px-3 text-center">کسری / مازاد</th>
                  <th className="py-3 px-3">توضیحات انبار</th>
                  <th className="py-3 px-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredReceipts.map((rec, idx) => {
                  const totalR = (rec.received_qty_1 || 0) + (rec.received_qty_2 || 0);
                  const diff = totalR - (rec.required_qty || 0);

                  let statusTag = (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      دریافت کامل
                    </span>
                  );

                  if (diff < 0) {
                    statusTag = (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        کسری {Math.abs(diff).toLocaleString('fa-IR')}
                      </span>
                    );
                  } else if (diff > 0) {
                    statusTag = (
                      <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold inline-flex items-center gap-1">
                        <span>+</span>
                        مازاد {diff.toLocaleString('fa-IR')}
                      </span>
                    );
                  }

                  let colorBadge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-bold">
                      <span className="w-2 h-2 rounded-full bg-white border border-slate-400" />
                      صف انبار
                    </span>
                  );
                  if (rec.status_color === 'yellow') {
                    colorBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        پرونده مالی
                      </span>
                    );
                  } else if (rec.status_color === 'red') {
                    colorBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        مرجوع/کنسل
                      </span>
                    );
                  } else if (rec.status_color === 'green') {
                    colorBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        تایید و تسویه
                      </span>
                    );
                  }

                  return (
                    <tr key={rec.id} className="hover:bg-sky-50/40 transition-colors">
                      {/* 4 Status Color Column */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button onClick={() => handleOpenStatusModal(rec)}>{colorBadge}</button>
                          <div className="flex items-center gap-1 bg-white p-0.5 rounded-full border border-slate-200">
                            <button onClick={() => handleQuickColorChange(rec, 'white')} className={`w-3 h-3 rounded-full border ${rec.status_color === 'white' ? 'bg-white ring-1 ring-sky-600' : 'bg-slate-200'}`} title="سفید" />
                            <button onClick={() => handleQuickColorChange(rec, 'yellow')} className={`w-3 h-3 rounded-full border ${rec.status_color === 'yellow' ? 'bg-amber-400 ring-1 ring-amber-600' : 'bg-amber-200'}`} title="زرد" />
                            <button onClick={() => handleQuickColorChange(rec, 'red')} className={`w-3 h-3 rounded-full border ${rec.status_color === 'red' ? 'bg-rose-500 ring-1 ring-rose-600' : 'bg-rose-200'}`} title="قرمز" />
                            <button onClick={() => handleQuickColorChange(rec, 'green')} className={`w-3 h-3 rounded-full border ${rec.status_color === 'green' ? 'bg-emerald-500 ring-1 ring-emerald-600' : 'bg-emerald-200'}`} title="سبز" />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-slate-400 font-bold">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {rec.registration_date}
                      </td>

                      <td className="py-3 px-3 font-mono">
                        <div className="font-bold text-slate-900">{rec.order_code}</div>
                        <div className="text-[10px] text-slate-400">بایگانی: {rec.archive_code}</div>
                      </td>

                      <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                        {rec.customer_name}
                      </td>

                      <td className="py-3 px-3 font-bold text-indigo-950">
                        {rec.order_name}
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-bold">
                          {rec.supplier}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{rec.material}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {rec.grammage ? `${rec.grammage}g | ` : ''}{rec.size}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                        {Number(rec.required_qty).toLocaleString('fa-IR')} {rec.unit || 'شیت'}
                      </td>

                      <td className="py-3 px-3 text-[11px] text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{rec.unloading_location}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-[11px]">
                        <div className="font-bold text-slate-800">
                          {rec.received_qty_1 ? Number(rec.received_qty_1).toLocaleString('fa-IR') : '-'}
                        </div>
                        {rec.received_date_1 && (
                          <div className="text-[9px] text-slate-400">{rec.received_date_1}</div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-[11px]">
                        <div className="font-bold text-slate-800">
                          {rec.received_qty_2 ? Number(rec.received_qty_2).toLocaleString('fa-IR') : '-'}
                        </div>
                        {rec.received_date_2 && (
                          <div className="text-[9px] text-slate-400">{rec.received_date_2}</div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-black text-indigo-950 text-xs bg-slate-50/50">
                        {totalR.toLocaleString('fa-IR')}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {statusTag}
                      </td>

                      <td className="py-3 px-3 text-[11px] text-slate-500 max-w-[140px] truncate">
                        {rec.notes || '-'}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleOpenStatusModal(rec)}
                          className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg text-[11px] font-bold border border-sky-200"
                        >
                          تغییر وضعیت
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Status Color (White, Yellow, Red, Green) */}
      {showStatusModal && activeReceipt && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900">تغییر وضعیت ۴ رنگ رسید انبار</h3>
            <p className="text-xs text-slate-500">کد: {activeReceipt.order_code} ({activeReceipt.order_name})</p>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatusForm({ ...statusForm, status_color: 'white' })}
                className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 ${
                  statusForm.status_color === 'white' ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400' : 'bg-white border-slate-200'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-400" />
                <span>سفید (صف انبار)</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusForm({ ...statusForm, status_color: 'yellow' })}
                className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 ${
                  statusForm.status_color === 'yellow' ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-400' : 'bg-white border-slate-200'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400" />
                <span>زرد (پرونده مالی)</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusForm({ ...statusForm, status_color: 'red' })}
                className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 ${
                  statusForm.status_color === 'red' ? 'bg-rose-100 border-rose-400 ring-2 ring-rose-400 text-rose-950' : 'bg-white border-slate-200'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500" />
                <span>قرمز (مرجوع/کنسل)</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusForm({ ...statusForm, status_color: 'green' })}
                className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 ${
                  statusForm.status_color === 'green' ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-400 text-emerald-950' : 'bg-white border-slate-200'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
                <span>سبز (تایید و تسویه)</span>
              </button>
            </div>
            
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setShowStatusModal(false)} className="px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold">انصراف</button>
              <button onClick={handleSaveStatus} className="px-4 py-1.5 bg-sky-600 text-white rounded-xl text-xs font-bold">ذخیره وضعیت</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: New Warehouse Receipt */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scaleUp space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">ثبت رسید ورود کالا به {currentCategoryMeta.label}</h2>
                <p className="text-xs text-slate-500 mt-0.5">ثبت پارتی‌های بار تخلیه‌شده در انبار کارخانه</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReceipt} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">شاخه انبار *</label>
                  <select
                    value={newReceipt.warehouse_category}
                    onChange={(e) => setNewReceipt({ ...newReceipt, warehouse_category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                  >
                    {WAREHOUSE_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label} ({c.desc})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاریخ ثبت ورود *</label>
                  <input
                    type="text"
                    required
                    value={newReceipt.registration_date}
                    onChange={(e) => setNewReceipt({ ...newReceipt, registration_date: e.target.value })}
                    placeholder="1405/02/01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">شماره سفارش و بایگانی *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={newReceipt.order_code}
                      onChange={(e) => setNewReceipt({ ...newReceipt, order_code: e.target.value })}
                      placeholder="کد سفارش"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                    />
                    <input
                      type="text"
                      required
                      value={newReceipt.archive_code}
                      onChange={(e) => setNewReceipt({ ...newReceipt, archive_code: e.target.value })}
                      placeholder="کد بایگانی"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نام مشتری / سفارش‌دهنده *</label>
                  <input
                    type="text"
                    required
                    value={newReceipt.customer_name}
                    onChange={(e) => setNewReceipt({ ...newReceipt, customer_name: e.target.value })}
                    placeholder="الکتروژن / صنایع میهن / ..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نام سفارش / عنوان کالا *</label>
                  <input
                    type="text"
                    required
                    value={newReceipt.order_name}
                    onChange={(e) => setNewReceipt({ ...newReceipt, order_name: e.target.value })}
                    placeholder="جعبه پمپ آب / هاردباکس ادکلن / سلفون مات"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تامین‌کننده کالا *</label>
                  <input
                    type="text"
                    required
                    value={newReceipt.supplier}
                    onChange={(e) => setNewReceipt({ ...newReceipt, supplier: e.target.value })}
                    placeholder="راماسیم / بنار / کریمی / ممقانی / پرشین فیلم / هوبر"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">محل تخلیه انبار *</label>
                  <select
                    value={newReceipt.unloading_location}
                    onChange={(e) => setNewReceipt({ ...newReceipt, unloading_location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                  >
                    <option value="انبار چهاردانگه (مرکزی)">انبار چهاردانگه (مرکزی)</option>
                    <option value="سالن چاپ شمس‌آباد">سالن چاپ شمس‌آباد</option>
                    <option value="سوله لامینت و دایکات">سوله لامینت و دایکات</option>
                    <option value="انبار ملزومات چاپ و سلفون">انبار ملزومات چاپ و سلفون</option>
                    <option value="انبار مواد شیمیایی و رنگ">انبار مواد شیمیایی و رنگ</option>
                    <option value="انبار جاده مخصوص">انبار جاده مخصوص</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مشخصات فنی جنس و گراماژ/ضخامت</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newReceipt.material}
                      onChange={(e) => setNewReceipt({ ...newReceipt, material: e.target.value })}
                      placeholder="ایندربرد / E-Flute / مات"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                    <input
                      type="number"
                      value={newReceipt.grammage}
                      onChange={(e) => setNewReceipt({ ...newReceipt, grammage: e.target.value })}
                      placeholder="گراماژ/ضخامت"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سایز و واحد شمارش</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newReceipt.size}
                      onChange={(e) => setNewReceipt({ ...newReceipt, size: e.target.value })}
                      placeholder="سایز: 70*100 یا عرض 100cm"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                    />
                    <input
                      type="text"
                      value={newReceipt.unit}
                      onChange={(e) => setNewReceipt({ ...newReceipt, unit: e.target.value })}
                      placeholder="واحد: شیت / طاقه / قوطی"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رنگ وضعیت اولیه</label>
                  <select
                    value={newReceipt.status_color}
                    onChange={(e) => setNewReceipt({ ...newReceipt, status_color: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                  >
                    <option value="white">سفید (صف انبار / ورود)</option>
                    <option value="yellow">زرد (پرونده مالی / فاکتور)</option>
                    <option value="red">قرمز (مرجوعی / کنسل)</option>
                    <option value="green">سبز (تایید کامل و تسویه)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تیراژ سفارش *</label>
                  <input
                    type="number"
                    required
                    value={newReceipt.required_qty}
                    onChange={(e) => setNewReceipt({ ...newReceipt, required_qty: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">پارت ۱: تعداد و تاریخ دریافت</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={newReceipt.received_qty_1}
                      onChange={(e) => setNewReceipt({ ...newReceipt, received_qty_1: e.target.value })}
                      placeholder="تعداد"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                    />
                    <input
                      type="text"
                      value={newReceipt.received_date_1}
                      onChange={(e) => setNewReceipt({ ...newReceipt, received_date_1: e.target.value })}
                      placeholder="تاریخ: 1405/02/02"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">پارت ۲ (در صورت تحویل دو مرحله‌ای)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={newReceipt.received_qty_2}
                      onChange={(e) => setNewReceipt({ ...newReceipt, received_qty_2: e.target.value })}
                      placeholder="تعداد"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                    />
                    <input
                      type="text"
                      value={newReceipt.received_date_2}
                      onChange={(e) => setNewReceipt({ ...newReceipt, received_date_2: e.target.value })}
                      placeholder="تاریخ دریافت پارت ۲"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">توضیحات انبار / وضعیت سلامت محموله</label>
                <textarea
                  rows={2}
                  value={newReceipt.notes}
                  onChange={(e) => setNewReceipt({ ...newReceipt, notes: e.target.value })}
                  placeholder="توضیحات بسته‌بندی، رطوبت، کنترل ابعاد، پالت یا بندیل..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-xl text-xs shadow-lg shadow-sky-600/20"
                >
                  ثبت رسید انبار
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
