// Server mirror of the opt-in wording in src/data/consent.ts. Keep the two
// in sync. Each lead stores the wording the visitor's browser actually showed,
// plus a flag saying whether it matched this current wording.

export const CONSENT_VERSION = "2026-10-26";

const PRIVACY_URL = "https://altroofingsolutions.com/privacy";
const TERMS_URL = "https://altroofingsolutions.com/terms";
const LINKS = `Privacy Policy (${PRIVACY_URL}) · Terms (${TERMS_URL})`;

export const SMS_CONSENT_TEXT = `Yes, text me about my roof inspection. I agree to receive appointment confirmations, reminders, and replies about my request from ALT Roofing Solutions at the phone number above. Message frequency varies (about 4–6 messages per appointment). Msg & data rates may apply. Reply HELP for help, STOP to opt out. Consent is not a condition of any purchase. ${LINKS}`;

export const TERMS_ACK_TEXT = `I have read the Privacy Policy and Terms. ${LINKS}`;

export type ConsentRecord = {
  smsConsent: boolean;
  termsAcknowledged: boolean;
  smsConsentText: string;
  termsAckText: string;
  version: string;
  matchesCurrentWording: boolean;
  pageUrl: string;
  recordedAt: string;
  recordedAtPacific: string;
  ip?: string;
  userAgent?: string;
};

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function formatPacific(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    dateStyle: "medium",
    timeStyle: "long",
  }).format(date);
}

/** Build the consent proof from the form's `consent` field, or undefined if absent. */
export function buildConsentRecord(
  raw: unknown,
  request: { ip?: string; userAgent?: string },
): ConsentRecord | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const input = raw as Record<string, unknown>;

  const smsConsentText = clean(input.smsText, 2000) || SMS_CONSENT_TEXT;
  const termsAckText = clean(input.termsText, 1000) || TERMS_ACK_TEXT;
  const pageUrl = clean(input.pageUrl, 500);
  const now = new Date();

  return {
    smsConsent: input.sms === true,
    termsAcknowledged: input.terms === true,
    smsConsentText,
    termsAckText,
    version: clean(input.version, 40) || "unknown",
    matchesCurrentWording:
      smsConsentText === SMS_CONSENT_TEXT && termsAckText === TERMS_ACK_TEXT,
    pageUrl: /^https?:\/\//.test(pageUrl) ? pageUrl : "",
    recordedAt: now.toISOString(),
    recordedAtPacific: formatPacific(now),
    ip: request.ip || undefined,
    userAgent: request.userAgent?.slice(0, 300) || undefined,
  };
}

/** Plain-text lines for the lead notification email. */
export function consentSummaryLines(consent?: ConsentRecord): string[] {
  if (!consent) return ["Text-message consent: not asked (no consent form)"];
  return [
    `Text-message consent (checkbox 1): ${consent.smsConsent ? "YES" : "NO"}`,
    `Privacy Policy & Terms checkbox (checkbox 2): ${consent.termsAcknowledged ? "YES" : "NO"}`,
    `Recorded: ${consent.recordedAtPacific} (${consent.recordedAt})`,
    `Page: ${consent.pageUrl || "unknown"}`,
    consent.ip ? `IP address: ${consent.ip}` : "",
    consent.userAgent ? `Browser: ${consent.userAgent}` : "",
    `Wording version: ${consent.version}${consent.matchesCurrentWording ? "" : " (DIFFERS from current wording)"}`,
    `Checkbox 1 wording shown: "${consent.smsConsentText}"`,
    `Checkbox 2 wording shown: "${consent.termsAckText}"`,
  ].filter(Boolean);
}
