import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { canAccessDepartment } from '../utils/helpers';
import { Lock, AlertCircle, X, ShieldAlert, ArrowRightLeft, FileSpreadsheet, PlusCircle, Boxes } from 'lucide-react';

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

export default function DepartmentHubView({
  projects = [],
  onNavigateDepartment,
  onOpenNewOrder,
  onOpenArchive
}) {
  const { currentUser, role } = useAuth();
  const [accessDeniedModal, setAccessDeniedModal] = useState(null);

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
      
      {/* Top Header Section Matching the User's MIS Screenshot */}
      <div className="bg-slate-200/90 border-2 border-slate-300 rounded-2xl p-4 sm:p-6 text-center space-y-2 shadow-sm">
        <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
          اتوماسیون تولید (MIS) شرکت آرمان امیران
        </h1>
        <p className="text-xs sm:text-sm font-medium text-slate-700 tracking-wide font-sans">
          Production automation system of Arman Amiran Company
        </p>
        
        {/* Active Jobs Counter Display */}
        <div className="pt-2 flex justify-center">
          <div
            onClick={onOpenArchive}
            className="w-48 bg-white border-2 border-slate-400 rounded-lg py-1 px-4 text-center cursor-pointer hover:border-indigo-600 transition-all shadow-inner group"
            title="کلیک برای مشاهده لیست کامل سفارشات فعال کارخانه"
          >
            <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 group-hover:text-indigo-700">
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
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-indigo-100 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>ثبت سفارش جدید</span>
          </button>
        </div>
      </div>

      {/* Main 8-Department Grid (Exact 3 Columns x 3 Rows Structure) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        
        {/* ================= ROW 1, COL 1: طراحی (Designer) ================= */}
        {(() => {
          const hasAccess = canAccessDepartment(role, 'design');
          return (
            <div
              onClick={() => handleTileClick('design', 'طراحی', 'kanban', 5)}
              className={`relative h-48 sm:h-56 rounded-2xl p-5 text-slate-900 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl border-4 ${
                hasAccess ? 'border-amber-600/70 ring-4 ring-amber-400/20 shadow-lg' : 'border-amber-900/30 opacity-85'
              } group overflow-hidden`}
              style={{
                background: 'radial-gradient(circle at center, #facc15 0%, #ca8a04 55%, #854d0e 100%)',
                boxShadow: '0 10px 25px -5px rgba(202, 138, 4, 0.5), inset 0 0 20px rgba(0,0,0,0.2)'
              }}
            >
              {!hasAccess && (
                <div className="absolute top-3.5 left-3.5 bg-black/40 text-amber-100 p-1.5 rounded-lg backdrop-blur-xs" title="نیازمند دسترسی واحد طراحی">
                  <Lock className="w-4 h-4" />
                </div>
              )}

              {designCount > 0 && (
                <div className="absolute top-3.5 right-3.5 bg-yellow-300 text-slate-950 border-2 border-yellow-100 font-black font-mono text-xs sm:text-sm px-2.5 py-0.5 rounded-md shadow-md animate-pulse">
                  {designCount}
                </div>
              )}

              <div className="text-slate-950 group-hover:scale-110 transition-transform duration-200 drop-shadow-md">
                <DesignerIcon className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>

              <div className="text-center mt-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 drop-shadow-sm">طراحی</h2>
                <span className="text-sm sm:text-base font-serif italic font-bold text-amber-950 block -mt-0.5">
                  Designer
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
              className={`relative h-48 sm:h-56 rounded-2xl p-5 text-white flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl border-4 ${
                hasAccess ? 'border-amber-500/70 ring-4 ring-amber-500/20 shadow-lg' : 'border-amber-950/40 opacity-85'
              } group overflow-hidden`}
              style={{
                background: 'radial-gradient(circle at center, #b45309 0%, #92400e 50%, #451a03 100%)',
                boxShadow: '0 10px 25px -5px rgba(146, 64, 14, 0.5), inset 0 0 20px rgba(0,0,0,0.3)'
              }}
            >
              {!hasAccess && (
                <div className="absolute top-3.5 left-3.5 bg-black/40 text-amber-200 p-1.5 rounded-lg backdrop-blur-xs" title="نیازمند دسترسی مدیریت عامل">
                  <Lock className="w-4 h-4" />
                </div>
              )}

              {ceoCount > 0 && (
                <div className="absolute top-3.5 right-3.5 bg-amber-300 text-slate-950 font-black font-mono text-xs sm:text-sm px-2.5 py-0.5 rounded-md shadow-md">
                  {ceoCount}
                </div>
              )}

              <div className="text-white group-hover:scale-110 transition-transform duration-200 drop-shadow-md">
                <CeoIcon className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>

              <div className="text-center mt-2">
                <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-sm">مدیر عامل</h2>
                <span className="text-sm sm:text-base font-serif italic font-bold text-amber-200 block -mt-0.5">
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
              className={`relative h-48 sm:h-56 rounded-2xl p-5 text-white flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl border-4 ${
                hasAccess ? 'border-purple-400/70 ring-4 ring-purple-400/20 shadow-lg' : 'border-purple-950/40 opacity-85'
              } group overflow-hidden`}
              style={{
                background: 'radial-gradient(circle at center, #9333ea 0%, #7e22ce 50%, #3b0764 100%)',
                boxShadow: '0 10px 25px -5px rgba(126, 34, 206, 0.5), inset 0 0 20px rgba(0,0,0,0.3)'
              }}
            >
              {!hasAccess && (
                <div className="absolute top-3.5 left-3.5 bg-black/40 text-purple-200 p-1.5 rounded-lg backdrop-blur-xs" title="نیازمند دسترسی بازرگانی">
                  <Lock className="w-4 h-4" />
                </div>
              )}

              {salesCount > 0 && (
                <div className="absolute top-3.5 right-3.5 bg-purple-300 text-slate-950 font-black font-mono text-xs sm:text-sm px-2.5 py-0.5 rounded-md shadow-md">
                  {salesCount}
                </div>
              )}

              <div className="text-white group-hover:scale-110 transition-transform duration-200 drop-shadow-md">
                <BusinessIcon className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>

              <div className="text-center mt-2">
                <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-sm">بازرگانی</h2>
                <span className="text-sm sm:text-base font-serif italic font-bold text-purple-200 block -mt-0.5">
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
              className={`relative h-48 sm:h-56 rounded-2xl p-5 text-white flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl border-4 ${
                hasAccess ? 'border-rose-500/70 ring-4 ring-rose-400/20 shadow-lg' : 'border-rose-950/40 opacity-85'
              } group overflow-hidden`}
              style={{
                background: 'radial-gradient(circle at center, #991b1b 0%, #881337 50%, #4c0519 100%)',
                boxShadow: '0 10px 25px -5px rgba(136, 19, 55, 0.5), inset 0 0 20px rgba(0,0,0,0.3)'
              }}
            >
              {!hasAccess && (
                <div className="absolute top-3.5 left-3.5 bg-black/40 text-rose-200 p-1.5 rounded-lg backdrop-blur-xs" title="نیازمند دسترسی مسئول دفتر">
                  <Lock className="w-4 h-4" />
                </div>
              )}

              {secretaryCount > 0 && (
                <div className="absolute top-3.5 right-3.5 bg-rose-300 text-slate-950 font-black font-mono text-xs sm:text-sm px-2.5 py-0.5 rounded-md shadow-md">
                  {secretaryCount}
                </div>
              )}

              <div className="text-white group-hover:scale-110 transition-transform duration-200 drop-shadow-md">
                <SecretaryIcon className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>

              <div className="text-center mt-2">
                <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-sm">مسئول دفتر</h2>
                <span className="text-sm sm:text-base font-serif italic font-bold text-rose-200 block -mt-0.5">
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
              className={`relative h-48 sm:h-56 rounded-2xl p-5 text-white flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl border-4 ${
                hasAccess ? 'border-sky-400/70 ring-4 ring-sky-400/20 shadow-lg' : 'border-sky-950/40 opacity-85'
              } group overflow-hidden`}
              style={{
                background: 'radial-gradient(circle at center, #0284c7 0%, #0369a1 50%, #082f49 100%)',
                boxShadow: '0 10px 25px -5px rgba(3, 105, 161, 0.5), inset 0 0 20px rgba(0,0,0,0.3)'
              }}
            >
              {!hasAccess && (
                <div className="absolute top-3.5 left-3.5 bg-black/40 text-sky-200 p-1.5 rounded-lg backdrop-blur-xs" title="نیازمند دسترسی حسابداری">
                  <Lock className="w-4 h-4" />
                </div>
              )}

              {accountingCount > 0 && (
                <div className="absolute top-3.5 right-3.5 bg-sky-300 text-slate-950 font-black font-mono text-xs sm:text-sm px-2.5 py-0.5 rounded-md shadow-md">
                  {accountingCount}
                </div>
              )}

              <div className="text-white group-hover:scale-110 transition-transform duration-200 drop-shadow-md">
                <AccountingIcon className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>

              <div className="text-center mt-2">
                <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-sm">حسابداری</h2>
                <span className="text-sm sm:text-base font-serif italic font-bold text-sky-200 block -mt-0.5">
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
              className={`relative h-48 sm:h-56 rounded-2xl p-5 text-white flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl border-4 ${
                hasAccess ? 'border-emerald-400/70 ring-4 ring-emerald-400/20 shadow-lg' : 'border-emerald-950/40 opacity-85'
              } group overflow-hidden`}
              style={{
                background: 'radial-gradient(circle at center, #16a34a 0%, #15803d 50%, #052e16 100%)',
                boxShadow: '0 10px 25px -5px rgba(21, 128, 61, 0.5), inset 0 0 20px rgba(0,0,0,0.3)'
              }}
            >
              {!hasAccess && (
                <div className="absolute top-3.5 left-3.5 bg-black/40 text-emerald-200 p-1.5 rounded-lg backdrop-blur-xs" title="نیازمند دسترسی سالن تولید">
                  <Lock className="w-4 h-4" />
                </div>
              )}

              {productionCount > 0 && (
                <div className="absolute top-3.5 right-3.5 bg-emerald-300 text-slate-950 font-black font-mono text-xs sm:text-sm px-2.5 py-0.5 rounded-md shadow-md">
                  {productionCount}
                </div>
              )}

              <div className="text-white group-hover:scale-110 transition-transform duration-200 drop-shadow-md">
                <ProductionIcon className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>

              <div className="text-center mt-2">
                <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-sm">تولید</h2>
                <span className="text-sm sm:text-base font-serif italic font-bold text-emerald-200 block -mt-0.5">
                  Production
                </span>
              </div>
            </div>
          );
        })()}

        {/* ================= ROW 3, COL 1: EMPTY SLOT (matches original UI) ================= */}
        <div className="hidden lg:block"></div>

        {/* ================= ROW 3, COL 2: برونسپاری (Out-Source) ================= */}
        {(() => {
          const hasAccess = canAccessDepartment(role, 'outsource');
          return (
            <div
              onClick={() => handleTileClick('outsource', 'برونسپاری', 'kanban', 7)}
              className={`relative h-48 sm:h-56 rounded-2xl p-5 text-white flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl border-4 ${
                hasAccess ? 'border-pink-400/70 ring-4 ring-pink-400/20 shadow-lg' : 'border-purple-950/40 opacity-85'
              } group overflow-hidden`}
              style={{
                background: 'radial-gradient(circle at center, #a855f7 0%, #701a75 50%, #3b0764 100%)',
                boxShadow: '0 10px 25px -5px rgba(112, 26, 117, 0.5), inset 0 0 20px rgba(0,0,0,0.3)'
              }}
            >
              {!hasAccess && (
                <div className="absolute top-3.5 left-3.5 bg-black/40 text-pink-200 p-1.5 rounded-lg backdrop-blur-xs" title="نیازمند دسترسی برونسپاری">
                  <Lock className="w-4 h-4" />
                </div>
              )}

              {outsourceCount > 0 && (
                <div className="absolute top-3.5 right-3.5 bg-pink-300 text-slate-950 font-black font-mono text-xs sm:text-sm px-2.5 py-0.5 rounded-md shadow-md">
                  {outsourceCount}
                </div>
              )}

              <div className="text-white group-hover:scale-110 transition-transform duration-200 drop-shadow-md">
                <OutsourceIcon className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>

              <div className="text-center mt-2">
                <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-sm">برونسپاری</h2>
                <span className="text-sm sm:text-base font-serif italic font-bold text-purple-200 block -mt-0.5">
                  Out-Source
                </span>
              </div>
            </div>
          );
        })()}

        {/* ================= ROW 3, COL 3: ورود انبار مصرفی (Log entry and exit) ================= */}
        {(() => {
          const hasAccess = canAccessDepartment(role, 'warehouse');
          return (
            <div
              onClick={() => handleTileClick('warehouse', 'ورود انبار مصرفی', 'kanban', 9)}
              className={`relative h-48 sm:h-56 rounded-2xl p-5 text-white flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl border-4 ${
                hasAccess ? 'border-slate-400/70 ring-4 ring-slate-400/20 shadow-lg' : 'border-slate-800/40 opacity-85'
              } group overflow-hidden`}
              style={{
                background: 'radial-gradient(circle at center, #64748b 0%, #475569 50%, #0f172a 100%)',
                boxShadow: '0 10px 25px -5px rgba(71, 85, 105, 0.5), inset 0 0 20px rgba(0,0,0,0.3)'
              }}
            >
              {!hasAccess && (
                <div className="absolute top-3.5 left-3.5 bg-black/40 text-slate-300 p-1.5 rounded-lg backdrop-blur-xs" title="نیازمند دسترسی انبار">
                  <Lock className="w-4 h-4" />
                </div>
              )}

              {warehouseCount > 0 && (
                <div className="absolute top-3.5 right-3.5 bg-slate-200 text-slate-950 font-black font-mono text-xs sm:text-sm px-2.5 py-0.5 rounded-md shadow-md">
                  {warehouseCount}
                </div>
              )}

              <div className="text-white group-hover:scale-110 transition-transform duration-200 drop-shadow-md">
                <WarehouseIcon className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>

              <div className="text-center mt-2">
                <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-sm">ورود انبار مصرفی</h2>
                <span className="text-sm sm:text-base font-serif italic font-bold text-slate-300 block -mt-0.5">
                  Log entry and exit
                </span>
              </div>
            </div>
          );
        })()}

      </div>

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
