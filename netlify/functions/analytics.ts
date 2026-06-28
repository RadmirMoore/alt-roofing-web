import type { Config } from "@netlify/functions";
import {
  appendEvent,
  getAnalyticsStats,
  sanitizeIncomingEvent,
} from "./lib/analytics-store";
import { getBearerToken, verifyAdminToken } from "./lib/admin-auth";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default async (request: Request) => {
  if (request.method === "GET") {
    const token = getBearerToken(request);
    if (!verifyAdminToken(token)) {
      return json({ error: "Unauthorized" }, 401);
    }

    const url = new URL(request.url);
    const days = Number(url.searchParams.get("days") ?? "7");

    try {
      const stats = await getAnalyticsStats(days);
      return json(stats);
    } catch (error) {
      console.error("Analytics stats error:", error);
      return json({ error: "Failed to load analytics" }, 500);
    }
  }

  if (request.method === "POST") {
    try {
      const body = (await request.json()) as { event?: unknown };
      const event = sanitizeIncomingEvent(body.event);

      if (!event) {
        return json({ error: "Invalid event payload" }, 400);
      }

      await appendEvent(event);
      return json({ ok: true });
    } catch (error) {
      console.error("Analytics ingest error:", error);
      return json({ error: "Failed to store event" }, 500);
    }
  }

  return json({ error: "Method not allowed" }, 405);
};

export const config: Config = {
  path: "/api/analytics",
};
