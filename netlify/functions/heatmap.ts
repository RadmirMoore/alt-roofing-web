import type { Config } from "@netlify/functions";
import { getHeatmapGrid } from "./lib/analytics-store";
import type { HeatmapDevice, HeatmapType } from "./lib/analytics-types";
import { getBearerToken, verifyAdminToken } from "./lib/admin-auth";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function parseType(value: string | null): HeatmapType {
  return value === "move" || value === "scroll" ? value : "click";
}

function parseDevice(value: string | null): HeatmapDevice {
  return value === "mobile" ? "mobile" : "desktop";
}

export default async (request: Request) => {
  if (request.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  const token = getBearerToken(request);
  if (!verifyAdminToken(token)) {
    return json({ error: "Unauthorized" }, 401);
  }

  const url = new URL(request.url);
  const days = Number(url.searchParams.get("days") ?? "7");
  const type = parseType(url.searchParams.get("type"));
  const device = parseDevice(url.searchParams.get("device"));

  try {
    const grid = await getHeatmapGrid(days, type, device);
    return json(grid);
  } catch (error) {
    console.error("Heatmap stats error:", error);
    return json({ error: "Failed to load heatmap" }, 500);
  }
};

export const config: Config = {
  path: "/api/heatmap",
};
