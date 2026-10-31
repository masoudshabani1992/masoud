import React, { useCallback, useEffect, useState } from 'react';
import {
  BatteryCharging,
  Home,
  Server,
  BarChart3,
  SlidersHorizontal,
  Users,
  ShoppingBag,
  LogOut,
  Tag,
  Download,
  Menu,
  Moon,
  Sun,
  User,
  BookOpen,
  Database,
  Printer,
  ChevronDown,
  Bot,
} from 'lucide-react';
import { apiRequest, getStoredToken, setStoredToken } from './api.js';
import LoginView from './components/LoginView.jsx';
import CashierPosView from './components/CashierPosView.jsx';
import AdminDashboardView from './components/AdminDashboardView.jsx';
import AdminPricingView from './components/AdminPricingView.jsx';
import AdminReportsView from './components/AdminReportsView.jsx';
import AdminSepidarView from './components/AdminSepidarView.jsx';
import AdminUsersView from './components/AdminUsersView.jsx';
import AdminGuideView from './components/AdminGuideView.jsx';
import PrintPreviewModal from './components/PrintPreviewModal.jsx';
import { formatNumber } from './utils/format.js';
import { toPersianDigits } from './utils/jalali.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [bootstrap, setBootstrap] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [printModalState, setPrintModalState] = useState(null);

  // Hiddify v14.0.5 Sakai Layout States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sepidarSubmenuOpen, setSepidarSubmenuOpen] = useState(false);
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);

  // Hiddify v14.0.5 Dark / Light Theme Toggle
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem('kaveh_hiddify_dark') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('app-dark');
    } else {
      root.classList.remove('app-dark');
    }
    try {
      localStorage.setItem('kaveh_hiddify_dark', isDark ? '1' : '0');
    } catch {
      // ignore storage restrictions
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark((prev) => !prev);

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
    setUserPopoverOpen(false);
  };

  const openPrintModal = (sale, initialTab = 'both') => {
    setPrintModalState({ sale, initialTab });
  };

  const handleToggleMenu = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileMenuOpen((v) => !v);
    } else {
      setSidebarOpen((v) => !v);
    }
  };

  const navigateTo = (navId) => {
    setActiveNav(navId);
    setMobileMenuOpen(false);
    setUserPopoverOpen(false);
  };

  if (checkingAuth) {
    return (
      <div
        style={{ backgroundColor: 'var(--surface-ground)', color: 'var(--p-text-color)' }}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="text-center space-y-2">
          <BatteryCharging className="w-10 h-10 text-blue-600 mx-auto animate-pulse" />
          <div className="text-sm font-bold">در حال بارگذاری پنل مدیریت ۱۴.۰.۵...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginView
        onLoggedIn={handleLoggedIn}
        isDark={isDark}
        onToggleDark={toggleDarkMode}
      />
    );
  }

  const isAdmin = user.role === 'admin';
  const currentView = isAdmin ? activeNav : activeNav === 'guide' ? 'guide' : 'pos';
  const nextLabel = bootstrap?.publicSettings?.next_label_number || 1500;
  const pendingSepidar = bootstrap?.pendingSepidarCount || 0;
  const storeTitle = bootstrap?.publicSettings?.store_name || 'اتوماسیون باتری کاوه';

  const shellClass = [
    sidebarOpen ? 'hiddify-shell--open' : 'hiddify-shell--collapsed',
    mobileMenuOpen ? 'hiddify-shell--mobile-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`min-h-screen ${shellClass}`}>
      {/* ============================================================
          HIDDIFY MANAGER v14.0.5 TOP BLUE APPBAR
          ============================================================ */}
      <header className="hiddify-topbar print:hidden">
        {/* Right Side: Menu Hamburger + Title + Version 14.0.5 */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={handleToggleMenu}
            title="نمایش / جمع کردن منو"
            className="hiddify-topbar-action"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => navigateTo(isAdmin ? 'dashboard' : 'pos')}
            className="flex items-center gap-2.5 text-right text-white cursor-pointer min-w-0 bg-transparent border-0"
          >
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/18">
              <BatteryCharging className="w-4 h-4 text-white" />
            </span>
            <span className="flex flex-col min-w-0">
              <span className="truncate text-sm sm:text-[15px] font-bold leading-tight">
                {storeTitle}
              </span>
              <span className="text-[10px] text-white/75 leading-none mt-0.5 tabular-nums">
                ۱۴.۰.۵
              </span>
            </span>
          </button>
        </div>

        {/* Left Side: Next Label Pill + Download + Account + Dark Mode + Sign Out */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            title="سریال لیبل بارکد بعدی"
            className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-white/14 border border-white/20 px-3 py-1 text-xs text-white"
          >
            <Tag className="w-3.5 h-3.5 text-amber-300" />
            <span className="opacity-85">لیبل بعدی:</span>
            <strong className="font-extrabold tabular-nums" dir="ltr">
              #{toPersianDigits(nextLabel)}
            </strong>
          </div>

          <a
            href="/api/download-package"
            title="دانلود پکیج کامل ویندوز (ZIP)"
            className="hiddify-topbar-action hiddify-topbar-action--pill"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">دانلود پکیج ویندوز</span>
          </a>

          {/* User Account Popover Button (Matches pi-user in Hiddify Topbar) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserPopoverOpen((v) => !v)}
              title={`${user.full_name} (${isAdmin ? 'مدیر مالی' : 'صندوقدار'})`}
              className="hiddify-topbar-action"
            >
              <User className="w-4 h-4" />
            </button>

            {userPopoverOpen && (
              <div
                style={{
                  backgroundColor: 'var(--p-content-background)',
                  borderColor: 'var(--p-content-border-color)',
                  color: 'var(--p-text-color)',
                }}
                className="absolute left-0 top-12 z-50 w-60 rounded-2xl border p-3.5 shadow-xl text-xs space-y-2.5"
              >
                <div className="border-b pb-2" style={{ borderColor: 'var(--p-content-border-color)' }}>
                  <div className="font-extrabold text-sm">{user.full_name}</div>
                  <div style={{ color: 'var(--p-text-muted-color)' }} className="mt-0.5">
                    نقش: {isAdmin ? 'مدیر مالی و سپیدار' : 'صندوقدار فروش'} (@{user.username})
                  </div>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => navigateTo('users')}
                    className="w-full rounded-lg px-2.5 py-1.5 text-right font-bold hover:bg-blue-500/10 text-blue-600 cursor-pointer"
                  >
                    مدیریت کاربران و رمز عبور
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-lg px-2.5 py-1.5 text-right font-bold bg-red-500/10 hover:bg-red-500/20 text-red-500 cursor-pointer flex items-center justify-between"
                >
                  <span>خروج / تغییر حساب کاربری</span>
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Dark / Light Mode Toggle (Matches pi-moon / pi-sun in Hiddify Topbar) */}
          <button
            type="button"
            onClick={toggleDarkMode}
            title={isDark ? 'پوسته روشن' : 'پوسته تیره'}
            className="hiddify-topbar-action"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Sign Out Button (Matches pi-sign-out in Hiddify Topbar) */}
          <button
            type="button"
            onClick={handleLogout}
            title="خروج از سامانه"
            className="hiddify-topbar-action"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ============================================================
          HIDDIFY MANAGER v14.0.5 FLOATING RIGHT SIDEBAR
          ============================================================ */}
      <aside className="hiddify-sidebar print:hidden">
        {isAdmin ? (
          <nav className="space-y-2">
            {/* Group 1: مدیریت */}
            <div>
              <div className="hiddify-menu-group-label">مدیریت</div>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => navigateTo('dashboard')}
                  className={`hiddify-menu-item ${
                    currentView === 'dashboard' ? 'hiddify-menu-item--active' : ''
                  }`}
                >
                  <Home className="w-4 h-4 shrink-0" />
                  <span>داشبورد</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('pos')}
                  className={`hiddify-menu-item ${
                    currentView === 'pos' ? 'hiddify-menu-item--active' : ''
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  <span>صندوق فروش (POS)</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('sepidar')}
                  className={`hiddify-menu-item ${
                    currentView === 'sepidar' ? 'hiddify-menu-item--active' : ''
                  }`}
                >
                  <Server className="w-4 h-4 shrink-0" />
                  <span>کارتابل و تایید سپیدار</span>
                  {pendingSepidar > 0 ? (
                    <span className="hiddify-menu-badge">{formatNumber(pendingSepidar)}</span>
                  ) : null}
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('reports')}
                  className={`hiddify-menu-item ${
                    currentView === 'reports' ? 'hiddify-menu-item--active' : ''
                  }`}
                >
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  <span>گزارشات جامع شمسی</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('users')}
                  className={`hiddify-menu-item ${
                    currentView === 'users' ? 'hiddify-menu-item--active' : ''
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span>صندوقدارها و ادمین‌ها</span>
                </button>
              </div>
            </div>

            {/* Group 2: تنظیمات */}
            <div className="pt-1">
              <div className="hiddify-menu-group-label">تنظیمات</div>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => navigateTo('pricing')}
                  className={`hiddify-menu-item ${
                    currentView === 'pricing' ? 'hiddify-menu-item--active' : ''
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4 shrink-0" />
                  <span>تعرفه آمپر، برند و داغی</span>
                </button>

                {/* Expandable Submenu (Matches ویرایشگر پروکسی / ابزارها in Hiddify v14.0.5) */}
                <div>
                  <button
                    type="button"
                    onClick={() => setSepidarSubmenuOpen((v) => !v)}
                    className="hiddify-menu-item justify-between"
                  >
                    <span className="flex items-center gap-2.5">
                      <Bot className="w-4 h-4 shrink-0" />
                      <span>ربات و هسته سپیدار</span>
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        sepidarSubmenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {sepidarSubmenuOpen && (
                    <div className="pr-5 pt-0.5 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => navigateTo('sepidar')}
                        className="hiddify-menu-item text-xs py-1.5"
                      >
                        <span>تنظیمات ربات ویندوزی (.EXE)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateTo('backup')}
                        className="hiddify-menu-item text-xs py-1.5"
                      >
                        <span>خروجی اکسل و دانلود ربات</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => navigateTo('users')}
                  className="hiddify-menu-item"
                >
                  <Printer className="w-4 h-4 shrink-0" />
                  <span>چاپگر لیبل و فیش ۸ سانتی</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('backup')}
                  className={`hiddify-menu-item ${
                    currentView === 'backup' ? 'hiddify-menu-item--active' : ''
                  }`}
                >
                  <Database className="w-4 h-4 shrink-0" />
                  <span>پشتیبان‌گیری و پکیج نصب</span>
                </button>
              </div>
            </div>

            {/* Group 3: راهنما */}
            <div className="pt-1">
              <div className="hiddify-menu-group-label">راهنما</div>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => navigateTo('guide')}
                  className={`hiddify-menu-item ${
                    currentView === 'guide' ? 'hiddify-menu-item--active' : ''
                  }`}
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>راهنمای شبکه و سپیدار</span>
                </button>
              </div>
            </div>
          </nav>
        ) : (
          /* Cashier Sidebar */
          <nav className="space-y-2">
            <div>
              <div className="hiddify-menu-group-label">صندوق فروش</div>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => navigateTo('pos')}
                  className={`hiddify-menu-item ${
                    currentView === 'pos' ? 'hiddify-menu-item--active' : ''
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  <span>ثبت فروش و چاپ فاکتور</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('guide')}
                  className={`hiddify-menu-item ${
                    currentView === 'guide' ? 'hiddify-menu-item--active' : ''
                  }`}
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>راهنمای چاپ دو پرینتر</span>
                </button>
              </div>
            </div>

            <div
              style={{
                borderColor: 'var(--p-content-border-color)',
                backgroundColor: 'var(--surface-ground)',
              }}
              className="mt-4 rounded-xl border p-3 text-xs space-y-1"
            >
              <div style={{ color: 'var(--p-text-muted-color)' }}>صندوقدار فعال:</div>
              <div className="font-extrabold">{user.full_name}</div>
              <div className="text-[11px] text-blue-600 font-bold tabular-nums">
                سریال لیبل بعدی: #{toPersianDigits(nextLabel)}
              </div>
            </div>
          </nav>
        )}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-55 bg-slate-950/50 backdrop-blur-[1px] lg:hidden print:hidden"
        />
      )}

      {/* ============================================================
          MAIN CONTENT CONTAINER + HIDDIFY FOOTER
          ============================================================ */}
      <div className="hiddify-main-container">
        <main className="hiddify-subview flex-1 pb-8 max-w-[1600px] w-full mx-auto">
          {currentView === 'pos' && (
            <CashierPosView
              bootstrap={bootstrap}
              onRefreshBootstrap={loadBootstrap}
              onOpenPrintModal={openPrintModal}
            />
          )}

          {isAdmin && currentView === 'dashboard' && (
            <AdminDashboardView
              onNavigate={navigateTo}
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

          {isAdmin && currentView === 'backup' && <AdminGuideView mode="backup" />}

          {currentView === 'guide' && <AdminGuideView mode="guide" />}
        </main>

        {/* Hiddify v14.0.5 Footer + Developer Credit */}
        <footer
          style={{
            borderColor: 'var(--p-content-border-color)',
            color: 'var(--p-text-muted-color)',
          }}
          className="border-t py-4 px-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs print:hidden max-w-[1600px] w-full mx-auto"
        >
          <div className="font-semibold">
            {storeTitle} — پنل یکپارچه مدیریت فروش و سپیدار · نسخه ۱۴.۰.۵
          </div>
          <div
            style={{
              backgroundColor: 'var(--p-content-background)',
              borderColor: 'var(--p-content-border-color)',
              color: 'var(--p-text-color)',
            }}
            className="font-extrabold border px-3.5 py-1 rounded-full shadow-2xs"
          >
            برنامه‌نویس: مسعود شعبانی
          </div>
        </footer>
      </div>

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
