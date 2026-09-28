import React, { useState, useEffect } from 'react';
import {
  Fingerprint,
  ScanFace,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Smartphone,
  Trash2,
  Plus,
  RefreshCw,
  Sparkles,
  Laptop,
  Tablet,
  Check,
  Users
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  detectDeviceBiometrics,
  playBiometricChime,
  saveStoredBiometricToken,
  saveLastBioUser
} from '../utils/biometrics';

export default function BiometricSettingsModal({ isOpen, onClose }) {
  const { currentUser, role } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('my_devices'); // 'my_devices' | 'admin_overview'
  const [adminSummary, setAdminSummary] = useState([]);

  const isCeoOrAdmin = ['admin', 'ceo'].includes(role) || currentUser?.role === 'admin' || currentUser?.role === 'ceo';

  useEffect(() => {
    if (!isOpen) return;
    const dev = detectDeviceBiometrics();
    setDeviceInfo(dev);
    loadDevices();
    if (isCeoOrAdmin) {
      loadAdminSummary();
    }
  }, [isOpen]);

  const loadDevices = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.getBiometricDevices();
      if (res && res.devices) {
        setDevices(res.devices);
      }
    } catch (err) {
      setErrorMessage(err.message || 'خطا در دریافت لیست دستگاه‌ها');
    } finally {
      setLoading(false);
    }
  };

  const loadAdminSummary = async () => {
    try {
      const res = await api.getBiometricAdminSummary();
      if (res && res.summary) {
        setAdminSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to load biometric admin summary', err);
    }
  };

  const handleRegisterCurrentDevice = async () => {
    setRegistering(true);
    setStatusMessage(null);
    setErrorMessage(null);
    playBiometricChime('scan');

    try {
      const dev = detectDeviceBiometrics();
      const res = await api.registerBiometricDevice({
        device_name: dev.deviceName || 'گوشی همراه پرسنل',
        device_type: dev.defaultType || 'mobile_fingerprint',
        device_info: navigator.userAgent
      });

      if (res && res.success) {
        playBiometricChime('success');
        setStatusMessage('سنسور بیومتریک این دستگاه با موفقیت فعال و متصل گردید.');
        if (res.bioToken) {
          saveStoredBiometricToken(res.bioToken);
        }
        if (currentUser) {
          saveLastBioUser(currentUser);
        }
        await loadDevices();
        if (isCeoOrAdmin) loadAdminSummary();
      } else {
        throw new Error(res.error || 'خطا در ثبت دستگاه');
      }
    } catch (err) {
      playBiometricChime('error');
      setErrorMessage(err.message || 'خطا در فعال‌سازی سنسور بیومتریک');
    } finally {
      setRegistering(false);
    }
  };

  const handleDeleteDevice = async (id, name) => {
    if (!window.confirm(`آیا از حذف دسترسی بیومتریک دستگاه «${name}» اطمینان دارید؟`)) {
      return;
    }

    try {
      await api.deleteBiometricDevice(id);
      setStatusMessage(`دستگاه «${name}» با موفقیت حذف شد.`);
      await loadDevices();
      if (isCeoOrAdmin) loadAdminSummary();
    } catch (err) {
      setErrorMessage(err.message || 'خطا در حذف دستگاه');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200 select-none" dir="rtl">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-50 via-emerald-50 to-slate-50 border-b border-teal-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/25 flex items-center justify-center">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-800">مدیریت ورود بیومتریک (اثر انگشت و چهره)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                  WebAuthn & Passkeys
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                تنظیمات احراز هویت بدون رمز عبور برای موبایل و تبلت پرسنل
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (if CEO/Admin) */}
        {isCeoOrAdmin && (
          <div className="px-6 pt-4 flex gap-2 border-b border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab('my_devices')}
              className={`pb-3 px-3 font-bold text-xs flex items-center gap-2 border-b-2 transition ${
                activeTab === 'my_devices'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>دستگاه‌های متصل به حساب من ({devices.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('admin_overview')}
              className={`pb-3 px-3 font-bold text-xs flex items-center gap-2 border-b-2 transition ${
                activeTab === 'admin_overview'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>وضعیت بیومتریک کل پرسنل کارخانه ({adminSummary.length})</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {statusMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{statusMessage}</span>
              </div>
              <button onClick={() => setStatusMessage(null)} className="text-emerald-700 hover:text-emerald-900">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button onClick={() => setErrorMessage(null)} className="text-rose-700 hover:text-rose-900">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeTab === 'my_devices' && (
            <div className="space-y-6">
              
              {/* Device Quick Connect Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-transparent border border-teal-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-600/20">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">
                      این دستگاه: {deviceInfo?.deviceName || 'دستگاه فعلی'}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {deviceInfo?.defaultLabel || 'سنسور اثر انگشت و چهره'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRegisterCurrentDevice}
                  disabled={registering}
                  className="w-full sm:w-auto px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 active:scale-95 transition"
                >
                  {registering ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>{registering ? 'در حال ثبت سنسور...' : 'ثبت اثر انگشت / چهره این دستگاه'}</span>
                </button>
              </div>

              {/* Registered Devices List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    دستگاه‌های بیومتریک مجاز ({devices.length})
                  </h4>
                  <button
                    onClick={loadDevices}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>به‌روزرسانی</span>
                  </button>
                </div>

                {loading ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    در حال دریافت اطلاعات سنسورها...
                  </div>
                ) : devices.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                    <Fingerprint className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-600">
                      هنوز هیچ دستگاه بیومتریکی برای حساب شما ثبت نشده است.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      با ثبت موبایل خود، می‌توانید بدون نیاز به تایپ کلمه عبور با اثر انگشت وارد شوید.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {devices.map((d) => (
                      <div
                        key={d.id}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-teal-300 shadow-sm flex items-center justify-between gap-3 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0">
                            {d.device_type === 'mobile_face_id' ? (
                              <ScanFace className="w-4.5 h-4.5" />
                            ) : d.device_type === 'touch_id' || d.device_type === 'windows_hello' ? (
                              <Laptop className="w-4.5 h-4.5" />
                            ) : (
                              <Fingerprint className="w-4.5 h-4.5" />
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-800 flex items-center gap-2">
                              <span>{d.device_name}</span>
                              <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                                فعال
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              دفعات ورود: {d.counter || 0} بار • آخرین استفاده: {d.last_used_at ? new Date(d.last_used_at).toLocaleDateString('fa-IR') : 'به تازگی'}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteDevice(d.id, d.device_name)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition"
                          title="حذف این دستگاه"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Admin Factory Overview */}
          {activeTab === 'admin_overview' && isCeoOrAdmin && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">پرسنل</th>
                      <th className="p-3">واحد سازمانی</th>
                      <th className="p-3">وضعیت بیومتریک</th>
                      <th className="p-3">تعداد دستگاه</th>
                      <th className="p-3">آخرین ورود</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminSummary.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-bold text-slate-800">
                          {emp.full_name}
                          <span className="text-[10px] text-slate-400 block font-mono font-normal">
                            @{emp.username}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{emp.department}</td>
                        <td className="p-3">
                          {emp.biometric_enabled ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" />
                              فعال (اثر انگشت/چهره)
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold">
                              غیرفعال
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-bold text-slate-700">
                          {emp.device_count || 0} دستگاه
                        </td>
                        <td className="p-3 text-[11px] text-slate-500">
                          {emp.last_biometric_login
                            ? new Date(emp.last_biometric_login).toLocaleDateString('fa-IR')
                            : '---'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
