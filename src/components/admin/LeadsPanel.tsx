import {
  Download,
  Loader2,
  MapPin,
  PhoneCall,
  RefreshCw,
  StickyNote,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  downloadLeadsCsv,
  fetchLeads,
  formatDateTime,
  updateLead,
} from "../../lib/admin-api";
import {
  LEAD_STATUSES,
  type LeadCounts,
  type LeadStatus,
  type StoredLead,
} from "../../types/leads";

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
};

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "border-primary/40 bg-primary/10 text-primary",
  contacted: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  quoted:
    "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  won: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  lost: "border-border bg-background text-foreground/50",
};

const EMPTY_COUNTS: LeadCounts = {
  new: 0,
  contacted: 0,
  quoted: 0,
  won: 0,
  lost: 0,
};

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border px-2.5 py-1 text-xs text-foreground/70">
      {children}
    </span>
  );
}

function LeadCard({
  lead,
  onChanged,
}: {
  lead: StoredLead;
  onChanged: (updated: StoredLead) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const patch = async (payload: {
    status?: LeadStatus;
    note?: string;
  }) => {
    setBusy(true);
    setError("");
    try {
      const updated = await updateLead(lead.id, payload);
      onChanged(updated);
      if (payload.note) setNote("");
    } catch (patchError) {
      setError(
        patchError instanceof Error ? patchError.message : "Update failed",
      );
    } finally {
      setBusy(false);
    }
  };

  const digits = lead.phone.replace(/[^\d+]/g, "");

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-semibold">{lead.name}</h3>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[lead.status]}`}
            >
              {STATUS_LABELS[lead.status]}
            </span>
          </div>
          <div className="mt-1 text-xs text-foreground/50">
            {formatDateTime(lead.createdAt)}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>{lead.service}</Badge>
            <Badge>via {lead.source}</Badge>
            {lead.urgency ? (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  lead.urgency === "emergency"
                    ? "border border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400"
                    : "border border-border text-foreground/70"
                }`}
              >
                {lead.urgency}
              </span>
            ) : null}
            {(lead.address || lead.zip) && (
              <Badge>
                <MapPin className="mr-1 inline h-3 w-3" aria-hidden="true" />
                {[lead.address, lead.zip].filter(Boolean).join(", ")}
              </Badge>
            )}
          </div>
          {lead.notes ? (
            <p className="mt-3 whitespace-pre-wrap text-sm text-foreground/75">
              {lead.notes}
            </p>
          ) : null}
        </div>

        <a
          href={`tel:${digits}`}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
        >
          <PhoneCall className="h-4 w-4" aria-hidden="true" />
          {lead.phone}
        </a>
      </div>

      {/* Status pipeline */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border pt-4">
        {LEAD_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            disabled={busy || status === lead.status}
            onClick={() => void patch({ status })}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:cursor-default ${
              status === lead.status
                ? `border ${STATUS_STYLES[status]}`
                : "border border-border text-foreground/60 hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {STATUS_LABELS[status]}
          </button>
        ))}
        {busy ? (
          <Loader2 className="ml-1 h-4 w-4 animate-spin text-primary" />
        ) : null}
      </div>

      {/* Admin notes */}
      {lead.adminNotes.length > 0 ? (
        <div className="mt-4 space-y-2">
          {lead.adminNotes.map((n) => (
            <div
              key={n.at}
              className="rounded-lg bg-background/60 px-3 py-2 text-xs text-foreground/75"
            >
              <StickyNote
                className="mr-1.5 inline h-3 w-3 text-primary"
                aria-hidden="true"
              />
              {n.text}
              <span className="ml-2 text-foreground/40">
                {formatDateTime(n.at)}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (note.trim()) void patch({ note: note.trim() });
        }}
      >
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add an internal note…"
          className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={busy || !note.trim()}
          className="h-10 rounded-xl border border-border bg-card px-4 text-sm transition hover:border-primary/40 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

export function LeadsPanel() {
  const [leads, setLeads] = useState<StoredLead[]>([]);
  const [counts, setCounts] = useState<LeadCounts>(EMPTY_COUNTS);
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchLeads(
        filter === "all" ? {} : { status: filter },
      );
      setLeads(data.leads);
      setCounts(data.counts);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalAll =
    counts.new + counts.contacted + counts.quoted + counts.won + counts.lost;

  const handleChanged = (updated: StoredLead) => {
    setLeads((prev) => {
      const next = prev.map((l) => (l.id === updated.id ? updated : l));
      // Drop from the list if it no longer matches the active status filter.
      return filter === "all" || updated.status === filter
        ? next
        : next.filter((l) => l.id !== updated.id);
    });
    void load();
  };

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              filter === "all"
                ? "bg-primary text-primary-foreground"
                : "border border-border text-foreground/70 hover:text-foreground"
            }`}
          >
            All {totalAll ? `· ${totalAll}` : ""}
          </button>
          {LEAD_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                filter === status
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-foreground/70 hover:text-foreground"
              }`}
            >
              {STATUS_LABELS[status]}
              {counts[status] ? ` · ${counts[status]}` : ""}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm transition hover:border-primary/40"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() =>
              void downloadLeadsCsv(
                filter === "all" ? {} : { status: filter },
              ).catch((e) =>
                setError(e instanceof Error ? e.message : "Export failed"),
              )
            }
            disabled={leads.length === 0}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm transition hover:border-primary/40 disabled:opacity-50"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      ) : null}

      {loading && leads.length === 0 ? (
        <div className="mt-16 flex items-center justify-center gap-3 text-foreground/60">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading leads…
        </div>
      ) : leads.length === 0 ? (
        <p className="mt-10 text-center text-sm text-foreground/50">
          No leads {filter === "all" ? "" : `with status “${STATUS_LABELS[filter]}” `}
          yet. New form and AI-chat submissions will appear here.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onChanged={handleChanged} />
          ))}
        </div>
      )}
    </div>
  );
}
