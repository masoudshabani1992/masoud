import React, { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  KeyRound,
  Store,
  Tag,
  Save,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { apiRequest } from '../api.js';
import {
  formatNumber,
  formatToman,
  toEnglishDigits,
} from '../utils/format.js';

export default function AdminUsersView({ bootstrap, onRefreshBootstrap }) {
  const [users, setUsers] = useState([]);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('cashier');
  const [stationName, setStationName] = useState('طبقه پایین - صندوق فروش');

  const [passwordModalUser, setPasswordModalUser] = useState(null);
  const [newPassValue, setNewPassValue] = useState('');

  const [storeCfg, setStoreCfg] = useState({
    store_name: 'نمایندگی صبا باتری - باتری کاوه',
    store_phone: '',
    store_address: '',
    receipt_footer: '',
    next_label_number: '1500',
    label_width_mm: '50',
    label_height_mm: '30',
  });

  const [confirmReset, setConfirmReset] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      const data = await apiRequest('/api/admin/users');
      setUsers(data.users || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (bootstrap?.adminSettings) {
      setStoreCfg((prev) => ({
        ...prev,
        store_name: bootstrap.adminSettings.store_name || prev.store_name,
        store_phone: bootstrap.adminSettings.store_phone || '',
        store_address: bootstrap.adminSettings.store_address || '',
        receipt_footer: bootstrap.adminSettings.receipt_footer || '',
        next_label_number: bootstrap.adminSettings.next_label_number || '1500',
        label_width_mm: bootstrap.adminSettings.label_width_mm || '50',
        label_height_mm: bootstrap.adminSettings.label_height_mm || '30',
      }));
    }
  }, [bootstrap]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await apiRequest('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          username,
          password,
          role,
          stationName,
        }),
      });
      setFullName('');
      setUsername('');
      setPassword('');
      setMessage('حساب کاربری جدید با موفقیت ایجاد شد.');
      await loadUsers();
      if (onRefreshBootstrap) await onRefreshBootstrap();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleUserActive = async (u) => {
    setError('');
    try {
      await apiRequest(`/api/admin/users/${u.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !u.is_active }),
      });
      await loadUsers();
      if (onRefreshBootstrap) await onRefreshBootstrap();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwordModalUser || !newPassValue.trim()) return;
    setError('');
    try {
      await apiRequest(`/api/admin/users/${passwordModalUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({ newPassword: newPassValue.trim() }),
      });
      setMessage(`رمز عبور «${passwordModalUser.full_name}» تغییر یافت.`);
      setPasswordModalUser(null);
      setNewPassValue('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveStoreSettings = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await apiRequest('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({
          ...storeCfg,
          next_label_number: Math.max(1500, Number(toEnglishDigits(storeCfg.next_label_number)) || 1500),
          label_width_mm: toEnglishDigits(storeCfg.label_width_mm),
          label_height_mm: toEnglishDigits(storeCfg.label_height_mm),
        }),
      });
      setMessage('مشخصات چاپی فیش ۸ سانتی و پرینتر لیبل‌زن ذخیره شد.');
      if (onRefreshBootstrap) await onRefreshBootstrap();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetDemo = async () => {
    setError('');
    try {
      await apiRequest('/api/admin/reset-demo', { method: 'POST' });
      setConfirmReset(false);
      setMessage('داده‌های آزمایشی پاکسازی شد و شمارنده لیبل‌زن دقیقاً روی عدد ۱۵۰۰ تنظیم گردید.');
      await loadUsers();
      if (onRefreshBootstrap) await onRefreshBootstrap();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-extrabold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-extrabold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Create New Cashier / User Form */}
        <form
          onSubmit={handleCreateUser}
          className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-600" />
              تعریف حساب کاربری جدید برای صندوقداران
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              برای هر صندوقدار شیفت صبح یا عصر یک حساب مستقل تعریف کنید تا نام او روی فاکتورها و گزارشات ثبت شود.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">نام و نام خانوادگی کاربر</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="مثلاً بهروز احمدی"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs font-bold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نام کاربری (انگلیسی)</label>
              <input
                type="text"
                dir="ltr"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="cashier3"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs font-bold text-left"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رمز عبور</label>
              <input
                type="password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="حداقل ۴ کاراکتر"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs font-bold text-left"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">سطح دسترسی</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold"
              >
                <option value="cashier">صندوقدار (طبقه پایین)</option>
                <option value="admin">مدیر مالی / ادمین (طبقه بالا)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">محل استقرار / شیفت</label>
              <input
                type="text"
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                placeholder="صندوق ۱ - شیفت صبح"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            ایجاد حساب کاربری
          </button>
        </form>

        {/* Users List Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              فهرست کاربران و صندوقداران فعال در نمایندگی باتری کاوه
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">نام کامل / ایستگاه</th>
                  <th className="px-4 py-3">نام کاربری</th>
                  <th className="px-4 py-3">نقش</th>
                  <th className="px-4 py-3">کل فاکتور / آمپر</th>
                  <th className="px-4 py-3">وضعیت</th>
                  <th className="px-4 py-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-black text-slate-900">{u.full_name}</div>
                      <div className="text-[11px] text-slate-500">{u.station_name}</div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-700" dir="ltr">
                      {u.username}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-50 text-blue-800'
                        }`}
                      >
                        {u.role === 'admin' ? 'مدیر مالی' : 'صندوقدار'}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      <div className="font-bold text-slate-800">
                        {formatNumber(u.total_invoices)} فاکتور ({formatNumber(u.total_sold_amps)}Ah)
                      </div>
                      <div className="text-[11px] text-emerald-700 font-semibold">
                        {formatToman(u.total_net_sales)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          u.is_active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.is_active ? 'فعال' : 'غیرفعال'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordModalUser(u);
                            setNewPassValue('');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>رمز</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleUserActive(u)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
                        >
                          {u.is_active ? 'غیرفعال' : 'فعال‌سازی'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Store & Printer / Label 1500+ Settings */}
      <form
        onSubmit={handleSaveStoreSettings}
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-600" />
              تنظیمات پرینتر لیبل‌زن (سریال ۱۵۰۰+) و مشخصات چاپی فیش ۸ سانتی
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              تنظیم عنوان نمایندگی صبا باتری (باتری کاوه)، ابعاد کاغذ لیبل‌زن و شماره سریال شروع لیبل
            </p>
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-black flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            ذخیره تنظیمات چاپ و فروشگاه
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">عنوان فروشگاه روی فیش و لیبل</label>
            <input
              type="text"
              value={storeCfg.store_name}
              onChange={(e) => setStoreCfg({ ...storeCfg, store_name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">شماره تماس روی فیش ۸ سانتی</label>
            <input
              type="text"
              value={storeCfg.store_phone}
              onChange={(e) => setStoreCfg({ ...storeCfg, store_phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-800 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              شماره نوبت بعدی لیبل (حداقل ۱۵۰۰)
            </label>
            <input
              type="text"
              dir="ltr"
              value={storeCfg.next_label_number}
              onChange={(e) => setStoreCfg({ ...storeCfg, next_label_number: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border-2 border-amber-300 bg-amber-50 font-black text-sm text-center"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">نشانی فروشگاه روی فیش</label>
            <input
              type="text"
              value={storeCfg.store_address}
              onChange={(e) => setStoreCfg({ ...storeCfg, store_address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">عرض کاغذ لیبل‌زن (میلی‌متر)</label>
            <input
              type="text"
              dir="ltr"
              value={storeCfg.label_width_mm}
              onChange={(e) => setStoreCfg({ ...storeCfg, label_width_mm: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-center"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ارتفاع کاغذ لیبل‌زن (میلی‌متر)</label>
            <input
              type="text"
              dir="ltr"
              value={storeCfg.label_height_mm}
              onChange={(e) => setStoreCfg({ ...storeCfg, label_height_mm: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-center"
            />
          </div>
        </div>
      </form>

      {/* Production Reset Box */}
      <div className="bg-amber-50/70 rounded-2xl border border-amber-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4 text-amber-700" />
            آماده‌سازی روز اول بهره‌برداری در فروشگاه باتری کاوه
          </h4>
          <p className="text-xs text-amber-900/80 mt-1">
            با زدن این دکمه، فاکتورهای نمونه/آزمایشی حذف شده و شمارنده پرینتر لیبل‌زن دقیقاً روی عدد <strong>۱۵۰۰</strong> صفر می‌شود (کاربران و قیمت‌ها حفظ می‌شوند).
          </p>
        </div>

        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="px-4 py-2 rounded-xl border border-amber-400 bg-white hover:bg-amber-100 text-amber-950 text-xs font-extrabold shrink-0 cursor-pointer"
          >
            ریست فاکتورهای آزمایشی به لیبل #1500
          </button>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetDemo}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black cursor-pointer"
            >
              بله، پاکسازی و شروع از ۱۵۰۰
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold cursor-pointer"
            >
              انصراف
            </button>
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleUpdatePassword}
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4"
          >
            <h4 className="text-sm font-black text-slate-900">
              تغییر رمز عبور «{passwordModalUser.full_name}»
            </h4>
            <input
              type="password"
              dir="ltr"
              value={newPassValue}
              onChange={(e) => setNewPassValue(e.target.value)}
              placeholder="رمز عبور جدید..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-left"
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPasswordModalUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 text-amber-400 text-xs font-black cursor-pointer"
              >
                ثبت رمز جدید
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
