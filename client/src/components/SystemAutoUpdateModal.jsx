import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  DownloadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  ShieldCheck,
  FolderSync,
  Archive,
  History,
  ArrowRight,
  Server,
  Zap,
  HardDrive
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { playBiometricChime } from '../utils/biometrics';

export default function SystemAutoUpdateModal({ isOpen, onClose }) {
  const { currentUser, role } = useAuth();
  const isAdmin = currentUser?.role === 'admin' || role === 'admin';

  const [updateInfo, setUpdateInfo] = useState(null);
  const [checking, setChecking] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updateStep, setUpdateStep] = useState(0); // 0: idle, 1: backup, 2: download, 3: extract, 4: complete
  const [updateMsg, setUpdateMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [successResult, setSuccessResult] = useState(null);

  // Custom Deploy Path state
  const [customPath, setCustomPath] = useState('');
  const [savingPath, setSavingPath] = useState(false);
  const [pathMsg, setPathMsg] = useState(null);

  // Backups
  const [backups, setBackups] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    loadUpdateStatus();
    loadDeployConfig();
    loadBackups();
  }, [isOpen]);

  const loadUpdateStatus = async () => {
    setChecking(true);
    setErrorMsg(null);
    try {
      const res = await api.checkSystemUpdates();
      if (res) {
        setUpdateInfo(res);
      }
    } catch (err) {
      setErrorMsg('خطا در بررسی نسخه: ' + err.message);
    } finally {
      setChecking(false);
    }
  };

  const loadDeployConfig = async () => {
    try {
      const res = await api.getDeployConfig();
      if (res && res.config) {
        setCustomPath(res.config.defaultTargetPath || '');
      }
    } catch (e) {}
  };

  const loadBackups = async () => {
    try {
      const res = await api.getSystemBackups();
      if (res && res.backups) {
        setBackups(res.backups);
      }
    } catch (e) {}
  };

  const handleSaveCustomPath = async () => {
    setSavingPath(true);
    setPathMsg(null);
    try {
      const res = await api.saveDeployConfig({ targetPath: customPath, autoDeployEnabled: true });
      if (res && res.success) {
        setPathMsg('مسیر استقرار خودکار با موفقیت ذخیره گردید.');
      }
    } catch (err) {
      setPathMsg('خطا در ذخیره مسیر: ' + err.message);
    } finally {
      setSavingPath(false);
    }
  };

  const handleApplyOneClickUpdate = async () => {
    if (!window.confirm('آیا از اجرای به‌روزرسانی خودکار سیستم اطمینان دارید؟ تمامی داده‌ها و لایسنس‌های شما به صورت خودکار پشتیبان‌گیری و محافظت می‌شوند.')) {
      return;
    }

    setUpdating(true);
    setErrorMsg(null);
    setSuccessResult(null);
    setUpdateStep(1);
    setUpdateMsg('در حال پشتیبان‌گیری امن از پایگاه داده و لایسنس سرور...');

    try {
      // Step simulation for visual feedback
      setTimeout(() => {
        setUpdateStep(2);
        setUpdateMsg('در حال دریافت آخرین بسته نصبی از مخزن اختصاصی کارخانه...');
      }, 1200);

      setTimeout(() => {
        setUpdateStep(3);
        setUpdateMsg('در حال استخراج و به‌روزرسانی فایل‌های رابط کاربری و موتور محاسباتی...');
      }, 2500);

      const res = await api.applySystemAutoUpdate();

      setUpdateStep(4);
      setUpdateMsg('به‌روزرسانی با موفقیت اعمال شد!');
      setSuccessResult(res);
      playBiometricChime('success');

      // Auto reload after 2.5 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } catch (err) {
      setUpdating(false);
      setErrorMsg(err.message || 'خطا در اعمال به‌روزرسانی خودکار');
      playBiometricChime('error');
    }
  };

  if (!isOpen) return null;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in select-none" dir="rtl">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 text-center space-y-4 shadow-2xl border border-rose-200">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-800">شما مجاز به دیدن این پرونده نیستین</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            دسترسی به بخش به‌روزرسانی زنده و زیرساخت سرور انحصاراً در اختیار مدیر ارشد سیستم (Admin) است.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200 select-none" dir="rtl">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-violet-50 via-indigo-50 to-amber-50 border-b border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 flex items-center justify-center">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-800">مرکز به‌روزرسانی خودکار و استقرار (Auto-Updater)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  ۱-کلیکی و زنده
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                به‌روزرسانی سرور بدون نیاز به دانلود دستی، با حفظ ۱۰۰٪ داده‌ها و لایسنس
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

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold space-y-2 animate-in zoom-in-95">
              <div className="flex items-center gap-2 text-sm font-black text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{successResult.message}</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium">
                نسخه سیستم با موفقیت ارتقا یافت. صفحه تا چند لحظه دیگر به صورت خودکار تازه‌سازی خواهد شد...
              </p>
            </div>
          )}

          {/* Version Status Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-slate-800">
                    نسخه فعلی سرور: {updateInfo?.currentVersion || '2.8.7'} (بیلد {updateInfo?.currentBuild || 90})
                  </h4>
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    پایدار
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  آخرین نسخه موجود در گیت‌هاب: <strong className="text-indigo-700 font-mono">{updateInfo?.latestVersion || '2.8.7'}</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyOneClickUpdate}
              disabled={updating}
              className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 hover:from-indigo-700 hover:to-violet-800 text-white rounded-xl font-black text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-60"
            >
              {updating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <DownloadCloud className="w-4 h-4" />
              )}
              <span>{updating ? 'در حال اجرای به‌روزرسانی...' : 'به‌روزرسانی زنده سرور (۱-کلیک)'}</span>
            </button>
          </div>

          {/* Active Updating Progress Bar */}
          {updating && (
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  {updateMsg}
                </span>
                <span className="font-mono text-indigo-700">مرحله {updateStep} از ۴</span>
              </div>
              <div className="w-full bg-indigo-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${updateStep * 25}%` }}
                />
              </div>
            </div>
          )}

          {/* Changelog & Features */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              امکانات جدید اضافه شده در آخرین بیلدها:
            </h4>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
              {(updateInfo?.changelog || [
                '✨ سیستم احراز هویت بیومتریک با اثر انگشت (Touch ID) و تشخیص چهره (Face ID)',
                '🚀 سیستم به‌روزرسانی زنده و خودکار ۱-کلیکی بدون نیاز به دانلود و نصب دستی',
                '⚡ پکیج بهینه‌سازی شده برای استقرار روی سرورهای ویندوز شبکه داخلی',
                '📊 رفع کامل خطای ثبت استعلامات میدانی بازاریابی و انطباق با پایگاه داده'
              ]).map((c, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Auto-Deploy Path Setting */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-teal-600" />
              تنظیم مسیر پوشه محلی یا شبکه داخلی (Optional Custom Deploy Path)
            </h4>
            <p className="text-[11px] text-slate-500">
              چنانچه مایلید آپدیت‌ها در یک پوشه مشخص روی سرور ویندوز یا شبکه محلی شما هم کپی شوند، مسیر را وارد فرمایید:
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="مثال: D:\BoxFactoryServer یا \\192.168.1.10\ERP"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-teal-500 text-left"
                dir="ltr"
              />
              <button
                type="button"
                onClick={handleSaveCustomPath}
                disabled={savingPath}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black text-xs transition active:scale-95 shrink-0"
              >
                {savingPath ? 'در حال ذخیره...' : 'ذخیره مسیر'}
              </button>
            </div>

            {pathMsg && (
              <p className="text-[11px] font-bold text-teal-700">{pathMsg}</p>
            )}
          </div>

          {/* Safety Backups History */}
          {backups.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <History className="w-4 h-4 text-indigo-500" />
                تاریخچه بکاپ‌های خودکار سرور ({backups.length})
              </h4>
              <div className="max-h-32 overflow-y-auto space-y-1.5 p-1">
                {backups.slice(0, 5).map((b, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
                    <span className="font-mono text-[11px] font-bold text-slate-700">{b.name}</span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      محفوظ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
