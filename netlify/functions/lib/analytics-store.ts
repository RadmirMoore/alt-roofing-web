import { getStore } from "@netlify/blobs";
import type {
  AnalyticsEvent,
  AnalyticsStats,
  HeatmapDevice,
  HeatmapResponse,
  HeatmapType,
  MoveCell,
  PeriodTotals,
  ReturningVisitor,
  SessionSummary,
} from "./analytics-types";
import {
  dayKey,
  eventsKey,
  HEATMAP_COLS,
  HEATMAP_ROWS,
  SCROLL_BANDS,
} from "./analytics-types";
import { deriveSourceLabel } from "./attribution";

function getAnalyticsStore() {
  return getStore({ name: "alt-analytics", consistency: "strong" });
}

export async function appendEvent(event: AnalyticsEvent): Promise<void> {
  const store = getAnalyticsStore();
  const key = eventsKey(dayKey(new Date(event.timestamp)));
  const existing = (await store.get(key, { type: "json" })) as AnalyticsEvent[] | null;
  const events = existing ?? [];
  events.push(event);

  const maxEventsPerDay = 5000;
  const trimmed =
    events.length > maxEventsPerDay
      ? events.slice(events.length - maxEventsPerDay)
      : events;

  await store.setJSON(key, trimmed);
}

async function loadEvents(days: number): Promise<AnalyticsEvent[]> {
  const store = getAnalyticsStore();
  const all: AnalyticsEvent[] = [];
  const now = new Date();

  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(now);
    date.setUTCDate(now.getUTCDate() - offset);
    const key = eventsKey(dayKey(date));
    const events = (await store.get(key, { type: "json" })) as AnalyticsEvent[] | null;
    if (events?.length) {
      all.push(...events);
    }
  }

  return all.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}

function pageLabel(event: AnalyticsEvent) {
  const hash = event.hash?.replace(/^#/, "");
  if (hash) return `#${hash}`;
  return event.path || "/";
}

function buildSessionSummaries(events: AnalyticsEvent[]): SessionSummary[] {
  const bySession = new Map<string, AnalyticsEvent[]>();

  for (const event of events) {
    const list = bySession.get(event.sessionId) ?? [];
    list.push(event);
    bySession.set(event.sessionId, list);
  }

  const summaries: SessionSummary[] = [];

  for (const [sessionId, sessionEvents] of bySession) {
    const sorted = [...sessionEvents].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const exitEvent = sorted.find((event) => event.type === "exit");
    const startedAt = first.timestamp;
    const endedAt = last.timestamp;
    const durationMs =
      exitEvent?.durationMs ??
      Math.max(0, new Date(endedAt).getTime() - new Date(startedAt).getTime());

    summaries.push({
      sessionId,
      visitorId: first.visitorId,
      startedAt,
      endedAt,
      lastPath: last.path,
      lastSection: last.section ?? pageLabel(last),
      pageviews: sorted.filter((event) => event.type === "pageview").length,
      clicks: sorted.filter((event) => event.type === "click").length,
      exited: Boolean(exitEvent),
      durationMs,
      events: sorted,
    });
  }

  return summaries.sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );
}

