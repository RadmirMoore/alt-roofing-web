// First-touch traffic attribution, captured once on the visitor's first page
// load and persisted for the life of the browser. Sent with every lead (form
// and chat) so the admin can see where each lead actually came from.

const ATTRIBUTION_KEY = "alt_attribution";

export type Attribution = {
  referrer?: string;
  landingPath?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
};

function readStored(): Attribution | null {
  try {
    const raw = localStorage.getItem(ATTRIBUTION_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}

function captureFromUrl(): Attribution {
  const params = new URLSearchParams(window.location.search);
  const pick = (key: string) => params.get(key)?.trim() || undefined;

  return {
    // Referrer only counts when it's off-site; same-origin nav isn't a source.
    referrer: document.referrer || undefined,
    landingPath: window.location.pathname + window.location.hash,
    utmSource: pick("utm_source"),
    utmMedium: pick("utm_medium"),
    utmCampaign: pick("utm_campaign"),
    utmTerm: pick("utm_term"),
    utmContent: pick("utm_content"),
  };
}

/**
 * Return the visitor's first-touch attribution, capturing and storing it on the
 * first call. Subsequent visits keep the original source (first-touch model).
 */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};

  const stored = readStored();
  if (stored) return stored;

  const captured = captureFromUrl();
  try {
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(captured));
  } catch {
    // Storage may be unavailable (private mode) — attribution is best-effort.
  }
  return captured;
}
