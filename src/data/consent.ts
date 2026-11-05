// Exact opt-in wording shown on the website forms and saved with each lead
// as proof of consent. Server mirror: netlify/functions/lib/consent.ts.
// Keep the two in sync, and bump CONSENT_VERSION whenever the wording changes.

export const CONSENT_VERSION = "2026-11-05";

export const PRIVACY_URL = "https://altroofingsolutions.com/privacy";
export const TERMS_URL = "https://altroofingsolutions.com/terms";

export const SMS_CONSENT_BODY =
  "I agree to receive text messages from ALT Roofing Solutions about my roofing request. Msg & data rates may apply. Msg frequency varies. Reply STOP to opt out, HELP for help. Consent is not required for purchase.";

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
