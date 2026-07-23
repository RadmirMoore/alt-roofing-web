import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Fixed categorical palette — validated dark steps from the dataviz reference
// against the admin card surface (#142a44). Colour follows the entity, never
// its rank, so these keys are stable across every chart.
export const SERIES_COLORS = {
  visitors: "#3987e5", // blue
  sessions: "#199e70", // aqua
  leads: "#e66767", // red (brand-aligned, the money metric)
  calls: "#c98500", // yellow
} as const;

// Ordinal blue ramp for the funnel (single hue, light→dark down the stages).
const FUNNEL_RAMP = ["#5598e7", "#3987e5", "#256abf", "#184f95"];
// Categorical slots for the donut breakdowns.
export const DONUT_COLORS = ["#3987e5", "#199e70", "#9085e9", "#c98500", "#e66767"];

const AXIS = "#8fa3bc"; // muted-foreground token
const GRID = "rgba(237,241,245,0.10)"; // border token

function useContainerWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}

function niceMax(value: number) {
  if (value <= 5) return Math.max(1, value);
  const pow = Math.pow(10, Math.floor(Math.log10(value)));
  const steps = [1, 2, 2.5, 5, 10];
  for (const step of steps) {
    const candidate = step * pow;
    if (candidate >= value) return candidate;
  }
  return 10 * pow;
}

type Series = { key: string; label: string; color: string };
type TrendDatum = { date: string } & Record<string, number | string>;

