import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Printer,
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
  FileText
} from 'lucide-react';

export default function DigitalPrintView() {
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
    title: '',
    machine_type: 'دیجیتال کونیکا مینولتا C1085 (شیت)',
    paper_type: 'گلاسه ۳۰۰ گرم کره‌ای',
    grammage: 300,
    dimensions: '33x48 cm (A3+)',
    quantity: 200,
    print_side: 'دورُو ۴ رنگ (4/4)',
    lamination: 'سلفون مات حرارتی دورُو',
    finishing: 'خط‌تا + دایکات دیجیتال و پرفراژ',
    status_color: 'white',
    unit_price: 15000,
    total_price: 3000000,
    paid_amount: 1500000,
    delivery_deadline: 'همان روز (فوری)',
    notes: ''
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getDigitalOrders({
        color: selectedColor,
        search: searchQuery
      });
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Error fetching digital orders:', err);
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

  const handleQuickColorChange = async (order, newColor) => {
    try {
      await api.updateDigitalOrderStatusColor(order.id, { status_color: newColor });
      fetchOrders();
    } catch (err) {
      alert('خطا در تغییر وضعیت: ' + err.message);
    }
  };

  const handleSaveStatus = async () => {
    if (!activeOrder) return;
    try {
      await api.updateDigitalOrderStatusColor(activeOrder.id, { status_color: selectedStatusColor });
      setShowStatusModal(false);
      fetchOrders();
    } catch (err) {
      alert('خطا در تغییر وضعیت: ' + err.message);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      await api.createDigitalOrder(newOrder);
      setShowAddModal(false);
      fetchOrders();
      alert('سفارش چاپ دیجیتال با موفقیت ثبت شد.');
    } catch (err) {
      alert('خطا در ثبت سفارش دیجیتال: ' + err.message);
    }
  };

  const whiteCount = orders.filter((o) => o.status_color === 'white').length;
  const yellowCount = orders.filter((o) => o.status_color === 'yellow').length;
  const redCount = orders.filter((o) => o.status_color === 'red').length;
  const greenCount = orders.filter((o) => o.status_color === 'green').length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-purple-800/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 -translate-x-12 -translate-y-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 translate-x-12 translate-y-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold">
              <Printer className="w-3.5 h-3.5" />
              <span>دستور تولید ۲: چاپ دیجیتال فوری و لارج فرمت</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>سفارشات چاپ با دستگاه‌های دیجیتال</span>
              <span className="text-xs px-2.5 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 rounded-lg font-bold">
                استودیو طراحی امیران
              </span>
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              مدیریت نمونه‌گیری‌های پیش از چاپ، کاتالوگ و بروشورهای فوری، جعبه‌های دیجیتال و پلات در ۴ رنگ وضعیت: سفید (صف چاپ)، زرد (مالی و رنگ)، قرمز (کنسل شده) و سبز (تحویل شده).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white rounded-xl font-black text-xs sm:text-sm shadow-lg shadow-purple-900/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>ثبت سفارش چاپ دیجیتال جدید</span>
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
              ? 'bg-white border-purple-500 shadow-xl ring-4 ring-purple-500/20 scale-[1.02]'
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
                <h3 className="font-black text-slate-900 text-xs sm:text-sm">صف چاپ (سفید)</h3>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">در نوبت ریپ و چاپ فوری</p>
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
                <h3 className="font-black text-amber-950 text-xs sm:text-sm">تایید مالی (زرد)</h3>
              </div>
              <p className="text-[10px] text-amber-700 mt-0.5">تایید نمونه رنگ و تسویه</p>
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
              <p className="text-[10px] text-rose-700 mt-0.5">ابطال سفارش دیجیتال</p>
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
                <h3 className="font-black text-emerald-950 text-xs sm:text-sm">تحویل شده (سبز)</h3>
              </div>
              <p className="text-[10px] text-emerald-700 mt-0.5">چاپ تکمیل و تحویل شد</p>
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

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو در مشتری، عنوان سفارش، کد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold"
          >
            جستجو
          </button>
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
            <p className="text-sm font-bold">در حال بارگذاری سفارشات دیجیتال...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center space-y-3 text-slate-400">
            <Printer className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
            <p className="text-base font-bold text-slate-600">هیچ سفارش چاپ دیجیتالی یافت نشد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-200 font-bold border-b border-slate-800 text-[11px]">
                  <th className="py-3 px-3 text-center w-28">وضعیت ۴ رنگ</th>
                  <th className="py-3 px-3">کد سفارش</th>
                  <th className="py-3 px-3">مشتری</th>
                  <th className="py-3 px-3">عنوان سفارش</th>
                  <th className="py-3 px-3">دستگاه و مدیا</th>
                  <th className="py-3 px-3 text-center">تیراژ و ابعاد</th>
                  <th className="py-3 px-3">چاپ و روکش</th>
                  <th className="py-3 px-3">تکمیلی و برش</th>
                  <th className="py-3 px-3">مبلغ کل و مهلت</th>
                  <th className="py-3 px-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {orders.map((ord) => {
                  let badge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-bold">
                      <span className="w-2 h-2 rounded-full bg-white border border-slate-400" />
                      صف چاپ
                    </span>
                  );
                  if (ord.status_color === 'yellow') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        تایید مالی
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
                        تحویل شد
                      </span>
                    );
                  }

                  return (
                    <tr key={ord.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-3 px-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button onClick={() => handleOpenStatusModal(ord)}>{badge}</button>
                          <div className="flex items-center gap-1 bg-white p-0.5 rounded-full border border-slate-200">
                            <button onClick={() => handleQuickColorChange(ord, 'white')} className={`w-3 h-3 rounded-full border ${ord.status_color === 'white' ? 'bg-white ring-1 ring-purple-600' : 'bg-slate-200'}`} title="سفید" />
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
                      <td className="py-3 px-3 font-bold text-purple-950">{ord.title}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800 text-[11px]">{ord.machine_type}</div>
                        <div className="text-[10px] text-slate-500">{ord.paper_type} {ord.grammage ? `(${ord.grammage}g)` : ''}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="font-mono font-bold text-slate-900">{Number(ord.quantity).toLocaleString('fa-IR')} برگ/عدد</div>
                        <div className="text-[10px] text-slate-500 font-mono">{ord.dimensions}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-[11px] text-slate-800">{ord.print_side}</div>
                        <div className="text-[10px] text-slate-500">{ord.lamination}</div>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-600 max-w-[130px] truncate">
                        {ord.finishing || '-'}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-slate-900">{Number(ord.total_price || 0).toLocaleString('fa-IR')} ت</div>
                        <div className="text-[10px] text-purple-700 font-bold">{ord.delivery_deadline || 'فوری'}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleOpenStatusModal(ord)}
                          className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-[11px] font-bold border border-purple-200"
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
            <h3 className="text-base font-black text-slate-900">تغییر وضعیت ۴ رنگ چاپ دیجیتال</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedStatusColor('white')}
                className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 ${
                  selectedStatusColor === 'white' ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400' : 'bg-white border-slate-200'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-400" />
                <span>سفید (صف چاپ)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatusColor('yellow')}
                className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 ${
                  selectedStatusColor === 'yellow' ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-400' : 'bg-white border-slate-200'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400" />
                <span>زرد (تایید مالی)</span>
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
                <span>سبز (تحویل شد)</span>
              </button>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setShowStatusModal(false)} className="px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold">انصراف</button>
              <button onClick={handleSaveStatus} className="px-4 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold">ذخیره</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: New Digital Print */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">ثبت سفارش چاپ دیجیتال</h2>
                <p className="text-xs text-slate-500 mt-0.5">نمونه‌گیری، ماکت، کاتالوگ فوری و چاپ شیت</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نام مشتری *</label>
                  <input
                    type="text"
                    required
                    value={newOrder.customer_name}
                    onChange={(e) => setNewOrder({ ...newOrder, customer_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">عنوان سفارش *</label>
                  <input
                    type="text"
                    required
                    value={newOrder.title}
                    onChange={(e) => setNewOrder({ ...newOrder, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">دستگاه دیجیتال</label>
                  <input
                    type="text"
                    value={newOrder.machine_type}
                    onChange={(e) => setNewOrder({ ...newOrder, machine_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">جنس کاغذ / مدیا</label>
                  <input
                    type="text"
                    value={newOrder.paper_type}
                    onChange={(e) => setNewOrder({ ...newOrder, paper_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ابعاد و تیراژ</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newOrder.dimensions}
                      onChange={(e) => setNewOrder({ ...newOrder, dimensions: e.target.value })}
                      placeholder="33x48 cm"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                    <input
                      type="number"
                      value={newOrder.quantity}
                      onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
                      placeholder="تیراژ"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">چاپ و سلفون</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newOrder.print_side}
                      onChange={(e) => setNewOrder({ ...newOrder, print_side: e.target.value })}
                      placeholder="دورُو ۴ رنگ"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={newOrder.lamination}
                      onChange={(e) => setNewOrder({ ...newOrder, lamination: e.target.value })}
                      placeholder="سلفون مات"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">خدمات تکمیلی و برش</label>
                  <input
                    type="text"
                    value={newOrder.finishing}
                    onChange={(e) => setNewOrder({ ...newOrder, finishing: e.target.value })}
                    placeholder="خط‌تا + دایکات دیجیتال"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مبلغ کل (تومان)</label>
                  <input
                    type="number"
                    value={newOrder.total_price}
                    onChange={(e) => setNewOrder({ ...newOrder, total_price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 bg-slate-100 rounded-xl text-xs font-bold">انصراف</button>
                <button type="submit" className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-black shadow-lg shadow-purple-600/20">ثبت سفارش</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
