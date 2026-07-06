import type { Config } from "@netlify/functions";
import { getBearerToken, verifyAdminToken } from "./lib/admin-auth";
import {
  type LeadPatch,
  type LeadStatus,
  isLeadStatus,
  leadsToCsv,
  listLeads,
  updateLead,
} from "./lib/leads-store";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function leadIdFromPath(url: URL): string | null {
  const match = url.pathname.match(/\/api\/leads\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default async (request: Request) => {
  const token = getBearerToken(request);
  if (!verifyAdminToken(token)) {
    return json({ error: "Unauthorized" }, 401);
  }

  const url = new URL(request.url);

  if (request.method === "GET") {
    const statusParam = url.searchParams.get("status");
    const status: LeadStatus | undefined = isLeadStatus(statusParam)
      ? statusParam
      : undefined;
    const daysParam = url.searchParams.get("days");
    const days = daysParam ? Number(daysParam) : undefined;

    try {
      const leads = await listLeads({
        status,
        days: Number.isFinite(days) ? days : undefined,
      });

      if (url.searchParams.get("format") === "csv") {
        return new Response(leadsToCsv(leads), {
          status: 200,
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="leads.csv"',
          },
        });
      }

      const counts = { new: 0, contacted: 0, quoted: 0, won: 0, lost: 0 };
      for (const lead of leads) counts[lead.status] += 1;

      return json({ leads, counts, total: leads.length });
    } catch (error) {
      console.error("Leads list error:", error);
      return json({ error: "Failed to load leads" }, 500);
    }
  }

  if (request.method === "PATCH") {
    const id = leadIdFromPath(url);
    if (!id) {
      return json({ error: "Lead id required" }, 400);
    }

    try {
      const body = (await request.json()) as LeadPatch;
      const patch: LeadPatch = {};

      if (body.status !== undefined) {
        if (!isLeadStatus(body.status)) {
          return json({ error: "Invalid status" }, 400);
        }
        patch.status = body.status;
      }
      if (body.estimateValue !== undefined) {
        patch.estimateValue =
          body.estimateValue === null ? null : Number(body.estimateValue);
      }
      if (typeof body.note === "string") {
        patch.note = body.note;
      }

      const updated = await updateLead(id, patch);
      if (!updated) {
        return json({ error: "Lead not found" }, 404);
      }
      return json({ lead: updated });
    } catch (error) {
      console.error("Lead update error:", error);
      return json({ error: "Failed to update lead" }, 500);
    }
  }

  return json({ error: "Method not allowed" }, 405);
};

export const config: Config = {
  path: ["/api/leads", "/api/leads/:id"],
};
