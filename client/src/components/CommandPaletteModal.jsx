import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { matchProduct, formatToman } from '../utils/helpers';
import {
  Search,
  PlusCircle,
  Calculator,
  Compass,
  Boxes,
  Layers,
  Inbox,
  Sparkles,
  Users,
  HardDrive,
  Printer,
  Scissors,
  FileSpreadsheet,
  Package,
  X,
  ArrowRight,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  Clock,
  Phone,
  FileText
} from 'lucide-react';

export default function CommandPaletteModal({
  isOpen,
  onClose,
  onNavigate,
  onOpenNewOrder,
  onSelectProject,
  projects = [],
  leads = []
}) {
  const { currentUser, role, hasPermission } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Static Navigation Items
  const navItems = [
    {
      id: 'marketing',
      title: 'کارتابل بازاریابی و استعلام قیمت',
      subtitle: 'ثبت استعلام، پیگیری مشتریان و تارگت فروش',
      category: 'ماژول‌ها',
      icon: Users,
      color: 'text-teal-600 bg-teal-50',
      action: () => onNavigate('marketing'),
      visible: hasPermission('can_view_marketing')
    },
    {
      id: 'new_lead',
      title: '➕ ثبت استعلام جدید بازاریابی',
      subtitle: 'ثبت مشخصات جعبه و فایل خط تیغ مشتری',
      category: 'اقدامات سریع',
      icon: PlusCircle,
      color: 'text-emerald-600 bg-emerald-50',
      action: () => {
        onNavigate('marketing');
        // trigger new lead tab if needed
      },
      visible: hasPermission('can_view_marketing')
    },
    {
      id: 'calculator',
      title: 'ماشین حساب برآورد صنعتی قیمت جعبه',
      subtitle: 'محاسبه بهای تمام شده مقوا، چاپ، سلفون، قالب و سود',
      category: 'ماژول‌ها',
      icon: Calculator,
      color: 'text-amber-600 bg-amber-50',
      action: () => onNavigate('calculator'),
      visible: hasPermission('can_view_calculator')
    },
    {
      id: 'production_orders',
      title: 'دستور تولید کارخانه (افست، دیجیتال، خدماتی)',
      subtitle: 'صف تولید ۴ رنگ: سفید، زرد مالی، قرمز کنسل، سبز بایگانی',
      category: 'ماژول‌ها',
      icon: Layers,
      color: 'text-indigo-600 bg-indigo-50',
      action: () => onNavigate('production_orders'),
      visible: hasPermission('can_view_production_offset')
    },
    {
      id: 'dieline_generator',
      title: 'استودیو خط تیغ و طراحی ۳بعدی امیران',
      subtitle: 'ترسیم خط تیغ پارامتریک و خروجی CorelDRAW و AI',
      category: 'ماژول‌ها',
      icon: Compass,
      color: 'text-cyan-600 bg-cyan-50',
      action: () => onNavigate('dieline_generator'),
      visible: hasPermission('can_view_studio')
    },
    {
      id: 'warehouse_cardboard',
      title: 'دفاتر انبار کارخانه (مقوا، ورق، سینگل، سلفون، طلق، مرکب)',
      subtitle: 'کنترل موجودی شیت و پارت‌های دریافتی',
      category: 'ماژول‌ها',
      icon: Package,
      color: 'text-sky-600 bg-sky-50',
      action: () => onNavigate('warehouse_cardboard'),
      visible: hasPermission('can_view_warehouse_cardboard')
    },
    {
      id: 'archive',
      title: 'آرشیو جامع محصولات و سفارشات',
      subtitle: 'بانک اطلاعات جعبه‌ها و جستجوی کدهای بایگانی',
      category: 'ماژول‌ها',
      icon: Boxes,
      color: 'text-purple-600 bg-purple-50',
      action: () => onNavigate('archive'),
      visible: hasPermission('can_view_archive')
    },
    {
      id: 'ai_assistant',
      title: 'دستیار هوش مصنوعی کارخانه جعبه‌سازی',
      subtitle: 'استخراج استعلام از متن، چیدمان بهینه شیت و بازرسی خط تیغ',
      category: 'ماژول‌ها',
      icon: Sparkles,
      color: 'text-rose-600 bg-rose-50',
      action: () => onNavigate('ai_assistant'),
      visible: hasPermission('can_view_ai')
    },
    {
      id: 'my_tasks',
      title: 'کارتابل وظایف من (امور منتظر اقدام)',
      subtitle: 'سفارش‌های نیازمند تایید یا اقدام واحد شما',
      category: 'ماژول‌ها',
      icon: Inbox,
      color: 'text-blue-600 bg-blue-50',
      action: () => onNavigate('my_tasks'),
      visible: hasPermission('can_view_my_tasks')
    },
    {
      id: 'hr',
      title: 'مدیریت منابع انسانی و ارزیابی پرسنل',
      subtitle: 'ثبت پرونده پرسنلی و ارزیابی عملکرد ۵ محوره',
      category: 'مدیریت',
      icon: UserCheck,
      color: 'text-amber-600 bg-amber-50',
      action: () => onNavigate('hr'),
      visible: role === 'ceo' || hasPermission('can_manage_users')
    },
    {
      id: 'users',
      title: 'مدیریت کاربران و دسترسی‌ها',
      subtitle: 'تنظیم رمز عبور، نقش‌ها و تارگت بازاریاب‌ها',
      category: 'مدیریت',
      icon: Users,
      color: 'text-indigo-600 bg-indigo-50',
      action: () => onNavigate('users'),
      visible: role === 'ceo' || hasPermission('can_manage_users')
    }
  ].filter(item => item.visible);

  // Filter Items Based on Query
  const filteredNav = query.trim() === ''
    ? navItems
    : navItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );

  // Filter Projects based on search (کد آرشیو، مشتری، تلفن، محصول)
  const matchingProjects = query.trim() === ''
    ? []
    : projects.filter(p => matchProduct(p, query)).slice(0, 5);

  const totalResults = [...filteredNav, ...matchingProjects];

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (totalResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalResults.length) % (totalResults.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (totalResults[selectedIndex]) {
        const item = totalResults[selectedIndex];
        if (item.action) {
          item.action();
        } else if (item.id) {
          // It's a project
          if (onSelectProject) {
            onSelectProject(item.id);
          } else {
            onNavigate('archive');
          }
        }
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="relative border-b border-slate-200 p-4 bg-slate-50 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-600 shrink-0 mr-1" />
          <input
            ref={inputRef}
            type="text"
            placeholder="جستجوی سریع در کل سامانه: نام مشتری، تلفن، نام محصول، کد آرشیو یا انتخاب ماژول..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md hidden sm:inline-block">
            ESC جهت خروج
          </span>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-slate-100">
          
          {/* Quick Nav Items */}
          {filteredNav.length > 0 && (
            <div className="py-2 space-y-1">
              <div className="px-3 py-1 text-[11px] font-black text-slate-400">دسترسی سریع و ماژول‌ها:</div>
              {filteredNav.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full p-3 rounded-2xl flex items-center justify-between transition text-right ${
                      isSelected ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 shadow-xs' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900">{item.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{item.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                        {item.category}
                      </span>
                      <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-indigo-600 translate-x-[-2px]' : 'text-slate-300'} transition-transform`} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Matching Projects / Orders */}
          {matchingProjects.length > 0 && (
            <div className="py-2 space-y-1">
              <div className="px-3 py-1 text-[11px] font-black text-indigo-600">پرونده‌ها و سفارشات منطبق ({matchingProjects.length}):</div>
              {matchingProjects.map((p, pIdx) => {
                const itemIndex = filteredNav.length + pIdx;
                const isSelected = selectedIndex === itemIndex;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      if (onSelectProject) {
                        onSelectProject(p.id);
                      } else {
                        onNavigate('archive');
                      }
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                    className={`w-full p-3 rounded-2xl flex items-center justify-between transition text-right ${
                      isSelected ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 shadow-xs' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0 font-bold text-xs">
                        {p.archive_code || p.tracking_code}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900">{p.title}</h4>
                          <span className="text-[10px] font-bold text-slate-500">({p.customer_name})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          تیراژ: {Number(p.quantity).toLocaleString('fa-IR')} عدد | تلفن: {p.customer_phone || '---'} | مرحله: {p.current_stage}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md">
                      مشاهده در آرشیو
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {filteredNav.length === 0 && matchingProjects.length === 0 && (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-600">هیچ مورد یا دستوری با عبارت «{query}» پیدا نشد.</p>
              <p className="text-[11px] text-slate-400">می‌توانید نام مشتری، شماره تلفن، نام محصول یا کد آرشیو را جستجو نمایید.</p>
            </div>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-bold flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span><kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-300 text-slate-700 font-mono">↑</kbd> <kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-300 text-slate-700 font-mono">↓</kbd> جابجایی</span>
            <span><kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-300 text-slate-700 font-mono">↵</kbd> انتخاب و باز کردن</span>
            <span><kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-300 text-slate-700 font-mono">ESC</kbd> بستن</span>
          </div>
          <span className="text-indigo-600">اتوماسیون جعبه‌سازی آرمان امیران</span>
        </div>
      </div>
    </div>
  );
}
