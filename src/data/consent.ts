// Exact opt-in wording shown on the website forms and saved with each lead
// as proof of consent. Server mirror: netlify/functions/lib/consent.ts.
// Keep the two in sync, and bump CONSENT_VERSION whenever the wording changes.

export const CONSENT_VERSION = "2026-10-26";

export const PRIVACY_URL = "https://altroofingsolutions.com/privacy";
export const TERMS_URL = "https://altroofingsolutions.com/terms";

export const SMS_CONSENT_BODY =
  "Yes, text me about my roof inspection. I agree to receive appointment confirmations, reminders, and replies about my request from ALT Roofing Solutions at the phone number above. Message frequency varies (about 4–6 messages per appointment). Msg & data rates may apply. Reply HELP for help, STOP to opt out. Consent is not a condition of any purchase.";

export const TERMS_ACK_BODY = "I have read the Privacy Policy and Terms.";

// The wording as recorded, with the two links spelled out.
export const SMS_CONSENT_TEXT = `${SMS_CONSENT_BODY} Privacy Policy (${PRIVACY_URL}) · Terms (${TERMS_URL})`;
export const TERMS_ACK_TEXT = `${TERMS_ACK_BODY} Privacy Policy (${PRIVACY_URL}) · Terms (${TERMS_URL})`;

export type ConsentSubmission = {
  sms: boolean;
  terms: boolean;
  smsText: string;
  termsText: string;
  version: string;
  pageUrl: string;
};

export function consentSubmission(
  sms: boolean,
  terms: boolean,
): ConsentSubmission {
  return {
    sms,
    terms,
    smsText: SMS_CONSENT_TEXT,
    termsText: TERMS_ACK_TEXT,
    version: CONSENT_VERSION,
    pageUrl: window.location.href,
  };
}
