import React, { useState, useEffect } from 'react';
import {
  Type,
  Sliders,
  Upload,
  Save,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Eye,
  Plus,
  Layers,
  Sparkles,
  FileText,
  Percent,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Table,
  Check,
  AlertCircle,
  HelpCircle,
  Download,
  Info,
  RefreshCw,
  FolderOpen,
  ArrowRight
} from 'lucide-react';
import { useTypography, FONT_SIZE_PRESETS, FONT_FALLBACKS } from '../context/TypographyContext';
import { showToast } from '../utils/helpers';

export default function TypographySettingsView({ onBackToSettings }) {
  const {
    typography,
    fonts,
    loading,
    saving,
    isAdmin,
    saveTypography,
    resetTypography,
    uploadCustomFont,
    deleteCustomFont,
    previewTypography,
    cancelPreview,
    reload
  } = useTypography();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState('scale'); // 'scale' | 'fonts' | 'upload' | 'playground'

  // Working state copy for form editing
  const [formState, setFormState] = useState(typography);

  // Upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadFamily, setUploadFamily] = useState('');
  const [uploadCategory, setUploadCategory] = useState('persian');
  const [uploadPreviewText, setUploadPreviewText] = useState('بسته‌بندی و چاپ جعبه آرمان امیران ۱۴۰۵');
  const [uploading, setUploading] = useState(false);

  // Playground interactive test text
  const [playgroundText, setPlaygroundText] = useState(
    'صنایع کارتن و جعبه‌سازی آرمان امیران؛ پیشرو در تولید مکانیزه انواع بسته‌بندی مقوایی، هاردباکس، لمینتی و کارتن‌های ۳ و ۵ لایه صادراتی با پیشرفته‌ترین خطوط چاپ افست و دایکات تمام‌اتوماتیک.'
  );

  // Sync working state when context typography updates
  useEffect(() => {
    setFormState(typography);
  }, [typography]);

  // Handle immediate live preview as user drags sliders or clicks presets
  const handleScaleChange = (newScale) => {
    const updated = { ...formState, font_scale: Number(newScale) };
    setFormState(updated);
    previewTypography(updated);
  };

  const handlePresetSelect = (preset) => {
    const updated = {
      ...formState,
      font_scale: preset.scale,
      base_font_size: preset.basePx
    };
    setFormState(updated);
    previewTypography(updated);
  };

  const handleFontFamilyChange = (field, fontName) => {
    const updated = { ...formState, [field]: fontName };
    setFormState(updated);
    previewTypography(updated);
  };

  const handleLineHeightChange = (lh) => {
    const updated = { ...formState, line_height: Number(lh) };
    setFormState(updated);
    previewTypography(updated);
  };

  const handleWeightChange = (field, weight) => {
    const updated = { ...formState, [field]: String(weight) };
    setFormState(updated);
    previewTypography(updated);
  };

  // Submit Save
  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();
    await saveTypography(formState);
  };

  // Submit Reset
  const handleResetToFactory = async () => {
    if (window.confirm('آیا از بازنشانی فونت و اندازه قلم به حالت استاندارد کارخانه (وزیرمتن ۱۰۰٪) اطمینان دارید؟')) {
      await resetTypography();
    }
  };

  // Submit Custom Font Upload
  const handleFontUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('لطفاً ابتدا فایل فونت را انتخاب نمایید.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('font_file', uploadFile);
      formData.append('name', uploadName || uploadFile.name);
      formData.append('font_family', uploadFamily || uploadName || 'CustomFont');
      formData.append('category', uploadCategory);
      formData.append('preview_text', uploadPreviewText);

      const newFont = await uploadCustomFont(formData);
      if (newFont) {
        setUploadFile(null);
        setUploadName('');
        setUploadFamily('');
        // Switch to uploaded font
        handleFontFamilyChange('body_font_family', newFont.font_family);
      }
    } catch (err) {
      alert('خطا در بارگذاری فونت: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const customFonts = fonts.filter(f => f.is_custom === 1);
  const builtInFonts = fonts.filter(f => f.is_custom !== 1);

  return (
    <div className="space-y-6 animate-fadeIn pb-16" dir="rtl">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 -translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 translate-x-12 translate-y-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-950/50 border border-indigo-400/30">
              <Type className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  مدیریت جامع فونت‌ها، مقیاس اندازه قلم و تایپوگرافی
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-mono">
                  Typography v3.5
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-100/80 mt-1 max-w-2xl leading-relaxed">
                تنظیم اندازه قلم سراسری (Font Size) در تمامی صفحات، انتخاب فونت متن و تیترها، آپلود فونت‌های سفارشی (.woff2, .ttf, .otf) و تنظیم فاصله خطوط
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges & Reset Button */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-slate-950/60 p-2 rounded-2xl border border-white/10 backdrop-blur-sm flex items-center gap-3 text-xs">
              <div className="text-right">
                <div className="text-[10px] text-slate-400">فونت فعال متن:</div>
                <div className="font-black text-cyan-300 truncate max-w-[120px]">{formState.body_font_family}</div>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div className="text-right">
                <div className="text-[10px] text-slate-400">مقیاس اندازه:</div>
                <div className="font-black text-amber-300 font-mono">{formState.font_scale}٪</div>
              </div>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={handleResetToFactory}
                disabled={saving}
                className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                title="بازنشانی به پیش‌فرض کارخانه"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>پیش‌فرض</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('scale')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 shrink-0 ${
              activeTab === 'scale'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-indigo-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>۱. مقیاس و اندازه قلم (Font Size)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fonts')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 shrink-0 ${
              activeTab === 'fonts'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-indigo-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>۲. انتخاب خانواده فونت متن و تیترها</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 shrink-0 ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-indigo-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>۳. آپلود و ثبت فونت جدید ({customFonts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('playground')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 shrink-0 ${
              activeTab === 'playground'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-indigo-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>۴. میزکار تست و پیش‌نمایش زنده</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: FONT SIZE & SCALE CONFIG ================= */}
      {activeTab === 'scale' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Preset Buttons Grid */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                پریست‌های آماده اندازه قلم و بزرگ‌نمایی سراسری
              </span>
              <span className="text-xs text-slate-400">انتخاب سریع بر اساس اندازه نمایشگر و راحتی چشم</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {FONT_SIZE_PRESETS.map((p) => {
                const isSelected = formState.font_scale === p.scale;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between relative group ${
                      isSelected
                        ? 'bg-gradient-to-tr from-indigo-50 to-purple-50 border-indigo-500 ring-2 ring-indigo-400 shadow-md text-indigo-950'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black text-xs">{p.label.split('(')[0]}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight">{p.desc}</div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-baseline justify-between font-mono">
                      <span className="text-sm font-black text-indigo-700">{p.scale}٪</span>
                      <span className="text-[10px] text-slate-400">{p.basePx}px</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Continuous Sliders & Typography Fine-Tuning */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slider 1: Font Scale (80% to 140%) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-black text-xs text-slate-800 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-purple-600" />
                  <span>مقیاس و درصد بزرگ‌نمایی سراسری قلم:</span>
                </label>
                <span className="px-3 py-1 bg-purple-100 text-purple-900 rounded-xl font-mono font-black text-sm">
                  {formState.font_scale} ٪
                </span>
              </div>

              <input
                type="range"
                min="80"
                max="140"
                step="1"
                value={formState.font_scale}
                onChange={(e) => handleScaleChange(e.target.value)}
                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />

              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1 font-mono">
                <span>۸۰٪ (فوق‌العاده فشرده)</span>
                <span>۱۰۰٪ (استاندارد کارخانه)</span>
                <span>۱۴۰٪ (بسیار درشت)</span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                💡 <strong>نکته فنی:</strong> تغییر این اسلایدر به صورت متناسب تمام فونت‌ها، فرم‌ها، کارت‌ها و جداول کل سامانه را بدون به‌هم‌ریختگی ابعاد بزرگ یا کوچک می‌کند.
              </p>
            </div>

            {/* Slider 2: Line Height (فاصله خطوط) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-black text-xs text-slate-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <span>فاصله بین خطوط متنی (Line Height):</span>
                </label>
                <span className="px-3 py-1 bg-teal-100 text-teal-900 rounded-xl font-mono font-black text-sm">
                  {formState.line_height}
                </span>
              </div>

              <input
                type="range"
                min="1.3"
                max="2.0"
                step="0.05"
                value={formState.line_height}
                onChange={(e) => handleLineHeightChange(e.target.value)}
                className="w-full accent-teal-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />

              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1 font-mono">
                <span>۱.۳ (فشرده)</span>
                <span>۱.۶ (استاندارد)</span>
                <span>۲.۰ (عریض و باز)</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-bold text-xs text-slate-700 block mb-1">ضخامت متن عادی:</label>
                  <select
                    value={formState.body_font_weight || '500'}
                    onChange={(e) => handleWeightChange('body_font_weight', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    <option value="400">عادی (Regular 400)</option>
                    <option value="500">متوسط (Medium 500) - پیش‌فرض</option>
                    <option value="600">نیمه‌ضخیم (SemiBold 600)</option>
                    <option value="700">ضخیم (Bold 700)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-xs text-slate-700 block mb-1">ضخامت تیترها و عناوین:</label>
                  <select
                    value={formState.heading_font_weight || '800'}
                    onChange={(e) => handleWeightChange('heading_font_weight', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    <option value="700">ضخیم (Bold 700)</option>
                    <option value="800">خیلی ضخیم (ExtraBold 800) - پیش‌فرض</option>
                    <option value="900">مشکی و توپر (Black 900)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: FONT FAMILY SELECTION ================= */}
      {activeTab === 'fonts' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main 3 Font Selectors */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Type className="w-4 h-4 text-indigo-600" />
                تعیین فونت اختصاصی بخش‌های مختلف سامانه
              </span>
              <span className="text-xs text-slate-400">تفکیک فونت متن، تیترها و اعداد حسابداری</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Field 1: Body Font */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2">
                <label className="font-black text-slate-800 block">
                  ۱. فونت متن اصلی، جداول و فرم‌ها:
                </label>
                <select
                  value={formState.body_font_family}
                  onChange={(e) => handleFontFamilyChange('body_font_family', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-black text-indigo-950 focus:border-indigo-500 shadow-2xs"
                >
                  {fonts.map((f) => (
                    <option key={f.id} value={f.font_family}>
                      {f.name} {f.is_custom ? '★ (سفارشی)' : ''}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-slate-500">فونت سراسری بدنه صفحات، کارت‌ها و ورودی‌ها</div>
              </div>

              {/* Field 2: Headings Font */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2">
                <label className="font-black text-slate-800 block">
                  ۲. فونت عناوین و تیترها (H1-H6):
                </label>
                <select
                  value={formState.heading_font_family}
                  onChange={(e) => handleFontFamilyChange('heading_font_family', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-black text-indigo-950 focus:border-indigo-500 shadow-2xs"
                >
                  {fonts.map((f) => (
                    <option key={f.id} value={f.font_family}>
                      {f.name} {f.is_custom ? '★ (سفارشی)' : ''}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-slate-500">فونت سربرگ‌ها، تیترهای سکشن و نام ماژول‌ها</div>
              </div>

              {/* Field 3: Numbers / Financial Font */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2">
                <label className="font-black text-slate-800 block">
                  ۳. فونت ارقام، مبالغ مالی و بارکدها:
                </label>
                <select
                  value={formState.numbers_font_family}
                  onChange={(e) => handleFontFamilyChange('numbers_font_family', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-black text-indigo-950 focus:border-indigo-500 shadow-2xs"
                >
                  {fonts.map((f) => (
                    <option key={f.id} value={f.font_family}>
                      {f.name} {f.is_custom ? '★ (سفارشی)' : ''}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-slate-500">فونت مبالغ ریالی، ابعاد میلی‌متری و کدهای پرونده</div>
              </div>
            </div>
          </div>

          {/* Persian Fonts Visual Library Cards */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                کتابخانه و گالری فونت‌های استاندارد فارسی ({fonts.length} فونت)
              </span>
              <span className="text-xs text-slate-400">جهت انتخاب مستقیم روی فونت دلخواه کلیک نمایید</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fonts.map((f) => {
                const isCurrentBody = formState.body_font_family === f.font_family;
                const isCurrentHeading = formState.heading_font_family === f.font_family;

                return (
                  <div
                    key={f.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      isCurrentBody || isCurrentHeading
                        ? 'bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 border-indigo-500 ring-2 ring-indigo-400/40 shadow-md'
                        : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                          <span>{f.name}</span>
                          {f.is_custom === 1 && (
                            <span className="px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-800 text-[9px] font-bold">
                              سفارشی
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{f.font_family} ({f.format})</div>
                      </div>

                      <div className="flex items-center gap-1">
                        {isCurrentBody && (
                          <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] rounded-lg font-bold">
                            متن اصلی
                          </span>
                        )}
                        {isCurrentHeading && (
                          <span className="px-2 py-0.5 bg-purple-600 text-white text-[10px] rounded-lg font-bold">
                            تیترها
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Font Preview Sample Text */}
                    <div
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-right text-xs leading-relaxed text-slate-800"
                      style={{
                        fontFamily: FONT_FALLBACKS[f.font_family] || `'${f.font_family}', sans-serif`
                      }}
                    >
                      {f.preview_text || 'بسته‌بندی و چاپ جعبه آرمان امیران ۱۴۰۵'}
                    </div>

                    {/* Selection Actions */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleFontFamilyChange('body_font_family', f.font_family)}
                        className={`flex-1 py-1.5 rounded-xl text-[11px] font-black transition ${
                          isCurrentBody
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-800'
                        }`}
                      >
                        {isCurrentBody ? '✓ متن اصلی فعال' : 'انتخاب برای متن'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFontFamilyChange('heading_font_family', f.font_family)}
                        className={`flex-1 py-1.5 rounded-xl text-[11px] font-black transition ${
                          isCurrentHeading
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-800'
                        }`}
                      >
                        {isCurrentHeading ? '✓ تیتر فعال' : 'انتخاب برای تیتر'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: UPLOAD CUSTOM FONT ================= */}
      {activeTab === 'upload' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Upload Form Box */}
          <form onSubmit={handleFontUploadSubmit} className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-600" />
                افزودن و آپلود فونت سفارشی اختصاصی به سامانه
              </span>
              <span className="text-xs text-slate-400">پشتیبانی از فرمت‌های WOFF2, WOFF, TTF, OTF</span>
            </div>

            {/* Drag & Drop File Upload Area */}
            <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-3xl p-6 sm:p-8 text-center transition bg-indigo-50/30">
              <input
                type="file"
                id="custom-font-file-input"
                accept=".woff2,.woff,.ttf,.otf"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setUploadFile(f);
                    if (!uploadName) {
                      const cleanName = f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
                      setUploadName(cleanName);
                      setUploadFamily(cleanName.replace(/\s+/g, ''));
                    }
                  }
                }}
                className="hidden"
              />

              {uploadFile ? (
                <div className="flex items-center justify-between bg-white border border-indigo-200 rounded-2xl p-4 max-w-lg mx-auto shadow-sm">
                  <div className="flex items-center gap-3 text-right">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                      <Type className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-xs text-slate-900 truncate max-w-xs">{uploadFile.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {(uploadFile.size / 1024).toFixed(1)} KB | {uploadFile.name.split('.').pop()?.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadFile(null)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs transition"
                    title="حذف فایل انتخابی"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label htmlFor="custom-font-file-input" className="cursor-pointer flex flex-col items-center space-y-2 py-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
                    <Upload className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-black text-slate-800">
                    جهت انتخاب و بارگذاری فایل فونت کلیک نمایید یا فایل را اینجا رها کنید
                  </span>
                  <span className="text-[11px] text-slate-400">
                    فرمت‌های مجاز: WOFF2 (بهترین عملکرد)، WOFF، TTF، OTF (حداکثر ۱۵ مگابایت)
                  </span>
                </label>
              )}
            </div>

            {/* Font Meta Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  نام فارسی نمایشی فونت: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ایران‌یکان سازمانی"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  نام انگلیسی خانواده قلم (font-family): <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  placeholder="مثال: IRANYekanCorp"
                  value={uploadFamily}
                  onChange={(e) => setUploadFamily(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-mono font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">دسته‌بندی فونت:</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-800"
                >
                  <option value="persian">فونت فارسی استاندارد</option>
                  <option value="headings">فونت ویژه تیتر و هدر</option>
                  <option value="monospace">فونت ارقام و کدها (Monospace)</option>
                  <option value="custom">سفارشی برند</option>
                </select>
              </div>
            </div>

            {/* Action Submit */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={uploading || !uploadFile}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>{uploading ? 'در حال آپلود و ثبت فونت...' : 'آپلود و افزودن به لیست فونت‌ها'}</span>
              </button>
            </div>
          </form>

          {/* Uploaded Custom Fonts List */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-indigo-600" />
                فونت‌های سفارشی آپلود شده در سرور ({customFonts.length} فونت)
              </span>
            </div>

            {customFonts.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Type className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-bold">هنوز هیچ فونت سفارشی آپلود نشده است.</p>
                <p className="text-[11px] text-slate-400">می‌توانید فونت‌های دلخواه خود مانند ایران‌سنس، ایران‌یکان، یا فونت اختصاصی برندتان را از بخش بالا آپلود فرمایید.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {customFonts.map((cf) => (
                  <div key={cf.id} className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-black text-xs text-slate-900">{cf.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{cf.font_family} | {(cf.file_size / 1024).toFixed(1)} KB</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`آیا از حذف فونت «${cf.name}» اطمینان دارید؟`)) {
                            deleteCustomFont(cf.id);
                          }
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                        title="حذف فونت"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div
                      className="p-2.5 bg-white rounded-xl border border-slate-200 text-right text-xs leading-relaxed"
                      style={{ fontFamily: `'${cf.font_family}', sans-serif` }}
                    >
                      {cf.preview_text || 'بسته‌بندی و چاپ جعبه آرمان امیران ۱۴۰۵'}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleFontFamilyChange('body_font_family', cf.font_family)}
                        className="flex-1 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-lg text-[11px] font-bold transition"
                      >
                        اعمال برای متن
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFontFamilyChange('heading_font_family', cf.font_family)}
                        className="flex-1 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-lg text-[11px] font-bold transition"
                      >
                        اعمال برای تیتر
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 4: LIVE INTERACTIVE PLAYGROUND ================= */}
      {activeTab === 'playground' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-600" />
                میزکار تست زنده و شبیه‌ساز تایپوگرافی سامانه
              </span>
              <span className="text-xs text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full font-bold border border-indigo-200 font-mono">
                {formState.body_font_family} | {formState.font_scale}٪ مقیاس
              </span>
            </div>

            {/* Custom Interactive Text Input */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700 block">
                متن دلخواه جهت تست تایپوگرافی را وارد فرمایید:
              </label>
              <textarea
                rows="2"
                value={playgroundText}
                onChange={(e) => setPlaygroundText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Visual Live Components Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Card 1: Headings & Body Preview */}
              <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-[10px] font-bold text-slate-400 border-b border-slate-200 pb-1">
                  پیش‌نمایش تیترها و پاراگراف‌ها:
                </div>
                <div>
                  <h1 className="text-lg font-black text-slate-900 leading-tight">
                    عنوان سربرگ اصلی (Heading 1) - تولید جعبه دارویی و صنعتی
                  </h1>
                  <h2 className="text-sm font-bold text-indigo-700 mt-1">
                    زیرعنوان مرحله چاپ افست ۵ رنگ و سلفون مات حرارتی (Heading 2)
                  </h2>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed text-justify">
                  {playgroundText}
                </p>
              </div>

              {/* Card 2: Table, Numbers & Badges Preview */}
              <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-[10px] font-bold text-slate-400 border-b border-slate-200 pb-1">
                  پیش‌نمایش داده‌های مالی، ارقام و جدول:
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold">
                        <th className="py-1">کد استعلام</th>
                        <th className="py-1">نام محصول</th>
                        <th className="py-1 text-center">تیراژ</th>
                        <th className="py-1 text-left">مبلغ برآورد</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
                      <tr>
                        <td className="py-2 font-mono text-teal-700">MKT-1405-8921</td>
                        <td className="py-2">جعبه مقوایی دارویی ۳۰۰ گرم ایندربرد</td>
                        <td className="py-2 text-center font-mono">۲۵,۰۰۰ عدد</td>
                        <td className="py-2 text-left font-mono font-black text-emerald-700">۴۵,۶۵۰,۰۰۰ تومان</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-teal-700">MKT-1405-9014</td>
                        <td className="py-2">کارتن لمینتی ۳ لایه E-Flute صادراتی</td>
                        <td className="py-2 text-center font-mono">۱۰,۰۰۰ عدد</td>
                        <td className="py-2 text-left font-mono font-black text-emerald-700">۸۲,۴۰۰,۰۰۰ تومان</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Sample Badges & Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 flex-wrap">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-black">
                    تایید مشتری ✓
                  </span>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-xl text-xs font-bold">
                    در انتظار برآورد قیمت
                  </span>
                  <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-xl text-xs font-bold font-mono">
                    ۱۰ مرحله تولید
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= STICKY BOTTOM SAVE & PUBLISH ACTION BAR ================= */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-slate-800 flex items-center justify-between flex-wrap gap-4 sticky bottom-4 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <div className="font-black text-xs text-white">
              آماده اعمال تغییرات تایپوگرافی
            </div>
            <div className="text-[11px] text-slate-400">
              فونت: <strong className="text-cyan-300">{formState.body_font_family}</strong> | مقیاس اندازه: <strong className="text-amber-300 font-mono">{formState.font_scale}٪</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={cancelPreview}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
          >
            لغو پیش‌نمایش
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-black transition shadow-lg shadow-emerald-900/40 flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'در حال ذخیره‌سازی...' : 'ذخیره و اعمال سراسری در کل سامانه'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
