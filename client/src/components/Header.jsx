import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Bell,
  PlusCircle,
  Menu,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
  Command,
  Key,
  Calendar,
  Layers,
  HelpCircle,
  Download
} from 'lucide-react';

const TAB_TITLES = {
  hub: 'میز کار و هاب دپارتمان‌ها',
  new_order: 'ثبت سفارش کامل صنعتی',
  archive: 'آرشیو و جستجوی سفارشات',
  kanban: 'گردش کار ۱۰ مرحله‌ای (کانبان)',
  my_tasks: 'کارتابل وظایف من',
  dashboard: 'داشبورد و آمار تحلیلی کارخانه',
  materials: 'قیمت روز متریال و فرمول‌ها',
  users: 'مدیریت پرسنل و دسترسی‌ها',
  hr: 'منابع انسانی و ارزیابی عملکرد (HR)',
  logs: 'لاگ و ممیزی کاربران',
  storage: 'پوشه Storage و مدیریت فایل‌ها',
  migration: 'مرکز مهاجرت داده و پشتیبان‌گیری',
  dieline_generator: 'استودیو طراحی امیران (۲D & ۳D)',
  '3d_studio': 'استودیو سه‌بعدی و رندرینگ',
  ai_assistant: 'دستیار هوش مصنوعی و بهینه‌ساز',
  calculator: 'ماشین‌حساب برآورد بهای تمام‌شده',
  marketing: 'کارتابل استعلام و تارگت بازاریاب',
  production_orders: 'دستور تولید (افست کارخانه)',
  production_orders_offset: 'دستور تولید (افست کارخانه)',
  digital_orders: 'دستور تولید دیجیتال',
  production_orders_digital: 'دستور تولید دیجیتال',
  service_orders: 'دستور تولید خدماتی و کارمزدی',
  production_orders_service: 'دستور تولید خدماتی و کارمزدی',
  warehouse_inventory: 'انبار مقوای ایندربرد و پشت‌طوسی',
  warehouse_cardboard: 'انبار مقوای ایندربرد و پشت‌طوسی',
  warehouse_sheet_carton: 'انبار ورق کارتن ۳ و ۵ لایه',
  warehouse_single_face: 'انبار رول و شیت سینگل فلوت',
  warehouse_cellophane: 'انبار رول‌های سلفون حرارتی',
  warehouse_pvc_film: 'انبار طلق شفاف PVC و PET',
  warehouse_ink: 'انبار مرکب، ورنی و چسب'
};

export default function Header({
  activeTab,
  setActiveTab,
  myPendingCount = 0,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenLicense,
  onOpenSearch,
  licenseInfo,
  onToggleMobileSidebar
}) {
  const { currentUser, role, hasPermission } = useAuth();
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('fa-IR', { day: 'numeric', month: 'long', year: 'numeric' })
      );
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const canCreateOrder = hasPermission('can_create_order');
  const currentTitle = TAB_TITLES[activeTab] || 'اتوماسیون کارخانه';

  return (
    <header className="h-16 bg-[#030712]/85 text-slate-100 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-30 shadow-lg px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 select-none" dir="rtl">
      
      {/* Right Side: Mobile Hamburger & Current Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition border border-slate-800"
          title="باز کردن منوی ناوبری"
        >
          <Menu className="w-5 h-5 text-cyan-400" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-pulse hidden sm:block" />
          <h1 className="text-sm sm:text-base font-black text-white truncate tracking-tight">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Center: Universal Ctrl+K Global Search Bar */}
      <div className="flex-1 max-w-lg hidden md:block">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-900 text-slate-400 hover:text-slate-200 text-xs font-bold border border-slate-800 transition shadow-inner group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-slate-400">جستجوی سریع: مشتری، شماره سفارش، پرونده یا خط تیغ...</span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[10px] bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-700 text-slate-400 shadow-2xs">
            <Command className="w-3 h-3 text-cyan-400" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Left Side: Actions, Time, Notifications, Training Manual */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        
        {/* Mobile Search Icon */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="md:hidden p-2 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 transition border border-slate-800"
          title="جستجو (Ctrl+K)"
        >
          <Search className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Date & Time Widget */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-bold text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300">{currentDate}</span>
          <span className="text-slate-600">|</span>
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-white">{currentTime}</span>
        </div>

        {/* Download Training Manual PDF Button */}
        <a
          href="/TRAINING_MANUAL.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition shadow-2xs"
          title="دانلود دفترچه راهنمای سامانه کارخانه (PDF)"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>راهنمای سیستم</span>
        </a>

        {/* Server License Gate Status */}
        {licenseInfo && (
          <button
            type="button"
            onClick={onOpenLicense}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition border ${
              licenseInfo.active
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80 hover:bg-emerald-950'
                : 'bg-rose-950/60 text-rose-300 border-rose-800/80 hover:bg-rose-950'
            }`}
            title="وضعیت لایسنس سخت‌افزاری سرور"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-[11px]">لایسنس فعال</span>
          </button>
        )}

        {/* Notification Bell */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition active:scale-95 border border-slate-800"
          title="مرکز اعلان‌ها و رویدادها"
        >
          <Bell className="w-4 h-4 text-cyan-400" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center animate-pulse shadow-md">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Quick New Order Button (Header) */}
        {canCreateOrder && (
          <button
            type="button"
            onClick={() => setActiveTab('new_order')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 text-xs font-black shadow-lg shadow-cyan-500/25 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span className="hidden sm:inline">سفارش جدید</span>
          </button>
        )}
      </div>
    </header>
  );
}
