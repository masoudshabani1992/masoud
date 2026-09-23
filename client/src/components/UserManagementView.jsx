import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { ROLES, formatDateFa, normalizeSearch } from '../utils/helpers';
import {
  Users,
  UserPlus,
  Shield,
  KeyRound,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Lock,
  Phone,
  Building2,
  UserCheck,
  Search,
  Check,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  ShieldCheck,
  Layers,
  FileSpreadsheet,
  Package,
  Box,
  Kanban,
  Calculator,
  Sliders,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  UserX,
  Zap
} from 'lucide-react';

export const ALL_PERMISSION_MODULES = [
  {
    category: '۱. دستور تولید (تولید، دیجیتال، خدماتی)',
    icon: FileSpreadsheet,
    color: 'border-indigo-300 bg-indigo-50/50 text-indigo-900',
    permissions: [
      { key: 'can_view_production_offset', label: '۱. تولید (افست و جعبه‌سازی)', desc: 'مشاهده صف تولید، پرونده مالی و بایگانی کارهای افست' },
      { key: 'can_view_production_digital', label: '۲. دیجیتال', desc: 'مشاهده و کار با سفارشات چاپ دیجیتال و پلات' },
      { key: 'can_view_production_service', label: '۳. خدماتی', desc: 'مشاهده کارهای خدماتی دایکات، سلفون و چسب با مقوای مشتری' },
      { key: 'can_create_production_order', label: 'صدور دستور تولید جدید', desc: 'امکان ثبت و صدور مستقیم دستور کار برای سالن' }
    ]
  },
  {
    category: '۲. انبارداری ۶ گانه کارخانه',
    icon: Package,
    color: 'border-sky-300 bg-sky-50/50 text-sky-900',
    permissions: [
      { key: 'can_view_warehouse_cardboard', label: 'انبار مقوا', desc: 'ایندربرد، پشت طوسی، گلاسه، کرافت، تحریر' },
      { key: 'can_view_warehouse_sheet_carton', label: 'انبار ورق', desc: 'ورق کارتن ۳ لایه و ۵ لایه صنعتی' },
      { key: 'can_view_warehouse_single_face', label: 'انبار سینگل', desc: 'رول و شیت سینگل فلوت E و F' },
      { key: 'can_view_warehouse_cellophane', label: 'انبار سلفون', desc: 'سلفون مات، براق، مخملی، واتربیس' },
      { key: 'can_view_warehouse_pvc_film', label: 'انبار طلق', desc: 'طلق شفاف PVC و PET پنجره جعبه' },
      { key: 'can_view_warehouse_ink', label: 'انبار مرکب', desc: 'مرکب‌های CMYK، پنتون، طلایی، نقره‌ای' },
      { key: 'can_create_warehouse_receipt', label: 'ثبت رسید ورود کالا به انبار', desc: 'امکان ثبت بار تخلیه‌شده و ورود کالا' }
    ]
  },
  {
    category: '۳. بازاریابی و فروش میدانی',
    icon: Users,
    color: 'border-teal-300 bg-teal-50/50 text-teal-900',
    permissions: [
      { key: 'can_view_marketing', label: 'کارتابل استعلامات بازاریابی', desc: 'مشاهده و پیگیری استعلام‌ها و لیدهای مشتریان' },
      { key: 'can_create_marketing_lead', label: 'ثبت استعلام بازاریابی جدید', desc: 'امکان ارسال استعلام قیمت به واحد برآورد' }
    ]
  },
  {
    category: '۴. طراحی، هوش مصنوعی و آتلیه (استودیو امیران)',
    icon: Box,
    color: 'border-amber-300 bg-amber-50/50 text-amber-900',
    permissions: [
      { key: 'can_view_studio', label: 'استودیو طراحی امیران (۲D و ۳D)', desc: 'تولید نقشه خط تیغ، رندرینگ ۳ بعدی و خروجی DXF/PDF/AI' },
      { key: 'can_view_ai', label: 'دستیار هوش مصنوعی و بازرسی خط تیغ', desc: 'استخراج هوشمند، بهینه‌ساز فرم‌بندی و بازرسی پرواز' }
    ]
  },
  {
    category: '۵. فرآیند تولید، آرشیو و وظایف',
    icon: Kanban,
    color: 'border-purple-300 bg-purple-50/50 text-purple-900',
    permissions: [
      { key: 'can_view_hub', label: 'صفحه اصلی کارخانه (Hub)', desc: 'دسترسی به هاب ناوبری و خلاصه وضعیت' },
      { key: 'can_view_kanban', label: 'گردش کار ۹ مرحله‌ای کارخانه', desc: 'مشاهده بردهای پیشرفت پروژه از بازرگانی تا تولید' },
      { key: 'can_view_archive', label: 'آرشیو محصولات و پرونده‌ها', desc: 'دفتر تلفن، جستجو در آرشیو فنی، کد بایگانی و مشتریان' },
      { key: 'can_create_order', label: 'ثبت سفارش کامل صنعتی', desc: 'فرم تعریف سفارش کامل و ارسال به پیش‌فاکتور' },
      { key: 'can_view_my_tasks', label: 'کارتابل وظایف من (Inbox)', desc: 'مشاهده پروژه‌های در انتظار اقدام اختصاصی این کاربر' }
    ]
  },
  {
    category: '۶. امور مالی، برآورد قیمت و گزارشات',
    icon: Calculator,
    color: 'border-emerald-300 bg-emerald-50/50 text-emerald-900',
    permissions: [
      { key: 'can_view_calculator', label: 'ماشین‌حساب برآورد صنعتی قیمت', desc: 'محاسبه بهای تمام‌شده، سود و قیمت کارتن/جعبه' },
      { key: 'can_view_material_prices', label: 'قیمت روز متریال و فرمول‌ها', desc: 'مشاهده و ویرایش نرخ مقوا، سلفون، زینک و خدمات' },
      { key: 'can_view_dashboard', label: 'داشبورد تحلیلی و گزارشات کارخانه', desc: 'مشاهده نمودارهای مالی، تیراژ و عملکرد تولید' }
    ]
  },
  {
    category: '۷. مدیریت سیستم و پشتیبان‌گیری',
    icon: Shield,
    color: 'border-rose-300 bg-rose-50/50 text-rose-900',
    permissions: [
      { key: 'can_manage_users', label: 'مدیریت پرسنل و سطوح دسترسی', desc: 'تعریف کاربر جدید، تنظیم سطح دسترسی و ریست رمز' },
      { key: 'can_view_migration', label: 'مرکز مهاجرت داده‌ها و بک‌آپ', desc: 'ایمپورت اکسل نرم‌افزار قبلی، پشتیبان و ریستور' }
    ]
  }
];

