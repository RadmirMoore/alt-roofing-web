import type {
  AnalyticsStats,
  HeatmapDevice,
  HeatmapResponse,
  HeatmapType,
} from "../types/analytics";

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
