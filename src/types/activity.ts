// Client mirror of the /api/activity response (netlify/functions/activity.ts).

export type ActivityKind = "form" | "chat" | "call";

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  at: string;
  source: string;
  section?: string;
  device?: string;
  visitorId?: string;
  // Identity — present for form/chat leads only.
  leadId?: string;
  name?: string;
  phone?: string;
  service?: string;
  status?: string;
  spam?: boolean;
  // Call intents only.
  count?: number;
};

export type ActivityCounts = {
  total: number;
  form: number;
  chat: number;
  call: number;
};

export type ActivityResponse = {
  items: ActivityItem[];
  counts: ActivityCounts;
  rangeDays: number;
};