export const ROLE_PRESETS = {
  design: {
    name: 'طراح (Designer)',
    desc: 'دسترسی انحصاری به استودیو طراحی امیران، هوش مصنوعی و وظایف خود',
    permissions: {
      can_view_studio: true,
      can_view_ai: true,
      can_view_my_tasks: true
    }
  },
  marketer: {
    name: 'بازاریاب (Marketer)',
    desc: 'دسترسی انحصاری به کارتابل بازاریابی، ثبت استعلام و استعلام قیمت',
    permissions: {
      can_view_marketing: true,
      can_create_marketing_lead: true,
      can_view_calculator: true
    }
  },
  secretary: {
    name: 'مسئول دفتر (Secretary)',
    desc: 'دسترسی به ثبت سفارش جدید، آرشیو مشتریان، صفحه اصلی و وظایف دفتری',
    permissions: {
      can_create_order: true,
      can_view_archive: true,
      can_view_my_tasks: true,
      can_view_hub: true
    }
  },
  production: {
    name: 'سرپرست سالن تولید (Production Manager)',
    desc: 'دسترسی به دستور تولید (۳ بخش)، انبارهای ۶ گانه، گردش کار و داشبورد',
    permissions: {
      can_view_hub: true,
      can_view_production_offset: true,
      can_view_production_digital: true,
      can_view_production_service: true,
      can_create_production_order: true,
      can_view_warehouse_cardboard: true,
      can_view_warehouse_sheet_carton: true,
      can_view_warehouse_single_face: true,
      can_view_warehouse_cellophane: true,
      can_view_warehouse_pvc_film: true,
      can_view_warehouse_ink: true,
      can_create_warehouse_receipt: true,
      can_view_kanban: true,
      can_view_archive: true,
      can_view_my_tasks: true,
      can_view_dashboard: true
    }
  },
  warehouse: {
    name: 'انباردار (Warehouse Master)',
    desc: 'دسترسی به تمام انبارهای ۶ گانه کارخانه و ثبت رسید بار',
    permissions: {
      can_view_warehouse_cardboard: true,
      can_view_warehouse_sheet_carton: true,
      can_view_warehouse_single_face: true,
      can_view_warehouse_cellophane: true,
      can_view_warehouse_pvc_film: true,
      can_view_warehouse_ink: true,
      can_create_warehouse_receipt: true,
      can_view_my_tasks: true
    }
  },
  sales: {
    name: 'مدیر بازرگانی و فروش (Sales Manager)',
    desc: 'دسترسی به بازاریابی، ثبت سفارش، محاسبه قیمت، گردش کار و دستور تولید',
    permissions: {
      can_view_hub: true,
      can_view_marketing: true,
      can_create_marketing_lead: true,
      can_create_order: true,
      can_view_archive: true,
      can_view_kanban: true,
      can_view_my_tasks: true,
      can_view_calculator: true,
      can_view_production_offset: true,
      can_view_production_digital: true,
      can_view_production_service: true,
      can_create_production_order: true,
      can_view_material_prices: true,
      can_view_dashboard: true
    }
  },
  accounting: {
    name: 'حسابدار و برآورد (Estimation / Accountant)',
    desc: 'دسترسی به برآورد قیمت، نرخ متریال، آرشیو، وظایف و داشبورد مالی',
    permissions: {
      can_view_hub: true,
      can_view_calculator: true,
      can_view_material_prices: true,
      can_view_archive: true,
      can_view_my_tasks: true,
      can_view_kanban: true,
      can_view_production_offset: true,
      can_view_production_digital: true,
      can_view_production_service: true,
      can_view_marketing: true,
      can_view_dashboard: true
    }
  },
  ceo: {
    name: 'مدیرعامل (CEO Full Master)',
    desc: 'دسترسی ۱۰۰٪ کامل به تمام بخش‌ها، پرسنل، بک‌آپ و تنظیمات',
    permissions: Object.fromEntries(
      ALL_PERMISSION_MODULES.flatMap(m => m.permissions.map(p => [p.key, true]))
    )
  }
};

