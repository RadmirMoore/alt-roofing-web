import {
  FileText,
  Loader2,
  MessageSquare,
  PhoneCall,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { fetchActivity, formatDateTime } from "../../lib/admin-api";
import type {
  ActivityCounts,
  ActivityItem,
  ActivityKind,
} from "../../types/activity";

const RANGE_OPTIONS = [7, 30, 90] as const;

const EMPTY_COUNTS: ActivityCounts = { total: 0, form: 0, chat: 0, call: 0 };

const KIND_META: Record<
  ActivityKind,
  { label: string; icon: typeof PhoneCall; className: string }
> = {
  form: {
    label: "Form",
    icon: FileText,
    className: "text-primary bg-primary/10 border-primary/30",
  },
  chat: {
    label: "AI chat",
    icon: MessageSquare,
    className:
      "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/30",
  },
  call: {
    label: "Call attempt",
    icon: PhoneCall,
    className:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
};

type KindFilter = ActivityKind | "all";

function ActivityRow({ item }: { item: ActivityItem }) {
  const meta = KIND_META[item.kind];
  const Icon = meta.icon;
  const digits = item.phone?.replace(/[^\d+]/g, "");

  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-4">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${meta.className}`}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
            {meta.label}
          </span>
          {item.spam ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
              <ShieldAlert className="h-3 w-3" aria-hidden="true" />
              spam?
            </span>
          ) : null}
          <span className="text-xs text-foreground/45">
            {formatDateTime(item.at)}
          </span>
        </div>

        {item.kind === "call" ? (
          <p className="mt-1 text-sm text-foreground/80">
            Someone tapped the phone number
            {item.section ? (
              <>
                {" "}
                on <span className="font-medium">{item.section}</span>
              </>
            ) : null}
            {item.count && item.count > 1 ? ` · ${item.count}×` : ""}
          </p>
        ) : (
          <div className="mt-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-display text-base font-semibold">
                {item.name}
              </span>
              {digits ? (
                <a
                  href={`tel:${digits}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {item.phone}
                </a>
              ) : null}
            </div>
            {item.service ? (
              <p className="text-sm text-foreground/70">{item.service}</p>
            ) : null}
          </div>
        )}

        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-foreground/55">
          <span className="rounded-full border border-border px-2 py-0.5">
            {item.source}
          </span>
          {item.device ? (
            <span className="rounded-full border border-border px-2 py-0.5">
              {item.device}
            </span>
          ) : null}
          {item.status ? (
            <span className="rounded-full border border-border px-2 py-0.5 capitalize">
              {item.status}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ActivityPanel() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [counts, setCounts] = useState<ActivityCounts>(EMPTY_COUNTS);
  const [range, setRange] = useState<(typeof RANGE_OPTIONS)[number]>(30);
  const [filter, setFilter] = useState<KindFilter>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchActivity(range);
      setItems(data.items);
      setCounts(data.counts);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible =
    filter === "all" ? items : items.filter((item) => item.kind === filter);

  const FILTERS: Array<{ key: KindFilter; label: string; count: number }> = [
    { key: "all", label: "All", count: counts.total },
    { key: "call", label: "Calls", count: counts.call },
    { key: "form", label: "Forms", count: counts.form },
    { key: "chat", label: "AI chat", count: counts.chat },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-foreground/70 hover:text-foreground"
              }`}
            >
              {f.label}
              {f.count ? ` · ${f.count}` : ""}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRange(option)}
                className={`rounded-md px-2.5 py-1 text-xs transition ${
                  range === option
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                {option}d
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm transition hover:border-primary/40"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>

      <p className="mt-3 text-xs text-foreground/50">
        Call attempts are phone-number taps on the site — they show that someone
        tried to reach the company (and from where), not the caller&apos;s number.
      </p>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      ) : null}

      {loading && items.length === 0 ? (
        <div className="mt-16 flex items-center justify-center gap-3 text-foreground/60">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading activity…
        </div>
      ) : visible.length === 0 ? (
        <p className="mt-10 text-center text-sm text-foreground/50">
          No {filter === "all" ? "" : `${filter} `}activity in the last {range}{" "}
          days yet.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {visible.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
