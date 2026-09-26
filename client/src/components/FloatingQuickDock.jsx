import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Search,
  PlusCircle,
  Calculator,
  Compass,
  Boxes,
  Users,
  ChevronUp,
  ChevronDown,
  Layers,
  Inbox,
  Package,
  Command,
  HelpCircle,
  X
} from 'lucide-react';

export default function FloatingQuickDock({
  activeTab,
  onNavigate,
  onOpenCommandPalette,
  onOpenNewOrder
}) {
  const { role, hasPermission } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const canMarketing = hasPermission('can_view_marketing');
  const canCalculator = hasPermission('can_view_calculator');
  const canStudio = hasPermission('can_view_studio');
  const canAi = hasPermission('can_view_ai');
  const canProduction = hasPermission('can_view_production_offset');

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start gap-2 select-none no-print" dir="rtl">
      
      {/* Expanded Quick Menu */}
      {isOpen && (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-3xl shadow-2xl border border-slate-700/80 space-y-2 animate-in slide-in-from-bottom-4 duration-200 min-w-[220px]">
          <div className="px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-xs font-black text-slate-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>دسترسی و اقدام سریع</span>
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 text-xs font-bold">
            {/* Global Search */}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenCommandPalette();
              }}
              className="w-full p-2.5 rounded-2xl flex items-center justify-between bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-indigo-200 transition"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-400" />
                <span>جستجو در کل سامانه</span>
              </div>
              <kbd className="text-[10px] bg-indigo-950 px-1.5 py-0.5 rounded font-mono text-indigo-300">Ctrl+K</kbd>
            </button>

            {/* New Order */}
            {hasPermission('can_create_order') && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigate('new_order');
                }}
                className="w-full p-2.5 rounded-2xl flex items-center gap-2 hover:bg-slate-800 text-amber-300 transition"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>سفارش جدید</span>
              </button>
            )}

            {/* New Marketing Lead */}
            {canMarketing && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigate('marketing');
                }}
                className="w-full p-2.5 rounded-2xl flex items-center gap-2 hover:bg-slate-800 text-teal-300 transition"
              >
                <PlusCircle className="w-4 h-4 text-teal-400" />
                <span>ثبت استعلام بازاریابی</span>
              </button>
            )}

            {/* Calculator */}
            {canCalculator && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigate('calculator');
                }}
                className="w-full p-2.5 rounded-2xl flex items-center gap-2 hover:bg-slate-800 text-amber-300 transition"
              >
                <Calculator className="w-4 h-4 text-amber-400" />
                <span>ماشین حساب قیمت</span>
              </button>
            )}

            {/* Production Orders */}
            {canProduction && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigate('production_orders');
                }}
                className="w-full p-2.5 rounded-2xl flex items-center gap-2 hover:bg-slate-800 text-indigo-300 transition"
              >
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>دستور تولید کارخانه</span>
              </button>
            )}

            {/* Dieline Studio */}
            {canStudio && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigate('dieline_generator');
                }}
                className="w-full p-2.5 rounded-2xl flex items-center gap-2 hover:bg-slate-800 text-cyan-300 transition"
              >
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>استودیو خط تیغ امیران</span>
              </button>
            )}

            {/* AI Assistant */}
            {canAi && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigate('ai_assistant');
                }}
                className="w-full p-2.5 rounded-2xl flex items-center gap-2 hover:bg-slate-800 text-rose-300 transition"
              >
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span>دستیار هوش مصنوعی</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-full shadow-2xl hover:shadow-indigo-500/20 border-2 border-indigo-400/40 hover:scale-105 active:scale-95 transition-all text-xs font-black group"
        title="دسترسی سریع به تمام بخش‌های اتوماسیون (Ctrl+K)"
      >
        <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:rotate-12 transition-transform">
          <Command className="w-3.5 h-3.5 text-cyan-300" />
        </div>
        <span className="hidden sm:inline">منوی سریع</span>
        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
      </button>
    </div>
  );
}
