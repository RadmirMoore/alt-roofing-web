export type AnalyticsEventType =
  | "session_start"
  | "pageview"
  | "click"
  | "exit"
  | "lead"
  | "call"
  | "move_batch";

/** One dwell cell in a mouse-attention batch: grid indices + accumulated weight. */
export type MoveCell = { x: number; y: number; w: number };

export type AnalyticsEvent = {
  id: string;
  type: AnalyticsEventType;
  timestamp: string;
  visitorId: string;
  sessionId: string;
  path: string;
  hash: string;
  referrer: string;
  userAgent: string;
  viewport: { width: number; height: number };
  label?: string;
  target?: string;
  href?: string;
  section?: string;
  durationMs?: number;
  scrollDepth?: number;
  /** Normalized click position across full page width [0..1]. */
  nx?: number;
  /** Normalized click position down full document height [0..1]. */
  ny?: number;
  /** Aggregated mouse-attention dwell grid (only on move_batch events). */
  moveCells?: MoveCell[];
};

export type SessionSummary = {
  sessionId: string;
  visitorId: string;
  startedAt: string;
  endedAt: string;
  lastPath: string;
  lastSection: string;
  pageviews: number;
  clicks: number;
  exited: boolean;
  durationMs: number;
  events: AnalyticsEvent[];
};

export type ReturningVisitor = {
  visitorId: string;
  sessions: number;
  leads: number;
  calls: number;
  firstSeen: string;
  lastSeen: string;
};

/**
 * Fixed heatmap grid resolution, shared by the client tracker (move-dwell
 * aggregation) and the server aggregator (click bucketing). Both sides must
 * agree, so these constants live in the shared types file.
 */
export const HEATMAP_COLS = 40;
export const HEATMAP_ROWS = 120;
/** Number of horizontal bands used for the scroll-reach heatmap. */
export const SCROLL_BANDS = 20;

export type HeatmapType = "click" | "move" | "scroll";
export type HeatmapDevice = "desktop" | "mobile";

export type HeatmapResponse = {
  type: HeatmapType;
  device: HeatmapDevice;
  rangeDays: number;
  grid: { cols: number; rows: number };
  cells: MoveCell[];
  maxWeight: number;
  sampleCount: number;
};

export type PeriodTotals = {
  visitors: number;
  sessions: number;
  pageviews: number;
  clicks: number;
  calls: number;
  leads: number;
  exits: number;
};

export type LabelCount = { label: string; count: number };

export type AnalyticsStats = {
  rangeDays: number;
  generatedAt: string;
  totals: {
    visitors: number;
    returningVisitors: number;
    sessions: number;
    pageviews: number;
    clicks: number;
    calls: number;
    leads: number;
    exits: number;
    avgSessionMs: number;
  };
  /** Same-length window immediately before the current one, for delta arrows. */
  previousTotals: PeriodTotals;
  topPages: LabelCount[];
  topClicks: LabelCount[];
  topSections: LabelCount[];
  exitPages: LabelCount[];
  /** Sessions grouped by referrer, viewport class, and browser family. */
  sources: LabelCount[];
  devices: LabelCount[];
  browsers: LabelCount[];
  dailyVisitors: Array<{
    date: string;
    visitors: number;
    sessions: number;
    leads: number;
    calls: number;
  }>;
  returningVisitors: ReturningVisitor[];
  recentSessions: SessionSummary[];
};

export function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function eventsKey(day: string) {
  return `events:${day}`;
}
