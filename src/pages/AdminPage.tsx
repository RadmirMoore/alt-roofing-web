import {
  BarChart3,
  ClipboardCheck,
  Clock3,
  Eye,
  Flame,
  Loader2,
  LogOut,
  Monitor,
  MousePointerClick,
  PhoneCall,
  RefreshCw,
  Repeat,
  Smartphone,
  Users,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type {
  AnalyticsStats,
  HeatmapDevice,
  HeatmapResponse,
  HeatmapType,
  SessionSummary,
} from "../types/analytics";
import {
  clearAdminToken,
  fetchAnalyticsStats,
  fetchHeatmap,
  fetchLeads,
  formatDateTime,
  formatDuration,
  getAdminToken,
  loginAdmin,
} from "../lib/admin-api";
import { renderHeatmap } from "../lib/heatmap-render";
import { LeadsPanel } from "../components/admin/LeadsPanel";

type AdminView = "analytics" | "leads";

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  highlight = false,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-card p-5 ${
        highlight ? "border-primary/40" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-foreground/60">{label}</div>
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
      </div>
      <div className="mt-3 font-display text-3xl font-bold">{value}</div>
      {sub ? <div className="mt-1 text-xs text-foreground/50">{sub}</div> : null}
    </div>
  );
}

function conversion(count: number, visitors: number) {
  if (!visitors) return "0% of visitors";
  return `${Math.round((count / visitors) * 1000) / 10}% of visitors`;
}

