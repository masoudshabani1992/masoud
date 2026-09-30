import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  Settings,
  Plus,
  Trash2,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Package,
  Layers,
  Sparkles,
  Zap,
  Eye,
  Sliders,
  Save,
  Check,
  X,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Search
} from 'lucide-react';

const CATEGORY_TABS = [
  { id: 'all', label: 'همه بخش‌ها', icon: Layers, color: 'text-indigo-600' },
  { id: 'cardboard', label: 'مقوا و متریال', icon: Package, color: 'text-amber-600' },
  { id: 'print', label: 'چاپ و زینک', icon: Layers, color: 'text-blue-600' },
  { id: 'coating', label: 'روکش‌های سطح', icon: Sparkles, color: 'text-purple-600' },
  { id: 'special_effects', label: 'افکت‌های خاص و طلاکوب', icon: Zap, color: 'text-rose-600' },
  { id: 'window_glue', label: 'طلق، پنجره و چسب', icon: Eye, color: 'text-cyan-600' }
];

export default function FormOptionsManagerView({ onNavigateToMarketing }) {
  const { currentUser, role } = useAuth();
  const isAdmin = currentUser?.role === 'admin' || role === 'admin';

  const [activeCategory, setActiveCategory] = useState('all');
  const [optionsMap, setOptionsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [newItemInputs, setNewItemInputs] = useState({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Load options from backend
  const fetchOptions = async () => {
    setLoading(true);
    try {
      const res = await api.getFormOptions();
      if (res && res.success && res.options) {
        setOptionsMap(res.options);
      }
    } catch (err) {
      console.error('Error fetching form options:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const showToast = (msg) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Add Item to a specific option key
  const handleAddItem = (key) => {
    const val = (newItemInputs[key] || '').trim();
    if (!val) return;

    const currentOpt = optionsMap[key] || { key, items: [] };
    const currentItems = Array.isArray(currentOpt.items) ? [...currentOpt.items] : [];

    // Parse as number if key is grammages and value is numeric
    let itemToPush = val;
    if (key === 'grammages' && !isNaN(Number(val))) {
      itemToPush = Number(val);
    }

    if (currentItems.includes(itemToPush)) {
      alert('این گزینه قبلاً در لیست موجود است.');
      return;
    }

    currentItems.push(itemToPush);
    const updated = {
      ...optionsMap,
      [key]: {
        ...currentOpt,
        items: currentItems
      }
    };

    setOptionsMap(updated);
    setNewItemInputs(prev => ({ ...prev, [key]: '' }));

    // Auto save to server
    saveSingleOption(key, currentItems, currentOpt.title, currentOpt.category);
  };

  // Remove Item from a specific option key
  const handleRemoveItem = (key, itemIndex) => {
    const currentOpt = optionsMap[key];
    if (!currentOpt || !Array.isArray(currentOpt.items)) return;

    const currentItems = currentOpt.items.filter((_, idx) => idx !== itemIndex);
    const updated = {
      ...optionsMap,
      [key]: {
        ...currentOpt,
        items: currentItems
      }
    };

    setOptionsMap(updated);
    // Auto save to server
    saveSingleOption(key, currentItems, currentOpt.title, currentOpt.category);
  };

  // Save a single option key to backend
  const saveSingleOption = async (key, items, title, category) => {
    setSavingKey(key);
    try {
      const res = await api.updateFormOption(key, { items, title, category });
      if (res && res.success) {
        showToast(`گزینه‌های «${title || key}» با موفقیت ذخیره شدند.`);
      }
    } catch (err) {
      alert('خطا در ذخیره تغییرات: ' + (err.message || 'خطای سرور'));
    } finally {
      setSavingKey(null);
    }
  };

  // Reset all options to factory defaults
  const handleResetToDefaults = async () => {
    setResetting(true);
    try {
      const res = await api.resetFormOptions();
      if (res && res.success) {
        showToast('تمامی فیلدها و گزینه‌های فرم استعلام به مقادیر پیش‌فرض کارخانه بازنشانی شدند.');
        fetchOptions();
        setShowResetConfirm(false);
      }
    } catch (err) {
      alert('خطا در بازنشانی: ' + (err.message || 'خطای سرور'));
    } finally {
      setResetting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-rose-200 space-y-4 max-w-lg mx-auto my-12" dir="rtl">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-black text-slate-800">شما مجاز به دسترسی به این صفحه نیستید</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          مدیریت داینامیک فیلدها، دسته‌بندی‌ها و ویژگی‌های فنی فرم استعلام انحصاراً در اختیار مدیر ارشد سیستم (Admin) است.
        </p>
      </div>
    );
  }

  // Filter keys based on active category & search
  const optionEntries = Object.entries(optionsMap).filter(([key, opt]) => {
    const matchesCategory = activeCategory === 'all' || opt.category === activeCategory;
    const matchesSearch = !searchTerm.trim() ||
      (opt.title && opt.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (Array.isArray(opt.items) && opt.items.some(item => String(item).toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-emerald-300 border border-emerald-500/40 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-black animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/40 text-cyan-400 border border-indigo-500/30 flex items-center justify-center shadow-lg">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black">مدیریت فیلدها و گزینه‌های فرم استعلام</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  پنل ادمین
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                شخصی‌سازی، حذف، ویرایش و افزودن متریال، مقوا، روش‌های چاپ، روکش‌ها، یووی، طلق، چسب و فویل فرم بازاریاب
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {onNavigateToMarketing && (
            <button
              onClick={onNavigateToMarketing}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <ArrowRight className="w-4 h-4" />
              <span>مشاهده فرم بازاریاب</span>
            </button>
          )}

          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>بازنشانی پیش‌فرض کارخانه</span>
          </button>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
        
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORY_TABS.map((tab) => {
            const IconComp = tab.icon;
            const isSel = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  isSel
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-black'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 ${isSel ? 'text-white' : tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="جستجو در گزینه‌ها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Options Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-3 bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
          <p className="text-xs font-bold">در حال بارگذاری گزینه‌های فرم استعلام...</p>
        </div>
      ) : optionEntries.length === 0 ? (
        <div className="p-12 text-center text-slate-400 space-y-3 bg-white rounded-3xl border border-slate-200">
          <AlertTriangle className="w-8 h-8 mx-auto text-amber-500" />
          <p className="text-xs font-bold">گزینه‌ای با عبارت جستجو شده یافت نشد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {optionEntries.map(([key, opt]) => {
            const items = Array.isArray(opt.items) ? opt.items : [];
            const isSaving = savingKey === key;
            const currentInputVal = newItemInputs[key] || '';

            return (
              <div
                key={key}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                {/* Card Header */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      <h3 className="text-xs font-black text-slate-900">{opt.title || key}</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                      {items.length} گزینه
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    کلید سیستمی: <span className="text-indigo-600 font-bold">{key}</span>
                  </p>
                </div>

                {/* Tags / Pills Display */}
                <div className="flex flex-wrap gap-1.5 min-h-[70px] max-h-[140px] overflow-y-auto p-2 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white hover:bg-rose-50 text-slate-800 hover:text-rose-900 border border-slate-200 hover:border-rose-300 text-[11px] font-bold shadow-2xs transition"
                    >
                      <span>{String(item)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(key, idx)}
                        title="حذف این گزینه"
                        className="text-slate-400 hover:text-rose-600 p-0.5 rounded-full transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <span className="text-[11px] text-slate-400 italic m-auto">هیچ گزینه‌ای ثبت نشده است</span>
                  )}
                </div>

                {/* Add New Item Input */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <input
                      type={key === 'grammages' ? 'number' : 'text'}
                      placeholder={key === 'grammages' ? 'گرماژ جدید (مثال: 320)' : 'افزودن گزینه جدید...'}
                      value={currentInputVal}
                      onChange={(e) => setNewItemInputs(prev => ({ ...prev, [key]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddItem(key);
                        }
                      }}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddItem(key)}
                      disabled={!currentInputVal.trim()}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>افزودن</span>
                    </button>
                  </div>

                  {isSaving && (
                    <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 font-bold justify-end animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>در حال ذخیره‌سازی...</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in select-none" dir="rtl">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 text-center space-y-4 shadow-2xl border border-rose-200 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-900">بازنشانی تمامی فیلدها به پیش‌فرض کارخانه</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              آیا از بازنشانی تمامی گزینه‌ها (انواع مقوا، چاپ، روکش‌ها، یووی، طلق و چسب) به مقادیر پیش‌فرض اولیه شرکت آرمان امیران اطمینان دارید؟ تغییرات اختصاصی قبلی پاک خواهند شد.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleResetToDefaults}
                disabled={resetting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs shadow-md shadow-rose-600/25 flex items-center gap-1.5 transition disabled:opacity-50"
              >
                {resetting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                <span>بله، بازنشانی به پیش‌فرض</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
