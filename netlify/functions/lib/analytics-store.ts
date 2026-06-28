import { getStore } from "@netlify/blobs";
import type { AnalyticsEvent, AnalyticsStats, SessionSummary } from "./analytics-types";
import { dayKey, eventsKey } from "./analytics-types";

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

export async function getAnalyticsStats(days: number): Promise<AnalyticsStats> {
  const rangeDays = Math.min(Math.max(days, 1), 90);
  const events = await loadEvents(rangeDays);
  const sessions = buildSessionSummaries(events);

  const visitors = new Set(events.map((event) => event.visitorId));
  const pageviews = events.filter((event) => event.type === "pageview").length;
  const clicks = events.filter((event) => event.type === "click").length;
  const exits = events.filter((event) => event.type === "exit").length;

  const pageMap = new Map<string, number>();
  const clickMap = new Map<string, number>();
  const sectionMap = new Map<string, number>();
  const exitMap = new Map<string, number>();
  const dailyMap = new Map<string, { visitors: Set<string>; sessions: Set<string> }>();

  for (const event of events) {
    const date = dayKey(new Date(event.timestamp));
    const daily = dailyMap.get(date) ?? { visitors: new Set(), sessions: new Set() };
    daily.visitors.add(event.visitorId);
    daily.sessions.add(event.sessionId);
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
    }));

  return {
    rangeDays,
    generatedAt: new Date().toISOString(),
    totals: {
      visitors: visitors.size,
      sessions: sessions.length,
      pageviews,
      clicks,
      exits,
      avgSessionMs,
    },
    topPages: topEntries(pageMap),
    topClicks: topEntries(clickMap),
    topSections: topEntries(sectionMap),
    exitPages: topEntries(exitMap),
    dailyVisitors,
    recentSessions: sessions.slice(0, 50),
  };
}

export function sanitizeIncomingEvent(raw: unknown): AnalyticsEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const event = raw as Partial<AnalyticsEvent>;
  const allowed: AnalyticsEvent["type"][] = [
    "session_start",
    "pageview",
    "click",
    "exit",
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
  };
}
