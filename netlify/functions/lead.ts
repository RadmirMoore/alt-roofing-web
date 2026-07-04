import type { Config } from "@netlify/functions";
import type { LeadPayload } from "./lib/agent";
import { notifyLead } from "./lib/lead-mailer";

type IncomingLead = {
  name?: unknown;
  phone?: unknown;
  service?: unknown;
  address?: unknown;
  zip?: unknown;
  message?: unknown;
  inspectionDate?: unknown;
  inspectionTime?: unknown;
  source?: unknown;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function clean(value: unknown, max = 500): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export default async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const body = (await request.json()) as IncomingLead;

    const name = clean(body.name, 120);
    const phone = clean(body.phone, 40);
    const service = clean(body.service, 120);

    if (!name || !phone || !service) {
      return json({ error: "Name, phone, and service are required." }, 400);
    }

    const message = clean(body.message, 2000);
    const inspectionDate = clean(body.inspectionDate, 40);
    const inspectionTime = clean(body.inspectionTime, 40);

    const notesParts = [message];
    if (inspectionDate || inspectionTime) {
      notesParts.push(
        `Requested inspection: ${[inspectionDate, inspectionTime]
          .filter(Boolean)
          .join(" ")}`,
      );
    }
    const notes = notesParts.filter(Boolean).join("\n");

    const lead: LeadPayload = {
      name,
      phone,
      service,
      address: clean(body.address, 200) || undefined,
      zip: clean(body.zip, 20) || undefined,
      notes: notes || undefined,
      source: clean(body.source, 40) || "quote form",
    };

    await notifyLead(lead);
    return json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    console.error("Lead function error:", message);
    return json(
      { error: "Failed to submit lead. Please call (213) 415-6146." },
      500,
    );
  }
};

export const config: Config = {
  path: "/api/lead",
};
