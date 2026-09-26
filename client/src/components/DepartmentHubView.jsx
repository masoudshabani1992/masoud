import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { canAccessDepartment } from '../utils/helpers';
import FactoryHubPipelineCanvas from './FactoryHubPipelineCanvas';
import {
  Lock,
  AlertCircle,
  X,
  ShieldAlert,
  ArrowRightLeft,
  FileSpreadsheet,
  PlusCircle,
  Boxes,
  Sparkles,
  Package,
  Printer,
  Scissors,
  Layers,
  Box,
  CreditCard,
  Clock,
  CheckCircle2,
  Workflow,
  LayoutGrid
} from 'lucide-react';

// Custom SVGs crafted to match the legacy MIS screenshot
function DesignerIcon({ className = "w-16 h-16" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="10" width="48" height="34" rx="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="3" />
      <path d="M24 54h16M32 44v10" strokeWidth="3" />
      <path d="M20 28l18-12 6 6-18 12-6-6z" fill="currentColor" />
      <path d="M18 34l2-6 6 2-2 6-6-2z" fill="currentColor" />
      <path d="M38 16l6 6" stroke="#ffffff" strokeWidth="2" />
      <path d="M22 36l-4 4h10" strokeWidth="2.5" />
    </svg>
  );
}

function CeoIcon({ className = "w-16 h-16" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="currentColor">
      <circle cx="32" cy="18" r="8" />
      <path d="M20 38c0-6.6 5.4-12 12-12s12 5.4 12 12v3H20v-3z" />
      <circle cx="14" cy="46" r="4" />
      <circle cx="32" cy="52" r="4" />
      <circle cx="50" cy="46" r="4" />
      <path d="M20 40l-4 4M32 41v7M44 40l4 4" stroke="currentColor" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

function BusinessIcon({ className = "w-16 h-16" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 20l12 12-4 8-10-8V20z" fill="currentColor" fillOpacity="0.2" />
      <path d="M54 20L42 32l4 8 10-8V20z" fill="currentColor" fillOpacity="0.2" />
      <path d="M22 32l8-8 12 8-6 6-6-4-8 8-10-10" />
      <path d="M30 36l6 6 8-6" />
      <path d="M34 42l4 4 6-4" />
      <path d="M10 20h10M44 20h10" strokeWidth="3" />
    </svg>
  );
}

function SecretaryIcon({ className = "w-16 h-16" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="currentColor">
      <circle cx="32" cy="16" r="7" />
      <path d="M24 28c0-3 3-5 8-5s8 2 8 5v12h-16V28z" />
      <path d="M22 40l-4 18h28l-4-18H22z" />
      <rect x="27" y="30" width="10" height="13" rx="1.5" fill="#ffffff" fillOpacity="0.9" />
      <line x1="29" y1="34" x2="35" y2="34" stroke="#881337" strokeWidth="1.5" />
      <line x1="29" y1="37" x2="35" y2="37" stroke="#881337" strokeWidth="1.5" />
      <line x1="29" y1="40" x2="33" y2="40" stroke="#881337" strokeWidth="1.5" />
    </svg>
  );
}

function AccountingIcon({ className = "w-16 h-16" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="18" y="14" width="28" height="38" rx="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="3" />
      <path d="M26 14v-4h12v4" strokeWidth="2.5" />
      <rect x="28" y="8" width="8" height="4" rx="1" fill="currentColor" />
      <text x="32" y="27" fontSize="11" fontWeight="bold" textAnchor="middle" fill="currentColor" stroke="none">$</text>
      <line x1="24" y1="33" x2="40" y2="33" strokeWidth="2" />
      <line x1="24" y1="38" x2="36" y2="38" strokeWidth="2" />
      <circle cx="38" cy="44" r="7" fill="currentColor" />
      <path d="M35 44l2 2 4-4" stroke="#1e3a8a" strokeWidth="2" fill="none" />
    </svg>
  );
}

function ProductionIcon({ className = "w-16 h-16" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="currentColor">
      <g transform="translate(24, 20)">
        <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="12" cy="12" r="3" />
        <path d="M10 0h4v5h-4zM10 19h4v5h-4zM0 10h5v4H0zM19 10h5v4h-5zM3 3l3.5 3.5 2.8-2.8L5.8.2zM14.7 14.7l3.5 3.5 2.8-2.8-3.5-3.5zM3 21l3.5-3.5 2.8 2.8L5.8 23.8zM14.7 9.3l3.5-3.5 2.8 2.8-3.5 3.5z" />
      </g>
      <g transform="translate(10, 32) scale(0.65)">
        <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="12" cy="12" r="3" />
        <path d="M10 0h4v5h-4zM10 19h4v5h-4zM0 10h5v4H0zM19 10h5v4h-5z" />
      </g>
      <g transform="translate(38, 32) scale(0.65)">
        <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="12" cy="12" r="3" />
        <path d="M10 0h4v5h-4zM10 19h4v5h-4zM0 10h5v4H0zM19 10h5v4h-5z" />
      </g>
    </svg>
  );
}

function OutsourceIcon({ className = "w-16 h-16" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="currentColor">
      <circle cx="32" cy="32" r="8" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="32" cy="32" r="4" />
      <circle cx="32" cy="12" r="4" />
      <circle cx="48" cy="20" r="4" />
      <circle cx="48" cy="44" r="4" />
      <circle cx="32" cy="52" r="4" />
      <circle cx="16" cy="44" r="4" />
      <circle cx="16" cy="20" r="4" />
      <line x1="32" y1="20" x2="32" y2="24" stroke="currentColor" strokeWidth="2" />
      <line x1="42" y1="26" x2="38" y2="29" stroke="currentColor" strokeWidth="2" />
      <line x1="42" y1="38" x2="38" y2="35" stroke="currentColor" strokeWidth="2" />
      <line x1="32" y1="44" x2="32" y2="40" stroke="currentColor" strokeWidth="2" />
      <line x1="22" y1="38" x2="26" y2="35" stroke="currentColor" strokeWidth="2" />
      <line x1="22" y1="26" x2="26" y2="29" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function WarehouseIcon({ className = "w-16 h-16" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 10h24v6H22v12" strokeWidth="2.8" />
      <line x1="36" y1="16" x2="36" y2="28" strokeWidth="1.8" strokeDasharray="2 2" />
      <rect x="30" y="28" width="12" height="10" fill="currentColor" stroke="none" />
      <path d="M10 50h40l4-10H46V36H16v14H10z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="22" cy="50" r="4" fill="currentColor" />
      <circle cx="44" cy="50" r="4" fill="currentColor" />
    </svg>
  );
}

function MarketingIcon({ className = "w-16 h-16" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="32" cy="20" r="7" fill="currentColor" fillOpacity="0.2" />
      <circle cx="32" cy="20" r="4" />
      <path d="M18 44c0-7 6.5-11 14-11s14 4 14 11v3H18v-3z" fill="currentColor" fillOpacity="0.3" strokeWidth="2.5" />
      <path d="M12 28l-6 6 6 6M52 28l6 6-6 6" strokeWidth="2.5" />
      <circle cx="32" cy="50" r="3" fill="currentColor" />
    </svg>
  );
}

function HrIcon({ className = "w-16 h-16" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="currentColor">
      <circle cx="32" cy="18" r="7" />
      <path d="M20 40c0-6 5.5-10 12-10s12 4 12 10v4H20v-4z" />
      <path d="M32 44l3 5 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
    </svg>
  );
}

function AiIcon({ className = "w-16 h-16" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="16" y="16" width="32" height="32" rx="8" fill="currentColor" fillOpacity="0.2" strokeWidth="3" />
      <circle cx="26" cy="30" r="3" fill="currentColor" />
      <circle cx="38" cy="30" r="3" fill="currentColor" />
      <path d="M26 40h12" strokeWidth="2.5" />
      <path d="M32 8v8M32 48v8M8 32h8M48 32h8" strokeWidth="2.5" />
    </svg>
  );
}

function CalcHubIcon({ className = "w-16 h-16" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="14" y="10" width="36" height="44" rx="6" fill="currentColor" fillOpacity="0.2" strokeWidth="3" />
      <rect x="20" y="16" width="24" height="10" rx="2" fill="currentColor" fillOpacity="0.3" strokeWidth="2" />
      <circle cx="22" cy="34" r="2.5" fill="currentColor" />
      <circle cx="32" cy="34" r="2.5" fill="currentColor" />
      <circle cx="42" cy="34" r="2.5" fill="currentColor" />
      <circle cx="22" cy="44" r="2.5" fill="currentColor" />
      <circle cx="32" cy="44" r="2.5" fill="currentColor" />
      <circle cx="42" cy="44" r="2.5" fill="currentColor" />
    </svg>
  );
}

export default function DepartmentHubView({
  projects = [],
  onNavigateDepartment,
  onOpenNewOrder,
  onOpenArchive
}) {
  const { currentUser, role } = useAuth();
  const [accessDeniedModal, setAccessDeniedModal] = useState(null);
  const [viewMode, setViewMode] = useState('canvas'); // 'canvas' (n8n pipeline canvas) or 'tiles' (12-tile department grid)

  // Compute pending items per department based on 10-stage pipeline
  const designCount = projects.filter((p) => p.current_stage === 5).length;
  const ceoCount = projects.filter((p) => p.current_stage === 4).length;
  const salesCount = projects.filter((p) => [1, 3, 6, 8].includes(p.current_stage)).length;
  const secretaryCount = projects.filter((p) => [1, 3].includes(p.current_stage)).length;
  const accountingCount = projects.filter((p) => p.current_stage === 2).length;
  const productionCount = projects.filter((p) => p.current_stage === 10).length;
  const outsourceCount = projects.filter((p) => p.current_stage === 7).length;
  const warehouseCount = projects.filter((p) => p.current_stage === 9).length;

  const totalActiveOrders = projects.filter((p) => p.current_stage < 11).length;

  const handleTileClick = (targetRole, targetName, tabKey, stageFilter) => {
    if (!canAccessDepartment(role, targetRole)) {
      setAccessDeniedModal({
        targetName,
        userRoleName: currentUser?.department || role
      });
      return;
    }
    onNavigateDepartment(tabKey, stageFilter);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto py-2 sm:py-6 px-2 sm:px-4 space-y-6 select-none animate-in fade-in zoom-in-95 duration-200">
      
      {/* Top Header Section with Soft Pastel Gradient */}
      <div className="bg-gradient-to-r from-violet-50/80 via-white to-amber-50/80 border border-slate-200/90 rounded-3xl p-5 sm:p-7 text-center space-y-2 shadow-sm">
        <h1 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight">
          اتوماسیون تولید (MIS) شرکت آرمان امیران
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500 tracking-wide font-sans">
          Production automation system of Arman Amiran Company
        </p>
        
        {/* Active Jobs Counter Display */}
        <div className="pt-2 flex justify-center">
          <div
            onClick={onOpenArchive}
            className="w-48 bg-white border border-slate-300 rounded-2xl py-1 px-4 text-center cursor-pointer hover:border-violet-500 hover:shadow-md transition-all group"
            title="کلیک برای مشاهده لیست کامل سفارشات فعال کارخانه"
          >
            <span className="font-mono text-xl sm:text-2xl font-black text-violet-800 group-hover:text-violet-950">
              {totalActiveOrders || 82}
            </span>
          </div>
        </div>
      </div>


      {/* Quick Action Bar for Data Migration and New Orders */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black text-slate-800">انتقال سریع اطلاعات از اتوماسیون قدیمی</div>
            <div className="text-xs text-slate-500">ایمپورت مشتریان، سفارشات و آرشیو کارهای قبلی از طریق فایل اکسل یا دیتابیس</div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => onNavigateDepartment('migration')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>مرکز انتقال و ایمپورت اکسل</span>
          </button>

          <button
            onClick={onOpenArchive}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2"
          >
            <Boxes className="w-4 h-4 text-amber-600" />
            <span>آرشیو کارهای ثبت‌شده</span>
          </button>

          <button
            onClick={onOpenNewOrder}
            className="px-4 py-2.5 btn-marketing-green text-white font-black rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-emerald-100" />
            <span>سفارش جدید</span>
          </button>
        </div>
      </div>

      {/* View Switcher Bar: n8n Pipeline Canvas vs 12-Tile Pastel Hub */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('canvas')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-2 ${
              viewMode === 'canvas'
                ? 'bg-gradient-to-r from-amber-200 via-orange-200 to-rose-200 text-slate-950 border border-amber-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="بوم گرافیکی تعاملی اتوماسیون کارخانه به سبک n8n"
          >
            <Workflow className="w-4 h-4 text-amber-800" />
            <span>بوم گرافیکی پایپ‌لاین کارخانه (n8n Enterprise)</span>
          </button>

          <button
            onClick={() => setViewMode('tiles')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-2 ${
              viewMode === 'tiles'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="پرتال سنتی کاشی‌های ۱۲ دپارتمان"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>پرتال کاشی‌های دپارتمان (۱۲ دپارتمان)</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-bold hidden md:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>مرکز مدیریت یکپارچه کارخانه جعبه‌سازی و کارتن‌سازی</span>
        </div>
      </div>

      {/* VIEW MODE 1: n8n PIPELINE CANVAS */}
      {viewMode === 'canvas' && (
        <FactoryHubPipelineCanvas
          projects={projects}
          onNavigateDepartment={onNavigateDepartment}
          onOpenNewOrder={onOpenNewOrder}
          onOpenArchive={onOpenArchive}
        />
      )}

      {/* VIEW MODE 2: CLASSIC PASTEL TILES & CENTERS */}
      {viewMode === 'tiles' && (
        <>
          {/* Two Core Centers: ۱. دستور تولید | ۲. انبار */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Card 1: مرکز دستور تولید (۱.تولید | ۲.دیجیتال | ۳.خدماتی) */}
        <div className="bg-white rounded-3xl p-6 border border-indigo-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-100 to-violet-200 text-indigo-900 flex items-center justify-center shadow-xs border border-indigo-200">
                <FileSpreadsheet className="w-6 h-6 text-indigo-700" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">دستور تولید کارخانه</h2>
                <p className="text-xs text-slate-500">مدیریت سفارشات تولید، دیجیتال و کارهای خدماتی</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateDepartment('production_orders')}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-black transition border border-indigo-200/60"
            >
              مشاهده کل کارتابل ←
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. تولید */}
            <button
              onClick={() => onNavigateDepartment('production_orders')}
              className="p-3.5 bg-slate-50/70 hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-300 rounded-2xl text-right transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-black text-xs">۱</span>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
              </div>
              <h3 className="font-black text-xs text-slate-800 group-hover:text-indigo-800">۱. تولید (افست)</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">۳ رنگ: سفید، زرد، سبز + اکسل ۳ شیت</p>
            </button>

            {/* 2. دیجیتال */}
            <button
              onClick={() => onNavigateDepartment('digital_orders')}
              className="p-3.5 bg-slate-50/70 hover:bg-purple-50/60 border border-slate-200/80 hover:border-purple-300 rounded-2xl text-right transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-black text-xs">۲</span>
                <Printer className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-black text-xs text-slate-800 group-hover:text-purple-800">۲. دیجیتال</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">چاپ با دستگاه‌های دیجیتال و فوری</p>
            </button>

            {/* 3. خدماتی */}
            <button
              onClick={() => onNavigateDepartment('service_orders')}
              className="p-3.5 bg-slate-50/70 hover:bg-amber-50/60 border border-slate-200/80 hover:border-amber-300 rounded-2xl text-right transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs">۳</span>
                <Scissors className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-black text-xs text-slate-800 group-hover:text-amber-800">۳. خدماتی</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">تنها دایکات و سلفون روی جعبه مشتری</p>
            </button>
          </div>
        </div>

        {/* Card 2: مرکز انبار (۱.مقوا | ۲.ورق | ۳.سینگل | ۴.سلفون | ۵.طلق | ۶.مرکب) */}
        <div className="bg-white rounded-3xl p-6 border border-sky-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-100 to-blue-200 text-sky-900 flex items-center justify-center shadow-xs border border-sky-200">
                <Package className="w-6 h-6 text-sky-700" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">انبار مرکزی کارخانه</h2>
                <p className="text-xs text-slate-500">دفاتر ورودی متریال، کسری/مازاد و اکسل ۶ شیت</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateDepartment('warehouse_inventory')}
              className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-black transition border border-sky-200/60"
            >
              مشاهده کل انبار ←
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* 1. مقوا */}
            <button
              onClick={() => onNavigateDepartment('warehouse_cardboard')}
              className="p-2.5 bg-slate-50/70 hover:bg-sky-50/60 border border-slate-200/80 hover:border-sky-300 rounded-xl text-right transition-all group flex items-center gap-2"
            >
              <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-black text-xs shrink-0">۱</span>
              <div>
                <h4 className="font-bold text-xs text-slate-800 group-hover:text-sky-800">۱. مقوا</h4>
                <p className="text-[9px] text-slate-400">ایندربرد / طوسی</p>
              </div>
            </button>

            {/* 2. ورق */}
            <button
              onClick={() => onNavigateDepartment('warehouse_sheet_carton')}
              className="p-2.5 bg-slate-50/70 hover:bg-amber-50/60 border border-slate-200/80 hover:border-amber-300 rounded-xl text-right transition-all group flex items-center gap-2"
            >
              <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs shrink-0">۲</span>
              <div>
                <h4 className="font-bold text-xs text-slate-800 group-hover:text-amber-800">۲. ورق</h4>
                <p className="text-[9px] text-slate-400">ورق ۳ و ۵ لایه</p>
              </div>
            </button>

            {/* 3. سینگل */}
            <button
              onClick={() => onNavigateDepartment('warehouse_single_face')}
              className="p-2.5 bg-slate-50/70 hover:bg-teal-50/60 border border-slate-200/80 hover:border-teal-300 rounded-xl text-right transition-all group flex items-center gap-2"
            >
              <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-black text-xs shrink-0">۳</span>
              <div>
                <h4 className="font-bold text-xs text-slate-800 group-hover:text-teal-800">۳. سینگل</h4>
                <p className="text-[9px] text-slate-400">رول / شیت فلوت</p>
              </div>
            </button>

            {/* 4. سلفون */}
            <button
              onClick={() => onNavigateDepartment('warehouse_cellophane')}
              className="p-2.5 bg-slate-50/70 hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-300 rounded-xl text-right transition-all group flex items-center gap-2"
            >
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-black text-xs shrink-0">۴</span>
              <div>
                <h4 className="font-bold text-xs text-slate-800 group-hover:text-indigo-800">۴. سلفون</h4>
                <p className="text-[9px] text-slate-400">مات / براق / مخملی</p>
              </div>
            </button>

            {/* 5. طلق */}
            <button
              onClick={() => onNavigateDepartment('warehouse_pvc_film')}
              className="p-2.5 bg-slate-50/70 hover:bg-purple-50/60 border border-slate-200/80 hover:border-purple-300 rounded-xl text-right transition-all group flex items-center gap-2"
            >
              <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-black text-xs shrink-0">۵</span>
              <div>
                <h4 className="font-bold text-xs text-slate-800 group-hover:text-purple-800">۵. طلق</h4>
                <p className="text-[9px] text-slate-400">PVC / PET پنجره</p>
              </div>
            </button>

            {/* 6. مرکب */}
            <button
              onClick={() => onNavigateDepartment('warehouse_ink')}
              className="p-2.5 bg-slate-50/70 hover:bg-rose-50/60 border border-slate-200/80 hover:border-rose-300 rounded-xl text-right transition-all group flex items-center gap-2"
            >
              <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-black text-xs shrink-0">۶</span>
              <div>
                <h4 className="font-bold text-xs text-slate-800 group-hover:text-rose-800">۶. مرکب</h4>
                <p className="text-[9px] text-slate-400">CMYK / پنتون / ورنی</p>
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* Main 12-Department Grid (Exact 4 Columns x 3 Rows Symmetrical Structure with Pastel Styling) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
        
        {/* ================= ROW 1, COL 1: طراحی (Designer) ================= */}
        {(() => {
          const hasAccess = canAccessDepartment(role, 'design');
          return (
            <div
              onClick={() => handleTileClick('design', 'طراحی', 'kanban', 5)}
              className={`relative h-48 sm:h-56 rounded-3xl p-5 text-amber-950 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl border-2 bg-gradient-to-br from-amber-100 via-yellow-100/80 to-amber-200/90 ${
                hasAccess ? 'border-amber-300 ring-4 ring-amber-200/40 shadow-sm' : 'border-amber-200/60 opacity-80'
              } group overflow-hidden`}
            >
              {!hasAccess && (
                <div className="absolute top-3.5 left-3.5 bg-amber-950/10 text-amber-900 p-1.5 rounded-xl backdrop-blur-xs" title="نیازمند دسترسی واحد طراحی">
                  <Lock className="w-4 h-4" />
                </div>
              )}

              {designCount > 0 && (
                <div className="absolute top-3.5 right-3.5 bg-amber-300 text-amber-950 border border-amber-400 font-black font-mono text-xs sm:text-sm px-2.5 py-0.5 rounded-lg shadow-2xs animate-pulse">
                  {designCount}
                </div>
              )}

              <div className="text-amber-800 group-hover:scale-110 transition-transform duration-200">
                <DesignerIcon className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>

              <div className="text-center mt-2">
                <h2 className="text-xl sm:text-2xl font-black text-amber-950">استودیو طراحی امیران</h2>
                <span className="text-xs sm:text-sm font-bold text-amber-800 block -mt-0.5">
                  Design Studio
                </span>
              </div>
            </div>
          );
        })()}

        {/* ================= ROW 1, COL 2: مدیر عامل (CEO) ================= */}
        {(() => {
          const hasAccess = canAccessDepartment(role, 'ceo');
          return (
            <div
              onClick={() => handleTileClick('ceo', 'مدیریت عامل', 'dashboard')}
              className={`relative h-48 sm:h-56 rounded-3xl p-5 text-orange-950 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl border-2 bg-gradient-to-br from-orange-100 via-amber-100/80 to-orange-200/90 ${
                hasAccess ? 'border-orange-300 ring-4 ring-orange-200/40 shadow-sm' : 'border-orange-200/60 opacity-80'
              } group overflow-hidden`}
            >
              {!hasAccess && (
                <div className="absolute top-3.5 left-3.5 bg-orange-950/10 text-orange-900 p-1.5 rounded-xl backdrop-blur-xs" title="نیازمند دسترسی مدیریت عامل">
                  <Lock className="w-4 h-4" />
                </div>
              )}

              {ceoCount > 0 && (
                <div className="absolute top-3.5 right-3.5 bg-orange-300 text-orange-950 border border-orange-400 font-black font-mono text-xs sm:text-sm px-2.5 py-0.5 rounded-lg shadow-2xs">
                  {ceoCount}
                </div>
              )}

              <div className="text-orange-800 group-hover:scale-110 transition-transform duration-200">
                <CeoIcon className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>

              <div className="text-center mt-2">
                <h2 className="text-xl sm:text-2xl font-black text-orange-950">مدیر عامل</h2>
                <span className="text-xs sm:text-sm font-bold text-orange-800 block -mt-0.5">
                  CEO
                </span>
              </div>
            </div>
          );
        })()}

        {/* ================= ROW 1, COL 3: بازرگانی (Business) ================= */}
        {(() => {
          const hasAccess = canAccessDepartment(role, 'sales');
          return (
            <div
              onClick={() => handleTileClick('sales', 'بازرگانی', 'kanban', 1)}
              className={`relative h-48 sm:h-56 rounded-3xl p-5 text-purple-950 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl border-2 bg-gradient-to-br from-purple-100 via-violet-100/80 to-purple-200/90 ${
                hasAccess ? 'border-purple-300 ring-4 ring-purple-200/40 shadow-sm' : 'border-purple-200/60 opacity-80'
              } group overflow-hidden`}
            >
              {!hasAccess && (
                <div className="absolute top-3.5 left-3.5 bg-purple-950/10 text-purple-900 p-1.5 rounded-xl backdrop-blur-xs" title="نیازمند دسترسی بازرگانی">
                  <Lock className="w-4 h-4" />
                </div>
              )}

              {salesCount > 0 && (
                <div className="absolute top-3.5 right-3.5 bg-purple-300 text-purple-950 border border-purple-400 font-black font-mono text-xs sm:text-sm px-2.5 py-0.5 rounded-lg shadow-2xs">
                  {salesCount}
                </div>
              )}

              <div className="text-purple-800 group-hover:scale-110 transition-transform duration-200">
                <BusinessIcon className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>

              <div className="text-center mt-2">
                <h2 className="text-xl sm:text-2xl font-black text-purple-950">بازرگانی</h2>
                <span className="text-xs sm:text-sm font-bold text-purple-800 block -mt-0.5">
                  Business
                </span>
              </div>
            </div>
          );
        })()}

        {/* ================= ROW 2, COL 1: مسئول دفتر (the secretary) ================= */}
        {(() => {
          const hasAccess = canAccessDepartment(role, 'secretary');
          return (
            <div
              onClick={() => {
                if (!hasAccess) {
                  setAccessDeniedModal({ targetName: 'مسئول دفتر', userRoleName: currentUser?.department || role });
                  return;
                }
                if (onOpenNewOrder) onOpenNewOrder();
              }}
              className={`relative h-48 sm:h-56 rounded-3xl p-5 text-rose-950 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl border-2 bg-gradient-to-br from-rose-100 via-pink-100/80 to-rose-200/90 ${
                hasAccess ? 'border-rose-300 ring-4 ring-rose-200/40 shadow-sm' : 'border-rose-200/60 opacity-80'
              } group overflow-hidden`}
            >
              {!hasAccess && (
                <div className="absolute top-3.5 left-3.5 bg-rose-950/10 text-rose-900 p-1.5 rounded-xl backdrop-blur-xs" title="نیازمند دسترسی مسئول دفتر">
                  <Lock className="w-4 h-4" />
                </div>
              )}

              {secretaryCount > 0 && (
                <div className="absolute top-3.5 right-3.5 bg-rose-300 text-rose-950 border border-rose-400 font-black font-mono text-xs sm:text-sm px-2.5 py-0.5 rounded-lg shadow-2xs">
                  {secretaryCount}
                </div>
              )}

              <div className="text-rose-800 group-hover:scale-110 transition-transform duration-200">
                <SecretaryIcon className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>

              <div className="text-center mt-2">
                <h2 className="text-xl sm:text-2xl font-black text-rose-950">مسئول دفتر</h2>
                <span className="text-xs sm:text-sm font-bold text-rose-800 block -mt-0.5">
                  the secretary
                </span>
              </div>
            </div>
          );
        })()}

        {/* ================= ROW 2, COL 2: حسابداری (Accounting) ================= */}
        {(() => {
          const hasAccess = canAccessDepartment(role, 'accounting');
          return (
            <div
              onClick={() => handleTileClick('accounting', 'حسابداری و مالی', 'calculator')}
              className={`relative h-48 sm:h-56 rounded-3xl p-5 text-sky-950 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl border-2 bg-gradient-to-br from-sky-100 via-blue-100/80 to-sky-200/90 ${
                hasAccess ? 'border-sky-300 ring-4 ring-sky-200/40 shadow-sm' : 'border-sky-200/60 opacity-80'
              } group overflow-hidden`}
            >
              {!hasAccess && (
                <div className="absolute top-3.5 left-3.5 bg-sky-950/10 text-sky-900 p-1.5 rounded-xl backdrop-blur-xs" title="نیازمند دسترسی حسابداری">
                  <Lock className="w-4 h-4" />
                </div>
              )}

              {accountingCount > 0 && (
                <div className="absolute top-3.5 right-3.5 bg-sky-300 text-sky-950 border border-sky-400 font-black font-mono text-xs sm:text-sm px-2.5 py-0.5 rounded-lg shadow-2xs">
                  {accountingCount}
                </div>
              )}

              <div className="text-sky-800 group-hover:scale-110 transition-transform duration-200">
                <AccountingIcon className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>

              <div className="text-center mt-2">
                <h2 className="text-xl sm:text-2xl font-black text-sky-950">حسابداری</h2>
                <span className="text-xs sm:text-sm font-bold text-sky-800 block -mt-0.5">
                  Accounting
                </span>
              </div>
            </div>
          );
        })()}

        {/* ================= ROW 2, COL 3: تولید (Production) ================= */}
        {(() => {
          const hasAccess = canAccessDepartment(role, 'production');
          return (
            <div
              onClick={() => handleTileClick('production', 'تولید', 'kanban', 10)}
              className={`relative h-48 sm:h-56 rounded-3xl p-5 text-emerald-950 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl border-2 bg-gradient-to-br from-emerald-100 via-teal-100/80 to-emerald-200/90 ${
                hasAccess ? 'border-emerald-300 ring-4 ring-emerald-200/40 shadow-sm' : 'border-emerald-200/60 opacity-80'
              } group overflow-hidden`}
            >
              {!hasAccess && (
                <div className="absolute top-3.5 left-3.5 bg-emerald-950/10 text-emerald-900 p-1.5 rounded-xl backdrop-blur-xs" title="نیازمند دسترسی سالن تولید">
                  <Lock className="w-4 h-4" />
                </div>
              )}

              {productionCount > 0 && (
                <div className="absolute top-3.5 right-3.5 bg-emerald-300 text-emerald-950 border border-emerald-400 font-black font-mono text-xs sm:text-sm px-2.5 py-0.5 rounded-lg shadow-2xs">
                  {productionCount}
                </div>
              )}

              <div className="text-emerald-800 group-hover:scale-110 transition-transform duration-200">
                <ProductionIcon className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>

              <div className="text-center mt-2">
                <h2 className="text-xl sm:text-2xl font-black text-emerald-950">تولید</h2>
                <span className="text-xs sm:text-sm font-bold text-emerald-800 block -mt-0.5">
                  Production
                </span>
              </div>
            </div>
          );
        })()}

        {/* ================= ROW 2, COL 4: برونسپاری (Out-Source) ================= */}
        {(() => {
          const hasAccess = canAccessDepartment(role, 'outsource');
          return (
            <div
              onClick={() => handleTileClick('outsource', 'برونسپاری', 'kanban', 7)}
              className={`relative h-48 sm:h-56 rounded-3xl p-5 text-fuchsia-950 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl border-2 bg-gradient-to-br from-fuchsia-100 via-pink-100/80 to-purple-200/90 ${
                hasAccess ? 'border-fuchsia-300 ring-4 ring-fuchsia-200/40 shadow-sm' : 'border-fuchsia-200/60 opacity-80'
              } group overflow-hidden`}
            >
              {!hasAccess && (
                <div className="absolute top-3.5 left-3.5 bg-fuchsia-950/10 text-fuchsia-900 p-1.5 rounded-xl backdrop-blur-xs" title="نیازمند دسترسی برونسپاری">
                  <Lock className="w-4 h-4" />
                </div>
              )}

              {outsourceCount > 0 && (
                <div className="absolute top-3.5 right-3.5 bg-fuchsia-300 text-fuchsia-950 border border-fuchsia-400 font-black font-mono text-xs sm:text-sm px-2.5 py-0.5 rounded-lg shadow-2xs">
                  {outsourceCount}
                </div>
              )}

              <div className="text-fuchsia-800 group-hover:scale-110 transition-transform duration-200">
                <OutsourceIcon className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>

              <div className="text-center mt-2">
                <h2 className="text-xl sm:text-2xl font-black text-fuchsia-950">برونسپاری</h2>
                <span className="text-xs sm:text-sm font-bold text-fuchsia-800 block -mt-0.5">
                  Out-Source
                </span>
              </div>
            </div>
          );
        })()}

        {/* ================= ROW 3, COL 1: ورود انبار مصرفی (Log entry and exit) ================= */}
        {(() => {
          const hasAccess = canAccessDepartment(role, 'warehouse');
          return (
            <div
              onClick={() => handleTileClick('warehouse', 'ورود انبار مصرفی', 'kanban', 9)}
              className={`relative h-48 sm:h-56 rounded-3xl p-5 text-slate-800 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl border-2 bg-gradient-to-br from-slate-100 via-gray-100/80 to-slate-200/90 ${
                hasAccess ? 'border-slate-300 ring-4 ring-slate-200/40 shadow-sm' : 'border-slate-200/60 opacity-80'
              } group overflow-hidden`}
            >
              {!hasAccess && (
                <div className="absolute top-3.5 left-3.5 bg-slate-900/10 text-slate-700 p-1.5 rounded-xl backdrop-blur-xs" title="نیازمند دسترسی انبار">
                  <Lock className="w-4 h-4" />
                </div>
              )}

              {warehouseCount > 0 && (
                <div className="absolute top-3.5 right-3.5 bg-slate-300 text-slate-950 border border-slate-400 font-black font-mono text-xs sm:text-sm px-2.5 py-0.5 rounded-lg shadow-2xs">
                  {warehouseCount}
                </div>
              )}

              <div className="text-slate-700 group-hover:scale-110 transition-transform duration-200">
                <WarehouseIcon className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>

              <div className="text-center mt-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800">ورود انبار مصرفی</h2>
                <span className="text-xs sm:text-sm font-bold text-slate-600 block -mt-0.5">
                  Log entry and exit
                </span>
              </div>
            </div>
          );
        })()}

        {/* ================= ROW 3, COL 2: بازاریابی و استعلام (Marketing & Leads) ================= */}
        {(() => {
          const hasAccess = role === 'marketer' || role === 'sales' || role === 'ceo' || role === 'secretary';
          return (
            <div
              onClick={() => {
                if (!hasAccess) {
                  setAccessDeniedModal({
                    targetName: 'بازاریابی',
                    userRoleName: currentUser?.department || role
                  });
                  return;
                }
                onNavigateDepartment('marketing');
              }}
              className={`relative h-48 sm:h-56 rounded-3xl p-5 text-teal-950 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl border-2 bg-gradient-to-br from-teal-100 via-emerald-100/80 to-teal-200/90 ${
                hasAccess ? 'border-teal-300 ring-4 ring-teal-200/40 shadow-sm' : 'border-teal-200/60 opacity-80'
              } group overflow-hidden`}
            >
              {!hasAccess && (
                <div className="absolute top-3.5 left-3.5 bg-teal-950/10 text-teal-900 p-1.5 rounded-xl backdrop-blur-xs" title="نیازمند دسترسی بازاریابی">
                  <Lock className="w-4 h-4" />
                </div>
              )}

              <div className="text-teal-800 group-hover:scale-110 transition-transform duration-200">
                <MarketingIcon className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>

              <div className="text-center mt-2">
                <h2 className="text-xl sm:text-2xl font-black text-teal-950">بازاریابی و استعلام</h2>
                <span className="text-xs sm:text-sm font-bold text-teal-800 block -mt-0.5">
                  Marketing & Leads
                </span>
              </div>
            </div>
          );
        })()}

        {/* ================= ROW 3, COL 3: منابع انسانی و ارزیابی عملکرد (Human Resources) ================= */}
        {(() => {
          const hasAccess = role === 'ceo' || role === 'secretary' || currentUser?.permissions?.can_manage_users;
          return (
            <div
              onClick={() => {
                if (!hasAccess && role !== 'ceo') {
                  setAccessDeniedModal({
                    targetName: 'منابع انسانی و ارزیابی عملکرد',
                    userRoleName: currentUser?.department || role
                  });
                  return;
                }
                onNavigateDepartment('hr');
              }}
              className={`relative h-48 sm:h-56 rounded-3xl p-5 text-amber-950 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl border-2 bg-gradient-to-br from-amber-100 via-orange-100/80 to-amber-200/90 ${
                hasAccess ? 'border-amber-300 ring-4 ring-amber-200/40 shadow-sm' : 'border-amber-200/60 opacity-80'
              } group overflow-hidden`}
            >
              {!hasAccess && (
                <div className="absolute top-3.5 left-3.5 bg-amber-950/10 text-amber-900 p-1.5 rounded-xl backdrop-blur-xs" title="نیازمند دسترسی مدیریت">
                  <Lock className="w-4 h-4" />
                </div>
              )}

              <div className="text-amber-800 group-hover:scale-110 transition-transform duration-200">
                <HrIcon className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>

              <div className="text-center mt-2">
                <h2 className="text-xl sm:text-2xl font-black text-amber-950">منابع انسانی</h2>
                <span className="text-xs sm:text-sm font-bold text-amber-800 block -mt-0.5">
                  Human Resources
                </span>
              </div>
            </div>
          );
        })()}

        {/* ================= ROW 3, COL 4: هوش مصنوعی و بهینه‌سازی (AI Assistant) ================= */}
        {(() => {
          const hasAccess = true;
          return (
            <div
              onClick={() => onNavigateDepartment('ai_assistant')}
              className="relative h-48 sm:h-56 rounded-3xl p-5 text-indigo-950 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl border-2 bg-gradient-to-br from-indigo-100 via-purple-100/80 to-indigo-200/90 border-indigo-300 ring-4 ring-indigo-200/40 shadow-sm group overflow-hidden"
            >
              <div className="text-indigo-800 group-hover:scale-110 transition-transform duration-200">
                <AiIcon className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>

              <div className="text-center mt-2">
                <h2 className="text-xl sm:text-2xl font-black text-indigo-950">دستیار هوش مصنوعی</h2>
                <span className="text-xs sm:text-sm font-bold text-indigo-800 block -mt-0.5">
                  AI Assistant
                </span>
              </div>
            </div>
          );
        })()}

        {/* ================= ROW 4: ماشین حساب برآورد قیمت (Price Calculator) ================= */}
        {(() => {
          const hasAccess = role === 'accounting' || role === 'estimation' || role === 'ceo' || role === 'sales';
          return (
            <div
              onClick={() => {
                if (!hasAccess && role !== 'ceo') {
                  setAccessDeniedModal({
                    targetName: 'برآورد صنعتی قیمت',
                    userRoleName: currentUser?.department || role
                  });
                  return;
                }
                onNavigateDepartment('calculator');
              }}
              className={`relative h-48 sm:h-56 rounded-3xl p-5 text-cyan-950 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl border-2 bg-gradient-to-br from-cyan-100 via-sky-100/80 to-blue-200/90 ${
                hasAccess ? 'border-cyan-300 ring-4 ring-cyan-200/40 shadow-sm' : 'border-cyan-200/60 opacity-80'
              } group overflow-hidden`}
            >
              {!hasAccess && (
                <div className="absolute top-3.5 left-3.5 bg-cyan-950/10 text-cyan-900 p-1.5 rounded-xl backdrop-blur-xs" title="نیازمند دسترسی برآورد قیمت">
                  <Lock className="w-4 h-4" />
                </div>
              )}

              <div className="text-cyan-800 group-hover:scale-110 transition-transform duration-200">
                <CalcHubIcon className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>

              <div className="text-center mt-2">
                <h2 className="text-xl sm:text-2xl font-black text-cyan-950">برآورد صنعتی قیمت</h2>
                <span className="text-xs sm:text-sm font-bold text-cyan-800 block -mt-0.5">
                  Cost Estimation
                </span>
              </div>
            </div>
          );
        })()}

      </div>
        </>
      )}

      {/* Access Denied Modal Alert */}
      {accessDeniedModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border-2 border-rose-200 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">عدم دسترسی به بخش «{accessDeniedModal.targetName}»</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                این بخش به صورت اختصاصی برای پرسنل دپارتمان <strong className="text-slate-900">{accessDeniedModal.targetName}</strong> و مدیریت عامل تعریف شده است.
              </p>
              <div className="pt-2 text-xs text-slate-500 font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                حساب شما: <strong className="text-indigo-700">{currentUser?.fullName}</strong> ({accessDeniedModal.userRoleName})
              </div>
            </div>
            <button
              onClick={() => setAccessDeniedModal(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
