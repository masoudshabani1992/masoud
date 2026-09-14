import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';
import {
  UploadCloud,
  FileSpreadsheet,
  Database,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Download,
  Trash2,
  RefreshCw,
  FileText,
  Users,
  Boxes,
  Layers,
  Sparkles,
  HelpCircle,
  ClipboardPaste,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function DataMigrationView({ onRefreshData }) {
  const [activeSubTab, setActiveSubTab] = useState('excel_import');
  const [importType, setImportType] = useState('projects'); // 'projects', 'customers', 'materials'
  const [overwrite, setOverwrite] = useState(true);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState([]);
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [rawSheets, setRawSheets] = useState({});
  const [pasteText, setPasteText] = useState('');
  const [stats, setStats] = useState({ customersCount: 0, projectsCount: 0, materialsCount: 0 });
  const [resultMessage, setResultMessage] = useState(null);
  const fileInputRef = useRef(null);

  const fetchStats = async () => {
    try {
      const [projRes, custRes, matRes] = await Promise.all([
        api.getProjects(),
        api.getCustomers().catch(() => ({ customers: [] })),
        api.getMaterials().catch(() => ({ materials: [] }))
      ]);
      setStats({
        projectsCount: projRes.projects?.length || 0,
        customersCount: custRes.customers?.length || 0,
        materialsCount: matRes.materials?.length || 0
      });
    } catch (err) {
      console.error('Error fetching migration stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Handle file selection and parse
  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setResultMessage(null);
    setParsing(true);

    try {
      const res = await api.parseMigrationFile(selected);
      if (res.success && res.sheets) {
        setRawSheets(res.sheets);
        const names = res.sheetNames || Object.keys(res.sheets);
        setSheetNames(names);
        if (names.length > 0) {
          const firstSheet = names[0];
          setSelectedSheet(firstSheet);
          setParsedData(res.sheets[firstSheet] || []);
        }
      }
    } catch (err) {
      // Fallback: Parse client-side using XLSX
      try {
        const data = await selected.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const names = workbook.SheetNames;
        setSheetNames(names);
        const sheetsObj = {};
        names.forEach(sn => {
          sheetsObj[sn] = XLSX.utils.sheet_to_json(workbook.Sheets[sn], { defval: '' });
        });
        setRawSheets(sheetsObj);
        if (names.length > 0) {
          setSelectedSheet(names[0]);
          setParsedData(sheetsObj[names[0]] || []);
        }
      } catch (clientErr) {
        setResultMessage({ type: 'error', text: 'خطا در خواندن فایل: ' + (err.message || clientErr.message) });
      }
    } finally {
      setParsing(false);
    }
  };

  const handleSheetChange = (sheetName) => {
    setSelectedSheet(sheetName);
    setParsedData(rawSheets[sheetName] || []);
  };

  // Process Text Pasted from Excel
  const handleParsePastedText = () => {
    if (!pasteText.trim()) return;
    try {
      const lines = pasteText.trim().split('\n');
      if (lines.length < 2) {
        setResultMessage({ type: 'error', text: 'لطفاً حداقل یک سطر عنوان و یک سطر داده وارد کنید.' });
        return;
      }
      const headers = lines[0].split('\t').map(h => h.trim());
      const rows = [];

      for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split('\t');
        if (cells.length === 0 || (cells.length === 1 && !cells[0].trim())) continue;
        const row = {};
        headers.forEach((h, colIdx) => {
          row[h] = cells[colIdx] ? cells[colIdx].trim() : '';
        });
        rows.push(row);
      }

      setParsedData(rows);
      setSheetNames(['داده‌های کپی‌شده']);
      setSelectedSheet('داده‌های کپی‌شده');
      setResultMessage({ type: 'success', text: `تعداد ${rows.length} سطر از جدول با موفقیت خوانده و آماده‌سازی شد.` });
    } catch (err) {
      setResultMessage({ type: 'error', text: 'خطا در تحلیل متن کپی‌شده: ' + err.message });
    }
  };

  // Perform Final Database Import
  const handleExecuteImport = async () => {
    if (!parsedData || parsedData.length === 0) {
      setResultMessage({ type: 'error', text: 'هیچ داده‌ای برای انتقال وجود ندارد' });
      return;
    }

    setLoading(true);
    setResultMessage(null);

    try {
      let res;
      if (importType === 'customers') {
        res = await api.importCustomers(parsedData, overwrite);
        setResultMessage({
          type: 'success',
          text: `انتقال با موفقیت انجام شد! ${res.inserted} مشتری جدید ثبت و ${res.updated} رکورد به‌روزرسانی گردید.`
        });
      } else if (importType === 'projects') {
        res = await api.importProjects(parsedData, overwrite);
        setResultMessage({
          type: 'success',
          text: `انتقال با موفقیت انجام شد! ${res.inserted} سفارش/پروژه جدید ثبت و ${res.updated} رکورد به‌روزرسانی شد. (صرف‌نظر شده: ${res.skipped || 0})`
        });
      } else if (importType === 'materials') {
        res = await api.importMaterials(parsedData, overwrite);
        setResultMessage({
          type: 'success',
          text: `انتقال با موفقیت انجام شد! ${res.inserted} قلم متریال جدید ثبت و ${res.updated} قیمت به‌روزرسانی شد.`
        });
      }

      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      fetchStats();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      setResultMessage({ type: 'error', text: err.message || 'خطا در اجرای عملیات انتقال داده‌ها' });
    } finally {
      setLoading(false);
    }
  };

  // Download Sample Templates
  const handleDownloadTemplate = (type) => {
    let filename = '';
    let sampleData = [];

    if (type === 'projects') {
      filename = 'قالب_اکسل_سفارشات_آرمان_امیران.xlsx';
      sampleData = [
        {
          'کد آرشیو': '7542',
          'کد سفارش': '6320',
          'کد مشتری': '3463',
          'نام کار': 'جعبه ترموستات خودرو',
          'نام مشتری': 'صنایع خودروسازی پارت',
          'تلفن مشتری': '09123004050',
          'نوع جعبه': 'جعبه مقوایی پشت طوسی صنعتی',
          'ساختار': 'ته قفلی درب دارویی',
          'تیراژ': 10000,
          'تاریخ سفارش': '1405-06-07',
          'تاریخ فایل': '1405-06-07',
          'چاپ اول': 'بله',
          'نوع مقوا': 'پشت طوسی',
          'طول مقوا': 1000,
          'عرض مقوا': 600,
          'گرماژ مقوا': 350,
          'فی مقوا': 2020000,
          'دارای چاپ': 'بله',
          'وضعیت زینک': 'زینک جدید',
          'تعداد رنگ': 4,
          'ماشین چاپ': 'دوربرقی',
          'طول چاپ': 500,
          'عرض چاپ': 600,
          'درصد باطله': 5,
          'تعداد در شیت': 2,
          'شیت چاپ': 300,
          'سلفون': 'بله',
          'نوع سلفون': 'سلفون حرارتی مات',
          'یووی': 'خیر',
          'نوع یووی': 'موضعی',
          'طلاکوب': 'بله',
          'نوع طلاکوب': 'طلاکوب',
          'طول طلاکوب': 200,
          'عرض طلاکوب': 150,
          'برجسته': 'بله',
          'نوع برجسته': 'مقوایی',
          'تیغ': 'بله',
          'نوع قالب': 'لترپرس',
          'وضعیت قالب': 'جدید',
          'جعبه چسبانی': 'بله',
          'نوع چسب': 'لمینتی',
          'اجرت چسب': 110,
          'سینگل': 'بله',
          'نوع ورق': 'سینگل فلوت E',
          'توضیحات': 'کنترل کیفیت دقیق خط تا و تیغ بوبست',
          'قیمت واحد': 4500,
          'قیمت کل': 45000000,
          'مرحله': 9
        },
        {
          'کد آرشیو': '7543',
          'کد سفارش': '6321',
          'کد مشتری': '3464',
          'نام کار': 'جعبه زعفران صادراتی زرین',
          'نام مشتری': 'زعفران زرین خراسان',
          'تلفن مشتری': '09121002030',
          'نوع جعبه': 'کارتن لمینتی E فلوت',
          'ساختار': 'کیبوردی قفل‌دار',
          'تیراژ': 5000,
          'تاریخ سفارش': '1405-06-08',
          'تاریخ فایل': '1405-06-08',
          'چاپ اول': 'بله',
          'نوع مقوا': 'ایندربرد',
          'طول مقوا': 1000,
          'عرض مقوا': 700,
          'گرماژ مقوا': 300,
          'فی مقوا': 2400000,
          'دارای چاپ': 'بله',
          'وضعیت زینک': 'زینک جدید',
          'تعداد رنگ': 5,
          'ماشین چاپ': '۴.۵ ورقی',
          'طول چاپ': 700,
          'عرض چاپ': 1000,
          'درصد باطله': 5,
          'تعداد در شیت': 4,
          'شیت چاپ': 1250,
          'سلفون': 'بله',
          'نوع سلفون': 'سلفون حرارتی مات',
          'یووی': 'بله',
          'نوع یووی': 'موضعی',
          'طلاکوب': 'بله',
          'نوع طلاکوب': 'طلاکوب',
          'طول طلاکوب': 240,
          'عرض طلاکوب': 160,
          'برجسته': 'بله',
          'نوع برجسته': 'مقوایی',
          'تیغ': 'بله',
          'نوع قالب': 'دایکات بوبست',
          'وضعیت قالب': 'جدید',
          'جعبه چسبانی': 'بله',
          'نوع چسب': 'لمینتی',
          'اجرت چسب': 190,
          'سینگل': 'بله',
          'نوع ورق': 'سینگل فلوت E',
          'توضیحات': 'پنتون اختصاصی طلایی و یووی موضعی',
          'قیمت واحد': 8400,
          'قیمت کل': 42000000,
          'مرحله': 9
        }
      ];
    } else if (type === 'customers') {
      filename = 'قالب_اکسل_مشتریان_آرمان_امیران.xlsx';
      sampleData = [
        {
          'کد مشتری': '3463',
          'نام شرکت': 'صنایع خودروسازی پارت',
          'نام رابط': 'مهندس محمدی',
          'تلفن': '09123004050',
          'ایمیل': 'part@company.com',
          'آدرس': 'تهران، جاده مخصوص کرج، کیلومتر ۱۱',
          'یادداشت': 'مشتری تیراژ بالا - تسویه ۴۵ روزه'
        },
        {
          'کد مشتری': '3464',
          'نام شرکت': 'زعفران زرین خراسان',
          'نام رابط': 'آقای زرین‌کمر',
          'تلفن': '09121002030',
          'ایمیل': 'zarrin@saffron.ir',
          'آدرس': 'مشهد، شهرک صنعتی توس',
          'یادداشت': 'صادراتی - حساسیت بالا روی رنگ طلایی و سلفون مات'
        }
      ];
    } else if (type === 'materials') {
      filename = 'قالب_اکسل_متریال_آرمان_امیران.xlsx';
      sampleData = [
        { 'دسته‌بندی': 'مقوا', 'نام کالا': 'مقوای پشت طوسی ۳۵۰ گرم', 'واحد': 'بند / شیت', 'قیمت واحد': 2020000, 'توضیحات': 'شیت ۱۰۰×۶۰' },
        { 'دسته‌بندی': 'مقوا', 'نام کالا': 'مقوای ایندربرد ۳۰۰ گرم بهداشتی', 'واحد': 'بند / شیت', 'قیمت واحد': 2400000, 'توضیحات': 'شیت ۱۰۰×۷۰ فودگرید' },
        { 'دسته‌بندی': 'ورق و کارتن', 'نام کالا': 'سینگل فلوت E', 'واحد': 'متر مربع', 'قیمت واحد': 14500, 'توضیحات': 'سینگل فیس لمینت' }
      ];
    }

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, filename);
  };

  // Full Database Export
  const handleExportFullBackup = async () => {
    try {
      setLoading(true);
      const res = await api.exportFullBackup();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `arman-amiran-full-backup-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setResultMessage({ type: 'success', text: 'فایل کامل پشتیبان با موفقیت دانلود شد.' });
    } catch (err) {
      setResultMessage({ type: 'error', text: 'خطا در خروجی پشتیبان: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // Clear demo data
  const handleClearDemoData = async () => {
    if (!window.confirm('آیا از حذف سفارشات نمونه و پیش‌فرض اطمینان دارید؟ (کاربران و تنظیمات حفظ خواهند شد)')) return;
    try {
      setLoading(true);
      await api.clearDemoData();
      fetchStats();
      if (onRefreshData) onRefreshData();
      setResultMessage({ type: 'success', text: 'داده‌های نمونه اولیه با موفقیت پاک‌سازی شدند.' });
    } catch (err) {
      setResultMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  مرکز انتقال و یکپارچه‌سازی داده‌های کارخانه (Migration Hub)
                </h1>
                <p className="text-xs sm:text-sm text-slate-300">
                  انتقال و ایمپورت مستقیم مشتریان، کدهای آرشیو، سفارشات قبلی و مشخصات فنی از اکسل یا اتوماسیون قدیمی به سیستم جدید
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 px-4 py-3 rounded-2xl flex items-center gap-3">
              <Boxes className="w-6 h-6 text-amber-400" />
              <div>
                <div className="text-xs text-slate-400 font-bold">سفارشات در آرشیو</div>
                <div className="text-lg font-black text-amber-300">{stats.projectsCount.toLocaleString('fa-IR')} کار</div>
              </div>
            </div>

            <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 px-4 py-3 rounded-2xl flex items-center gap-3">
              <Users className="w-6 h-6 text-cyan-400" />
              <div>
                <div className="text-xs text-slate-400 font-bold">مشتریان ثبت‌شده</div>
                <div className="text-lg font-black text-cyan-300">{stats.customersCount.toLocaleString('fa-IR')} شرکت</div>
              </div>
            </div>

            <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 px-4 py-3 rounded-2xl flex items-center gap-3">
              <Layers className="w-6 h-6 text-emerald-400" />
              <div>
                <div className="text-xs text-slate-400 font-bold">نرخ‌های متریال</div>
                <div className="text-lg font-black text-emerald-300">{stats.materialsCount.toLocaleString('fa-IR')} قلم</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveSubTab('excel_import')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
            activeSubTab === 'excel_import'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>۱. ایمپورت هوشمند از اکسل / CSV</span>
        </button>

        <button
          onClick={() => setActiveSubTab('paste_grid')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
            activeSubTab === 'paste_grid'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ClipboardPaste className="w-4 h-4" />
          <span>۲. کپی و پیست سریع مستقیم از اکسل</span>
        </button>

        <button
          onClick={() => setActiveSubTab('backup_restore')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
            activeSubTab === 'backup_restore'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>۳. بک‌آپ کامل و بازیابی دیتابیس</span>
        </button>

        <button
          onClick={() => setActiveSubTab('guide')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
            activeSubTab === 'guide'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>۴. راهنمای استخراج از اتوماسیون قدیمی</span>
        </button>
      </div>

      {/* Result / Alert Messages */}
      {resultMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 animate-fade-in ${
            resultMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'
          }`}
        >
          {resultMessage.type === 'success' ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0" />
          )}
          <div className="font-bold text-sm">{resultMessage.text}</div>
        </div>
      )}

      {/* TAB 1: Smart Excel / CSV Importer */}
      {activeSubTab === 'excel_import' && (
        <div className="space-y-6">
          
          {/* Target Data & Options Selection */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                  <span>انتخاب نوع اطلاعات جهت ایمپورت</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">مشخص کنید فایل انتخابی مربوط به کدام بخش است</p>
              </div>

              {/* Download Standard Templates */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500">قالب‌های استاندارد آماده:</span>
                <button
                  onClick={() => handleDownloadTemplate('projects')}
                  className="px-3 py-1.5 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-amber-600" />
                  <span>دانلود قالب اکسل سفارشات</span>
                </button>
                <button
                  onClick={() => handleDownloadTemplate('customers')}
                  className="px-3 py-1.5 text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-600" />
                  <span>دانلود قالب اکسل مشتریان</span>
                </button>
                <button
                  onClick={() => handleDownloadTemplate('materials')}
                  className="px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>قالب نرخ‌های متریال</span>
                </button>
              </div>
            </div>

            {/* Radio Selection for Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label
                onClick={() => setImportType('projects')}
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                  importType === 'projects'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="importType"
                  checked={importType === 'projects'}
                  onChange={() => setImportType('projects')}
                  className="w-4 h-4 text-indigo-600"
                />
                <div>
                  <div className="font-black text-slate-800 text-sm">آرشیو سفارشات و مشخصات فنی</div>
                  <div className="text-xs text-slate-500 mt-0.5">کد آرشیو، ابعاد، مقوا، چاپ، سلفون، طلاکوب، تیغ و ...</div>
                </div>
              </label>

              <label
                onClick={() => setImportType('customers')}
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                  importType === 'customers'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="importType"
                  checked={importType === 'customers'}
                  onChange={() => setImportType('customers')}
                  className="w-4 h-4 text-indigo-600"
                />
                <div>
                  <div className="font-black text-slate-800 text-sm">مشتریان و شرکت‌های طرف حساب</div>
                  <div className="text-xs text-slate-500 mt-0.5">کد مشتری، نام شرکت، نام مسئول، شماره تماس و آدرس</div>
                </div>
              </label>

              <label
                onClick={() => setImportType('materials')}
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                  importType === 'materials'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="importType"
                  checked={importType === 'materials'}
                  onChange={() => setImportType('materials')}
                  className="w-4 h-4 text-indigo-600"
                />
                <div>
                  <div className="font-black text-slate-800 text-sm">قیمت پایه مواد اولیه و خدمات</div>
                  <div className="text-xs text-slate-500 mt-0.5">تعرفه مقوا، زینک، سلفون، قالب، چسب و کرجی</div>
                </div>
              </label>
            </div>

            {/* Overwrite conflict settings */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <div>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">مدیریت رکوردهای تکراری:</span>
                  <p className="text-xs text-slate-500">اگر رکورد با کد آرشیو یا کد مشتری قبلاً در دیتابیس وجود داشت</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="overwrite"
                    checked={overwrite}
                    onChange={() => setOverwrite(true)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span>به‌روزرسانی و جایگزینی با اطلاعات جدید (پیش‌نهادی)</span>
                </label>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="overwrite"
                    checked={!overwrite}
                    onChange={() => setOverwrite(false)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span>صرف‌نظر و نگه‌داشتن داده قدیمی</span>
                </label>
              </div>
            </div>

            {/* File Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/20 hover:bg-indigo-50/50 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.json"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
                <UploadCloud className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="text-base sm:text-lg font-black text-slate-800">
                  {file ? file.name : 'انتخاب یا رها کردن فایل اکسل (XLSX, XLS, CSV)'}
                </div>
                <p className="text-xs text-slate-500">
                  سیستم به صورت خودکار ستون‌های فارسی و انگلیسی نرم‌افزار قدیمی شما را شناسایی و تطبیق می‌دهد
                </p>
              </div>
              {parsing && (
                <div className="text-xs font-bold text-indigo-600 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>در حال خواندن و تحلیل ستون‌های فایل...</span>
                </div>
              )}
            </div>

            {/* Multi-sheet selector if Excel has multiple sheets */}
            {sheetNames.length > 1 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-600">انتخاب شیت اکسل:</span>
                {sheetNames.map((sn) => (
                  <button
                    key={sn}
                    onClick={() => handleSheetChange(sn)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedSheet === sn
                        ? 'bg-indigo-600 text-white font-black shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {sn} ({rawSheets[sn]?.length || 0} رکورد)
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Data Preview Table & Final Import Button */}
          {parsedData.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>پیش‌نمایش داده‌های آماده انتقال ({parsedData.length.toLocaleString('fa-IR')} رکورد شناسایی شد)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">ستون‌ها و سطرهای استخراج‌شده از فایل را بررسی کنید</p>
                </div>

                <button
                  onClick={handleExecuteImport}
                  disabled={loading}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-200 flex items-center gap-2.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>در حال ثبت در دیتابیس...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-amber-300" />
                      <span>شروع انتقال و ثبت {parsedData.length.toLocaleString('fa-IR')} رکورد در دیتابیس</span>
                    </>
                  )}
                </button>
              </div>

              {/* Scrollable Preview Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-96">
                <table className="w-full text-right text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white font-black sticky top-0 z-10">
                      <th className="p-3 border-b border-slate-700 w-12 text-center">ردیف</th>
                      {Object.keys(parsedData[0] || {}).slice(0, 10).map((colKey, i) => (
                        <th key={i} className="p-3 border-b border-slate-700 whitespace-nowrap">
                          {colKey}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedData.slice(0, 15).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-slate-400 text-center bg-slate-50/50">{(idx + 1).toLocaleString('fa-IR')}</td>
                        {Object.values(row).slice(0, 10).map((val, cellIdx) => (
                          <td key={cellIdx} className="p-3 font-medium text-slate-700 whitespace-nowrap">
                            {String(val || '-')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {parsedData.length > 15 && (
                <div className="text-center text-xs text-slate-500 font-bold">
                  نمایش ۱۵ سطر اول از مجموع {parsedData.length.toLocaleString('fa-IR')} رکورد
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Quick Copy-Paste from Excel */}
      {activeSubTab === 'paste_grid' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <ClipboardPaste className="w-5 h-5 text-indigo-600" />
              <span>کپی و پیست مستقیم جدول از اکسل</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              کافیست در نرم‌افزار اکسل یا فایل خود جدول را انتخاب کرده، <strong>Ctrl+C</strong> بزنید و در کادر زیر <strong>Ctrl+V (Paste)</strong> کنید.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700">نوع اطلاعات کپی شده:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setImportType('projects')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${importType === 'projects' ? 'bg-indigo-600 text-white font-black' : 'bg-slate-100 text-slate-700'}`}
                >
                  سفارشات و آرشیو
                </button>
                <button
                  onClick={() => setImportType('customers')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${importType === 'customers' ? 'bg-indigo-600 text-white font-black' : 'bg-slate-100 text-slate-700'}`}
                >
                  مشتریان
                </button>
                <button
                  onClick={() => setImportType('materials')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${importType === 'materials' ? 'bg-indigo-600 text-white font-black' : 'bg-slate-100 text-slate-700'}`}
                >
                  قیمت مواد اولیه
                </button>
              </div>
            </div>

            <textarea
              rows={8}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="سطرهای جدول اکسل را اینجا Paste کنید...&#10;مثال:&#10;کد آرشیو	کد سفارش	کد مشتری	نام کار	نام مشتری	تیراژ	نوع مقوا&#10;7542	6320	3463	جعبه ترموستات	صنایع پارت	10000	پشت طوسی"
              className="w-full p-4 rounded-2xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />

            <div className="flex items-center justify-between flex-wrap gap-3">
              <button
                onClick={handleParsePastedText}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>تحلیل جدول و پیش‌نمایش</span>
              </button>

              {parsedData.length > 0 && (
                <button
                  onClick={handleExecuteImport}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-emerald-200"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>ثبت نهایی {parsedData.length.toLocaleString('fa-IR')} رکورد در دیتابیس</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Full Backup & Restore */}
      {activeSubTab === 'backup_restore' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-800">تهیه نسخه پشتیبان کامل (Full Backup)</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              تمامی پروژه‌ها، مشخصات فنی مقوا و چاپ، اطلاعات مشتریان، قیمت‌های متریال و تاریخچه اقدامات پرسنل در قالب یک فایل JSON ایمن دانلود و ذخیره می‌شود.
            </p>
            <button
              onClick={handleExportFullBackup}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-100 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>دانلود فایل پشتیبان سیستم (JSON Backup)</span>
            </button>
          </div>

          {/* Demo Data Management Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-800">پاک‌سازی داده‌های نمونه اولیه</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              در صورتی که پس از انتقال اطلاعات واقعی تمایل دارید سفارشات پیش‌فرض و نمونه حذف شوند، می‌توانید از این گزینه استفاده فرمایید. حساب‌های کاربری محفوظ می‌مانند.
            </p>
            <button
              onClick={handleClearDemoData}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-black text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>حذف سفارشات تستی و پیش‌فرض</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Legacy Extraction Guide */}
      {activeSubTab === 'guide' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              <span>راهنمای استخراج اطلاعات از اتوماسیون قدیمی کارخانه</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">روش‌های ساده برای انتقال هزاران رکورد موجود به سیستم جدید</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-sm">
                ۱
              </div>
              <h3 className="font-black text-slate-800 text-sm">خروجی اکسل از نرم‌افزار قبلی</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                در نرم‌افزار قدیمی، به بخش گزارشات یا لیست سفارشات/مشتریان رفته و گزینه «خروجی اکسل» (Export to Excel) را انتخاب کنید. سپس همان فایل را در تب ۱ همین صفحه آپلود کنید.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-sm">
                ۲
              </div>
              <h3 className="font-black text-slate-800 text-sm">تطبیق خودکار هوشمند ستون‌ها</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                سیستم جدید به گونه‌ای طراحی شده که تمام نام ستون‌های اتوماسیون قدیمی (مانند «کد آرشیو»، «کد مشتری»، «نام کار»، «نوع مقوا»، «گرماژ»، «سلفون»، «تیغ» و ...) را به صورت خودکار شناسایی و در جدول ماتریس فنی قرار می‌دهد.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-sm">
                ۳
              </div>
              <h3 className="font-black text-slate-800 text-sm">ارسال فایل دیتابیس در همین محیط</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                در صورتی که فایل دیتابیس (مانند فایلهای Access .mdb، SQLite .db، دیتابیس جاوا، یا فایل‌های اکسل موجود) را دارید، می‌توانید آن را به ما ارائه دهید تا کلیه اطلاعات در یک چشم به هم زدن در دیتابیس کارخانه ثبت گردد.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
