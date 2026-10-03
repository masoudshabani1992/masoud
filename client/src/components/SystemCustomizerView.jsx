import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Type,
  LayoutGrid,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Eye,
  Search,
  Sparkles,
  Layers,
  Users,
  Calculator,
  Kanban,
  Box,
  Fingerprint,
  Bell,
  Award,
  FileSpreadsheet,
  ShieldAlert,
  HardDrive,
  PackageCheck,
  Activity,
  Printer,
  ChevronRight,
  ExternalLink,
  Wand2,
  RefreshCw,
  X
} from 'lucide-react';
import { api } from '../api/client';
import { showToast } from '../utils/helpers';

export const DEFAULT_SYSTEM_TITLES = {
  marketing_header: {
    key: 'marketing_header',
    category: 'marketing',
    title: 'پروفایل و کارتابل پیگیری استعلامات بازاریاب',
    subtitle: 'سامانه رهگیری لحظه‌ای نتیجه استعلام‌ها، مشاهده قیمت‌های اعلام‌شده توسط واحد بازرگانی، ثبت لاگ تماس و پیگیری مشتری، و صدور پیش‌فاکتور رسمی.',
    description: 'عنوان اصلی و توضیحات بالای کارتابل بازاریاب',
    default_title: 'پروفایل و کارتابل پیگیری استعلامات بازاریاب',
    default_subtitle: 'سامانه رهگیری لحظه‌ای نتیجه استعلام‌ها، مشاهده قیمت‌های اعلام‌شده توسط واحد بازرگانی، ثبت لاگ تماس و پیگیری مشتری، و صدور پیش‌فاکتور رسمی.'
  },
  mkt_kpi_card: {
    key: 'mkt_kpi_card',
    category: 'marketing',
    title: 'هدف‌گذاری و تارگت ماهانه بازاریاب',
    subtitle: 'کارشناس بازاریابی و مانیتورینگ تحقق شاخص‌های کلیدی عملکرد (KPI)',
    description: 'کارت تارگت و ارزیابی پیشرفت ماهانه بازاریاب',
    default_title: 'هدف‌گذاری و تارگت ماهانه بازاریاب',
    default_subtitle: 'کارشناس بازاریابی و مانیتورینگ تحقق شاخص‌های کلیدی عملکرد (KPI)'
  },
  mkt_stat_leads: {
    key: 'mkt_stat_leads',
    category: 'marketing',
    title: 'کل استعلام‌ها',
    subtitle: 'موردی ثبت‌شده در این ماه',
    description: 'کارت شمارنده کل استعلام‌های بازاریاب',
    default_title: 'کل استعلام‌ها',
    default_subtitle: 'موردی ثبت‌شده در این ماه'
  },
  mkt_stat_pending: {
    key: 'mkt_stat_pending',
    category: 'marketing',
    title: 'در انتظار برآورد',
    subtitle: 'واحد بازرگانی و مالی',
    description: 'کارت استعلام‌های در حال بررسی قیمت',
    default_title: 'در انتظار برآورد',
    default_subtitle: 'واحد بازرگانی و مالی'
  },
  mkt_stat_ready: {
    key: 'mkt_stat_ready',
    category: 'marketing',
    title: 'قیمت‌گذاری شده',
    subtitle: 'آماده اعلام و صدور پیش‌فاکتور',
    description: 'کارت استعلام‌های آماده پاسخ به مشتری',
    default_title: 'قیمت‌گذاری شده',
    default_subtitle: 'آماده اعلام و صدور پیش‌فاکتور'
  },
  mkt_stat_approved: {
    key: 'mkt_stat_approved',
    category: 'marketing',
    title: 'تایید مشتری',
    subtitle: 'توافق نهایی و آماده تولید',
    description: 'کارت استعلام‌های تاییدشده توسط مشتری',
    default_title: 'تایید مشتری',
    default_subtitle: 'توافق نهایی و آماده تولید'
  },
  mkt_stat_prod: {
    key: 'mkt_stat_prod',
    category: 'marketing',
    title: 'تبدیل به سفارش تولید',
    subtitle: 'ارسال مستقیم به خطوط کارخانه',
    description: 'کارت پروژه‌های در حال تولید کارخانه',
    default_title: 'تبدیل به سفارش تولید',
    default_subtitle: 'ارسال مستقیم به خطوط کارخانه'
  },
  mkt_stat_revenue: {
    key: 'mkt_stat_revenue',
    category: 'marketing',
    title: 'ارزش استعلام‌های تایید شده',
    subtitle: 'مجموع مبالغ تاییدشده ماه',
    description: 'کارت ارزش ریالی فروش بازاریاب',
    default_title: 'ارزش استعلام‌های تایید شده',
    default_subtitle: 'مجموع مبالغ تاییدشده ماه'
  },
  marketing_form: {
    key: 'marketing_form',
    category: 'marketing',
    title: 'فرم ثبت استعلام جدید توسط بازاریاب',
    subtitle: 'اطلاعات مشتری و مشخصات فنی جعبه را وارد فرمایید تا مستقیماً به کارتابل مدیر بازرگانی و ماشین حساب برآورد ارسال گردد.',
    description: 'عنوان و زیرعنوان فرم ثبت استعلام جدید',
    default_title: 'فرم ثبت استعلام جدید توسط بازاریاب',
    default_subtitle: 'اطلاعات مشتری و مشخصات فنی جعبه را وارد فرمایید تا مستقیماً به کارتابل مدیر بازرگانی و ماشین حساب برآورد ارسال گردد.'
  },
  mkt_sec1_title: {
    key: 'mkt_sec1_title',
    category: 'marketing',
    title: '۱. اطلاعات پایه مشتری و محصول',
    subtitle: 'نام مشتری، شماره تماس و مشخصات اصلی محصول',
    description: 'سکشن اول فرم استعلام بازاریابی',
    default_title: '۱. اطلاعات پایه مشتری و محصول',
    default_subtitle: 'نام مشتری، شماره تماس و مشخصات اصلی محصول'
  },
  mkt_sec2_title: {
    key: 'mkt_sec2_title',
    category: 'marketing',
    title: '۲. مشخصات ساختار فیزیکی، متریال، چاپ و تکمیل جعبه',
    subtitle: 'تعیین دسته‌بندی مقوایی، لمینتی یا کارتن و جزییات تخصصی تولید',
    description: 'سکشن دوم فرم مشخصات فنی و چاپ',
    default_title: '۲. مشخصات ساختار فیزیکی، متریال، چاپ و تکمیل جعبه',
    default_subtitle: 'تعیین دسته‌بندی مقوایی، لمینتی یا کارتن و جزییات تخصصی تولید'
  },
  mkt_cardboard_title: {
    key: 'mkt_cardboard_title',
    category: 'marketing',
    title: 'اطلاعات کامل و اختصاصی جعبه مقوایی (Cardboard Specs)',
    subtitle: 'تعیین دقیق گرماژ، متد چاپ، زینک، روکش و تکمیل',
    description: 'هدر مشخصات جعبه مقوایی در فرم استعلام',
    default_title: 'اطلاعات کامل و اختصاصی جعبه مقوایی (Cardboard Specs)',
    default_subtitle: 'تعیین دقیق گرماژ، متد چاپ، زینک، روکش و تکمیل'
  },
  mkt_sec_print: {
    key: 'mkt_sec_print',
    category: 'marketing',
    title: 'مشخصات چاپ افست',
    subtitle: 'انتخاب روش چاپ و تعداد رنگ',
    description: 'سکشن مشخصات چاپ و رنگ‌های افست',
    default_title: 'مشخصات چاپ افست',
    default_subtitle: 'انتخاب روش چاپ و تعداد رنگ'
  },
  mkt_sec_coating: {
    key: 'mkt_sec_coating',
    category: 'marketing',
    title: 'روکش و پوشش چاپ (سلفون / ورنی / لاک / یو وی سیلندری)',
    subtitle: 'انتخاب نوع روکش، براق/مات/طرح‌دار و ضخامت پوشش',
    description: 'سکشن روکش و لایه‌های محافظ چاپ',
    default_title: 'روکش و پوشش چاپ (سلفون / ورنی / لاک / یو وی سیلندری)',
    default_subtitle: 'انتخاب نوع روکش، براق/مات/طرح‌دار و ضخامت پوشش'
  },
  mkt_sec_uv: {
    key: 'mkt_sec_uv',
    category: 'marketing',
    title: 'یو وی موضعی و برجسته (Spot UV & Drip Off)',
    subtitle: 'اعمال جلوه‌های مات و براق شنی و شابلونی بر روی بسته‌بندی',
    description: 'سکشن اختصاصی یووی موضعی',
    default_title: 'یو وی موضعی و برجسته (Spot UV & Drip Off)',
    default_subtitle: 'اعمال جلوه‌های مات و براق شنی و شابلونی بر روی بسته‌بندی'
  },
  mkt_sec_emboss: {
    key: 'mkt_sec_emboss',
    category: 'marketing',
    title: 'برجسته‌کاری (Embossing)',
    subtitle: 'عملیات امباس و برجسته‌سازی لوگو و نوشتار با کلیشه فلزی حرارتی',
    description: 'سکشن اختصاصی برجسته‌کاری',
    default_title: 'برجسته‌کاری (Embossing)',
    default_subtitle: 'عملیات امباس و برجسته‌سازی لوگو و نوشتار با کلیشه فلزی حرارتی'
  },
  mkt_sec_window: {
    key: 'mkt_sec_window',
    category: 'marketing',
    title: 'پنجره طلق‌دار (Window Patching)',
    subtitle: 'پنجره شفاف PVC / PET با ابعاد دقیق طول، عرض و ضخامت',
    description: 'سکشن اختصاصی طلق و پنجره جعبه',
    default_title: 'پنجره طلق‌دار (Window Patching)',
    default_subtitle: 'پنجره شفاف PVC / PET با ابعاد دقیق طول، عرض و ضخامت'
  },
  mkt_sec_glue: {
    key: 'mkt_sec_glue',
    category: 'marketing',
    title: 'چسب و اتصال جعبه (Gluing)',
    subtitle: 'تعیین لب‌چسب، چسب گرم، سرد یا قفل سرخود',
    description: 'سکشن اختصاصی چسب و اتصال جعبه',
    default_title: 'چسب و اتصال جعبه (Gluing)',
    default_subtitle: 'تعیین لب‌چسب، چسب گرم، سرد یا قفل سرخود'
  },
  mkt_sec_foil: {
    key: 'mkt_sec_foil',
    category: 'marketing',
    title: 'فویل و طلاکوب / نقره‌کوب (Hot Foil)',
    subtitle: 'جلوه‌های متالیک براق و هولوگرام با کلیشه حرارتی',
    description: 'سکشن اختصاصی طلاکوب و فویل',
    default_title: 'فویل و طلاکوب / نقره‌کوب (Hot Foil)',
    default_subtitle: 'جلوه‌های متالیک براق و هولوگرام با کلیشه حرارتی'
  },
  mkt_sec3_dimensions: {
    key: 'mkt_sec3_dimensions',
    category: 'marketing',
    title: '۳. ابعاد تقریبی (سانتی‌متر) و توضیحات تکمیلی',
    subtitle: 'طول، عرض، ارتفاع و نکات خاص مورد نیاز مشتری',
    description: 'سکشن ابعاد و توضیحات تکمیلی جعبه',
    default_title: '۳. ابعاد تقریبی (سانتی‌متر) و توضیحات تکمیلی',
    default_subtitle: 'طول، عرض، ارتفاع و نکات خاص مورد نیاز مشتری'
  },
  mkt_sec4_upload: {
    key: 'mkt_sec4_upload',
    category: 'marketing',
    title: '۴. پیوست فایل خط تیغ، قالب یا طرح چاپی (اختیاری)',
    subtitle: 'فرمت‌های مجاز: PDF, AI, CDR, EPS, DXF, SVG, JPG, PNG, ZIP (حداکثر ۲۵ مگابایت)',
    description: 'سکشن آپلود فایل خط تیغ و قالب',
    default_title: '۴. پیوست فایل خط تیغ، قالب یا طرح چاپی (اختیاری)',
    default_subtitle: 'فرمت‌های مجاز: PDF, AI, CDR, EPS, DXF, SVG, JPG, PNG, ZIP (حداکثر ۲۵ مگابایت)'
  },
  calculator_header: {
    key: 'calculator_header',
    category: 'calculator',
    title: 'ماشین‌حساب هوشمند و صنعتی برآورد قیمت جعبه و کارتن',
    subtitle: 'محاسبه دقیق و خودکار هزینه‌های مقوا، چاپ، روکش، تیغ، قالب، لترپرس، لب‌چسب و مارژین سود خالص',
    description: 'عنوان و توضیحات صفحه ماشین‌حساب قیمت',
    default_title: 'ماشین‌حساب هوشمند و صنعتی برآورد قیمت جعبه و کارتن',
    default_subtitle: 'محاسبه دقیق و خودکار هزینه‌های مقوا، چاپ، روکش، تیغ، قالب، لترپرس، لب‌چسب و مارژین سود خالص'
  },
  dashboard_header: {
    key: 'dashboard_header',
    category: 'dashboard',
    title: 'داشبورد و آمار تحلیلی مانیتورینگ کارخانه',
    subtitle: 'پایش شاخص‌های کلیدی عملکرد (KPI)، میزان فروش ماهانه، سفارشات فعال و راندمان خطوط تولید',
    description: 'عنوان بالای صفحه داشبورد مدیریتی',
    default_title: 'داشبورد و آمار تحلیلی مانیتورینگ کارخانه',
    default_subtitle: 'پایش شاخص‌های کلیدی عملکرد (KPI)، میزان فروش ماهانه، سفارشات فعال و راندمان خطوط تولید'
  },
  workflow_header: {
    key: 'workflow_header',
    category: 'workflow',
    title: 'گردش کار ۱۰ مرحله تولید صنعتی و کانبان خطوط',
    subtitle: 'جریان پیوسته و هوشمند سفارشات از استعلام تا تحویل نهایی با پایپ‌لاین گرافیکی و نودهای تعاملی',
    description: 'عنوان صفحه گردش کار و کانبان',
    default_title: 'گردش کار ۱۰ مرحله تولید صنعتی و کانبان خطوط',
    default_subtitle: 'جریان پیوسته و هوشمند سفارشات از استعلام تا تحویل نهایی با پایپ‌لاین گرافیکی و نودهای تعاملی'
  },
  production_header: {
    key: 'production_header',
    category: 'production',
    title: 'کارتابل دستورات تولید و کارت‌های کارگاهی',
    subtitle: 'سیستم ۴ رنگی کنترل وضعیت، صدور کارت کار، برنامه چاپ افست، دیجیتال و خدمات تکمیلی',
    description: 'عنوان صفحه کارتابل تولید',
    default_title: 'کارتابل دستورات تولید و کارت‌های کارگاهی',
    default_subtitle: 'سیستم ۴ رنگی کنترل وضعیت، صدور کارت کار، برنامه چاپ افست، دیجیتال و خدمات تکمیلی'
  },
  warehouse_header: {
    key: 'warehouse_header',
    category: 'warehouse',
    title: 'سامانه هوشمند مدیریت انبارهای شش‌گانه متریال',
    subtitle: 'پایش لحظه‌ای موجودی و حواله‌های انبار مقوا، ورق کارتن، سینگل‌فلوت، سلفون، طلق PVC و مرکب چاپ',
    description: 'عنوان صفحه انبارهای متریال',
    default_title: 'سامانه هوشمند مدیریت انبارهای شش‌گانه متریال',
    default_subtitle: 'پایش لحظه‌ای موجودی و حواله‌های انبار مقوا، ورق کارتن، سینگل‌فلوت، سلفون، طلق PVC و مرکب چاپ'
  },
  studio_header: {
    key: 'studio_header',
    category: 'studio',
    title: 'استودیو طراحی امیران، گسترده دایکات و ماک‌آپ سه‌بعدی',
    subtitle: 'طراحی پارامتریک خط تیغ ۲۲ قالب استاندارد، چیدمان بهینه شیت و خروجی مستقیم CorelDRAW و Illustrator',
    description: 'عنوان استودیو طراحی و قالب‌سازی',
    default_title: 'استودیو طراحی امیران، گسترده دایکات و ماک‌آپ سه‌بعدی',
    default_subtitle: 'طراحی پارامتریک خط تیغ ۲۲ قالب استاندارد، چیدمان بهینه شیت و خروجی مستقیم CorelDRAW و Illustrator'
  },
  ai_header: {
    key: 'ai_header',
    category: 'ai',
    title: 'دستیار هوشمند بسته‌بندی و پیش‌پرواز تولید',
    subtitle: 'استخراج هوشمند مشخصات استعلام با پردازش زبان طبیعی (NLP)، بهینه‌سازی شیت چاپی و عیب‌یابی فنی',
    description: 'عنوان دستیار هوش مصنوعی',
    default_title: 'دستیار هوشمند بسته‌بندی و پیش‌پرواز تولید',
    default_subtitle: 'استخراج هوشمند مشخصات استعلام با پردازش زبان طبیعی (NLP)، بهینه‌سازی شیت چاپی و عیب‌یابی فنی'
  },
  hr_header: {
    key: 'hr_header',
    category: 'hr',
    title: 'ارزیابی عملکرد پرسنل و پرونده دیجیتال کارگزینی',
    subtitle: 'سیستم ۵ محوره ارزیابی ماهانه، مانیتورینگ تارگت‌های بازاریابی و پاداش بهره‌وری منابع انسانی',
    description: 'عنوان ماژول منابع انسانی HR',
    default_title: 'ارزیابی عملکرد پرسنل و پرونده دیجیتال کارگزینی',
    default_subtitle: 'سیستم ۵ محوره ارزیابی ماهانه، مانیتورینگ تارگت‌های بازاریابی و پاداش بهره‌وری منابع انسانی'
  },
  app_branding: {
    key: 'app_branding',
    category: 'branding',
    title: 'شرکت آرمان امیران',
    subtitle: 'اتوماسیون تولید (MIS)',
    description: 'برندینگ سربرگ و هدر اصلی سامانه',
    default_title: 'شرکت آرمان امیران',
    default_subtitle: 'اتوماسیون تولید (MIS)'
  }
};

