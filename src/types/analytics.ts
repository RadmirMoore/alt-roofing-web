export type AnalyticsEventType =
  | "session_start"
  | "pageview"
  | "click"
  | "exit";

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

export type AnalyticsStats = {
  rangeDays: number;
  generatedAt: string;
  totals: {
    visitors: number;
    sessions: number;
    pageviews: number;
    clicks: number;
    exits: number;
    avgSessionMs: number;
  };
  topPages: Array<{ label: string; count: number }>;
  topClicks: Array<{ label: string; count: number }>;
  topSections: Array<{ label: string; count: number }>;
  exitPages: Array<{ label: string; count: number }>;
  dailyVisitors: Array<{ date: string; visitors: number; sessions: number }>;
  recentSessions: SessionSummary[];
};
