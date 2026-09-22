import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Wrench,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  CreditCard,
  Layers,
  ArrowUpDown,
  RefreshCw,
  Box,
  Truck,
  Sparkles,
  Scissors
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
    service_types: ['دایکات بابست', 'لب‌چسب اتوماتیک'],
    incoming_material_desc: 'مقوای چاپ‌شده ایندربرد ۳۰۰ گرم ارسالی مشتری',
    incoming_sheet_count: 8000,
    incoming_receipt_number: 'REC-9081',
    die_status: 'قالب در کارخانه موجود است',
    setup_fee: 500000,
    rate_per_unit: 180,
    total_amount: 1940000,
    paid_amount: 1000000,
    status_color: 'white',
    operator_name: 'استاد احمدی',
    completed_qty: 0,
    delivered_date: '',
    notes: ''
  });

  const availableServices = [
    'لامینت سینگل و کارتن',
    'سلفون‌کشی حرارتی مات',
    'سلفون‌کشی حرارتی براق',
    'دایکات اتوماتیک بابست',
    'دایکات لترپرس / هایدلبرگ',
    'طلاکوب گرم دیجیتال',
    'یووی موضعی و سیلک',
    'جعبه‌چسبانی لب‌چسب',
    'جعبه‌چسبانی لاک‌باتم (ته قفلی)',
    'برش با گیوتین پلار'
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getServiceOrders({
        color: selectedColor,
        search: searchQuery
      });
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Error fetching toll service orders:', err);
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
      alert('سفارش کار خدماتی و اجرتی با موفقیت ثبت شد.');
    } catch (err) {
      alert('خطا در ثبت سفارش: ' + err.message);
    }
  };

  const toggleServiceType = (serviceName) => {
    const list = [...newOrder.service_types];
    const idx = list.indexOf(serviceName);
    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push(serviceName);
    }
    setNewOrder({ ...newOrder, service_types: list });
  };

  const whiteCount = orders.filter((o) => o.status_color === 'white').length;
  const yellowCount = orders.filter((o) => o.status_color === 'yellow').length;
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
              <span>کارهای اجرتی، کارمزدی و خدمات تکمیلی پس از چاپ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>مدیریت کارهای خدماتی با متریال مشتری</span>
              <span className="text-xs px-2.5 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 rounded-lg font-bold">
                استودیو طراحی امیران
              </span>
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              ثبت و رهگیری فرآیندهای لامینت، دایکات بابست، سلفون‌کشی، طلاکوب و جعبه‌چسبانی برای همکاران و چاپخانه‌ها با شمارش دقیق شیت‌های ورودی و خروجی.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-black text-xs sm:text-sm shadow-lg shadow-amber-900/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>ثبت کار خدماتی / کارمزدی جدید</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Color Cartables */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setSelectedColor('white')}
          className={`p-5 rounded-2xl border transition-all text-right flex items-center justify-between ${
            selectedColor === 'white'
              ? 'bg-white border-amber-500 shadow-lg ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-slate-700 shadow-inner">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-white border-2 border-slate-400 shadow-sm" />
                <h3 className="font-black text-slate-900 text-base">در صف اجرای سالن (سفید)</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">بار تخلیه شده، در نوبت لامینت/دایکات/چسب</p>
            </div>
          </div>
          <span className="text-2xl font-black text-slate-800 font-mono px-3 py-1 bg-slate-100 rounded-xl border border-slate-200">
            {whiteCount}
          </span>
        </button>

        <button
          onClick={() => setSelectedColor('yellow')}
          className={`p-5 rounded-2xl border transition-all text-right flex items-center justify-between ${
            selectedColor === 'yellow'
              ? 'bg-amber-50 border-amber-500 shadow-lg ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-amber-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-amber-700 shadow-inner">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500 shadow-sm" />
                <h3 className="font-black text-amber-950 text-base">آماده و منتظر تسویه (زرد)</h3>
              </div>
              <p className="text-xs text-amber-700 mt-1">کار انجام شده، منتظر تسویه فاکتور جهت ترخیص</p>
            </div>
          </div>
          <span className="text-2xl font-black text-amber-800 font-mono px-3 py-1 bg-amber-100 rounded-xl border border-amber-200">
            {yellowCount}
          </span>
        </button>

        <button
          onClick={() => setSelectedColor('green')}
          className={`p-5 rounded-2xl border transition-all text-right flex items-center justify-between ${
            selectedColor === 'green'
              ? 'bg-emerald-50 border-emerald-500 shadow-lg ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-emerald-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-emerald-700 shadow-inner">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600 shadow-sm" />
                <h3 className="font-black text-emerald-950 text-base">تسویه و ترخیص شده (سبز)</h3>
              </div>
              <p className="text-xs text-emerald-700 mt-1">حساب تسویه کامل و بار به همکار تحویل شد</p>
            </div>
          </div>
          <span className="text-2xl font-black text-emerald-800 font-mono px-3 py-1 bg-emerald-100 rounded-xl border border-emerald-200">
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
              placeholder="جستجو در همکار، عنوان خدمت، رسید ورود..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
          >
            جستجو
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-600" />
            <p className="text-sm font-bold">در حال بارگذاری کارهای خدماتی...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center space-y-3 text-slate-400">
            <Wrench className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
            <p className="text-base font-bold text-slate-600">هیچ سفارش خدماتی یا اجرتی یافت نشد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-200 font-bold border-b border-slate-800 text-[11px]">
                  <th className="py-3 px-3 text-center w-12">وضعیت</th>
                  <th className="py-3 px-3">کد سفارش</th>
                  <th className="py-3 px-3">همکار / مشتری</th>
                  <th className="py-3 px-3">عنوان کار و خدمات درخواستی</th>
                  <th className="py-3 px-3">مشخصات متریال ارسالی مشتری</th>
                  <th className="py-3 px-3 text-center">ورودی / خروجی</th>
                  <th className="py-3 px-3">وضعیت قالب</th>
                  <th className="py-3 px-3">مبالغ و حسابداری</th>
                  <th className="py-3 px-3">اپراتور / تحویل</th>
                  <th className="py-3 px-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {orders.map((ord) => {
                  let badge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-bold">
                      <span className="w-2 h-2 rounded-full bg-white border border-slate-400" />
                      در صف
                    </span>
                  );
                  if (ord.status_color === 'yellow') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        منتظر تسویه
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

                  let parsedServices = [];
                  try {
                    parsedServices = typeof ord.service_types === 'string' ? JSON.parse(ord.service_types) : ord.service_types;
                  } catch (e) {
                    parsedServices = [ord.service_types];
                  }

                  return (
                    <tr key={ord.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-3 px-3 text-center">{badge}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{ord.order_code}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{ord.customer_name}</div>
                        {ord.customer_phone && <div className="text-[10px] text-slate-400 font-mono" dir="ltr">{ord.customer_phone}</div>}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-amber-950">{ord.service_title}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Array.isArray(parsedServices) && parsedServices.map((s, idx) => (
                            <span key={idx} className="px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded text-[9px] font-bold">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-[11px] text-slate-800">{ord.incoming_material_desc}</div>
                        {ord.incoming_receipt_number && (
                          <div className="text-[10px] text-slate-400 font-mono">رسید ورود: {ord.incoming_receipt_number}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="font-mono font-bold text-slate-900">
                          {Number(ord.incoming_sheet_count || 0).toLocaleString('fa-IR')} شیت
                        </div>
                        {ord.completed_qty > 0 && (
                          <div className="text-[10px] text-emerald-700 font-bold">
                            تکمیل: {Number(ord.completed_qty).toLocaleString('fa-IR')}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-700">
                        {ord.die_status}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-slate-900">{Number(ord.total_amount || 0).toLocaleString('fa-IR')} ت</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          بیعانه: {Number(ord.paid_amount || 0).toLocaleString('fa-IR')} ت
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800 text-[11px]">{ord.operator_name || '-'}</div>
                        <div className="text-[10px] text-slate-500">{ord.delivered_date || 'در حال انجام'}</div>
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

      {/* MODAL: Status Color */}
      {showStatusModal && activeOrder && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900">تغییر وضعیت کار خدماتی</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedStatusColor('white')}
                className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 ${
                  selectedStatusColor === 'white' ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400' : 'bg-white border-slate-200'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-400" />
                <span>سفید (در صف)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatusColor('yellow')}
                className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 ${
                  selectedStatusColor === 'yellow' ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-400' : 'bg-white border-slate-200'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400" />
                <span>زرد (تسویه مالی)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatusColor('green')}
                className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 ${
                  selectedStatusColor === 'green' ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-400' : 'bg-white border-slate-200'
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

      {/* MODAL: New Toll Service Order */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">ثبت کار خدماتی و اجرتی جدید</h2>
                <p className="text-xs text-slate-500 mt-0.5">ثبت فرآیندهای پس از چاپ با مقوای تامین شده توسط مشتری</p>
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
                    placeholder="نام چاپخانه یا سفارش‌دهنده"
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
                    placeholder="دایکات و چسب جعبه خرما"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-2">عملیات خدماتی مورد تقاضا</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableServices.map((srv, idx) => {
                      const active = newOrder.service_types.includes(srv);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleServiceType(srv)}
                          className={`p-2 rounded-xl text-xs font-bold text-right border transition-all ${
                            active
                              ? 'bg-amber-100 border-amber-400 text-amber-950 font-black ring-1 ring-amber-400'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {srv}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تعداد شیت خام ورودی *</label>
                  <input
                    type="number"
                    required
                    value={newOrder.incoming_sheet_count}
                    onChange={(e) => setNewOrder({ ...newOrder, incoming_sheet_count: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">شماره رسید ورود بار</label>
                  <input
                    type="text"
                    value={newOrder.incoming_receipt_number}
                    onChange={(e) => setNewOrder({ ...newOrder, incoming_receipt_number: e.target.value })}
                    placeholder="REC-..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">وضعیت قالب تیغ</label>
                  <select
                    value={newOrder.die_status}
                    onChange={(e) => setNewOrder({ ...newOrder, die_status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="قالب در کارخانه موجود است">قالب در کارخانه موجود است</option>
                    <option value="قالب توسط همکار ارسال شده است">قالب توسط همکار ارسال شده است</option>
                    <option value="نیاز به ساخت قالب جدید لیرزی">نیاز به ساخت قالب جدید لیزری</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مبلغ کل کارمزد (تومان)</label>
                  <input
                    type="number"
                    value={newOrder.total_amount}
                    onChange={(e) => setNewOrder({ ...newOrder, total_amount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">شرح متریال ارسالی مشتری</label>
                <input
                  type="text"
                  value={newOrder.incoming_material_desc}
                  onChange={(e) => setNewOrder({ ...newOrder, incoming_material_desc: e.target.value })}
                  placeholder="مقوای شیت شده یا لمینت شده، ابعاد و نکات خاص"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 bg-slate-100 rounded-xl text-xs font-bold">انصراف</button>
                <button type="submit" className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20">ثبت کار خدماتی</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
