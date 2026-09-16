export const STAGES = [
  {
    id: 1,
    key: 'COMMERCE',
    title: '۱. بازرگانی و تعریف سفارش',
    shortName: 'بازرگانی',
    role: 'sales',
    roleName: 'واحد بازرگانی',
    color: 'border-blue-500 bg-blue-50 text-blue-700',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    desc: 'تعریف مشتری، نوع محصول، ابعاد و تیراژ جعبه'
  },
  {
    id: 2,
    key: 'PRICE_ESTIMATION',
    title: '۲. استعلام و برآورد قیمت',
    shortName: 'برآورد قیمت',
    role: 'estimation',
    roleName: 'واحد برآورد',
    color: 'border-amber-500 bg-amber-50 text-amber-700',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    desc: 'محاسبه قیمت مقوا، سینگل، E فلوت، زینک و چاپ'
  },
  {
    id: 3,
    key: 'CUSTOMER_PRICE_APPROVAL',
    title: '۳. تایید پیش‌فاکتور توسط مشتری',
    shortName: 'تایید مشتری',
    role: 'sales',
    roleName: 'مشتری / بازرگانی',
    color: 'border-emerald-500 bg-emerald-50 text-emerald-800',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    desc: 'ارائه قیمت به کارفرما، تاییدیه مالی و دریافت بیعانه'
  },
  {
    id: 4,
    key: 'CEO_APPROVAL',
    title: '۴. تایید مدیر عامل',
    shortName: 'تایید مدیرعامل',
    role: 'ceo',
    roleName: 'مدیریت عامل',
    color: 'border-purple-500 bg-purple-50 text-purple-700',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    desc: 'بررسی حاشیه سود و تایید نهایی پیش‌فاکتور'
  },
  {
    id: 5,
    key: 'DESIGN_ASSIGNMENT',
    title: '۵. واحد طراحی و آتلیه',
    shortName: 'طراحی و تیغ',
    role: 'design',
    roleName: 'واحد طراحی',
    color: 'border-indigo-500 bg-indigo-50 text-indigo-700',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    desc: 'طراحی خط تیغ، جانمایی فرم و فایل گرافیکی'
  },
  {
    id: 6,
    key: 'CUSTOMER_DESIGN_APPROVAL',
    title: '۶. تایید طرح توسط مشتری',
    shortName: 'تایید طرح',
    role: 'sales',
    roleName: 'مشتری / بازرگانی',
    color: 'border-teal-500 bg-teal-50 text-teal-700',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    desc: 'تاییدیه نهایی رنگ، متون و فایل طراحی کارفرما'
  },
  {
    id: 7,
    key: 'MOCKUP_PRODUCTION',
    title: '۷. ساخت ماکت فیزیکی',
    shortName: 'ساخت ماکت',
    role: 'mockup',
    roleName: 'واحد ماکت‌سازی',
    color: 'border-orange-500 bg-orange-50 text-orange-700',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    desc: 'برش نمونه با کاترپلاتر و تست استحکام'
  },
  {
    id: 8,
    key: 'CUSTOMER_MOCKUP_APPROVAL',
    title: '۸. تایید ماکت توسط مشتری',
    shortName: 'تایید ماکت',
    role: 'sales',
    roleName: 'مشتری / بازرگانی',
    color: 'border-rose-500 bg-rose-50 text-rose-700',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    desc: 'تایید باز و بست، ابعاد و ایستایی ماکت'
  },
  {
    id: 9,
    key: 'MATERIAL_PURCHASING',
    title: '۹. خرید متریال جعبه',
    shortName: 'خرید متریال',
    role: 'procurement',
    roleName: 'واحد تدارکات',
    color: 'border-cyan-500 bg-cyan-50 text-cyan-700',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    desc: 'تامین مقوا، زینک، رنگ، فلوتینگ و چسب'
  },
  {
    id: 10,
    key: 'PRODUCTION_EXECUTION',
    title: '۱۰. ارجاع به خط تولید و چاپ',
    shortName: 'خط تولید و چاپ',
    role: 'production',
    roleName: 'سرپرست تولید',
    color: 'border-amber-600 bg-amber-50 text-amber-800',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    desc: 'چاپ، لامینت، دایکات، جعبه‌چسبانی و تحویل'
  },
  {
    id: 11,
    key: 'COMPLETED',
    title: 'تکمیل و تحویل بار',
    shortName: 'تکمیل شده',
    role: 'all',
    roleName: 'انبار محصول',
    color: 'border-green-600 bg-green-50 text-green-700',
    badgeColor: 'bg-green-100 text-green-800 border-green-200',
    desc: 'سفارش با موفقیت تولید و تحویل گردید'
  }
];

