// Lightweight, dependency-free spam heuristics for inbound form leads. The goal
// is not to block submissions (we still store everything so lead volume stays
// honest) but to FLAG likely-junk so the operator can trust the real numbers.

import type { LeadPayload } from "./agent";

export type SpamVerdict = {
  suspected: boolean;
  reasons: string[];
};

const URL_RE = /(https?:\/\/|www\.)/i;
const LETTER_RE = /\p{L}/u;

/** Digits only, for repeated/sequential number checks. */
function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

function isRepeatedOrTrivialPhone(phone: string): boolean {
  const digits = phoneDigits(phone);
  if (digits.length < 10) return true; // too short to be real
  const core = digits.slice(-10);
  if (/^(\d)\1{9}$/.test(core)) return true; // all same digit e.g. 0000000000
  if (core === "1234567890" || core === "0123456789") return true;
  return false;
}

/**
 * Evaluate a lead for spam signals.
 * @param opts.honeypot value of the hidden honeypot field — bots fill it, humans never see it.
 * @param opts.recentPhones phone digit-strings of leads received in the recent window, for dup detection.
 */
export function evaluateSpam(
  lead: LeadPayload,
  opts: { honeypot?: string; recentPhones?: string[] } = {},
): SpamVerdict {
  const reasons: string[] = [];

  if (opts.honeypot && opts.honeypot.trim()) {
    reasons.push("Hidden honeypot field was filled (bot)");
  }

  if (isRepeatedOrTrivialPhone(lead.phone)) {
    reasons.push("Phone number looks fake");
  }

  if (!LETTER_RE.test(lead.name)) {
    reasons.push("Name has no letters");
  }
  if (URL_RE.test(lead.name)) {
    reasons.push("Name contains a link");
  }

  if (lead.notes && URL_RE.test(lead.notes)) {
    reasons.push("Message contains a link");
  }

  if (opts.recentPhones && opts.recentPhones.length) {
    const digits = phoneDigits(lead.phone).slice(-10);
    if (digits && opts.recentPhones.includes(digits)) {
      reasons.push("Duplicate of a recent submission");
    }
  }

  return { suspected: reasons.length > 0, reasons };
}
