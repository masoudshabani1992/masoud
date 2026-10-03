import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Sparkles,
  Edit3,
  Layers,
  Check,
  Eye,
  Sliders,
  Type,
  Palette,
  Settings2,
  Wand2,
  CheckCircle2
} from 'lucide-react';
import { useUiCustomizer } from '../context/CustomizerContext';

export default function ElementorInspectorDrawer() {
  const { activeInspector, closeInspector, saveElement, resetElement, savingKey } = useUiCustomizer();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'style' | 'advanced'

  useEffect(() => {
    if (activeInspector) {
      setTitle(activeInspector.title || activeInspector.defaultTitle || '');
      setSubtitle(activeInspector.subtitle || activeInspector.defaultSubtitle || '');
      setDescription(activeInspector.description || '');
      setCategory(activeInspector.category || 'general');
    }
  }, [activeInspector]);

  if (!activeInspector) return null;

  const isSaving = savingKey === activeInspector.key;

  const handleSave = async (e) => {
    e.preventDefault();
    await saveElement(activeInspector.key, {
      title,
      subtitle,
      description,
      category
    });
  };

  const handleReset = async () => {
    if (window.confirm('آیا مایلید این المان به متن پیش‌فرض کارخانه بازنشانی شود؟')) {
      await resetElement(activeInspector.key, activeInspector.defaultTitle, activeInspector.defaultSubtitle);
      setTitle(activeInspector.defaultTitle || '');
      setSubtitle(activeInspector.defaultSubtitle || '');
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex justify-end animate-fade-in" dir="rtl">
      {/* Backdrop overlay */}
      <div 
        onClick={closeInspector}
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs pointer-events-auto transition-opacity" 
      />

      {/* Elementor Side Panel */}
      <div className="relative w-full max-w-md h-full bg-slate-900 text-white shadow-2xl border-r border-slate-800 pointer-events-auto flex flex-col justify-between z-10 animate-slide-left">
        
        {/* Elementor Header Bar */}
        <div className="p-4 bg-gradient-to-r from-[#92003B] via-[#6366f1] to-slate-900 border-b border-white/10 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black text-xs shadow-inner">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wide text-white">ویرایشگر زنده (المنتور)</span>
                <span className="text-[9px] font-mono uppercase bg-white/20 text-white px-1.5 py-0.2 rounded font-black">
                  LIVE
                </span>
              </div>
              <span className="text-[10px] text-white/70 font-mono block mt-0.5 truncate max-w-[200px]">
                {activeInspector.key}
              </span>
            </div>
          </div>

          <button
            onClick={closeInspector}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition"
            title="بستن پنل"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 bg-slate-950/80 border-b border-slate-800 p-1 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('content')}
            className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'content'
                ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>محتوا</span>
          </button>
          <button
            onClick={() => setActiveTab('style')}
            className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'style'
                ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>استایل</span>
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'advanced'
                ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>پیشرفته</span>
          </button>
        </div>

        {/* Inspector Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-slate-200">
          
          {/* Live Preview Box */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-indigo-500/30 space-y-2 shadow-inner">
            <div className="flex items-center justify-between text-[10px] text-indigo-400 font-bold">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                پیش‌نمایش لحظه‌ای در فرم:
              </span>
              <span className="font-mono text-slate-400">{category}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="font-black text-sm text-white">{title || '(بدون عنوان)'}</div>
              {subtitle && (
                <div className="text-xs text-slate-400 leading-relaxed">{subtitle}</div>
              )}
            </div>
          </div>

          {activeTab === 'content' && (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="font-bold text-slate-300 block mb-1 flex items-center justify-between">
                  <span>عنوان / متن اصلی (Title / Heading):</span>
                  <span className="text-[10px] text-pink-400 font-bold">الزامی</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="متن عنوان را وارد نمایید..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 font-bold text-white text-xs focus:outline-none focus:border-pink-500 transition"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  زیرعنوان / توضیحات کمکی / متن نمونه (Subtitle / Placeholder):
                </label>
                <textarea
                  rows={3}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="متن توضیحات یا راهنما..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 font-bold text-white text-xs focus:outline-none focus:border-pink-500 leading-relaxed transition"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  یادداشت فنی / توضیحات برای مدیریت:
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="توضیح کوتاه درباره کاربرد این بخش..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 font-bold text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </form>
          )}

          {activeTab === 'style' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-slate-300 block text-xs">طرح‌بندی و سایه المان</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  این المان به صورت هوشمند از تم فعال (Vision UI دارک نئونی یا Classic Pastel پاستلی) پیروی می‌کند.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">دسته‌بندی رنگی / تگ:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 font-bold text-white text-xs focus:outline-none focus:border-pink-500"
                >
                  <option value="marketing">استعلام و بازاریابی (سبز زمردی)</option>
                  <option value="calculator">ماشین‌حساب و مالی (فیروزه‌ای)</option>
                  <option value="production">دستور تولید (نیلی)</option>
                  <option value="warehouse">انبارداری متریال (کهربایی)</option>
                  <option value="workflow">گردش کار و کانبان (بنفش)</option>
                  <option value="studio">استودیو و طراحی (طلایی)</option>
                  <option value="ai">هوش مصنوعی (سرخابی)</option>
                  <option value="hr">منابع انسانی (نارنجی)</option>
                  <option value="general">عمومی (خاکستری)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">کلید یکتای سیستمی:</span>
                  <span className="font-mono text-[11px] text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/50">
                    {activeInspector.key}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                  <span className="text-slate-400">آخرین ذخیره:</span>
                  <span className="font-mono text-[10px] text-slate-500">
                    {activeInspector.raw?.updated_at || 'پیش‌فرض کارخانه'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed">
                💡 تغییرات ذخیره‌شده به صورت خودکار در دیتابیس پایدار شده و بلافاصله برای تمامی کلاینت‌ها و کاربران اعمال می‌گردد.
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
            title="بازنشانی این المان به متن اولیه کارخانه"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>بازنشانی پیش‌فرض</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="flex-1 px-5 py-2.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>در حال انتشار...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>ذخیره و انتشار (Update)</span>
              </span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
