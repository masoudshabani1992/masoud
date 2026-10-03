import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Type,
  LayoutGrid,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Eye,
  Search,
  Sparkles,
  Layers,
  Users,
  Calculator,
  Kanban,
  Box,
  Fingerprint,
  Bell,
  Award,
  FileSpreadsheet,
  ShieldAlert,
  HardDrive,
  PackageCheck,
  Activity,
  Printer,
  ChevronRight,
  ExternalLink,
  Wand2,
  RefreshCw,
  X
} from 'lucide-react';
import { api } from '../api/client';
import { showToast } from '../utils/helpers';

export default function SystemCustomizerView({ onShowToast, currentUser }) {
  const notify = (msg, type = 'success') => {
    if (typeof onShowToast === 'function') {
      onShowToast(msg, type);
    } else {
      showToast(msg, { type });
    }
  };

  const [activeTab, setActiveTab] = useState('titles'); // 'titles' | 'features'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Titles state
  const [titles, setTitles] = useState({});
  const [editedTitles, setEditedTitles] = useState({});
  const [titleCategoryFilter, setTitleCategoryFilter] = useState('all');

  // Features state
  const [features, setFeatures] = useState([]);
  const [featureSearch, setFeatureSearch] = useState('');
  const [featureCategoryFilter, setFeatureCategoryFilter] = useState('all');
  
  // Modals
  const [showAddFeatureModal, setShowAddFeatureModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [newFeature, setNewFeature] = useState({
    id: '',
    name: '',
    title: '',
    description: '',
    category: 'marketing',
    icon: 'Sparkles',
    badge: 'جدید',
    color: 'emerald',
    is_enabled: 1,
    sort_order: 20
  });

  const categories = [
    { id: 'all', label: 'همه بخش‌ها' },
    { id: 'marketing', label: 'استعلام و بازاریابی' },
    { id: 'calculator', label: 'ماشین‌حساب و مالی' },
    { id: 'production', label: 'دستور تولید و کارگاه' },
    { id: 'warehouse', label: 'انبارداری متریال' },
    { id: 'workflow', label: 'گردش کار و کانبان' },
    { id: 'studio', label: 'استودیو و طراحی' },
    { id: 'ai', label: 'هوش مصنوعی' },
    { id: 'hr', label: 'منابع انسانی HR' },
    { id: 'branding', label: 'برندینگ و سربرگ' }
  ];

  const iconOptions = [
    { id: 'Sparkles', label: 'درخشش / هوش مصنوعی' },
    { id: 'Users', label: 'کاربران / بازاریابی' },
    { id: 'Calculator', label: 'ماشین‌حساب / مالی' },
    { id: 'Layers', label: 'لایه‌ها / چاپ و تولید' },
    { id: 'Kanban', label: 'کانبان / گردش کار' },
    { id: 'Box', label: 'جعبه / استودیو ۳D' },
    { id: 'PackageCheck', label: 'انبارداری / کارتن' },
    { id: 'Fingerprint', label: 'بیومتریک / امنیت' },
    { id: 'Bell', label: 'اعلان / پیام‌رسان' },
    { id: 'Award', label: 'ارزیابی / مدال' },
    { id: 'FileSpreadsheet', label: 'اکسل / داده‌ها' },
    { id: 'ShieldAlert', label: 'لاگ و ممیزی' },
    { id: 'Sliders', label: 'تنظیمات / اسلایدر' }
  ];

  const colorOptions = [
    { id: 'emerald', label: 'سبز زمردی (Emerald)', bg: 'bg-emerald-500', text: 'text-emerald-700' },
    { id: 'teal', label: 'فیروزه‌ای (Teal)', bg: 'bg-teal-500', text: 'text-teal-700' },
    { id: 'indigo', label: 'نیلی (Indigo)', bg: 'bg-indigo-500', text: 'text-indigo-700' },
    { id: 'purple', label: 'بنفش (Purple)', bg: 'bg-purple-500', text: 'text-purple-700' },
    { id: 'amber', label: 'کهربایی (Amber)', bg: 'bg-amber-500', text: 'text-amber-700' },
    { id: 'fuchsia', label: 'سرخابی (Fuchsia)', bg: 'bg-fuchsia-500', text: 'text-fuchsia-700' },
    { id: 'rose', label: 'رز (Rose)', bg: 'bg-rose-500', text: 'text-rose-700' },
    { id: 'cyan', label: 'آبی فیروزه‌ای (Cyan)', bg: 'bg-cyan-500', text: 'text-cyan-700' },
    { id: 'slate', label: 'خاکستری تیره (Slate)', bg: 'bg-slate-700', text: 'text-slate-700' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [titlesRes, featuresRes] = await Promise.all([
        api.getUiTitles().catch(() => ({ titles: {} })),
        api.getFeaturesConfig().catch(() => ({ features: [] }))
      ]);

      if (titlesRes?.titles) {
        setTitles(titlesRes.titles);
        setEditedTitles(JSON.parse(JSON.stringify(titlesRes.titles)));
      }

      if (Array.isArray(featuresRes?.features)) {
        setFeatures(featuresRes.features);
      }
    } catch (err) {
      console.error('Error loading customization data:', err);
      notify('خطا در بارگذاری داده‌های سفارشی‌سازی: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (key, field, value) => {
    setEditedTitles(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const handleSaveSingleTitle = async (key) => {
    const item = editedTitles[key];
    if (!item) return;

    setSaving(true);
    try {
      await api.updateUiTitle(key, {
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        category: item.category
      });

      setTitles(prev => ({ ...prev, [key]: item }));
      notify(`عنوان و متن بخش «${item.description || item.title}» با موفقیت ذخیره شد.`, 'success');
    } catch (err) {
      notify('خطا در ذخیره عنوان: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAllTitles = async () => {
    setSaving(true);
    try {
      await api.batchUpdateUiTitles(editedTitles);
      setTitles(JSON.parse(JSON.stringify(editedTitles)));
      notify('کلیه عناوین و متون بخش‌های سامانه با موفقیت در سیستم ذخیره شدند.', 'success');
    } catch (err) {
      notify('خطا در ذخیره دسته‌جمعی عناوین: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSingleTitle = (key) => {
    const orig = titles[key];
    if (!orig) return;
    setEditedTitles(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        title: orig.default_title || orig.title,
        subtitle: orig.default_subtitle || orig.subtitle
      }
    }));
  };

  const handleResetAllTitles = async () => {
    if (!window.confirm('آیا از بازنشانی کلیه عناوین و متون صفحات به تنظیمات پیش‌فرض کارخانه اطمینان دارید؟')) {
      return;
    }
    setSaving(true);
    try {
      await api.resetUiTitles();
      await loadData();
      notify('تمامی عناوین به متون پیش‌فرض کارخانه بازنشانی شدند.', 'success');
    } catch (err) {
      notify('خطا در بازنشانی عناوین: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFeature = async (id, currentName) => {
    try {
      const res = await api.toggleFeature(id);
      setFeatures(prev => prev.map(f => f.id === id ? { ...f, is_enabled: res.is_enabled } : f));
      notify(`قابلیت «${currentName}» با موفقیت ${res.is_enabled === 1 ? 'فعال' : 'غیرفعال'} شد.`, 'info');
    } catch (err) {
      notify('خطا در تغییر وضعیت قابلیت: ' + err.message, 'error');
    }
  };

  const handleDeleteFeature = async (id, name) => {
    if (!window.confirm(`آیا از حذف ماژول «${name}» اطمینان دارید؟`)) return;
    try {
      await api.deleteFeature(id);
      setFeatures(prev => prev.filter(f => f.id !== id));
      notify(`ماژول «${name}» با موفقیت حذف شد.`, 'success');
    } catch (err) {
      notify('خطا در حذف ماژول: ' + err.message, 'error');
    }
  };

  const handleSaveFeature = async (featureData) => {
    setSaving(true);
    try {
      await api.createOrUpdateFeature(featureData);
      await loadData();
      setShowAddFeatureModal(false);
      setEditingFeature(null);
      notify(`ماژول «${featureData.name}» با موفقیت ذخیره شد.`, 'success');
    } catch (err) {
      notify('خطا در ذخیره ماژول: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetFeatures = async () => {
    if (!window.confirm('آیا از بازنشانی کلیه قابلیت‌ها و ماژول‌ها به حالت اولیه کارخانه اطمینان دارید؟')) {
      return;
    }
    setSaving(true);
    try {
      await api.resetFeaturesConfig();
      await loadData();
      notify('لیست ماژول‌ها و قابلیت‌ها به حالت پیش‌فرض کارخانه بازنشانی شد.', 'success');
    } catch (err) {
      notify('خطا در بازنشانی ماژول‌ها: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'Users': return <Users className="w-5 h-5" />;
      case 'Calculator': return <Calculator className="w-5 h-5" />;
      case 'Layers': return <Layers className="w-5 h-5" />;
      case 'Kanban': return <Kanban className="w-5 h-5" />;
      case 'Box': return <Box className="w-5 h-5" />;
      case 'PackageCheck': return <PackageCheck className="w-5 h-5" />;
      case 'Fingerprint': return <Fingerprint className="w-5 h-5" />;
      case 'Bell': return <Bell className="w-5 h-5" />;
      case 'Award': return <Award className="w-5 h-5" />;
      case 'FileSpreadsheet': return <FileSpreadsheet className="w-5 h-5" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5" />;
      case 'Printer': return <Printer className="w-5 h-5" />;
      default: return <Sliders className="w-5 h-5" />;
    }
  };

  const filteredTitleKeys = Object.keys(editedTitles).filter(k => {
    if (titleCategoryFilter === 'all') return true;
    return editedTitles[k]?.category === titleCategoryFilter;
  });

  const filteredFeatures = features.filter(f => {
    const matchesCat = featureCategoryFilter === 'all' || f.category === featureCategoryFilter;
    const matchesSearch = !featureSearch.trim() || 
      (f.name && f.name.toLowerCase().includes(featureSearch.toLowerCase())) ||
      (f.title && f.title.toLowerCase().includes(featureSearch.toLowerCase())) ||
      (f.description && f.description.toLowerCase().includes(featureSearch.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-sm font-bold text-slate-600">در حال بارگذاری سیستم سفارشی‌سازی عناوین و ماژول‌ها...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-fade-in" dir="rtl">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl text-white">
        <div className="absolute top-0 left-0 -translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 translate-x-12 translate-y-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30">
              <Wand2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white">مدیریت عناوین، ماژول‌ها و قابلیت‌های سامانه</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  انحصاری مدیر ارشد سیستم
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-100/80 mt-1 max-w-2xl leading-relaxed">
                شخصی‌سازی زنده عناوین صفحات، زیرعنوان‌ها، متون راهنما، و همچنین کم و زیاد کردن، تغییر نام و فعال/غیرفعال‌سازی ماژول‌های سامانه ERP کارخانه
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {activeTab === 'titles' && (
              <button
                onClick={handleSaveAllTitles}
                disabled={saving}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'در حال ذخیره‌سازی...' : 'ذخیره کلیه عناوین'}</span>
              </button>
            )}

            {activeTab === 'features' && (
              <button
                onClick={() => {
                  setNewFeature({
                    id: `feat_${Date.now()}`,
                    name: '',
                    title: '',
                    description: '',
                    category: 'marketing',
                    icon: 'Sparkles',
                    badge: 'جدید',
                    color: 'indigo',
                    is_enabled: 1,
                    sort_order: features.length + 1
                  });
                  setShowAddFeatureModal(true);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ افزودن ماژول / قابلیت جدید</span>
              </button>
            )}

            <button
              onClick={activeTab === 'titles' ? handleResetAllTitles : handleResetFeatures}
              disabled={saving}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
              title="بازنشانی به تنظیمات پیش‌فرض کارخانه"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>بازنشانی پیش‌فرض</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Tab Navigation Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('titles')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
            activeTab === 'titles'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>۱. مدیریت عناوین، سربرگ‌ها و متون صفحات</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeTab === 'titles' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {Object.keys(editedTitles).length} بخش
          </span>
        </button>

        <button
          onClick={() => setActiveTab('features')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
            activeTab === 'features'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>۲. مدیریت ماژول‌ها و قابلیت‌های سامانه (کم و زیاد کردن)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeTab === 'features' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {features.length} ماژول
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EDIT PAGE TITLES & SUBTITLES                                       */}
      {/* ========================================================================= */}
      {activeTab === 'titles' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setTitleCategoryFilter(c.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  titleCategoryFilter === c.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Titles Grid */}
          <div className="grid grid-cols-1 gap-6">
            {filteredTitleKeys.map(key => {
              const item = editedTitles[key] || {};
              const original = titles[key] || {};
              const isModified = item.title !== original.title || item.subtitle !== original.subtitle;

              return (
                <div
                  key={key}
                  className={`bg-white rounded-3xl border ${
                    isModified ? 'border-indigo-400 ring-2 ring-indigo-50 shadow-md' : 'border-slate-200'
                  } p-6 space-y-5 transition-all`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                        <Type className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-800">{item.description || item.title || key}</h3>
                        <span className="text-[11px] font-mono text-slate-400">کلید سیستمی: {key}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isModified && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                          تغییرات ذخیره‌نشده
                        </span>
                      )}
                      <button
                        onClick={() => handleResetSingleTitle(key)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition text-xs flex items-center gap-1"
                        title="بازنشانی این بخش به متن پیش‌فرض"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold">پیش‌فرض</span>
                      </button>
                      <button
                        onClick={() => handleSaveSingleTitle(key)}
                        disabled={saving}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>ذخیره این بخش</span>
                      </button>
                    </div>
                  </div>

                  {/* Live Visual Preview Box */}
                  <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 p-4 text-white space-y-1.5 shadow-inner border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        پیش‌نمایش زنده در سامانه (Live Preview):
                      </span>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-400/30">
                        {item.category || 'عمومی'}
                      </span>
                    </div>
                    <h2 className="text-base font-black text-white">{item.title || '(بدون عنوان)'}</h2>
                    <p className="text-xs text-indigo-100/80 leading-relaxed max-w-3xl">
                      {item.subtitle || '(بدون توضیحات و زیرعنوان)'}
                    </p>
                  </div>

                  {/* Input Form Fields */}
                  <div className="grid grid-cols-1 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        عنوان اصلی صفحه / بخش (Title): <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) => handleTitleChange(key, 'title', e.target.value)}
                        placeholder="مثال: پروفایل و کارتابل پیگیری استعلامات بازاریاب"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-black text-slate-800 focus:outline-none focus:border-indigo-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        زیرعنوان و متن توضیحات کامل (Subtitle / Description):
                      </label>
                      <textarea
                        rows={2}
                        value={item.subtitle || ''}
                        onChange={(e) => handleTitleChange(key, 'subtitle', e.target.value)}
                        placeholder="مثال: سامانه رهگیری لحظه‌ای نتیجه استعلام‌ها، مشاهده قیمت‌های اعلام‌شده توسط واحد بازرگانی..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-indigo-500 text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FEATURES & MODULES MANAGER (کم و زیاد کردن قابلیت‌ها)              */}
      {/* ========================================================================= */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={featureSearch}
                onChange={(e) => setFeatureSearch(e.target.value)}
                placeholder="جستجو در نام و توضیحات ماژول‌ها..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-4 py-2 font-bold text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setFeatureCategoryFilter(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                    featureCategoryFilter === c.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredFeatures.map(feat => {
              const isEnabled = feat.is_enabled === 1 || feat.is_enabled === true;

              return (
                <div
                  key={feat.id}
                  className={`rounded-3xl border bg-white p-5 space-y-4 transition-all relative overflow-hidden flex flex-col justify-between ${
                    isEnabled ? 'border-slate-200 shadow-2xs hover:shadow-md' : 'border-slate-200 opacity-60 bg-slate-50/70'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md ${
                          feat.color === 'emerald' ? 'bg-gradient-to-tr from-emerald-500 to-teal-600' :
                          feat.color === 'teal' ? 'bg-gradient-to-tr from-teal-500 to-cyan-600' :
                          feat.color === 'indigo' ? 'bg-gradient-to-tr from-indigo-500 to-purple-600' :
                          feat.color === 'purple' ? 'bg-gradient-to-tr from-purple-500 to-pink-600' :
                          feat.color === 'amber' ? 'bg-gradient-to-tr from-amber-500 to-orange-600' :
                          feat.color === 'fuchsia' ? 'bg-gradient-to-tr from-fuchsia-500 to-rose-600' :
                          feat.color === 'rose' ? 'bg-gradient-to-tr from-rose-500 to-red-600' :
                          feat.color === 'cyan' ? 'bg-gradient-to-tr from-cyan-500 to-blue-600' :
                          'bg-gradient-to-tr from-slate-700 to-slate-900'
                        }`}>
                          {getIconComponent(feat.icon)}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-black text-slate-800">{feat.name}</h4>
                            {feat.badge && (
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                {feat.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-slate-400 block mt-0.5">{feat.title}</span>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        onClick={() => handleToggleFeature(feat.id, feat.name)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 shrink-0 ${
                          isEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                        title={isEnabled ? 'ماژول فعال است - کلیک جهت غیرفعال‌سازی' : 'ماژول غیرفعال است - کلیک جهت فعال‌سازی'}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                          isEnabled ? 'translate-x-0' : '-translate-x-5'
                        }`} />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {feat.description || 'بدون توضیحات تکمیلی'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-slate-400">شناسه: {feat.id}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingFeature(feat);
                        }}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="ویرایش مشخصات ماژول"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFeature(feat.id, feat.name)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        title="حذف ماژول"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT FEATURE                                                 */}
      {/* ========================================================================= */}
      {(showAddFeatureModal || editingFeature) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scale-up text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black">
                  <Sliders className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-800">
                  {editingFeature ? 'ویرایش مشخصات ماژول' : 'افزودن ماژول / قابلیت جدید به سامانه'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddFeatureModal(false);
                  setEditingFeature(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  نام اصلی قابلیت / ماژول: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingFeature ? editingFeature.name : newFeature.name}
                  onChange={(e) => {
                    if (editingFeature) setEditingFeature({ ...editingFeature, name: e.target.value });
                    else setNewFeature({ ...newFeature, name: e.target.value });
                  }}
                  placeholder="مثال: ماشین‌حساب برآورد قیمت پیشرفته"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 font-bold text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  عنوان فرعی / زیرعنوان:
                </label>
                <input
                  type="text"
                  value={editingFeature ? editingFeature.title : newFeature.title}
                  onChange={(e) => {
                    if (editingFeature) setEditingFeature({ ...editingFeature, title: e.target.value });
                    else setNewFeature({ ...newFeature, title: e.target.value });
                  }}
                  placeholder="مثال: فرمولاسیون دقیق بهای تمام‌شده و سود خالص"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 font-bold text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  توضیحات عملکرد قابلیت:
                </label>
                <textarea
                  rows={2}
                  value={editingFeature ? editingFeature.description : newFeature.description}
                  onChange={(e) => {
                    if (editingFeature) setEditingFeature({ ...editingFeature, description: e.target.value });
                    else setNewFeature({ ...newFeature, description: e.target.value });
                  }}
                  placeholder="توضیحات کوتاه در مورد این قابلیت..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 font-bold text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">دسته‌بندی:</label>
                  <select
                    value={editingFeature ? editingFeature.category : newFeature.category}
                    onChange={(e) => {
                      if (editingFeature) setEditingFeature({ ...editingFeature, category: e.target.value });
                      else setNewFeature({ ...newFeature, category: e.target.value });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {categories.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">آیکون:</label>
                  <select
                    value={editingFeature ? editingFeature.icon : newFeature.icon}
                    onChange={(e) => {
                      if (editingFeature) setEditingFeature({ ...editingFeature, icon: e.target.value });
                      else setNewFeature({ ...newFeature, icon: e.target.value });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {iconOptions.map(io => (
                      <option key={io.id} value={io.id}>{io.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رنگ زمینه:</label>
                  <select
                    value={editingFeature ? editingFeature.color : newFeature.color}
                    onChange={(e) => {
                      if (editingFeature) setEditingFeature({ ...editingFeature, color: e.target.value });
                      else setNewFeature({ ...newFeature, color: e.target.value });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {colorOptions.map(co => (
                      <option key={co.id} value={co.id}>{co.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">برچسب / بج (Badge):</label>
                  <input
                    type="text"
                    value={editingFeature ? editingFeature.badge : newFeature.badge}
                    onChange={(e) => {
                      if (editingFeature) setEditingFeature({ ...editingFeature, badge: e.target.value });
                      else setNewFeature({ ...newFeature, badge: e.target.value });
                    }}
                    placeholder="مثال: ویژه / ۳ رنگ"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowAddFeatureModal(false);
                  setEditingFeature(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={() => {
                  if (editingFeature) handleSaveFeature(editingFeature);
                  else handleSaveFeature(newFeature);
                }}
                disabled={saving}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'در حال ذخیره...' : 'ذخیره ماژول'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
