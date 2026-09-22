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
  ArrowDownToLine
} from 'lucide-react';

export default function WarehouseInventoryView() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New receipt form state
  const [newReceipt, setNewReceipt] = useState({
    registration_date: '1405/01/10',
    order_code: '',
    archive_code: '',
    customer_name: '',
    order_name: '',
    supplier: 'بازرگانی راماسیم',
    material: 'مقوای ایندربرد بهداشتی (FBB)',
    grammage: 300,
    size: '70*100',
    required_qty: 10000,
    unloading_location: 'انبار چهاردانگه (مرکزی)',
    received_qty_1: 10000,
    received_date_1: '1405/01/12',
    received_qty_2: 0,
    received_date_2: '',
    status: 'received',
    notes: ''
  });

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await api.getWarehouseReceipts({
        supplier: selectedSupplier,
        location: selectedLocation,
        status: selectedStatus,
        search: searchQuery
      });
      setReceipts(res.receipts || []);
    } catch (err) {
      console.error('Error fetching warehouse receipts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [selectedSupplier, selectedLocation, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReceipts();
  };

  const handleCreateReceipt = async (e) => {
    e.preventDefault();
    try {
      await api.createWarehouseReceipt(newReceipt);
      setShowAddModal(false);
      fetchReceipts();
      alert('رسید ورود متریال به انبار با موفقیت ثبت گردید.');
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

  const totalSheetsReceived = receipts.reduce((sum, r) => sum + (r.total_received || ((r.received_qty_1 || 0) + (r.received_qty_2 || 0))), 0);
  const totalSheetsRequired = receipts.reduce((sum, r) => sum + (r.required_qty || 0), 0);

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
              <span>انبار مقوا و کاغذ شیت و رول کارخانه</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>مدیریت ورود مقوا و تحویل سفارشات</span>
              <span className="text-xs px-2.5 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 rounded-lg font-bold">
                استودیو طراحی امیران
              </span>
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              تطبیق بلادرنگ شیت‌های دریافتی از تامین‌کنندگان (راماسیم، بنار، کریمی، ممقانی، هنر پلاستیک و...) با تیراژ مجاز سفارش، کنترل کسری و مازاد و ثبت محل تخلیه انبارها.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportExcel}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-2 border border-emerald-400/30"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>دانلود فایل اکسل انبار مقوا</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-slate-950 rounded-xl font-black text-xs sm:text-sm shadow-lg shadow-sky-900/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>ثبت رسید ورود مقوا به انبار</span>
            </button>
          </div>
        </div>
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
          <span className="text-[11px] text-slate-400 mt-1 block">شامل ۲۲ رکورد شیت‌های فعال کارخانه</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">جمع کل شیت دریافتی</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-2">
            {totalSheetsReceived.toLocaleString('fa-IR')} <span className="text-xs font-normal">شیت</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">تخلیه شده در انبارهای کارخانه</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">کل شیت مورد نیاز تولید</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-900 font-mono mt-2">
            {totalSheetsRequired.toLocaleString('fa-IR')} <span className="text-xs font-normal">شیت</span>
          </div>
          <span className="text-[11px] text-indigo-600 font-medium mt-1 block">مجموع تیراژ مجاز سفارشات</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">تامین‌کنندگان همکار</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-900 font-mono mt-2">{suppliers.length} تامین‌کننده</div>
          <span className="text-[11px] text-slate-400 mt-1 block">راماسیم، بنار، کریمی، ممقانی و...</span>
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
            <option value="all">همه وضعیت‌های انبار</option>
            <option value="received">دریافت کامل (۱۰۰٪)</option>
            <option value="partial">دارای کسری شیت</option>
            <option value="excess">مازاد بر تیراژ</option>
          </select>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو در نام مشتری، سفارش، کد بایگانی، مقوا..."
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

      {/* Main Table Matching Factory Google Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
            <p className="text-sm font-bold">در حال بارگذاری دفاتر انبار مقوا...</p>
          </div>
        ) : receipts.length === 0 ? (
          <div className="p-16 text-center space-y-3 text-slate-400">
            <Package className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
            <p className="text-base font-bold text-slate-600">هیچ رکوردی با این مشخصات در انبار یافت نشد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-200 font-bold border-b border-slate-800 text-[11px] select-none">
                  <th className="py-3 px-3 text-center w-10">ردیف</th>
                  <th className="py-3 px-3">تاریخ ثبت</th>
                  <th className="py-3 px-3">شماره سفارش / بایگانی</th>
                  <th className="py-3 px-3">نام مشتری</th>
                  <th className="py-3 px-3">نام سفارش</th>
                  <th className="py-3 px-3">تامین کننده</th>
                  <th className="py-3 px-3">جنس، گراماژ و سایز</th>
                  <th className="py-3 px-3 text-center">تیراژ سفارش</th>
                  <th className="py-3 px-3">محل تخلیه</th>
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
                      {/* Row # */}
                      <td className="py-3 px-3 text-center font-mono text-slate-400 font-bold">
                        {idx + 1}
                      </td>

                      {/* Reg Date */}
                      <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {rec.registration_date}
                      </td>

                      {/* Codes */}
                      <td className="py-3 px-3 font-mono">
                        <div className="font-bold text-slate-900">{rec.order_code}</div>
                        <div className="text-[10px] text-slate-400">بایگانی: {rec.archive_code}</div>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                        {rec.customer_name}
                      </td>

                      {/* Order Title */}
                      <td className="py-3 px-3 font-bold text-indigo-950">
                        {rec.order_name}
                      </td>

                      {/* Supplier */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-bold">
                          {rec.supplier}
                        </span>
                      </td>

                      {/* Material, Grammage, Size */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{rec.material}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {rec.grammage ? `${rec.grammage}g` : ''} | سایز: {rec.size}
                        </div>
                      </td>

                      {/* Required Qty */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                        {Number(rec.required_qty).toLocaleString('fa-IR')}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3 text-[11px] text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{rec.unloading_location}</span>
                        </div>
                      </td>

                      {/* Part 1 */}
                      <td className="py-3 px-3 text-center font-mono text-[11px]">
                        <div className="font-bold text-slate-800">
                          {rec.received_qty_1 ? Number(rec.received_qty_1).toLocaleString('fa-IR') : '-'}
                        </div>
                        {rec.received_date_1 && (
                          <div className="text-[9px] text-slate-400">{rec.received_date_1}</div>
                        )}
                      </td>

                      {/* Part 2 */}
                      <td className="py-3 px-3 text-center font-mono text-[11px]">
                        <div className="font-bold text-slate-800">
                          {rec.received_qty_2 ? Number(rec.received_qty_2).toLocaleString('fa-IR') : '-'}
                        </div>
                        {rec.received_date_2 && (
                          <div className="text-[9px] text-slate-400">{rec.received_date_2}</div>
                        )}
                      </td>

                      {/* Total Received */}
                      <td className="py-3 px-3 text-center font-mono font-black text-indigo-950 text-xs bg-slate-50/50">
                        {totalR.toLocaleString('fa-IR')}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        {statusTag}
                      </td>

                      {/* Notes */}
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
                <h2 className="text-xl font-black text-slate-900">ثبت رسید ورود مقوا و کاغذ به انبار</h2>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاریخ ثبت ورود *</label>
                  <input
                    type="text"
                    required
                    value={newReceipt.registration_date}
                    onChange={(e) => setNewReceipt({ ...newReceipt, registration_date: e.target.value })}
                    placeholder="1405/01/15"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">نام مشتری *</label>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">نام سفارش *</label>
                  <input
                    type="text"
                    required
                    value={newReceipt.order_name}
                    onChange={(e) => setNewReceipt({ ...newReceipt, order_name: e.target.value })}
                    placeholder="جعبه پمپ آب / هاردباکس ادکلن"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تامین‌کننده مقوا/کاغذ *</label>
                  <input
                    type="text"
                    required
                    value={newReceipt.supplier}
                    onChange={(e) => setNewReceipt({ ...newReceipt, supplier: e.target.value })}
                    placeholder="راماسیم / بنار / کریمی / ممقانی / هنر پلاستیک"
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
                    <option value="انبار جاده مخصوص">انبار جاده مخصوص</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع جنس و گراماژ</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newReceipt.material}
                      onChange={(e) => setNewReceipt({ ...newReceipt, material: e.target.value })}
                      placeholder="ایندربرد / پشت طوسی"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                    <input
                      type="number"
                      value={newReceipt.grammage}
                      onChange={(e) => setNewReceipt({ ...newReceipt, grammage: e.target.value })}
                      placeholder="گراماژ (300)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سایز و تیراژ سفارش *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newReceipt.size}
                      onChange={(e) => setNewReceipt({ ...newReceipt, size: e.target.value })}
                      placeholder="سایز: 70*100"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                    />
                    <input
                      type="number"
                      required
                      value={newReceipt.required_qty}
                      onChange={(e) => setNewReceipt({ ...newReceipt, required_qty: e.target.value })}
                      placeholder="تیراژ سفارش"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">پارت ۱: تعداد و تاریخ دریافت</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={newReceipt.received_qty_1}
                      onChange={(e) => setNewReceipt({ ...newReceipt, received_qty_1: e.target.value })}
                      placeholder="تعداد شیت"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                    />
                    <input
                      type="text"
                      value={newReceipt.received_date_1}
                      onChange={(e) => setNewReceipt({ ...newReceipt, received_date_1: e.target.value })}
                      placeholder="تاریخ: 1405/01/12"
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
                      placeholder="تعداد شیت"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">توضیحات انبار / وضعیت سلامت بندیل‌ها</label>
                <textarea
                  rows={2}
                  value={newReceipt.notes}
                  onChange={(e) => setNewReceipt({ ...newReceipt, notes: e.target.value })}
                  placeholder="توضیحات بسته‌بندی، رطوبت، کنترل ابعاد و..."
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
                  ثبت رسید انبار مقوا
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
