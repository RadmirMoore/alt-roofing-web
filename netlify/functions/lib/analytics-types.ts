export type AnalyticsEventType =
  | "session_start"
  | "pageview"
  | "click"
  | "exit"
  | "lead"
  | "call";

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
  topPages: Array<{ label: string; count: number }>;
  topClicks: Array<{ label: string; count: number }>;
  topSections: Array<{ label: string; count: number }>;
  exitPages: Array<{ label: string; count: number }>;
  dailyVisitors: Array<{ date: string; visitors: number; sessions: number }>;
  returningVisitors: ReturningVisitor[];
  recentSessions: SessionSummary[];
};

export function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function eventsKey(day: string) {
  return `events:${day}`;
}