export const DEFAULT_SYSTEM_FEATURES = [
  { id: 'feat_marketing', category: 'marketing', name: 'کارتابل استعلامات بازاریابی', title: 'ثبت، پیگیری و صدور پیش‌فاکتور استعلامات', description: 'مدیریت لیدها، تعیین مشخصات فنی متریال و پیگیری لحظه‌ای قیمت‌ها', icon: 'Users', badge: 'استعلام', color: 'emerald', is_enabled: 1, sort_order: 1 },
  { id: 'feat_calculator', category: 'marketing', name: 'ماشین‌حساب برآورد قیمت', title: 'فرمولاسیون هوشمند بهای تمام‌شده', description: 'محاسبه هزینه‌های مقوا، چاپ، زینک، روکش، قالب و سود خالص', icon: 'Calculator', badge: 'مالی', color: 'teal', is_enabled: 1, sort_order: 2 },
  { id: 'feat_production_orders', category: 'production', name: 'دستور تولید صنعتی (افست و دیجیتال)', title: 'کارت‌های کارگاهی و برنامه تولید', description: 'کنترل ۴ رنگی وضعیت چاپ، صدور حواله تولید و کارت فرآیند', icon: 'Layers', badge: '۳ رنگ', color: 'indigo', is_enabled: 1, sort_order: 3 },
  { id: 'feat_warehouse', category: 'warehouse', name: 'انبارداری شش‌گانه متریال', title: 'مدیریت و کنترل موجودی انبارها', description: 'انبار مقوا، ورق کارتن، سینگل، سلفون، طلق PVC و مرکب چاپ', icon: 'PackageCheck', badge: '۶ بخش', color: 'amber', is_enabled: 1, sort_order: 4 },
  { id: 'feat_workflow_kanban', category: 'workflow', name: 'گردش کار ۱۰ مرحله و کانبان', title: 'پایش و رهگیری خطوط تولید کارخانه', description: 'تابلوی تعاملی کانبان با ۱۰ مرحله استاندارد تولید جعبه و کارتن', icon: 'Kanban', badge: '۱۰ مرحله', color: 'purple', is_enabled: 1, sort_order: 5 },
  { id: 'feat_n8n_pipeline', category: 'workflow', name: 'پایپ‌لاین تعاملی گرافیکی n8n', title: 'نمای شبکه نودها و اتصالات نوری', description: 'شبیه‌ساز بصری جریان سفارشات با کابل‌های نورانی و انیمیشن زنده', icon: 'Activity', badge: 'گرافیکی', color: 'violet', is_enabled: 1, sort_order: 6 },
  { id: 'feat_dieline_studio', category: 'studio', name: 'استودیو طراحی ۲D و ۳D امیران', title: 'طراحی پارامتریک خط تیغ و ماک‌آپ ۳بعدی', description: '۲۲ قالب استاندارد، تاخوردگی ۳D، چیدمان شیت و خروجی CorelDRAW و AI', icon: 'Box', badge: '3D/CAD', color: 'amber', is_enabled: 1, sort_order: 7 },
  { id: 'feat_ai_assistant', category: 'ai', name: 'دستیار هوش مصنوعی و بهینه‌ساز شیت', title: 'پردازش متن استعلام و چیدمان شیت چاپی', description: 'استخراج هوشمند متریال و ابعاد با NLP و حداقل‌سازی پرت مقوا', icon: 'Sparkles', badge: 'AI', color: 'fuchsia', is_enabled: 1, sort_order: 8 },
  { id: 'feat_biometric', category: 'security', name: 'ورود بیومتریک و اثر انگشت', title: 'احراز هویت سریع با اثر انگشت و چهره', description: 'پشتیبانی از سنسورهای Touch ID، Windows Hello و اثر انگشت گوشی', icon: 'Fingerprint', badge: 'Touch ID', color: 'cyan', is_enabled: 1, sort_order: 9 },
  { id: 'feat_bale_sms', category: 'notifications', name: 'اطلاع‌رسانی بله و پیامک مشتری', title: 'ارسال خودکار پیام به پرسنل و مشتریان', description: 'اتصال به روبات پیام‌رسان بله و سامانه پیامک ملی‌پیامک در ۳ گام کلیدی', icon: 'Bell', badge: 'پیام‌رسان', color: 'rose', is_enabled: 1, sort_order: 10 },
  { id: 'feat_hr_evaluation', category: 'hr', name: 'ارزیابی عملکرد پرسنل و تارگت ماهانه', title: 'پرونده کارگزینی و شاخص‌های KPI', description: 'ارزیابی ۵ محوره ماهانه و تارگت‌های اختصاصی بازاریابان با لیدربرد', icon: 'Award', badge: 'HR', color: 'orange', is_enabled: 1, sort_order: 11 },
  { id: 'feat_excel_migration', category: 'data', name: 'انتقال اطلاعات و ایمپورت اکسل', title: 'ورود سریع داده‌های اتوماسیون قدیمی', description: 'ایمپورت فایل‌های اکسل، CSV و پشتیبان‌های داده‌ای به پایگاه داده', icon: 'FileSpreadsheet', badge: 'اکسل', color: 'blue', is_enabled: 1, sort_order: 12 },
  { id: 'feat_activity_logs', category: 'security', name: 'لاگ و ممیزی فعالیت کاربران', title: 'ردیابی و بایگانی کلیه اقدامات سیستم', description: 'ثبت زمان، آی‌پی، کاربر و جزییات تغییرات سفارشات و دسترسی‌ها', icon: 'ShieldAlert', badge: 'Admin', color: 'slate', is_enabled: 1, sort_order: 13 }
];

