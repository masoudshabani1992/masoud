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
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 select-none" dir="rtl">
      
      {/* Right Side: Mobile Hamburger & Current Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          title="باز کردن منوی ناوبری"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 hidden sm:block" />
          <h1 className="text-sm sm:text-base font-black text-slate-900 truncate">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Center: Universal Ctrl+K Global Search Bar */}
      <div className="flex-1 max-w-lg hidden md:block">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl bg-slate-100/80 hover:bg-slate-100 text-slate-500 hover:text-slate-700 text-xs font-bold border border-slate-200/80 transition shadow-inner group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
            <span>جستجوی سریع: مشتری، شماره سفارش، پرونده یا خط تیغ...</span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[10px] bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-slate-600 shadow-2xs">
            <Command className="w-3 h-3" />
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
          className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          title="جستجو (Ctrl+K)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Date & Time Widget */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span>{currentDate}</span>
          <span className="text-slate-300">|</span>
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span className="font-mono text-slate-800">{currentTime}</span>
        </div>

        {/* Download Training Manual PDF Button */}
        <a
          href="/TRAINING_MANUAL.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-bold transition shadow-2xs"
          title="دانلود دفترچه راهنمای سامانه کارخانه (PDF)"
        >
          <HelpCircle className="w-4 h-4 text-amber-600" />
          <span>راهنمای سیستم</span>
        </a>

        {/* Server License Gate Status */}
        {licenseInfo && (
          <button
            type="button"
            onClick={onOpenLicense}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition border ${
              licenseInfo.active
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
            }`}
            title="وضعیت لایسنس سخت‌افزاری سرور"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-mono text-[11px]">لایسنس فعال</span>
          </button>
        )}

        {/* Notification Bell */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95"
          title="مرکز اعلان‌ها و رویدادها"
        >
          <Bell className="w-4 h-4" />
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
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-black shadow-md shadow-indigo-600/25 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">سفارش جدید</span>
          </button>
        )}
      </div>
    </header>
  );
}
