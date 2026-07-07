import {
  BarChart3,
  ClipboardCheck,
  Clock3,
  Eye,
  Loader2,
  LogOut,
  MousePointerClick,
  PhoneCall,
  RefreshCw,
  Repeat,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { AnalyticsStats } from "../../types/analytics";
import { fetchAnalyticsStats, formatDateTime, formatDuration } from "../../lib/admin-api";
import { StatCard } from "../../components/admin/StatCard";
import { RankList } from "../../components/admin/RankList";
import { SessionRow } from "../../components/admin/SessionRow";
import { HeatmapSection } from "../../components/admin/HeatmapSection";
import {
  DeltaBadge,
  DonutChart,
  Funnel,
  SERIES_COLORS,
  TrendChart,
} from "../../components/admin/charts";
import { useAdminOutlet } from "./AdminLayout";

function conversion(count: number, visitors: number) {
  if (!visitors) return "0% of visitors";
  return `${Math.round((count / visitors) * 1000) / 10}% of visitors`;
}

export function AnalyticsView() {
  const { onSessionExpired } = useAdminOutlet();
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
        onSessionExpired();
      }
    } finally {
      setLoading(false);
    }
  }, [days, onSessionExpired]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
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
              label="Form leads"
              value={stats.totals.leads}
              sub={conversion(stats.totals.leads, stats.totals.visitors)}
              delta={
                <DeltaBadge
                  current={stats.totals.leads}
                  previous={stats.previousTotals.leads}
                />
              }
              icon={ClipboardCheck}
              highlight
            />
            <StatCard
              label="Call clicks"
              value={stats.totals.calls}
              sub={conversion(stats.totals.calls, stats.totals.visitors)}
              delta={
                <DeltaBadge
                  current={stats.totals.calls}
                  previous={stats.previousTotals.calls}
                />
              }
              icon={PhoneCall}
              highlight
            />
            <StatCard
              label="Unique visitors"
              value={stats.totals.visitors}
              delta={
                <DeltaBadge
                  current={stats.totals.visitors}
                  previous={stats.previousTotals.visitors}
                />
              }
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
              delta={
                <DeltaBadge
                  current={stats.totals.sessions}
                  previous={stats.previousTotals.sessions}
                />
              }
              icon={BarChart3}
            />
            <StatCard
              label="Page views"
              value={stats.totals.pageviews}
              delta={
                <DeltaBadge
                  current={stats.totals.pageviews}
                  previous={stats.previousTotals.pageviews}
                />
              }
              icon={Eye}
            />
            <StatCard
              label="Clicks"
              value={stats.totals.clicks}
              delta={
                <DeltaBadge
                  current={stats.totals.clicks}
                  previous={stats.previousTotals.clicks}
                />
              }
              icon={MousePointerClick}
            />
            <StatCard
              label="Exits tracked"
              value={stats.totals.exits}
              delta={
                <DeltaBadge
                  current={stats.totals.exits}
                  previous={stats.previousTotals.exits}
                  invert
                />
              }
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

          <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <TrendChart
              title="Traffic by day"
              data={stats.dailyVisitors}
              series={[
                {
                  key: "visitors",
                  label: "Visitors",
                  color: SERIES_COLORS.visitors,
                },
                {
                  key: "sessions",
                  label: "Sessions",
                  color: SERIES_COLORS.sessions,
                },
              ]}
            />
            <TrendChart
              title="Conversions by day"
              data={stats.dailyVisitors}
              series={[
                { key: "leads", label: "Leads", color: SERIES_COLORS.leads },
                { key: "calls", label: "Calls", color: SERIES_COLORS.calls },
              ]}
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Funnel
              stages={[
                { label: "Sessions (visits)", value: stats.totals.sessions },
                { label: "Unique visitors", value: stats.totals.visitors },
                {
                  label: "Leads + calls",
                  value: stats.totals.leads + stats.totals.calls,
                },
              ]}
            />
            <DonutChart title="Devices" segments={stats.devices} />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <RankList title="Traffic sources" items={stats.sources} />
            <RankList title="Browsers" items={stats.browsers} />
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display text-lg font-semibold">
              Returning visitors
            </h3>
            <p className="mt-1 text-xs text-foreground/50">
              Same browser across 2+ sessions (localStorage-based; resets on a new
              device, browser, or cleared data).
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
  );
}
