import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
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
  Droplet
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

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
  }, [selectedCategory, selectedSupplier, selectedLocation, selectedStatus]);

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
              مدیریت تفکیکی انبار در ۶ شاخه اصلی: <strong className="text-white">۱. مقوا</strong>، <strong className="text-amber-300">۲. ورق</strong>، <strong className="text-teal-300">۳. سینگل</strong>، <strong className="text-indigo-300">۴. سلفون</strong>، <strong className="text-purple-300">۵. طلق</strong> و <strong className="text-rose-300">۶. مرکب</strong> همراه با ثبت بارنامه‌ها و خروجی فایل اکسل ۶ شیت.
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

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">تعداد پرونده‌های ثبتی</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-2">{receipts.length} پرونده</div>
          <span className="text-[11px] text-slate-400 mt-1 block">در انبار {currentCategoryMeta.label}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">جمع کل دریافتی انبار</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-2">
            {totalReceived.toLocaleString('fa-IR')} <span className="text-xs font-normal">{currentCategoryMeta.unit}</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">موجودی تحویل داده شده</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">کل نیاز سفارشات</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-900 font-mono mt-2">
            {totalRequired.toLocaleString('fa-IR')} <span className="text-xs font-normal">{currentCategoryMeta.unit}</span>
          </div>
          <span className="text-[11px] text-indigo-600 font-medium mt-1 block">میزان سفارش داده شده</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">تامین‌کنندگان این بخش</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-900 font-mono mt-2">{suppliers.length} تامین‌کننده</div>
          <span className="text-[11px] text-slate-400 mt-1 block">تامین‌کنندگان ثبت شده</span>
        </div>
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
            <option value="all">همه وضعیت‌ها</option>
            <option value="received">دریافت کامل (۱۰۰٪)</option>
            <option value="partial">دارای کسری</option>
            <option value="excess">مازاد بر تیراژ</option>
          </select>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`جستجو در ${currentCategoryMeta.label}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all"
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
        ) : receipts.length === 0 ? (
          <div className="p-16 text-center space-y-3 text-slate-400">
            <Package className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
            <p className="text-base font-bold text-slate-600">هیچ رکوردی در بخش «{currentCategoryMeta.label}» با این مشخصات یافت نشد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-200 font-bold border-b border-slate-800 text-[11px] select-none">
                  <th className="py-3 px-3 text-center w-10">ردیف</th>
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
                  <th className="py-3 px-3 text-center">وضعیت</th>
                  <th className="py-3 px-3">توضیحات انبار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {receipts.map((rec, idx) => {
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

                  return (
                    <tr key={rec.id} className="hover:bg-sky-50/40 transition-colors">
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
