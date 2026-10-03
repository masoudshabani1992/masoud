import React from 'react';
import {
  Wand2,
  Edit3,
  Sliders,
  Check,
  X,
  Sparkles,
  Layers,
  Settings
} from 'lucide-react';
import { useUiCustomizer } from '../context/CustomizerContext';

export default function ElementorFloatingBar({ onNavigateToCustomizer }) {
  const { isAdmin, isEditMode, toggleEditMode } = useUiCustomizer();

  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 animate-slide-up select-none" dir="rtl">
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-2xl border transition-all backdrop-blur-md ${
        isEditMode
          ? 'bg-gradient-to-r from-slate-900 via-[#92003B] to-slate-900 text-white border-pink-500/50 ring-2 ring-pink-500/30'
          : 'bg-slate-900/90 text-white border-slate-700 hover:border-slate-600'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
            isEditMode ? 'bg-pink-500 text-white animate-pulse' : 'bg-slate-800 text-pink-400'
          }`}>
            <Wand2 className="w-4 h-4" />
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight">ویرایشگر زنده (المنتور)</span>
              <span className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded ${
                isEditMode ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {isEditMode ? 'فعال' : 'خاموش'}
              </span>
            </div>
            <p className="text-[10px] text-slate-300 hidden sm:block">
              {isEditMode ? 'روی دکمه ویرایش هر بخش کلیک کنید' : 'جهت ویرایش زنده عناوین و متون کلیک کنید'}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={toggleEditMode}
          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
            isEditMode ? 'bg-pink-500' : 'bg-slate-700'
          }`}
          title={isEditMode ? 'غیرفعال‌سازی حالت ویرایشگر زنده' : 'فعال‌سازی حالت ویرایشگر زنده المنتور'}
        >
          <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
            isEditMode ? 'translate-x-0' : '-translate-x-5'
          }`} />
        </button>

        {/* Quick link to full customizer */}
        {onNavigateToCustomizer && (
          <button
            onClick={onNavigateToCustomizer}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition text-xs flex items-center gap-1 border-r border-slate-700 pr-2.5 mr-1"
            title="رفتن به پنل مدیریت جامع عناوین و ماژول‌ها"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold hidden md:inline">پنل مدیریت</span>
          </button>
        )}
      </div>
    </div>
  );
}
