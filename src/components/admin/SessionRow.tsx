import type { SessionSummary } from "../../types/analytics";
import { formatDateTime, formatDuration } from "../../lib/admin-api";

export function SessionRow({ session }: { session: SessionSummary }) {
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
