import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  Copy,
  Check,
  Cpu,
  Building2,
  User,
  Clock,
  Calendar,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
  Award,
  Sparkles,
  Download,
  PlusCircle,
  FileCode
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function LicenseStatusModal({ isOpen, onClose, licenseInfo, hardwareId, onLicenseUpdated }) {
  const { role } = useAuth();
  const isCeo = role === 'ceo';

  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'renew' | 'generator'
  const [copied, setCopied] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Generator State
  const [genHid, setGenHid] = useState('');
  const [genCompany, setGenCompany] = useState('صنایع چاپ و بسته‌بندی آرمان امیران');
  const [genIssuedTo, setGenIssuedTo] = useState('مدیریت کارخانه');
  const [genExpiryType, setGenExpiryType] = useState('PERMANENT'); // 'PERMANENT' | '1Y' | '6M' | '30D' | 'CUSTOM'
  const [genCustomDate, setGenCustomDate] = useState('');
  const [generatedLicense, setGeneratedLicense] = useState(null);
  const [genCopied, setGenCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyHid = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
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
          setActiveTab('info');
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

  const handleGenerateLicense = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    setGeneratedLicense(null);

    let expiryValue = 'PERMANENT';
    const now = new Date();
    if (genExpiryType === '1Y') {
      const nextY = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      expiryValue = nextY.toISOString().split('T')[0];
    } else if (genExpiryType === '6M') {
      const next6 = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
      expiryValue = next6.toISOString().split('T')[0];
    } else if (genExpiryType === '30D') {
      const next30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      expiryValue = next30.toISOString().split('T')[0];
    } else if (genExpiryType === 'CUSTOM') {
      expiryValue = genCustomDate.trim() || 'PERMANENT';
    }

    try {
      const res = await api.generateLicense({
        hardwareId: genHid.trim() || 'ANY',
        companyName: genCompany.trim() || 'صنایع چاپ و بسته‌بندی آرمان امیران',
        issuedTo: genIssuedTo.trim() || 'مدیریت کارخانه',
        expiry: expiryValue
      });

      if (res.success) {
        setGeneratedLicense(res);
        setMsg({ type: 'success', text: 'لایسنس امضاشده دیجیتال با موفقیت تولید شد.' });
      } else {
        setMsg({ type: 'error', text: res.error || 'خطا در تولید لایسنس.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'خطا در برقراری ارتباط با سرور.' });
    } finally {
      setLoading(false);
    }
  };

  const downloadLicenseFile = () => {
    if (!generatedLicense?.licenseKey) return;
    const element = document.createElement('a');
    const file = new Blob([generatedLicense.licenseKey], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'license.lic';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">مدیریت لایسنس و قفل سخت‌افزاری</h3>
              <p className="text-xs text-slate-400">سامانه اتوماسیون صنایع چاپ و بسته‌بندی آرمان امیران</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 pt-3 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2">
          <button
            onClick={() => { setActiveTab('info'); setMsg({ type: '', text: '' }); }}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>اطلاعات لایسنس فعال</span>
          </button>

          <button
            onClick={() => { setActiveTab('renew'); setMsg({ type: '', text: '' }); }}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'renew'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>تمدید / ثبت کلید جدید</span>
          </button>

          {isCeo && (
            <button
              onClick={() => { setActiveTab('generator'); setMsg({ type: '', text: '' }); }}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'generator'
                  ? 'border-indigo-400 text-indigo-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>موتور صدور لایسنس (مسعود شعبانی)</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Notifications */}
          {msg.text && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'
            }`}>
              {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* TAB 1: INFO */}
          {activeTab === 'info' && (
            <>
              {/* Status Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-emerald-300">وضعیت لایسنس: فعال و دارای مجوز رسمی</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <p className="text-xs text-emerald-400/80 mt-0.5 font-medium">
                      {licenseInfo?.isPermanent ? 'نوع اعتبار: دائمی و مادام‌العمر (Permanent Unlimited)' : `مدت اعتبار: تا تاریخ ${licenseInfo?.expiry} (${licenseInfo?.daysRemaining} روز باقی‌مانده)`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Machine Hardware ID */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-amber-400" />
                    کد شناسایی سخت‌افزار سرور (Hardware ID)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyHid(hardwareId)}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'کپی شد' : 'کپی کد سخت‌افزار'}</span>
                  </button>
                </div>
                <div className="font-mono text-base font-black text-amber-300 text-center bg-slate-900 border border-slate-800 py-2.5 rounded-xl tracking-wider select-all">
                  {hardwareId}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl">
                  <span className="text-slate-500 block mb-1">مالک و کارخانه:</span>
                  <span className="font-bold text-slate-200">{licenseInfo?.company || 'صنایع چاپ و بسته‌بندی آرمان امیران'}</span>
                </div>
                <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl">
                  <span className="text-slate-500 block mb-1">تحویل‌گیرنده:</span>
                  <span className="font-bold text-slate-200">{licenseInfo?.issuedTo || 'مدیریت کارخانه'}</span>
                </div>
                <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl">
                  <span className="text-slate-500 block mb-1">نوع بسته:</span>
                  <span className="font-bold text-indigo-300">نسخه کارخانه‌ای نامحدود (Enterprise)</span>
                </div>
                <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl">
                  <span className="text-slate-500 block mb-1">الگوریتم رمزنگاری:</span>
                  <span className="font-mono font-bold text-slate-200">RSA-2048 / SHA-256</span>
                </div>
              </div>

              {/* Developer Info Card */}
              <div className="p-3.5 bg-blue-950/20 border border-blue-900/30 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                    م‌ش
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">برنامه‌نویس و پشتیبان فنی نرم‌افزار:</span>
                    <span className="font-bold text-blue-200 text-xs">مهندس مسعود شعبانی</span>
                  </div>
                </div>
                <span className="text-[10px] text-blue-300 bg-blue-500/10 px-2.5 py-1 rounded-full font-medium">
                  پشتیبانی مستقیم
                </span>
              </div>
            </>
          )}

          {/* TAB 2: RENEW */}
          {activeTab === 'renew' && (
            <form onSubmit={handleUpdateLicense} className="space-y-4">
              <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-xs text-slate-400 leading-relaxed">
                در صورت دریافت کلید جدید یا تمدید لایسنس، رشته کلید را در کادر زیر وارد نموده و دکمه ثبت را بزنید.
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  کلید لایسنس جدید (فرمت: LIC1-...):
                </label>
                <textarea
                  rows={4}
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="کلید لایسنس رمزنگاری‌شده را در اینجا Paste نمایید..."
                  dir="ltr"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-amber-500 transition resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                <span>اعتبارسنجی و ثبت لایسنس</span>
              </button>
            </form>
          )}

          {/* TAB 3: GENERATOR (FOR MASOUD SHABANI) */}
          {activeTab === 'generator' && isCeo && (
            <form onSubmit={handleGenerateLicense} className="space-y-4">
              <div className="p-3.5 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl text-xs text-indigo-300 leading-relaxed">
                ✨ <strong>موتور صدور لایسنس رمزنگاری‌شده RSA-2048:</strong> در این بخش می‌توانید برای هر سخت‌افزار، مشتری یا کارخانه جدید لایسنس معتبر صادر نمایید.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    کد سخت‌افزار مشتری (Hardware ID):
                  </label>
                  <input
                    type="text"
                    value={genHid}
                    onChange={(e) => setGenHid(e.target.value)}
                    placeholder="ARM-XXXX-XXXX-... (یا خالی برای ANY)"
                    dir="ltr"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">در صورت خالی گذاشتن، لایسنس عمومی (ANY) صادر می‌شود.</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    نام کارخانه / شرکت:
                  </label>
                  <input
                    type="text"
                    value={genCompany}
                    onChange={(e) => setGenCompany(e.target.value)}
                    placeholder="صنایع چاپ و بسته‌بندی آرمان امیران"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    تحویل‌گیرنده / مدیریت:
                  </label>
                  <input
                    type="text"
                    value={genIssuedTo}
                    onChange={(e) => setGenIssuedTo(e.target.value)}
                    placeholder="مدیریت کارخانه"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    مدت اعتبار:
                  </label>
                  <select
                    value={genExpiryType}
                    onChange={(e) => setGenExpiryType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="PERMANENT">دائمی و نامحدود (Permanent)</option>
                    <option value="1Y">۱ ساله (از امروز)</option>
                    <option value="6M">۶ ماهه</option>
                    <option value="30D">آزمایشی ۳۰ روزه</option>
                    <option value="CUSTOM">تاریخ انقضای دستی (YYYY-MM-DD)</option>
                  </select>
                </div>
              </div>

              {genExpiryType === 'CUSTOM' && (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    تاریخ انقضا (میلادی):
                  </label>
                  <input
                    type="text"
                    value={genCustomDate}
                    onChange={(e) => setGenCustomDate(e.target.value)}
                    placeholder="2027-12-29"
                    dir="ltr"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-[0.99]"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>صدور لایسنس با امضای دیجیتال مسعود شعبانی</span>
              </button>

              {/* Generated License Output */}
              {generatedLicense && (
                <div className="p-4 bg-slate-950 border border-emerald-500/30 rounded-2xl space-y-3 mt-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      لایسنس با موفقیت تولید و امضا شد:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={downloadLicenseFile}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1"
                        title="دانلود فایل license.lic"
                      >
                        <Download className="w-3.5 h-3.5 text-indigo-400" />
                        <span>دانلود .lic</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedLicense.licenseKey);
                          setGenCopied(true);
                          setTimeout(() => setGenCopied(false), 2500);
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        {genCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{genCopied ? 'کپی شد' : 'کپی کلید'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-emerald-300 bg-slate-900 border border-slate-800 p-3 rounded-xl break-all select-all max-h-28 overflow-y-auto leading-relaxed">
                    {generatedLicense.licenseKey}
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/60 pt-2">
                    <span>قفل سخت‌افزار: <strong className="text-slate-200 font-mono">{generatedLicense.payload.hid}</strong></span>
                    <span>اعتبار: <strong className="text-slate-200">{generatedLicense.payload.expiry}</strong></span>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800 text-center text-[10px] text-slate-500 flex items-center justify-between">
          <span>قفل سخت‌افزاری و ضدکپی نامتقارن RSA-2048</span>
          <span>برنامه‌نویس و توسعه‌دهنده: مسعود شعبانی</span>
        </div>
      </div>
    </div>
  );
}
