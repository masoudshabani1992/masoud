import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/helpers';
import {
  Boxes,
  PlusCircle,
  Calculator,
  Kanban,
  Inbox,
  BarChart3,
  Layers,
  Globe,
  UserCheck,
  Building2,
  Bell,
  Download,
  FilePlus2,
  Users,
  LogOut,
  ShieldCheck,
  LayoutGrid,
  ArrowRightLeft,
  Sparkles
} from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  myPendingCount = 0,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenLicense,
  licenseInfo
}) {
  const { currentUser, role, switchRole, logout } = useAuth();

  const isCeo = role === 'ceo';
  const isSales = role === 'sales' || role === 'secretary' || isCeo;
  const isEstimator = role === 'estimation' || role === 'accounting' || isCeo;
  const isDesigner = role === 'design' || isCeo;
  const isMockup = role === 'mockup' || role === 'outsource' || isCeo;
  const isProcurement = role === 'procurement' || role === 'warehouse' || isCeo;
  const isProduction = role === 'production' || isCeo;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm no-print w-full">
      {/* Top Banner / Factory Info & Admin Switcher */}
      <div className="bg-slate-900 text-white px-4 sm:px-6 lg:px-8 py-2.5 text-xs sm:text-sm border-b border-slate-800">
        <div className="w-full max-w-[2200px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-amber-400" />
            <span className="font-black text-amber-300 text-sm sm:text-base">اتوماسیون تولید (MIS) شرکت آرمان امیران</span>
            <span className="hidden lg:inline text-slate-400 text-xs">| پلتفرم یکپارچه مدیریت فرآیند ۹ مرحله‌ای تولید کارتن و جعبه</span>
          </div>

          {/* Role Switcher - ONLY for CEO / Admin */}
          {isCeo && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-300 flex items-center gap-1.5 text-xs font-semibold">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <span>سوئیچ تست (مختص مدیرعامل):</span>
              </span>
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => switchRole(r.id)}
                    className={`px-2 py-0.5 rounded text-[11px] transition-all font-semibold ${
                      role === r.id
                        ? `${r.color} text-white shadow-sm font-black ring-1 ring-white/30`
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                    title={r.desc}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="w-full max-w-[2200px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between flex-wrap gap-4">
        {/* Brand & Current Logged-in User */}
        <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => setActiveTab('hub')}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 via-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Boxes className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-black text-slate-800 text-xl tracking-tight">
                اتوماسیون تولید (MIS) شرکت آرمان امیران
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                نسخه کارخانه‌ای ۲.۵
              </span>
            </div>
            <div className="text-xs sm:text-sm text-slate-500 flex items-center gap-2 mt-0.5">
              <span>کاربر فعال: <strong className="text-slate-800 font-black">{currentUser?.fullName || currentUser?.full_name}</strong></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span className="text-indigo-600 font-bold">({currentUser?.department})</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span className="font-mono text-slate-400 text-xs">@{currentUser?.username}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons & Logout */}
        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* License Status Badge Button */}
          <button
            onClick={onOpenLicense}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition text-emerald-800 font-bold text-xs shadow-xs"
            title="مشاهده اطلاعات لایسنس و قفل سخت‌افزاری"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">لایسنس معتبر</span>
          </button>

          {/* AI Assistant Fast Access Button */}
          <button
            onClick={() => setActiveTab('ai_assistant')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-black rounded-xl transition-all shadow-xs border ${
              activeTab === 'ai_assistant'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white border-purple-800 shadow-md ring-2 ring-purple-400'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200'
            }`}
            title="دستیار هوش مصنوعی و بهینه‌ساز فرم‌بندی مقوا"
          >
            <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
            <span>هوش مصنوعی (AI)</span>
          </button>

          {/* Notification Bell with Badge */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all text-slate-700 hover:text-indigo-700 shadow-xs group"
            title="مرکز اعلان‌ها و نوتیفیکیشن‌ها"
          >
            <Bell className="w-5 h-5 group-hover:animate-swing" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse shadow-xs ring-2 ring-white">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          <a
            href="/download-setup"
            download="box-factory-windows-setup.zip"
            className="flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors shadow-sm"
            title="دانلود پکیج کامل ستاپ ویندوز سرور"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span className="hidden md:inline">دانلود ستاپ سرور</span>
          </a>

          {(isEstimator || isCeo) && (
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-sm border ${
                activeTab === 'calculator'
                  ? 'bg-amber-500 text-slate-900 border-amber-600 font-black'
                  : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200'
              }`}
            >
              <Calculator className="w-4 h-4 text-amber-600" />
              <span>ماشین‌حساب قیمت</span>
            </button>
          )}

          {(isSales || isCeo) && (
            <button
              onClick={() => setActiveTab('new_order')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-black rounded-xl transition-all shadow-md active:scale-95 ${
                activeTab === 'new_order'
                  ? 'bg-indigo-700 text-white ring-2 ring-indigo-400'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>ثبت سفارش جدید</span>
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors shadow-sm"
            title="خروج از حساب کاربری"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>خروج</span>
          </button>
        </div>
      </div>

      {/* Grid Tabs Navigation Bar - 100% No Horizontal Scroll */}
      <div className="border-t border-slate-200 bg-slate-100/90 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="w-full max-w-[2200px] mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-2">
          
          {/* 1. Department Hub */}
          <button
            onClick={() => setActiveTab('hub')}
            className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border text-center ${
              activeTab === 'hub'
                ? 'bg-slate-900 text-amber-300 border-slate-800 shadow-md ring-2 ring-slate-900/30'
                : 'bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border-slate-200 shadow-xs'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="truncate">صفحه اصلی</span>
          </button>

          {/* 2. Workflow Kanban Board */}
          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border text-center ${
              activeTab === 'kanban'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-400'
                : 'bg-white text-slate-700 hover:text-indigo-600 hover:bg-slate-50 border-slate-200 shadow-xs'
            }`}
          >
            <Kanban className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <span className="truncate">گردش کار تولید (۹ مرحله)</span>
          </button>

          {/* 3. Products & Orders Archive */}
          <button
            onClick={() => setActiveTab('archive')}
            className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border text-center ${
              activeTab === 'archive'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-400'
                : 'bg-white text-slate-700 hover:text-indigo-600 hover:bg-slate-50 border-slate-200 shadow-xs'
            }`}
          >
            <Boxes className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="truncate">آرشیو و جستجوی کارها</span>
          </button>

          {/* 4. New Order (Sales / CEO) */}
          {(isSales || isCeo) && (
            <button
              onClick={() => setActiveTab('new_order')}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border text-center ${
                activeTab === 'new_order'
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-400'
                  : 'bg-white text-slate-700 hover:text-indigo-600 hover:bg-slate-50 border-slate-200 shadow-xs'
              }`}
            >
              <FilePlus2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="truncate">ثبت سفارش جدید</span>
            </button>
          )}

          {/* 5. My Tasks Inbox */}
          <button
            onClick={() => setActiveTab('my_tasks')}
            className={`relative flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border text-center ${
              activeTab === 'my_tasks'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-400'
                : 'bg-white text-slate-700 hover:text-indigo-600 hover:bg-slate-50 border-slate-200 shadow-xs'
            }`}
          >
            <Inbox className="w-4 h-4 text-cyan-500 flex-shrink-0" />
            <span className="truncate">کارتابل وظایف من</span>
            {myPendingCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse shadow-xs">
                {myPendingCount}
              </span>
            )}
          </button>

          {/* 6. Dashboard (CEO / Production) */}
          {(isCeo || isProduction) && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border text-center ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-400'
                  : 'bg-white text-slate-700 hover:text-indigo-600 hover:bg-slate-50 border-slate-200 shadow-xs'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <span className="truncate">داشبورد و آمار</span>
            </button>
          )}

          {/* 7. Raw Materials Prices */}
          {(isEstimator || isProcurement || isCeo) && (
            <button
              onClick={() => setActiveTab('materials')}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border text-center ${
                activeTab === 'materials'
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-400'
                  : 'bg-white text-slate-700 hover:text-indigo-600 hover:bg-slate-50 border-slate-200 shadow-xs'
              }`}
            >
              <Layers className="w-4 h-4 text-teal-500 flex-shrink-0" />
              <span className="truncate">قیمت روز مقوا و متریال</span>
            </button>
          )}

          {/* 8. Data Migration & Import */}
          {(isCeo || isSales || isEstimator) && (
            <button
              onClick={() => setActiveTab('migration')}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border text-center ${
                activeTab === 'migration'
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-300'
                  : 'bg-amber-50/90 text-amber-900 hover:bg-amber-100 hover:text-amber-950 border-amber-300 shadow-xs'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span className="truncate">انتقال و ایمپورت اکسل</span>
            </button>
          )}

          {/* 9. AI Packaging Copilot */}
          <button
            onClick={() => setActiveTab('ai_assistant')}
            className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border text-center ${
              activeTab === 'ai_assistant'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-amber-300 border-purple-800 shadow-md ring-2 ring-purple-400'
                : 'bg-purple-50 text-purple-900 hover:text-purple-950 hover:bg-purple-100 border-purple-200 shadow-xs'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 animate-pulse" />
            <span className="truncate">دستیار هوش مصنوعی</span>
          </button>

          {/* 10. User Management (CEO only) */}
          {isCeo && (
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border text-center ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-400'
                  : 'bg-white text-slate-700 hover:text-indigo-600 hover:bg-slate-50 border-slate-200 shadow-xs'
              }`}
            >
              <Users className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span className="truncate">مدیریت پرسنل</span>
            </button>
          )}

          {/* 11. Subdomain Deployment Guide */}
          <button
            onClick={() => setActiveTab('subdomain_guide')}
            className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border text-center ${
              activeTab === 'subdomain_guide'
                ? 'bg-indigo-50 text-indigo-800 border-indigo-300 shadow-sm'
                : 'bg-white text-slate-600 hover:text-indigo-600 border-slate-200 shadow-xs'
            }`}
          >
            <Globe className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <span className="truncate">استقرار ساب‌دامین</span>
          </button>

        </div>
      </div>
    </header>
  );
}
