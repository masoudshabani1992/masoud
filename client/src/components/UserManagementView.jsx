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
  Check
} from 'lucide-react';

export default function UserManagementView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New User Form State
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'sales',
    department: 'واحد بازرگانی',
    phone: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Edit / Password Reset Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editPassword, setEditPassword] = useState('');

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
      setSuccessMsg(`حساب کاربری «${newUser.full_name}» با موفقیت تعریف شد.`);
      setNewUser({
        username: '',
        password: '',
        full_name: '',
        role: 'sales',
        department: 'واحد بازرگانی',
        phone: ''
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
        password: editPassword
      });
      setEditingUser(null);
      setEditPassword('');
      fetchUsers();
    } catch (err) {
      alert('خطا در به‌روزرسانی: ' + err.message);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (confirm(`آیا از حذف حساب کاربری «${name}» اطمینان دارید؟`)) {
      try {
        await api.deleteUser(id);
        fetchUsers();
      } catch (err) {
        alert('خطا در حذف کاربر: ' + err.message);
      }
    }
  };

  const filteredUsers = users.filter((u) => {
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
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              مدیریت پرسنل، حساب‌های کاربری و سطوح دسترسی (RBAC)
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              تعریف نام کاربری، کلمه عبور و تفکیک وظایف کارمندان در ۹ مرحله تولید کارتن و جعبه‌سازی
            </p>
          </div>
        </div>

        <div className="bg-slate-800/90 px-5 py-3 rounded-xl border border-slate-700 text-center">
          <div className="text-2xl font-black text-amber-400">{users.length}</div>
          <div className="text-xs text-slate-300 font-bold">کاربر فعال در سیستم</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Right Form: Add New User */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-black text-slate-800">تعریف پرسنل / کارمند جدید</h3>
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
                <label className="text-xs font-bold text-slate-700">نام کاربری (Username):</label>
                <input
                  type="text"
                  placeholder="sales2"
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

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">نقش و سطح دسترسی سازمانی:</label>
              <select
                value={newUser.role}
                onChange={(e) => {
                  const rId = e.target.value;
                  const matched = ROLES.find((r) => r.id === rId);
                  setNewUser({
                    ...newUser,
                    role: rId,
                    department: matched ? matched.name : 'سایر'
                  });
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:bg-white focus:border-indigo-500"
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.desc})
                  </option>
                ))}
              </select>
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

            <button
              type="submit"
              disabled={formLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <UserPlus className="w-4 h-4" />
              <span>{formLoading ? 'در حال ایجاد کاربر...' : 'ثبت و فعال‌سازی حساب کاربری'}</span>
            </button>
          </form>
        </div>

        {/* Left Table: Users List */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-800">لیست پرسنل و دسترسی‌های ثبت‌شده</h3>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="جستجوی پرسنل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9 pl-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                    <th className="p-3 rounded-r-xl">نام کارمند</th>
                    <th className="p-3">نام کاربری</th>
                    <th className="p-3">نقش و واحد</th>
                    <th className="p-3">تلفن</th>
                    <th className="p-3 text-center rounded-l-xl">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const matchedRole = ROLES.find((r) => r.id === u.role);
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 font-black text-slate-900 text-sm">
                          {u.full_name}
                        </td>
                        <td className="p-3 font-mono font-bold text-indigo-700">
                          {u.username}
                        </td>
                        <td className="p-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-lg text-white font-bold text-[11px] ${matchedRole?.color || 'bg-slate-600'}`}>
                            {matchedRole?.name || u.role}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-600">
                          {u.phone || '---'}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingUser(u);
                                setEditPassword('');
                              }}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="ویرایش دسترسی و کلمه عبور"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id, u.full_name)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="حذف حساب"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <span>ماتریس دسترسی و وظایف پرسنل در ۹ مرحله خط تولید</span>
          </h3>
          <span className="text-xs font-bold text-slate-500">تفکیک خودکار کارتابل‌ها</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-2 text-xs">
          {ROLES.map((r) => (
            <div key={r.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${r.color}`}></span>
                <strong className="text-sm font-black text-slate-800">{r.name}</strong>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                {r.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-black text-base text-slate-800 border-b pb-3 flex items-center justify-between">
              <span>ویرایش حساب کاربری: {editingUser.full_name}</span>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </h3>

            <form onSubmit={handleUpdateUser} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">نام کامل:</label>
                <input
                  type="text"
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  className="w-full border rounded-xl p-2.5 font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">نقش سازمانی:</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full border rounded-xl p-2.5 font-bold"
                >
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">تغییر کلمه عبور جدید (در صورت نیاز به ریست رمز):</label>
                <input
                  type="password"
                  placeholder="رمز عبور جدید..."
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full border rounded-xl p-2.5 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow"
                >
                  ذخیره تغییرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
