import type { Config } from "@netlify/functions";
import type { LeadPayload } from "./lib/agent";
import { cleanAttribution } from "./lib/attribution";
import { notifyLead } from "./lib/lead-mailer";
import { persistLead, recentPhoneDigits } from "./lib/leads-store";
import { evaluateSpam } from "./lib/spam";
import { isValidPhone } from "./lib/validate";

const DUP_WINDOW_MS = 24 * 60 * 60 * 1000;

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
  visitorId?: unknown;
  attribution?: unknown;
  // Hidden honeypot field — real users never see or fill it; bots do.
  company?: unknown;
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

    if (!isValidPhone(phone)) {
      return json(
        { error: "Please enter a valid phone number (10 digits with area code)." },
        400,
      );
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
      attribution: cleanAttribution(body.attribution),
    };

    // Flag likely-spam so the operator can trust the real numbers. We still
    // store everything (lead volume stays honest) but only email real leads.
    let recentPhones: string[] = [];
    try {
      recentPhones = await recentPhoneDigits(DUP_WINDOW_MS);
    } catch (dupError) {
      console.error("Recent-phone lookup error:", dupError);
    }
    const spam = evaluateSpam(lead, {
      honeypot: clean(body.company, 120),
      recentPhones,
    });

    // Don't spam the inbox with junk — only notify for leads that look real.
    if (!spam.suspected) {
      await notifyLead(lead, { spam });
    }

    // Best-effort persistence for the admin leads inbox — never let a storage
    // failure block the notification that already succeeded above.
    try {
      await persistLead(lead, {
        visitorId: clean(body.visitorId, 64) || undefined,
        spam,
      });
    } catch (persistError) {
      console.error("Lead persist error:", persistError);
    }

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
