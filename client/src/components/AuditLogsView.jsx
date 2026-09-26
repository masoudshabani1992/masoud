import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Download,
  Trash2,
  User,
  Clock,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  FileSpreadsheet,
  Globe,
  Activity,
  HardDrive,
  Users,
  Compass,
  Boxes,
  Sparkles,
  Lock,
  ArrowRightLeft,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

const MODULE_DEFINITIONS = {
  auth: { label: 'احراز هویت و ورود', icon: Lock, color: 'bg-purple-100 text-purple-800 border-purple-200' },
  orders: { label: 'سفارشات جعبه', icon: Boxes, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  workflow: { label: 'گردش کار ۱۰ مرحله', icon: ArrowRightLeft, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  marketing: { label: 'استعلام بازاریابی', icon: Users, color: 'bg-teal-100 text-teal-800 border-teal-200' },
  calculator: { label: 'برآورد و قیمت‌گذاری', icon: SlidersHorizontal, color: 'bg-amber-100 text-amber-800 border-amber-200' },
  production: { label: 'دستور تولید کارخانه', icon: Layers, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  warehouse: { label: 'انبار و متریال', icon: HardDrive, color: 'bg-sky-100 text-sky-800 border-sky-200' },
  studio: { label: 'استودیو خط تیغ', icon: Compass, color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  users: { label: 'کاربران و دسترسی‌ها', icon: User, color: 'bg-violet-100 text-violet-800 border-violet-200' },
  hr: { label: 'منابع انسانی و ارزیابی', icon: Activity, color: 'bg-rose-100 text-rose-800 border-rose-200' },
  storage: { label: 'فایل‌ها و استوریج', icon: HardDrive, color: 'bg-slate-100 text-slate-800 border-slate-200' },
  ai: { label: 'هوش مصنوعی', icon: Sparkles, color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200' },
  pricing: { label: 'فرمول‌های پایه', icon: SlidersHorizontal, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  admin: { label: 'عملیات مدیریتی', icon: ShieldAlert, color: 'bg-red-100 text-red-800 border-red-200' }
};

const ACTION_COLORS = {
  login: 'bg-purple-50 text-purple-700 border-purple-200',
  logout: 'bg-slate-50 text-slate-700 border-slate-200',
  create_order: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  edit_order: 'bg-amber-50 text-amber-700 border-amber-200',
  update_stage: 'bg-blue-50 text-blue-700 border-blue-200',
  reject_stage: 'bg-rose-50 text-rose-700 border-rose-200',
  delete_order: 'bg-rose-100 text-rose-800 border-rose-300 font-black',
  create_lead: 'bg-teal-50 text-teal-700 border-teal-200',
  estimate_lead: 'bg-amber-50 text-amber-700 border-amber-200',
  update_lead_status: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  convert_lead_to_order: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
  warehouse_receipt: 'bg-sky-50 text-sky-700 border-sky-200',
  user_create: 'bg-violet-50 text-violet-700 border-violet-200',
  user_edit: 'bg-violet-50 text-violet-700 border-violet-200',
  user_delete: 'bg-rose-100 text-rose-800 border-rose-300 font-black',
  file_delete: 'bg-rose-50 text-rose-700 border-rose-200',
  status_color_change: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  dieline_export: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  logs_cleared: 'bg-red-100 text-red-800 border-red-300 font-black'
};

export default function AuditLogsView() {
  const { currentUser, role } = useAuth();

  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState([]);

  // Filters
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogsCount, setTotalLogsCount] = useState(0);
  const limit = 30;

  // Modals
  const [selectedLogDetails, setSelectedLogDetails] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearRetentionDays, setClearRetentionDays] = useState(0);
  const [clearing, setClearing] = useState(false);

  // Fetch users for dropdown
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await api.getUsers();
        if (res?.users) {
          setUsersList(res.users);
        }
      } catch (err) {
        console.error('Failed to fetch users list:', err);
      }
    }
    fetchUsers();
  }, []);

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const res = await api.getActivityLogStats();
      if (res?.success) {
        setStats(res);
      }
    } catch (err) {
      console.error('Failed to load log stats:', err);
    }
  };

  // Fetch logs with current filters
  const fetchLogs = async (targetPage = page) => {
    setLoading(true);
    try {
      const params = {
        page: targetPage,
        limit,
        ...(selectedUser !== 'all' && { username: selectedUser }),
        ...(selectedModule !== 'all' && { module: selectedModule }),
        ...(selectedAction !== 'all' && { action: selectedAction }),
        ...(searchQuery.trim() && { search: searchQuery.trim() })
      };

      const res = await api.getActivityLogs(params);
      if (res?.success) {
        setLogs(res.logs || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalLogsCount(res.pagination?.total || 0);
        setPage(res.pagination?.page || 1);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
    fetchStats();
  }, [selectedUser, selectedModule, selectedAction]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const handleClearLogs = async () => {
    if (!window.confirm(`آیا از پاکسازی لاگ‌ها اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`)) {
      return;
    }
    setClearing(true);
    try {
      await api.clearActivityLogs(clearRetentionDays);
      setShowClearModal(false);
      fetchLogs(1);
      fetchStats();
    } catch (err) {
      alert('خطا در پاکسازی لاگ‌ها: ' + err.message);
    } finally {
      setClearing(false);
    }
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams({
      ...(selectedUser !== 'all' && { username: selectedUser }),
      ...(selectedModule !== 'all' && { module: selectedModule }),
      ...(selectedAction !== 'all' && { action: selectedAction }),
      ...(searchQuery.trim() && { search: searchQuery.trim() })
    }).toString();

    window.open(`/api/logs/export-excel?${params}`, '_blank');
  };

  if (role !== 'ceo') {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-rose-200 space-y-4 max-w-xl mx-auto mt-12" dir="rtl">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto animate-bounce" />
        <h3 className="text-xl font-black text-slate-800">دسترسی به بخش ممیزی و لاگ‌ها محدود است</h3>
        <p className="text-sm text-slate-600">
          مشاهده تاریخچه فعالیت کاربران و ممیزی سیستم کارخانه منحصراً در اختیار مدیریت عامل می‌باشد.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800 font-sans pb-16" dir="rtl">
      
      {/* 1. Header Banner & Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-400 shadow-inner">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2 flex-wrap">
                <span>مرکز ممیزی و تاریخچه فعالیت کاربران</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                  Audit Trail
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ⚡ پاکسازی خودکار هر ۳۰ روز
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                ثبت دقیق و بلادرنگ تمامی اقدامات پرسنل، تغییرات سفارشات، ورودها، قیمت‌گذاری‌ها و تغییر وضعیت‌ها
              </p>
            </div>
          </div>
        </div>

        {/* Top Header Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap self-stretch sm:self-auto justify-end">
          <button
            onClick={() => {
              fetchLogs(page);
              fetchStats();
            }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold transition shadow-sm"
            title="به‌روزرسانی لحظه‌ای"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
            <span>به‌روزرسانی</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold transition shadow-sm border border-emerald-600"
            title="دانلود فایل اکسل CSV از لاگ‌های فیلترشده"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>خروجی اکسل (CSV)</span>
          </button>

          <button
            onClick={() => setShowClearModal(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded-2xl text-xs font-bold transition shadow-sm"
            title="پاکسازی تاریخچه لاگ‌ها"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>مدیریت آرشیو</span>
          </button>
        </div>
      </div>

      {/* 2. Key Stats Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400">کل لاگ‌های ثبت‌شده</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {Number(stats.total_count || 0).toLocaleString('fa-IR')}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">ثبت دائم در پایگاه داده</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Boxes className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400">فعالیت‌های امروز</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {Number(stats.today_count || 0).toLocaleString('fa-IR')}
              </div>
              <div className="text-[11px] text-emerald-700 font-bold mt-0.5">در طول ۲۴ ساعت اخیر</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400">کاربران فعال امروز</div>
              <div className="text-2xl font-black text-purple-600 mt-1">
                {Number(stats.active_users_today || 0).toLocaleString('fa-IR')} نفر
              </div>
              <div className="text-[11px] text-purple-700 font-bold mt-0.5">پرسنل آنلاین و فعال</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400">پرکارترین کاربر</div>
              <div className="text-base font-black text-amber-700 truncate max-w-[140px] mt-1">
                {stats.top_users?.[0]?.full_name || '---'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {stats.top_users?.[0]?.activity_count ? `${Number(stats.top_users[0].activity_count).toLocaleString('fa-IR')} عملیات ثبت‌شده` : '---'}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <User className="w-6 h-6" />
            </div>
          </div>

        </div>
      )}

      {/* 3. Filter Controls & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          
          {/* Universal Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو در شرح اقدام، نام مشتری، عنوان جعبه، نام کاربر یا آدرس IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  fetchLogs(1);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-black transition shadow-xs flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>جستجو</span>
          </button>
        </form>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          
          {/* 1. Filter by User */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 block">فیلتر کاربر و پرسنل:</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">همه کاربران کارخانه ({usersList.length} کاربر)</option>
              {usersList.map((u) => (
                <option key={u.id} value={u.username}>
                  {u.full_name} ({u.username} - {u.department})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Filter by Module */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 block">فیلتر بخش و ماژول:</label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">همه بخش‌های سیستم</option>
              {Object.entries(MODULE_DEFINITIONS).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Filter by Action */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 block">فیلتر نوع عملیات:</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">همه عملیات‌ها</option>
              <option value="login">🔐 ورود به سیستم</option>
              <option value="create_order">📦 ثبت سفارش جدید</option>
              <option value="update_stage">➡️ انتقال مرحله گردش کار</option>
              <option value="reject_stage">↩️ برگشت سفارش (اصلاحات)</option>
              <option value="delete_order">🗑️ حذف سفارش</option>
              <option value="create_lead">👥 ثبت استعلام بازاریابی</option>
              <option value="estimate_lead">🧮 برآورد و اعلام قیمت</option>
              <option value="update_lead_status">✅ تغییر وضعیت استعلام</option>
              <option value="convert_lead_to_order">🏭 تبدیل استعلام به سفارش</option>
              <option value="status_color_change">🎨 تغییر وضعیت رنگی صف تولید</option>
              <option value="warehouse_receipt">📥 ورود کالا به انبار</option>
              <option value="user_create">👤 ایجاد کاربر جدید</option>
              <option value="user_edit">✏️ ویرایش اطلاعات کاربر</option>
              <option value="user_delete">🚫 حذف کاربر</option>
              <option value="file_delete">🗑️ حذف فایل از Storage</option>
            </select>
          </div>

        </div>

      </div>

      {/* 4. Logs Timeline / Table View */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h3 className="font-black text-slate-900 text-sm sm:text-base">
              فهرست لاگ‌های ثبت‌شده
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
              {Number(totalLogsCount).toLocaleString('fa-IR')} رکورد
            </span>
          </div>

          <div className="text-xs text-slate-500 font-bold">
            صفحه {Number(page).toLocaleString('fa-IR')} از {Number(totalPages).toLocaleString('fa-IR')}
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">در حال بارگذاری لاگ‌ها و گزارش ممیزی...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Info className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm">هیچ لاگی با فیلترهای انتخابی یافت نشد</h4>
            <p className="text-xs text-slate-400">می‌توانید فیلترها را تغییر داده یا عبارت جستجو را پاک کنید.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => {
              const modDef = MODULE_DEFINITIONS[log.module] || { label: log.module, icon: Activity, color: 'bg-slate-100 text-slate-700' };
              const ModIcon = modDef.icon;
              const actionClass = ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-700 border-slate-200';

              return (
                <div
                  key={log.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  {/* Left: User, Module & Action Information */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    
                    {/* User Identity Chip */}
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0 shadow-xs">
                      {log.full_name ? log.full_name.charAt(0) : 'U'}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      
                      {/* User Info Bar */}
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <strong className="text-slate-900 font-black">{log.full_name}</strong>
                        <span className="font-mono text-[11px] text-slate-400">(@{log.username})</span>
                        
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${modDef.color} flex items-center gap-1`}>
                          <ModIcon className="w-3 h-3" />
                          <span>{modDef.label}</span>
                        </span>

                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${actionClass}`}>
                          {log.action}
                        </span>

                        {log.target_name && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            سوژه: {log.target_name}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                        {log.description}
                      </p>

                      {/* Metadata Row: Time, IP, Target */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium flex-wrap pt-0.5">
                        <span className="flex items-center gap-1 font-mono text-slate-500">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{log.date_fa}</span>
                        </span>
                        <span className="flex items-center gap-1 font-mono text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{log.time_fa}</span>
                        </span>
                        {log.ip_address && (
                          <span className="flex items-center gap-1 font-mono text-slate-400">
                            <Globe className="w-3 h-3" />
                            <span>IP: {log.ip_address}</span>
                          </span>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Right: Technical Details Button */}
                  <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                    {log.details && (
                      <button
                        onClick={() => setSelectedLogDetails(log)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>جزئیات داده</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* 5. Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={() => {
                const prev = Math.max(1, page - 1);
                fetchLogs(prev);
              }}
              disabled={page === 1 || loading}
              className="flex items-center gap-1 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
              <span>صفحه قبلی</span>
            </button>

            <span className="text-xs font-bold text-slate-600">
              صفحه {Number(page).toLocaleString('fa-IR')} از {Number(totalPages).toLocaleString('fa-IR')}
            </span>

            <button
              onClick={() => {
                const next = Math.min(totalPages, page + 1);
                fetchLogs(next);
              }}
              disabled={page === totalPages || loading}
              className="flex items-center gap-1 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold disabled:opacity-40 transition"
            >
              <span>صفحه بعدی</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* 6. Technical Details Modal */}
      {selectedLogDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={() => setSelectedLogDetails(null)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-800 text-sm sm:text-base">
                  جزئیات فنی رکورد لاگ #{selectedLogDetails.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLogDetails(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-600">
                  <span>کاربر اقدام‌کننده:</span>
                  <span className="text-slate-900">{selectedLogDetails.full_name} ({selectedLogDetails.username})</span>
                </div>
                <div className="flex items-center justify-between font-bold text-slate-600">
                  <span>تاریخ و زمان دقیق:</span>
                  <span className="font-mono text-slate-900">{selectedLogDetails.full_date_fa}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-slate-600">
                  <span>آدرس IP کاربر:</span>
                  <span className="font-mono text-slate-900">{selectedLogDetails.ip_address}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">شرح ثبت‌شده:</label>
                <p className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 leading-relaxed font-medium">
                  {selectedLogDetails.description}
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">داده‌های ساختاریافته (JSON Payload):</label>
                <pre className="p-3.5 bg-slate-900 text-amber-300 font-mono text-[11px] rounded-2xl overflow-x-auto max-h-60" dir="ltr">
                  {JSON.stringify(selectedLogDetails.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLogDetails(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Clear Logs Modal */}
      {showClearModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={() => setShowClearModal(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center gap-3 text-rose-600 border-b border-slate-100 pb-3">
              <div className="p-2.5 bg-rose-50 rounded-2xl border border-rose-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">پاکسازی تاریخچه لاگ‌ها</h3>
                <p className="text-xs text-slate-500">حذف رکوردهای قدیمی جهت بهینه‌سازی دیتابیس</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                لطفاً بازه زمانی مورد نظر برای نگهداری لاگ‌ها را مشخص فرمایید:
              </p>

              <div className="space-y-2">
                <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="retention"
                    value="90"
                    checked={clearRetentionDays === 90}
                    onChange={() => setClearRetentionDays(90)}
                    className="text-rose-600"
                  />
                  <div>
                    <strong className="text-slate-900 block font-black">حذف لاگ‌های قدیمی‌تر از ۹۰ روز</strong>
                    <span className="text-[11px] text-slate-400">نگهداری ۳ ماه اخیر (پیشنهادی)</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="retention"
                    value="30"
                    checked={clearRetentionDays === 30}
                    onChange={() => setClearRetentionDays(30)}
                    className="text-rose-600"
                  />
                  <div>
                    <strong className="text-slate-900 block font-black">حذف لاگ‌های قدیمی‌تر از ۳۰ روز</strong>
                    <span className="text-[11px] text-slate-400">نگهداری ۱ ماه اخیر</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 cursor-pointer">
                  <input
                    type="radio"
                    name="retention"
                    value="0"
                    checked={clearRetentionDays === 0}
                    onChange={() => setClearRetentionDays(0)}
                    className="text-rose-600"
                  />
                  <div>
                    <strong className="text-rose-900 block font-black">حذف کامل تمامی لاگ‌ها (صفر کردن تاریخچه)</strong>
                    <span className="text-[11px] text-rose-500">تمامی لاگ‌های سیستم پاکسازی می‌شوند</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                انصراف
              </button>
              <button
                onClick={handleClearLogs}
                disabled={clearing}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {clearing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>اجرای پاکسازی</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
