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
  const [openDashMenu, setOpenDashMenu] = useState(
    ['dashboard', 'kanban', 'archive'].includes(activeTab)
  );
  const [openSettingsMenu, setOpenSettingsMenu] = useState(
    ['users', 'hr', 'storage', 'logs'].includes(activeTab)
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
  const canDashDropdown = canDashboard || canKanban || canArchive;

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
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Right Sidebar Container (Vision UI & PicGen Aesthetic) */}
      <aside
        className={`fixed top-0 right-0 h-screen bg-slate-950 text-slate-200 z-50 transition-all duration-300 ease-in-out border-l border-slate-800/80 shadow-2xl flex flex-col justify-between overflow-hidden select-none ${
          mobileOpen ? 'translate-x-0 w-72' : 'translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-20' : 'lg:w-72'}`}
        dir="rtl"
      >
        {/* Top Header: Logo, Factory Brand, Collapse Toggle */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between flex-shrink-0 bg-slate-950/90 backdrop-blur-md">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 flex-shrink-0 ring-1 ring-white/20">
              <Box className="w-5 h-5 text-amber-300" />
            </div>

            {!collapsed && (
              <div className="flex flex-col min-w-0 animate-in fade-in duration-200">
                <span className="font-black text-sm text-white truncate tracking-tight">شرکت آرمان امیران</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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
              className="hidden lg:flex w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white items-center justify-center transition border border-slate-800"
              title={collapsed ? 'گسترش منو' : 'جمع کردن منو'}
            >
              {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden w-8 h-8 rounded-xl bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800"
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
              className={`w-full py-2.5 px-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 ${
                activeTab === 'new_order'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-amber-500/25 ring-2 ring-amber-400'
                  : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white shadow-indigo-600/30'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>+ ثبت سفارش جدید صنعتی</span>
            </button>
          </div>
        )}

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6 custom-scrollbar">
          
          {/* SECTION 1: عملیات و دستور تولید */}
          <div className="space-y-1">
            {!collapsed && (
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 block">
                عملیات و دستور تولید
              </span>
            )}

            {/* 1.1 هاب ناوبری */}
            {canHub && (
              <button
                type="button"
                onClick={() => handleSelectTab('hub')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isTabActive('hub')
                    ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
                title="هاب دپارتمان‌ها"
              >
                <LayoutGrid className="w-4 h-4 text-amber-400 flex-shrink-0" />
                {!collapsed && <span className="truncate">میز کار و هاب دپارتمان‌ها</span>}
              </button>
            )}

            {/* 1.2 دستور تولید (Accordion) */}
            {canProdDropdown && (
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setOpenProductionMenu(!openProductionMenu)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    ['production_orders', 'production_orders_offset', 'digital_orders', 'service_orders'].includes(activeTab)
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                  }`}
                  title="دستور تولید کارخانه"
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {!collapsed && <span>دستور تولید</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openProductionMenu ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {openProductionMenu && !collapsed && (
                  <div className="pr-7 pl-1 space-y-1 border-r border-slate-800/80 mr-4 my-1 animate-in fade-in duration-150">
                    {canProdOffset && (
                      <button
                        type="button"
                        onClick={() => handleSelectTab('production_orders_offset')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                          isTabActive('production_orders') ? 'bg-emerald-600 text-white font-black' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span>۱. تولید (افست کارخانه)</span>
                        </div>
                      </button>
                    )}
                    {canProdDigital && (
                      <button
                        type="button"
                        onClick={() => handleSelectTab('production_orders_digital')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                          isTabActive('digital_orders') ? 'bg-purple-600 text-white font-black' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-400" />
                          <span>۲. دیجیتال</span>
                        </div>
                      </button>
                    )}
                    {canProdService && (
                      <button
                        type="button"
                        onClick={() => handleSelectTab('production_orders_service')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                          isTabActive('service_orders') ? 'bg-blue-600 text-white font-black' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-400" />
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isTabActive('warehouse_cardboard') || ['warehouse_sheet_carton', 'warehouse_single_face', 'warehouse_cellophane', 'warehouse_pvc_film', 'warehouse_ink'].includes(activeTab)
                      ? 'bg-sky-950/60 text-sky-300 border border-sky-800/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                  }`}
                  title="انبار متریال ۶ گانه"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    {!collapsed && <span>انبار متریال</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openWarehouseMenu ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {openWarehouseMenu && !collapsed && (
                  <div className="pr-7 pl-1 space-y-1 border-r border-slate-800/80 mr-4 my-1 animate-in fade-in duration-150">
                    {canWhCardboard && (
                      <button
                        type="button"
                        onClick={() => handleSelectTab('warehouse_cardboard')}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                          activeTab === 'warehouse_cardboard' || activeTab === 'warehouse_inventory' ? 'bg-sky-600 text-white font-black' : 'text-slate-400 hover:text-white hover:bg-slate-900'
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
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                          activeTab === 'warehouse_sheet_carton' ? 'bg-sky-600 text-white font-black' : 'text-slate-400 hover:text-white hover:bg-slate-900'
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
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                          activeTab === 'warehouse_single_face' ? 'bg-sky-600 text-white font-black' : 'text-slate-400 hover:text-white hover:bg-slate-900'
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
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                          activeTab === 'warehouse_cellophane' ? 'bg-sky-600 text-white font-black' : 'text-slate-400 hover:text-white hover:bg-slate-900'
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
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                          activeTab === 'warehouse_pvc_film' ? 'bg-sky-600 text-white font-black' : 'text-slate-400 hover:text-white hover:bg-slate-900'
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
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                          activeTab === 'warehouse_ink' ? 'bg-sky-600 text-white font-black' : 'text-slate-400 hover:text-white hover:bg-slate-900'
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
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 block">
                فرآیند و رهگیری سفارشات
              </span>
            )}

            {/* 2.1 گردش کار ۱۰ مرحله (کانبان) */}
            {canKanban && (
              <button
                type="button"
                onClick={() => handleSelectTab('kanban')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'kanban'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
                title="گردش کار ۱۰ مرحله (کانبان)"
              >
                <div className="flex items-center gap-3">
                  <Kanban className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  {!collapsed && <span>گردش کار ۱۰ مرحله</span>}
                </div>
                {!collapsed && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-md border border-amber-500/30">
                    Live
                  </span>
                )}
              </button>
            )}

            {/* 2.2 داشبورد و آمار */}
            {canDashboard && (
              <button
                type="button"
                onClick={() => handleSelectTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
                title="داشبورد و آمار تحلیلی"
              >
                <BarChart3 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                {!collapsed && <span>داشبورد و آمار تحلیلی</span>}
              </button>
            )}

            {/* 2.3 آرشیو و جستجوی سفارشات */}
            {canArchive && (
              <button
                type="button"
                onClick={() => handleSelectTab('archive')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'archive'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
                title="آرشیو و جستجوی سفارشات"
              >
                <Boxes className="w-4 h-4 text-amber-400 flex-shrink-0" />
                {!collapsed && <span>آرشیو و جستجو</span>}
              </button>
            )}

            {/* 2.4 کارتابل وظایف من */}
            {canMyTasks && (
              <button
                type="button"
                onClick={() => handleSelectTab('my_tasks')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'my_tasks'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
                title="کارتابل وظایف من"
              >
                <div className="flex items-center gap-3">
                  <Inbox className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  {!collapsed && <span>کارتابل وظایف من</span>}
                </div>
                {myPendingCount > 0 && !collapsed && (
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                    {myPendingCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* SECTION 3: استودیو، طراحی و هوش مصنوعی */}
          <div className="space-y-1">
            {!collapsed && (
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 block">
                طراحی و هوش مصنوعی
              </span>
            )}

            {/* 3.1 استودیو طراحی امیران (2D & 3D & CDR) */}
            {canStudio && (
              <button
                type="button"
                onClick={() => handleSelectTab('dieline_generator')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isTabActive('dieline_generator')
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/25 ring-2 ring-amber-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
                title="استودیو طراحی امیران (خط تیغ، 3D و CDR)"
              >
                <div className="flex items-center gap-3">
                  <Box className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  {!collapsed && <span>استودیو طراحی امیران</span>}
                </div>
                {!collapsed && (
                  <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'ai_assistant'
                    ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/30 ring-1 ring-fuchsia-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
                title="دستیار هوش مصنوعی"
              >
                <Sparkles className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />
                {!collapsed && <span>دستیار هوش مصنوعی</span>}
              </button>
            )}

            {/* 3.3 ماشین‌حساب برآورد صنعتی */}
            {canCalculator && (
              <button
                type="button"
                onClick={() => handleSelectTab('calculator')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'calculator'
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 ring-1 ring-teal-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
                title="ماشین‌حساب برآورد صنعتی"
              >
                <Calculator className="w-4 h-4 text-teal-400 flex-shrink-0" />
                {!collapsed && <span>برآورد قیمت صنعتی</span>}
              </button>
            )}

            {/* 3.4 استعلام بازاریاب */}
            {canMarketing && (
              <button
                type="button"
                onClick={() => handleSelectTab('marketing')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'marketing'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
                title="استعلام و تارگت بازاریاب"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {!collapsed && <span>استعلام بازاریاب</span>}
              </button>
            )}
          </div>

          {/* SECTION 4: تنظیمات، منابع انسانی و مدیریت */}
          {canSettings && (
            <div className="space-y-1">
              {!collapsed && (
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 block">
                  مدیریت و پیکربندی
                </span>
              )}

              {/* 4.1 منابع انسانی HR */}
              <button
                type="button"
                onClick={() => handleSelectTab('hr')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'hr'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
                title="منابع انسانی و ارزیابی عملکرد (HR)"
              >
                <Award className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                {!collapsed && <span>ارزیابی عملکرد (HR)</span>}
              </button>

              {/* 4.2 مدیریت پرسنل و دسترسی‌ها */}
              <button
                type="button"
                onClick={() => handleSelectTab('users')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'users'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
                title="مدیریت پرسنل و دسترسی‌ها"
              >
                <Users className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                {!collapsed && <span>مدیریت پرسنل</span>}
              </button>

              {/* 4.3 فایل‌ها و استوریج (مخفی برای بازاریاب) */}
              {!isMarketer && (
                <button
                  type="button"
                  onClick={() => handleSelectTab('storage')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'storage'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                  }`}
                  title="پوشه Storage و فایل‌ها"
                >
                  <HardDrive className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  {!collapsed && <span>فایل‌ها و استوریج</span>}
                </button>
              )}

              {/* 4.4 لاگ و ممیزی */}
              <button
                type="button"
                onClick={() => handleSelectTab('logs')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'logs'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
                title="لاگ و ممیزی کاربران"
              >
                <Activity className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                {!collapsed && <span>لاگ و ممیزی</span>}
              </button>

              {/* 4.5 لایسنس سرور */}
              {onOpenLicense && (
                <button
                  type="button"
                  onClick={onOpenLicense}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-amber-300 hover:bg-slate-900/80 transition-all"
                  title="لایسنس سرور کارخانه"
                >
                  <Key className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  {!collapsed && <span>لایسنس سرور</span>}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bottom Profile & Role Bar */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 flex-shrink-0">
          {!collapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-xs shadow-md">
                    {currentUser?.name ? currentUser.name.slice(0, 1) : 'کاربر'}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-black text-white block truncate">{currentUser?.name || 'کاربر سیستم'}</span>
                    <span className="text-[10px] text-amber-400 font-bold block truncate">{currentUser?.department || 'کارخانه'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition border border-slate-800"
                  title="خروج از حساب کاربری"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Fast Role Switcher for Testing / Management */}
              <select
                value={role}
                onChange={(e) => switchRole(e.target.value)}
                className="w-full px-2.5 py-1.5 text-[11px] font-bold rounded-xl border border-slate-800 bg-slate-900 text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-xs cursor-pointer shadow-md"
                title={`${currentUser?.name} (${currentUser?.department})`}
              >
                {currentUser?.name ? currentUser.name.slice(0, 1) : 'کاربر'}
              </div>
              <button
                type="button"
                onClick={logout}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition border border-slate-800"
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
