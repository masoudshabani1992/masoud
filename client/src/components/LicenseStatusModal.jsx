import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Key, Copy, Check, Cpu, Building2, User, Clock, Calendar, RefreshCw, X, AlertCircle, CheckCircle2, Award } from 'lucide-react';
import { api } from '../api/client';

export default function LicenseStatusModal({ isOpen, onClose, licenseInfo, hardwareId, onLicenseUpdated }) {
  const [copied, setCopied] = useState(false);
  const [showRenewForm, setShowRenewForm] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  if (!isOpen) return null;

  const handleCopyHid = () => {
    if (hardwareId) {
      navigator.clipboard.writeText(hardwareId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleUpdateLicense = async (e) => {
    e.preventDefault();
    if (!newKey.trim()) {
      setMsg({ type: 'error', text: 'لطفاً کلید جدید لایسنس را وارد کنید.' });
      return;
    }

    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await api.activateLicense(newKey.trim());
      if (res.success) {
        setMsg({ type: 'success', text: 'لایسنس با موفقیت ارتقا و ذخیره گردید.' });
        setNewKey('');
        setTimeout(() => {
          if (onLicenseUpdated) onLicenseUpdated(res.license);
          setShowRenewForm(false);
        }, 1500);
      } else {
        setMsg({ type: 'error', text: res.error || 'خطا در ثبت لایسنس جدید.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'خطا در برقراری ارتباط با سرور.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">اطلاعات مجوز و لایسنس نرم‌افزار</h3>
              <p className="text-xs text-slate-400">قفل سخت‌افزاری و اصالت برنامه</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Status Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/30 to-teal-950/30 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-emerald-300">وضعیت: فعال و دارای مجوز رسمی</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <p className="text-xs text-emerald-400/70 mt-0.5">
                  {licenseInfo?.isPermanent ? 'اعتبار دائمی و نامحدود (Permanent)' : `اعتبار تا: ${licenseInfo?.expiry} (${licenseInfo?.daysRemaining} روز باقی‌مانده)`}
                </p>
              </div>
            </div>
          </div>

          {/* Machine Hardware ID */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                کد سخت‌افزاری یکتای سرور (Hardware ID)
              </span>
              <button
                type="button"
                onClick={handleCopyHid}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'کپی شد' : 'کپی کد'}</span>
              </button>
            </div>
            <div className="font-mono text-sm font-bold text-amber-300 text-center bg-slate-900 border border-slate-800 py-2 rounded-xl">
              {hardwareId}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl">
              <span className="text-slate-500 block mb-1">مالک و شرکت:</span>
              <span className="font-bold text-slate-200">{licenseInfo?.company || 'صنایع چاپ و بسته‌بندی آرمان امیران'}</span>
            </div>
            <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl">
              <span className="text-slate-500 block mb-1">تحویل‌گیرنده:</span>
              <span className="font-bold text-slate-200">{licenseInfo?.issuedTo || 'مدیریت کارخانه'}</span>
            </div>
            <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl">
              <span className="text-slate-500 block mb-1">نوع لایسنس:</span>
              <span className="font-bold text-indigo-300">نسخه نامحدود سازمانی (Enterprise)</span>
            </div>
            <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl">
              <span className="text-slate-500 block mb-1">الگوریتم رمزنگاری:</span>
              <span className="font-mono font-bold text-slate-200">RSA-2048 / SHA-256</span>
            </div>
          </div>

          {/* Developer Card */}
          <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400">برنامه‌نویس و پشتیبان فنی:</span>
              <span className="font-bold text-blue-200">مهندس مسعود شعبانی</span>
            </div>
            <span className="text-[10px] text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-md">
              پشتیبانی مستقیم
            </span>
          </div>

          {/* Messages */}
          {msg.text && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'
            }`}>
              {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Renew / Update Section */}
          {!showRenewForm ? (
            <button
              type="button"
              onClick={() => setShowRenewForm(true)}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>تمدید یا وارد کردن کلید لایسنس جدید</span>
            </button>
          ) : (
            <form onSubmit={handleUpdateLicense} className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">کلید لایسنس جدید:</label>
                <button
                  type="button"
                  onClick={() => setShowRenewForm(false)}
                  className="text-[11px] text-slate-500 hover:text-slate-400"
                >
                  انصراف
                </button>
              </div>
              <textarea
                rows={2}
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="LIC1-..."
                dir="ltr"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-amber-500 transition resize-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                <span>ثبت و اعتبارسنجی لایسنس</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800 text-center text-[10px] text-slate-500">
          سامانه دارای قفل ضدکپی سخت‌افزاری و محافظت‌شده با گواهی دیجیتال
        </div>
      </div>
    </div>
  );
}
