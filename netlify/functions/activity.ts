import type { Config } from "@netlify/functions";
import { getBearerToken, verifyAdminToken } from "./lib/admin-auth";
import { getCallIntents } from "./lib/analytics-store";
import { listLeads } from "./lib/leads-store";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

type ActivityKind = "form" | "chat" | "call";

type ActivityItem = {
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

/** Classify a stored lead as a chat or form submission from its source. */
function leadKind(source: string): ActivityKind {
  return /chat/i.test(source) ? "chat" : "form";
}

export default async (request: Request) => {
  const token = getBearerToken(request);
  if (!verifyAdminToken(token)) {
    return json({ error: "Unauthorized" }, 401);
  }

  const url = new URL(request.url);
  const daysParam = Number(url.searchParams.get("days"));
  const days = Number.isFinite(daysParam) && daysParam > 0 ? daysParam : 30;

  try {
    const [leads, calls] = await Promise.all([
      listLeads({ days }),
      getCallIntents(days),
    ]);

    const items: ActivityItem[] = [];

    for (const lead of leads) {
      items.push({
        id: `lead:${lead.id}`,
        kind: leadKind(lead.source),
        at: lead.createdAt,
        source: lead.attribution?.source ?? "Unknown",
        visitorId: lead.visitorId,
        leadId: lead.id,
        name: lead.name,
        phone: lead.phone,
        service: lead.service,
        status: lead.status,
        spam: lead.spam?.suspected ?? false,
      });
    }

    for (const call of calls) {
      items.push({
        id: `call:${call.id}`,
        kind: "call",
        at: call.at,
        source: call.source,
        section: call.section,
        device: call.device,
        visitorId: call.visitorId,
        count: call.count,
      });
    }

    items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

    const counts = {
      total: items.length,
      form: items.filter((i) => i.kind === "form").length,
      chat: items.filter((i) => i.kind === "chat").length,
      call: items.filter((i) => i.kind === "call").length,
    };

    return json({ items, counts, rangeDays: days });
  } catch (error) {
    console.error("Activity list error:", error);
    return json({ error: "Failed to load activity" }, 500);
  }
};

export const config: Config = {
  path: "/api/activity",
};