export default function UserManagementView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // New User Form State
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'sales',
    department: 'واحد بازرگانی',
    phone: '',
    is_active: true,
    permissions: { ...ROLE_PRESETS.sales.permissions }
  });
  
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editPassword, setEditPassword] = useState('');
  const [activeTabForm, setActiveTabForm] = useState('info'); // 'info' | 'permissions'

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getUsers();
      setUsers(res.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply Role Preset to New User
  const applyPresetToNewUser = (roleKey) => {
    const preset = ROLE_PRESETS[roleKey];
    if (!preset) return;
    
    // Create new permissions object with all keys explicitly false except preset keys
    const newPerms = {};
    ALL_PERMISSION_MODULES.forEach(cat => {
      cat.permissions.forEach(p => {
        newPerms[p.key] = Boolean(preset.permissions[p.key]);
      });
    });

    setNewUser(prev => ({
      ...prev,
      role: roleKey,
      department: ROLES.find(r => r.id === roleKey)?.name || prev.department,
      permissions: newPerms
    }));
  };

  // Apply Role Preset to Editing User
  const applyPresetToEditingUser = (roleKey) => {
    const preset = ROLE_PRESETS[roleKey];
    if (!preset || !editingUser) return;

    const newPerms = {};
    ALL_PERMISSION_MODULES.forEach(cat => {
      cat.permissions.forEach(p => {
        newPerms[p.key] = Boolean(preset.permissions[p.key]);
      });
    });

    setEditingUser(prev => ({
      ...prev,
      role: roleKey,
      department: ROLES.find(r => r.id === roleKey)?.name || prev.department,
      permissions: newPerms
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!newUser.username.trim() || !newUser.password.trim() || !newUser.full_name.trim()) {
      setErrorMsg('لطفاً نام، نام کاربری و کلمه عبور را تکمیل نمایید.');
      return;
    }

    setFormLoading(true);
    try {
      await api.createUser(newUser);
      setSuccessMsg(`حساب کاربری «${newUser.full_name}» با موفقیت و دسترسی‌های مشخص تعریف گردید.`);
      setNewUser({
        username: '',
        password: '',
        full_name: '',
        role: 'sales',
        department: 'واحد بازرگانی',
        phone: '',
        is_active: true,
        permissions: { ...ROLE_PRESETS.sales.permissions }
      });
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.message || 'خطا در ثبت کاربر جدید');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await api.updateUser(editingUser.id, {
        full_name: editingUser.full_name,
        role: editingUser.role,
        department: editingUser.department,
        phone: editingUser.phone,
        password: editPassword,
        permissions: editingUser.permissions,
        is_active: editingUser.is_active
      });
      setEditingUser(null);
      setEditPassword('');
      fetchUsers();
    } catch (err) {
      alert('خطا در به‌روزرسانی: ' + err.message);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await api.updateUser(user.id, {
        ...user,
        is_active: !user.is_active
      });
      fetchUsers();
    } catch (err) {
      alert('خطا در تغییر وضعیت حساب: ' + err.message);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (confirm(`آیا از حذف کامل حساب کاربری «${name}» اطمینان دارید؟`)) {
      try {
        await api.deleteUser(id);
        fetchUsers();
      } catch (err) {
        alert('خطا در حذف کاربر: ' + err.message);
      }
    }
  };

  const countActivePermissions = (userPerms) => {
    if (!userPerms) return 0;
    return Object.values(userPerms).filter(Boolean).length;
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (!searchTerm) return true;
    const term = normalizeSearch(searchTerm);
    return (
      normalizeSearch(u.full_name).includes(term) ||
      normalizeSearch(u.username).includes(term) ||
      normalizeSearch(u.department).includes(term) ||
      normalizeSearch(u.phone).includes(term)
    );
  });

  return (
    <div className="w-full space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-amber-300 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>مدیریت کاربران و تفکیک سطوح دسترسی (RBAC Granular Security)</span>
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              تنظیم دقیق ۲۵ دسترسی ماژولار برای هر پرسنل با قابلیت ایزوله‌سازی کامل بخش‌های طراح، بازاریاب و مسئول دفتر
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/90 px-4 py-2.5 rounded-xl border border-slate-700 text-center">
            <div className="text-xl font-black text-emerald-400">{users.filter(u => u.is_active).length}</div>
            <div className="text-[11px] text-slate-300 font-bold">کاربر فعال</div>
          </div>
          <div className="bg-slate-800/90 px-4 py-2.5 rounded-xl border border-slate-700 text-center">
            <div className="text-xl font-black text-amber-400">{users.length}</div>
            <div className="text-[11px] text-slate-300 font-bold">کل کاربران</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Create User Form + User List */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Right Form: Add New User with Granular Permissions */}
        <div className="xl:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-black text-slate-800">تعریف کاربر جدید و تنظیم دسترسی</h3>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setActiveTabForm('info')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  activeTabForm === 'info' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                اطلاعات فردی
              </button>
              <button
                type="button"
                onClick={() => setActiveTabForm('permissions')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 ${
                  activeTabForm === 'permissions' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>سطوح دسترسی</span>
                <span className="bg-amber-400 text-slate-900 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {countActivePermissions(newUser.permissions)}
                </span>
              </button>
            </div>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4 text-sm">
            
            {activeTabForm === 'info' ? (
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">نام و نام خانوادگی:</label>
                  <input
                    type="text"
                    placeholder="مثال: مسعود شعبانی"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">نام کاربری (لاتین):</label>
                    <input
                      type="text"
                      placeholder="masoud_sales"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-center focus:bg-white focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">کلمه عبور (Password):</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-center focus:bg-white focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>نقش و الگوی پیش‌فرض دسترسی:</span>
                    <span className="text-[11px] text-indigo-600 font-bold">با انتخاب الگو، دسترسی‌ها تنظیم می‌شوند</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {ROLES.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => applyPresetToNewUser(r.id)}
                        className={`p-2 rounded-xl text-xs font-bold text-right border transition-all ${
                          newUser.role === r.id
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm ring-2 ring-indigo-300 font-black'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="text-[11px]">{r.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">واحد سازمانی / دپارتمان:</label>
                    <input
                      type="text"
                      value={newUser.department}
                      onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-xs focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">شماره تلفن همراه:</label>
                    <input
                      type="text"
                      placeholder="0912..."
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono text-center text-xs focus:bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTabForm('permissions')}
                    className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>مشاهده و ویرایش جزئیات ۲۵ سطح دسترسی این کاربر ←</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Granular Permissions Matrix */
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-black text-slate-700">
                    فعال‌سازی ماژولار دسترسی‌ها:
                  </span>
                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const allOn = {};
                        ALL_PERMISSION_MODULES.forEach(cat => cat.permissions.forEach(p => { allOn[p.key] = true; }));
                        setNewUser({ ...newUser, permissions: allOn });
                      }}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[10px]"
                    >
                      انتخاب همه
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const allOff = {};
                        ALL_PERMISSION_MODULES.forEach(cat => cat.permissions.forEach(p => { allOff[p.key] = false; }));
                        setNewUser({ ...newUser, permissions: allOff });
                      }}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-rose-700 font-bold rounded text-[10px]"
                    >
                      لغو همه
                    </button>
                  </div>
                </div>

                <div className="max-h-[380px] overflow-y-auto space-y-3 pl-1">
                  {ALL_PERMISSION_MODULES.map((cat, idx) => {
                    const CatIcon = cat.icon;
                    return (
                      <div key={idx} className={`p-3 rounded-xl border ${cat.color} space-y-2`}>
                        <div className="flex items-center gap-2 font-black text-xs">
                          <CatIcon className="w-4 h-4 shrink-0" />
                          <span>{cat.category}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-1.5 pt-1">
                          {cat.permissions.map((p) => {
                            const isChecked = Boolean(newUser.permissions?.[p.key]);
                            return (
                              <label
                                key={p.key}
                                className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                                  isChecked ? 'bg-white shadow-xs border border-slate-200/80' : 'bg-white/40 hover:bg-white/70'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    setNewUser(prev => ({
                                      ...prev,
                                      permissions: {
                                        ...prev.permissions,
                                        [p.key]: e.target.checked
                                      }
                                    }));
                                  }}
                                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                                <div className="text-right">
                                  <div className={`text-xs font-bold ${isChecked ? 'text-slate-900 font-black' : 'text-slate-700'}`}>
                                    {p.label}
                                  </div>
                                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                                    {p.desc}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={formLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <UserPlus className="w-4 h-4" />
              <span>{formLoading ? 'در حال ثبت...' : 'ثبت کاربر و ذخیره دسترسی‌های انتخابی'}</span>
            </button>
          </form>
        </div>

        {/* Left Table: Users List & Management */}
        <div className="xl:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-800">لیست پرسنل و دسترسی‌های فعال</h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="جستجو نام، نام کاربری..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-9 pl-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 font-bold bg-slate-50 text-slate-700 focus:outline-none"
                >
                  <option value="all">همه نقش‌ها</option>
                  {ROLES.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                    <th className="p-3 rounded-r-xl">پرسنل</th>
                    <th className="p-3">نام کاربری</th>
                    <th className="p-3">نقش سازمانی</th>
                    <th className="p-3 text-center">تعداد دسترسی</th>
                    <th className="p-3 text-center">وضعیت</th>
                    <th className="p-3 text-center rounded-l-xl">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const matchedRole = ROLES.find((r) => r.id === u.role);
                    const activePermCount = countActivePermissions(u.permissions);
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3">
                          <div className="font-black text-slate-900 text-sm">{u.full_name}</div>
                          <div className="text-[11px] text-slate-400">{u.phone || u.department}</div>
                        </td>
                        <td className="p-3 font-mono font-bold text-indigo-700">
                          @{u.username}
                        </td>
                        <td className="p-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-lg text-white font-bold text-[11px] ${matchedRole?.color || 'bg-slate-600'}`}>
                            {matchedRole?.name || u.role}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Shield className="w-3 h-3 text-indigo-500" />
                            <span>{activePermCount} ماژول</span>
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(u)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                              u.is_active
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            }`}
                            title="کلیک برای فعال/غیرفعال‌سازی حساب"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                            <span>{u.is_active ? 'فعال' : 'مسدود'}</span>
                          </button>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingUser({
                                  ...u,
                                  permissions: u.permissions || ROLE_PRESETS[u.role]?.permissions || {}
                                });
                                setEditPassword('');
                              }}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="ویرایش دسترسی‌ها و کلمه عبور"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {u.role !== 'ceo' && (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u.id, u.full_name)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="حذف حساب"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Role Access Matrix Guide */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <span>قوانین ایزوله‌سازی دسترسی نقش‌ها (Role Isolation Policies)</span>
          </h3>
          <span className="text-xs font-bold text-slate-500">حفاظت از اطلاعات محرمانه و انحصاری</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-2 text-xs">
          
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-amber-600" />
              <strong className="text-sm font-black text-amber-950">۱. نقش طراح (Designer Isolation)</strong>
            </div>
            <p className="text-amber-900 leading-relaxed font-medium">
              طراح صرفاً به <strong>استودیو طراحی امیران</strong> و <strong>هوش مصنوعی</strong> دسترسی دارد. اطلاعات انبار، قیمت‌ها، امور مالی و سرنخ‌های فروش برای طراح کاملاً مخفی است.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <strong className="text-sm font-black text-teal-950">۲. نقش بازاریاب (Marketer Isolation)</strong>
            </div>
            <p className="text-teal-900 leading-relaxed font-medium">
              بازاریاب تنها <strong>کارتابل استعلامات بازاریابی</strong>، ثبت استعلام و ماشین‌حساب قیمت را می‌بیند و به خط تولید کارخانه، موجودی انبارها و آرشیو مشتریان دیگر دسترسی ندارد.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-600" />
              <strong className="text-sm font-black text-purple-950">۳. مسئول دفتر (Secretary Isolation)</strong>
            </div>
            <p className="text-purple-900 leading-relaxed font-medium">
              مسئول دفتر صرفاً به <strong>ثبت سفارش جدید</strong> و <strong>دفترچه تلفن/آرشیو مشتریان</strong> دسترسی داشته و از محاسبات فرمول، بهای تمام‌شده و تایید مدیرعامل بی‌خبر است.
            </p>
          </div>

        </div>
      </div>

      {/* Edit User Modal with Permissions Matrix */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col justify-between">
            <div>
              <div className="font-black text-base text-slate-800 border-b pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-indigo-600" />
                  <span>ویرایش کاربر و دسترسی‌ها: {editingUser.full_name} (@{editingUser.username})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="text-slate-400 hover:text-slate-700 font-black text-lg p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateUser} id="editUserForm" className="space-y-4 text-xs sm:text-sm pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">نام کامل:</label>
                    <input
                      type="text"
                      value={editingUser.full_name}
                      onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                      className="w-full border rounded-xl p-2 font-bold bg-slate-50 focus:bg-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">دپارتمان / واحد:</label>
                    <input
                      type="text"
                      value={editingUser.department || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                      className="w-full border rounded-xl p-2 font-bold bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">تلفن همراه:</label>
                    <input
                      type="text"
                      value={editingUser.phone || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                      className="w-full border rounded-xl p-2 font-mono text-center bg-slate-50 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">کلمه عبور جدید (اختیاری):</label>
                    <input
                      type="password"
                      placeholder="در صورت خالی ماندن تغییر نمی‌کند"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full border rounded-xl p-2 font-mono text-center bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>اعمال سریع الگوی دسترسی نقش:</span>
                    <span className="text-[11px] text-indigo-600 font-bold">کلیک کنید تا دسترسی‌ها منطبق شوند</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {ROLES.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => applyPresetToEditingUser(r.id)}
                        className={`p-1.5 rounded-lg text-[11px] font-bold text-center border transition-all ${
                          editingUser.role === r.id
                            ? 'bg-indigo-600 text-white border-indigo-700 font-black shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {r.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Permissions Matrix */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-800">
                      ماتریس دسترسی‌های ۲۵ گانه ({countActivePermissions(editingUser.permissions)} فعال):
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const allOn = {};
                          ALL_PERMISSION_MODULES.forEach(cat => cat.permissions.forEach(p => { allOn[p.key] = true; }));
                          setEditingUser({ ...editingUser, permissions: allOn });
                        }}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[10px]"
                      >
                        انتخاب همه
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const allOff = {};
                          ALL_PERMISSION_MODULES.forEach(cat => cat.permissions.forEach(p => { allOff[p.key] = false; }));
                          setEditingUser({ ...editingUser, permissions: allOff });
                        }}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-rose-700 font-bold rounded text-[10px]"
                      >
                        لغو همه
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[240px] overflow-y-auto space-y-2.5 pl-1 pr-0.5">
                    {ALL_PERMISSION_MODULES.map((cat, idx) => {
                      const CatIcon = cat.icon;
                      return (
                        <div key={idx} className={`p-2.5 rounded-xl border ${cat.color} space-y-1.5`}>
                          <div className="flex items-center gap-1.5 font-black text-xs">
                            <CatIcon className="w-3.5 h-3.5" />
                            <span>{cat.category}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {cat.permissions.map((p) => {
                              const isChecked = Boolean(editingUser.permissions?.[p.key]);
                              return (
                                <label
                                  key={p.key}
                                  className={`flex items-start gap-2 p-1.5 rounded-lg cursor-pointer transition-colors ${
                                    isChecked ? 'bg-white shadow-xs border border-slate-200/80 font-black' : 'bg-white/40 hover:bg-white/70 font-medium'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      setEditingUser(prev => ({
                                        ...prev,
                                        permissions: {
                                          ...prev.permissions,
                                          [p.key]: e.target.checked
                                        }
                                      }));
                                    }}
                                    className="mt-0.5 w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                  />
                                  <div className="text-right">
                                    <div className="text-[11px] text-slate-800 leading-tight">
                                      {p.label}
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingUser.is_active !== false}
                      onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-black text-slate-700">حساب کاربری فعال و مجاز به ورود است</span>
                  </label>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 text-xs"
              >
                انصراف
              </button>
              <button
                type="submit"
                form="editUserForm"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow text-xs"
              >
                ذخیره دسترسی‌ها و مشخصات کاربر
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