export function TrendChart({
  title,
  data,
  series,
}: {
  title: string;
  data: TrendDatum[];
  series: Series[];
}) {
  const { ref, width } = useContainerWidth();
  const [hover, setHover] = useState<number | null>(null);
  const height = 240;
  const pad = { top: 16, right: 16, bottom: 26, left: 36 };
  const plotW = Math.max(10, width - pad.left - pad.right);
  const plotH = height - pad.top - pad.bottom;
  const n = data.length;

  const rawMax = Math.max(
    1,
    ...data.flatMap((d) => series.map((s) => Number(d[s.key]) || 0)),
  );
  const yMax = niceMax(rawMax);

  const x = (i: number) =>
    pad.left + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const y = (v: number) => pad.top + plotH - (v / yMax) * plotH;

  const gridVals = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(yMax * f));
  const tickCount = Math.min(n, 6);
  const tickIdx =
    n <= 1
      ? [0]
      : Array.from({ length: tickCount }, (_, k) =>
          Math.round((k / (tickCount - 1)) * (n - 1)),
        );

  const hasData = data.some((d) =>
    series.some((s) => (Number(d[s.key]) || 0) > 0),
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <div className="flex flex-wrap gap-3">
          {series.map((s) => (
            <span
              key={s.key}
              className="inline-flex items-center gap-1.5 text-xs text-foreground/70"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: s.color }}
                aria-hidden="true"
              />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div ref={ref} className="relative mt-4">
        {!hasData ? (
          <div className="flex h-[240px] items-center justify-center text-sm text-foreground/50">
            No data in this range yet.
          </div>
        ) : (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={title}
            onMouseLeave={() => setHover(null)}
          >
            {/* gridlines + y labels */}
            {gridVals.map((v) => (
              <g key={v}>
                <line
                  x1={pad.left}
                  x2={pad.left + plotW}
                  y1={y(v)}
                  y2={y(v)}
                  stroke={GRID}
                  strokeWidth={1}
                />
                <text
                  x={pad.left - 8}
                  y={y(v) + 3}
                  textAnchor="end"
                  fontSize={10}
                  fill={AXIS}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {v}
                </text>
              </g>
            ))}

            {/* x labels */}
            {tickIdx.map((i) => (
              <text
                key={i}
                x={x(i)}
                y={height - 8}
                textAnchor="middle"
                fontSize={10}
                fill={AXIS}
              >
                {String(data[i].date).slice(5)}
              </text>
            ))}

            {/* series lines */}
            {series.map((s) => {
              const path = data
                .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(Number(d[s.key]) || 0)}`)
                .join(" ");
              return (
                <path
                  key={s.key}
                  d={path}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              );
            })}

            {/* end markers */}
            {series.map((s) => (
              <circle
                key={s.key}
                cx={x(n - 1)}
                cy={y(Number(data[n - 1][s.key]) || 0)}
                r={3.5}
                fill={s.color}
                stroke="#142a44"
                strokeWidth={2}
              />
            ))}

            {/* hover crosshair */}
            {hover != null ? (
              <>
                <line
                  x1={x(hover)}
                  x2={x(hover)}
                  y1={pad.top}
                  y2={pad.top + plotH}
                  stroke={AXIS}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                {series.map((s) => (
                  <circle
                    key={s.key}
                    cx={x(hover)}
                    cy={y(Number(data[hover][s.key]) || 0)}
                    r={4}
                    fill={s.color}
                    stroke="#142a44"
                    strokeWidth={2}
                  />
                ))}
              </>
            ) : null}

            {/* mouse capture */}
            <rect
              x={pad.left}
              y={pad.top}
              width={plotW}
              height={plotH}
              fill="transparent"
              onMouseMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const mx = event.clientX - rect.left;
                const i =
                  n <= 1 ? 0 : Math.round((mx / plotW) * (n - 1));
                setHover(Math.min(Math.max(i, 0), n - 1));
              }}
            />
          </svg>
        )}

        {hover != null && hasData ? (
          <div
            className="pointer-events-none absolute z-10 rounded-lg border border-border bg-background/95 px-3 py-2 text-xs shadow-lg"
            style={{
              left: Math.min(Math.max(x(hover) - 60, 0), width - 130),
              top: 4,
            }}
          >
            <div className="mb-1 font-medium text-foreground/70">
              {String(data[hover].date)}
            </div>
            {series.map((s) => (
              <div key={s.key} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: s.color }}
                />
                <span className="text-foreground/60">{s.label}:</span>
                <span className="font-semibold tabular-nums">
                  {Number(data[hover][s.key]) || 0}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function Funnel({
  stages,
}: {
  stages: Array<{ label: string; value: number }>;
}) {
  const top = Math.max(1, stages[0]?.value ?? 0);
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-display text-lg font-semibold">Conversion funnel</h3>
      <div className="mt-5 space-y-3">
        {stages.map((stage, i) => {
          const pctOfTop = Math.round((stage.value / top) * 1000) / 10;
          const prev = i === 0 ? stage.value : stages[i - 1].value;
          const stepPct =
            i === 0 || prev === 0
              ? null
              : Math.round((stage.value / prev) * 1000) / 10;
          return (
            <div key={stage.label}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-foreground/80">{stage.label}</span>
                <span className="text-foreground/60 tabular-nums">
                  {stage.value}
                  <span className="ml-2 text-foreground/40">{pctOfTop}%</span>
                </span>
              </div>
              <div className="mt-1 h-6 overflow-hidden rounded-md bg-background">
                <div
                  className="h-full rounded-md"
                  style={{
                    width: `${Math.max(2, pctOfTop)}%`,
                    background: FUNNEL_RAMP[Math.min(i, FUNNEL_RAMP.length - 1)],
                  }}
                />
              </div>
              {stepPct != null ? (
                <div className="mt-1 text-xs text-foreground/45">
                  {stepPct}% from previous step
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DonutChart({
  title,
  segments,
}: {
  title: string;
  segments: Array<{ label: string; count: number }>;
}) {
  const total = segments.reduce((sum, s) => sum + s.count, 0);
  const size = 132;
  const stroke = 20;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {total === 0 ? (
        <p className="mt-4 text-sm text-foreground/50">No data yet.</p>
      ) : (
        <div className="mt-4 flex items-center gap-5">
          <svg width={size} height={size} className="shrink-0">
            <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
              {segments.map((seg, i) => {
                const frac = seg.count / total;
                const dash = frac * circumference;
                const el = (
                  <circle
                    key={seg.label}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
                    strokeWidth={stroke}
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-offset}
                  >
                    <title>{`${seg.label}: ${seg.count}`}</title>
                  </circle>
                );
                offset += dash;
                return el;
              })}
            </g>
            <text
              x={size / 2}
              y={size / 2 - 2}
              textAnchor="middle"
              fontSize={22}
              fontWeight={700}
              fill="#edf1f5"
            >
              {total}
            </text>
            <text
              x={size / 2}
              y={size / 2 + 16}
              textAnchor="middle"
              fontSize={10}
              fill={AXIS}
            >
              sessions
            </text>
          </svg>
          <div className="min-w-0 flex-1 space-y-2">
            {segments.map((seg, i) => (
              <div
                key={seg.label}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="inline-flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
                    aria-hidden="true"
                  />
                  <span className="truncate text-foreground/80">{seg.label}</span>
                </span>
                <span className="shrink-0 text-foreground/55 tabular-nums">
                  {Math.round((seg.count / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Period-over-period delta pill. Up is good by default; pass invert for
 * metrics where a rise is bad (e.g. exits). Never colour-only: ships an arrow. */
export function DeltaBadge({
  current,
  previous,
  invert = false,
}: {
  current: number;
  previous: number;
  invert?: boolean;
}) {
  if (previous === 0 && current === 0) return null;
  const pct =
    previous === 0 ? 100 : Math.round(((current - previous) / previous) * 1000) / 10;
  const flat = pct === 0;
  const good = invert ? pct < 0 : pct > 0;
  const color = flat ? AXIS : good ? "#0ca30c" : "#d03b3b";
  const Icon = flat ? Minus : pct > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className="inline-flex items-center gap-0.5 text-xs font-medium tabular-nums"
      style={{ color }}
      title="vs previous period"
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {pct > 0 ? "+" : ""}
      {pct}%
    </span>
  );
}
