import type { Config, Context } from "@netlify/functions";
import type { LeadPayload } from "./lib/agent";
import { cleanAttribution } from "./lib/attribution";
import { buildConsentRecord } from "./lib/consent";
import { PROPERTY_KINDS, ROOF_AGES, sendInquiry, type CrmFields } from "./lib/crm";
import { notifyLead } from "./lib/lead-mailer";
import { persistLead, recentPhoneDigits } from "./lib/leads-store";
import { evaluateSpam } from "./lib/spam";
import { isValidEmail, isValidPhone, isValidZip } from "./lib/validate";

const DUP_WINDOW_MS = 24 * 60 * 60 * 1000;

type IncomingLead = {
  name?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  street?: unknown;
  city?: unknown;
  roofAge?: unknown;
  propertyKind?: unknown;
  propertyKindOther?: unknown;
  ownsProperty?: unknown;
  requestId?: unknown;
  phone?: unknown;
  email?: unknown;
  service?: unknown;
  address?: unknown;
  zip?: unknown;
  message?: unknown;
  inspectionDate?: unknown;
  inspectionTime?: unknown;
  source?: unknown;
  visitorId?: unknown;
  attribution?: unknown;
  consent?: unknown;
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

const ROOF_AGE_LABELS: Record<string, string> = {
  under_5: "Under 5 years",
  "5_9": "5–9 years",
  "10_14": "10–14 years",
  "15_19": "15–19 years",
  "20_plus": "20+ years",
  not_sure: "Not sure",
};
const PROPERTY_KIND_LABELS: Record<string, string> = {
  single_family: "Single-family home",
  townhouse: "Townhouse",
  duplex: "Duplex",
  multifamily: "Apartment building / multifamily",
  commercial: "Commercial property",
  other: "Other",
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The answers the CRM needs, or null when the form didn't send them all (an
// older page still open in a visitor's browser): that lead is emailed only.
function crmFields(body: IncomingLead): CrmFields | null {
  const fields: CrmFields = {
    requestId: clean(body.requestId, 40),
    firstName: clean(body.firstName, 80),
    lastName: clean(body.lastName, 80),
    street: clean(body.street, 200),
    city: clean(body.city, 100),
    zip: clean(body.zip, 20),
    roofAge: clean(body.roofAge, 20),
    propertyKind: clean(body.propertyKind, 20),
    propertyKindOther: clean(body.propertyKindOther, 100),
    ownsProperty: typeof body.ownsProperty === "boolean" ? body.ownsProperty : null,
  };
  const complete =
    UUID.test(fields.requestId) &&
    fields.firstName &&
    fields.lastName &&
    fields.street &&
    fields.city &&
    ROOF_AGES.includes(fields.roofAge) &&
    PROPERTY_KINDS.includes(fields.propertyKind) &&
    fields.ownsProperty !== null;
  return complete ? fields : null;
}

export default async (request: Request, context: Context) => {
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

    const fields = crmFields(body);
    const name = fields
      ? `${fields.firstName} ${fields.lastName}`
      : clean(body.name, 120);
    const phone = clean(body.phone, 40);
    const service = clean(body.service, 120);
    const email = clean(body.email, 200);
    const address = fields
      ? `${fields.street}, ${fields.city}`
      : clean(body.address, 200);
    const zip = clean(body.zip, 20);

    if (!name || !phone || !email || !address || !zip || !service) {
      return json(
        {
          error:
            "Name, phone, email, address, ZIP code, and service are required.",
        },
        400,
      );
    }

    if (!isValidPhone(phone)) {
      return json(
        { error: "Please enter a valid phone number (10 digits with area code)." },
        400,
      );
    }

    if (!isValidEmail(email)) {
      return json({ error: "Please enter a valid email address." }, 400);
    }

    if (!isValidZip(zip)) {
      return json({ error: "Please enter a valid 5-digit ZIP code." }, 400);
    }

    const message = clean(body.message, 2000);
    const inspectionDate = clean(body.inspectionDate, 40);
    const inspectionTime = clean(body.inspectionTime, 40);

    const notesParts = [message];
    if (fields) {
      notesParts.push(
        `Roof age: ${ROOF_AGE_LABELS[fields.roofAge]}`,
        `Property: ${PROPERTY_KIND_LABELS[fields.propertyKind]}${
          fields.propertyKind === "other" && fields.propertyKindOther
            ? ` (${fields.propertyKindOther})`
            : ""
        }`,
        `Owns the property: ${fields.ownsProperty ? "Yes" : "No"}`,
      );
    }
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
      email,
      service,
      address,
      zip,
      notes: notes || undefined,
      source: clean(body.source, 40) || "quote form",
      attribution: cleanAttribution(body.attribution),
      consent: buildConsentRecord(body.consent, {
        ip: context.ip,
        userAgent: request.headers.get("user-agent") ?? undefined,
      }),
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

    // Real-looking leads go into ALT's CRM as an Unassigned lead. Whatever the
    // CRM answers, the email below still goes out (the backup), saying whether
    // the lead is in the CRM.
    let crm: Awaited<ReturnType<typeof sendInquiry>> = { status: "off" };
    if (!spam.suspected && fields) {
      crm = await sendInquiry(context, {
        fields,
        phone,
        email,
        service,
        message,
        attribution: lead.attribution,
        consent: lead.consent,
      });
      if (crm.status === "failed") console.error("CRM inquiry failed:", crm.reason);
    }
    if (crm.status === "saved") {
      lead.crm = "Saved in the CRM (Leads → Unassigned).";
    } else if (crm.status === "failed") {
      lead.crm = `NOT in the CRM — enter it by hand. (${crm.reason})`;
    } else if (!spam.suspected && !fields) {
      lead.crm = "NOT in the CRM — sent from an older version of the form; enter it by hand.";
    }

    // Don't spam the inbox with junk — only notify for leads that look real.
    // When the CRM already has the lead, a failed email doesn't fail the form.
    if (!spam.suspected) {
      if (crm.status === "saved") {
        await notifyLead(lead, { spam }).catch((mailError) =>
          console.error("Lead email error (lead is in the CRM):", mailError),
        );
      } else {
        await notifyLead(lead, { spam });
      }
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

    // Only whether to offer inspection times goes back to the browser; the
    // CRM's request token stays in the HttpOnly cookie.
    return json(
      crm.status === "saved"
        ? { ok: true, crm: { outcome: crm.outcome, addressConfirmed: crm.addressConfirmed } }
        : { ok: true },
    );
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
