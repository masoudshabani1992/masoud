import React, { useId, useMemo, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { toPersianDigits } from '../utils/jalali.js';

/** Exact Hiddify Manager v14.0.5 Dashboard Series Palette */
export const HIDDIFY_SERIES = {
  usage: '#6366f1',
  usageAvg: '#f59e0b',
  users: '#8b5cf6',
  online: '#10b981',
  upload: '#f97316',
  download: '#06b6d4',
  cpu: '#f59e0b',
  memory: '#6366f1',
  disk: '#0ea5e9',
  neutral: '#94a3b8',
};

export const HIDDIFY_NODE_COLORS = [
  '#6366f1',
  '#f59e0b',
  '#06b6d4',
  '#10b981',
  '#ec4899',
  '#8b5cf6',
];

/** Smooth monotone cubic Bezier SVG path helper */
function buildSmoothPath(pts) {
  if (!pts || pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const cx = (p0.x + p1.x) / 2;
    d += ` C ${cx.toFixed(2)} ${p0.y.toFixed(2)}, ${cx.toFixed(2)} ${p1.y.toFixed(2)}, ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
  }
  return d;
}

/** Exact Hiddify v14.0.5 Sparkline */
export function Sparkline({
  values = [],
  labels = [],
  color = HIDDIFY_SERIES.usage,
  height = 36,
  filled = true,
  formatter = (v) => toPersianDigits(Math.round(v)),
}) {
  const rawId = useId();
  const gradId = `spark-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const [hover, setHover] = useState(null);

  const { linePath, areaPath, points } = useMemo(() => {
    if (!values || values.length === 0) return { linePath: '', areaPath: '', points: [] };
    const max = Math.max(...values, 0);
    const min = Math.min(...values, 0);
    const span = max - min || 1;
    const width = 100;
    const step = values.length > 1 ? width / (values.length - 1) : 0;
    const usable = height - 5;
    const pts = values.map((v, i) => ({
      x: values.length > 1 ? i * step : width / 2,
      y: 2.5 + usable - ((v - min) / span) * usable,
    }));
    const lp = buildSmoothPath(pts);
    const ap =
      pts.length >= 2
        ? `${lp} L ${pts[pts.length - 1].x.toFixed(2)} ${height} L ${pts[0].x.toFixed(2)} ${height} Z`
        : '';
    return { linePath: lp, areaPath: ap, points: pts };
  }, [values, height]);

  const handleMove = (e) => {
    if (!values.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = rect.width ? (e.clientX - rect.left) / rect.width : 0;
    const idx = Math.min(values.length - 1, Math.max(0, Math.round(ratio * (values.length - 1))));
    setHover({ idx, xPct: (idx / Math.max(1, values.length - 1)) * 100 });
  };

  return (
    <div className="relative w-full select-none" dir="ltr">
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        style={{ height: `${height}px`, color }}
        className="block w-full overflow-visible cursor-crosshair"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {filled && areaPath ? <path d={areaPath} fill={`url(#${gradId})`} stroke="none" /> : null}
        {linePath ? (
          <path
            d={linePath}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.85"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
        {hover !== null && points[hover.idx] ? (
          <circle
            cx={points[hover.idx].x}
            cy={points[hover.idx].y}
            r="2.6"
            fill="currentColor"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
      </svg>

      {hover !== null && values[hover.idx] !== undefined && (
        <div
          dir="rtl"
          style={{
            left: `${Math.min(82, Math.max(18, hover.xPct))}%`,
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--p-content-background)',
            borderColor: 'var(--p-content-border-color)',
            color: 'var(--p-text-color)',
          }}
          className="pointer-events-none absolute -top-8 z-30 whitespace-nowrap rounded-lg border px-2 py-1 text-[11px] font-bold shadow-lg tabular-nums"
        >
          {labels[hover.idx] ? `${labels[hover.idx]} · ` : ''}
          {formatter(values[hover.idx])}
        </div>
      )}
    </div>
  );
}

/** Exact Hiddify v14.0.5 TrendChip */
export function TrendChip({ value, label, invert = false }) {
  const isFlat = value === null || value === undefined || Math.abs(value) < 0.05;
  let tone = 'flat';
  if (!isFlat) {
    const positive = value > 0;
    tone = positive === !invert ? 'up' : 'down';
  }

  const rounded =
    value === null || value === undefined
      ? null
      : Math.abs(value) >= 100
      ? Math.round(value)
      : Math.round(value * 10) / 10;

  const text =
    rounded === null
      ? '—'
      : `${value > 0 ? '+' : ''}${toPersianDigits(rounded)}٪`;

  const styles =
    tone === 'up'
      ? {
          color: 'var(--p-green-600)',
          backgroundColor: 'rgba(16, 185, 129, 0.14)',
        }
      : tone === 'down'
      ? {
          color: 'var(--p-red-500)',
          backgroundColor: 'rgba(239, 68, 68, 0.14)',
        }
      : {
          color: 'var(--p-text-muted-color)',
          backgroundColor: 'rgba(148, 163, 184, 0.14)',
        };

  return (
    <span
      style={styles}
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold leading-snug whitespace-nowrap tabular-nums"
    >
      {isFlat ? (
        <Minus className="w-3 h-3" />
      ) : value > 0 ? (
        <ArrowUpRight className="w-3 h-3" />
      ) : (
        <ArrowDownRight className="w-3 h-3" />
      )}
      <bdi>{text}</bdi>
      {label ? <span className="font-medium opacity-80">{label}</span> : null}
    </span>
  );
}

/** Exact Hiddify v14.0.5 StatTile */
export function StatTile({
  label,
  value,
  icon: Icon,
  accent = HIDDIFY_SERIES.usage,
  caption,
  trend,
  trendLabel,
  sparkline = [],
  sparkLabels = [],
  sparkFormatter,
  onClick,
}) {
  return (
    <article
      onClick={onClick}
      style={{ '--tile-accent': accent }}
      className={`hiddify-tile ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            style={{ color: 'var(--p-text-muted-color)' }}
            className="m-0 truncate text-xs font-semibold"
          >
            {label}
          </p>
          <p
            style={{ color: 'var(--p-text-color)' }}
            className="mt-1 mb-0 text-[1.45rem] sm:text-[1.6rem] font-extrabold leading-tight tabular-nums"
          >
            <bdi>{value}</bdi>
          </p>
        </div>

        {Icon ? (
          <span
            style={{
              background: `linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 62%, #000))`,
              boxShadow: `0 8px 18px -10px ${accent}`,
            }}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.85rem] text-white"
          >
            <Icon className="w-5 h-5" />
          </span>
        ) : null}
      </div>

      {sparkline && sparkline.length > 1 ? (
        <div className="-mx-1 my-0.5">
          <Sparkline
            values={sparkline}
            labels={sparkLabels}
            color={accent}
            height={36}
            formatter={sparkFormatter}
          />
        </div>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-0.5">
        {trend !== undefined ? <TrendChip value={trend} label={trendLabel} /> : null}
        {caption ? (
          <span
            style={{ color: 'var(--p-text-muted-color)' }}
            className="text-[11px] font-medium"
          >
            {caption}
          </span>
        ) : null}
      </div>
    </article>
  );
}

/** Exact Hiddify v14.0.5 DashCard */
export function DashCard({
  title,
  subtitle,
  icon: Icon,
  accent = HIDDIFY_SERIES.usage,
  actions,
  footer,
  padded = true,
  children,
  className = '',
}) {
  return (
    <section
      style={{ '--dash-accent': accent }}
      className={`hiddify-dash-card ${className}`}
    >
      {accent ? <div className="hiddify-dash-card__accent" /> : null}

      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4 pb-2">
          <div className="flex items-center gap-3 min-w-0">
            {Icon ? (
              <span
                style={{
                  color: accent,
                  backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)`,
                }}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              >
                <Icon className="w-4 h-4" />
              </span>
            ) : null}
            <div className="min-w-0">
              <h3
                style={{ color: 'var(--p-text-color)' }}
                className="m-0 text-[0.95rem] font-bold leading-snug"
              >
                {title}
              </h3>
              {subtitle ? (
                <p
                  style={{ color: 'var(--p-text-muted-color)' }}
                  className="mt-0.5 mb-0 text-xs"
                >
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>

          {actions ? <div className="flex items-center gap-1.5 shrink-0">{actions}</div> : null}
        </header>
      )}

      <div className={`flex-1 min-h-0 ${padded ? 'px-5 pt-2 pb-4' : ''}`}>{children}</div>

      {footer ? (
        <footer
          style={{
            borderColor: 'var(--p-content-border-color)',
            backgroundColor: 'color-mix(in srgb, var(--p-text-color) 2.5%, transparent)',
          }}
          className="border-t px-5 py-3"
        >
          {footer}
        </footer>
      ) : null}
    </section>
  );
}

/** Exact Hiddify v14.0.5 MiniStat */
export function MiniStat({ label, value, extra, accent = HIDDIFY_SERIES.usage, icon: Icon }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      {Icon ? (
        <Icon className="w-4 h-4 shrink-0" style={{ color: accent }} />
      ) : (
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: accent }}
        />
      )}
      <div className="min-w-0">
        <p
          style={{ color: 'var(--p-text-muted-color)' }}
          className="m-0 truncate text-[11px] font-medium"
        >
          {label}
        </p>
        <p
          style={{ color: 'var(--p-text-color)' }}
          className="mt-0.5 mb-0 truncate text-sm font-extrabold tabular-nums"
        >
          <bdi>{value}</bdi>
          {extra ? (
            <>
              {' · '}
              <bdi className="font-semibold opacity-85">{extra}</bdi>
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}

/** Exact Hiddify v14.0.5 270-degree ResourceGauge */
export function ResourceGauge({
  percent = 0,
  color = HIDDIFY_SERIES.online,
  size = 112,
  value,
  caption,
  autoColor = false,
}) {
  const RADIUS = 42;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const SWEEP = 0.75;
  const clamped = Math.min(100, Math.max(0, Number(percent) || 0));

  let strokeColor = color;
  if (autoColor) {
    if (clamped >= 90) strokeColor = '#ef4444';
    else if (clamped >= 75) strokeColor = '#f59e0b';
  }

  const trackDash = `${CIRCUMFERENCE * SWEEP} ${CIRCUMFERENCE}`;
  const valueDash = `${CIRCUMFERENCE * SWEEP * (clamped / 100)} ${CIRCUMFERENCE}`;

  return (
    <div className="relative shrink-0" style={{ width: `${size}px`, height: `${size}px` }}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke="rgba(148, 163, 184, 0.22)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={trackDash}
          transform="rotate(135 50 50)"
        />
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={valueDash}
          transform="rotate(135 50 50)"
          style={{ transition: 'stroke-dasharray 0.45s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-center">
        <span
          style={{ color: 'var(--p-text-color)' }}
          className="text-base font-extrabold tabular-nums leading-none"
        >
          <bdi>{value ?? `${toPersianDigits(Math.round(clamped))}٪`}</bdi>
        </span>
        {caption ? (
          <span
            style={{ color: 'var(--p-text-muted-color)' }}
            className="text-[10px] font-semibold mt-0.5"
          >
            {caption}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Hiddify v14.0.5 Interactive Stacked Smooth Area Chart
 * Renders smooth Bezier curves with translucent gradient fills, Y-axis ticks on left,
 * Shamsi X-axis ticks below, colored legend dots at top-left, and RTL hover tooltip.
 */
export function SmoothAreaChart({
  labels = [],
  series = [], // [{ label, color, values: number[], dashed?: boolean }]
  stacked = true,
  height = 250,
  valueFormatter = (v) => toPersianDigits(Math.round(v)),
  totalLabel = 'مجموع',
  maxXTicks = 9,
}) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const wrapRef = useRef(null);
  const [hoverIdx, setHoverIdx] = useState(null);

  const W = 720;
  const H = height;
  const PAD_L = 66;
  const PAD_R = 16;
  const PAD_T = 14;
  const PAD_B = 28;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const { layers, yTicks, xTickIndices, maxVal } = useMemo(() => {
    const n = labels.length;
    if (n === 0 || series.length === 0) {
      return { layers: [], yTicks: [0], xTickIndices: [], maxVal: 1 };
    }

    const cumulative = Array(n).fill(0);
    const computedLayers = series.map((s) => {
      const vals = s.values || [];
      const y0Arr = [...cumulative];
      const y1Arr = vals.map((v, i) => {
        const val = Math.max(0, Number(v) || 0);
        if (stacked && !s.dashed) {
          cumulative[i] += val;
          return cumulative[i];
        }
        return val;
      });
      return {
        ...s,
        rawValues: vals.map((v) => Math.max(0, Number(v) || 0)),
        y0Arr: stacked && !s.dashed ? y0Arr : Array(n).fill(0),
        y1Arr,
      };
    });

    let peak = 0;
    for (const l of computedLayers) {
      for (const v of l.y1Arr) if (v > peak) peak = v;
    }
    const niceMax = peak > 0 ? peak * 1.12 : 10;

    const toX = (i) => PAD_L + (n > 1 ? (i / (n - 1)) * plotW : plotW / 2);
    const toY = (v) => PAD_T + plotH - (Math.min(niceMax, v) / niceMax) * plotH;

    const built = computedLayers.map((l, idx) => {
      const topPts = l.y1Arr.map((v, i) => ({ x: toX(i), y: toY(v) }));
      const botPts = l.y0Arr.map((v, i) => ({ x: toX(i), y: toY(v) }));
      const topPath = buildSmoothPath(topPts);

      let areaPath = '';
      if (!l.dashed && topPts.length >= 2) {
        if (stacked && idx > 0) {
          const revBot = [...botPts].reverse();
          const botPath = buildSmoothPath(revBot).replace(/^M/, 'L');
          areaPath = `${topPath} ${botPath} Z`;
        } else {
          const baseLine = PAD_T + plotH;
          areaPath = `${topPath} L ${topPts[topPts.length - 1].x.toFixed(2)} ${baseLine} L ${topPts[0].x.toFixed(2)} ${baseLine} Z`;
        }
      }

      return {
        ...l,
        topPts,
        topPath,
        areaPath,
      };
    });

    const ticks = [0, 0.33, 0.66, 1].map((t) => Math.round(niceMax * t));
    const step = Math.max(1, Math.ceil(n / maxXTicks));
    const xIdxs = [];
    for (let i = 0; i < n; i += step) xIdxs.push(i);
    if (xIdxs[xIdxs.length - 1] !== n - 1 && n > 1) {
      if (n - 1 - xIdxs[xIdxs.length - 1] < step * 0.5) xIdxs[xIdxs.length - 1] = n - 1;
      else xIdxs.push(n - 1);
    }

    return { layers: built, yTicks: ticks, xTickIndices: xIdxs, maxVal: niceMax };
  }, [labels, series, stacked, plotW, plotH, maxXTicks]);

  const handleMove = (e) => {
    if (!labels.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * W;
    const ratio = Math.min(1, Math.max(0, (relX - PAD_L) / plotW));
    const idx = Math.round(ratio * (labels.length - 1));
    setHoverIdx(idx);
  };

  return (
    <div ref={wrapRef} className="relative w-full select-none">
      {/* Legend dots (top-left in RTL layout, matching Hiddify v14.0.5) */}
      {series.length > 0 && (
        <div className="mb-2 flex flex-wrap items-center justify-end gap-4 text-[11px] font-semibold">
          {series.map((s) => (
            <span
              key={s.label}
              style={{ color: 'var(--p-text-muted-color)' }}
              className="inline-flex items-center gap-1.5"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span>{s.label}</span>
            </span>
          ))}
        </div>
      )}

      <div dir="ltr" className="relative w-full">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full overflow-visible"
          style={{ height: `${height}px` }}
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            {layers.map((l, idx) => (
              <linearGradient key={idx} id={`area-${rawId}-${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={l.color} stopOpacity="0.4" />
                <stop offset="100%" stopColor={l.color} stopOpacity="0.05" />
              </linearGradient>
            ))}
          </defs>

          {/* Horizontal Gridlines & Y Ticks */}
          {yTicks.map((tv, idx) => {
            const y = PAD_T + plotH - (tv / maxVal) * plotH;
            return (
              <g key={idx}>
                <line
                  x1={PAD_L}
                  x2={W - PAD_R}
                  y1={y}
                  y2={y}
                  stroke="rgba(148, 163, 184, 0.18)"
                  strokeWidth="1"
                />
                <text
                  x={PAD_L - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="var(--p-text-muted-color)"
                  fontSize="10.5"
                  fontFamily="Vazirmatn, Tahoma, sans-serif"
                >
                  {valueFormatter(tv)}
                </text>
              </g>
            );
          })}

          {/* Vertical Subtle Gridlines & X Ticks */}
          {xTickIndices.map((ti) => {
            const x =
              PAD_L +
              (labels.length > 1 ? (ti / (labels.length - 1)) * plotW : plotW / 2);
            return (
              <g key={ti}>
                <line
                  x1={x}
                  x2={x}
                  y1={PAD_T}
                  y2={PAD_T + plotH}
                  stroke="rgba(148, 163, 184, 0.1)"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={H - 6}
                  textAnchor="middle"
                  fill="var(--p-text-muted-color)"
                  fontSize="10.5"
                  fontFamily="Vazirmatn, Tahoma, sans-serif"
                >
                  {labels[ti]}
                </text>
              </g>
            );
          })}

          {/* Area Fills */}
          {layers.map((l, idx) =>
            l.areaPath ? (
              <path
                key={`fill-${idx}`}
                d={l.areaPath}
                fill={`url(#area-${rawId}-${idx})`}
              />
            ) : null
          )}

          {/* Smooth Stroke Curves */}
          {layers.map((l, idx) =>
            l.topPath ? (
              <path
                key={`line-${idx}`}
                d={l.topPath}
                fill="none"
                stroke={l.color}
                strokeWidth="2.1"
                strokeDasharray={l.dashed ? '5 4' : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null
          )}

          {/* Hover Crosshair & Points */}
          {hoverIdx !== null && labels[hoverIdx] !== undefined && (
            <g>
              {layers[0]?.topPts[hoverIdx] && (
                <line
                  x1={layers[0].topPts[hoverIdx].x}
                  x2={layers[0].topPts[hoverIdx].x}
                  y1={PAD_T}
                  y2={PAD_T + plotH}
                  stroke="rgba(148, 163, 184, 0.45)"
                  strokeDasharray="3 3"
                  strokeWidth="1.2"
                />
              )}
              {layers.map((l, idx) => {
                const pt = l.topPts[hoverIdx];
                if (!pt) return null;
                return (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill={l.color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                );
              })}
            </g>
          )}
        </svg>

        {/* RTL Hover Tooltip */}
        {hoverIdx !== null && labels[hoverIdx] !== undefined && (
          <div
            dir="rtl"
            style={{
              left: `${Math.min(78, Math.max(18, (hoverIdx / Math.max(1, labels.length - 1)) * 84 + 10))}%`,
              top: '12px',
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--p-content-background)',
              borderColor: 'var(--p-content-border-color)',
              color: 'var(--p-text-color)',
            }}
            className="pointer-events-none absolute z-30 min-w-[155px] rounded-xl border p-2.5 text-xs shadow-xl"
          >
            <div className="mb-1.5 font-extrabold border-b pb-1" style={{ borderColor: 'var(--p-content-border-color)' }}>
              {labels[hoverIdx]}
            </div>
            <div className="space-y-1">
              {layers.map((l, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
                    {l.label}
                  </span>
                  <bdi className="font-bold tabular-nums">{valueFormatter(l.rawValues[hoverIdx] || 0)}</bdi>
                </div>
              ))}
            </div>
            {stacked && layers.filter((l) => !l.dashed).length > 1 && (
              <div
                style={{ borderColor: 'var(--p-content-border-color)', color: 'var(--p-text-muted-color)' }}
                className="mt-1.5 pt-1 border-t flex items-center justify-between text-[11px] font-bold"
              >
                <span>{totalLabel}:</span>
                <bdi style={{ color: 'var(--p-text-color)' }} className="tabular-nums">
                  {valueFormatter(
                    layers
                      .filter((l) => !l.dashed)
                      .reduce((s, l) => s + (l.rawValues[hoverIdx] || 0), 0)
                  )}
                </bdi>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Hiddify v14.0.5 Stacked Bar Comparison Chart
 * Used in UsageComparisonCard & UsersComparisonCard (4 buckets: میانگین ماهانه، میانگین هفتگی، دیروز، امروز)
 */
export function StackedBarChart({
  labels = [],
  series = [], // [{ label, color, values: number[] }]
  height = 205,
  showLegend = true,
  valueFormatter = (v) => toPersianDigits(Math.round(v)),
}) {
  const [hoverIdx, setHoverIdx] = useState(null);

  const W = 360;
  const H = height;
  const PAD_L = 58;
  const PAD_R = 12;
  const PAD_T = 12;
  const PAD_B = 28;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const { totals, maxVal, yTicks } = useMemo(() => {
    const n = labels.length;
    const tots = Array(n)
      .fill(0)
      .map((_, i) =>
        series.reduce((sum, s) => sum + Math.max(0, Number(s.values?.[i]) || 0), 0)
      );
    const peak = Math.max(...tots, 0);
    const niceMax = peak > 0 ? peak * 1.15 : 10;
    const ticks = [0, 0.33, 0.66, 1].map((t) => Math.round(niceMax * t));
    return { totals: tots, maxVal: niceMax, yTicks: ticks };
  }, [labels, series]);

  return (
    <div className="relative w-full select-none">
      {showLegend && series.length > 1 && (
        <div className="mb-2 flex flex-wrap items-center justify-end gap-3 text-[11px] font-semibold">
          {series.map((s) => (
            <span
              key={s.label}
              style={{ color: 'var(--p-text-muted-color)' }}
              className="inline-flex items-center gap-1.5"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span>{s.label}</span>
            </span>
          ))}
        </div>
      )}

      <div dir="ltr" className="relative w-full">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" style={{ height: `${height}px` }}>
          {yTicks.map((tv, idx) => {
            const y = PAD_T + plotH - (tv / maxVal) * plotH;
            return (
              <g key={idx}>
                <line
                  x1={PAD_L}
                  x2={W - PAD_R}
                  y1={y}
                  y2={y}
                  stroke="rgba(148, 163, 184, 0.18)"
                  strokeWidth="1"
                />
                <text
                  x={PAD_L - 6}
                  y={y + 4}
                  textAnchor="end"
                  fill="var(--p-text-muted-color)"
                  fontSize="10"
                  fontFamily="Vazirmatn, Tahoma, sans-serif"
                >
                  {valueFormatter(tv)}
                </text>
              </g>
            );
          })}

          {labels.map((lbl, bi) => {
            const slotW = plotW / Math.max(1, labels.length);
            const barW = Math.min(34, slotW * 0.48);
            const cx = PAD_L + slotW * bi + slotW / 2;
            let currentBottom = PAD_T + plotH;

            return (
              <g
                key={bi}
                className="cursor-pointer"
                onMouseEnter={() => setHoverIdx(bi)}
                onMouseLeave={() => setHoverIdx(null)}
              >
                <rect
                  x={PAD_L + slotW * bi}
                  y={PAD_T}
                  width={slotW}
                  height={plotH}
                  fill={hoverIdx === bi ? 'rgba(148, 163, 184, 0.08)' : 'transparent'}
                  rx="6"
                />
                {series.map((s, si) => {
                  const val = Math.max(0, Number(s.values?.[bi]) || 0);
                  const h = (val / maxVal) * plotH;
                  const y = currentBottom - h;
                  currentBottom = y;
                  const isTop =
                    si === series.length - 1 ||
                    series.slice(si + 1).every((ns) => !Number(ns.values?.[bi]));
                  return h > 0 ? (
                    <rect
                      key={si}
                      x={cx - barW / 2}
                      y={y}
                      width={barW}
                      height={Math.max(1.5, h)}
                      fill={s.color}
                      rx={isTop ? 5 : 0}
                    />
                  ) : null;
                })}
                <text
                  x={cx}
                  y={H - 7}
                  textAnchor="middle"
                  fill="var(--p-text-muted-color)"
                  fontSize="9.8"
                  fontFamily="Vazirmatn, Tahoma, sans-serif"
                >
                  {lbl}
                </text>
              </g>
            );
          })}
        </svg>

        {hoverIdx !== null && labels[hoverIdx] !== undefined && (
          <div
            dir="rtl"
            style={{
              left: '50%',
              top: '6px',
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--p-content-background)',
              borderColor: 'var(--p-content-border-color)',
              color: 'var(--p-text-color)',
            }}
            className="pointer-events-none absolute z-30 min-w-[140px] rounded-xl border p-2 text-[11px] shadow-xl"
          >
            <div className="font-extrabold mb-1">{labels[hoverIdx]}</div>
            {series.map((s, si) => (
              <div key={si} className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.label}
                </span>
                <bdi className="font-bold tabular-nums">{valueFormatter(s.values?.[hoverIdx] || 0)}</bdi>
              </div>
            ))}
            {series.length > 1 && (
              <div className="mt-1 pt-1 border-t flex items-center justify-between font-extrabold" style={{ borderColor: 'var(--p-content-border-color)' }}>
                <span>کل:</span>
                <bdi className="tabular-nums">{valueFormatter(totals[hoverIdx] || 0)}</bdi>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
