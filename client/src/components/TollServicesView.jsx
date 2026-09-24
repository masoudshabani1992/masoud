import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api/client';
import { matchProduct } from '../utils/helpers';
import {
  Scissors,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  CreditCard,
  XCircle,
  Building2,
  Calendar,
  Sparkles,
  ArrowUpDown,
  RefreshCw,
  Layers,
  FileText,
  X
} from 'lucide-react';

export default function TollServicesView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [selectedStatusColor, setSelectedStatusColor] = useState('white');

  const [newOrder, setNewOrder] = useState({
    order_code: '',
    customer_name: '',
    customer_phone: '',
    service_title: '',
    service_category: 'دایکات و تیغ',
    input_material_type: 'شیت چاپی ارسالی همکار (۳۵۰ گرم)',
    input_sheet_count: 5000,
    die_code: 'قالب اختصاصی همکار #DK-88',
    wage_rate: 180,
    total_wage: 900000,
    status_color: 'white',
    delivery_deadline: '۲ روز کاری',
    notes: ''
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getServiceOrders({
        color: selectedColor,
        search: searchQuery
      });
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Error fetching service orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedColor]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleOpenStatusModal = (order) => {
    setActiveOrder(order);
    setSelectedStatusColor(order.status_color || 'white');
    setShowStatusModal(true);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => matchProduct(ord, searchQuery));
  }, [orders, searchQuery]);

  const handleQuickColorChange = async (order, newColor) => {
    try {
      await api.updateServiceOrderStatusColor(order.id, { status_color: newColor });
      fetchOrders();
    } catch (err) {
      alert('خطا در تغییر وضعیت: ' + err.message);
    }
  };

  const handleSaveStatus = async () => {
    if (!activeOrder) return;
    try {
      await api.updateServiceOrderStatusColor(activeOrder.id, { status_color: selectedStatusColor });
      setShowStatusModal(false);
      fetchOrders();
    } catch (err) {
      alert('خطا در تغییر وضعیت: ' + err.message);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      await api.createServiceOrder(newOrder);
      setShowAddModal(false);
      fetchOrders();
      alert('سفارش خدمات کارگاهی با موفقیت ثبت شد.');
    } catch (err) {
      alert('خطا در ثبت سفارش خدماتی: ' + err.message);
    }
  };

  const whiteCount = orders.filter((o) => o.status_color === 'white').length;
  const yellowCount = orders.filter((o) => o.status_color === 'yellow').length;
  const redCount = orders.filter((o) => o.status_color === 'red').length;
  const greenCount = orders.filter((o) => o.status_color === 'green').length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-amber-800/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 -translate-x-12 -translate-y-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 translate-x-12 translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
              <Scissors className="w-3.5 h-3.5" />
              <span>دستور تولید ۳: کارهای خدماتی، اجرتی و کارمزدی</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>خدمات دایکات، سلفون‌کشی، یووی، لامینت و جعبه‌چسبانی</span>
              <span className="text-xs px-2.5 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 rounded-lg font-bold">
                استودیو طراحی امیران
              </span>
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              مدیریت خدمات پس از چاپ روی متریال ارسالی همکاران و مشتریان در ۴ رنگ وضعیت: سفید (صف کارگاه)، زرد (تسویه اجرت)، قرمز (کنسل/مرجوع) و سبز (تحویل و ترخیص).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-black text-xs sm:text-sm shadow-lg shadow-amber-900/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>ثبت کار خدماتی جدید</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Color Status Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setSelectedColor(selectedColor === 'white' ? 'all' : 'white')}
          className={`p-4 rounded-2xl border transition-all text-right flex items-center justify-between ${
            selectedColor === 'white'
              ? 'bg-white border-amber-500 shadow-xl ring-4 ring-amber-500/20 scale-[1.02]'
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
                <h3 className="font-black text-slate-900 text-xs sm:text-sm">صف کارگاه (سفید)</h3>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">در انتظار تحویل و اجرا</p>
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
                <h3 className="font-black text-amber-950 text-xs sm:text-sm">تسویه اجرت (زرد)</h3>
              </div>
              <p className="text-[10px] text-amber-700 mt-0.5">در انتظار تسویه کارمزد</p>
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
                <h3 className="font-black text-rose-950 text-xs sm:text-sm">کنسل شده (قرمز)</h3>
              </div>
              <p className="text-[10px] text-rose-700 mt-0.5">مرجوعی یا عدم تایید فنی</p>
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
                <h3 className="font-black text-emerald-950 text-xs sm:text-sm">ترخیص و تحویل (سبز)</h3>
              </div>
              <p className="text-[10px] text-emerald-700 mt-0.5">اجرا تکمیل و خروج انبار</p>
            </div>
          </div>
          <span className="text-xl font-black text-emerald-800 font-mono px-2.5 py-0.5 bg-emerald-100 rounded-lg">
            {greenCount}
          </span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {selectedColor !== 'all' && (
            <button
              onClick={() => setSelectedColor('all')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
            >
              نمایش همه رنگ‌ها ({orders.length})
            </button>
          )}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-96">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-amber-600 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو: نام مشتری، شماره موبایل، نوع خدمت، کد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
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
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            جستجو
          </button>
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-600" />
            <p className="text-sm font-bold">در حال بارگذاری سفارشات خدماتی...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center space-y-3 text-slate-400">
            <Scissors className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
            <p className="text-base font-bold text-slate-600">هیچ سفارش خدماتی با این مشخصات یافت نشد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-200 font-bold border-b border-slate-800 text-[11px]">
                  <th className="py-3 px-3 text-center w-28">وضعیت ۴ رنگ</th>
                  <th className="py-3 px-3">کد سفارش</th>
                  <th className="py-3 px-3">همکار / مشتری</th>
                  <th className="py-3 px-3">نوع خدمت</th>
                  <th className="py-3 px-3">متریال و شیت ورودی</th>
                  <th className="py-3 px-3 text-center">تیراژ شیت</th>
                  <th className="py-3 px-3">قالب / ملزومات</th>
                  <th className="py-3 px-3">اجرت کل و مهلت</th>
                  <th className="py-3 px-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredOrders.map((ord) => {
                  let badge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-bold">
                      <span className="w-2 h-2 rounded-full bg-white border border-slate-400" />
                      صف کارگاه
                    </span>
                  );
                  if (ord.status_color === 'yellow') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        تسویه اجرت
                      </span>
                    );
                  } else if (ord.status_color === 'red') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        کنسل شده
                      </span>
                    );
                  } else if (ord.status_color === 'green') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        ترخیص شد
                      </span>
                    );
                  }

                  return (
                    <tr key={ord.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-3 px-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button onClick={() => handleOpenStatusModal(ord)}>{badge}</button>
                          <div className="flex items-center gap-1 bg-white p-0.5 rounded-full border border-slate-200">
                            <button onClick={() => handleQuickColorChange(ord, 'white')} className={`w-3 h-3 rounded-full border ${ord.status_color === 'white' ? 'bg-white ring-1 ring-amber-600' : 'bg-slate-200'}`} title="سفید" />
                            <button onClick={() => handleQuickColorChange(ord, 'yellow')} className={`w-3 h-3 rounded-full border ${ord.status_color === 'yellow' ? 'bg-amber-400 ring-1 ring-amber-600' : 'bg-amber-200'}`} title="زرد" />
                            <button onClick={() => handleQuickColorChange(ord, 'red')} className={`w-3 h-3 rounded-full border ${ord.status_color === 'red' ? 'bg-rose-500 ring-1 ring-rose-600' : 'bg-rose-200'}`} title="قرمز" />
                            <button onClick={() => handleQuickColorChange(ord, 'green')} className={`w-3 h-3 rounded-full border ${ord.status_color === 'green' ? 'bg-emerald-500 ring-1 ring-emerald-600' : 'bg-emerald-200'}`} title="سبز" />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{ord.order_code}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{ord.customer_name}</div>
                        {ord.customer_phone && <div className="text-[10px] text-slate-400 font-mono" dir="ltr">{ord.customer_phone}</div>}
                      </td>
                      <td className="py-3 px-3 font-bold text-amber-950">{ord.service_title}</td>
                      <td className="py-3 px-3 text-[11px] text-slate-700">{ord.input_material_type}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                        {Number(ord.input_sheet_count || 0).toLocaleString('fa-IR')} شیت
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-600 font-mono">{ord.die_code || '-'}</td>
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-slate-900">{Number(ord.total_wage || 0).toLocaleString('fa-IR')} ت</div>
                        <div className="text-[10px] text-amber-700 font-bold">{ord.delivery_deadline || '۲ روز'}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleOpenStatusModal(ord)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-bold border border-amber-200"
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
      {showStatusModal && activeOrder && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900">تغییر وضعیت ۴ رنگ کار خدماتی</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedStatusColor('white')}
                className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 ${
                  selectedStatusColor === 'white' ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400' : 'bg-white border-slate-200'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-400" />
                <span>سفید (صف کارگاه)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatusColor('yellow')}
                className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 ${
                  selectedStatusColor === 'yellow' ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-400' : 'bg-white border-slate-200'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400" />
                <span>زرد (تسویه اجرت)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatusColor('red')}
                className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 ${
                  selectedStatusColor === 'red' ? 'bg-rose-100 border-rose-400 ring-2 ring-rose-400 text-rose-950' : 'bg-white border-slate-200'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500" />
                <span>قرمز (کنسل شده)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatusColor('green')}
                className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 ${
                  selectedStatusColor === 'green' ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-400 text-emerald-950' : 'bg-white border-slate-200'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
                <span>سبز (ترخیص شد)</span>
              </button>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setShowStatusModal(false)} className="px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold">انصراف</button>
              <button onClick={handleSaveStatus} className="px-4 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold">ذخیره</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: New Service Order */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">ثبت کار خدماتی / کارمزدی</h2>
                <p className="text-xs text-slate-500 mt-0.5">دایکات، سلفون، یووی، لامینت و جعبه‌چسبانی با متریال مشتری</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نام همکار / مشتری *</label>
                  <input
                    type="text"
                    required
                    value={newOrder.customer_name}
                    onChange={(e) => setNewOrder({ ...newOrder, customer_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">عنوان کار خدماتی *</label>
                  <input
                    type="text"
                    required
                    value={newOrder.service_title}
                    onChange={(e) => setNewOrder({ ...newOrder, service_title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">دسته خدمت</label>
                  <select
                    value={newOrder.service_category}
                    onChange={(e) => setNewOrder({ ...newOrder, service_category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="دایکات و تیغ">دایکات و تیغ زنی (لترپرس / بابست)</option>
                    <option value="سلفون‌کشی">سلفون‌کشی (مات / براق / حرارتی)</option>
                    <option value="یووی موضعی و شنی">یووی موضعی / برجسته / شنی</option>
                    <option value="لامینت کارتن">لامینت روی سینگل / ای فلوت</option>
                    <option value="لب‌چسب و جعبه‌چسبانی">لب‌چسب و جعبه‌چسبانی اتوماتیک</option>
                    <option value="طلاکوب و برجسته‌سازی">طلاکوب / نقره‌کوب و امباسینگ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">متریال ورودی مشتری</label>
                  <input
                    type="text"
                    value={newOrder.input_material_type}
                    onChange={(e) => setNewOrder({ ...newOrder, input_material_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تعداد شیت ورودی</label>
                  <input
                    type="number"
                    value={newOrder.input_sheet_count}
                    onChange={(e) => setNewOrder({ ...newOrder, input_sheet_count: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">کد قالب / مشخصات تیغ</label>
                  <input
                    type="text"
                    value={newOrder.die_code}
                    onChange={(e) => setNewOrder({ ...newOrder, die_code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مبلغ کل کارمزد (تومان)</label>
                  <input
                    type="number"
                    value={newOrder.total_wage}
                    onChange={(e) => setNewOrder({ ...newOrder, total_wage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مهلت تحویل</label>
                  <input
                    type="text"
                    value={newOrder.delivery_deadline}
                    onChange={(e) => setNewOrder({ ...newOrder, delivery_deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 bg-slate-100 rounded-xl text-xs font-bold">انصراف</button>
                <button type="submit" className="px-6 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-600/20">ثبت کار خدماتی</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
