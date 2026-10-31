import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Calendar,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  Cpu,
  FileSpreadsheet,
  Pause,
  Play,
  Printer,
  RefreshCw,
  Server,
  Tag,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { apiRequest } from '../api.js';
import { formatNumber, formatJalaliDateTime, formatToman } from '../utils/format.js';
import { toPersianDigits } from '../utils/jalali.js';
import {
  DashCard,
  HIDDIFY_NODE_COLORS,
  HIDDIFY_SERIES,
  MiniStat,
  ResourceGauge,
  SmoothAreaChart,
  StackedBarChart,
  StatTile,
  TrendChip,
} from './HiddifyPrimitives.jsx';

const RANGE_OPTIONS = [
  { days: 7, label: '۷ روز' },
  { days: 30, label: '۳۰ روز' },
  { days: 90, label: '۹۰ روز' },
  { days: 180, label: '۱۸۰ روز' },
];

function formatCompactToman(amount) {
  const n = Math.round(Number(amount) || 0);
  if (n === 0) return '۰ تومان';
  if (n >= 1_000_000_000) {
    const val = Math.round((n / 1_000_000_000) * 100) / 100;
    return `${toPersianDigits(val)} میلیارد`;
  }
  if (n >= 1_000_000) {
    const val = n >= 100_000_000 ? Math.round(n / 1_000_000) : Math.round((n / 1_000_000) * 10) / 10;
    return `${toPersianDigits(val)} میلیون`;
  }
  if (n >= 1_000) {
    return `${toPersianDigits(Math.round(n / 1_000))} هزار`;
  }
  return `${toPersianDigits(n)} تومان`;
}

function formatAxisToman(amount) {
  const n = Math.round(Number(amount) || 0);
  if (n === 0) return '۰';
  if (n >= 1_000_000) {
    const val = Math.round((n / 1_000_000) * 10) / 10;
    return `${toPersianDigits(val)} م`;
  }
  if (n >= 1_000) {
    return `${toPersianDigits(Math.round(n / 1_000))} هـ`;
  }
  return toPersianDigits(n);
}

function formatUptimeFa(seconds) {
  const s = Math.max(1, Number(seconds) || 0);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  if (days > 0) return `${toPersianDigits(days)} روز ${toPersianDigits(hours)} ساعت`;
  if (hours > 0) return `${toPersianDigits(hours)} ساعت ${toPersianDigits(mins)} دقیقه`;
  return `${toPersianDigits(Math.max(1, mins))} دقیقه`;
}

