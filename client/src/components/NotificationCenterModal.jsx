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
  Info
} from 'lucide-react';

export default function NotificationCenterModal({ onClose, onSelectProject }) {
  const { role } = useAuth();
  const isCeo = role === 'ceo';

  const [activeTab, setActiveTab] = useState('list'); // 'list', 'settings'
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Settings states
  const [baleEnabled, setBaleEnabled] = useState(false);
  const [baleBotToken, setBaleBotToken] = useState('');
  const [baleChatId, setBaleChatId] = useState('');

  const [smsEnabled, setSmsEnabled] = useState(false);
  const [melipayamakUsername, setMelipayamakUsername] = useState('');
  const [melipayamakPassword, setMelipayamakPassword] = useState('');
  const [melipayamakFrom, setMelipayamakFrom] = useState('50004');

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
      setBaleEnabled(s.bale_enabled === 'true');
      setBaleBotToken(s.bale_bot_token || '');
      setBaleChatId(s.bale_chat_id || '');

      setSmsEnabled(s.sms_enabled === 'true');
      setMelipayamakUsername(s.melipayamak_username || '');
      setMelipayamakPassword(s.melipayamak_password || '');
      setMelipayamakFrom(s.melipayamak_from || '50004');

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
        browser_sound_enabled: String(soundEnabled)
      });
      alert('تنظیمات نوتیفیکیشن با موفقیت ذخیره شد.');
    } catch (err) {
      alert('خطا در ذخیره تنظیمات: ' + err.message);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleTestBale = async () => {
    if (!baleBotToken || !baleChatId) {
      alert('لطفاً توکن بات و شناسه چت بله را وارد فرمایید.');
      return;
    }
    try {
      setTestLoading(true);
      setTestResult(null);
      const res = await api.testBaleNotification(baleBotToken, baleChatId);
      setTestResult({ type: 'success', text: res.message || 'پیام تست به پیام‌رسان بله ارسال شد!' });
    } catch (err) {
      setTestResult({ type: 'error', text: err.message });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in zoom-in-95 duration-150">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">مرکز اعلان‌ها و نوتیفیکیشن کارخانه</h2>
              <p className="text-xs text-slate-400">اطلاع‌رسانی لحظه‌ای ارجاعات خط تولید به پرسنل و مشتریان</p>
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
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
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
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeTab === 'settings'
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Settings className="w-3.5 h-3.5 text-purple-600" />
                <span>تنظیمات بله و ملی‌پیامک</span>
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
                  <p className="text-xs text-slate-400">هنگامی که پروژه‌ای به مرحله بعدی ارجاع شود، در اینجا نمایش داده می‌شود.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.is_read) handleMarkAsRead(notif.id);
                      if (notif.project_id && onSelectProject) {
                        onSelectProject({ id: notif.project_id });
                        onClose();
                      }
                    }}
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
                      <span className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white p-1.5 rounded-lg border border-indigo-200">
                        مشاهده کار
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
              
              {/* Channel 1: Browser Audio Chime */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-black text-sm text-slate-800">۱. نوتیفیکیشن صوتی مرورگر و موبایل (رایگان و آفلاین)</div>
                      <p className="text-[11px] text-slate-500">پخش صدای دینگ هنگام تغییر مرحله روی گوشی و کامپیوتر در شبکه کارخانه</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={(e) => setSoundEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => playNotificationSound()}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>تست پخش صدای اعلان</span>
                </button>
              </div>

              {/* Channel 2: Bale Messenger Bot */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-black text-sm text-slate-800">۲. پیام‌رسان بله (Bale Messenger - رایگان با سرور داخلی)</div>
                      <p className="text-[11px] text-slate-500">ارسال خودکار مشخصات کار به پیوی یا گروه پرسنل در اپلیکیشن ایرانی بله</p>
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
                  <div className="space-y-3 pt-2 border-t border-slate-200 animate-in fade-in">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">توکن بات بله (Bot Token):</label>
                      <input
                        type="text"
                        placeholder="مثال: 123456789:ABCdefGhIJKlmNoPqRstUvwXyz"
                        value={baleBotToken}
                        onChange={(e) => setBaleBotToken(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">شناسه چت یا کانال (Chat ID):</label>
                      <input
                        type="text"
                        placeholder="مثال: 987654321 یا @arman_amiran_channel"
                        value={baleChatId}
                        onChange={(e) => setBaleChatId(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleTestBale}
                      disabled={testLoading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                    >
                      {testLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>تست ارسال پیام به بله</span>
                    </button>
                    {testResult && (
                      <div className={`p-2.5 rounded-xl text-xs font-bold ${testResult.type === 'success' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                        {testResult.text}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Channel 3: Melipayamak SMS Gateway */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-black text-sm text-slate-800">۳. سامانه ملی‌پیامک (SMS Gateway)</div>
                      <p className="text-[11px] text-slate-500">ارسال پیامک اطلاع‌رسانی به شماره موبایل پرسنل و مشتریان</p>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 animate-in fade-in">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">نام کاربری ملی‌پیامک:</label>
                      <input
                        type="text"
                        placeholder="نام کاربری پنل ملی‌پیامک"
                        value={melipayamakUsername}
                        onChange={(e) => setMelipayamakUsername(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">کلمه عبور / API Key:</label>
                      <input
                        type="password"
                        placeholder="کلمه عبور"
                        value={melipayamakPassword}
                        onChange={(e) => setMelipayamakPassword(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">شماره فرستنده (خط اختصاصی یا خدماتی):</label>
                      <input
                        type="text"
                        placeholder="مثال: 50004..."
                        value={melipayamakFrom}
                        onChange={(e) => setMelipayamakFrom(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Save Settings Action */}
              <button
                type="submit"
                disabled={settingsLoading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
              >
                {settingsLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>ذخیره تنظیمات کانال‌های نوتیفیکیشن</span>
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
