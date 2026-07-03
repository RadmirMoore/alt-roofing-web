const VISITOR_KEY = "alt_visitor_id";
const SESSION_KEY = "alt_session_id";
const SESSION_STARTED_KEY = "alt_session_started_at";

type TrackPayload = {
  type: "session_start" | "pageview" | "click" | "exit" | "lead" | "call";
  label?: string;
  target?: string;
  href?: string;
  section?: string;
  durationMs?: number;
  scrollDepth?: number;
};

function shouldTrack() {
  return (
    typeof window !== "undefined" &&
    !window.location.pathname.startsWith("/admin")
  );
}

function getVisitorId() {
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
      void sendEvent({
        type: isCall ? "call" : "click",
        label: details.label,
        target: details.target,
        href: details.href,
        section: details.section,
      });
    },
    true,
  );

  const trackExit = () => {
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
