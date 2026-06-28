import {
  BarChart3,
  Clock3,
  Eye,
  Loader2,
  LogOut,
  MousePointerClick,
  RefreshCw,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { AnalyticsStats, SessionSummary } from "../types/analytics";
import {
  clearAdminToken,
  fetchAnalyticsStats,
  formatDateTime,
  formatDuration,
  getAdminToken,
  loginAdmin,
} from "../lib/admin-api";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-foreground/60">{label}</div>
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
      </div>
      <div className="mt-3 font-display text-3xl font-bold">{value}</div>
    </div>
  );
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

export function AdminPage() {
  const [authed, setAuthed] = useState(Boolean(getAdminToken()));
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
            <h1 className="font-display text-4xl font-bold">Site analytics</h1>
            <p className="mt-2 text-sm text-foreground/65">
              Visitors, sessions, clicks, section views, and exits for the last{" "}
              {days} days.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
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

        {loading && !stats ? (
          <div className="mt-16 flex items-center justify-center gap-3 text-foreground/60">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Loading analytics…
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
            {error}
          </div>
        ) : null}

        {stats ? (
          <>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard
                label="Unique visitors"
                value={stats.totals.visitors}
                icon={Users}
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
