import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { playNotificationSound } from '../utils/helpers';
import {
  Bell,
  MessageSquare,
  Smartphone,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
  Volume2,
  ShieldCheck,
  Info,
  Check,
  PhoneCall,
  ExternalLink,
  Sparkles,
  Layers,
  Settings,
  Bot
} from 'lucide-react';

export default function NotificationSettingsView() {
  const { role } = useAuth();
  const isCeo = role === 'ceo' || role === 'admin';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Bale Messenger States
  const [baleEnabled, setBaleEnabled] = useState(true);
  const [baleBotToken, setBaleBotToken] = useState('');
  const [baleChatId, setBaleChatId] = useState('');
  const [testBaleLoading, setTestBaleLoading] = useState(false);
  const [testBaleResult, setTestBaleResult] = useState(null);

  // Melipayamak SMS States
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [melipayamakUsername, setMelipayamakUsername] = useState('');
  const [melipayamakPassword, setMelipayamakPassword] = useState('');
  const [melipayamakFrom, setMelipayamakFrom] = useState('50004');

  // SMS Templates for 3 Key Milestones
  const [templatePrice, setTemplatePrice] = useState(
    'مشتری گرامی {نام مشتری}، پیش‌فاکتور سفارش "{نام کار}" (کد آرشیو: {کد}) با موفقیت تایید شد و جهت آماده‌سازی خط تیغ و طراحی ارجاع گردید.\nصنایع چاپ و بسته‌بندی آرمان امیران'
  );
  const [templateDesign, setTemplateDesign] = useState(
    'مشتری گرامی {نام مشتری}، طرح گرافیکی و خط تیغ سفارش "{نام کار}" (کد: {کد}) تایید نهایی شد و فرآیند ساخت ماکت و تامین متریال آغاز گردید.\nصنایع بسته‌بندی آرمان امیران'
  );
  const [templateProduction, setTemplateProduction] = useState(
    'مشتری گرامی {نام مشتری}، سفارش "{نام کار}" (کد آرشیو: {کد}) وارد خط چاپ و سالن تولید گردید. زمان بارگیری و تحویل اطلاع‌رسانی خواهد شد.\nصنایع بسته‌بندی آرمان امیران'
  );

  // Test SMS State
  const [testSmsPhone, setTestSmsPhone] = useState('');
  const [testSmsLoading, setTestSmsLoading] = useState(false);
  const [testSmsResult, setTestSmsResult] = useState(null);

  // Browser Sound State
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load Settings from Server
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.getNotificationSettings();
      const s = res.settings || {};

      setBaleEnabled(s.bale_enabled !== 'false');
      setBaleBotToken(s.bale_bot_token || '');
      setBaleChatId(s.bale_chat_id || '');

      setSmsEnabled(s.sms_enabled !== 'false');
      setMelipayamakUsername(s.melipayamak_username || '');
      setMelipayamakPassword(s.melipayamak_password || '');
      setMelipayamakFrom(s.melipayamak_from || '50004');

      if (s.sms_template_price) setTemplatePrice(s.sms_template_price);
      if (s.sms_template_design) setTemplateDesign(s.sms_template_design);
      if (s.sms_template_production) setTemplateProduction(s.sms_template_production);

      setSoundEnabled(s.browser_sound_enabled !== 'false');
    } catch (err) {
      console.error('Error loading notification settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save Settings
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await api.updateNotificationSettings({
        bale_enabled: String(baleEnabled),
        bale_bot_token: baleBotToken,
        bale_chat_id: baleChatId,
        sms_enabled: String(smsEnabled),
        melipayamak_username: melipayamakUsername,
        melipayamak_password: melipayamakPassword,
        melipayamak_from: melipayamakFrom,
        sms_template_price: templatePrice,
        sms_template_design: templateDesign,
        sms_template_production: templateProduction,
        browser_sound_enabled: String(soundEnabled)
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      alert('خطا در ذخیره تنظیمات: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Test Bale Bot Message
  const handleTestBale = async () => {
    if (!baleBotToken || !baleChatId) {
      alert('لطفاً ابتدا توکن بات و شناسه چت بله را وارد کنید.');
      return;
    }
    setTestBaleLoading(true);
    setTestBaleResult(null);
    try {
      const res = await api.testBaleNotification(baleBotToken, baleChatId);
      if (res.success) {
        setTestBaleResult({ success: true, message: 'پیام تست با موفقیت به پیام‌رسان بله ارسال شد.' });
      } else {
        setTestBaleResult({ success: false, message: res.error || 'ارسال ناموفق بود.' });
      }
    } catch (err) {
      setTestBaleResult({ success: false, message: err.message });
    } finally {
      setTestBaleLoading(false);
    }
  };

  // Test Melipayamak SMS
  const handleTestSms = async () => {
    if (!melipayamakUsername || !melipayamakPassword || !testSmsPhone) {
      alert('لطفاً نام کاربری، رمز عبور ملی‌پیامک و شماره موبایل تست را وارد کنید.');
      return;
    }
    setTestSmsLoading(true);
    setTestSmsResult(null);
    try {
      const res = await api.testCustomerSms({
        username: melipayamakUsername,
        password: melipayamakPassword,
        from: melipayamakFrom,
        to: testSmsPhone,
        text: 'تست اتصال سامانه پیامکی اتوماسیون کارخانه شرکت آرمان امیران - تایید مشتری فعال است.'
      });
      if (res.success) {
        setTestSmsResult({ success: true, message: 'پیامک تست با موفقیت به شماره ' + testSmsPhone + ' ارسال شد.' });
      } else {
        setTestSmsResult({ success: false, message: res.error || 'ارسال پیامک ناموفق بود.' });
      }
    } catch (err) {
      setTestSmsResult({ success: false, message: err.message });
    } finally {
      setTestSmsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-500">در حال دریافت تنظیمات اطلاع‌رسانی...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 select-none animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white p-6 sm:p-7 rounded-3xl shadow-xl flex items-center justify-between flex-wrap gap-4 border border-indigo-500/30">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-500 text-slate-950 flex items-center justify-center shadow-lg font-bold">
            <Bell className="w-7 h-7 text-slate-950 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black tracking-tight">
                تنظیمات اطلاع‌رسانی خودکار (پیام‌رسان بله و پیامک مشتریان)
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                تایید مشتری و پرسنل
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
              پیکربندی ارسال نوتیفیکیشن بلادرنگ به پرسنل در بله و ارسال پیامک ملی‌پیامک به کارفرما پس از تایید مالی، تایید طرح و ورود به خط تولید
            </p>
          </div>
        </div>

        {/* Quick Save Header Button */}
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}</span>
        </button>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-900 p-4 rounded-2xl flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-xs sm:text-sm font-black">
              تنظیمات اطلاع‌رسانی با موفقیت ذخیره و در هسته سرور اعمال گردید.
            </span>
          </div>
          <span className="text-xs text-emerald-700 font-bold font-mono">OK 200</span>
        </div>
      )}

      {/* ================= SECTION 1: اطلاع‌رسانی به مشتریان (ملی‌پیامک) ================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                ۱. اطلاع‌رسانی پیامکی به مشتریان (سامانه ملی‌پیامک)
              </h2>
              <p className="text-xs text-slate-500">
                ارسال خودکار پیامک وضعیت سفارش به شماره موبایل کارفرما در ۳ گام کلیدی
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              checked={smsEnabled}
              onChange={(e) => setSmsEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
            />
            <span className="text-xs font-black text-slate-700">ارسال پیامک فعال باشد</span>
          </label>
        </div>

        {/* Melipayamak Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">
              نام کاربری پنل ملی‌پیامک:
            </label>
            <input
              type="text"
              dir="ltr"
              value={melipayamakUsername}
              onChange={(e) => setMelipayamakUsername(e.target.value)}
              placeholder="مثال: amiranbox"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">
              کلمه عبور پنل ملی‌پیامک:
            </label>
            <input
              type="password"
              dir="ltr"
              value={melipayamakPassword}
              onChange={(e) => setMelipayamakPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">
              شماره خط ارسال‌کننده پیامک:
            </label>
            <input
              type="text"
              dir="ltr"
              value={melipayamakFrom}
              onChange={(e) => setMelipayamakFrom(e.target.value)}
              placeholder="مثال: 50004..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>

        {/* 3 Key Milestone Templates */}
        <div className="space-y-4 pt-2">
          <div className="text-xs font-black text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>متن پیامک‌های خودکار در ۳ نقطه عطف خط تولید:</span>
          </div>

          {/* Milestone 1: بعد از تایید مشتری و پیش‌فاکتور (مرحله ۳ و ۴) */}
          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-xs text-amber-950 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-[10px]">۱</span>
                <span>گام اول: بلافاصله پس از تایید پیش‌فاکتور و بیعانه توسط مشتری (مرحله ۳ به ۴)</span>
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md">مرحله ۳ و ۴</span>
            </div>
            <textarea
              rows={3}
              value={templatePrice}
              onChange={(e) => setTemplatePrice(e.target.value)}
              className="w-full p-3 rounded-xl border border-amber-300 text-xs text-slate-800 bg-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
            <p className="text-[10px] text-amber-700 font-medium">
              متغیرهای خودکار: {'{نام مشتری}'}، {'{نام کار}'}، {'{کد}'}
            </p>
          </div>

          {/* Milestone 2: بعد از تایید طرح و رنگ (مرحله ۶ به ۷) */}
          <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-xs text-teal-950 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-teal-200 text-teal-900 flex items-center justify-center font-bold text-[10px]">۲</span>
                <span>گام دوم: پس از تایید نهایی طرح و خط تیغ توسط مشتری (مرحله ۶ به ۷)</span>
              </span>
              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-md">مرحله ۶ و ۷</span>
            </div>
            <textarea
              rows={3}
              value={templateDesign}
              onChange={(e) => setTemplateDesign(e.target.value)}
              className="w-full p-3 rounded-xl border border-teal-300 text-xs text-slate-800 bg-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            />
            <p className="text-[10px] text-teal-700 font-medium">
              متغیرهای خودکار: {'{نام مشتری}'}، {'{نام کار}'}، {'{کد}'}
            </p>
          </div>

          {/* Milestone 3: ورود به خط تولید و سالن چاپ (مرحله ۱۰) */}
          <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-xs text-indigo-950 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-indigo-200 text-indigo-900 flex items-center justify-center font-bold text-[10px]">۳</span>
                <span>گام سوم: پس از ارجاع سفارش به خط چاپ و دایکات (مرحله ۱۰)</span>
              </span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-md">مرحله ۱۰</span>
            </div>
            <textarea
              rows={3}
              value={templateProduction}
              onChange={(e) => setTemplateProduction(e.target.value)}
              className="w-full p-3 rounded-xl border border-indigo-300 text-xs text-slate-800 bg-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            <p className="text-[10px] text-indigo-700 font-medium">
              متغیرهای خودکار: {'{نام مشتری}'}، {'{نام کار}'}، {'{کد}'}
            </p>
          </div>
        </div>

        {/* Direct Test SMS Bar */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <PhoneCall className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              dir="ltr"
              value={testSmsPhone}
              onChange={(e) => setTestSmsPhone(e.target.value)}
              placeholder="شماره موبایل جهت تست (مثال: 09121234567)"
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white w-full max-w-sm"
            />
          </div>

          <button
            type="button"
            onClick={handleTestSms}
            disabled={testSmsLoading}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
          >
            {testSmsLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>ارسال پیامک تست</span>
          </button>
        </div>

        {testSmsResult && (
          <div className={`p-3 rounded-xl text-xs font-bold border ${
            testSmsResult.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {testSmsResult.message}
          </div>
        )}

      </div>

      {/* ================= SECTION 2: اطلاع‌رسانی به پرسنل در بله (Bale Bot) ================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                ۲. اطلاع‌رسانی به پرسنل و گروه‌های کارخانه (پیام‌رسان بله)
              </h2>
              <p className="text-xs text-slate-500">
                ارسال بلادرنگ تغییر وضعیت سفارشات، ارجاع پرونده‌ها و هشدارها به بات بله
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              checked={baleEnabled}
              onChange={(e) => setBaleEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-xs font-black text-slate-700">بات بله فعال باشد</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">
              توکن بات بله (Bale Bot Token):
            </label>
            <input
              type="text"
              dir="ltr"
              value={baleBotToken}
              onChange={(e) => setBaleBotToken(e.target.value)}
              placeholder="مثال: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
            <span className="text-[10px] text-slate-400 block mt-1">
              دریافت شده از بازوی BotFather در بله
            </span>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">
              شناسه چت یا شناسه گروه پرسنل (Bale Chat ID):
            </label>
            <input
              type="text"
              dir="ltr"
              value={baleChatId}
              onChange={(e) => setBaleChatId(e.target.value)}
              placeholder="مثال: 987654321 یا -100123456789"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
            <span className="text-[10px] text-slate-400 block mt-1">
              شناسه عددی اکانت یا گروه کارخانه در بله
            </span>
          </div>
        </div>

        {/* Test Bale Message Button */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs text-slate-600 font-bold">
            جهت اطمینان از اتصال صحیح به پیام‌رسان بله، یک پیام تستی ارسال کنید:
          </span>

          <button
            type="button"
            onClick={handleTestBale}
            disabled={testBaleLoading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
          >
            {testBaleLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>ارسال پیام تست به بله</span>
          </button>
        </div>

        {testBaleResult && (
          <div className={`p-3 rounded-xl text-xs font-bold border ${
            testBaleResult.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {testBaleResult.message}
          </div>
        )}

      </div>

      {/* ================= SECTION 3: صدای آلارم و نوتیفیکیشن مرورگر ================= */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
            <Volume2 className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">پخش صدای آلارم چایم هنگام دریافت اعلان جدید</h3>
            <p className="text-xs text-slate-500">پخش افکت صوتی آرام هنگام ثبت استعلام یا ارجاع کار به کارتابل کاربر</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => playNotificationSound()}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-300"
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>تست پخش صدا</span>
          </button>

          <label className="flex items-center gap-2 cursor-pointer bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
            />
            <span className="text-xs font-black text-purple-900">صدای آلارم فعال باشد</span>
          </label>
        </div>
      </div>

      {/* Bottom Floating Save Bar */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-3xl border-2 border-indigo-300 shadow-2xl flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>تمامی اطلاعات اتصال و قالب‌های پیامک به صورت رمزنگاری‌شده در دیتابیس سرور ذخیره می‌شوند.</span>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'در حال ذخیره‌سازی...' : 'ذخیره نهایی تنظیمات اطلاع‌رسانی'}</span>
        </button>
      </div>

    </div>
  );
}
