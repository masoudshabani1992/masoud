import React, { useState, useRef, useEffect } from 'react';
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
  Sparkles,
  Box,
  Crown,
  FileSpreadsheet,
  Package,
  Printer,
  Scissors,
  ChevronDown,
  Scroll,
  Film,
  Maximize2,
  Droplet
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
  const { currentUser, role, switchRole, logout, hasPermission } = useAuth();
  
  // Dropdowns state
  const [showProdDropdown, setShowProdDropdown] = useState(false);
  const [showWhDropdown, setShowWhDropdown] = useState(false);
  
  const prodRef = useRef(null);
  const whRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (prodRef.current && !prodRef.current.contains(event.target)) {
        setShowProdDropdown(false);
      }
      if (whRef.current && !whRef.current.contains(event.target)) {
        setShowWhDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isCeo = role === 'ceo';
  const isMarketer = role === 'marketer';
  const isDesigner = role === 'design';

  // Permission Checks
  const canHub = hasPermission('can_view_hub');
  
  const canProdOffset = hasPermission('can_view_production_offset');
  const canProdDigital = hasPermission('can_view_production_digital');
  const canProdService = hasPermission('can_view_production_service');
  const canProdDropdown = canProdOffset || canProdDigital || canProdService;

  const canWhCardboard = hasPermission('can_view_warehouse_cardboard');
  const canWhSheet = hasPermission('can_view_warehouse_sheet_carton');
  const canWhSingle = hasPermission('can_view_warehouse_single_face');
  const canWhCellophane = hasPermission('can_view_warehouse_cellophane');
  const canWhFilm = hasPermission('can_view_warehouse_pvc_film');
  const canWhInk = hasPermission('can_view_warehouse_ink');
  const canWhDropdown = canWhCardboard || canWhSheet || canWhSingle || canWhCellophane || canWhFilm || canWhInk;

  const canKanban = hasPermission('can_view_kanban');
  const canArchive = hasPermission('can_view_archive');
  const canStudio = hasPermission('can_view_studio');
  const canAi = hasPermission('can_view_ai');
  const canMarketing = hasPermission('can_view_marketing');
  const canMyTasks = hasPermission('can_view_my_tasks');
  const canCalculator = hasPermission('can_view_calculator');
  const canDashboard = hasPermission('can_view_dashboard');
  const canCreateOrder = hasPermission('can_create_order');
  const canManageUsers = hasPermission('can_manage_users');

  const isProdActive = ['production_orders', 'production_orders_offset', 'digital_orders', 'production_orders_digital', 'service_orders', 'production_orders_service'].includes(activeTab);
  const isWhActive = ['warehouse_inventory', 'warehouse_cardboard', 'warehouse_sheet_carton', 'warehouse_single_face', 'warehouse_cellophane', 'warehouse_pvc_film', 'warehouse_ink'].includes(activeTab);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm no-print w-full">
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
        <div
          className={`flex items-center gap-3.5 ${canHub ? 'cursor-pointer' : ''}`}
          onClick={() => {
            if (canHub) setActiveTab('hub');
          }}
        >
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
              <span className="text-indigo-600 font-bold">({currentUser?.department || ROLES.find(r => r.id === role)?.name})</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span className="font-mono text-slate-400 text-xs">@{currentUser?.username}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons & Logout */}
        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* License Status Badge Button */}
          {isCeo && (
            <button
              onClick={onOpenLicense}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition text-emerald-800 font-bold text-xs shadow-xs"
              title="مشاهده اطلاعات لایسنس و قفل سخت‌افزاری"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">لایسنس معتبر</span>
            </button>
          )}

          {/* Amiran Design Studio Fast Access Button */}
          {canStudio && (
            <button
              onClick={() => setActiveTab('dieline_generator')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-black rounded-xl transition-all shadow-xs border ${
                activeTab === 'dieline_generator' || activeTab === '3d_studio'
                  ? 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white border-amber-600 shadow-md ring-2 ring-amber-400'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
              }`}
              title="استودیو طراحی امیران: تولید نقشه خط تیغ و رندرینگ ۳ بعدی"
            >
              <Box className="w-4 h-4 text-amber-600" />
              <span>استودیو طراحی امیران</span>
            </button>
          )}

          {/* Calculator Button */}
          {canCalculator && (
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-sm border ${
                activeTab === 'calculator'
                  ? 'bg-amber-500 text-slate-900 border-amber-600 font-black ring-2 ring-amber-400'
                  : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200'
              }`}
              title="ماشین‌حساب برآورد صنعتی قیمت جعبه و استعلامات"
            >
              <Calculator className="w-4 h-4 text-amber-600" />
              <span>ماشین‌حساب قیمت</span>
            </button>
          )}

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

          {/* New Order Button */}
          {canCreateOrder && (
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

      {/* Main Top Navigation Menu Bar */}
      <div className="border-t border-slate-200 bg-slate-100/90 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="w-full max-w-[2200px] mx-auto flex flex-wrap items-center justify-between gap-2">
          
          <div className="flex flex-wrap items-center gap-2 w-full">
            
            {/* 1. صفحه اصلی (Hub) */}
            {canHub && (
              <button
                onClick={() => setActiveTab('hub')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border ${
                  activeTab === 'hub'
                    ? 'bg-slate-900 text-amber-300 border-slate-800 shadow-md ring-2 ring-slate-900/30'
                    : 'bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border-slate-200 shadow-xs'
                }`}
              >
                <LayoutGrid className="w-4 h-4 text-amber-500" />
                <span>صفحه اصلی</span>
              </button>
            )}

            {/* 2. دستور تولید (Production Order Main Dropdown) */}
            {canProdDropdown && (
              <div className="relative" ref={prodRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowProdDropdown(!showProdDropdown);
                    setShowWhDropdown(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border shadow-xs ${
                    isProdActive
                      ? 'bg-indigo-700 text-white border-indigo-800 shadow-md ring-2 ring-indigo-400'
                      : 'bg-white text-indigo-900 hover:bg-indigo-50 border-indigo-200 hover:border-indigo-300'
                  }`}
                >
                  <FileSpreadsheet className={`w-4 h-4 ${isProdActive ? 'text-amber-300' : 'text-indigo-600'}`} />
                  <span>دستور تولید</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showProdDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu: ۱. تولید | ۲. دیجیتال | ۳. خدماتی */}
                {showProdDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border-2 border-indigo-200 py-2 z-50 animate-fadeIn space-y-1">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-100">
                      زیرمجموعه‌های دستور تولید:
                    </div>

                    {/* Sub-item 1: تولید */}
                    {canProdOffset && (
                      <button
                        onClick={() => {
                          setActiveTab('production_orders');
                          setShowProdDropdown(false);
                        }}
                        className={`w-full text-right px-3.5 py-2.5 text-xs font-bold transition-colors flex items-center justify-between ${
                          activeTab === 'production_orders' || activeTab === 'production_orders_offset'
                            ? 'bg-indigo-50 text-indigo-900 font-black'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                            ۱
                          </div>
                          <div>
                            <div className="font-black text-slate-900">۱. تولید (افست)</div>
                            <div className="text-[10px] text-slate-400">۳ رنگ: سفید (صف)، زرد (مالی)، سبز (بایگانی)</div>
                          </div>
                        </div>
                      </button>
                    )}

                    {/* Sub-item 2: دیجیتال */}
                    {canProdDigital && (
                      <button
                        onClick={() => {
                          setActiveTab('digital_orders');
                          setShowProdDropdown(false);
                        }}
                        className={`w-full text-right px-3.5 py-2.5 text-xs font-bold transition-colors flex items-center justify-between ${
                          activeTab === 'digital_orders' || activeTab === 'production_orders_digital'
                            ? 'bg-purple-50 text-purple-900 font-black'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                            ۲
                          </div>
                          <div>
                            <div className="font-black text-purple-950">۲. دیجیتال</div>
                            <div className="text-[10px] text-slate-400">چاپ‌های با دستگاه‌های دیجیتال و نمونه</div>
                          </div>
                        </div>
                      </button>
                    )}

                    {/* Sub-item 3: خدماتی */}
                    {canProdService && (
                      <button
                        onClick={() => {
                          setActiveTab('service_orders');
                          setShowProdDropdown(false);
                        }}
                        className={`w-full text-right px-3.5 py-2.5 text-xs font-bold transition-colors flex items-center justify-between ${
                          activeTab === 'service_orders' || activeTab === 'production_orders_service'
                            ? 'bg-amber-50 text-amber-900 font-black'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                            ۳
                          </div>
                          <div>
                            <div className="font-black text-amber-950">۳. خدماتی</div>
                            <div className="text-[10px] text-slate-400">تنها انجام خدمات روی جعبه مشتری (دایکات/سلفون)</div>
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. انبار (Warehouse Main Dropdown: مقوا، ورق، سینگل، سلفون، طلق، مرکب) */}
            {canWhDropdown && (
              <div className="relative" ref={whRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowWhDropdown(!showWhDropdown);
                    setShowProdDropdown(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border shadow-xs ${
                    isWhActive
                      ? 'bg-sky-700 text-white border-sky-800 shadow-md ring-2 ring-sky-400'
                      : 'bg-white text-sky-900 hover:bg-sky-50 border-sky-200 hover:border-sky-300'
                  }`}
                >
                  <Package className={`w-4 h-4 ${isWhActive ? 'text-amber-300' : 'text-sky-600'}`} />
                  <span>انبار</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showWhDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu: ۱.مقوا | ۲.ورق | ۳.سینگل | ۴.سلفون | ۵.طلق | ۶.مرکب */}
                {showWhDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border-2 border-sky-200 py-2 z-50 animate-fadeIn space-y-1">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-100">
                      زیرمجموعه‌های انبار کارخانه:
                    </div>

                    {/* Sub 1: مقوا */}
                    {canWhCardboard && (
                      <button
                        onClick={() => {
                          setActiveTab('warehouse_cardboard');
                          setShowWhDropdown(false);
                        }}
                        className={`w-full text-right px-3.5 py-2 text-xs font-bold transition-colors flex items-center gap-2.5 ${
                          activeTab === 'warehouse_cardboard' || activeTab === 'warehouse_inventory'
                            ? 'bg-sky-50 text-sky-950 font-black'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-[11px]">۱</div>
                        <div>
                          <div className="font-bold text-slate-900">۱. مقوا</div>
                          <div className="text-[10px] text-slate-400">ایندربرد، پشت طوسی، گلاسه، کرافت</div>
                        </div>
                      </button>
                    )}

                    {/* Sub 2: ورق */}
                    {canWhSheet && (
                      <button
                        onClick={() => {
                          setActiveTab('warehouse_sheet_carton');
                          setShowWhDropdown(false);
                        }}
                        className={`w-full text-right px-3.5 py-2 text-xs font-bold transition-colors flex items-center gap-2.5 ${
                          activeTab === 'warehouse_sheet_carton'
                            ? 'bg-amber-50 text-amber-950 font-black'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[11px]">۲</div>
                        <div>
                          <div className="font-bold text-slate-900">۲. ورق</div>
                          <div className="text-[10px] text-slate-400">ورق ۳ لایه و ۵ لایه کارتن (E/B/C Flute)</div>
                        </div>
                      </button>
                    )}

                    {/* Sub 3: سینگل */}
                    {canWhSingle && (
                      <button
                        onClick={() => {
                          setActiveTab('warehouse_single_face');
                          setShowWhDropdown(false);
                        }}
                        className={`w-full text-right px-3.5 py-2 text-xs font-bold transition-colors flex items-center gap-2.5 ${
                          activeTab === 'warehouse_single_face'
                            ? 'bg-teal-50 text-teal-950 font-black'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-md bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-[11px]">۳</div>
                        <div>
                          <div className="font-bold text-slate-900">۳. سینگل</div>
                          <div className="text-[10px] text-slate-400">رول و شیت سینگل فلوت بهداشتی و صنعتی</div>
                        </div>
                      </button>
                    )}

                    {/* Sub 4: سلفون */}
                    {canWhCellophane && (
                      <button
                        onClick={() => {
                          setActiveTab('warehouse_cellophane');
                          setShowWhDropdown(false);
                        }}
                        className={`w-full text-right px-3.5 py-2 text-xs font-bold transition-colors flex items-center gap-2.5 ${
                          activeTab === 'warehouse_cellophane'
                            ? 'bg-indigo-50 text-indigo-950 font-black'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px]">۴</div>
                        <div>
                          <div className="font-bold text-slate-900">۴. سلفون</div>
                          <div className="text-[10px] text-slate-400">حرارتی مات، براق، مخملی، واتربیس، شنی</div>
                        </div>
                      </button>
                    )}

                    {/* Sub 5: طلق */}
                    {canWhFilm && (
                      <button
                        onClick={() => {
                          setActiveTab('warehouse_pvc_film');
                          setShowWhDropdown(false);
                        }}
                        className={`w-full text-right px-3.5 py-2 text-xs font-bold transition-colors flex items-center gap-2.5 ${
                          activeTab === 'warehouse_pvc_film'
                            ? 'bg-purple-50 text-purple-950 font-black'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[11px]">۵</div>
                        <div>
                          <div className="font-bold text-slate-900">۵. طلق</div>
                          <div className="text-[10px] text-slate-400">طلق شفاف PVC، طلق سخت PET، پنجره جعبه</div>
                        </div>
                      </button>
                    )}

                    {/* Sub 6: مرکب */}
                    {canWhInk && (
                      <button
                        onClick={() => {
                          setActiveTab('warehouse_ink');
                          setShowWhDropdown(false);
                        }}
                        className={`w-full text-right px-3.5 py-2 text-xs font-bold transition-colors flex items-center gap-2.5 ${
                          activeTab === 'warehouse_ink'
                            ? 'bg-rose-50 text-rose-950 font-black'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[11px]">۶</div>
                        <div>
                          <div className="font-bold text-slate-900">۶. مرکب</div>
                          <div className="text-[10px] text-slate-400">مرکب افست CMYK، طلایی، نقره‌ای، پنتون، ورنی</div>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 4. گردش کار ۹ مرحله (Kanban) */}
            {canKanban && (
              <button
                onClick={() => setActiveTab('kanban')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border ${
                  activeTab === 'kanban'
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-400'
                    : 'bg-white text-slate-700 hover:text-indigo-600 hover:bg-slate-50 border-slate-200 shadow-xs'
                }`}
              >
                <Kanban className="w-4 h-4 text-indigo-500" />
                <span>گردش کار ۹ مرحله</span>
              </button>
            )}

            {/* 5. آرشیو و جستجو (Archive) */}
            {canArchive && (
              <button
                onClick={() => setActiveTab('archive')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border ${
                  activeTab === 'archive'
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-400'
                    : 'bg-white text-slate-700 hover:text-indigo-600 hover:bg-slate-50 border-slate-200 shadow-xs'
                }`}
              >
                <Boxes className="w-4 h-4 text-amber-500" />
                <span>آرشیو و جستجو</span>
              </button>
            )}

            {/* 6. استودیو طراحی امیران */}
            {canStudio && (
              <button
                onClick={() => setActiveTab('dieline_generator')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border ${
                  activeTab === 'dieline_generator' || activeTab === '3d_studio'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md ring-2 ring-amber-400'
                    : 'bg-white text-slate-700 hover:text-amber-700 hover:bg-amber-50 border-slate-200 shadow-xs'
                }`}
              >
                <Box className="w-4 h-4 text-amber-500" />
                <span>طراحی امیران</span>
              </button>
            )}

            {/* 7. هوش مصنوعی */}
            {canAi && (
              <button
                onClick={() => setActiveTab('ai_assistant')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border ${
                  activeTab === 'ai_assistant'
                    ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-amber-300 border-purple-800 shadow-md ring-2 ring-purple-400'
                    : 'bg-purple-50 text-purple-900 hover:text-purple-950 hover:bg-purple-100 border-purple-200 shadow-xs'
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                <span>هوش مصنوعی</span>
              </button>
            )}

            {/* 8. استعلام بازاریاب */}
            {canMarketing && (
              <button
                onClick={() => setActiveTab('marketing')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border ${
                  activeTab === 'marketing'
                    ? 'bg-teal-600 text-white border-teal-700 shadow-md ring-2 ring-teal-400'
                    : 'bg-teal-50 text-teal-900 hover:text-teal-950 hover:bg-teal-100 border-teal-300 shadow-xs'
                }`}
              >
                <Users className="w-4 h-4 text-teal-600" />
                <span>استعلام بازاریاب</span>
              </button>
            )}

            {/* 9. وظایف من */}
            {canMyTasks && (
              <button
                onClick={() => setActiveTab('my_tasks')}
                className={`relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border ${
                  activeTab === 'my_tasks'
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-400'
                    : 'bg-white text-slate-700 hover:text-indigo-600 hover:bg-slate-50 border-slate-200 shadow-xs'
                }`}
              >
                <Inbox className="w-4 h-4 text-cyan-500" />
                <span>وظایف من</span>
                {myPendingCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse shadow-xs">
                    {myPendingCount}
                  </span>
                )}
              </button>
            )}

            {/* 10. داشبورد */}
            {canDashboard && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-400'
                    : 'bg-white text-slate-700 hover:text-indigo-600 hover:bg-slate-50 border-slate-200 shadow-xs'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-purple-500" />
                <span>داشبورد</span>
              </button>
            )}

            {/* 11. پرسنل (مدیرعامل / دسترسی کاربران) */}
            {canManageUsers && (
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all border ${
                  activeTab === 'users'
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-400'
                    : 'bg-white text-slate-700 hover:text-indigo-600 hover:bg-slate-50 border-slate-200 shadow-xs'
                }`}
              >
                <Users className="w-4 h-4 text-purple-600" />
                <span>مدیریت پرسنل و دسترسی‌ها</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
