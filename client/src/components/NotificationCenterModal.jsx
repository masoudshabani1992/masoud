import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatDateFa, playNotificationSound } from '../utils/helpers';
import {
  Bell,
  X,
  CheckCircle2,
  Check,
  Send,
  MessageSquare,
  Smartphone,
  Volume2,
  Settings,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Layers,
  ArrowRight,
  Info,
  Sparkles,
  PhoneCall
} from 'lucide-react';

export default function NotificationCenterModal({ onClose, onSelectProject, onSelectLead }) {
  const { role } = useAuth();
  const isCeo = role === 'ceo';

  const [activeTab, setActiveTab] = useState('list'); // 'list', 'settings'
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const [testBaleLoading, setTestBaleLoading] = useState(false);
  const [testBaleResult, setTestBaleResult] = useState(null);

  const [testSmsLoading, setTestSmsLoading] = useState(false);
  const [testSmsPhone, setTestSmsPhone] = useState('');
  const [testSmsResult, setTestSmsResult] = useState(null);

  // Settings states
  const [baleEnabled, setBaleEnabled] = useState(true);
  const [baleBotToken, setBaleBotToken] = useState('');
  const [baleChatId, setBaleChatId] = useState('');

  const [smsEnabled, setSmsEnabled] = useState(true);
  const [melipayamakUsername, setMelipayamakUsername] = useState('');
  const [melipayamakPassword, setMelipayamakPassword] = useState('');
  const [melipayamakFrom, setMelipayamakFrom] = useState('50004');

  const [templatePrice, setTemplatePrice] = useState('مشتری گرامی {نام مشتری}، پیش‌فاکتور سفارش "{نام کار}" (کد آرشیو: {کد}) تایید شد و جهت آماده‌سازی خط تیغ و طراحی ارجاع گردید.\nصنایع چاپ و بسته‌بندی آرمان امیران');
  const [templateDesign, setTemplateDesign] = useState('مشتری گرامی {نام مشتری}، طرح گرافیکی و خط تیغ سفارش "{نام کار}" (کد: {کد}) تایید نهایی شد و فرآیند ساخت ماکت و تامین متریال آغاز گردید.\nصنایع بسته‌بندی آرمان امیران');
  const [templateProduction, setTemplateProduction] = useState('مشتری گرامی {نام مشتری}، سفارش "{نام کار}" (کد آرشیو: {کد}) وارد خط چاپ و سالن تولید گردید. زمان بارگیری و تحویل اطلاع‌رسانی خواهد شد.\nصنایع بسته‌بندی آرمان امیران');

  const [soundEnabled, setSoundEnabled] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    if (!isCeo) return;
    try {
      setSettingsLoading(true);
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
      console.error(err);
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    if (isCeo) fetchSettings();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.is_read) handleMarkAsRead(notif.id);

    const isLeadNotification =
      (notif.archive_code && String(notif.archive_code).startsWith('MKT-')) ||
      (notif.title && notif.title.includes('بازاریاب')) ||
      (notif.message && notif.message.includes('MKT-'));

    if (isLeadNotification) {
      if (onSelectLead) {
        onSelectLead(notif.project_id, notif.archive_code);
      } else if (onSelectProject) {
        onSelectProject({ type: 'lead', leadId: notif.project_id, archiveCode: notif.archive_code });
      }
      onClose();
    } else if (notif.project_id && onSelectProject) {
      onSelectProject({ id: notif.project_id });
      onClose();
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSettingsLoading(true);
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
      alert('تنظیمات پیام‌رسان بله و ملی‌پیامک با موفقیت ذخیره شد.');
    } catch (err) {
      alert('خطا در ذخیره تنظیمات: ' + err.message);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleTestBale = async () => {
    if (!baleBotToken || !baleChatId) {
      alert('لطفاً ابتدا توکن بات و شناسه چت بله را وارد فرمایید.');
      return;
    }
    try {
      setTestBaleLoading(true);
      setTestBaleResult(null);
      const res = await api.testBaleNotification(baleBotToken, baleChatId);
      setTestBaleResult({ type: 'success', text: res.message || 'پیام تست به پیام‌رسان بله ارسال شد!' });
    } catch (err) {
      setTestBaleResult({ type: 'error', text: err.message });
    } finally {
      setTestBaleLoading(false);
    }
  };

  const handleTestSms = async () => {
    if (!melipayamakUsername || !melipayamakPassword || !testSmsPhone) {
      alert('لطفاً نام کاربری، رمز عبور ملی‌پیامک و شماره موبایل گیرنده تست را وارد فرمایید.');
      return;
    }
    try {
      setTestSmsLoading(true);
      setTestSmsResult(null);
      await api.testCustomerSms({
        username: melipayamakUsername,
        password: melipayamakPassword,
        from: melipayamakFrom,
        to: testSmsPhone,
        text: 'تست اتصال سامانه پیامک صنایع چاپ و بسته‌بندی آرمان امیران'
      });
      setTestSmsResult({ type: 'success', text: 'پیامک تستی به شماره ' + testSmsPhone + ' ارسال گردید.' });
    } catch (err) {
      setTestSmsResult({ type: 'error', text: err.message });
    } finally {
      setTestSmsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in zoom-in-95 duration-150">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">مرکز اعلان‌ها و سامانه هوشمند اطلاع‌رسانی</h2>
              <p className="text-xs text-slate-400">ارسال اعلان بله به پرسنل و پیامک به مشتریان در رویدادهای کلیدی</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'list'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-indigo-600" />
              <span>اعلان‌های اخیر ({notifications.filter(n => !n.is_read).length} جدید)</span>
            </button>

            {isCeo && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeTab === 'settings'
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Settings className="w-3.5 h-3.5 text-purple-600" />
                <span>پیکربندی بله (پرسنل) و ملی‌پیامک (مشتریان)</span>
              </button>
            )}
          </div>

          {activeTab === 'list' && notifications.some(n => !n.is_read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>خواندن همه</span>
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: NOTIFICATIONS LIST */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              {loading ? (
                <div className="py-12 text-center text-slate-400 text-xs">در حال دریافت اعلان‌ها...</div>
              ) : notifications.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <Bell className="w-10 h-10 text-slate-300 mx-auto" />
                  <div className="font-bold text-sm text-slate-600">هیچ اعلان جدیدی وجود ندارد</div>
                  <p className="text-xs text-slate-400">به محض ارجاع کار در خط تولید، در اینجا نمایش داده می‌شود.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      notif.is_read
                        ? 'bg-slate-50/60 border-slate-200 text-slate-600'
                        : 'bg-indigo-50/70 border-indigo-200 text-slate-900 shadow-xs ring-1 ring-indigo-300/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                        )}
                        <h4 className="font-black text-xs sm:text-sm text-slate-900 line-clamp-1">
                          {notif.title}
                        </h4>
                        {notif.archive_code && (
                          <span className="font-mono text-[11px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                            کد: {notif.archive_code}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        {formatDateFa(notif.created_at)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white p-1.5 rounded-lg border border-indigo-200 whitespace-nowrap">
                        {notif.archive_code?.startsWith('MKT-') ? 'برآورد قیمت استعلام' : 'مشاهده کار'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: NOTIFICATION CHANNELS SETTINGS (CEO ONLY) */}
          {activeTab === 'settings' && isCeo && (
            <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
              
              {/* Channel 1: Bale Messenger (for Personnel) */}
              <div className="bg-emerald-50/40 p-5 rounded-3xl border-2 border-emerald-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-sm text-slate-900">۱. پیام‌رسان بله (مختص پرسنل کارخانه - ۱۰۰٪ رایگان)</div>
                      <p className="text-xs text-slate-600 mt-0.5">ارسال خودکار مشخصات فنی، تیراژ و کد آرشیو به گروه یا پیوی پرسنل هر دپارتمان</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={baleEnabled}
                      onChange={(e) => setBaleEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {baleEnabled && (
                  <div className="space-y-3 pt-3 border-t border-emerald-200 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">توکن بات بله (Bot Token):</label>
                        <input
                          type="text"
                          placeholder="مثال: 123456789:ABCdefGhIJKlmNoPqRstUvwXyz"
                          value={baleBotToken}
                          onChange={(e) => setBaleBotToken(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 font-mono bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">شناسه چت یا کانال کارخانه (Chat ID):</label>
                        <input
                          type="text"
                          placeholder="مثال: 987654321 یا @arman_amiran"
                          value={baleChatId}
                          onChange={(e) => setBaleChatId(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 font-mono bg-white"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleTestBale}
                        disabled={testBaleLoading}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        {testBaleLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>تست ارسال پیام به بله</span>
                      </button>
                      {testBaleResult && (
                        <div className={`p-2 rounded-xl text-xs font-bold ${testBaleResult.type === 'success' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                          {testBaleResult.text}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Channel 2: Melipayamak 3 Smart Customer SMS Events */}
              <div className="bg-purple-50/40 p-5 rounded-3xl border-2 border-purple-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-200">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-sm text-slate-900">۲. سامانه ملی‌پیامک (۳ پیامک هوشمند برای مشتریان در رویدادهای کلیدی)</div>
                      <p className="text-xs text-slate-600 mt-0.5">ارسال خودکار پیامک رسمی به شماره مشتری در ۳ زمان حیاتی</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smsEnabled}
                      onChange={(e) => setSmsEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {smsEnabled && (
                  <div className="space-y-4 pt-3 border-t border-purple-200 animate-in fade-in">
                    
                    {/* Credentials */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">نام کاربری ملی‌پیامک:</label>
                        <input
                          type="text"
                          placeholder="نام کاربری پنل ملی‌پیامک"
                          value={melipayamakUsername}
                          onChange={(e) => setMelipayamakUsername(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">کلمه عبور / API Key:</label>
                        <input
                          type="password"
                          placeholder="کلمه عبور پنل"
                          value={melipayamakPassword}
                          onChange={(e) => setMelipayamakPassword(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">شماره خط فرستنده:</label>
                        <input
                          type="text"
                          placeholder="مثال: 50004..."
                          value={melipayamakFrom}
                          onChange={(e) => setMelipayamakFrom(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono bg-white"
                        />
                      </div>
                    </div>

                    {/* 3 Customer SMS Templates */}
                    <div className="space-y-3 bg-white p-4 rounded-2xl border border-purple-100">
                      <div className="font-bold text-purple-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>متن ۳ پیامک خودکار مشتری (با متغیرهای هوشمند):</span>
                      </div>

                      {/* Event 1: Price Approval */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          📩 ۱. پیامک تایید پیش‌فاکتور (مرحله ۳/۴):
                        </label>
                        <textarea
                          rows={2}
                          value={templatePrice}
                          onChange={(e) => setTemplatePrice(e.target.value)}
                          className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20"
                        />
                      </div>

                      {/* Event 2: Design Approval */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          📩 ۲. پیامک تایید فایل طراحی و خط تیغ (مرحله ۶/۷):
                        </label>
                        <textarea
                          rows={2}
                          value={templateDesign}
                          onChange={(e) => setTemplateDesign(e.target.value)}
                          className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20"
                        />
                      </div>

                      {/* Event 3: Production Entry */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          📩 ۳. پیامک ورود کار به سالن چاپ و خط تولید (مرحله ۱۰):
                        </label>
                        <textarea
                          rows={2}
                          value={templateProduction}
                          onChange={(e) => setTemplateProduction(e.target.value)}
                          className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>

                    {/* Test SMS Box */}
                    <div className="flex items-center gap-3 flex-wrap pt-1">
                      <input
                        type="text"
                        placeholder="شماره موبایل جهت تست پیامک (مثلاً 0912...)"
                        value={testSmsPhone}
                        onChange={(e) => setTestSmsPhone(e.target.value)}
                        className="px-3.5 py-2 text-xs rounded-xl border border-slate-300 font-mono bg-white w-64"
                      />
                      <button
                        type="button"
                        onClick={handleTestSms}
                        disabled={testSmsLoading}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        {testSmsLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PhoneCall className="w-3.5 h-3.5" />}
                        <span>ارسال پیامک تست</span>
                      </button>
                      {testSmsResult && (
                        <div className={`p-2 rounded-xl text-xs font-bold ${testSmsResult.type === 'success' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                          {testSmsResult.text}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Save Settings Action */}
              <button
                type="submit"
                disabled={settingsLoading}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {settingsLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-5 h-5 text-amber-300" />}
                <span>ذخیره کلیه تنظیمات نوتیفیکیشن بله و ملی‌پیامک</span>
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
