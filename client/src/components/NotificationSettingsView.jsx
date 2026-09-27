import React, { useState, useEffect, useRef } from 'react';
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
  Bot,
  Sliders,
  CheckSquare,
  Square,
  Copy,
  RotateCcw,
  Eye,
  Hash,
  Clock,
  User,
  Package,
  Boxes
} from 'lucide-react';

const STAGES_LIST = [
  { id: 1, name: '۱. بازرگانی و تعریف سفارش', short: 'بازرگانی', dept: 'واحد بازرگانی', role: 'sales', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { id: 2, name: '۲. استعلام و برآورد قیمت روز', short: 'برآورد قیمت', dept: 'واحد برآورد قیمت', role: 'estimation', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 3, name: '۳. تایید پیش‌فاکتور توسط مشتری', short: 'تایید مشتری', dept: 'تاییدیه مشتری / مالی', role: 'sales', color: 'bg-emerald-50 text-emerald-900 border-emerald-300' },
  { id: 4, name: '۴. تایید مدیر عامل', short: 'تایید مدیرعامل', dept: 'مدیریت عامل', role: 'ceo', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { id: 5, name: '۵. ارجاع به واحد طراحی و آتلیه', short: 'طراحی و تیغ', dept: 'استودیو طراحی و قالب', role: 'design', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { id: 6, name: '۶. تایید طرح توسط مشتری', short: 'تایید طرح', dept: 'تاییدیه طرح مشتری', role: 'sales', color: 'bg-teal-50 text-teal-800 border-teal-200' },
  { id: 7, name: '۷. ساخت ماکت و نمونه فیزیکی', short: 'ساخت ماکت', dept: 'واحد ماکت‌سازی', role: 'mockup', color: 'bg-orange-50 text-orange-800 border-orange-200' },
  { id: 8, name: '۸. تایید ماکت توسط مشتری', short: 'تایید ماکت', dept: 'تاییدیه ماکت مشتری', role: 'sales', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  { id: 9, name: '۹. خرید متریال توسط واحد خرید', short: 'خرید متریال', dept: 'تدارکات و انبار', role: 'procurement', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  { id: 10, name: '۱۰. ارجاع به خط تولید و چاپ', short: 'خط چاپ و تولید', dept: 'سرپرست سالن چاپ', role: 'production', color: 'bg-amber-50 text-amber-900 border-amber-300' },
  { id: 11, name: 'تکمیل و تحویل بار', short: 'تکمیل و تحویل', dept: 'انبار محصول نهایی', role: 'all', color: 'bg-green-50 text-green-800 border-green-200' }
];

const BALE_VARIABLES = [
  { tag: '{نام کار}', desc: 'عنوان و نام جعبه' },
  { tag: '{کد آرشیو}', desc: 'کد رهگیری و آرشیو' },
  { tag: '{نام مشتری}', desc: 'نام کارفرما / خریدار' },
  { tag: '{تیراژ}', desc: 'تعداد تیراژ سفارش' },
  { tag: '{شماره مرحله}', desc: 'شماره مرحله (۱ تا ۱۱)' },
  { tag: '{نام مرحله}', desc: 'عنوان کامل مرحله' },
  { tag: '{واحد مسئول}', desc: 'دپارتمان پیگیری' },
  { tag: '{شرح اقدام}', desc: 'توضیحات و پیام اقدام' },
  { tag: '{زمان}', desc: 'ساعت ثبت' },
  { tag: '{تاریخ}', desc: 'تاریخ شمسی' },
  { tag: '{ابعاد}', desc: 'ابعاد جعبه (mm)' },
  { tag: '{نوع جعبه}', desc: 'نوع ساختار جعبه' }
];

const DEFAULT_BALE_TEMPLATE = 
`📦 *اتوماسیون تولید آرمان امیران*

🔔 *{نام مرحله}*
📝 *کد آرشیو:* \`{کد آرشیو}\`
👤 *مشتری:* {نام مشتری}
📦 *عنوان سفارش:* {نام کار}
📊 *تیراژ:* {تیراژ}
👥 *واحد مسئول:* {واحد مسئول}

💬 *شرح اقدام:* {شرح اقدام}

⏰ *زمان ثبت:* {زمان} ({تاریخ})`;

export default function NotificationSettingsView() {
  const { role } = useAuth();
  const isCeo = role === 'ceo' || role === 'admin';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Active Main Tab: 'bale' | 'sms' | 'sound'
  const [activeTab, setActiveTab] = useState('bale');

  // ================= BALE MESSENGER STATES =================
  const [baleEnabled, setBaleEnabled] = useState(true);
  const [baleBotToken, setBaleBotToken] = useState('');
  const [baleChatId, setBaleChatId] = useState('');

  // Selected Active Stages for Bale (Array of numbers 1-11)
  const [baleStages, setBaleStages] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

  // Bale Template Mode: 'general' | 'stages'
  const [baleTemplateMode, setBaleTemplateMode] = useState('general');
  const [baleMessageTemplate, setBaleMessageTemplate] = useState(DEFAULT_BALE_TEMPLATE);
  const [baleStageTemplates, setBaleStageTemplates] = useState({});
  const [selectedBaleStageForTemplate, setSelectedBaleStageForTemplate] = useState(1);

  // Bale Test State
  const [testBaleLoading, setTestBaleLoading] = useState(false);
  const [testBaleResult, setTestBaleResult] = useState(null);
  const [testPreviewStage, setTestPreviewStage] = useState(5);

  const templateTextareaRef = useRef(null);

  // ================= MELIPAYAMAK SMS STATES =================
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [melipayamakUsername, setMelipayamakUsername] = useState('');
  const [melipayamakPassword, setMelipayamakPassword] = useState('');
  const [melipayamakFrom, setMelipayamakFrom] = useState('50004');

  const [templatePrice, setTemplatePrice] = useState(
    'مشتری گرامی {نام مشتری}، پیش‌فاکتور سفارش "{نام کار}" (کد آرشیو: {کد}) با موفقیت تایید شد و جهت آماده‌سازی خط تیغ و طراحی ارجاع گردید.\nصنایع چاپ و بسته‌بندی آرمان امیران'
  );
  const [templateDesign, setTemplateDesign] = useState(
    'مشتری گرامی {نام مشتری}، طرح گرافیکی و خط تیغ سفارش "{نام کار}" (کد: {کد}) تایید نهایی شد و فرآیند ساخت ماکت و تامین متریال آغاز گردید.\nصنایع بسته‌بندی آرمان امیران'
  );
  const [templateProduction, setTemplateProduction] = useState(
    'مشتری گرامی {نام مشتری}، سفارش "{نام کار}" (کد آرشیو: {کد}) وارد خط چاپ و سالن تولید گردید. زمان بارگیری و تحویل اطلاع‌رسانی خواهد شد.\nصنایع بسته‌بندی آرمان امیران'
  );

  const [testSmsPhone, setTestSmsPhone] = useState('');
  const [testSmsLoading, setTestSmsLoading] = useState(false);
  const [testSmsResult, setTestSmsResult] = useState(null);

  // ================= SOUND EFFECT STATE =================
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load Settings from Server
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.getNotificationSettings();
      const s = res.settings || {};

      // Bale Settings
      setBaleEnabled(s.bale_enabled !== 'false');
      setBaleBotToken(s.bale_bot_token || '');
      setBaleChatId(s.bale_chat_id || '');

      if (s.bale_stages) {
        try {
          const parsed = JSON.parse(s.bale_stages);
          if (Array.isArray(parsed)) setBaleStages(parsed);
        } catch (e) {}
      }

      setBaleMessageTemplate(s.bale_message_template || DEFAULT_BALE_TEMPLATE);

      // Load stage-specific templates
      const stageTemplates = {};
      STAGES_LIST.forEach(st => {
        if (s[`bale_template_stage_${st.id}`]) {
          stageTemplates[st.id] = s[`bale_template_stage_${st.id}`];
        }
      });
      setBaleStageTemplates(stageTemplates);

      // SMS Settings
      setSmsEnabled(s.sms_enabled !== 'false');
      setMelipayamakUsername(s.melipayamak_username || '');
      setMelipayamakPassword(s.melipayamak_password || '');
      setMelipayamakFrom(s.melipayamak_from || '50004');

      if (s.sms_template_price) setTemplatePrice(s.sms_template_price);
      if (s.sms_template_design) setTemplateDesign(s.sms_template_design);
      if (s.sms_template_production) setTemplateProduction(s.sms_template_production);

      // Audio Settings
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
      const payload = {
        bale_enabled: String(baleEnabled),
        bale_bot_token: baleBotToken,
        bale_chat_id: baleChatId,
        bale_stages: JSON.stringify(baleStages),
        bale_message_template: baleMessageTemplate,
        sms_enabled: String(smsEnabled),
        melipayamak_username: melipayamakUsername,
        melipayamak_password: melipayamakPassword,
        melipayamak_from: melipayamakFrom,
        sms_template_price: templatePrice,
        sms_template_design: templateDesign,
        sms_template_production: templateProduction,
        browser_sound_enabled: String(soundEnabled)
      };

      // Add stage specific templates
      STAGES_LIST.forEach(st => {
        payload[`bale_template_stage_${st.id}`] = baleStageTemplates[st.id] || '';
      });

      await api.updateNotificationSettings(payload);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      alert('خطا در ذخیره تنظیمات: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Toggle stage selection for Bale
  const toggleBaleStage = (stageId) => {
    setBaleStages(prev => {
      if (prev.includes(stageId)) {
        return prev.filter(id => id !== stageId);
      } else {
        return [...prev, stageId].sort((a, b) => a - b);
      }
    });
  };

  const selectAllStages = () => {
    setBaleStages(STAGES_LIST.map(s => s.id));
  };

  const deselectAllStages = () => {
    setBaleStages([]);
  };

  const selectKeyMilestonesOnly = () => {
    setBaleStages([1, 3, 4, 6, 8, 10]);
  };

  // Insert Variable into active textarea
  const insertVariable = (tag) => {
    if (baleTemplateMode === 'general') {
      const current = baleMessageTemplate;
      setBaleMessageTemplate(current + (current ? ' ' : '') + tag);
    } else {
      const current = baleStageTemplates[selectedBaleStageForTemplate] || baleMessageTemplate;
      setBaleStageTemplates(prev => ({
        ...prev,
        [selectedBaleStageForTemplate]: current + (current ? ' ' : '') + tag
      }));
    }
  };

  // Reset Template to Standard
  const handleResetTemplate = () => {
    if (baleTemplateMode === 'general') {
      setBaleMessageTemplate(DEFAULT_BALE_TEMPLATE);
    } else {
      setBaleStageTemplates(prev => {
        const next = { ...prev };
        delete next[selectedBaleStageForTemplate];
        return next;
      });
    }
  };

  // Active Template Text to edit / preview
  const activeTemplateText = baleTemplateMode === 'general'
    ? baleMessageTemplate
    : (baleStageTemplates[selectedBaleStageForTemplate] || baleMessageTemplate);

  // Generate Simulated Preview of Bale Message
  const renderSimulatedBalePreview = (stageId = testPreviewStage) => {
    const stageInfo = STAGES_LIST.find(s => s.id === stageId) || STAGES_LIST[4];
    const template = baleStageTemplates[stageId] || baleMessageTemplate || DEFAULT_BALE_TEMPLATE;

    const sampleData = {
      '{نام کار}': 'جعبه هاردباکس لوکس ۳ لایه عطر',
      '{title}': 'جعبه هاردباکس لوکس ۳ لایه عطر',
      '{کد آرشیو}': 'ARM-9840-BX',
      '{archive_code}': 'ARM-9840-BX',
      '{نام مشتری}': 'عطر و ادکلن پارسیس لوکس',
      '{customer_name}': 'عطر و ادکلن پارسیس لوکس',
      '{تیراژ}': '۱۰,۰۰۰ عدد',
      '{quantity}': '۱۰,۰۰۰ عدد',
      '{شماره مرحله}': String(stageId),
      '{stage_number}': String(stageId),
      '{نام مرحله}': stageInfo.name,
      '{stage_name}': stageInfo.name,
      '{واحد مسئول}': stageInfo.dept,
      '{target_role}': stageInfo.dept,
      '{شرح اقدام}': `سفارش با موفقیت به مرحله «${stageInfo.name}» منتقل گردید.`,
      '{message}': `سفارش با موفقیت به مرحله «${stageInfo.name}» منتقل گردید.`,
      '{زمان}': '۱۴:۳۵:۲۰',
      '{time}': '۱۴:۳۵:۲۰',
      '{تاریخ}': '۱۴۰۵/۰۷/۰۶',
      '{date}': '۱۴۰۵/۰۷/۰۶',
      '{ابعاد}': '۱۴۰×۹۰×۵۵ mm',
      '{dimensions}': '۱۴۰×۹۰×۵۵ mm',
      '{نوع جعبه}': 'هاردباکس دو تکه مگنتی',
      '{box_type}': 'هاردباکس دو تکه مگنتی'
    };

    let result = template;
    for (const [k, v] of Object.entries(sampleData)) {
      result = result.split(k).join(v);
    }
    return result;
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
      const templateToTest = activeTemplateText;
      const res = await api.testBaleNotification(baleBotToken, baleChatId, templateToTest, testPreviewStage);
      if (res.success) {
        setTestBaleResult({ success: true, message: 'پیام تست با قالب تنظیمی با موفقیت به پیام‌رسان بله ارسال شد.' });
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
    <div className="w-full max-w-5xl mx-auto space-y-6 select-none animate-fade-in pb-16">
      
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl flex items-center justify-between flex-wrap gap-4 border border-indigo-500/30">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-500 text-slate-950 flex items-center justify-center shadow-lg font-bold">
            <Bot className="w-7 h-7 text-slate-950 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black tracking-tight">
                تنظیمات پیام‌رسان بله و پیامک مشتریان
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                پیکربندی هوشمند
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
              تنظیم دقیق مراحل ارسال پیام، ویرایش قالب متن با متغیرهای داینامیک، تست آنی و اتصال به سامانه پیامک
            </p>
          </div>
        </div>

        {/* Top Save Button */}
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
              تنظیمات مراحل و متن پیام‌های بله و پیامک با موفقیت ذخیره و در هسته سرور اعمال گردید.
            </span>
          </div>
          <span className="text-xs text-emerald-700 font-bold font-mono">OK 200</span>
        </div>
      )}

      {/* Main Channel Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('bale')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all ${
            activeTab === 'bale'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>۱. تنظیمات اختصاصی پیام‌رسان بله</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            activeTab === 'bale' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-600'
          }`}>
            {baleStages.length} مرحله فعال
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sms')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all ${
            activeTab === 'sms'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>۲. پیامک مشتریان (ملی‌پیامک)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sound')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all ${
            activeTab === 'sound'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>۳. آلارم صوتی مرورگر</span>
        </button>
      </div>

      {/* ================= TAB 1: تنظیمات پیام‌رسان بله (BALE MESSENGER) ================= */}
      {activeTab === 'bale' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Section 1.1: مشخصات اتصال به بات بله */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    پیکربندی بات اختصاصی بله (Bale Bot API)
                  </h2>
                  <p className="text-xs text-slate-500">
                    اتصال اتوماسیون به پیام‌رسان بله جهت ارسال لحظه‌ای اطلاعیه‌ها به گروه کارخانه یا اکانت پرسنل
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
                <span className="text-xs font-black text-slate-700">ارسال به بله فعال باشد</span>
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
                  از بازوی BotFather@ در پیام‌رسان بله دریافت نمایید.
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
                  شناسه عددی اکانت یا سوپرگروه کارخانه در بله
                </span>
              </div>
            </div>
          </div>

          {/* Section 1.2: تنظیم مراحل فعال در بله (Configurable Stages) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                  <Sliders className="w-5 h-5 text-indigo-700" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    انتخاب مراحل فعال جهت ارسال پیام به بله
                  </h2>
                  <p className="text-xs text-slate-500">
                    مشخص کنید در کدام مراحل از گردش کار ۱۰ مرحله‌ای، پیام نوتیفیکیشن در بله ارسال گردد:
                  </p>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={selectAllStages}
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition border border-indigo-200"
                >
                  انتخاب همه مراحل (۱۱ مرحله)
                </button>
                <button
                  type="button"
                  onClick={selectKeyMilestonesOnly}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold transition border border-amber-200"
                >
                  فقط نقاط عطف اصلی
                </button>
                <button
                  type="button"
                  onClick={deselectAllStages}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition border border-rose-200"
                >
                  لغو انتخاب همه
                </button>
              </div>
            </div>

            {/* Stages Grid (Checkboxes) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {STAGES_LIST.map((stage) => {
                const isSelected = baleStages.includes(stage.id);
                return (
                  <div
                    key={stage.id}
                    onClick={() => toggleBaleStage(stage.id)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {stage.id}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-800 truncate">
                          {stage.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold truncate">
                          {stage.dept}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 mr-2">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 text-xs text-indigo-900 flex items-center justify-between">
              <span className="font-bold">
                تعداد مراحل انتخاب‌شده برای ارسال پیام به بله: <span className="font-mono font-black text-indigo-700">{baleStages.length}</span> از ۱۱ مرحله
              </span>
              <span className="text-[11px] text-indigo-700">
                {baleStages.length === 11 ? '✅ تمامی مراحل فعال هستند' : '⚡ مراحل انتخابی فعال هستند'}
              </span>
            </div>
          </div>

          {/* Section 1.3: تنظیم متن و قالب پیام در بله (Customizable Templates & Variables) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <MessageSquare className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    تنظیم متن و قالب پیام در بله (Bale Message Template)
                  </h2>
                  <p className="text-xs text-slate-500">
                    شخصی‌سازی ساختار پیام‌های بله همراه با متغیرهای هوشمند و پشتیبانی از قالب‌بندی Markdown
                  </p>
                </div>
              </div>

              {/* General vs Stage-specific Template Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setBaleTemplateMode('general')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    baleTemplateMode === 'general'
                      ? 'bg-white text-indigo-950 font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  قالب یکپارچه کلی
                </button>
                <button
                  type="button"
                  onClick={() => setBaleTemplateMode('stages')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    baleTemplateMode === 'stages'
                      ? 'bg-white text-indigo-950 font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  قالب اختصاصی هر مرحله
                </button>
              </div>
            </div>

            {/* Stage Selector if in Stage-Specific mode */}
            {baleTemplateMode === 'stages' && (
              <div className="bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-200 space-y-2">
                <div className="text-xs font-black text-indigo-950 flex items-center justify-between">
                  <span>انتخاب مرحله جهت ویرایش متن اختصاصی:</span>
                  <span className="text-[11px] text-indigo-700 font-medium">
                    (در صورت خالی بودن، از قالب یکپارچه کلی استفاده می‌شود)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {STAGES_LIST.map((stage) => (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => setSelectedBaleStageForTemplate(stage.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
                        selectedBaleStageForTemplate === stage.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : baleStageTemplates[stage.id]
                            ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-mono">{stage.id}.</span>
                      <span>{stage.short}</span>
                      {baleStageTemplates[stage.id] && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Variable Badges (Click to Insert) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>کلیک روی هر متغیر برای درج خودکار در متن پیام:</span>
                </span>
                <button
                  type="button"
                  onClick={handleResetTemplate}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>بازنشانی به متن پیش‌فرض</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {BALE_VARIABLES.map((v) => (
                  <button
                    key={v.tag}
                    type="button"
                    onClick={() => insertVariable(v.tag)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-800 hover:text-indigo-900 border border-slate-200 hover:border-indigo-300 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-2xs group"
                    title={v.desc}
                  >
                    <span>{v.tag}</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-indigo-600 font-sans">
                      ({v.desc.split(' ')[0]})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Editor & Live Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Left Column: Markdown Template Textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-slate-700">
                  <span>
                    ویرایشگر متن پیام بله {baleTemplateMode === 'stages' ? `(مرحله ${selectedBaleStageForTemplate})` : '(قالب کلی)'}:
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">پشتیبانی از Markdown</span>
                </div>

                <textarea
                  ref={templateTextareaRef}
                  rows={12}
                  dir="rtl"
                  value={
                    baleTemplateMode === 'general'
                      ? baleMessageTemplate
                      : (baleStageTemplates[selectedBaleStageForTemplate] !== undefined
                          ? baleStageTemplates[selectedBaleStageForTemplate]
                          : baleMessageTemplate)
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (baleTemplateMode === 'general') {
                      setBaleMessageTemplate(val);
                    } else {
                      setBaleStageTemplates(prev => ({
                        ...prev,
                        [selectedBaleStageForTemplate]: val
                      }));
                    }
                  }}
                  placeholder="متن پیام بله را با متغیرها وارد کنید..."
                  className="w-full p-3.5 rounded-2xl border border-slate-300 text-xs font-mono text-slate-800 bg-slate-50/50 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              {/* Right Column: Live Chat Preview Simulation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-slate-700">
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <Eye className="w-4 h-4" />
                    <span>پیش‌نمایش زنده در حباب چت بله:</span>
                  </div>
                  
                  {/* Select stage to preview with */}
                  <select
                    value={testPreviewStage}
                    onChange={(e) => setTestPreviewStage(Number(e.target.value))}
                    className="text-[11px] px-2 py-0.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-700"
                  >
                    {STAGES_LIST.map((s) => (
                      <option key={s.id} value={s.id}>
                        پیش‌نمایش مرحله {s.id}: {s.short}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Simulated Bale Chat Bubble */}
                <div className="bg-emerald-950/5 border border-emerald-200/80 rounded-2xl p-4 h-[278px] overflow-y-auto space-y-2 flex flex-col justify-between">
                  <div className="bg-white p-3.5 rounded-2xl rounded-tr-xs shadow-xs border border-slate-200/80 text-xs leading-relaxed text-slate-900 whitespace-pre-wrap font-sans">
                    {renderSimulatedBalePreview(testPreviewStage)}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-emerald-200/60 pt-2">
                    <span className="flex items-center gap-1">
                      <Bot className="w-3 h-3 text-emerald-600" />
                      <span>بات اتوماسیون آرمان امیران</span>
                    </span>
                    <span>هم‌اکنون • تایید شده</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Test Bale Dispatch Section */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs text-slate-800 font-black block">
                  ارسال پیام تست با این قالب به پیام‌رسان بله:
                </span>
                <span className="text-[11px] text-slate-500">
                  یک پیام آزمایشی با اطلاعات نمونه جهت بررسی ظاهر در پیام‌رسان بله ارسال خواهد شد.
                </span>
              </div>

              <button
                type="button"
                onClick={handleTestBale}
                disabled={testBaleLoading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition flex items-center gap-2 shadow-xs"
              >
                {testBaleLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{testBaleLoading ? 'در حال ارسال...' : 'ارسال تست به بله'}</span>
              </button>
            </div>

            {testBaleResult && (
              <div className={`p-3.5 rounded-2xl text-xs font-bold border animate-fade-in ${
                testBaleResult.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {testBaleResult.message}
              </div>
            )}

          </div>

        </div>
      )}

      {/* ================= TAB 2: پیامک مشتریان (MELIPAYAMAK SMS) ================= */}
      {activeTab === 'sms' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6 animate-fade-in">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  اطلاع‌رسانی پیامکی به مشتریان (سامانه ملی‌پیامک)
                </h2>
                <p className="text-xs text-slate-500">
                  ارسال خودکار پیامک وضعیت سفارش به شماره موبایل کارفرما در ۳ گام کلیدی تولید
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
      )}

      {/* ================= TAB 3: صدای نوتیفیکیشن مرورگر ================= */}
      {activeTab === 'sound' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-4 animate-fade-in">
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
      )}

      {/* Bottom Floating Save Bar */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-3xl border-2 border-indigo-300 shadow-2xl flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>تمامی مراحل فعال و قالب‌های متنی بله به صورت بلادرنگ در دیتابیس سرور اعمال می‌شوند.</span>
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