function increment(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function topEntries(map: Map<string, number>, limit = 10) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

/** Headline counts for a set of events — used for both the current window and
 * the immediately-preceding window that powers the delta arrows. */
function computeTotals(events: AnalyticsEvent[]): PeriodTotals {
  return {
    visitors: new Set(events.map((event) => event.visitorId)).size,
    sessions: new Set(events.map((event) => event.sessionId)).size,
    pageviews: events.filter((event) => event.type === "pageview").length,
    clicks: events.filter((event) => event.type === "click").length,
    calls: events.filter((event) => event.type === "call").length,
    leads: events.filter((event) => event.type === "lead").length,
    exits: events.filter((event) => event.type === "exit").length,
  };
}

const REFERRER_NAMES: Array<[RegExp, string]> = [
  [/(^|\.)google\./, "Google"],
  [/(^|\.)bing\./, "Bing"],
  [/duckduckgo\./, "DuckDuckGo"],
  [/(^|\.)yahoo\./, "Yahoo"],
  [/facebook\.|(^|\.)fb\./, "Facebook"],
  [/instagram\./, "Instagram"],
  [/(^|\.)t\.co$|twitter\.|(^|\.)x\.com$/, "X / Twitter"],
  [/youtube\.|youtu\.be/, "YouTube"],
  [/linkedin\./, "LinkedIn"],
  [/yelp\./, "Yelp"],
  [/reddit\./, "Reddit"],
  [/tiktok\./, "TikTok"],
];

function referrerLabel(referrer: string): string {
  const raw = referrer?.trim();
  if (!raw) return "Direct / none";
  let host: string;
  try {
    host = new URL(raw).hostname.replace(/^www\./, "");
  } catch {
    host = raw.replace(/^www\./, "").split("/")[0];
  }
  if (!host) return "Direct / none";
  for (const [pattern, name] of REFERRER_NAMES) {
    if (pattern.test(host)) return name;
  }
  return host;
}

function deviceLabel(width: number): string {
  if (!width || width <= 0) return "Unknown";
  if (width < 768) return "Mobile";
  if (width < 1024) return "Tablet";
  return "Desktop";
}

function browserLabel(userAgent: string): string {
  const ua = userAgent ?? "";
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
  return "Other";
}

export async function getAnalyticsStats(days: number): Promise<AnalyticsStats> {
  const rangeDays = Math.min(Math.max(days, 1), 90);

  // Load two windows in one pass and split them, so the previous period is
  // available for deltas without a second round of blob reads.
  const allEvents = await loadEvents(rangeDays * 2);
  const boundaryDay = dayKey(
    new Date(Date.now() - (rangeDays - 1) * 24 * 60 * 60 * 1000),
  );
  const events: AnalyticsEvent[] = [];
  const previousEvents: AnalyticsEvent[] = [];
  for (const event of allEvents) {
    if (dayKey(new Date(event.timestamp)) >= boundaryDay) events.push(event);
    else previousEvents.push(event);
  }

  const sessions = buildSessionSummaries(events);
  const core = computeTotals(events);
  const previousTotals = computeTotals(previousEvents);
  const returningVisitors = buildReturningVisitors(events, sessions);

  const pageMap = new Map<string, number>();
  const clickMap = new Map<string, number>();
  const sectionMap = new Map<string, number>();
  const exitMap = new Map<string, number>();
  const dailyMap = new Map<
    string,
    { visitors: Set<string>; sessions: Set<string>; leads: number; calls: number }
  >();

  for (const event of events) {
    const date = dayKey(new Date(event.timestamp));
    const daily =
      dailyMap.get(date) ??
      { visitors: new Set<string>(), sessions: new Set<string>(), leads: 0, calls: 0 };
    daily.visitors.add(event.visitorId);
    daily.sessions.add(event.sessionId);
    if (event.type === "lead") daily.leads += 1;
    if (event.type === "call") daily.calls += 1;
    dailyMap.set(date, daily);

    if (event.type === "pageview") {
      increment(pageMap, pageLabel(event));
      if (event.section) increment(sectionMap, event.section);
    }

    if (event.type === "click") {
      increment(clickMap, event.label ?? event.target ?? "Unknown click");
    }

    if (event.type === "exit") {
      increment(exitMap, event.section ?? pageLabel(event));
    }
  }

  // Referrer / device / browser breakdowns, counted once per session using the
  // session's first event (which carries the entry referrer + viewport + UA).
  const sourceMap = new Map<string, number>();
  const deviceMap = new Map<string, number>();
  const browserMap = new Map<string, number>();
  for (const session of sessions) {
    const first = session.events[0];
    if (!first) continue;
    increment(sourceMap, referrerLabel(first.referrer));
    increment(deviceMap, deviceLabel(first.viewport?.width ?? 0));
    increment(browserMap, browserLabel(first.userAgent));
  }

  const avgSessionMs =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((sum, session) => sum + session.durationMs, 0) /
            sessions.length,
        )
      : 0;

  const dailyVisitors = [...dailyMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({
      date,
      visitors: value.visitors.size,
      sessions: value.sessions.size,
      leads: value.leads,
      calls: value.calls,
    }));

  return {
    rangeDays,
    generatedAt: new Date().toISOString(),
    totals: {
      visitors: core.visitors,
      returningVisitors: returningVisitors.length,
      sessions: core.sessions,
      pageviews: core.pageviews,
      clicks: core.clicks,
      calls: core.calls,
      leads: core.leads,
      exits: core.exits,
      avgSessionMs,
    },
    previousTotals,
    topPages: topEntries(pageMap),
    topClicks: topEntries(clickMap),
    topSections: topEntries(sectionMap),
    exitPages: topEntries(exitMap),
    sources: topEntries(sourceMap),
    devices: topEntries(deviceMap),
    browsers: topEntries(browserMap),
    dailyVisitors,
    returningVisitors,
    recentSessions: sessions.slice(0, 50),
  };
}

