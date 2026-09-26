import React, { useState } from 'react';
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
  UserCheck,
  Building2,
  Bell,
  Users,
  LogOut,
  ShieldCheck,
  LayoutGrid,
  Sparkles,
  Box,
  Package,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Award,
  HardDrive,
  Search,
  Activity,
  Settings,
  Key,
  ShieldAlert,
  Printer,
  Compass,
  FileSpreadsheet,
  TrendingUp,
  Cpu,
  FolderTree,
  User,
  PanelRightClose,
  PanelRightOpen,
  X
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  myPendingCount = 0,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenLicense,
  onOpenSearch,
  licenseInfo,
  collapsed = false,
  setCollapsed,
  mobileOpen = false,
  setMobileOpen
}) {
  const { currentUser, role, switchRole, logout, hasPermission } = useAuth();

  // Accordion submenus
  const [openProductionMenu, setOpenProductionMenu] = useState(
    ['production_orders', 'production_orders_offset', 'digital_orders', 'production_orders_digital', 'service_orders', 'production_orders_service'].includes(activeTab)
  );
  const [openWarehouseMenu, setOpenWarehouseMenu] = useState(
    ['warehouse_inventory', 'warehouse_cardboard', 'warehouse_sheet_carton', 'warehouse_single_face', 'warehouse_cellophane', 'warehouse_pvc_film', 'warehouse_ink'].includes(activeTab)
  );

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
  const canDashboard = hasPermission('can_view_dashboard');

  const canStudio = hasPermission('can_view_studio');
  const canAi = hasPermission('can_view_ai');
  const canMarketing = hasPermission('can_view_marketing');
  const canMyTasks = hasPermission('can_view_my_tasks');
  const canCalculator = hasPermission('can_view_calculator');
  const canCreateOrder = hasPermission('can_create_order');
  const canManageUsers = hasPermission('can_manage_users');
  const canSettings = isCeo || canManageUsers;

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    if (setMobileOpen) setMobileOpen(false);
  };

  const isTabActive = (tabKey) => {
    if (activeTab === tabKey) return true;
    if (tabKey === 'dieline_generator' && (activeTab === 'dieline_generator' || activeTab === '3d_studio')) return true;
    if (tabKey === 'production_orders' && (activeTab === 'production_orders' || activeTab === 'production_orders_offset')) return true;
    if (tabKey === 'digital_orders' && (activeTab === 'digital_orders' || activeTab === 'production_orders_digital')) return true;
    if (tabKey === 'service_orders' && (activeTab === 'service_orders' || activeTab === 'production_orders_service')) return true;
    if (tabKey === 'warehouse_cardboard' && (activeTab === 'warehouse_cardboard' || activeTab === 'warehouse_inventory')) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Right Sidebar Container (Nixtio Clean HR Dashboard Style) */}
      <aside
        className={`fixed top-0 right-0 h-screen bg-white text-slate-700 z-50 transition-all duration-300 ease-in-out border-l border-slate-200/80 shadow-[0_0_35px_rgba(0,0,0,0.03)] flex flex-col justify-between overflow-hidden select-none ${
          mobileOpen ? 'translate-x-0 w-72' : 'translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-20' : 'lg:w-72'}`}
        dir="rtl"
      >
        {/* Top Header: Brand Logo & Title */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 flex-shrink-0">
              <Box className="w-5 h-5 text-amber-300" />
            </div>

            {!collapsed && (
              <div className="flex flex-col min-w-0 animate-in fade-in duration-200">
                <span className="font-black text-sm text-slate-900 truncate tracking-tight">شرکت آرمان امیران</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-slate-400 truncate">اتوماسیون تولید (MIS)</span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Collapse / Mobile Close Button */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 items-center justify-center transition border border-slate-200/60"
              title={collapsed ? 'گسترش منو' : 'جمع کردن منو'}
            >
              {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden w-8 h-8 rounded-xl bg-slate-50 text-slate-500 hover:text-slate-800 flex items-center justify-center border border-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Order Action Button */}
        {canCreateOrder && !collapsed && (
          <div className="px-4 pt-3 pb-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => handleSelectTab('new_order')}
              className={`w-full py-2.5 px-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
                activeTab === 'new_order'
                  ? 'bg-amber-500 text-slate-950 shadow-amber-200 ring-2 ring-amber-300'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>+ تعریف سفارش جدید</span>
            </button>
          </div>
        )}

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 custom-scrollbar">
          
          {/* SECTION 1: عملیات و دستور تولید */}
          <div className="space-y-1">
            {!collapsed && (
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-3 block mb-1">
                عملیات و دستور تولید
              </span>
            )}

            {/* 1.1 هاب ناوبری */}
            {canHub && (
              <button
                type="button"
                onClick={() => handleSelectTab('hub')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isTabActive('hub')
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="میز کار و هاب دپارتمان‌ها"
              >
                <LayoutGrid className={`w-4 h-4 flex-shrink-0 ${isTabActive('hub') ? 'text-amber-400' : 'text-slate-400'}`} />
                {!collapsed && <span className="truncate">میز کار و هاب دپارتمان‌ها</span>}
              </button>
            )}

            {/* 1.2 دستور تولید (Accordion) */}
            {canProdDropdown && (
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setOpenProductionMenu(!openProductionMenu)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    ['production_orders', 'production_orders_offset', 'digital_orders', 'service_orders'].includes(activeTab)
                      ? 'bg-emerald-50 text-emerald-800 font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title="دستور تولید کارخانه"
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    {!collapsed && <span>دستور تولید</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openProductionMenu ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {openProductionMenu && !collapsed && (
                  <div className="pr-6 pl-1 space-y-1 border-r-2 border-slate-100 mr-4 my-1 animate-in fade-in duration-150">
                    {canProdOffset && (
                      <button
                        type="button"
                        onClick={() => handleSelectTab('production_orders_offset')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
                          isTabActive('production_orders') ? 'bg-emerald-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isTabActive('production_orders') ? 'bg-white' : 'bg-emerald-500'}`} />
                          <span>۱. تولید (افست کارخانه)</span>
                        </div>
                      </button>
                    )}
                    {canProdDigital && (
                      <button
                        type="button"
                        onClick={() => handleSelectTab('production_orders_digital')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
                          isTabActive('digital_orders') ? 'bg-purple-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isTabActive('digital_orders') ? 'bg-white' : 'bg-purple-500'}`} />
                          <span>۲. دیجیتال</span>
                        </div>
                      </button>
                    )}
                    {canProdService && (
                      <button
                        type="button"
                        onClick={() => handleSelectTab('production_orders_service')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
                          isTabActive('service_orders') ? 'bg-blue-600 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isTabActive('service_orders') ? 'bg-white' : 'bg-blue-500'}`} />
                          <span>۳. خدماتی</span>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 1.3 انبار متریال ۶ گانه (Accordion) */}
            {canWhDropdown && (
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setOpenWarehouseMenu(!openWarehouseMenu)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isTabActive('warehouse_cardboard') || ['warehouse_sheet_carton', 'warehouse_single_face', 'warehouse_cellophane', 'warehouse_pvc_film', 'warehouse_ink'].includes(activeTab)
                      ? 'bg-sky-50 text-sky-800 font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title="انبار متریال ۶ گانه"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-sky-600 flex-shrink-0" />
                    {!collapsed && <span>انبار متریال</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openWarehouseMenu ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {openWarehouseMenu && !collapsed && (
                  <div className="pr-6 pl-1 space-y-1 border-r-2 border-slate-100 mr-4 my-1 animate-in fade-in duration-150">
                    {canWhCardboard && (
                      <button
                        type="button"
                        onClick={() => handleSelectTab('warehouse_cardboard')}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
                          activeTab === 'warehouse_cardboard' || activeTab === 'warehouse_inventory' ? 'bg-sky-600 text-white font-black' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        <span>۱. مقوا</span>
                      </button>
                    )}
                    {canWhSheet && (
                      <button
                        type="button"
                        onClick={() => handleSelectTab('warehouse_sheet_carton')}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
                          activeTab === 'warehouse_sheet_carton' ? 'bg-sky-600 text-white font-black' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        <span>۲. ورق</span>
                      </button>
                    )}
                    {canWhSingle && (
                      <button
                        type="button"
                        onClick={() => handleSelectTab('warehouse_single_face')}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
                          activeTab === 'warehouse_single_face' ? 'bg-sky-600 text-white font-black' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        <span>۳. سینگل</span>
                      </button>
                    )}
                    {canWhCellophane && (
                      <button
                        type="button"
                        onClick={() => handleSelectTab('warehouse_cellophane')}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
                          activeTab === 'warehouse_cellophane' ? 'bg-sky-600 text-white font-black' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        <span>۴. سلفون</span>
                      </button>
                    )}
                    {canWhFilm && (
                      <button
                        type="button"
                        onClick={() => handleSelectTab('warehouse_pvc_film')}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
                          activeTab === 'warehouse_pvc_film' ? 'bg-sky-600 text-white font-black' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        <span>۵. طلق</span>
                      </button>
                    )}
                    {canWhInk && (
                      <button
                        type="button"
                        onClick={() => handleSelectTab('warehouse_ink')}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
                          activeTab === 'warehouse_ink' ? 'bg-sky-600 text-white font-black' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        <span>۶. مرکب</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 2: فرآیند و گردش کار ۱۰ مرحله */}
          <div className="space-y-1">
            {!collapsed && (
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-3 block mb-1">
                فرآیند و پیگیری سفارشات
              </span>
            )}

            {/* 2.1 گردش کار ۱۰ مرحله (کانبان) */}
            {canKanban && (
              <button
                type="button"
                onClick={() => handleSelectTab('kanban')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'kanban'
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="گردش کار ۱۰ مرحله (کانبان)"
              >
                <div className="flex items-center gap-3">
                  <Kanban className={`w-4 h-4 flex-shrink-0 ${activeTab === 'kanban' ? 'text-amber-400' : 'text-indigo-600'}`} />
                  {!collapsed && <span>گردش کار ۱۰ مرحله</span>}
                </div>
                {!collapsed && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === 'kanban' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'}`}>
                    ۱۰ مرحله
                  </span>
                )}
              </button>
            )}

            {/* 2.2 داشبورد و آمار */}
            {canDashboard && (
              <button
                type="button"
                onClick={() => handleSelectTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="داشبورد و آمار تحلیلی"
              >
                <BarChart3 className={`w-4 h-4 flex-shrink-0 ${activeTab === 'dashboard' ? 'text-amber-400' : 'text-purple-600'}`} />
                {!collapsed && <span>داشبورد و آمار تحلیلی</span>}
              </button>
            )}

            {/* 2.3 آرشیو و جستجوی سفارشات */}
            {canArchive && (
              <button
                type="button"
                onClick={() => handleSelectTab('archive')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'archive'
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="آرشیو و جستجوی سفارشات"
              >
                <Boxes className={`w-4 h-4 flex-shrink-0 ${activeTab === 'archive' ? 'text-amber-400' : 'text-amber-600'}`} />
                {!collapsed && <span>آرشیو و جستجو</span>}
              </button>
            )}

            {/* 2.4 کارتابل وظایف من */}
            {canMyTasks && (
              <button
                type="button"
                onClick={() => handleSelectTab('my_tasks')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'my_tasks'
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="کارتابل وظایف من"
              >
                <div className="flex items-center gap-3">
                  <Inbox className={`w-4 h-4 flex-shrink-0 ${activeTab === 'my_tasks' ? 'text-amber-400' : 'text-rose-600'}`} />
                  {!collapsed && <span>کارتابل وظایف من</span>}
                </div>
                {myPendingCount > 0 && !collapsed && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-xs">
                    {myPendingCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* SECTION 3: استودیو، طراحی و هوش مصنوعی */}
          <div className="space-y-1">
            {!collapsed && (
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-3 block mb-1">
                طراحی و هوش مصنوعی
              </span>
            )}

            {/* 3.1 استودیو طراحی امیران (2D & 3D & CDR) */}
            {canStudio && (
              <button
                type="button"
                onClick={() => handleSelectTab('dieline_generator')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isTabActive('dieline_generator')
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="استودیو طراحی امیران (خط تیغ، 3D و CDR)"
              >
                <div className="flex items-center gap-3">
                  <Box className={`w-4 h-4 flex-shrink-0 ${isTabActive('dieline_generator') ? 'text-amber-400' : 'text-amber-500'}`} />
                  {!collapsed && <span>استودیو طراحی امیران</span>}
                </div>
                {!collapsed && (
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-mono font-bold">
                    3D/CDR
                  </span>
                )}
              </button>
            )}

            {/* 3.2 دستیار هوش مصنوعی */}
            {canAi && (
              <button
                type="button"
                onClick={() => handleSelectTab('ai_assistant')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'ai_assistant'
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="دستیار هوش مصنوعی"
              >
                <Sparkles className={`w-4 h-4 flex-shrink-0 ${activeTab === 'ai_assistant' ? 'text-amber-400' : 'text-fuchsia-600'}`} />
                {!collapsed && <span>دستیار هوش مصنوعی</span>}
              </button>
            )}

            {/* 3.3 ماشین‌حساب برآورد صنعتی */}
            {canCalculator && (
              <button
                type="button"
                onClick={() => handleSelectTab('calculator')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'calculator'
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="ماشین‌حساب برآورد صنعتی"
              >
                <Calculator className={`w-4 h-4 flex-shrink-0 ${activeTab === 'calculator' ? 'text-amber-400' : 'text-teal-600'}`} />
                {!collapsed && <span>برآورد قیمت صنعتی</span>}
              </button>
            )}

            {/* 3.4 استعلام بازاریاب */}
            {canMarketing && (
              <button
                type="button"
                onClick={() => handleSelectTab('marketing')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'marketing'
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="استعلام و تارگت بازاریاب"
              >
                <TrendingUp className={`w-4 h-4 flex-shrink-0 ${activeTab === 'marketing' ? 'text-amber-400' : 'text-emerald-600'}`} />
                {!collapsed && <span>استعلام بازاریاب</span>}
              </button>
            )}
          </div>

          {/* SECTION 4: تنظیمات، منابع انسانی و مدیریت */}
          {canSettings && (
            <div className="space-y-1">
              {!collapsed && (
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-3 block mb-1">
                  مدیریت و منابع انسانی
                </span>
              )}

              {/* 4.1 منابع انسانی HR */}
              <button
                type="button"
                onClick={() => handleSelectTab('hr')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'hr'
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="منابع انسانی و ارزیابی عملکرد (HR)"
              >
                <Award className={`w-4 h-4 flex-shrink-0 ${activeTab === 'hr' ? 'text-amber-400' : 'text-indigo-600'}`} />
                {!collapsed && <span>ارزیابی عملکرد (HR)</span>}
              </button>

              {/* 4.2 مدیریت پرسنل و دسترسی‌ها */}
              <button
                type="button"
                onClick={() => handleSelectTab('users')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'users'
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="مدیریت پرسنل و دسترسی‌ها"
              >
                <Users className={`w-4 h-4 flex-shrink-0 ${activeTab === 'users' ? 'text-amber-400' : 'text-indigo-600'}`} />
                {!collapsed && <span>مدیریت پرسنل</span>}
              </button>

              {/* 4.3 فایل‌ها و استوریج (مخفی برای بازاریاب) */}
              {!isMarketer && (
                <button
                  type="button"
                  onClick={() => handleSelectTab('storage')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === 'storage'
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title="پوشه Storage و فایل‌ها"
                >
                  <HardDrive className={`w-4 h-4 flex-shrink-0 ${activeTab === 'storage' ? 'text-amber-400' : 'text-indigo-600'}`} />
                  {!collapsed && <span>فایل‌ها و استوریج</span>}
                </button>
              )}

              {/* 4.4 لاگ و ممیزی */}
              <button
                type="button"
                onClick={() => handleSelectTab('logs')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'logs'
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="لاگ و ممیزی کاربران"
              >
                <Activity className={`w-4 h-4 flex-shrink-0 ${activeTab === 'logs' ? 'text-amber-400' : 'text-indigo-600'}`} />
                {!collapsed && <span>لاگ و ممیزی</span>}
              </button>

              {/* 4.5 لایسنس سرور */}
              {onOpenLicense && (
                <button
                  type="button"
                  onClick={onOpenLicense}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-all"
                  title="لایسنس سرور کارخانه"
                >
                  <Key className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  {!collapsed && <span>لایسنس سرور</span>}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bottom Profile & Role Bar (Nixtio Clean Card Style) */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 flex-shrink-0">
          {!collapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    {currentUser?.name ? currentUser.name.slice(0, 1) : 'ک'}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-black text-slate-800 block truncate">{currentUser?.name || 'کاربر سیستم'}</span>
                    <span className="text-[10px] text-slate-400 font-bold block truncate">{currentUser?.department || 'کارخانه'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition border border-slate-200/80 shadow-2xs"
                  title="خروج از حساب کاربری"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Role Switcher */}
              <select
                value={role}
                onChange={(e) => switchRole(e.target.value)}
                className="w-full px-2.5 py-1.5 text-[11px] font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    نقش: {r.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-9 h-9 rounded-2xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs cursor-pointer"
                title={`${currentUser?.name} (${currentUser?.department})`}
              >
                {currentUser?.name ? currentUser.name.slice(0, 1) : 'ک'}
              </div>
              <button
                type="button"
                onClick={logout}
                className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition border border-slate-200"
                title="خروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
