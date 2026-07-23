import { getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";
import type { LeadPayload } from "./agent";
import type { Attribution } from "./attribution";
import type { SpamVerdict } from "./spam";

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "quoted",
  "won",
  "lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export type AdminNote = {
  at: string;
  text: string;
};

export type StoredLead = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: LeadStatus;
  name: string;
  phone: string;
  service: string;
  address?: string;
  zip?: string;
  urgency?: string;
  notes?: string;
  source: string;
  visitorId?: string;
  estimateValue?: number;
  attribution?: Attribution;
  spam?: SpamVerdict;
  adminNotes: AdminNote[];
};

const KEY_PREFIX = "lead:";

function getLeadsStore() {
  return getStore({ name: "alt-leads", consistency: "strong" });
}

// Keyed `lead:<createdAtMs>:<id>` so a lexicographic blob listing is also
// chronological (13-digit epoch ms is fixed-width for the foreseeable future).
function leadKey(createdAtMs: number, id: string) {
  return `${KEY_PREFIX}${createdAtMs}:${id}`;
}

export function isLeadStatus(value: unknown): value is LeadStatus {
  return (
    typeof value === "string" &&
    (LEAD_STATUSES as readonly string[]).includes(value)
  );
}

/**
 * Persist an incoming lead. Best-effort: callers should not let a storage
 * failure break the email/response path — wrap in try/catch at the call site.
 */
export async function persistLead(
  lead: LeadPayload,
  meta: { visitorId?: string; spam?: SpamVerdict } = {},
): Promise<StoredLead> {
  const store = getLeadsStore();
  const now = new Date();
  const id = randomUUID();

  const stored: StoredLead = {
    id,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    status: "new",
    name: lead.name,
    phone: lead.phone,
    service: lead.service,
    address: lead.address,
    zip: lead.zip,
    urgency: lead.urgency,
    notes: lead.notes,
    source: lead.source ?? "website",
    visitorId: meta.visitorId,
    attribution: lead.attribution,
    spam: meta.spam?.suspected ? meta.spam : undefined,
    adminNotes: [],
  };

  await store.setJSON(leadKey(now.getTime(), id), stored);
  return stored;
}

/**
 * Last-10-digit phone strings of leads created within the recent window.
 * Used by the spam evaluator to flag duplicate submissions.
 */
export async function recentPhoneDigits(windowMs: number): Promise<string[]> {
  const store = getLeadsStore();
  const { blobs } = await store.list({ prefix: KEY_PREFIX });
  const cutoff = Date.now() - windowMs;
  const recentKeys = blobs.filter((blob) => {
    const ms = Number(blob.key.slice(KEY_PREFIX.length).split(":")[0]);
    return Number.isFinite(ms) && ms >= cutoff;
  });
  const leads = await Promise.all(
    recentKeys.map((blob) => store.get(blob.key, { type: "json" })),
  );
  return (leads.filter(Boolean) as StoredLead[])
    .map((lead) => lead.phone.replace(/\D/g, "").slice(-10))
    .filter(Boolean);
}

export async function listLeads(
  filters: { status?: LeadStatus; days?: number } = {},
): Promise<StoredLead[]> {
  const store = getLeadsStore();
  const { blobs } = await store.list({ prefix: KEY_PREFIX });

  const cutoff =
    filters.days && filters.days > 0
      ? Date.now() - filters.days * 24 * 60 * 60 * 1000
      : null;

  const leads = await Promise.all(
    blobs.map((blob) => store.get(blob.key, { type: "json" })),
  );

  return (leads.filter(Boolean) as StoredLead[])
    .filter((lead) => (filters.status ? lead.status === filters.status : true))
    .filter((lead) =>
      cutoff ? new Date(lead.createdAt).getTime() >= cutoff : true,
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

async function findLeadKey(id: string): Promise<string | null> {
  const store = getLeadsStore();
  const { blobs } = await store.list({ prefix: KEY_PREFIX });
  return blobs.find((blob) => blob.key.endsWith(`:${id}`))?.key ?? null;
}

export type LeadPatch = {
  status?: LeadStatus;
  estimateValue?: number | null;
  note?: string;
};

export async function updateLead(
  id: string,
  patch: LeadPatch,
): Promise<StoredLead | null> {
  const store = getLeadsStore();
  const key = await findLeadKey(id);
  if (!key) return null;

  const existing = (await store.get(key, { type: "json" })) as StoredLead | null;
  if (!existing) return null;

  const updated: StoredLead = {
    ...existing,
    adminNotes: existing.adminNotes ?? [],
    updatedAt: new Date().toISOString(),
  };

  if (patch.status && isLeadStatus(patch.status)) {
    updated.status = patch.status;
  }
  if (patch.estimateValue === null) {
    updated.estimateValue = undefined;
  } else if (typeof patch.estimateValue === "number") {
    updated.estimateValue = patch.estimateValue;
  }
  if (patch.note && patch.note.trim()) {
    updated.adminNotes = [
      ...updated.adminNotes,
      { at: new Date().toISOString(), text: patch.note.trim().slice(0, 1000) },
    ];
  }

  await store.setJSON(key, updated);
  return updated;
}

function csvCell(value: unknown): string {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function leadsToCsv(leads: StoredLead[]): string {
  const header = [
    "created",
    "status",
    "name",
    "phone",
    "service",
    "urgency",
    "source",
    "traffic_source",
    "utm_campaign",
    "suspected_spam",
    "spam_reasons",
    "address",
    "zip",
    "notes",
    "admin_notes",
  ];
  const rows = leads.map((lead) =>
    [
      lead.createdAt,
      lead.status,
      lead.name,
      lead.phone,
      lead.service,
      lead.urgency ?? "",
      lead.source,
      lead.attribution?.source ?? "",
      lead.attribution?.utmCampaign ?? "",
      lead.spam?.suspected ? "yes" : "",
      (lead.spam?.reasons ?? []).join(" | "),
      lead.address ?? "",
      lead.zip ?? "",
      lead.notes ?? "",
      (lead.adminNotes ?? []).map((n) => n.text).join(" | "),
    ]
      .map(csvCell)
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}