export default function SystemCustomizerView({ onShowToast, currentUser }) {
  const notify = (msg, type = 'success') => {
    if (typeof onShowToast === 'function') {
      onShowToast(msg, type);
    } else {
      showToast(msg, { type });
    }
  };

  const [activeTab, setActiveTab] = useState('titles'); // 'titles' | 'features'
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Titles state with full robust defaults
  const [titles, setTitles] = useState(DEFAULT_SYSTEM_TITLES);
  const [editedTitles, setEditedTitles] = useState(DEFAULT_SYSTEM_TITLES);
  const [titleCategoryFilter, setTitleCategoryFilter] = useState('all');

  // Features state with full robust defaults
  const [features, setFeatures] = useState(DEFAULT_SYSTEM_FEATURES);
  const [featureSearch, setFeatureSearch] = useState('');
  const [featureCategoryFilter, setFeatureCategoryFilter] = useState('all');
  
  // Modals
  const [showAddFeatureModal, setShowAddFeatureModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [newFeature, setNewFeature] = useState({
    id: '',
    name: '',
    title: '',
    description: '',
    category: 'marketing',
    icon: 'Sparkles',
    badge: 'جدید',
    color: 'emerald',
    is_enabled: 1,
    sort_order: 20
  });

  const categories = [
    { id: 'all', label: 'همه بخش‌ها' },
    { id: 'marketing', label: 'استعلام و بازاریابی' },
    { id: 'calculator', label: 'ماشین‌حساب و مالی' },
    { id: 'production', label: 'دستور تولید و کارگاه' },
    { id: 'warehouse', label: 'انبارداری متریال' },
    { id: 'workflow', label: 'گردش کار و کانبان' },
    { id: 'studio', label: 'استودیو و طراحی' },
    { id: 'ai', label: 'هوش مصنوعی' },
    { id: 'hr', label: 'منابع انسانی HR' },
    { id: 'branding', label: 'برندینگ و سربرگ' }
  ];

  const iconOptions = [
    { id: 'Sparkles', label: 'درخشش / هوش مصنوعی' },
    { id: 'Users', label: 'کاربران / بازاریابی' },
    { id: 'Calculator', label: 'ماشین‌حساب / مالی' },
    { id: 'Layers', label: 'لایه‌ها / چاپ و تولید' },
    { id: 'Kanban', label: 'کانبان / گردش کار' },
    { id: 'Box', label: 'جعبه / استودیو ۳D' },
    { id: 'PackageCheck', label: 'انبارداری / کارتن' },
    { id: 'Fingerprint', label: 'بیومتریک / امنیت' },
    { id: 'Bell', label: 'اعلان / پیام‌رسان' },
    { id: 'Award', label: 'ارزیابی / مدال' },
    { id: 'FileSpreadsheet', label: 'اکسل / داده‌ها' },
    { id: 'ShieldAlert', label: 'لاگ و ممیزی' },
    { id: 'Sliders', label: 'تنظیمات / اسلایدر' }
  ];

  const colorOptions = [
    { id: 'emerald', label: 'سبز زمردی (Emerald)', bg: 'bg-emerald-500', text: 'text-emerald-700' },
    { id: 'teal', label: 'فیروزه‌ای (Teal)', bg: 'bg-teal-500', text: 'text-teal-700' },
    { id: 'indigo', label: 'نیلی (Indigo)', bg: 'bg-indigo-500', text: 'text-indigo-700' },
    { id: 'purple', label: 'بنفش (Purple)', bg: 'bg-purple-500', text: 'text-purple-700' },
    { id: 'amber', label: 'کهربایی (Amber)', bg: 'bg-amber-500', text: 'text-amber-700' },
    { id: 'fuchsia', label: 'سرخابی (Fuchsia)', bg: 'bg-fuchsia-500', text: 'text-fuchsia-700' },
    { id: 'rose', label: 'رز (Rose)', bg: 'bg-rose-500', text: 'text-rose-700' },
    { id: 'cyan', label: 'آبی فیروزه‌ای (Cyan)', bg: 'bg-cyan-500', text: 'text-cyan-700' },
    { id: 'slate', label: 'خاکستری تیره (Slate)', bg: 'bg-slate-700', text: 'text-slate-700' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [titlesRes, featuresRes] = await Promise.all([
        api.getUiTitles().catch(() => null),
        api.getFeaturesConfig().catch(() => null)
      ]);

      if (titlesRes?.titles && Object.keys(titlesRes.titles).length > 0) {
        const mergedTitles = { ...DEFAULT_SYSTEM_TITLES, ...titlesRes.titles };
        setTitles(mergedTitles);
        setEditedTitles(JSON.parse(JSON.stringify(mergedTitles)));
      } else {
        setTitles(DEFAULT_SYSTEM_TITLES);
        setEditedTitles(DEFAULT_SYSTEM_TITLES);
      }

      if (Array.isArray(featuresRes?.features) && featuresRes.features.length > 0) {
        setFeatures(featuresRes.features);
      } else {
        setFeatures(DEFAULT_SYSTEM_FEATURES);
      }
    } catch (err) {
      console.warn('Using default customizer state fallback:', err);
    }
  };

  const handleTitleChange = (key, field, value) => {
    setEditedTitles(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const handleSaveSingleTitle = async (key) => {
    const item = editedTitles[key];
    if (!item) return;

    setSaving(true);
    try {
      await api.updateUiTitle(key, {
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        category: item.category
      });

      setTitles(prev => ({ ...prev, [key]: item }));
      notify(`عنوان و متن بخش «${item.description || item.title}» با موفقیت ذخیره شد.`, 'success');
    } catch (err) {
      notify('خطا در ذخیره عنوان: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAllTitles = async () => {
    setSaving(true);
    try {
      await api.batchUpdateUiTitles(editedTitles);
      setTitles(JSON.parse(JSON.stringify(editedTitles)));
      notify('کلیه عناوین و متون بخش‌های سامانه با موفقیت در سیستم ذخیره شدند.', 'success');
    } catch (err) {
      notify('خطا در ذخیره دسته‌جمعی عناوین: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSingleTitle = (key) => {
    const orig = DEFAULT_SYSTEM_TITLES[key] || titles[key];
    if (!orig) return;
    setEditedTitles(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        title: orig.default_title || orig.title,
        subtitle: orig.default_subtitle || orig.subtitle
      }
    }));
  };

  const handleResetAllTitles = async () => {
    if (!window.confirm('آیا از بازنشانی کلیه عناوین و متون صفحات به تنظیمات پیش‌فرض کارخانه اطمینان دارید؟')) {
      return;
    }
    setSaving(true);
    try {
      await api.resetUiTitles();
      setTitles(DEFAULT_SYSTEM_TITLES);
      setEditedTitles(JSON.parse(JSON.stringify(DEFAULT_SYSTEM_TITLES)));
      notify('تمامی عناوین به متون پیش‌فرض کارخانه بازنشانی شدند.', 'success');
    } catch (err) {
      notify('خطا در بازنشانی عناوین: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFeature = async (id, currentName) => {
    try {
      const res = await api.toggleFeature(id);
      setFeatures(prev => prev.map(f => f.id === id ? { ...f, is_enabled: res.is_enabled } : f));
      notify(`قابلیت «${currentName}» با موفقیت ${res.is_enabled === 1 ? 'فعال' : 'غیرفعال'} شد.`, 'info');
    } catch (err) {
      // Optimistic local toggle
      setFeatures(prev => prev.map(f => f.id === id ? { ...f, is_enabled: f.is_enabled === 1 ? 0 : 1 } : f));
      notify(`وضعیت ماژول «${currentName}» به‌روزرسانی شد.`, 'info');
    }
  };

  const handleDeleteFeature = async (id, name) => {
    if (!window.confirm(`آیا از حذف ماژول «${name}» اطمینان دارید؟`)) return;
    try {
      await api.deleteFeature(id);
      setFeatures(prev => prev.filter(f => f.id !== id));
      notify(`ماژول «${name}» با موفقیت حذف شد.`, 'success');
    } catch (err) {
      setFeatures(prev => prev.filter(f => f.id !== id));
      notify(`ماژول «${name}» حذف شد.`, 'success');
    }
  };

  const handleSaveFeature = async (featureData) => {
    setSaving(true);
    try {
      await api.createOrUpdateFeature(featureData);
      await loadData();
      setShowAddFeatureModal(false);
      setEditingFeature(null);
      notify(`ماژول «${featureData.name}» با موفقیت ذخیره شد.`, 'success');
    } catch (err) {
      // Local optimistic update
      setFeatures(prev => {
        const idx = prev.findIndex(f => f.id === featureData.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = featureData;
          return updated;
        }
        return [...prev, featureData];
      });
      setShowAddFeatureModal(false);
      setEditingFeature(null);
      notify(`ماژول «${featureData.name}» ذخیره شد.`, 'success');
    } finally {
      setSaving(false);
    }
  };

  const handleResetFeatures = async () => {
    if (!window.confirm('آیا از بازنشانی کلیه قابلیت‌ها و ماژول‌ها به حالت اولیه کارخانه اطمینان دارید؟')) {
      return;
    }
    setSaving(true);
    try {
      await api.resetFeaturesConfig();
      setFeatures(DEFAULT_SYSTEM_FEATURES);
      notify('لیست ماژول‌ها و قابلیت‌ها به حالت پیش‌فرض کارخانه بازنشانی شد.', 'success');
    } catch (err) {
      setFeatures(DEFAULT_SYSTEM_FEATURES);
      notify('لیست ماژول‌ها بازنشانی شد.', 'success');
    } finally {
      setSaving(false);
    }
  };

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'Users': return <Users className="w-5 h-5" />;
      case 'Calculator': return <Calculator className="w-5 h-5" />;
      case 'Layers': return <Layers className="w-5 h-5" />;
      case 'Kanban': return <Kanban className="w-5 h-5" />;
      case 'Box': return <Box className="w-5 h-5" />;
      case 'PackageCheck': return <PackageCheck className="w-5 h-5" />;
      case 'Fingerprint': return <Fingerprint className="w-5 h-5" />;
      case 'Bell': return <Bell className="w-5 h-5" />;
      case 'Award': return <Award className="w-5 h-5" />;
      case 'FileSpreadsheet': return <FileSpreadsheet className="w-5 h-5" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5" />;
      case 'Printer': return <Printer className="w-5 h-5" />;
      default: return <Sliders className="w-5 h-5" />;
    }
  };

  const filteredTitleKeys = Object.keys(editedTitles).filter(k => {
    if (titleCategoryFilter === 'all') return true;
    return editedTitles[k]?.category === titleCategoryFilter;
  });

  const filteredFeatures = features.filter(f => {
    const matchesCat = featureCategoryFilter === 'all' || f.category === featureCategoryFilter;
    const matchesSearch = !featureSearch.trim() || 
      (f.name && f.name.toLowerCase().includes(featureSearch.toLowerCase())) ||
      (f.title && f.title.toLowerCase().includes(featureSearch.toLowerCase())) ||
      (f.description && f.description.toLowerCase().includes(featureSearch.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20 animate-fade-in" dir="rtl">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl text-white">
        <div className="absolute top-0 left-0 -translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 translate-x-12 translate-y-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30">
              <Wand2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white">مدیریت عناوین، ماژول‌ها و قابلیت‌های سامانه</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  انحصاری مدیر ارشد سیستم
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-100/80 mt-1 max-w-2xl leading-relaxed">
                شخصی‌سازی زنده عناوین صفحات، زیرعنوان‌ها، متون راهنما، و همچنین کم و زیاد کردن، تغییر نام و فعال/غیرفعال‌سازی ماژول‌های سامانه ERP کارخانه
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {activeTab === 'titles' && (
              <button
                onClick={handleSaveAllTitles}
                disabled={saving}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'در حال ذخیره‌سازی...' : 'ذخیره کلیه عناوین'}</span>
              </button>
            )}

            {activeTab === 'features' && (
              <button
                onClick={() => {
                  setNewFeature({
                    id: `feat_${Date.now()}`,
                    name: '',
                    title: '',
                    description: '',
                    category: 'marketing',
                    icon: 'Sparkles',
                    badge: 'جدید',
                    color: 'indigo',
                    is_enabled: 1,
                    sort_order: features.length + 1
                  });
                  setShowAddFeatureModal(true);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ افزودن ماژول / قابلیت جدید</span>
              </button>
            )}

            <button
              onClick={activeTab === 'titles' ? handleResetAllTitles : handleResetFeatures}
              disabled={saving}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
              title="بازنشانی به تنظیمات پیش‌فرض کارخانه"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>بازنشانی پیش‌فرض</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Tab Navigation Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('titles')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
            activeTab === 'titles'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>۱. مدیریت عناوین، سربرگ‌ها و متون صفحات</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeTab === 'titles' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {Object.keys(editedTitles).length} بخش
          </span>
        </button>

        <button
          onClick={() => setActiveTab('features')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
            activeTab === 'features'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>۲. مدیریت ماژول‌ها و قابلیت‌های سامانه (کم و زیاد کردن)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeTab === 'features' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {features.length} ماژول
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EDIT PAGE TITLES & SUBTITLES                                       */}
      {/* ========================================================================= */}
      {activeTab === 'titles' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setTitleCategoryFilter(c.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  titleCategoryFilter === c.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Titles Grid */}
          <div className="grid grid-cols-1 gap-6">
            {filteredTitleKeys.map(key => {
              const item = editedTitles[key] || DEFAULT_SYSTEM_TITLES[key] || {};
              const original = titles[key] || DEFAULT_SYSTEM_TITLES[key] || {};
              const isModified = item.title !== original.title || item.subtitle !== original.subtitle;

              return (
                <div
                  key={key}
                  className={`bg-white rounded-3xl border ${
                    isModified ? 'border-indigo-400 ring-2 ring-indigo-50 shadow-md' : 'border-slate-200'
                  } p-6 space-y-5 transition-all`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                        <Type className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-800">{item.description || item.title || key}</h3>
                        <span className="text-[11px] font-mono text-slate-400">کلید سیستمی: {key}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isModified && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                          تغییرات ذخیره‌نشده
                        </span>
                      )}
                      <button
                        onClick={() => handleResetSingleTitle(key)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition text-xs flex items-center gap-1"
                        title="بازنشانی این بخش به متن پیش‌فرض"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold">پیش‌فرض</span>
                      </button>
                      <button
                        onClick={() => handleSaveSingleTitle(key)}
                        disabled={saving}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>ذخیره این بخش</span>
                      </button>
                    </div>
                  </div>

                  {/* Live Visual Preview Box */}
                  <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 p-4 text-white space-y-1.5 shadow-inner border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        پیش‌نمایش زنده در سامانه (Live Preview):
                      </span>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-400/30">
                        {item.category || 'عمومی'}
                      </span>
                    </div>
                    <h2 className="text-base font-black text-white">{item.title || '(بدون عنوان)'}</h2>
                    <p className="text-xs text-indigo-100/80 leading-relaxed max-w-3xl">
                      {item.subtitle || '(بدون توضیحات و زیرعنوان)'}
                    </p>
                  </div>

                  {/* Input Form Fields */}
                  <div className="grid grid-cols-1 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        عنوان اصلی صفحه / بخش (Title): <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) => handleTitleChange(key, 'title', e.target.value)}
                        placeholder="مثال: پروفایل و کارتابل پیگیری استعلامات بازاریاب"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-black text-slate-800 focus:outline-none focus:border-indigo-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        زیرعنوان و متن توضیحات کامل (Subtitle / Description):
                      </label>
                      <textarea
                        rows={2}
                        value={item.subtitle || ''}
                        onChange={(e) => handleTitleChange(key, 'subtitle', e.target.value)}
                        placeholder="مثال: سامانه رهگیری لحظه‌ای نتیجه استعلام‌ها، مشاهده قیمت‌های اعلام‌شده توسط واحد بازرگانی..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-indigo-500 text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FEATURES & MODULES MANAGER (کم و زیاد کردن قابلیت‌ها)              */}
      {/* ========================================================================= */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={featureSearch}
                onChange={(e) => setFeatureSearch(e.target.value)}
                placeholder="جستجو در نام و توضیحات ماژول‌ها..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-4 py-2 font-bold text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setFeatureCategoryFilter(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                    featureCategoryFilter === c.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredFeatures.map(feat => {
              const isEnabled = feat.is_enabled === 1 || feat.is_enabled === true;

              return (
                <div
                  key={feat.id}
                  className={`rounded-3xl border bg-white p-5 space-y-4 transition-all relative overflow-hidden flex flex-col justify-between ${
                    isEnabled ? 'border-slate-200 shadow-2xs hover:shadow-md' : 'border-slate-200 opacity-60 bg-slate-50/70'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md ${
                          feat.color === 'emerald' ? 'bg-gradient-to-tr from-emerald-500 to-teal-600' :
                          feat.color === 'teal' ? 'bg-gradient-to-tr from-teal-500 to-cyan-600' :
                          feat.color === 'indigo' ? 'bg-gradient-to-tr from-indigo-500 to-purple-600' :
                          feat.color === 'purple' ? 'bg-gradient-to-tr from-purple-500 to-pink-600' :
                          feat.color === 'amber' ? 'bg-gradient-to-tr from-amber-500 to-orange-600' :
                          feat.color === 'fuchsia' ? 'bg-gradient-to-tr from-fuchsia-500 to-rose-600' :
                          feat.color === 'rose' ? 'bg-gradient-to-tr from-rose-500 to-red-600' :
                          feat.color === 'cyan' ? 'bg-gradient-to-tr from-cyan-500 to-blue-600' :
                          'bg-gradient-to-tr from-slate-700 to-slate-900'
                        }`}>
                          {getIconComponent(feat.icon)}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-black text-slate-800">{feat.name}</h4>
                            {feat.badge && (
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                {feat.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-slate-400 block mt-0.5">{feat.title}</span>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        onClick={() => handleToggleFeature(feat.id, feat.name)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 shrink-0 ${
                          isEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                        title={isEnabled ? 'ماژول فعال است - کلیک جهت غیرفعال‌سازی' : 'ماژول غیرفعال است - کلیک جهت فعال‌سازی'}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                          isEnabled ? 'translate-x-0' : '-translate-x-5'
                        }`} />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {feat.description || 'بدون توضیحات تکمیلی'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-slate-400">شناسه: {feat.id}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingFeature(feat);
                        }}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="ویرایش مشخصات ماژول"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFeature(feat.id, feat.name)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        title="حذف ماژول"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT FEATURE                                                 */}
      {/* ========================================================================= */}
      {(showAddFeatureModal || editingFeature) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scale-up text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black">
                  <Sliders className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-800">
                  {editingFeature ? 'ویرایش مشخصات ماژول' : 'افزودن ماژول / قابلیت جدید به سامانه'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddFeatureModal(false);
                  setEditingFeature(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  نام اصلی قابلیت / ماژول: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingFeature ? editingFeature.name : newFeature.name}
                  onChange={(e) => {
                    if (editingFeature) setEditingFeature({ ...editingFeature, name: e.target.value });
                    else setNewFeature({ ...newFeature, name: e.target.value });
                  }}
                  placeholder="مثال: ماشین‌حساب برآورد قیمت پیشرفته"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 font-bold text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  عنوان فرعی / زیرعنوان:
                </label>
                <input
                  type="text"
                  value={editingFeature ? editingFeature.title : newFeature.title}
                  onChange={(e) => {
                    if (editingFeature) setEditingFeature({ ...editingFeature, title: e.target.value });
                    else setNewFeature({ ...newFeature, title: e.target.value });
                  }}
                  placeholder="مثال: فرمولاسیون دقیق بهای تمام‌شده و سود خالص"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 font-bold text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  توضیحات عملکرد قابلیت:
                </label>
                <textarea
                  rows={2}
                  value={editingFeature ? editingFeature.description : newFeature.description}
                  onChange={(e) => {
                    if (editingFeature) setEditingFeature({ ...editingFeature, description: e.target.value });
                    else setNewFeature({ ...newFeature, description: e.target.value });
                  }}
                  placeholder="توضیحات کوتاه در مورد این قابلیت..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 font-bold text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">دسته‌بندی:</label>
                  <select
                    value={editingFeature ? editingFeature.category : newFeature.category}
                    onChange={(e) => {
                      if (editingFeature) setEditingFeature({ ...editingFeature, category: e.target.value });
                      else setNewFeature({ ...newFeature, category: e.target.value });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {categories.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">آیکون:</label>
                  <select
                    value={editingFeature ? editingFeature.icon : newFeature.icon}
                    onChange={(e) => {
                      if (editingFeature) setEditingFeature({ ...editingFeature, icon: e.target.value });
                      else setNewFeature({ ...newFeature, icon: e.target.value });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {iconOptions.map(io => (
                      <option key={io.id} value={io.id}>{io.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رنگ زمینه:</label>
                  <select
                    value={editingFeature ? editingFeature.color : newFeature.color}
                    onChange={(e) => {
                      if (editingFeature) setEditingFeature({ ...editingFeature, color: e.target.value });
                      else setNewFeature({ ...newFeature, color: e.target.value });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {colorOptions.map(co => (
                      <option key={co.id} value={co.id}>{co.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">برچسب / بج (Badge):</label>
                  <input
                    type="text"
                    value={editingFeature ? editingFeature.badge : newFeature.badge}
                    onChange={(e) => {
                      if (editingFeature) setEditingFeature({ ...editingFeature, badge: e.target.value });
                      else setNewFeature({ ...newFeature, badge: e.target.value });
                    }}
                    placeholder="مثال: ویژه / ۳ رنگ"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowAddFeatureModal(false);
                  setEditingFeature(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={() => {
                  if (editingFeature) handleSaveFeature(editingFeature);
                  else handleSaveFeature(newFeature);
                }}
                disabled={saving}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'در حال ذخیره...' : 'ذخیره ماژول'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
