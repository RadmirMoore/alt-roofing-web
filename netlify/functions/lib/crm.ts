import type { Context } from "@netlify/functions";
import type { Attribution } from "./attribution";
import type { ConsentRecord } from "./consent";

// The connection to ALT's CRM (crm.altroofingsolutions.com). Only this server
// talks to the CRM, with the key in WEBSITE_CONNECTION_KEY (a Netlify
// environment variable, never in page code). The CRM's answer for a homeowner
// includes a private "request token"; it is kept in an HttpOnly cookie so the
// visitor's browser can't read it, and is sent back to the CRM to load and book
// inspection times. Specification: docs/website-connection.md in the CRM.
//
// Which CRM: CRM_URL when set (the hosted Test CRM for previews or local
// testing); otherwise the live CRM, but only on the production site. Without a
// key the connection is off and the website works as before (email + inbox).

const LIVE_CRM = "https://crm.altroofingsolutions.com";
const TIMEOUT_MS = 10_000;

export const REQUEST_COOKIE = "alt_crm_request";
const COOKIE_DAYS = 14;

// Website service → CRM service.
const SERVICES: Record<string, string> = {
  "Roof Repair": "roof_repair",
  "Roof Replacement": "roof_replacement",
  Inspection: "roof_inspection",
  "Storm / Emergency": "leak_repair",
  "Roof Report for Insurance": "insurance_claim",
  "Roof Maintenance": "other",
  Other: "other",
};

export const ROOF_AGES = ["under_5", "5_9", "10_14", "15_19", "20_plus", "not_sure"];
export const PROPERTY_KINDS = ["single_family", "townhouse", "duplex", "multifamily", "commercial", "other"];

type Settings = { url: string; key: string };

function settings(context: Context): Settings | null {
  const key = process.env.WEBSITE_CONNECTION_KEY?.trim(); // a pasted value may end with a line break
  if (!key) return null;
  const configured = process.env.CRM_URL?.trim().replace(/\/+$/, "");
  const url = configured || (context.deploy?.context === "production" ? LIVE_CRM : "");
  return url ? { url, key } : null;
}

export type CrmAnswer =
  | { reached: true; status: number; body: Record<string, unknown> }
  | { reached: false; reason: string };

async function call(s: Settings, path: string, body: unknown): Promise<CrmAnswer> {
  try {
    const response = await fetch(`${s.url}/api/website/${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${s.key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    if (!data) return { reached: false, reason: `the CRM answered HTTP ${response.status} without details` };
    return { reached: true, status: response.status, body: data };
  } catch (error) {
    const detail = error instanceof Error ? ` (${error.message})` : "";
    return { reached: false, reason: `the CRM could not be reached${detail}` };
  }
}

// What the CRM needs from the estimate form. Empty when the form is an older
// version without the new questions (the lead is then emailed only).
export type CrmFields = {
  requestId: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  zip: string;
  roofAge: string;
  propertyKind: string;
  propertyKindOther: string;
  ownsProperty: boolean | null;
};

export type InquiryResult =
  | { status: "saved"; outcome: string; addressConfirmed: boolean }
  | { status: "off" }
  | { status: "failed"; reason: string };

export async function sendInquiry(
  context: Context,
  lead: {
    fields: CrmFields;
    phone: string;
    email: string;
    service: string;
    message: string;
    attribution?: Attribution;
    consent?: ConsentRecord;
  },
): Promise<InquiryResult> {
  const s = settings(context);
  if (!s) return { status: "off" };
  const f = lead.fields;
  const a = lead.attribution;
  const answer = await call(s, "inquiry", {
    request_id: f.requestId,
    service_type_id: SERVICES[lead.service] ?? "other",
    values: {
      first_name: f.firstName,
      last_name: f.lastName,
      phone: lead.phone,
      email: lead.email,
      street: f.street,
      city: f.city,
      state: "CA",
      zip: f.zip,
      roof_age: f.roofAge,
      property_kind: f.propertyKind,
      property_kind_other: f.propertyKind === "other" ? f.propertyKindOther : "",
      owns_property: f.ownsProperty,
    },
    description: lead.message,
    consent: lead.consent
      ? {
          sms: lead.consent.smsConsent,
          terms: lead.consent.termsAcknowledged,
          sms_text: lead.consent.smsConsentText,
          terms_text: lead.consent.termsAckText,
          version: lead.consent.version,
          page_url: lead.consent.pageUrl,
        }
      : undefined,
    attribution: {
      utm_source: a?.utmSource,
      utm_medium: a?.utmMedium,
      utm_campaign: a?.utmCampaign,
      utm_content: a?.utmContent,
      utm_term: a?.utmTerm,
      landing_page: a?.landingPath,
      referrer: a?.referrer,
    },
  });
  if (!answer.reached) return { status: "failed", reason: answer.reason };
  const b = answer.body;
  if (b.ok !== true || typeof b.token !== "string") {
    const fields = b.fields && typeof b.fields === "object" ? Object.values(b.fields as Record<string, string>) : [];
    const reason = [b.error, b.reason, ...fields].filter((x) => typeof x === "string" && x).join(" ");
    return { status: "failed", reason: reason || `HTTP ${answer.status}` };
  }
  context.cookies.set({
    name: REQUEST_COOKIE,
    value: b.token,
    path: "/api/crm",
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    expires: new Date(Date.now() + COOKIE_DAYS * 24 * 60 * 60 * 1000),
  });
  const session = (b.session ?? {}) as { outcome?: string; address_confirmed?: boolean };
  return { status: "saved", outcome: session.outcome ?? "", addressConfirmed: session.address_confirmed !== false };
}

// For the times and booking steps: the CRM settings and this visitor's request
// token, or a reply to send back when either is missing.
export function forVisitor(context: Context): { s: Settings; token: string } | { reply: Response } {
  const s = settings(context);
  if (!s) return { reply: Response.json({ ok: false, error: "Online booking isn't available right now. Our office will call you." }) };
  const token = context.cookies.get(REQUEST_COOKIE);
  if (!token) return { reply: Response.json({ ok: false, expired: true, error: "Your request has expired on this device. Please fill in the form again." }) };
  return { s, token };
}

// Calls the CRM for a visitor and passes on only what the page needs.
export async function forward(s: Settings, path: string, body: Record<string, unknown>): Promise<Response> {
  const answer = await call(s, path, body);
  if (!answer.reached || answer.status >= 500 || answer.status === 401) {
    if (!answer.reached) console.error(`CRM ${path} error:`, answer.reason);
    else console.error(`CRM ${path} answered HTTP ${answer.status}`);
    return Response.json({ ok: false, error: "We couldn't reach our booking system. Please try again, or call (213) 415-6146." });
  }
  return Response.json(answer.body, { headers: { "Cache-Control": "no-store" } });
}