export const ROLES = [
  { id: 'ceo', name: 'مدیر عامل', desc: 'دسترسی نامحدود به تمامی بخش‌ها و گزارشات کلان', color: 'bg-amber-700', allowedStages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  { id: 'design', name: 'طراحی', desc: 'واحد آتلیه، خط تیغ، تفکیک رنگ و ماکت دیجیتال', color: 'bg-yellow-600', allowedStages: [5] },
  { id: 'sales', name: 'بازرگانی', desc: 'ثبت سفارش، پیش‌فاکتور و تاییدات کارفرما', color: 'bg-purple-600', allowedStages: [1, 3, 6, 8] },
  { id: 'secretary', name: 'مسئول دفتر', desc: 'ثبت اولیه سفارشات، مکاتبات و امور دفتری', color: 'bg-rose-700', allowedStages: [1, 3] },
  { id: 'accounting', name: 'حسابداری', desc: 'استعلام قیمت، بهای تمام شده و نرخ متریال', color: 'bg-sky-700', allowedStages: [2] },
  { id: 'production', name: 'تولید', desc: 'مدیریت سالن چاپ، لامینت، دایکات و جعبه‌چسبانی', color: 'bg-emerald-700', allowedStages: [10] },
  { id: 'outsource', name: 'برونسپاری', desc: 'ماکت‌سازی با کاترپلاتر و خدمات برونسپاری', color: 'bg-pink-700', allowedStages: [7] },
  { id: 'warehouse', name: 'ورود انبار مصرفی', desc: 'تدارکات، ورود مقوا و متریال به انبار', color: 'bg-slate-700', allowedStages: [9] },
  { id: 'marketer', name: 'بازاریاب', desc: 'ثبت استعلام، مشخصات محصول و ارسال به بازرگانی', color: 'bg-teal-600', allowedStages: [] }
];

export const DEPARTMENT_PERMISSIONS = {
  ceo: {
    name: 'مدیریت عامل',
    allowedTabs: ['hub', 'kanban', 'archive', 'new_order', 'my_tasks', 'dashboard', 'materials', 'users', 'calculator', 'subdomain_guide', 'marketing'],
    allowedStages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    canApproveCeo: true,
    canEditMaterials: true,
    canManageUsers: true,
    canCreateOrder: true,
    canViewFinancials: true
  },
  design: {
    name: 'طراحی',
    allowedTabs: ['hub', 'kanban', 'archive', 'my_tasks'],
    allowedStages: [5],
    canApproveCeo: false,
    canEditMaterials: false,
    canManageUsers: false,
    canCreateOrder: false,
    canViewFinancials: false
  },
  sales: {
    name: 'بازرگانی',
    allowedTabs: ['hub', 'kanban', 'archive', 'new_order', 'my_tasks', 'marketing'],
    allowedStages: [1, 3, 6, 8],
    canApproveCeo: false,
    canEditMaterials: false,
    canManageUsers: false,
    canCreateOrder: true,
    canViewFinancials: true
  },
  marketer: {
    name: 'بازاریابی',
    allowedTabs: ['marketing'],
    allowedStages: [],
    canApproveCeo: false,
    canEditMaterials: false,
    canManageUsers: false,
    canCreateOrder: false,
    canViewFinancials: false
  },
  secretary: {
    name: 'مسئول دفتر',
    allowedTabs: ['hub', 'kanban', 'archive', 'new_order', 'my_tasks'],
    allowedStages: [1, 3],
    canApproveCeo: false,
    canEditMaterials: false,
    canManageUsers: false,
    canCreateOrder: true,
    canViewFinancials: false
  },
  accounting: {
    name: 'حسابداری',
    allowedTabs: ['hub', 'kanban', 'archive', 'my_tasks', 'materials', 'calculator'],
    allowedStages: [2],
    canApproveCeo: false,
    canEditMaterials: true,
    canManageUsers: false,
    canCreateOrder: false,
    canViewFinancials: true
  },
  estimation: {
    name: 'برآورد و حسابداری',
    allowedTabs: ['hub', 'kanban', 'archive', 'my_tasks', 'materials', 'calculator'],
    allowedStages: [2],
    canApproveCeo: false,
    canEditMaterials: true,
    canManageUsers: false,
    canCreateOrder: false,
    canViewFinancials: true
  },
  production: {
    name: 'تولید',
    allowedTabs: ['hub', 'kanban', 'archive', 'my_tasks', 'dashboard'],
    allowedStages: [10],
    canApproveCeo: false,
    canEditMaterials: false,
    canManageUsers: false,
    canCreateOrder: false,
    canViewFinancials: false
  },
  outsource: {
    name: 'برونسپاری',
    allowedTabs: ['hub', 'kanban', 'archive', 'my_tasks'],
    allowedStages: [7],
    canApproveCeo: false,
    canEditMaterials: false,
    canManageUsers: false,
    canCreateOrder: false,
    canViewFinancials: false
  },
  mockup: {
    name: 'ماکت‌سازی و برونسپاری',
    allowedTabs: ['hub', 'kanban', 'archive', 'my_tasks'],
    allowedStages: [7],
    canApproveCeo: false,
    canEditMaterials: false,
    canManageUsers: false,
    canCreateOrder: false,
    canViewFinancials: false
  },
  warehouse: {
    name: 'ورود انبار مصرفی',
    allowedTabs: ['hub', 'kanban', 'archive', 'my_tasks', 'materials'],
    allowedStages: [9],
    canApproveCeo: false,
    canEditMaterials: true,
    canManageUsers: false,
    canCreateOrder: false,
    canViewFinancials: false
  },
  procurement: {
    name: 'خرید و انبار',
    allowedTabs: ['hub', 'kanban', 'archive', 'my_tasks', 'materials'],
    allowedStages: [9],
    canApproveCeo: false,
    canEditMaterials: true,
    canManageUsers: false,
    canCreateOrder: false,
    canViewFinancials: false
  }
};

export function canAccessDepartment(userRole, targetRole) {
  if (!userRole) return false;
  if (userRole === 'ceo') return true;
  if (userRole === targetRole) return true;
  if (userRole === 'accounting' && targetRole === 'estimation') return true;
  if (userRole === 'estimation' && targetRole === 'accounting') return true;
  if (userRole === 'outsource' && targetRole === 'mockup') return true;
  if (userRole === 'mockup' && targetRole === 'outsource') return true;
  if (userRole === 'warehouse' && targetRole === 'procurement') return true;
  if (userRole === 'procurement' && targetRole === 'warehouse') return true;
  if (userRole === 'secretary' && targetRole === 'sales') return true;
  if (userRole === 'sales' && targetRole === 'secretary') return true;
  return false;
}

export function canAdvanceStage(userRole, stageNumber) {
  if (!userRole) return false;
  if (userRole === 'ceo') return true;

  const mapping = {
    1: ['sales', 'secretary'],
    2: ['accounting', 'estimation'],
    3: ['sales', 'secretary', 'customer'],
    4: ['ceo'],
    5: ['design'],
    6: ['sales', 'secretary', 'customer'],
    7: ['outsource', 'mockup'],
    8: ['sales', 'secretary', 'customer'],
    9: ['warehouse', 'procurement'],
    10: ['production']
  };

  return mapping[stageNumber]?.includes(userRole) || false;
}

export function formatToman(amount) {
  if (amount === undefined || amount === null) return '۰ تومان';
  const num = Math.round(Number(amount));
  return num.toLocaleString('fa-IR') + ' تومان';
}

export function formatNumber(num) {
  if (num === undefined || num === null) return '۰';
  return Number(num).toLocaleString('fa-IR');
}

export function normalizeSearch(str) {
  if (str === null || str === undefined) return '';
  let s = String(str).toLowerCase().trim();
  s = s.replace(/ي/g, 'ی')
       .replace(/ك/g, 'ک')
       .replace(/ة/g, 'ه')
       .replace(/ؤ/g, 'و')
       .replace(/إ|أ|آ/g, 'ا');
  s = s.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  s = s.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  s = s.replace(/[\u200c\u200b\s]+/g, ' ');
  return s.trim();
}

export function matchProduct(project, searchTerm) {
  if (!project) return false;
  if (!searchTerm || !searchTerm.trim()) return true;

  const term = normalizeSearch(searchTerm);
  if (!term) return true;

  const fields = [
    project.title,
    project.tracking_code,
    project.archive_code,
    project.order_code,
    project.customer_code,
    project.customer_name,
    project.customer_phone,
    project.box_type,
    project.box_structure,
    project.cardboard_type,
    project.cardboard_grammage ? String(project.cardboard_grammage) : '',
    project.print_type,
    project.cellophane_type,
    project.sheet_category,
    project.blade_type,
    project.general_notes,
    project.length_mm ? String(project.length_mm) : '',
    project.width_mm ? String(project.width_mm) : '',
    project.height_mm ? String(project.height_mm) : ''
  ];

  return fields.some((f) => {
    if (f === null || f === undefined) return false;
    return normalizeSearch(f).includes(term);
  });
}

export function formatDateFa(dateStr) {
  if (!dateStr) return '---';
  if (typeof dateStr === 'string' && (dateStr.includes('۱۴۰') || dateStr.includes('140'))) {
    return dateStr;
  }
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch (e) {
    return dateStr;
  }
}

export const BOX_TYPES = [
  'کارتن لمینتی E فلوت',
  'کارتن لمینتی B فلوت',
  'کارتن ۳ لایه C فلوت',
  'کارتن ۵ لایه BC فلوت مادر',
  'جعبه مقوایی ایندربرد بهداشتی',
  'جعبه مقوایی پشت طوسی صنعتی',
  'جعبه کرافت فودگرید فست فود',
  'هارد باکس لوکس مغناطیسی',
  'جعبه کشویی با کاور مقوایی',
  'کارتن پستی کیبوردی خودقفل‌شو'
];

export const BOX_STRUCTURES = [
  'کیبوردی قفل‌دار (Mail-Lock)',
  'درب دارویی ته قفلی (Lock-Bottom)',
  'درب دارویی ساده (Tuck End)',
  'صدفی فست‌فودی هواکش‌دار',
  'جعبه کشویی دو تکه',
  'جعبه تلسکوپی (درب و ته مجزا)',
  'کارتن چهاردرب استاندارد (RSC)',
  'جعبه دسته‌دار فانتزی'
];

// Web Audio API Ding-Dong Notification Sound Generator (100% offline & free)
export function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Tone 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Tone 2: 880 Hz (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.18, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.6);
  } catch (e) {
    // AudioContext blocked by browser autoplay policy
  }
}
