import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  Megaphone,
  AlertTriangle,
  Flame,
  Sparkles,
  Info,
  CheckCircle2,
  Edit3,
  X,
  Radio,
  Sliders,
  Send,
  RefreshCw,
  Power,
  ChevronDown
} from 'lucide-react';

const PRIORITY_CONFIG = {
  urgent: {
    label: 'فوری و امنیتی',
    icon: Flame,
    bgClass: 'bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 text-rose-100 border-rose-800/80',
    badgeClass: 'bg-rose-500 text-white shadow-rose-500/50',
    accentText: 'text-rose-300',
    pulseColor: 'bg-rose-400',
    colorKey: 'rose'
  },
  warning: {
    label: 'اخطار و توجه خط تولید',
    icon: AlertTriangle,
    bgClass: 'bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-amber-100 border-amber-800/80',
    badgeClass: 'bg-amber-500 text-slate-950 shadow-amber-500/50',
    accentText: 'text-amber-300',
    pulseColor: 'bg-amber-400',
    colorKey: 'amber'
  },
  info: {
    label: 'اطلاعیه عمومی کارخانه',
    icon: Megaphone,
    bgClass: 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-slate-100 border-indigo-900/80',
    badgeClass: 'bg-indigo-600 text-white shadow-indigo-600/50',
    accentText: 'text-cyan-300',
    pulseColor: 'bg-cyan-400',
    colorKey: 'indigo'
  },
  success: {
    label: 'پیام موفقیت و رکورد',
    icon: CheckCircle2,
    bgClass: 'bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-950 text-emerald-100 border-emerald-800/80',
    badgeClass: 'bg-emerald-600 text-white shadow-emerald-600/50',
    accentText: 'text-emerald-300',
    pulseColor: 'bg-emerald-400',
    colorKey: 'emerald'
  },
  motivation: {
    label: 'پیام انگیزشی و مدیریتی',
    icon: Sparkles,
    bgClass: 'bg-gradient-to-r from-purple-950 via-violet-950 to-purple-950 text-purple-100 border-purple-800/80',
    badgeClass: 'bg-purple-600 text-white shadow-purple-600/50',
    accentText: 'text-purple-300',
    pulseColor: 'bg-purple-400',
    colorKey: 'purple'
  }
};

const PRESET_MESSAGES = [
  {
    title: 'سرعت برآورد قیمت',
    message: 'همکاران گرامی؛ کلیه استعلام‌های بازاریابی ظرف حداکثر ۲ ساعت توسط واحد برآورد تعیین قیمت می‌شوند.',
    priority: 'info'
  },
  {
    title: 'ایمنی در خطوط تولید',
    message: 'رعایت کامل الزامات ایمنی، استفاده از دستکش و عینک محافظ در سالن‌های چاپ و دایکات الزامی است.',
    priority: 'warning'
  },
  {
    title: 'جلسه هماهنگی شیفت',
    message: 'جلسه هماهنگی سرپرستان خطوط تولید و مدیران فنی امروز راس ساعت ۱۴ در سالن جلسات برگزار می‌گردد.',
    priority: 'urgent'
  },
  {
    title: 'رکورد تولید ماهانه',
    message: 'با تلاش شبانه‌روزی پرسنل، رکورد تولید جعبه در ماه جاری شکسته شد. صمیمانه از همت تمامی همکاران سپاسگزاریم.',
    priority: 'success'
  },
  {
    title: 'ورود متریال جدید',
    message: 'پارت جدید مقوای ایندربرد ۳۰۰ گرم سایز ۷۰×۱۰۰ وارد انبار مرکزی شد و دستور کارهای اولویت‌دار در صف چاپ قرار گرفتند.',
    priority: 'motivation'
  }
];

