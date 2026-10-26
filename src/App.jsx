import React, { useCallback, useEffect, useState } from 'react';
import {
  BatteryCharging,
  LayoutDashboard,
  Server,
  BarChart3,
  Coins,
  Users,
  MonitorSmartphone,
  LogOut,
  Tag,
  Download,
} from 'lucide-react';
import { apiRequest, getStoredToken, setStoredToken } from './api.js';
import LoginView from './components/LoginView.jsx';
import CashierPosView from './components/CashierPosView.jsx';
import AdminDashboardView from './components/AdminDashboardView.jsx';
import AdminPricingView from './components/AdminPricingView.jsx';
import AdminReportsView from './components/AdminReportsView.jsx';
import AdminSepidarView from './components/AdminSepidarView.jsx';
import AdminUsersView from './components/AdminUsersView.jsx';
import PrintPreviewModal from './components/PrintPreviewModal.jsx';
import { formatNumber } from './utils/format.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [bootstrap, setBootstrap] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [printModalState, setPrintModalState] = useState(null);

  const loadBootstrap = useCallback(async () => {
    try {
      const token = getStoredToken();
      if (!token) {
        setUser(null);
        setBootstrap(null);
        setCheckingAuth(false);
        return;
      }
      const data = await apiRequest('/api/bootstrap');
      setUser(data.user);
      setBootstrap(data);
    } catch {
      setStoredToken('');
      setUser(null);
      setBootstrap(null);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    loadBootstrap();
  }, [loadBootstrap]);

  const handleLoggedIn = async (loginPayload) => {
    const loggedInUser = loginPayload?.user || loginPayload;
    setUser(loggedInUser);
    setActiveNav(loggedInUser.role === 'admin' ? 'dashboard' : 'pos');
    if (loginPayload?.bootstrap) {
      setBootstrap(loginPayload.bootstrap);
    } else {
      await loadBootstrap();
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setStoredToken('');
    setUser(null);
    setBootstrap(null);
  };

  const openPrintModal = (sale, initialTab = 'both') => {
    setPrintModalState({ sale, initialTab });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center space-y-2">
          <BatteryCharging className="w-10 h-10 text-amber-400 mx-auto animate-pulse" />
          <div className="text-sm font-bold">در حال بارگذاری سامانه باتری کاوه...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView onLoggedIn={handleLoggedIn} />;
  }

  const isAdmin = user.role === 'admin';
  const currentView = isAdmin ? activeNav : 'pos';
  const nextLabel = bootstrap?.publicSettings?.next_label_number || 1500;
  const pendingSepidar = bootstrap?.pendingSepidarCount || 0;

  const adminNavItems = [
    { id: 'dashboard', label: 'مانیتورینگ زنده', icon: LayoutDashboard },
    {
      id: 'sepidar',
      label: 'تایید و ارسال سپیدار',
      icon: Server,
      badge: pendingSepidar > 0 ? pendingSepidar : null,
    },
    { id: 'reports', label: 'گزارشات (روز/هفته/ماه/ساعت)', icon: BarChart3 },
    { id: 'pricing', label: 'قیمت‌گذاری آمپر و داغی', icon: Coins },
    { id: 'users', label: 'صندوقدارها و تنظیمات چاپ', icon: Users },
    { id: 'pos', label: 'میز صندوق فروش (POS)', icon: MonitorSmartphone },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Application Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between gap-3">
            {/* Brand Identity */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-sm shrink-0">
                <BatteryCharging className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-black leading-tight flex items-center gap-2">
                  <span>{bootstrap?.publicSettings?.store_name || 'نمایندگی صبا باتری - باتری کاوه'}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {isAdmin
                    ? 'پنل مدیریت مالی و ارتباط با سپیدار (طبقه بالا)'
                    : 'پنل صندوق فروش، لیبل‌زن و فیش‌زن ۸ سانتی (طبقه پایین)'}
                </div>
              </div>
            </div>

            {/* Right User Info & Label Indicator */}
            <div className="flex items-center gap-2">
              <a
                href="/api/download-package"
                title="دانلود کل اتوماسیون و ربات ویندوزی سپیدار (ZIP)"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">دانلود پکیج نصب (ZIP)</span>
              </a>

              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-300 font-semibold">لیبل بعدی:</span>
                <strong className="text-amber-400 font-black tabular-nums" dir="ltr">
                  #{nextLabel}
                </strong>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-right">
                <div className="text-xs font-extrabold text-white leading-tight">{user.full_name}</div>
                <div className="text-[10px] text-amber-400 font-bold">
                  {isAdmin ? 'مدیر مالی' : 'صندوقدار'}
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="خروج یا تغییر کاربر"
                className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">خروج / تغییر نقش</span>
              </button>
            </div>
          </div>

          {/* Admin Navigation Bar */}
          {isAdmin && (
            <nav className="flex items-center gap-1.5 overflow-x-auto pb-2.5 pt-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const active = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveNav(item.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                      active
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-black tabular-nums ${
                          active ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
                        }`}
                      >
                        {formatNumber(item.badge)}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1">
        {currentView === 'pos' && (
          <CashierPosView
            bootstrap={bootstrap}
            onRefreshBootstrap={loadBootstrap}
            onOpenPrintModal={openPrintModal}
          />
        )}

        {isAdmin && currentView === 'dashboard' && (
          <AdminDashboardView
            onNavigate={setActiveNav}
            onOpenPrintModal={openPrintModal}
            onRefreshBootstrap={loadBootstrap}
          />
        )}

        {isAdmin && currentView === 'pricing' && (
          <AdminPricingView
            bootstrap={bootstrap}
            onRefreshBootstrap={loadBootstrap}
          />
        )}

        {isAdmin && currentView === 'reports' && (
          <AdminReportsView
            bootstrap={bootstrap}
            onOpenPrintModal={openPrintModal}
          />
        )}

        {isAdmin && currentView === 'sepidar' && (
          <AdminSepidarView
            bootstrap={bootstrap}
            onRefreshBootstrap={loadBootstrap}
          />
        )}

        {isAdmin && currentView === 'users' && (
          <AdminUsersView
            bootstrap={bootstrap}
            onRefreshBootstrap={loadBootstrap}
          />
        )}
      </main>

      {/* Dual-Printer Preview Modal (Label 1500+ & 80mm Receipt) */}
      {printModalState && (
        <PrintPreviewModal
          sale={printModalState.sale}
          initialTab={printModalState.initialTab}
          settings={bootstrap?.publicSettings || {}}
          onClose={() => setPrintModalState(null)}
          onPrinted={loadBootstrap}
        />
      )}
    </div>
  );
}
