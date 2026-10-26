import React, { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronRight, ChevronLeft, X } from 'lucide-react';
import {
  JALALI_MONTH_NAMES,
  JALALI_WEEKDAYS_SHORT,
  getTodayJalaliTehran,
  jalaliMonthLength,
  getJalaliWeekdaySatZero,
  parseGregorianIsoDate,
  jalaliToGregorianIso,
  toPersianDigits,
} from '../utils/jalali.js';

export default function JalaliDatePicker({
  value, // 'YYYY-MM-DD' Gregorian ISO or ''
  onChange, // (newIsoString) => void
  placeholder = 'انتخاب تاریخ شمسی...',
}) {
  const today = getTodayJalaliTehran();
  const parsed = parseGregorianIsoDate(value);

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsed?.jy || today.jy);
  const [viewMonth, setViewMonth] = useState(parsed?.jm || today.jm);
  const containerRef = useRef(null);

  useEffect(() => {
    const p = parseGregorianIsoDate(value);
    if (p) {
      setViewYear(p.jy);
      setViewMonth(p.jm);
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  const goPrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const selectDay = (day) => {
    const iso = jalaliToGregorianIso(viewYear, viewMonth, day);
    onChange(iso);
    setOpen(false);
  };

  const selectToday = () => {
    const t = getTodayJalaliTehran();
    setViewYear(t.jy);
    setViewMonth(t.jm);
    onChange(jalaliToGregorianIso(t.jy, t.jm, t.jd));
    setOpen(false);
  };

  const clearDate = (e) => {
    if (e) e.stopPropagation();
    onChange('');
    setOpen(false);
  };

  const daysInMonth = jalaliMonthLength(viewYear, viewMonth);
  const startOffset = getJalaliWeekdaySatZero(viewYear, viewMonth, 1);

  const displayLabel = parsed
    ? `${toPersianDigits(parsed.jy)}/${toPersianDigits(String(parsed.jm).padStart(2, '0'))}/${toPersianDigits(
        String(parsed.jd).padStart(2, '0')
      )} (${toPersianDigits(parsed.jd)} ${JALALI_MONTH_NAMES[parsed.jm - 1]})`
    : '';

  const yearOptions = [];
  for (let y = today.jy - 5; y <= today.jy + 5; y += 1) {
    yearOptions.push(y);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Input */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full px-3 py-2 rounded-xl border bg-white flex items-center justify-between gap-2 text-xs font-bold transition cursor-pointer ${
          open
            ? 'border-amber-500 ring-2 ring-amber-500/20'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
          {displayLabel ? (
            <span className="text-slate-900 font-extrabold tabular-nums">{displayLabel}</span>
          ) : (
            <span className="text-slate-400 font-semibold">{placeholder}</span>
          )}
        </span>

        {parsed && (
          <span
            role="button"
            tabIndex={0}
            onClick={clearDate}
            onKeyDown={(e) => e.key === 'Enter' && clearDate(e)}
            className="p-0.5 rounded-md hover:bg-rose-100 text-slate-400 hover:text-rose-600 shrink-0"
            title="پاک کردن تاریخ"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {/* Dropdown Jalali Calendar */}
      {open && (
        <div className="absolute right-0 mt-1.5 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 select-none">
          {/* Header: Month / Year navigation */}
          <div className="flex items-center justify-between gap-1.5 mb-3 pb-2.5 border-b border-slate-100">
            <button
              type="button"
              onClick={goPrevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
              title="ماه قبل"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs font-extrabold text-slate-900 cursor-pointer"
              >
                {JALALI_MONTH_NAMES.map((mName, idx) => (
                  <option key={mName} value={idx + 1}>
                    {mName}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs font-extrabold text-slate-900 cursor-pointer"
              >
                {yearOptions.map((yr) => (
                  <option key={yr} value={yr}>
                    {toPersianDigits(yr)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={goNextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
              title="ماه بعد"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Headers (شنبه تا جمعه) */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {JALALI_WEEKDAYS_SHORT.map((wd, idx) => (
              <div
                key={wd}
                className={`text-[11px] font-black py-1 ${
                  idx === 6 ? 'text-rose-600' : 'text-slate-500'
                }`}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}

            {Array.from({ length: daysInMonth }, (_, idx) => {
              const day = idx + 1;
              const isSelected =
                parsed &&
                parsed.jy === viewYear &&
                parsed.jm === viewMonth &&
                parsed.jd === day;
              const isToday =
                today.jy === viewYear &&
                today.jm === viewMonth &&
                today.jd === day;
              const weekdayIdx = (startOffset + idx) % 7;
              const isFriday = weekdayIdx === 6;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`h-8 rounded-lg text-xs font-bold tabular-nums transition flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-amber-400 font-black shadow-xs'
                      : isToday
                      ? 'bg-amber-50 text-amber-900 ring-2 ring-amber-400 font-black'
                      : isFriday
                      ? 'text-rose-600 hover:bg-rose-50'
                      : 'text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {toPersianDigits(day)}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Actions */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={selectToday}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black cursor-pointer"
            >
              امروز ({toPersianDigits(today.jd)} {JALALI_MONTH_NAMES[today.jm - 1]})
            </button>

            <button
              type="button"
              onClick={clearDate}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
            >
              پاک کردن
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