function buildReturningVisitors(
  events: AnalyticsEvent[],
  sessions: SessionSummary[],
): ReturningVisitor[] {
  const sessionsByVisitor = new Map<string, number>();
  for (const session of sessions) {
    sessionsByVisitor.set(
      session.visitorId,
      (sessionsByVisitor.get(session.visitorId) ?? 0) + 1,
    );
  }

  const stats = new Map<
    string,
    { leads: number; calls: number; firstSeen: string; lastSeen: string }
  >();
  for (const event of events) {
    const entry = stats.get(event.visitorId) ?? {
      leads: 0,
      calls: 0,
      firstSeen: event.timestamp,
      lastSeen: event.timestamp,
    };
    if (event.type === "lead") entry.leads += 1;
    if (event.type === "call") entry.calls += 1;
    if (event.timestamp < entry.firstSeen) entry.firstSeen = event.timestamp;
    if (event.timestamp > entry.lastSeen) entry.lastSeen = event.timestamp;
    stats.set(event.visitorId, entry);
  }

  const returning: ReturningVisitor[] = [];
  for (const [visitorId, sessionCount] of sessionsByVisitor) {
    if (sessionCount < 2) continue;
    const entry = stats.get(visitorId);
    returning.push({
      visitorId,
      sessions: sessionCount,
      leads: entry?.leads ?? 0,
      calls: entry?.calls ?? 0,
      firstSeen: entry?.firstSeen ?? "",
      lastSeen: entry?.lastSeen ?? "",
    });
  }

  return returning
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 25);
}

export type CallIntent = {
  /** One intent per session; the session id doubles as a stable key. */
  id: string;
  at: string;
  visitorId: string;
  section?: string;
  source: string;
  device: string;
  /** Number of tel: clicks in that session (repeated taps to dial). */
  count: number;
};

/**
 * Phone-number ("tel:") clicks, grouped into one intent per session. A website
 * can't know WHO called from a tel: click — but it can show that someone tried,
 * from where, and via which traffic source. This powers the free call log.
 */
export async function getCallIntents(days: number): Promise<CallIntent[]> {
  const rangeDays = Math.min(Math.max(days, 1), 90);
  const events = await loadEvents(rangeDays);

  const bySession = new Map<string, AnalyticsEvent[]>();
  for (const event of events) {
    if (event.type !== "call") continue;
    const list = bySession.get(event.sessionId) ?? [];
    list.push(event);
    bySession.set(event.sessionId, list);
  }

  const intents: CallIntent[] = [];
  for (const [sessionId, calls] of bySession) {
    const sorted = calls.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    const first = sorted[0];
    intents.push({
      id: sessionId,
      at: first.timestamp,
      visitorId: first.visitorId,
      section: first.section,
      source: deriveSourceLabel({ referrer: first.referrer }),
      device: deviceLabel(first.viewport?.width ?? 0),
      count: sorted.length,
    });
  }

  return intents.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
}

export function sanitizeIncomingEvent(raw: unknown): AnalyticsEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const event = raw as Partial<AnalyticsEvent>;
  const allowed: AnalyticsEvent["type"][] = [
    "session_start",
    "pageview",
    "click",
    "exit",
    "lead",
    "call",
    "move_batch",
  ];

  if (!event.type || !allowed.includes(event.type)) return null;
  if (!event.visitorId || !event.sessionId) return null;
  if (typeof event.path !== "string") return null;

  return {
    id: String(event.id ?? crypto.randomUUID()).slice(0, 64),
    type: event.type,
    timestamp: event.timestamp ?? new Date().toISOString(),
    visitorId: String(event.visitorId).slice(0, 64),
    sessionId: String(event.sessionId).slice(0, 64),
    path: String(event.path).slice(0, 200),
    hash: String(event.hash ?? "").slice(0, 100),
    referrer: String(event.referrer ?? "").slice(0, 500),
    userAgent: String(event.userAgent ?? "").slice(0, 300),
    viewport: {
      width: Number(event.viewport?.width ?? 0),
      height: Number(event.viewport?.height ?? 0),
    },
    label: event.label ? String(event.label).slice(0, 200) : undefined,
    target: event.target ? String(event.target).slice(0, 200) : undefined,
    href: event.href ? String(event.href).slice(0, 500) : undefined,
    section: event.section ? String(event.section).slice(0, 100) : undefined,
    durationMs:
      typeof event.durationMs === "number"
        ? Math.min(event.durationMs, 86_400_000)
        : undefined,
    scrollDepth:
      typeof event.scrollDepth === "number"
        ? Math.min(Math.max(event.scrollDepth, 0), 100)
        : undefined,
    nx: clamp01OrUndefined(event.nx),
    ny: clamp01OrUndefined(event.ny),
    moveCells: sanitizeMoveCells(event.moveCells),
  };
}

