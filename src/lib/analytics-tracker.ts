import { HEATMAP_COLS, HEATMAP_ROWS, type MoveCell } from "../types/analytics";

const VISITOR_KEY = "alt_visitor_id";
const SESSION_KEY = "alt_session_id";
const SESSION_STARTED_KEY = "alt_session_started_at";

type TrackPayload = {
  type:
    | "session_start"
    | "pageview"
    | "click"
    | "exit"
    | "lead"
    | "call"
    | "move_batch";
  label?: string;
  target?: string;
  href?: string;
  section?: string;
  durationMs?: number;
  scrollDepth?: number;
  nx?: number;
  ny?: number;
  moveCells?: MoveCell[];
};

function shouldTrack() {
  return (
    typeof window !== "undefined" &&
    !window.location.pathname.startsWith("/admin") &&
    // Never track when embedded in an iframe (e.g. the admin heatmap preview),
    // otherwise the preview would pollute the analytics it is meant to display.
    window.top === window.self
  );
}

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/** Normalized position across full page width / full document height [0..1]. */
function normalizedPoint(clientX: number, clientY: number) {
  const doc = document.documentElement;
  const documentWidth = doc.scrollWidth || window.innerWidth || 1;
  const documentHeight = doc.scrollHeight || window.innerHeight || 1;
  return {
    nx: clamp01(clientX / documentWidth),
    ny: clamp01((clientY + window.scrollY) / documentHeight),
  };
}

export function getVisitorId() {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function getSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
    sessionStorage.setItem(SESSION_STARTED_KEY, String(Date.now()));
  }
  return id;
}

function getSessionStartedAt() {
  const value = Number(sessionStorage.getItem(SESSION_STARTED_KEY));
  return Number.isFinite(value) ? value : Date.now();
}

function getScrollDepth() {
  const doc = document.documentElement;
  const scrollTop = window.scrollY || doc.scrollTop;
  const viewport = window.innerHeight;
  const height = Math.max(doc.scrollHeight - viewport, 1);
  return Math.round(Math.min(100, (scrollTop / height) * 100));
}

function nearestSection(element: Element | null) {
  let current = element;
  while (current) {
    if (current instanceof HTMLElement && current.id) {
      return current.id;
    }
    current = current.parentElement;
  }

  if (window.location.hash) {
    return window.location.hash.replace(/^#/, "");
  }

  return "top";
}

function describeClick(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return { label: "Unknown element", target: "unknown" };
  }

  const clickable =
    target.closest("a,button,input,textarea,select,[role='button']") ?? target;
  const element = clickable as HTMLElement;
  const text = element.innerText?.replace(/\s+/g, " ").trim().slice(0, 80);
  const href =
    clickable instanceof HTMLAnchorElement ? clickable.href : undefined;
  const aria = element.getAttribute("aria-label") ?? undefined;
  const label = aria || text || element.id || element.tagName.toLowerCase();

  return {
    label,
    target: element.tagName.toLowerCase(),
    href,
    section: nearestSection(element),
  };
}

function buildEvent(payload: TrackPayload) {
  return {
    id: crypto.randomUUID(),
    type: payload.type,
    timestamp: new Date().toISOString(),
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    path: window.location.pathname,
    hash: window.location.hash,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    label: payload.label,
    target: payload.target,
    href: payload.href,
    section: payload.section,
    durationMs: payload.durationMs,
    scrollDepth: payload.scrollDepth,
    nx: payload.nx,
    ny: payload.ny,
    moveCells: payload.moveCells,
  };
}

async function sendEvent(payload: TrackPayload, preferBeacon = false) {
  if (!shouldTrack()) return;

  const event = buildEvent(payload);
  const body = JSON.stringify({ event });

  if (preferBeacon && navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/analytics",
      new Blob([body], { type: "application/json" }),
    );
    return;
  }

  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    // Ignore analytics transport errors on the client.
  }
}

function trackPageView() {
  void sendEvent({
    type: "pageview",
    section: window.location.hash.replace(/^#/, "") || "top",
    label: window.location.hash || window.location.pathname,
  });
}

export function trackLead(label = "Quote form submitted", section = "quote") {
  void sendEvent({ type: "lead", label, section });
}

// Mouse-attention dwell accumulator: grid-cell key -> weight (one unit per
// throttled tick). Flushed as a single `move_batch` event on exit, so a whole
// session costs one event instead of thousands of mousemove pings.
const moveGrid = new Map<string, number>();
const MOVE_THROTTLE_MS = 100;
let lastMoveAt = 0;

function recordMove(clientX: number, clientY: number) {
  const now = Date.now();
  if (now - lastMoveAt < MOVE_THROTTLE_MS) return;
  lastMoveAt = now;

  const { nx, ny } = normalizedPoint(clientX, clientY);
  const cx = Math.min(HEATMAP_COLS - 1, Math.floor(nx * HEATMAP_COLS));
  const cy = Math.min(HEATMAP_ROWS - 1, Math.floor(ny * HEATMAP_ROWS));
  const key = `${cx},${cy}`;
  moveGrid.set(key, (moveGrid.get(key) ?? 0) + 1);
}

function flushMove() {
  if (moveGrid.size === 0) return;
  const moveCells: MoveCell[] = [];
  for (const [key, w] of moveGrid) {
    const [x, y] = key.split(",").map(Number);
    moveCells.push({ x, y, w });
  }
  moveGrid.clear();
  void sendEvent({ type: "move_batch", moveCells }, true);
}

let initialized = false;

export function initAnalytics() {
  if (initialized || !shouldTrack()) return;
  initialized = true;

  void sendEvent({ type: "session_start", section: "top" });
  trackPageView();

  window.addEventListener("hashchange", trackPageView);

  document.addEventListener(
    "click",
    (event) => {
      const details = describeClick(event.target);
      const isCall = details.href?.startsWith("tel:") ?? false;
      const { nx, ny } = normalizedPoint(event.clientX, event.clientY);
      void sendEvent({
        type: isCall ? "call" : "click",
        label: details.label,
        target: details.target,
        href: details.href,
        section: details.section,
        nx,
        ny,
      });
    },
    true,
  );

  // Attention tracking: only on precise pointers (mouse/trackpad). Touch taps
  // are already captured as clicks, and coarse pointers have no hover dwell.
  if (window.matchMedia?.("(pointer: fine)").matches) {
    window.addEventListener(
      "mousemove",
      (event) => recordMove(event.clientX, event.clientY),
      { passive: true },
    );
  }

  const trackExit = () => {
    flushMove();
    void sendEvent(
      {
        type: "exit",
        section: nearestSection(document.activeElement),
        durationMs: Date.now() - getSessionStartedAt(),
        scrollDepth: getScrollDepth(),
      },
      true,
    );
  };

  window.addEventListener("pagehide", trackExit);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      trackExit();
    }
  });
}
