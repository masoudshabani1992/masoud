import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLES, formatToman, formatNumber } from '../utils/helpers';
import {
  Menu,
  Search,
  Bell,
  Calculator,
  PlusCircle,
  Building2,
  Calendar,
  Clock,
  Sparkles,
  LayoutGrid,
  Layers,
  Package,
  BarChart3,
  Kanban,
  Boxes,
  Box,
  Users,
  Inbox,
  Settings,
  ShieldCheck,
  Zap,
  ChevronLeft
} from 'lucide-react';

const TAB_TITLES = {
  hub: { title: 'میز کار و صفحه اصلی (هاب)', desc: 'دسترسی سریع به تمامی دپارتمان‌های کارخانه', icon: LayoutGrid, color: 'text-indigo-600' },
  my_tasks: { title: 'کارتابل وظایف من', desc: 'سفارشات در انتظار اقدام و بررسی واحد شما', icon: Inbox, color: 'text-cyan-600' },
  marketing: { title: 'کارتابل بازاریابی و استعلام قیمت', desc: 'ثبت استعلام، پیگیری مشتریان و تارگت ماهانه', icon: Users, color: 'text-teal-600' },
  new_order: { title: 'ثبت پرونده و سفارش جدید', desc: 'تکمیل فرم استاندارد صنعتی ۱۰ مرحله‌ای', icon: PlusCircle, color: 'text-amber-600' },
  production_orders: { title: 'دستور تولید کارخانه (افست)', desc: 'صف تولید ۴ رنگ: سفید، زرد، قرمز، سبز', icon: Layers, color: 'text-indigo-600' },
  digital_orders: { title: 'دستور چاپ دیجیتال', desc: 'سفارشات چاپ با دستگاه‌های دیجیتال کارخانه', icon: Layers, color: 'text-purple-600' },
  service_orders: { title: 'دستور کارهای خدماتی', desc: 'خدمات دایکات، لامینت و سلفون روی جعبه مشتری', icon: Layers, color: 'text-amber-600' },
  warehouse_cardboard: { title: 'انبار مقوا (ایندربرد / پشت طوسی)', desc: 'ورود پارت‌های دریافتی و کنترل موجودی شیت', icon: Package, color: 'text-sky-600' },
  warehouse_sheet_carton: { title: 'انبار ورق کارتن (۳ و ۵ لایه)', desc: 'ورق‌های E و B و C فلوت و سینگل', icon: Package, color: 'text-amber-600' },
  warehouse_single_face: { title: 'انبار سینگل فلوت', desc: 'رول و شیت سینگل فیس کارتن', icon: Package, color: 'text-teal-600' },
  warehouse_cellophane: { title: 'انبار سلفون (مات و براق و مخملی)', desc: 'رول‌های سلفون حرارتی و واتر‌بیس', icon: Package, color: 'text-indigo-600' },
  warehouse_pvc_film: { title: 'انبار طلق شفاف PVC و پنجره', desc: 'طلق‌های جعبه‌های پنجره‌دار و اسکین پک', icon: Package, color: 'text-purple-600' },
  warehouse_ink: { title: 'انبار مرکب و رنگ چاپ', desc: 'مرکب افست CMYK، پنتون، طلایی و ورنی', icon: Package, color: 'text-rose-600' },
  warehouse_inventory: { title: 'انبار مرکزی کارخانه', desc: 'دفاتر ورودی متریال و اکسل موجودی', icon: Package, color: 'text-sky-600' },
  dashboard: { title: 'داشبورد و آمار تحلیلی', desc: 'نمودارهای راندمان تولید و گردش مالی کارخانه', icon: BarChart3, color: 'text-purple-600' },
  kanban: { title: 'گردش کار ۱۰ مرحله (کانبان)', desc: 'مشاهده جریان سفارشات در خطوط ۱۰ گانه', icon: Kanban, color: 'text-indigo-600' },
  archive: { title: 'آرشیو جامع محصولات و سفارشات', desc: 'جستجو در بانک اطلاعاتی جعبه‌ها و نقشه‌ها', icon: Boxes, color: 'text-amber-600' },
  dieline_generator: { title: 'استودیو طراحی امیران', desc: 'طراحی خط تیغ پارامتریک، خروجی CorelDRAW و 3D', icon: Box, color: 'text-amber-600' },
  '3d_studio': { title: 'استودیو سه‌بعدی و خط تیغ', desc: 'موکاپ ۳ بعدی واقعی و شیدرهای PBR', icon: Box, color: 'text-amber-600' },
  ai_assistant: { title: 'دستیار هوش مصنوعی کارخانه', desc: 'استخراج سفارشات و چیدمان بهینه شیت', icon: Sparkles, color: 'text-purple-600' },
  calculator: { title: 'ماشین‌حساب برآورد صنعتی قیمت', desc: 'محاسبه بهای تمام شده مقوا، چاپ، سلفون و سود', icon: Calculator, color: 'text-amber-600' },
  users: { title: 'مدیریت پرسنل و دسترسی‌ها', desc: 'تعریف کاربران، رمز عبور و مجوزهای سازمانی', icon: Users, color: 'text-indigo-600' },
  hr: { title: 'ارزیابی عملکرد پرسنل (HR)', desc: 'پرونده پرسنلی و ارزیابی ۵ محوره پرسنل', icon: ShieldCheck, color: 'text-amber-600' },
  storage: { title: 'پوشه Storage و مدیریت فایل‌ها', desc: 'آرشیو فایل‌های خط تیغ و گرافیکی', icon: Settings, color: 'text-cyan-600' },
  logs: { title: 'لاگ و ممیزی کاربران (Audit Trail)', desc: 'ثبت لحظه‌ای تمامی فعالیت‌ها و تغییرات', icon: Settings, color: 'text-rose-600' },
  migration: { title: 'مرکز انتقال و ایمپورت اکسل', desc: 'انتقال سریع اطلاعات از اتوماسیون قدیمی', icon: Layers, color: 'text-amber-600' }
};

