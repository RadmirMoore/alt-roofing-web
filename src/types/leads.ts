// Client-side mirror of the server StoredLead type
// (netlify/functions/lib/leads-store.ts). Keep the two in sync.

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

export type Attribution = {
  source: string;
  referrer?: string;
  landingPath?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
};

export type SpamVerdict = {
  suspected: boolean;
  reasons: string[];
};

// Proof of how the visitor answered the text-message consent checkboxes.
export type ConsentRecord = {
  smsConsent: boolean;
  termsAcknowledged: boolean;
  smsConsentText: string;
  termsAckText: string;
  version: string;
  matchesCurrentWording: boolean;
  pageUrl: string;
  recordedAt: string;
  recordedAtPacific: string;
  ip?: string;
  userAgent?: string;
};

export type StoredLead = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: LeadStatus;
  name: string;
  phone: string;
  email?: string;
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
  consent?: ConsentRecord;
  adminNotes: AdminNote[];
};

export type LeadCounts = Record<LeadStatus, number>;

export type LeadsResponse = {
  leads: StoredLead[];
  counts: LeadCounts;
  total: number;
};