function RankList({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; count: number }>;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-foreground/50">No data yet.</p>
        ) : (
          items.map((item) => (
            <div key={`${title}-${item.label}`} className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-foreground/80">{item.label}</span>
                <span className="shrink-0 text-foreground/50">{item.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${Math.max(8, (item.count / items[0].count) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SessionRow({ session }: { session: SessionSummary }) {
  return (
    <details className="rounded-xl border border-border bg-background/60 p-4">
      <summary className="cursor-pointer list-none">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-display text-sm font-semibold">
              Visitor {session.visitorId.slice(0, 8)} · Session{" "}
              {session.sessionId.slice(0, 8)}
            </div>
            <div className="mt-1 text-xs text-foreground/50">
              {formatDateTime(session.startedAt)} → {formatDateTime(session.endedAt)}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-border px-2.5 py-1">
              {session.pageviews} views
            </span>
            <span className="rounded-full border border-border px-2.5 py-1">
              {session.clicks} clicks
            </span>
            <span className="rounded-full border border-border px-2.5 py-1">
              {formatDuration(session.durationMs)}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 ${
                session.exited
                  ? "border border-primary/30 bg-primary/10 text-primary"
                  : "border border-border"
              }`}
            >
              {session.exited ? "Left site" : "Active/unknown exit"}
            </span>
          </div>
        </div>
      </summary>
      <div className="mt-4 space-y-2 border-t border-border pt-4">
        {session.events.map((event) => (
          <div
            key={event.id}
            className="grid gap-1 rounded-lg bg-card/70 px-3 py-2 text-xs md:grid-cols-[120px_90px_1fr]"
          >
            <span className="text-foreground/50">
              {formatDateTime(event.timestamp)}
            </span>
            <span className="font-medium text-primary">{event.type}</span>
            <span className="text-foreground/75">
              {event.label ?? event.section ?? event.hash ?? event.path}
              {event.scrollDepth != null ? ` · scroll ${event.scrollDepth}%` : ""}
              {event.durationMs != null
                ? ` · ${formatDuration(event.durationMs)}`
                : ""}
            </span>
          </div>
        ))}
      </div>
    </details>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loginAdmin(password);
      onSuccess();
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8"
      >
        <div className="mb-2 text-xs uppercase tracking-[0.25em] text-foreground/50">
          ALT Roofing Admin
        </div>
        <h1 className="font-display text-3xl font-bold">Analytics login</h1>
        <p className="mt-3 text-sm text-foreground/65">
          Enter your admin password to view visitors, clicks, page views, and exits.
        </p>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Admin password"
          className="mt-6 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
        />
        {error ? <p className="mt-3 text-sm text-primary">{error}</p> : null}
        <button
          type="submit"
          disabled={loading || !password}
          className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

const HEATMAP_TYPES: Array<{ key: HeatmapType; label: string; hint: string }> = [
  { key: "click", label: "Clicks", hint: "Where visitors click & tap" },
  { key: "move", label: "Attention", hint: "Where the cursor lingers" },
  { key: "scroll", label: "Scroll", hint: "How far visitors read" },
];

const DEVICE_REF_WIDTH: Record<HeatmapDevice, number> = {
  desktop: 1440,
  mobile: 390,
};

function readFrameHeight(frame: HTMLIFrameElement | null): number | null {
  const doc = frame?.contentDocument;
  if (!doc) return null;
  const height = doc.documentElement.scrollHeight;
  return height > 0 ? height : null;
}

function HeatmapSection({ days }: { days: number }) {
  const [type, setType] = useState<HeatmapType>("click");
  const [device, setDevice] = useState<HeatmapDevice>("desktop");
  const [data, setData] = useState<HeatmapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [frameHeight, setFrameHeight] = useState(2400);
  const [scale, setScale] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const refWidth = DEVICE_REF_WIDTH[device];

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await fetchHeatmap(days, type, device));
    } catch (loadError) {
      setData(null);
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load heatmap",
      );
    } finally {
      setLoading(false);
    }
  }, [days, type, device]);

  useEffect(() => {
    void load();
  }, [load]);

  // Scale the reference-width preview down to the available admin width so the
  // 1440px desktop frame never forces horizontal scrolling.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / refWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [refWidth]);

  // Re-measure the embedded page height when the reference width changes
  // (device toggle reflows the responsive layout without re-firing onLoad).
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const height = readFrameHeight(frameRef.current);
      if (height) setFrameHeight(height);
    });
    return () => cancelAnimationFrame(raf);
  }, [refWidth]);

  // Paint the heatmap whenever the data or the frame geometry changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    canvas.width = refWidth;
    canvas.height = frameHeight;
    renderHeatmap(canvas, data);
  }, [data, frameHeight, refWidth]);

  const sampleNoun = type === "scroll" ? "sessions" : type === "move" ? "sessions" : "clicks";

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Flame className="h-5 w-5 text-primary" aria-hidden="true" />
            Heatmap
          </h3>
          <p className="mt-1 text-sm text-foreground/60">
            {HEATMAP_TYPES.find((item) => item.key === type)?.hint} · last {days}{" "}
            days ·{" "}
            {data ? `${data.sampleCount} ${sampleNoun} in view` : "loading…"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-border bg-card p-1">
            {HEATMAP_TYPES.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setType(item.key)}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  type === item.key
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex rounded-xl border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              aria-label="Desktop"
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${
                device === "desktop"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <Monitor className="h-4 w-4" aria-hidden="true" />
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              aria-label="Mobile"
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${
                device === "mobile"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <Smartphone className="h-4 w-4" aria-hidden="true" />
              Mobile
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          {error}
        </div>
      ) : null}

      <div className="mt-4 flex items-center gap-3 text-xs text-foreground/55">
        <span>{type === "scroll" ? "Fewer readers" : "Fewer"}</span>
        <span
          className="h-2 w-40 rounded-full"
          style={{
            background:
              "linear-gradient(to right, rgb(0,0,255), rgb(0,255,255), rgb(0,255,0), rgb(255,255,0), rgb(255,0,0))",
          }}
        />
        <span>{type === "scroll" ? "More readers" : "More"}</span>
        {loading ? (
          <Loader2 className="ml-2 h-4 w-4 animate-spin text-primary" />
        ) : null}
      </div>

      <div
        ref={containerRef}
        className="relative mt-3 w-full overflow-hidden rounded-xl border border-border bg-card"
        style={{ height: frameHeight * scale }}
      >
        <div
          className="absolute left-0 top-0"
          style={{
            width: refWidth,
            height: frameHeight,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <iframe
            ref={frameRef}
            src="/"
            title="Site preview"
            onLoad={() => {
              const height = readFrameHeight(frameRef.current);
              if (height) setFrameHeight(height);
            }}
            style={{
              width: refWidth,
              height: frameHeight,
              border: 0,
              pointerEvents: "none",
            }}
          />
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute left-0 top-0"
            style={{ width: refWidth, height: frameHeight }}
          />
        </div>
      </div>

      {data && data.sampleCount === 0 ? (
        <p className="mt-3 text-sm text-foreground/50">
          No {sampleNoun} recorded for {device} in this range yet. Browse the site
          on a {device} device to generate data.
        </p>
      ) : null}
    </div>
  );
}

export function AdminPage() {
  const [authed, setAuthed] = useState(Boolean(getAdminToken()));
  const [view, setView] = useState<AdminView>("analytics");
  const [newLeads, setNewLeads] = useState(0);
  const [days, setDays] = useState(7);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchAnalyticsStats(days);
      setStats(data);
    } catch (loadError) {
      setStats(null);
      setError(loadError instanceof Error ? loadError.message : "Failed to load");
      if (
        loadError instanceof Error &&
        loadError.message.includes("Session expired")
      ) {
        setAuthed(false);
      }
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    document.title = "ALT Roofing Analytics";
    return () => {
      document.title =
        "ALT Roofing Solutions | Los Angeles Roofing Contractor — Repair, Replacement & Free Estimates";
    };
  }, []);

  useEffect(() => {
    if (authed) {
      void loadStats();
    }
  }, [authed, loadStats]);

  // Keep the "new leads" badge fresh so the operator sees fresh inbound work
  // without having to open the Leads tab.
  useEffect(() => {
    if (!authed) return;
    let active = true;
    const refresh = () =>
      fetchLeads({ status: "new" })
        .then((data) => {
          if (active) setNewLeads(data.total);
        })
        .catch(() => {});
    void refresh();
    const id = window.setInterval(refresh, 60_000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [authed, view]);

  if (!authed) {
    return <LoginForm onSuccess={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-background px-5 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-foreground/50">
              ALT Roofing Admin
            </div>
            <h1 className="font-display text-4xl font-bold">
              {view === "leads" ? "Leads" : "Site analytics"}
            </h1>
            <p className="mt-2 text-sm text-foreground/65">
              {view === "leads"
                ? "Every form and AI-chat submission, with status, notes, and export."
                : `Visitors, sessions, clicks, section views, and exits for the last ${days} days.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {view === "analytics" ? (
              <>
                <select
                  value={days}
                  onChange={(event) => setDays(Number(event.target.value))}
                  className="h-11 rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-primary"
                >
                  <option value={1}>Last 24 hours</option>
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
                <button
                  type="button"
                  onClick={() => void loadStats()}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm transition hover:border-primary/40"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Refresh
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={() => {
                clearAdminToken();
                setAuthed(false);
              }}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm transition hover:border-primary/40"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Log out
            </button>
          </div>
        </div>

        {/* View switcher */}
        <div className="mt-6 flex gap-1 border-b border-border">
          <button
            type="button"
            onClick={() => setView("analytics")}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              view === "analytics"
                ? "border-primary text-foreground"
                : "border-transparent text-foreground/55 hover:text-foreground"
            }`}
          >
            Analytics
          </button>
          <button
            type="button"
            onClick={() => setView("leads")}
            className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              view === "leads"
                ? "border-primary text-foreground"
                : "border-transparent text-foreground/55 hover:text-foreground"
            }`}
          >
            Leads
            {newLeads > 0 ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                {newLeads}
              </span>
            ) : null}
          </button>
        </div>

        {view === "leads" ? (
          <div className="mt-8">
            <LeadsPanel />
          </div>
        ) : null}

        {view === "analytics" && loading && !stats ? (
          <div className="mt-16 flex items-center justify-center gap-3 text-foreground/60">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Loading analytics…
          </div>
        ) : null}

        {view === "analytics" && error ? (
          <div className="mt-6 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
            {error}
          </div>
        ) : null}

        {view === "analytics" && stats ? (
          <>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard
                label="Form leads"
                value={stats.totals.leads}
                sub={conversion(stats.totals.leads, stats.totals.visitors)}
                icon={ClipboardCheck}
                highlight
              />
              <StatCard
                label="Call clicks"
                value={stats.totals.calls}
                sub={conversion(stats.totals.calls, stats.totals.visitors)}
                icon={PhoneCall}
                highlight
              />
              <StatCard
                label="Unique visitors"
                value={stats.totals.visitors}
                icon={Users}
              />
              <StatCard
                label="Returning visitors"
                value={stats.totals.returningVisitors}
                sub="2+ sessions, same browser"
                icon={Repeat}
              />
              <StatCard
                label="Sessions"
                value={stats.totals.sessions}
                icon={BarChart3}
              />
              <StatCard
                label="Page views"
                value={stats.totals.pageviews}
                icon={Eye}
              />
              <StatCard
                label="Clicks"
                value={stats.totals.clicks}
                icon={MousePointerClick}
              />
              <StatCard
                label="Exits tracked"
                value={stats.totals.exits}
                icon={LogOut}
              />
              <StatCard
                label="Avg. session"
                value={formatDuration(stats.totals.avgSessionMs)}
                icon={Clock3}
              />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-2">
              <RankList title="Top pages / sections" items={stats.topPages} />
              <RankList title="Top clicks" items={stats.topClicks} />
              <RankList title="Most viewed sections" items={stats.topSections} />
              <RankList title="Where users leave" items={stats.exitPages} />
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-card p-5">
              <h3 className="font-display text-lg font-semibold">
                Visitors by day
              </h3>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
                {stats.dailyVisitors.map((day) => (
                  <div
                    key={day.date}
                    className="rounded-xl border border-border bg-background/60 p-3"
                  >
                    <div className="text-xs text-foreground/50">{day.date}</div>
                    <div className="mt-2 font-display text-2xl font-bold">
                      {day.visitors}
                    </div>
                    <div className="text-xs text-foreground/55">
                      {day.sessions} sessions
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-card p-5">
              <h3 className="font-display text-lg font-semibold">
                Returning visitors
              </h3>
              <p className="mt-1 text-xs text-foreground/50">
                Same browser across 2+ sessions (localStorage-based; resets on a
                new device, browser, or cleared data).
              </p>
              <div className="mt-4 space-y-2">
                {stats.returningVisitors.length === 0 ? (
                  <p className="text-sm text-foreground/50">
                    No returning visitors yet.
                  </p>
                ) : (
                  stats.returningVisitors.map((visitor) => (
                    <div
                      key={visitor.visitorId}
                      className="flex flex-col gap-1 rounded-xl border border-border bg-background/60 px-4 py-3 text-sm md:flex-row md:items-center md:justify-between"
                    >
                      <span className="font-display font-semibold">
                        Visitor {visitor.visitorId.slice(0, 8)}
                      </span>
                      <span className="flex flex-wrap gap-2 text-xs text-foreground/60">
                        <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-primary">
                          {visitor.sessions} visits
                        </span>
                        {visitor.leads > 0 ? (
                          <span className="rounded-full border border-border px-2.5 py-1">
                            {visitor.leads} lead{visitor.leads > 1 ? "s" : ""}
                          </span>
                        ) : null}
                        {visitor.calls > 0 ? (
                          <span className="rounded-full border border-border px-2.5 py-1">
                            {visitor.calls} call{visitor.calls > 1 ? "s" : ""}
                          </span>
                        ) : null}
                        <span className="rounded-full border border-border px-2.5 py-1">
                          last {formatDateTime(visitor.lastSeen)}
                        </span>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <HeatmapSection days={days} />

            <div className="mt-8 space-y-4">
              <h3 className="font-display text-lg font-semibold">
                Recent visitor sessions
              </h3>
              {stats.recentSessions.length === 0 ? (
                <p className="text-sm text-foreground/50">
                  No sessions recorded yet. Visit the homepage to generate test data.
                </p>
              ) : (
                stats.recentSessions.map((session) => (
                  <SessionRow key={session.sessionId} session={session} />
                ))
              )}
            </div>

            <p className="mt-8 text-xs text-foreground/45">
              Updated {formatDateTime(stats.generatedAt)} · First-party analytics only
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
