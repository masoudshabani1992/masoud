import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/helpers';
import {
  Boxes,
  LayoutGrid,
  Layers,
  Package,
  BarChart3,
  Kanban,
  Box,
  Sparkles,
  Users,
  Inbox,
  Settings,
  Calculator,
  PlusCircle,
  Key,
  HardDrive,
  Activity,
  Award,
  ChevronDown,
  Search,
  LogOut,
  Building2,
  UserCheck,
  Printer,
  Scissors,
  CheckCircle2,
  FileSpreadsheet,
  X,
  Compass,
  Zap,
  ShieldAlert,
  ChevronLeft,
  SlidersHorizontal,
  Flame
} from 'lucide-react';

export default function RightSidebar({
  activeTab,
  setActiveTab,
  myPendingCount = 0,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenLicense,
  onOpenSearch,
  isOpenMobile,
  onCloseMobile
}) {
  const { currentUser, role, logout, switchRole, hasPermission } = useAuth();
  const isCeo = role === 'ceo';

  // Submenu open states (auto-expand if child active)
  const [openSubmenu, setOpenSubmenu] = useState(() => {
    if (['production_orders', 'production_orders_offset', 'digital_orders', 'service_orders'].includes(activeTab)) return 'prod';
    if (['warehouse_inventory', 'warehouse_cardboard', 'warehouse_sheet_carton', 'warehouse_single_face', 'warehouse_cellophane', 'warehouse_pvc_film', 'warehouse_ink'].includes(activeTab)) return 'wh';
    if (['dashboard', 'kanban', 'archive'].includes(activeTab)) return 'dash';
    if (['users', 'hr', 'storage', 'logs'].includes(activeTab)) return 'settings';
    return null;
  });

  const toggleSubmenu = (key) => {
    setOpenSubmenu(prev => prev === key ? null : key);
  };

  // Permissions checks
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
  const canDashboard = hasPermission('can_view_dashboard');
  const canDashDropdown = canDashboard || canKanban || canArchive;

  const canStudio = hasPermission('can_view_studio');
  const canAi = hasPermission('can_view_ai');
  const canMarketing = hasPermission('can_view_marketing');
  const canMyTasks = hasPermission('can_view_my_tasks');
  const canCalculator = hasPermission('can_view_calculator');
  const canCreateOrder = hasPermission('can_create_order');
  const canManageUsers = hasPermission('can_manage_users');
  const canSettings = isCeo || canManageUsers;

  const isProdActive = ['production_orders', 'production_orders_offset', 'digital_orders', 'production_orders_digital', 'service_orders', 'production_orders_service'].includes(activeTab);
  const isWhActive = ['warehouse_inventory', 'warehouse_cardboard', 'warehouse_sheet_carton', 'warehouse_single_face', 'warehouse_cellophane', 'warehouse_pvc_film', 'warehouse_ink'].includes(activeTab);
  const isDashActive = ['dashboard', 'kanban', 'archive'].includes(activeTab);
  const isSettingsActive = ['users', 'hr', 'storage', 'logs'].includes(activeTab);

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
        />
      )}

      {/* Main Right Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 right-0 h-screen w-72 bg-white/95 backdrop-blur-xl border-l border-slate-200/90 shadow-xl z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Brand & Factory Header */}
        <div className="p-4 border-b border-slate-100 flex flex-col gap-3">
          
          <div className="flex items-center justify-between">
            {/* Brand Logo & Name */}
            <div
              onClick={() => { if (canHub) handleNavClick('hub'); }}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-2 ring-white group-hover:scale-105 transition-transform duration-200 icon-box-3d">
                <Boxes className="w-6 h-6 animate-float" />
              </div>
              <div>
                <h1 className="font-black text-slate-900 text-sm tracking-tight group-hover:text-indigo-600 transition-colors">
                  شرکت آرمان امیران
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-slate-500">اتوماسیون تولید (MIS)</span>
                  <span className="px-1.5 py-0.2 rounded-md text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100">
                    v2.5
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Search Bar (Ctrl+K) */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/90 hover:border-indigo-300 rounded-xl text-slate-500 hover:text-indigo-700 transition-all text-xs font-bold shadow-2xs group"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                <span>جستجوی سریع...</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
                Ctrl K
              </kbd>
            </button>
          )}

          {/* Quick New Order 3D Button */}
          {canCreateOrder && (
            <button
              onClick={() => handleNavClick('new_order')}
              className={`w-full py-2.5 px-3.5 btn-3d-amber flex items-center justify-center gap-2 text-xs font-black rounded-xl transition-all ${
                activeTab === 'new_order' ? 'ring-2 ring-amber-500' : ''
              }`}
            >
              <PlusCircle className="w-4 h-4 text-slate-900" />
              <span>ثبت سفارش صنعتی جدید</span>
            </button>
          )}

        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          
          {/* GROUP 1: میز کار و عملیات */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-black text-slate-400 tracking-wider flex items-center justify-between">
              <span>میز کار و عملیات</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            </div>

            {/* صفحه اصلی */}
            {canHub && (
              <button
                onClick={() => handleNavClick('hub')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'hub'
                    ? 'bg-gradient-to-l from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200 font-black'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-indigo-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    activeTab === 'hub' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 group-hover:text-indigo-600'
                  }`}>
                    <LayoutGrid className="w-4 h-4" />
                  </div>
                  <span>صفحه اصلی (هاب)</span>
                </div>
              </button>
            )}

            {/* وظایف من */}
            {canMyTasks && (
              <button
                onClick={() => handleNavClick('my_tasks')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'my_tasks'
                    ? 'bg-gradient-to-l from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200 font-black'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-indigo-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    activeTab === 'my_tasks' ? 'bg-white/20 text-white' : 'bg-cyan-50 text-cyan-700'
                  }`}>
                    <Inbox className="w-4 h-4" />
                  </div>
                  <span>وظایف من</span>
                </div>
                {myPendingCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-xs">
                    {myPendingCount}
                  </span>
                )}
              </button>
            )}

            {/* کارتابل بازاریابی */}
            {canMarketing && (
              <button
                onClick={() => handleNavClick('marketing')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'marketing'
                    ? 'bg-gradient-to-l from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-200 font-black'
                    : 'text-slate-700 hover:bg-teal-50/60 hover:text-teal-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    activeTab === 'marketing' ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-700'
                  }`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <span>استعلام و بازاریابی</span>
                </div>
              </button>
            )}
          </div>

          {/* GROUP 2: خط تولید و دستور کار */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-black text-slate-400 tracking-wider flex items-center justify-between">
              <span>خط تولید و انبار</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            </div>

            {/* دستور تولید Dropdown */}
            {canProdDropdown && (
              <div className="space-y-1">
                <button
                  onClick={() => toggleSubmenu('prod')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isProdActive
                      ? 'bg-indigo-50 text-indigo-900 font-black border border-indigo-200 shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isProdActive ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      <Layers className="w-4 h-4" />
                    </div>
                    <span>دستور تولید</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    openSubmenu === 'prod' ? 'rotate-180 text-indigo-600' : ''
                  }`} />
                </button>

                {/* Submenu Items */}
                {openSubmenu === 'prod' && (
                  <div className="pr-5 pl-2 py-1 space-y-1 animate-slide-down border-r-2 border-indigo-200 mr-3">
                    {canProdOffset && (
                      <button
                        onClick={() => handleNavClick('production_orders')}
                        className={`w-full text-right px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                          activeTab === 'production_orders' || activeTab === 'production_orders_offset'
                            ? 'bg-indigo-600 text-white shadow-xs font-black'
                            : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          <span>۱. تولید (افست)</span>
                        </div>
                        <span className="text-[10px] opacity-75">۳ رنگ</span>
                      </button>
                    )}

                    {canProdDigital && (
                      <button
                        onClick={() => handleNavClick('digital_orders')}
                        className={`w-full text-right px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                          activeTab === 'digital_orders' || activeTab === 'production_orders_digital'
                            ? 'bg-purple-600 text-white shadow-xs font-black'
                            : 'text-slate-600 hover:bg-purple-50 hover:text-purple-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          <span>۲. دیجیتال</span>
                        </div>
                        <Printer className="w-3.5 h-3.5 opacity-70" />
                      </button>
                    )}

                    {canProdService && (
                      <button
                        onClick={() => handleNavClick('service_orders')}
                        className={`w-full text-right px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                          activeTab === 'service_orders' || activeTab === 'production_orders_service'
                            ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                            : 'text-slate-600 hover:bg-amber-50 hover:text-amber-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>۳. خدماتی</span>
                        </div>
                        <Scissors className="w-3.5 h-3.5 opacity-70" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* انبار مرکزی Dropdown */}
            {canWhDropdown && (
              <div className="space-y-1">
                <button
                  onClick={() => toggleSubmenu('wh')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isWhActive
                      ? 'bg-sky-50 text-sky-950 font-black border border-sky-200 shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isWhActive ? 'bg-sky-600 text-white' : 'bg-sky-50 text-sky-600'
                    }`}>
                      <Package className="w-4 h-4" />
                    </div>
                    <span>انبار مرکزی</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    openSubmenu === 'wh' ? 'rotate-180 text-sky-600' : ''
                  }`} />
                </button>

                {/* Submenu Items */}
                {openSubmenu === 'wh' && (
                  <div className="pr-5 pl-2 py-1 space-y-1 animate-slide-down border-r-2 border-sky-200 mr-3">
                    {canWhCardboard && (
                      <button
                        onClick={() => handleNavClick('warehouse_cardboard')}
                        className={`w-full text-right px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                          activeTab === 'warehouse_cardboard' || activeTab === 'warehouse_inventory'
                            ? 'bg-sky-600 text-white font-black shadow-xs'
                            : 'text-slate-600 hover:bg-sky-50 hover:text-sky-900'
                        }`}
                      >
                        <span>۱. مقوا (شیت)</span>
                        <span className="text-[10px] opacity-75">ایندربرد</span>
                      </button>
                    )}

                    {canWhSheet && (
                      <button
                        onClick={() => handleNavClick('warehouse_sheet_carton')}
                        className={`w-full text-right px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                          activeTab === 'warehouse_sheet_carton'
                            ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                            : 'text-slate-600 hover:bg-amber-50 hover:text-amber-900'
                        }`}
                      >
                        <span>۲. ورق کارتن</span>
                        <span className="text-[10px] opacity-75">۳ و ۵ لایه</span>
                      </button>
                    )}

                    {canWhSingle && (
                      <button
                        onClick={() => handleNavClick('warehouse_single_face')}
                        className={`w-full text-right px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                          activeTab === 'warehouse_single_face'
                            ? 'bg-teal-600 text-white font-black shadow-xs'
                            : 'text-slate-600 hover:bg-teal-50 hover:text-teal-900'
                        }`}
                      >
                        <span>۳. سینگل فلوت</span>
                        <span className="text-[10px] opacity-75">E/B</span>
                      </button>
                    )}

                    {canWhCellophane && (
                      <button
                        onClick={() => handleNavClick('warehouse_cellophane')}
                        className={`w-full text-right px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                          activeTab === 'warehouse_cellophane'
                            ? 'bg-indigo-600 text-white font-black shadow-xs'
                            : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-900'
                        }`}
                      >
                        <span>۴. سلفون</span>
                        <span className="text-[10px] opacity-75">حرارتی</span>
                      </button>
                    )}

                    {canWhFilm && (
                      <button
                        onClick={() => handleNavClick('warehouse_pvc_film')}
                        className={`w-full text-right px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                          activeTab === 'warehouse_pvc_film'
                            ? 'bg-purple-600 text-white font-black shadow-xs'
                            : 'text-slate-600 hover:bg-purple-50 hover:text-purple-900'
                        }`}
                      >
                        <span>۵. طلق PVC</span>
                        <span className="text-[10px] opacity-75">پنجره</span>
                      </button>
                    )}

                    {canWhInk && (
                      <button
                        onClick={() => handleNavClick('warehouse_ink')}
                        className={`w-full text-right px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                          activeTab === 'warehouse_ink'
                            ? 'bg-rose-600 text-white font-black shadow-xs'
                            : 'text-slate-600 hover:bg-rose-50 hover:text-rose-900'
                        }`}
                      >
                        <span>۶. مرکب افست</span>
                        <span className="text-[10px] opacity-75">CMYK</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* GROUP 3: گردش کار ۱۰ مرحله و آرشیو */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-black text-slate-400 tracking-wider flex items-center justify-between">
              <span>گردش کار و آمار</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            </div>

            {/* داشبورد و آرشیو Dropdown */}
            {canDashDropdown && (
              <div className="space-y-1">
                <button
                  onClick={() => toggleSubmenu('dash')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isDashActive
                      ? 'bg-purple-50 text-purple-950 font-black border border-purple-200 shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isDashActive ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-600'
                    }`}>
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <span>داشبورد و آرشیو</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    openSubmenu === 'dash' ? 'rotate-180 text-purple-600' : ''
                  }`} />
                </button>

                {/* Submenu Items */}
                {openSubmenu === 'dash' && (
                  <div className="pr-5 pl-2 py-1 space-y-1 animate-slide-down border-r-2 border-purple-200 mr-3">
                    {canDashboard && (
                      <button
                        onClick={() => handleNavClick('dashboard')}
                        className={`w-full text-right px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                          activeTab === 'dashboard'
                            ? 'bg-purple-700 text-white shadow-xs font-black'
                            : 'text-slate-600 hover:bg-purple-50 hover:text-purple-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span>۱. آمار تحلیلی</span>
                        </div>
                      </button>
                    )}

                    {canKanban && (
                      <button
                        onClick={() => handleNavClick('kanban')}
                        className={`w-full text-right px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                          activeTab === 'kanban'
                            ? 'bg-indigo-600 text-white shadow-xs font-black'
                            : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Kanban className="w-3.5 h-3.5" />
                          <span>۲. گردش کار ۱۰ مرحله</span>
                        </div>
                        <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black">کانبان</span>
                      </button>
                    )}

                    {canArchive && (
                      <button
                        onClick={() => handleNavClick('archive')}
                        className={`w-full text-right px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                          activeTab === 'archive'
                            ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                            : 'text-slate-600 hover:bg-amber-50 hover:text-amber-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Boxes className="w-3.5 h-3.5" />
                          <span>۳. آرشیو و جستجو</span>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* GROUP 4: ابزارهای استودیو و هوش مصنوعی */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-black text-slate-400 tracking-wider flex items-center justify-between">
              <span>استودیو و طراحی</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            </div>

            {/* استودیو طراحی امیران */}
            {canStudio && (
              <button
                onClick={() => handleNavClick('dieline_generator')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'dieline_generator' || activeTab === '3d_studio'
                    ? 'bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-200 font-black'
                    : 'text-slate-700 hover:bg-amber-50/70 hover:text-amber-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    activeTab === 'dieline_generator' || activeTab === '3d_studio'
                      ? 'bg-white/30 text-slate-950'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    <Box className="w-4 h-4" />
                  </div>
                  <span>استودیو طراحی امیران</span>
                </div>
                <span className="text-[10px] font-mono px-1 py-0.2 bg-amber-100/60 rounded text-amber-800">3D</span>
              </button>
            )}

            {/* دستیار هوش مصنوعی */}
            {canAi && (
              <button
                onClick={() => handleNavClick('ai_assistant')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'ai_assistant'
                    ? 'bg-gradient-to-l from-purple-700 via-indigo-700 to-indigo-800 text-amber-300 shadow-md shadow-purple-200 font-black'
                    : 'text-purple-900 hover:bg-purple-50/70 hover:text-purple-950'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    activeTab === 'ai_assistant' ? 'bg-white/20 text-amber-300' : 'bg-purple-100 text-purple-700'
                  }`}>
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <span>دستیار هوش مصنوعی</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded">AI</span>
              </button>
            )}

            {/* ماشین حساب قیمت */}
            {canCalculator && (
              <button
                onClick={() => handleNavClick('calculator')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'calculator'
                    ? 'bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-200 font-black'
                    : 'text-slate-700 hover:bg-amber-50/60 hover:text-amber-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    activeTab === 'calculator' ? 'bg-white/30 text-slate-950' : 'bg-amber-50 text-amber-700'
                  }`}>
                    <Calculator className="w-4 h-4" />
                  </div>
                  <span>ماشین‌حساب قیمت</span>
                </div>
              </button>
            )}
          </div>

          {/* GROUP 5: تنظیمات اتوماسیون (مختص مدیرعامل و ادمین) */}
          {canSettings && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-black text-slate-400 tracking-wider flex items-center justify-between">
                <span>مدیریت سیستم</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => toggleSubmenu('settings')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isSettingsActive
                      ? 'bg-slate-900 text-amber-300 font-black shadow-md'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isSettingsActive ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-700'
                    }`}>
                      <Settings className="w-4 h-4" />
                    </div>
                    <span>تنظیمات اتوماسیون</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    openSubmenu === 'settings' ? 'rotate-180 text-amber-400' : ''
                  }`} />
                </button>

                {/* Submenu Items */}
                {openSubmenu === 'settings' && (
                  <div className="pr-5 pl-2 py-1 space-y-1 animate-slide-down border-r-2 border-slate-300 mr-3">
                    <button
                      onClick={() => {
                        if (onOpenLicense) onOpenLicense();
                      }}
                      className="w-full text-right px-3 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-900 transition-all flex items-center gap-2"
                    >
                      <Key className="w-3.5 h-3.5 text-emerald-600" />
                      <span>۱. لایسنس سرور</span>
                    </button>

                    <button
                      onClick={() => handleNavClick('users')}
                      className={`w-full text-right px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                        activeTab === 'users' ? 'bg-indigo-600 text-white font-black' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-900'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>۲. مدیریت پرسنل</span>
                    </button>

                    <button
                      onClick={() => handleNavClick('hr')}
                      className={`w-full text-right px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                        activeTab === 'hr' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-600 hover:bg-amber-50 hover:text-amber-900'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>۳. ارزیابی عملکرد HR</span>
                    </button>

                    <button
                      onClick={() => handleNavClick('storage')}
                      className={`w-full text-right px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                        activeTab === 'storage' ? 'bg-cyan-600 text-white font-black' : 'text-slate-600 hover:bg-cyan-50 hover:text-cyan-900'
                      }`}
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>۴. پوشه Storage</span>
                    </button>

                    <button
                      onClick={() => handleNavClick('logs')}
                      className={`w-full text-right px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                        activeTab === 'logs' ? 'bg-rose-600 text-white font-black' : 'text-slate-600 hover:bg-rose-50 hover:text-rose-900'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>۵. لاگ و ممیزی</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer User Profile & Quick Actions */}
        <div className="p-3.5 border-t border-slate-200/90 bg-slate-50/80 space-y-2.5">
          
          {/* Quick Role Switcher for CEO */}
          {isCeo && (
            <div className="bg-slate-900 text-white p-2 rounded-xl text-xs space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                <span className="flex items-center gap-1 text-cyan-400">
                  <UserCheck className="w-3 h-3" />
                  <span>سوئیچ سریع نقش (مدیرعامل):</span>
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {ROLES.slice(0, 8).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => switchRole(r.id)}
                    className={`py-0.5 text-[9px] font-black rounded transition-all truncate ${
                      role === r.id
                        ? 'bg-amber-400 text-slate-950 ring-1 ring-white shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                    title={r.name}
                  >
                    {r.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Logged in User Card */}
          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                {currentUser?.fullName?.charAt(0) || currentUser?.username?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <div className="font-black text-xs text-slate-800 truncate">
                  {currentUser?.fullName || currentUser?.full_name}
                </div>
                <div className="text-[10px] font-bold text-indigo-600 truncate">
                  {currentUser?.department || ROLES.find(r => r.id === role)?.name}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
              title="خروج از حساب"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </aside>
    </>
  );
}
