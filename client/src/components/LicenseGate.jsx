import React, { useState } from 'react';
import { ShieldAlert, Key, Copy, Check, Lock, Cpu, Building2, User, RefreshCw, AlertCircle, FileText, CheckCircle2, Sparkles } from 'lucide-react';
import { api } from '../api/client';

const MASTER_PERMANENT_KEY = 'LIC1-eyJ2IjoxLCJoaWQiOiJBTlkiLCJjb21wYW55Ijoi2LXZhtin24zYuSDahtin2b4g2Ygg2KjYs9iq2YfigIzYqNmG2K_bjCDYotix2YXYp9mGINin2YXbjNix2KfZhiIsImlzc3VlZF90byI6ItmF2K_bjNix24zYqiDaqdin2LHYrtin2YbZhyIsImRldmVsb3BlciI6ItmF2LPYudmI2K8g2LTYudio2KfZhtuMIiwiY3JlYXRlZF9hdCI6IjIwMjYtMDktMjYiLCJleHBpcnkiOiJQRVJNQU5FTlQiLCJtYXhfdXNlcnMiOjEwMCwidHlwZSI6IkVOVEVSUFJJU0VfVU5MSU1JVEVEIiwibW9kdWxlcyI6WyJhbGwiXX0.OnqJULa1P_Mw7qmzTJL9MhyLzSz4EvpWoAwU5oJLkBqOXCoI2ioJvckCCQW2TYvkivO6bf3KnVMO36paW8ZGIUUqNP9AXEBxZR_9r05yCpUEVzTezZp1e_fEGAu826ny7vul30yd3Fd1WCVsQYRMMazOkRi_HbIuABI6LcBst0PYBQgWZeuboKMclaJf46Dpz3HObjtLI5WmKwQhmNw-KsB5DmYjTrrA1u1VeSH-S6h43Qs2sspETDcbhp3WazM8pdK8qGYUQyeR2fk69olNAqB2qSpFX-1Vh4JTmM10EI2TsEbkMGSzD6aNBdiLOJH1uqfIAdXMch3RFV3JUv0Sng';

export default function LicenseGate({ hardwareId, errorReason, onActivated }) {
  const [licenseKeyInput, setLicenseKeyInput] = useState(MASTER_PERMANENT_KEY);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(errorReason || '');
  const [successMsg, setSuccessMsg] = useState('');

  const handleCopyHid = () => {
    if (hardwareId) {
      navigator.clipboard.writeText(hardwareId);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          setLicenseKeyInput(text.trim());
        }
      };
      reader.readAsText(file);
    }
  };

  const executeActivation = async (keyToUse) => {
    const key = (keyToUse || licenseKeyInput || MASTER_PERMANENT_KEY).trim();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.activateLicense(key);
      if (res.success) {
        setSuccessMsg('لایسنس با موفقیت فعال و تایید شد. در حال بازگشایی سامانه...');
        setTimeout(() => {
          if (onActivated) onActivated(res.license);
        }, 800);
      } else {
        setErrorMsg(res.error || 'فعال‌سازی با شکست مواجه شد.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'خطا در برقراری ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (e) => {
    e.preventDefault();
    await executeActivation(licenseKeyInput);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none" dir="rtl">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10">
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-amber-500/20 border border-red-500/30 flex items-center justify-center text-red-400 mb-3 shadow-lg shadow-red-500/10">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            سامانه قفل است - نیازمند لایسنس معتبر
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            صنایع چاپ و بسته‌بندی آرمان امیران
          </p>
        </div>

        {/* Error reason banner */}
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-300 text-xs sm:text-sm leading-relaxed">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success message banner */}
        {successMsg && (
          <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-300 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Machine Hardware ID Box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              کد شناسایی سخت‌افزار سرور (Hardware ID)
            </span>
            <span className="text-[10px] text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-full">
              یکتا و غیرقابل تغییر
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-900/90 border border-slate-700/60 rounded-xl px-3 py-2.5 text-center font-mono text-base sm:text-lg font-black text-amber-300 tracking-wider select-all overflow-x-auto">
              {hardwareId || 'در حال دریافت...'}
            </div>
            <button
              type="button"
              onClick={handleCopyHid}
              className={`px-3.5 py-2.5 rounded-xl border font-medium text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 active:scale-95'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'کپی شد' : 'کپی کد'}</span>
            </button>
          </div>
        </div>

        {/* Developer Contact Card */}
        <div className="bg-blue-950/30 border border-blue-800/40 rounded-2xl p-4 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-black text-blue-300 text-sm">
              م‌ش
            </div>
            <div>
              <h4 className="text-xs font-bold text-blue-200">
                برنامه‌نویس و پشتیبانی نرم‌افزار
              </h4>
              <p className="text-[11px] text-blue-300/70 mt-0.5">
                مهندس مسعود شعبانی
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2.5 py-1 rounded-full font-medium">
            نسخه سازمانی آرمان امیران
          </span>
        </div>

        {/* License Key Form */}
        <form onSubmit={handleActivate} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                کلید فعال‌سازی لایسنس (License Key)
              </label>

              <label className="text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>بارگذاری فایل .lic</span>
                <input
                  type="file"
                  accept=".lic,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={3}
              value={licenseKeyInput}
              onChange={(e) => setLicenseKeyInput(e.target.value)}
              placeholder="کلید لایسنس رمزنگاری‌شده را در اینجا Paste نمایید (فرمت: LIC1-...)"
              dir="ltr"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 transition active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>در حال اعتبارسنجی و امضای دیجیتال...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 text-slate-950" />
                  <span>فعال‌سازی و بازگشایی سامانه</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => executeActivation(MASTER_PERMANENT_KEY)}
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs py-2 px-3 rounded-xl border border-amber-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>بازگشایی فوری با لایسنس دائمی و مادام‌العمر سازمانی</span>
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[10px] text-slate-500 flex items-center justify-between">
          <span>قفل سخت‌افزاری آفلاین مبتنی بر الگوریتم RSA-2048</span>
          <span>برنامه نویس: مسعود شعبانی</span>
        </div>
      </div>
    </div>
  );
}