export default function TopAnnouncementTicker() {
  const { currentUser, role } = useAuth();
  const canManage = role === 'admin' || role === 'ceo';

  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Modal Form States
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editPriority, setEditPriority] = useState('info');
  const [editSpeed, setEditSpeed] = useState(35);
  const [editIsActive, setEditIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchActiveAnnouncement = async () => {
    try {
      const res = await api.getActiveAnnouncement();
      if (res && res.success) {
        setAnnouncement(res.announcement);
      }
    } catch (err) {
      console.error('Error fetching announcement:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveAnnouncement();
    // Poll every 25 seconds for real-time live synchronization across devices
    const interval = setInterval(fetchActiveAnnouncement, 25000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenEdit = () => {
    if (announcement) {
      setEditTitle(announcement.title || 'اطلاعیه مدیریت');
      setEditMessage(announcement.message || '');
      setEditPriority(announcement.priority || 'info');
      setEditSpeed(announcement.speed || 35);
      setEditIsActive(announcement.is_active === 1 || announcement.is_active === true);
    } else {
      setEditTitle('اطلاعیه مدیریت کارخانه');
      setEditMessage('همکاران گرامی؛ کلیه استعلام‌های بازاریابی ظرف حداکثر ۲ ساعت توسط واحد برآورد تعیین قیمت می‌شوند.');
      setEditPriority('info');
      setEditSpeed(35);
      setEditIsActive(true);
    }
    setShowEditModal(true);
    setSaveSuccess(false);
  };

  const handleApplyPreset = (preset) => {
    setEditTitle(preset.title);
    setEditMessage(preset.message);
    setEditPriority(preset.priority);
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    if (!editMessage.trim()) return;

    setSaving(true);
    try {
      const res = await api.createAnnouncement({
        title: editTitle,
        message: editMessage,
        priority: editPriority,
        speed: editSpeed,
        is_active: editIsActive ? 1 : 0
      });

      if (res && res.success) {
        setSaveSuccess(true);
        setIsDismissed(false);
        fetchActiveAnnouncement();
        setTimeout(() => {
          setShowEditModal(false);
          setSaveSuccess(false);
        }, 1200);
      }
    } catch (err) {
      alert('خطا در ذخیره پیام: ' + (err.message || 'خطای سرور'));
    } finally {
      setSaving(false);
    }
  };

  // If dismissed or inactive or loading without announcement
  if (isDismissed || (!announcement && !canManage) || (announcement && !announcement.is_active && !canManage)) {
    return null;
  }

  // When inactive but user is CEO/Admin, show mini trigger bar
  if ((!announcement || !announcement.is_active) && canManage) {
    return (
      <>
        <div className="bg-slate-900 border-b border-indigo-950/60 px-4 py-1.5 flex items-center justify-between text-xs text-slate-400 no-print" dir="rtl">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] font-bold">نوار رونده اعلان پرسنل غیرفعال است.</span>
          </div>
          <button
            onClick={handleOpenEdit}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white border border-indigo-500/40 text-[11px] font-bold transition"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>تنظیم و فعال‌سازی نوار رونده</span>
          </button>
        </div>

        {/* Modal */}
        {showEditModal && renderEditModal()}
      </>
    );
  }

  const pConfig = PRIORITY_CONFIG[announcement?.priority] || PRIORITY_CONFIG.info;
  const IconComp = pConfig.icon;
  const speedSec = announcement?.speed || 35;

  return (
    <>
      <div
        className={`w-full relative z-40 border-b shadow-md overflow-hidden transition-all duration-300 no-print select-none ${pConfig.bgClass}`}
        dir="rtl"
      >
        <div className="flex items-center justify-between h-9 sm:h-10 px-2 sm:px-4">
          
          {/* Right Static Badge / Icon */}
          <div className="flex items-center gap-2 shrink-0 z-10 pl-3">
            <div className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-black flex items-center gap-1.5 shadow-md ${pConfig.badgeClass}`}>
              <span className={`w-2 h-2 rounded-full ${pConfig.pulseColor} animate-ping shrink-0`} />
              <IconComp className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{announcement?.title || pConfig.label}</span>
              <span className="sm:hidden">{pConfig.label.split(' ')[0]}</span>
            </div>
          </div>

          {/* Scrolling Text Track (Marquee with CSS) */}
          <div className="flex-1 overflow-hidden relative mx-2 h-full flex items-center group cursor-pointer" onClick={canManage ? handleOpenEdit : undefined}>
            <div
              className="whitespace-nowrap flex items-center gap-8 animate-marquee group-hover:[animation-play-state:paused]"
              style={{
                animationDuration: `${speedSec}s`,
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite'
              }}
            >
              <div className="flex items-center gap-3 text-xs sm:text-sm font-black tracking-wide">
                <span>{announcement?.message}</span>
                {announcement?.created_by_name && (
                  <span className={`text-[10px] font-normal opacity-75 mr-2 ${pConfig.accentText}`}>
                    ({announcement.created_by_name})
                  </span>
                )}
              </div>

              {/* Repeat for seamless loop */}
              <div className="flex items-center gap-3 text-xs sm:text-sm font-black tracking-wide">
                <span className="opacity-40">• • •</span>
                <span>{announcement?.message}</span>
                {announcement?.created_by_name && (
                  <span className={`text-[10px] font-normal opacity-75 mr-2 ${pConfig.accentText}`}>
                    ({announcement.created_by_name})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Left Actions */}
          <div className="flex items-center gap-1.5 shrink-0 z-10 pr-2">
            {canManage && (
              <button
                type="button"
                onClick={handleOpenEdit}
                title="ویرایش اعلان یا تغییر پیام"
                className="p-1 sm:px-2 sm:py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 hover:text-white text-[11px] font-bold flex items-center gap-1 transition shadow-xs border border-white/10"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ویرایش اعلان</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              title="بستن موقت نوار"
              className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal for CEO & Admin */}
      {showEditModal && renderEditModal()}
    </>
  );

  function renderEditModal() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 select-none" dir="rtl">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/40 text-cyan-400 border border-indigo-500/30 flex items-center justify-center shadow-lg">
                <Megaphone className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black">مدیریت نوار رونده اعلان پرسنل کارخانه</h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  ارسال پیام زنده و اطلاعیه متحرک در بالای پنل کلیه کاربران (دسکتاپ، تبلت و موبایل)
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowEditModal(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveAnnouncement} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
            
            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>پیام با موفقیت در بالای پنل کلیه پرسنل ثبت و منتشر شد!</span>
              </div>
            )}

            {/* Active Toggle Switch */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <Power className={`w-5 h-5 ${editIsActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div>
                  <strong className="text-slate-800 block text-xs">وضعیت نمایش نوار رونده:</strong>
                  <span className="text-[11px] text-slate-500">
                    {editIsActive ? 'فعال و در حال پخش در بالای تمام صفحات' : 'غیرفعال (مخفی برای تمام پرسنل)'}
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Title & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-black text-slate-700 block mb-1">
                  عنوان / برچسب اعلان: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="مثال: اطلاعیه مدیریت کارخانه"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-black text-slate-700 block mb-1">
                  نوع و اولویت اعلان:
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="info">🔵 اطلاعیه عمومی کارخانه (نیلی/آبی)</option>
                  <option value="urgent">🔴 فوری و امنیتی (قرمز درخشان)</option>
                  <option value="warning">🟡 اخطار و دستور شیفت (زرد/کهربایی)</option>
                  <option value="success">🟢 موفقیت و رکورد تولید (سبز زمردی)</option>
                  <option value="motivation">🟣 پیام انگیزشی و مدیریتی (بنفش)</option>
                </select>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="font-black text-slate-700 block mb-1">
                متن کامل پیام متحرک: <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows="3"
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                placeholder="متن پیام رونده را وارد فرمایید..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 leading-relaxed focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Scroll Speed Slider */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span>سرعت حرکت نوار:</span>
                </span>
                <span className="text-xs font-mono font-black text-indigo-700">
                  {editSpeed <= 20 ? 'سریع (۲۰ ثانیه)' : editSpeed >= 50 ? 'آهسته (۵۰ ثانیه)' : 'متوسط (۳۵ ثانیه)'}
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="60"
                step="5"
                value={editSpeed}
                onChange={(e) => setEditSpeed(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>سریع‌تر (۱۵ ثانیه)</span>
                <span>متوسط</span>
                <span>آرام‌تر (۶۰ ثانیه)</span>
              </div>
            </div>

            {/* Quick 1-Click Presets */}
            <div className="space-y-1.5">
              <label className="font-black text-slate-700 block text-[11px]">
                قالب‌ها و پیام‌های آماده پرکاربرد:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_MESSAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="p-2 bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 rounded-xl text-right transition flex flex-col gap-0.5 group"
                  >
                    <span className="font-black text-indigo-950 text-xs group-hover:text-indigo-600">
                      {preset.title}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate w-full">
                      {preset.message}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <label className="font-black text-slate-700 block text-[11px]">پیش‌نمایش زنده نوار رونده:</label>
              <div className={`p-2.5 rounded-xl border text-xs font-bold overflow-hidden shadow-xs ${PRIORITY_CONFIG[editPriority]?.bgClass || PRIORITY_CONFIG.info.bgClass}`}>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${PRIORITY_CONFIG[editPriority]?.badgeClass || PRIORITY_CONFIG.info.badgeClass}`}>
                    {editTitle || 'پیش‌نمایش'}
                  </span>
                  <span className="truncate text-xs font-medium text-white">
                    {editMessage || 'متن پیام در اینجا نمایش داده خواهد شد...'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={saving || !editMessage.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-black text-xs shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>انتشار زنده در پنل تمام پرسنل</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
