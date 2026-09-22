import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Printer,
  ChevronDown,
  RefreshCw,
  Box,
  CreditCard,
  Building2,
  Calendar,
  Sparkles,
  ArrowUpDown,
  FileText,
  Scissors,
  X,
  Check,
  Tag,
  PhoneCall
} from 'lucide-react';

export default function ProductionOrderView({ onOpenNewProject }) {
  const { currentUser, role } = useAuth();
  const [orders, setOrders] = useState([]);
  const [counts, setCounts] = useState({ white: 0, yellow: 0, green: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activeOrderForStatus, setActiveOrderForStatus] = useState(null);
  const [statusForm, setStatusForm] = useState({ status_color: 'white', financial_status: '', financial_notes: '' });
  const [printOrder, setPrintOrder] = useState(null);

  // New Order Form State
  const [newOrder, setNewOrder] = useState({
    order_code: '',
    archive_code: '',
    customer_name: '',
    customer_phone: '',
    product_title: '',
    order_category: 'offset',
    quantity: 5000,
    box_type: 'جعبه مقوایی دارویی / بهداشتی',
    material: 'ایندربرد بهداشتی (FBB)',
    grammage: 300,
    sheet_size: '70x100',
    sheet_count: 5000,
    zinc_count: 4,
    coating_type: 'سلفون مات حرارتی',
    diecut_type: 'دایکات لترپرس',
    gluing_type: 'لب‌چسب اتوماتیک',
    status_color: 'white',
    financial_status: 'در انتظار بیعانه',
    financial_notes: '',
    total_price: '',
    paid_amount: '',
    delivery_deadline: '',
    assigned_machine: 'افست هایدلبرگ ۵ رنگ CD 102',
    production_notes: ''
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getProductionOrders({
        color: selectedColor,
        category: selectedCategory,
        search: searchQuery
      });
      setOrders(res.orders || []);
      if (res.counts) setCounts(res.counts);
    } catch (err) {
      console.error('Error fetching production orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedColor, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleOpenStatusModal = (order) => {
    setActiveOrderForStatus(order);
    setStatusForm({
      status_color: order.status_color,
      financial_status: order.financial_status || '',
      financial_notes: order.financial_notes || ''
    });
    setShowStatusModal(true);
  };

  const handleQuickColorChange = async (order, newColor) => {
    try {
      await api.updateProductionOrderStatusColor(order.id, {
        status_color: newColor,
        financial_status: newColor === 'green' ? 'تسویه کامل' : newColor === 'yellow' ? 'پرونده در دست مالی' : 'در حال تولید سالن'
      });
      fetchOrders();
    } catch (err) {
      alert('خطا در تغییر وضعیت: ' + err.message);
    }
  };

  const handleSaveStatus = async () => {
    if (!activeOrderForStatus) return;
    try {
      await api.updateProductionOrderStatusColor(activeOrderForStatus.id, statusForm);
      setShowStatusModal(false);
      fetchOrders();
    } catch (err) {
      alert('خطا در تغییر وضعیت: ' + err.message);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      await api.createProductionOrder(newOrder);
      setShowNewModal(false);
      fetchOrders();
      alert('دستور تولید با موفقیت صادر شد.');
    } catch (err) {
      alert('خطا در ثبت دستور تولید: ' + err.message);
    }
  };

  const handleExportExcel = () => {
    window.open('/api/production-orders/export-excel', '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 -translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 translate-x-12 translate-y-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Layers className="w-3.5 h-3.5" />
              <span>کارتابل تخصصی دستور تولید و کنترل سالن</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>دستور تولید کارخانه جعبه‌سازی</span>
              <span className="text-xs px-2.5 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 rounded-lg font-bold">
                استودیو طراحی امیران
              </span>
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              مدیریت تفکیکی سفارشات در ۳ رنگ اختصاصی: <span className="text-white font-bold underline">سفید (صف تولید)</span>، <span className="text-amber-300 font-bold underline">زرد (پرونده در دست مالی)</span> و <span className="text-emerald-300 font-bold underline">سبز (تکمیل شده و بایگانی)</span> به همراه تفکیک بخش‌های <span className="text-purple-300 font-bold">دیجیتال</span> و <span className="text-amber-300 font-bold">خدماتی (دایکات/سلفون)</span> و خروجی فایل اکسل ۳ شیت.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportExcel}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-2 border border-emerald-400/30"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>دانلود فایل اکسل ۳ شیت (سفید/زرد/سبز)</span>
            </button>

            <button
              onClick={() => setShowNewModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-black text-xs sm:text-sm shadow-lg shadow-amber-900/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>صدور دستور تولید جدید</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Color Cartable Interactive Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* White: صف تولید */}
        <button
          onClick={() => setSelectedColor(selectedColor === 'white' ? 'all' : 'white')}
          className={`p-5 rounded-2xl border transition-all text-right flex items-center justify-between ${
            selectedColor === 'white'
              ? 'bg-white border-indigo-500 shadow-xl ring-4 ring-indigo-500/20 scale-[1.02]'
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
                <h3 className="font-black text-slate-900 text-base">صف تولید کارخانه (سفید)</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">سفارش‌های در حال چاپ، لامینت، دایکات و جعبه‌چسبانی</p>
            </div>
          </div>
          <span className="text-2xl font-black text-slate-800 font-mono px-3 py-1 bg-slate-100 rounded-xl border border-slate-200">
            {counts.white}
          </span>
        </button>

        {/* Yellow: پرونده در دست مالی */}
        <button
          onClick={() => setSelectedColor(selectedColor === 'yellow' ? 'all' : 'yellow')}
          className={`p-5 rounded-2xl border transition-all text-right flex items-center justify-between ${
            selectedColor === 'yellow'
              ? 'bg-amber-50 border-amber-500 shadow-xl ring-4 ring-amber-500/20 scale-[1.02]'
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
                <h3 className="font-black text-amber-950 text-base">پرونده در دست مالی (زرد)</h3>
              </div>
              <p className="text-xs text-amber-700 mt-1">منتظر واریز بیعانه، تسویه فاکتور یا چک وصولی</p>
            </div>
          </div>
          <span className="text-2xl font-black text-amber-800 font-mono px-3 py-1 bg-amber-100 rounded-xl border border-amber-200">
            {counts.yellow}
          </span>
        </button>

        {/* Green: تکمیل شده و بایگانی */}
        <button
          onClick={() => setSelectedColor(selectedColor === 'green' ? 'all' : 'green')}
          className={`p-5 rounded-2xl border transition-all text-right flex items-center justify-between ${
            selectedColor === 'green'
              ? 'bg-emerald-50 border-emerald-500 shadow-xl ring-4 ring-emerald-500/20 scale-[1.02]'
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
                <h3 className="font-black text-emerald-950 text-base">تکمیل شده و بایگانی (سبز)</h3>
              </div>
              <p className="text-xs text-emerald-700 mt-1">تولید اتمام یافته، تسویه کامل و تحویل مشتری شده</p>
            </div>
          </div>
          <span className="text-2xl font-black text-emerald-800 font-mono px-3 py-1 bg-emerald-100 rounded-xl border border-emerald-200">
            {counts.green}
          </span>
        </button>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            همه بخش‌ها ({counts.total})
          </button>
          
          <button
            onClick={() => setSelectedCategory('offset')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === 'offset'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>چاپ افست و جعبه‌سازی</span>
          </button>

          <button
            onClick={() => setSelectedCategory('digital')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === 'digital'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>چاپ دیجیتال (دستگاه‌های دیجیتال)</span>
          </button>

          <button
            onClick={() => setSelectedCategory('service')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === 'service'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>کارهای خدماتی (دایکات / سلفون با مقوای مشتری)</span>
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو در مشتری، عنوان، کد سفارش..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all"
          >
            جستجو
          </button>
          {selectedColor !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedColor('all')}
              className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
              title="نمایش همه رنگ‌ها"
            >
              همه رنگ‌ها
            </button>
          )}
        </form>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-bold">در حال بارگذاری دستورات تولید...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center space-y-3 text-slate-400">
            <Box className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
            <p className="text-base font-bold text-slate-600">هیچ سفارش یا دستور تولیدی با این فیلتر یافت نشد.</p>
            <p className="text-xs text-slate-400">می‌توانید با دکمه بالا یک دستور تولید جدید صادر نمایید.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-200 font-bold border-b border-slate-800 text-[11px] select-none">
                  <th className="py-3 px-3 text-center w-28">وضعیت رنگ کارتابل</th>
                  <th className="py-3 px-3">کد سفارش / بایگانی</th>
                  <th className="py-3 px-3">مشتری و تماس</th>
                  <th className="py-3 px-3">نام سفارش و محصول</th>
                  <th className="py-3 px-3 text-center">نوع و تیراژ</th>
                  <th className="py-3 px-3">جنس، گراماژ و سایز</th>
                  <th className="py-3 px-3">پوشش، دایکات و اتصال</th>
                  <th className="py-3 px-3">وضعیت مالی و حسابداری</th>
                  <th className="py-3 px-3">مهلت تحویل و ماشین</th>
                  <th className="py-3 px-3 text-center">عملیات کارگاه</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {orders.map((ord, idx) => {
                  let rowBg = 'hover:bg-slate-50/80';
                  let statusBadge = (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-300 text-[11px] font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-slate-400" />
                      <span>صف تولید</span>
                    </span>
                  );

                  if (ord.status_color === 'yellow') {
                    rowBg = 'bg-amber-50/40 hover:bg-amber-50';
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span>پرونده مالی</span>
                      </span>
                    );
                  } else if (ord.status_color === 'green') {
                    rowBg = 'bg-emerald-50/40 hover:bg-emerald-50';
                    statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span>تکمیل و بایگانی</span>
                      </span>
                    );
                  }

                  return (
                    <tr key={ord.id} className={`transition-colors ${rowBg}`}>
                      {/* Status Color Badge with Quick Toggle */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <button
                            onClick={() => handleOpenStatusModal(ord)}
                            className="cursor-pointer hover:opacity-80 transition"
                            title="کلیک جهت ویرایش وضعیت مالی و رنگ"
                          >
                            {statusBadge}
                          </button>

                          {/* Quick 3-color pills */}
                          <div className="flex items-center gap-1 bg-white/80 p-0.5 rounded-full border border-slate-200">
                            <button
                              onClick={() => handleQuickColorChange(ord, 'white')}
                              className={`w-3.5 h-3.5 rounded-full border transition-all ${
                                ord.status_color === 'white' ? 'ring-2 ring-indigo-500 bg-white border-slate-400 scale-110' : 'bg-slate-200 border-slate-300 hover:bg-white'
                              }`}
                              title="تغییر سریع به سفید (صف تولید)"
                            />
                            <button
                              onClick={() => handleQuickColorChange(ord, 'yellow')}
                              className={`w-3.5 h-3.5 rounded-full border transition-all ${
                                ord.status_color === 'yellow' ? 'ring-2 ring-amber-500 bg-amber-400 border-amber-500 scale-110' : 'bg-amber-200 border-amber-300 hover:bg-amber-400'
                              }`}
                              title="تغییر سریع به زرد (پرونده مالی)"
                            />
                            <button
                              onClick={() => handleQuickColorChange(ord, 'green')}
                              className={`w-3.5 h-3.5 rounded-full border transition-all ${
                                ord.status_color === 'green' ? 'ring-2 ring-emerald-500 bg-emerald-500 border-emerald-600 scale-110' : 'bg-emerald-200 border-emerald-300 hover:bg-emerald-500'
                              }`}
                              title="تغییر سریع به سبز (تکمیل و بایگانی)"
                            />
                          </div>
                        </div>
                      </td>

                      {/* Order & Archive Code */}
                      <td className="py-3 px-3 font-mono">
                        <div className="font-bold text-slate-900">{ord.order_code}</div>
                        <div className="text-[10px] text-slate-400">بایگانی: {ord.archive_code}</div>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ord.customer_name}</span>
                        </div>
                        {ord.customer_phone && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5" dir="ltr">
                            {ord.customer_phone}
                          </div>
                        )}
                      </td>

                      {/* Title & Product */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-indigo-950 text-xs">{ord.product_title}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{ord.box_type || 'جعبه سفارشی'}</div>
                      </td>

                      {/* Category & Quantity */}
                      <td className="py-3 px-3 text-center">
                        <div className="font-black text-slate-900 font-mono text-xs">
                          {Number(ord.quantity).toLocaleString('fa-IR')} عدد
                        </div>
                        <span className={`inline-block mt-0.5 text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          ord.order_category === 'offset'
                            ? 'bg-indigo-100 text-indigo-800'
                            : ord.order_category === 'digital'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.order_category === 'offset' ? 'افست' : ord.order_category === 'digital' ? 'دیجیتال' : 'خدماتی'}
                        </span>
                      </td>

                      {/* Material & Sheet */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{ord.material || '-'}</div>
                        <div className="text-[10px] text-slate-500">
                          {ord.grammage ? `${ord.grammage} گرم` : ''} {ord.sheet_size ? `| شیت: ${ord.sheet_size}` : ''}
                        </div>
                      </td>

                      {/* Finishing & Die-cutting */}
                      <td className="py-3 px-3">
                        <div className="text-[11px] text-slate-800">{ord.coating_type || 'بدون روکش'}</div>
                        <div className="text-[10px] text-slate-500">
                          {ord.diecut_type || '-'} | {ord.gluing_type || '-'}
                        </div>
                      </td>

                      {/* Financial Status */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-xs">
                          {ord.financial_status === 'تسویه کامل' ? (
                            <span className="text-emerald-700 font-black">تسویه کامل</span>
                          ) : ord.financial_status === 'بیعانه دریافت شد' ? (
                            <span className="text-indigo-700">بیعانه واریز شد</span>
                          ) : (
                            <span className="text-amber-800">{ord.financial_status || 'در انتظار واریز'}</span>
                          )}
                        </div>
                        {ord.total_price > 0 && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            کل: {Number(ord.total_price).toLocaleString('fa-IR')} ت
                          </div>
                        )}
                      </td>

                      {/* Delivery & Machine */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{ord.delivery_deadline || 'مشخص نشده'}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                          {ord.assigned_machine || '-'}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setPrintOrder(ord)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-all border border-slate-300 flex items-center gap-1"
                            title="چاپ برگه دستور کارگاهی"
                          >
                            <Printer className="w-3 h-3" />
                            <span>چاپ حواله</span>
                          </button>

                          <button
                            onClick={() => handleOpenStatusModal(ord)}
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold transition-all border border-indigo-200 flex items-center gap-1"
                            title="تغییر وضعیت رنگ و مالی"
                          >
                            <ArrowUpDown className="w-3 h-3" />
                            <span>ویرایش</span>
                          </button>
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

      {/* MODAL: Printable Workshop Job Ticket */}
      {printOrder && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6">
            {/* Modal Controls */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 no-print">
              <span className="text-sm font-bold text-slate-700">پیش‌نمایش برگه دستور کارگاه چاپ و جعبه‌سازی</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>چاپ سند</span>
                </button>
                <button
                  onClick={() => setPrintOrder(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  بستن
                </button>
              </div>
            </div>

            {/* A4 Sheet Preview */}
            <div className="border-2 border-slate-800 p-6 rounded-2xl space-y-5 bg-white text-slate-900" dir="rtl">
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-black">شرکت صنایع بسته‌بندی آرمان امیران</h2>
                  <p className="text-xs text-slate-600">برگه رسمی دستور تولید و کنترل فرآیند کارگاهی</p>
                </div>
                <div className="text-left font-mono text-xs space-y-0.5" dir="ltr">
                  <div><strong>ORDER:</strong> #{printOrder.order_code}</div>
                  <div><strong>ARCHIVE:</strong> #{printOrder.archive_code}</div>
                  <div><strong>DATE:</strong> 1405/01/15</div>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div><span className="text-slate-500">نام مشتری:</span> <strong>{printOrder.customer_name}</strong></div>
                  <div><span className="text-slate-500">عنوان محصول:</span> <strong>{printOrder.product_title}</strong></div>
                  <div><span className="text-slate-500">نوع سفارش:</span> <strong>{printOrder.order_category === 'offset' ? 'افست' : printOrder.order_category === 'digital' ? 'دیجیتال' : 'خدمات کارمزدی'}</strong></div>
                  <div><span className="text-slate-500">تیراژ تحویلی:</span> <strong className="font-mono text-indigo-700 text-sm">{Number(printOrder.quantity).toLocaleString('fa-IR')} عدد</strong></div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div><span className="text-slate-500">جنس و گراماژ:</span> <strong>{printOrder.material || '-'} ({printOrder.grammage || '-'}g)</strong></div>
                  <div><span className="text-slate-500">سایز و تعداد شیت:</span> <strong>{printOrder.sheet_size || '-'} ({printOrder.sheet_count || '-'} شیت)</strong></div>
                  <div><span className="text-slate-500">روکش و سلفون:</span> <strong>{printOrder.coating_type || 'بدون روکش'}</strong></div>
                  <div><span className="text-slate-500">دایکات و اتصال:</span> <strong>{printOrder.diecut_type || '-'} | {printOrder.gluing_type || '-'}</strong></div>
                </div>
              </div>

              {/* Machine & Production Notes */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
                <div><strong>ماشین اختصاص‌یافته:</strong> {printOrder.assigned_machine || 'سالن چاپ افست'}</div>
                <div><strong>مهلت تحویل به مشتری:</strong> {printOrder.delivery_deadline || 'فوری'}</div>
                {printOrder.production_notes && (
                  <div><strong>ملاحظات فنی تولید:</strong> {printOrder.production_notes}</div>
                )}
              </div>

              {/* Signature Boxes */}
              <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-300 text-center text-[10px] text-slate-500">
                <div className="p-2 border border-slate-300 rounded-lg h-16 flex flex-col justify-between">
                  <span>سرپرست سالن چاپ</span>
                  <span className="text-slate-300">امضا و تاریخ</span>
                </div>
                <div className="p-2 border border-slate-300 rounded-lg h-16 flex flex-col justify-between">
                  <span>اپراتور لامینت / سلفون</span>
                  <span className="text-slate-300">امضا و تاریخ</span>
                </div>
                <div className="p-2 border border-slate-300 rounded-lg h-16 flex flex-col justify-between">
                  <span>اپراتور دایکات و تیغ</span>
                  <span className="text-slate-300">امضا و تاریخ</span>
                </div>
                <div className="p-2 border border-slate-300 rounded-lg h-16 flex flex-col justify-between">
                  <span>کنترل کیفیت نهایی (QC)</span>
                  <span className="text-slate-300">امضا و تایید</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Change Status Color & Financial Notes */}
      {showStatusModal && activeOrderForStatus && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">تغییر وضعیت کارتابل و مالی</h3>
              <span className="text-xs font-mono font-bold text-slate-500">کد: {activeOrderForStatus.order_code}</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">رنگ وضعیت کارتابل</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatusForm({ ...statusForm, status_color: 'white' })}
                    className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                      statusForm.status_color === 'white'
                        ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white border-2 border-slate-400" />
                    <span>سفید (صف تولید)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusForm({ ...statusForm, status_color: 'yellow' })}
                    className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                      statusForm.status_color === 'yellow'
                        ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-400 text-amber-950'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-amber-400" />
                    <span>زرد (پرونده مالی)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusForm({ ...statusForm, status_color: 'green' })}
                    className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                      statusForm.status_color === 'green'
                        ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-400 text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-emerald-500" />
                    <span>سبز (تکمیل بایگانی)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">وضعیت مالی و حسابداری</label>
                <select
                  value={statusForm.financial_status}
                  onChange={(e) => setStatusForm({ ...statusForm, financial_status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                >
                  <option value="در انتظار پیش‌پرداخت">در انتظار پیش‌پرداخت (بیعانه)</option>
                  <option value="بیعانه دریافت شد">بیعانه دریافت شد</option>
                  <option value="چک دریافت شد (در انتظار وصول)">چک دریافت شد (در انتظار سررسید)</option>
                  <option value="تسویه کامل">تسویه کامل (حساب تسویه)</option>
                  <option value="حساب دفتری / مشتری اعتباری">حساب دفتری / مشتری اعتباری</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">توضیحات مالی یا تولید</label>
                <textarea
                  rows={2}
                  value={statusForm.financial_notes}
                  onChange={(e) => setStatusForm({ ...statusForm, financial_notes: e.target.value })}
                  placeholder="مثال: شماره چک، تاریخ وصول، شماره فیش واریزی..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleSaveStatus}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
              >
                ذخیره وضعیت
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: New Production Order Form */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scaleUp space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">صدور دستور تولید کارخانه جعبه‌سازی</h2>
                <p className="text-xs text-slate-500 mt-0.5">ثبت مستقیم اطلاعات فنی در کارتابل سالن تولید</p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
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
                    placeholder="مثال: شرکت صنایع دارویی سینا"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">شماره تماس مشتری</label>
                  <input
                    type="text"
                    value={newOrder.customer_phone}
                    onChange={(e) => setNewOrder({ ...newOrder, customer_phone: e.target.value })}
                    placeholder="۰۹۱۲..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-indigo-500 focus:outline-none font-mono text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">عنوان سفارش / نام جعبه *</label>
                  <input
                    type="text"
                    required
                    value={newOrder.product_title}
                    onChange={(e) => setNewOrder({ ...newOrder, product_title: e.target.value })}
                    placeholder="مثال: جعبه کرم مرطوب‌کننده ۵۰ میل"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع سفارش *</label>
                  <select
                    value={newOrder.order_category}
                    onChange={(e) => setNewOrder({ ...newOrder, order_category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                  >
                    <option value="offset">چاپ افست و جعبه‌سازی</option>
                    <option value="digital">چاپ دیجیتال (دستگاه‌های دیجیتال)</option>
                    <option value="service">کارهای خدماتی (دایکات/سلفون با متریال مشتری)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تیراژ سفارش (عدد) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">جنس مقوا / کاغذ</label>
                  <input
                    type="text"
                    value={newOrder.material}
                    onChange={(e) => setNewOrder({ ...newOrder, material: e.target.value })}
                    placeholder="ایندربرد بهداشتی / پشت طوسی / کرافت / ارسالی مشتری"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">گراماژ (gsm)</label>
                  <input
                    type="number"
                    value={newOrder.grammage}
                    onChange={(e) => setNewOrder({ ...newOrder, grammage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سایز شیت و تعداد شیت</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newOrder.sheet_size}
                      onChange={(e) => setNewOrder({ ...newOrder, sheet_size: e.target.value })}
                      placeholder="سایز: 70x100"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                    />
                    <input
                      type="number"
                      value={newOrder.sheet_count}
                      onChange={(e) => setNewOrder({ ...newOrder, sheet_count: e.target.value })}
                      placeholder="تعداد شیت"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع پوشش و سلفون</label>
                  <input
                    type="text"
                    value={newOrder.coating_type}
                    onChange={(e) => setNewOrder({ ...newOrder, coating_type: e.target.value })}
                    placeholder="سلفون مات حرارتی / براق / یووی موضعی"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">عملیات دایکات و اتصال</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newOrder.diecut_type}
                      onChange={(e) => setNewOrder({ ...newOrder, diecut_type: e.target.value })}
                      placeholder="دایکات بابست / لترپرس"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={newOrder.gluing_type}
                      onChange={(e) => setNewOrder({ ...newOrder, gluing_type: e.target.value })}
                      placeholder="لب‌چسب اتوماتیک"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رنگ اولیه کارتابل</label>
                  <select
                    value={newOrder.status_color}
                    onChange={(e) => setNewOrder({ ...newOrder, status_color: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
                  >
                    <option value="white">سفید (صف تولید کارخانه)</option>
                    <option value="yellow">زرد (پرونده در دست مالی)</option>
                    <option value="green">سبز (تکمیل شده و بایگانی)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ماشین چاپ / تولید اختصاص یافته</label>
                  <input
                    type="text"
                    value={newOrder.assigned_machine}
                    onChange={(e) => setNewOrder({ ...newOrder, assigned_machine: e.target.value })}
                    placeholder="افست ۵ رنگ هایدلبرگ CD 102"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20"
                >
                  ثبت و صدور دستور تولید
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
