import type {
  AnalyticsStats,
  HeatmapDevice,
  HeatmapResponse,
  HeatmapType,
} from "../types/analytics";
import type {
  LeadStatus,
  LeadsResponse,
  StoredLead,
} from "../types/leads";
import type { ChatsResponse, StoredChat } from "../types/chats";

const TOKEN_KEY = "alt_admin_token";

export function getAdminToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export async function loginAdmin(password: string) {
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  const data = (await response.json()) as { token?: string; error?: string };

  if (!response.ok || !data.token) {
    throw new Error(data.error ?? "Login failed");
  }

  setAdminToken(data.token);
  return data.token;
}

export async function fetchAnalyticsStats(days: number): Promise<AnalyticsStats> {
  const token = getAdminToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`/api/analytics?days=${days}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = (await response.json()) as AnalyticsStats & { error?: string };

  if (response.status === 401) {
    clearAdminToken();
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error(data.error ?? "Failed to load analytics");
  }

  return data;
}

export async function fetchHeatmap(
  days: number,
  type: HeatmapType,
  device: HeatmapDevice,
): Promise<HeatmapResponse> {
  const token = getAdminToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const query = new URLSearchParams({
    days: String(days),
    type,
    device,
  });

  const response = await fetch(`/api/heatmap?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = (await response.json()) as HeatmapResponse & { error?: string };

  if (response.status === 401) {
    clearAdminToken();
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error(data.error ?? "Failed to load heatmap");
  }

  return data;
}

function authHeaders() {
  const token = getAdminToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return { Authorization: `Bearer ${token}` };
}

export async function fetchLeads(
  filters: { status?: LeadStatus; days?: number } = {},
): Promise<LeadsResponse> {
  const query = new URLSearchParams();
  if (filters.status) query.set("status", filters.status);
  if (filters.days) query.set("days", String(filters.days));

  const response = await fetch(`/api/leads?${query.toString()}`, {
    headers: authHeaders(),
  });

  const data = (await response.json()) as LeadsResponse & { error?: string };

  if (response.status === 401) {
    clearAdminToken();
    throw new Error("Session expired. Please log in again.");
  }
  if (!response.ok) {
    throw new Error(data.error ?? "Failed to load leads");
  }
  return data;
}

export async function updateLead(
  id: string,
  patch: { status?: LeadStatus; note?: string; estimateValue?: number | null },
): Promise<StoredLead> {
  const response = await fetch(`/api/leads/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });

  const data = (await response.json()) as { lead?: StoredLead; error?: string };

  if (response.status === 401) {
    clearAdminToken();
    throw new Error("Session expired. Please log in again.");
  }
  if (!response.ok || !data.lead) {
    throw new Error(data.error ?? "Failed to update lead");
  }
  return data.lead;
}

export async function downloadLeadsCsv(
  filters: { status?: LeadStatus; days?: number } = {},
): Promise<void> {
  const query = new URLSearchParams({ format: "csv" });
  if (filters.status) query.set("status", filters.status);
  if (filters.days) query.set("days", String(filters.days));

  const response = await fetch(`/api/leads?${query.toString()}`, {
    headers: authHeaders(),
  });

  if (response.status === 401) {
    clearAdminToken();
    throw new Error("Session expired. Please log in again.");
  }
  if (!response.ok) {
    throw new Error("Failed to export leads");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "leads.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function fetchChats(days?: number): Promise<ChatsResponse> {
  const query = new URLSearchParams();
  if (days) query.set("days", String(days));

  const response = await fetch(`/api/chats?${query.toString()}`, {
    headers: authHeaders(),
  });

  const data = (await response.json()) as ChatsResponse & { error?: string };

  if (response.status === 401) {
    clearAdminToken();
    throw new Error("Session expired. Please log in again.");
  }
  if (!response.ok) {
    throw new Error(data.error ?? "Failed to load chats");
  }
  return data;
}

export async function fetchChat(sessionId: string): Promise<StoredChat> {
  const response = await fetch(
    `/api/chats?sessionId=${encodeURIComponent(sessionId)}`,
    { headers: authHeaders() },
  );

  const data = (await response.json()) as { chat?: StoredChat; error?: string };

  if (response.status === 401) {
    clearAdminToken();
    throw new Error("Session expired. Please log in again.");
  }
  if (!response.ok || !data.chat) {
    throw new Error(data.error ?? "Failed to load chat");
  }
  return data.chat;
}

export function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s`;
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