export default function Header({
  activeTab,
  setActiveTab,
  myPendingCount = 0,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenLicense,
  onOpenSearch,
  onToggleSidebarMobile
}) {
  const { currentUser, role, hasPermission } = useAuth();
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentInfo = TAB_TITLES[activeTab] || {
    title: 'اتوماسیون تولید شرکت آرمان امیران',
    desc: 'پلتفرم جامع مدیریت تولید کارتن و جعبه',
    icon: Building2,
    color: 'text-indigo-600'
  };

  const IconComp = currentInfo.icon;

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-30 shadow-xs px-4 sm:px-6 py-3 no-print">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        
        {/* Right Section: Mobile Toggle & Page Title Breadcrumb */}
        <div className="flex items-center gap-3">
          
          {/* Mobile Hamburger Button */}
          <button
            onClick={onToggleSidebarMobile}
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl lg:hidden transition-colors border border-slate-200"
            title="باز کردن منو"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Active View Title & Description */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center ${currentInfo.color} shadow-inner shrink-0 icon-box-3d`}>
              <IconComp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-slate-900 text-sm sm:text-base tracking-tight">
                  {currentInfo.title}
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                  نسخه ۲.۷.۴ (بیلد ۷۷)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                {currentInfo.desc}
              </p>
            </div>
          </div>

        </div>

        {/* Left Section: Universal Actions & Status */}
        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* Live Persian Date and Clock */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-600 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>{dateStr}</span>
            </div>
            <span className="w-1 h-3 bg-slate-300 rounded-full" />
            <div className="flex items-center gap-1 font-mono text-slate-700 font-black">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{timeStr}</span>
            </div>
          </div>

          {/* Universal Search Button (Ctrl + K) */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-indigo-700 border border-slate-200 rounded-xl transition text-xs font-bold shadow-2xs group"
              title="جستجوی سریع همه بخش‌ها و پرونده‌ها (Ctrl + K)"
            >
              <Search className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">جستجو...</span>
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded">
                Ctrl K
              </kbd>
            </button>
          )}

          {/* Price Calculator Quick Button */}
          {hasPermission('can_view_calculator') && (
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all shadow-2xs border ${
                activeTab === 'calculator'
                  ? 'bg-amber-200 text-amber-950 border-amber-300 font-black ring-2 ring-amber-300/60'
                  : 'text-amber-900 bg-amber-50/80 hover:bg-amber-100/90 border-amber-200/80'
              }`}
              title="ماشین‌حساب برآورد صنعتی قیمت جعبه"
            >
              <Calculator className="w-4 h-4 text-amber-700" />
              <span className="hidden md:inline">محاسبه قیمت</span>
            </button>
          )}

          {/* Notification Bell with Swinging Animation */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 bg-slate-50/80 hover:bg-violet-50 border border-slate-200 hover:border-violet-300 rounded-xl transition-all text-slate-600 hover:text-violet-700 shadow-2xs group"
            title="مرکز اعلان‌ها و نوتیفیکیشن‌ها"
          >
            <Bell className={`w-4 h-4 ${unreadNotificationsCount > 0 ? 'animate-bell text-violet-600' : ''}`} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-400 text-rose-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse shadow-xs ring-2 ring-white border border-rose-300">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* User Role Indicator Badge */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-r border-slate-200 pr-3">
            <div className="text-left">
              <div className="text-xs font-black text-slate-800 leading-tight">
                {currentUser?.fullName || currentUser?.full_name}
              </div>
              <div className="text-[10px] font-bold text-violet-700 leading-tight">
                {currentUser?.department || ROLES.find(r => r.id === role)?.name}
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-200 to-indigo-200 text-indigo-950 font-black flex items-center justify-center text-xs shadow-2xs border border-indigo-200">
              {currentUser?.fullName?.charAt(0) || 'U'}
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