function clamp01OrUndefined(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.min(1, Math.max(0, value));
}

function sanitizeMoveCells(raw: unknown): MoveCell[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const maxCells = 2000;
  const cells: MoveCell[] = [];
  for (const item of raw) {
    if (cells.length >= maxCells) break;
    if (!item || typeof item !== "object") continue;
    const cell = item as Partial<MoveCell>;
    const x = Number(cell.x);
    const y = Number(cell.y);
    const w = Number(cell.w);
    if (!Number.isInteger(x) || x < 0 || x >= HEATMAP_COLS) continue;
    if (!Number.isInteger(y) || y < 0 || y >= HEATMAP_ROWS) continue;
    if (!Number.isFinite(w) || w <= 0) continue;
    cells.push({ x, y, w: Math.min(w, 100_000) });
  }
  return cells.length > 0 ? cells : undefined;
}

function heatmapDevice(width: number): HeatmapDevice {
  return width >= 768 ? "desktop" : "mobile";
}

export async function getHeatmapGrid(
  days: number,
  type: HeatmapType,
  device: HeatmapDevice,
): Promise<HeatmapResponse> {
  const rangeDays = Math.min(Math.max(days, 1), 90);
  const events = await loadEvents(rangeDays);
  const forDevice = events.filter(
    (event) => heatmapDevice(event.viewport?.width ?? 0) === device,
  );

  if (type === "scroll") {
    const depths = forDevice
      .filter(
        (event) => event.type === "exit" && typeof event.scrollDepth === "number",
      )
      .map((event) => event.scrollDepth as number);
    const total = depths.length;
    const cells: MoveCell[] = [];
    for (let band = 0; band < SCROLL_BANDS; band += 1) {
      const threshold = (band / SCROLL_BANDS) * 100;
      const reached =
        total === 0 ? 0 : depths.filter((d) => d >= threshold).length / total;
      cells.push({ x: 0, y: band, w: reached });
    }
    return {
      type,
      device,
      rangeDays,
      grid: { cols: 1, rows: SCROLL_BANDS },
      cells,
      maxWeight: 1,
      sampleCount: total,
    };
  }

  const grid = { cols: HEATMAP_COLS, rows: HEATMAP_ROWS };
  const weights = new Map<string, number>();
  let sampleCount = 0;

  if (type === "click") {
    for (const event of forDevice) {
      if (event.type !== "click" && event.type !== "call") continue;
      if (typeof event.nx !== "number" || typeof event.ny !== "number") continue;
      const x = Math.min(grid.cols - 1, Math.floor(event.nx * grid.cols));
      const y = Math.min(grid.rows - 1, Math.floor(event.ny * grid.rows));
      const key = `${x},${y}`;
      weights.set(key, (weights.get(key) ?? 0) + 1);
      sampleCount += 1;
    }
  } else {
    for (const event of forDevice) {
      if (event.type !== "move_batch" || !event.moveCells) continue;
      sampleCount += 1;
      for (const cell of event.moveCells) {
        const key = `${cell.x},${cell.y}`;
        weights.set(key, (weights.get(key) ?? 0) + cell.w);
      }
    }
  }

  const cells: MoveCell[] = [];
  let maxWeight = 0;
  for (const [key, w] of weights) {
    const [x, y] = key.split(",").map(Number);
    cells.push({ x, y, w });
    if (w > maxWeight) maxWeight = w;
  }

  return { type, device, rangeDays, grid, cells, maxWeight, sampleCount };
}