export default function AdminDashboardView({ onNavigate, onOpenPrintModal }) {
  const [rangeDays, setRangeDays] = useState(30);
  const [cashierId, setCashierId] = useState('all');
  const [live, setLive] = useState(true);
  const [compareMode, setCompareMode] = useState('count'); // 'count' | 'avgAmp' | 'peak'

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);

  const loadDashboard = useCallback(
    async (silent = false) => {
      if (!silent) setRefreshing(true);
      try {
        const res = await apiRequest(
          `/api/admin/dashboard-v14?rangeDays=${rangeDays}&cashierId=${encodeURIComponent(cashierId)}`
        );
        setData(res);
        setError('');
        setUpdatedAt(new Date());
      } catch (err) {
        setError(err.message || 'خطا در دریافت اطلاعات داشبورد');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [rangeDays, cashierId]
  );

  useEffect(() => {
    setLoading(true);
    loadDashboard(false);
  }, [loadDashboard]);

  useEffect(() => {
    if (!live) return undefined;
    const timer = setInterval(() => {
      loadDashboard(true);
    }, 6000);
    return () => clearInterval(timer);
  }, [live, loadDashboard]);

  const updatedClock = useMemo(() => {
    if (!updatedAt) return '—';
    return new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(updatedAt);
  }, [updatedAt]);

  const series = data?.series || [];
  const nodes = data?.nodes || [];
  const salesMetrics = data?.salesMetrics;
  const ops = data?.operations;
  const health = data?.serverHealth;
  const isStacked = cashierId === 'all' && nodes.length > 1;

  // Sparkline arrays (last 14 / 30 days)
  const spark14 = useMemo(() => series.slice(-14), [series]);
  const spark30 = useMemo(() => series.slice(-30), [series]);

  // 1. Sales Trend Stacked Series (per cashier when "all", else single curve + 7d rolling average)
  const salesTrendSeries = useMemo(() => {
    if (isStacked) {
      return nodes.map((n, idx) => ({
        label: n.name,
        color: HIDDIFY_NODE_COLORS[idx % HIDDIFY_NODE_COLORS.length],
        values: series.map((pt) => pt.byCashier?.[n.id]?.netSales || 0),
      }));
    }
    const vals = series.map((pt) => pt.netSales || 0);
    const rolling = vals.map((_, idx) => {
      const slice = vals.slice(Math.max(0, idx - 6), idx + 1);
      return Math.round(slice.reduce((a, b) => a + b, 0) / slice.length);
    });
    return [
      { label: 'فروش روزانه', color: HIDDIFY_SERIES.usage, values: vals },
      { label: 'میانگین ۷ روزه', color: HIDDIFY_SERIES.usageAvg, values: rolling, dashed: true },
    ];
  }, [isStacked, nodes, series]);

  // 2. Sales Comparison 4 Buckets (میانگین ماهانه، میانگین هفتگی، دیروز، امروز)
  const salesComparisonLabels = ['میانگین ماهانه', 'میانگین هفتگی', 'دیروز', 'امروز'];
  const salesComparisonSeries = useMemo(() => {
    if (isStacked) {
      const last30 = series.slice(-30);
      const last7 = series.slice(-7);
      const todayPt = series[series.length - 1];
      const yesterdayPt = series[series.length - 2];
      return nodes.map((n, idx) => {
        const sumN = (pts) => pts.reduce((acc, p) => acc + (p.byCashier?.[n.id]?.netSales || 0), 0);
        return {
          label: n.name,
          color: HIDDIFY_NODE_COLORS[idx % HIDDIFY_NODE_COLORS.length],
          values: [
            Math.round(sumN(last30) / 30),
            Math.round(sumN(last7) / 7),
            yesterdayPt?.byCashier?.[n.id]?.netSales || 0,
            todayPt?.byCashier?.[n.id]?.netSales || 0,
          ],
        };
      });
    }
    return [
      {
        label: 'مبلغ فروش',
        color: HIDDIFY_SERIES.usage,
        values: [
          salesMetrics?.averages?.dailyMonth || 0,
          salesMetrics?.averages?.dailyWeek || 0,
          salesMetrics?.totals?.yesterday || 0,
          salesMetrics?.totals?.today || 0,
        ],
      },
    ];
  }, [isStacked, nodes, series, salesMetrics]);

  // 3. Amperage & Scrap Trend Series
  const ampTrendSeries = useMemo(() => {
    return [
      {
        label: 'آمپر باتری نو (Ah)',
        color: HIDDIFY_SERIES.users,
        values: series.map((pt) => pt.soldAmps || 0),
      },
      {
        label: 'آمپر داغی دریافتی (Ah)',
        color: HIDDIFY_SERIES.download,
        values: series.map((pt) => pt.scrapAmps || 0),
      },
    ];
  }, [series]);

  // 4. Activity & Sepidar Comparison Card (ماه، هفته، دیروز، امروز)
  const activityComparison = useMemo(() => {
    const last30 = series.slice(-30);
    const last7 = series.slice(-7);
    const yesterdayPt = series[series.length - 2] || { invoiceCount: 0, soldAmps: 0 };
    const todayPt = series[series.length - 1] || { invoiceCount: 0, soldAmps: 0 };

    if (compareMode === 'avgAmp') {
      const avgAmp = (pts) => {
        const active = pts.filter((p) => p.soldAmps > 0);
        return active.length
          ? Math.round(active.reduce((a, b) => a + b.soldAmps, 0) / active.length)
          : 0;
      };
      return {
        labels: ['ماه', 'هفته', 'دیروز', 'امروز'],
        values: [avgAmp(last30), avgAmp(last7), yesterdayPt.soldAmps, todayPt.soldAmps],
        formatter: (v) => `${toPersianDigits(Math.round(v))} Ah`,
      };
    }

    if (compareMode === 'peak') {
      const peakAmp = (pts) => pts.reduce((m, p) => Math.max(m, p.soldAmps || 0), 0);
      return {
        labels: ['ماه', 'هفته', 'دیروز', 'امروز'],
        values: [peakAmp(last30), peakAmp(last7), yesterdayPt.soldAmps, todayPt.soldAmps],
        formatter: (v) => `${toPersianDigits(Math.round(v))} Ah`,
      };
    }

    return {
      labels: ['ماه', 'هفته', 'دیروز', 'امروز'],
      values: [
        ops?.invoices?.month || 0,
        ops?.invoices?.week || 0,
        ops?.invoices?.yesterday || 0,
        ops?.invoices?.today || 0,
      ],
      formatter: (v) => `${toPersianDigits(Math.round(v))}`,
    };
  }, [compareMode, series, ops]);

  // 5. Server Health Live Samples
  const healthSamples = health?.samples || [];
  const healthLabels = healthSamples.map((s) => s.timeLabel);

  return (
    <div className="space-y-4">
      {/* Page Header (Exact Hiddify v14.0.5 PageHeader) */}
      <div className="mb-1">
        <h2
          style={{ color: 'var(--p-text-color)' }}
          className="text-2xl font-extrabold m-0 tracking-tight"
        >
          داشبورد
        </h2>
        <p
          style={{ color: 'var(--p-text-muted-color)' }}
          className="text-xs sm:text-sm mt-1.5 mb-0 font-medium"
        >
          فروش، آمپراژ، عملکرد صندوقدارها و سلامت سرویس سپیدار در یک نگاه
        </p>
      </div>

      {/* Dashboard Toolbar (Exact Hiddify v14.0.5 DashboardToolbar) */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-1">
        <span
          style={{ color: error ? '#ef4444' : 'var(--p-text-muted-color)' }}
          className="inline-flex items-center gap-2 text-xs font-semibold tabular-nums"
        >
          <span
            className={
              error
                ? 'w-2 h-2 rounded-full bg-red-500'
                : live
                ? 'hiddify-live-dot'
                : 'w-2 h-2 rounded-full bg-slate-400'
            }
          />
          {error
            ? error
            : live
            ? `زنده · به‌روزرسانی ${updatedClock}`
            : `متوقف · آخرین بروزرسانی ${updatedClock}`}
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {/* Cashier / Node Selector (Matches همه نودها) */}
          <select
            value={cashierId}
            onChange={(e) => setCashierId(e.target.value)}
            style={{
              backgroundColor: 'var(--p-content-background)',
              borderColor: 'var(--p-content-border-color)',
              color: 'var(--p-text-color)',
            }}
            className="rounded-lg border px-3 py-1.5 text-xs font-bold outline-hidden focus:ring-2 focus:ring-blue-500/30 min-w-[165px]"
          >
            <option value="all">همه صندوق‌ها</option>
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>

          {/* Segmented Range Selector (۷ روز | ۳۰ روز | ۹۰ روز | ۱۸۰ روز) */}
          <div
            style={{
              backgroundColor: 'var(--p-content-background)',
              borderColor: 'var(--p-content-border-color)',
            }}
            className="inline-flex items-center rounded-lg border p-0.5"
          >
            {RANGE_OPTIONS.map((opt) => {
              const active = rangeDays === opt.days;
              return (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => setRangeDays(opt.days)}
                  style={
                    active
                      ? {
                          backgroundColor: 'var(--p-primary-color)',
                          color: 'var(--p-primary-contrast-color)',
                        }
                      : { color: 'var(--p-text-muted-color)' }
                  }
                  className="px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer tabular-nums"
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Pause / Resume Live Button */}
          <button
            type="button"
            onClick={() => setLive((v) => !v)}
            style={{
              backgroundColor: 'var(--p-content-background)',
              borderColor: 'var(--p-content-border-color)',
              color: 'var(--p-text-color)',
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold hover:opacity-90 transition cursor-pointer"
          >
            {live ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{live ? 'توقف' : 'ادامه'}</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => loadDashboard(false)}
            title="بروزرسانی آنی"
            style={{
              backgroundColor: 'var(--p-content-background)',
              borderColor: 'var(--p-content-border-color)',
              color: 'var(--p-text-muted-color)',
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border hover:text-blue-600 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Thin top loading bar just like PrimeVue ProgressBar in Hiddify v14.0.5 */}
      {loading && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-blue-500/20">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-blue-600" />
        </div>
      )}

      {/* 4 Signature Hiddify v14.0.5 KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        <StatTile
          label="صندوقدارهای فعال"
          value={`${toPersianDigits(ops?.cashiers?.activeToday ?? 0)} / ${toPersianDigits(
            ops?.cashiers?.totalActive ?? 2
          )}`}
          icon={Users}
          accent={HIDDIFY_SERIES.online}
          caption={`فاکتور امروز: ${formatNumber(ops?.invoices?.today ?? 0)} · صف سپیدار: ${formatNumber(
            (ops?.sepidar?.pending ?? 0) + (ops?.sepidar?.botQueued ?? 0)
          )}`}
          sparkline={spark14.map((p) => p.invoiceCount)}
          sparkLabels={spark14.map((p) => p.label)}
          sparkFormatter={(v) => `${toPersianDigits(Math.round(v))} فاکتور`}
          onClick={() => onNavigate && onNavigate('users')}
        />

        <StatTile
          label="فروش خالص امروز"
          value={formatCompactToman(salesMetrics?.totals?.today ?? 0)}
          icon={Calendar}
          accent={HIDDIFY_SERIES.usage}
          trend={salesMetrics?.trends?.day ?? null}
          trendLabel="نسبت به دیروز"
          caption={`${formatNumber(ops?.invoices?.todayBatteries ?? 0)} دستگاه باتری امروز`}
          sparkline={spark14.map((p) => p.netSales)}
          sparkLabels={spark14.map((p) => p.label)}
          sparkFormatter={(v) => formatToman(v)}
          onClick={() => onNavigate && onNavigate('reports')}
        />

        <StatTile
          label="فروش هفته"
          value={formatCompactToman(salesMetrics?.totals?.week ?? 0)}
          icon={CalendarClock}
          accent={HIDDIFY_SERIES.download}
          trend={salesMetrics?.trends?.week ?? null}
          trendLabel="نسبت به ۷ روز قبل"
          caption={`${formatCompactToman(salesMetrics?.averages?.dailyWeek ?? 0)} در روز`}
          sparkline={spark14.map((p) => p.netSales)}
          sparkLabels={spark14.map((p) => p.label)}
          sparkFormatter={(v) => formatToman(v)}
          onClick={() => onNavigate && onNavigate('reports')}
        />

        <StatTile
          label="فروش ماه"
          value={formatCompactToman(salesMetrics?.totals?.month ?? 0)}
          icon={CalendarPlus}
          accent={HIDDIFY_SERIES.users}
          trend={salesMetrics?.trends?.month ?? null}
          trendLabel="نسبت به ۳۰ روز قبل"
          caption={`${formatCompactToman(salesMetrics?.averages?.dailyMonth ?? 0)} در روز`}
          sparkline={spark30.map((p) => p.netSales)}
          sparkLabels={spark30.map((p) => p.label)}
          sparkFormatter={(v) => formatToman(v)}
          onClick={() => onNavigate && onNavigate('reports')}
        />
      </div>

      {/* Split Row 1: Sales Trend (2fr) + Sales Comparison (1fr) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <DashCard
            title="روند فروش خالص"
            subtitle={
              isStacked
                ? 'فروش هر صندوق به صورت پشته‌ای؛ مجموع، همان سطح پرشده است'
                : `فروش خالص در ${toPersianDigits(rangeDays)} روز گذشته`
            }
            icon={TrendingUp}
            accent={HIDDIFY_SERIES.usage}
            className="h-full"
            footer={
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MiniStat
                  label="کل فروش بازه"
                  value={formatCompactToman(salesMetrics?.totals?.inRange ?? 0)}
                  accent={HIDDIFY_SERIES.usage}
                />
                <MiniStat
                  label="فروش ماه"
                  value={formatCompactToman(salesMetrics?.totals?.month ?? 0)}
                  accent={HIDDIFY_SERIES.users}
                />
                <MiniStat
                  label="فروش هفته"
                  value={formatCompactToman(salesMetrics?.totals?.week ?? 0)}
                  accent={HIDDIFY_SERIES.download}
                />
                <MiniStat
                  label="روز اوج فروش"
                  value={formatCompactToman(salesMetrics?.peakDay?.value ?? 0)}
                  extra={salesMetrics?.peakDay?.label || ''}
                  icon={Zap}
                  accent={HIDDIFY_SERIES.usageAvg}
                />
              </div>
            }
          >
            <SmoothAreaChart
              labels={series.map((p) => p.label)}
              series={salesTrendSeries}
              stacked={isStacked}
              height={245}
              valueFormatter={formatAxisToman}
              totalLabel="مجموع فروش"
              maxXTicks={rangeDays > 60 ? 8 : 10}
            />
          </DashCard>
        </div>

        <div className="lg:col-span-4">
          <DashCard
            title="مقایسه فروش"
            subtitle="فروش امروز و دیروز در مقایسه با میانگین روزانه هفته و ماه"
            icon={BarChart3}
            accent={HIDDIFY_SERIES.usageAvg}
            className="h-full"
            footer={
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--p-text-muted-color)' }}>نسبت به دیروز</span>
                  <TrendChip value={salesMetrics?.trends?.day ?? null} />
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--p-text-muted-color)' }}>نسبت به ۷ روز قبل</span>
                  <TrendChip value={salesMetrics?.trends?.week ?? null} />
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--p-text-muted-color)' }}>نسبت به ۳۰ روز قبل</span>
                  <TrendChip value={salesMetrics?.trends?.month ?? null} />
                </div>
              </div>
            }
          >
            <StackedBarChart
              labels={salesComparisonLabels}
              series={salesComparisonSeries}
              height={208}
              valueFormatter={formatAxisToman}
            />
          </DashCard>
        </div>
      </div>

      {/* Split Row 2: Amperage & Scrap Trend (2fr) + Sepidar Gauge & Activity Comparison (1fr) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <DashCard
            title="روند آمپراژ و دریافت داغی"
            subtitle="آمپراژ باتری نو فروخته‌شده در کنار باتری داغی تحویل‌گرفته‌شده"
            icon={Activity}
            accent={HIDDIFY_SERIES.users}
            className="h-full"
            footer={
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MiniStat
                  label="کل آمپر فروخته‌شده"
                  value={`${formatNumber(ops?.amps?.inRangeSold ?? 0)} Ah`}
                  accent={HIDDIFY_SERIES.users}
                />
                <MiniStat
                  label="کل آمپر داغی دریافتی"
                  value={`${formatNumber(ops?.amps?.inRangeScrap ?? 0)} Ah`}
                  accent={HIDDIFY_SERIES.download}
                />
                <MiniStat
                  label="ثبت‌شده در سپیدار"
                  value={`${formatNumber(ops?.sepidar?.synced ?? 0)} سند`}
                  icon={CheckCircle2}
                  accent={HIDDIFY_SERIES.online}
                />
                <MiniStat
                  label="منتظر تایید مالی"
                  value={`${formatNumber(
                    (ops?.sepidar?.pending ?? 0) + (ops?.sepidar?.botQueued ?? 0)
                  )} سند`}
                  accent={HIDDIFY_SERIES.usageAvg}
                />
              </div>
            }
          >
            <SmoothAreaChart
              labels={series.map((p) => p.label)}
              series={ampTrendSeries}
              stacked={false}
              height={240}
              valueFormatter={(v) => `${toPersianDigits(Math.round(v))} Ah`}
              totalLabel="مجموع آمپر"
              maxXTicks={rangeDays > 60 ? 8 : 10}
            />
          </DashCard>
        </div>

        <div className="lg:col-span-4">
          <DashCard
            title="مقایسه عملکرد و سپیدار"
            subtitle="وضعیت تایید اسناد حسابداری و حجم کاری صندوق"
            icon={Users}
            accent={HIDDIFY_SERIES.online}
            className="h-full"
            actions={
              <div
                style={{
                  backgroundColor: 'var(--surface-ground)',
                  borderColor: 'var(--p-content-border-color)',
                }}
                className="inline-flex items-center rounded-lg border p-0.5 text-[11px]"
              >
                {[
                  { id: 'count', label: 'فاکتور' },
                  { id: 'avgAmp', label: 'میانگین' },
                  { id: 'peak', label: 'اوج' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setCompareMode(m.id)}
                    style={
                      compareMode === m.id
                        ? {
                            backgroundColor: 'var(--p-content-background)',
                            color: 'var(--p-text-color)',
                          }
                        : { color: 'var(--p-text-muted-color)' }
                    }
                    className="px-2 py-0.5 rounded-md font-bold transition cursor-pointer"
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            }
          >
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
              <div className="flex flex-col items-center gap-1 shrink-0">
                <ResourceGauge
                  percent={ops?.sepidar?.syncedPct ?? 100}
                  color={HIDDIFY_SERIES.online}
                  value={`${toPersianDigits(ops?.sepidar?.synced ?? 0)}/${toPersianDigits(
                    ops?.sepidar?.totalValid ?? 0
                  )}`}
                  caption="ثبت‌شده سپیدار"
                  size={112}
                />
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('sepidar')}
                  className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  مشاهده کارتابل سپیدار
                </button>
              </div>

              <div className="flex-1 min-w-0 w-full">
                <StackedBarChart
                  labels={activityComparison.labels}
                  series={[
                    {
                      label: 'عملکرد',
                      color: HIDDIFY_SERIES.online,
                      values: activityComparison.values,
                    },
                  ]}
                  showLegend={false}
                  height={190}
                  valueFormatter={activityComparison.formatter}
                />
              </div>
            </div>

            <div
              style={{
                borderColor: 'var(--p-content-border-color)',
                color: 'var(--p-text-muted-color)',
              }}
              className="mt-3 pt-2.5 border-t border-dashed flex flex-wrap items-center justify-between gap-2 text-xs"
            >
              <span>
                فاکتور ۷ روز اخیر:{' '}
                <strong style={{ color: 'var(--p-text-color)' }} className="tabular-nums">
                  {formatNumber(ops?.invoices?.week ?? 0)}
                </strong>
              </span>
              <span>
                فاکتور ۳۰ روز اخیر:{' '}
                <strong style={{ color: 'var(--p-text-color)' }} className="tabular-nums">
                  {formatNumber(ops?.invoices?.month ?? 0)}
                </strong>
              </span>
            </div>
          </DashCard>
        </div>
      </div>

      {/* Row 3: Node & Sepidar Service Health Card (Exact match to سلامت نودها in Hiddify v14.0.5) */}
      <DashCard
        title="سلامت سرور و سرویس سپیدار"
        subtitle="پردازنده، حافظه (RAM) و وضعیت زنده اتصال سپیدار و پایگاه داده"
        icon={Server}
        accent={HIDDIFY_SERIES.usage}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div
            style={{ borderColor: 'var(--p-content-border-color)' }}
            className="rounded-xl border p-3"
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span style={{ color: 'var(--p-text-muted-color)' }} className="font-bold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-500" />
                پردازنده سرور
              </span>
              <strong style={{ color: 'var(--p-text-color)' }} className="tabular-nums">
                {toPersianDigits(healthSamples[healthSamples.length - 1]?.cpuPct ?? 2.4)}٪
              </strong>
            </div>
            <SmoothAreaChart
              labels={healthLabels}
              series={[
                {
                  label: 'CPU',
                  color: HIDDIFY_SERIES.cpu,
                  values: healthSamples.map((s) => s.cpuPct),
                },
              ]}
              stacked={false}
              height={118}
              valueFormatter={(v) => `${toPersianDigits(Math.round(v * 10) / 10)}٪`}
              maxXTicks={3}
            />
          </div>

          <div
            style={{ borderColor: 'var(--p-content-border-color)' }}
            className="rounded-xl border p-3"
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span style={{ color: 'var(--p-text-muted-color)' }} className="font-bold">
                حافظه (RAM)
              </span>
              <strong style={{ color: 'var(--p-text-color)' }} className="tabular-nums">
                {toPersianDigits(healthSamples[healthSamples.length - 1]?.memPct ?? 32)}٪
              </strong>
            </div>
            <SmoothAreaChart
              labels={healthLabels}
              series={[
                {
                  label: 'RAM',
                  color: HIDDIFY_SERIES.memory,
                  values: healthSamples.map((s) => s.memPct),
                },
              ]}
              stacked={false}
              height={118}
              valueFormatter={(v) => `${toPersianDigits(Math.round(v))}٪`}
              maxXTicks={3}
            />
          </div>

          <div
            style={{ borderColor: 'var(--p-content-border-color)' }}
            className="rounded-xl border p-3"
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span style={{ color: 'var(--p-text-muted-color)' }} className="font-bold">
                آمپراژ روزانه شبکه فروش
              </span>
              <strong style={{ color: 'var(--p-text-color)' }} className="tabular-nums">
                {formatNumber(ops?.amps?.todaySold ?? 0)} Ah
              </strong>
            </div>
            <SmoothAreaChart
              labels={spark14.map((p) => p.label)}
              series={[
                {
                  label: 'آمپر فروش',
                  color: HIDDIFY_SERIES.download,
                  values: spark14.map((p) => p.soldAmps),
                },
              ]}
              stacked={false}
              height={118}
              valueFormatter={(v) => `${toPersianDigits(Math.round(v))} Ah`}
              maxXTicks={3}
            />
          </div>
        </div>

        {/* Node Health Table (Matches bottom table in Hiddify v14.0.5) */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr
                style={{
                  borderColor: 'var(--p-content-border-color)',
                  color: 'var(--p-text-muted-color)',
                }}
                className="border-b font-bold"
              >
                <th className="py-2.5 px-3">سرویس / نود</th>
                <th className="py-2.5 px-3">مدت روشن بودن</th>
                <th className="py-2.5 px-3">نسخه پنل</th>
                <th className="py-2.5 px-3">پایگاه داده</th>
                <th className="py-2.5 px-3">آمپر خروجی (ماه)</th>
                <th className="py-2.5 px-3">داغی ورودی (ماه)</th>
                <th className="py-2.5 px-3">سریال لیبل بعدی</th>
                <th className="py-2.5 px-3">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--p-content-border-color)' }}>
              <tr>
                <td className="py-3 px-3 font-extrabold">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                    <span>این سرور (اتوماسیون وب باتری کاوه)</span>
                  </span>
                </td>
                <td className="py-3 px-3 tabular-nums font-semibold">
                  {formatUptimeFa(health?.osUptimeSeconds || health?.uptimeSeconds || 3600)}
                </td>
                <td className="py-3 px-3 tabular-nums font-bold">۱۴.۰.۵</td>
                <td className="py-3 px-3 tabular-nums font-semibold">
                  {toPersianDigits(health?.dbSizeKb ?? 64)} کیلوبایت
                </td>
                <td className="py-3 px-3 tabular-nums font-bold">
                  {formatNumber(ops?.amps?.monthSold ?? 0)} آمپر
                </td>
                <td className="py-3 px-3 tabular-nums font-bold">
                  {formatNumber(ops?.amps?.inRangeScrap ?? 0)} آمپر
                </td>
                <td className="py-3 px-3 tabular-nums font-extrabold text-blue-600" dir="ltr">
                  #{toPersianDigits(health?.nextLabelNumber ?? 1500)}
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
                    آنلاین · پورت ۳۰۰۰
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-3 px-3 font-extrabold">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span>سرویس ارتباط سپیدار سیستم (طبقه بالا)</span>
                  </span>
                </td>
                <td className="py-3 px-3 font-semibold">
                  {health?.sepidarMode === 'windows_bot'
                    ? 'حالت ربات بومی ویندوز (.EXE)'
                    : health?.sepidarMode === 'api'
                    ? 'وب‌سرویس مستقیم سپیدار'
                    : 'خروجی اکسل استاندارد'}
                </td>
                <td className="py-3 px-3 tabular-nums font-bold">۱۴.۰.۵</td>
                <td className="py-3 px-3 font-semibold">SQL / Queue</td>
                <td className="py-3 px-3 tabular-nums font-bold text-emerald-600">
                  {formatNumber(ops?.sepidar?.synced ?? 0)} سند ثبت‌شده
                </td>
                <td className="py-3 px-3 tabular-nums font-bold text-amber-600">
                  {formatNumber((ops?.sepidar?.pending ?? 0) + (ops?.sepidar?.botQueued ?? 0))} در صف تایید
                </td>
                <td className="py-3 px-3 font-semibold">{health?.botHost || 'Windows-Server'}</td>
                <td className="py-3 px-3">
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('sepidar')}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-bold text-blue-600 hover:bg-blue-500/25 transition cursor-pointer"
                  >
                    مدیریت کارتابل
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </DashCard>

      {/* Row 4: Quick Recent Invoices & One-Click Dual Printing */}
      <DashCard
        title="آخرین فاکتورهای صادرشده در صندوق"
        subtitle="چاپ مجدد لیبل بارکد (۱۵۰۰+) و فیش ۸ سانتی یا بررسی وضعیت ثبت در سپیدار"
        icon={FileSpreadsheet}
        accent={HIDDIFY_SERIES.download}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('pos')}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
            >
              + ثبت فاکتور جدید
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr
                style={{
                  borderColor: 'var(--p-content-border-color)',
                  color: 'var(--p-text-muted-color)',
                }}
                className="border-b font-bold"
              >
                <th className="py-2.5 px-3">شماره لیبل</th>
                <th className="py-2.5 px-3">شماره فاکتور</th>
                <th className="py-2.5 px-3">شرح باتری و برند</th>
                <th className="py-2.5 px-3">داغی دریافتی</th>
                <th className="py-2.5 px-3">صندوقدار</th>
                <th className="py-2.5 px-3">مبلغ خالص</th>
                <th className="py-2.5 px-3">وضعیت سپیدار</th>
                <th className="py-2.5 px-3">زمان ثبت</th>
                <th className="py-2.5 px-3">چاپ</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--p-content-border-color)' }}>
              {(data?.recentSales || []).map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-500/5 transition">
                  <td className="py-2.5 px-3 font-extrabold text-blue-600 tabular-nums" dir="ltr">
                    #{sale.label_number}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-[11px]" dir="ltr">
                    {sale.invoice_number}
                  </td>
                  <td className="py-2.5 px-3 font-bold">
                    {sale.category_name} {sale.brand_name} — {formatNumber(sale.amperage)} آمپر
                    {sale.quantity > 1 ? ` (×${formatNumber(sale.quantity)})` : ''}
                  </td>
                  <td className="py-2.5 px-3">
                    {sale.has_scrap ? (
                      <span className="text-amber-600 font-semibold">
                        {formatNumber(sale.scrap_amperage)} Ah (-{formatCompactToman(sale.scrap_deduction_amount)})
                      </span>
                    ) : (
                      <span style={{ color: 'var(--p-text-muted-color)' }}>بدون داغی</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-medium">{sale.cashier_name}</td>
                  <td className="py-2.5 px-3 font-extrabold tabular-nums">
                    {formatToman(sale.final_sale_amount)}
                  </td>
                  <td className="py-2.5 px-3">
                    {sale.sepidar_status === 'synced' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
                        ثبت‌شده ({sale.sepidar_doc_number})
                      </span>
                    ) : sale.sepidar_status === 'bot_queued' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-bold text-blue-600">
                        در صف ربات ویندوزی
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onNavigate && onNavigate('sepidar')}
                        className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 hover:bg-amber-500/25 cursor-pointer"
                      >
                        منتظر تایید مالی
                      </button>
                    )}
                  </td>
                  <td
                    style={{ color: 'var(--p-text-muted-color)' }}
                    className="py-2.5 px-3 text-[11px] tabular-nums"
                  >
                    {formatJalaliDateTime(sale.created_at)}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenPrintModal && onOpenPrintModal(sale, 'label')}
                        title="چاپ لیبل بارکد"
                        className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 cursor-pointer"
                      >
                        <Tag className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenPrintModal && onOpenPrintModal(sale, 'receipt')}
                        title="چاپ فیش ۸ سانتی"
                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashCard>
    </div>
  );
}
