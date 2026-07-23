// Traffic attribution for a lead: where the visitor came from and (if present)
// which campaign. Captured first-touch on the client (see src/lib/attribution.ts),
// sanitized here before it is persisted with the lead.

export type Attribution = {
  /** Human-readable source label, e.g. "Google (organic)", "Direct", "Google Ads". */
  source: string;
  /** Raw document.referrer at first touch. */
  referrer?: string;
  /** First path the visitor landed on. */
  landingPath?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
};

const REFERRER_NAMES: Array<[RegExp, string]> = [
  [/(^|\.)google\./, "Google"],
  [/(^|\.)bing\./, "Bing"],
  [/duckduckgo\./, "DuckDuckGo"],
  [/(^|\.)yahoo\./, "Yahoo"],
  [/facebook\.|(^|\.)fb\./, "Facebook"],
  [/instagram\./, "Instagram"],
  [/(^|\.)t\.co$|twitter\.|(^|\.)x\.com$/, "X / Twitter"],
  [/youtube\.|youtu\.be/, "YouTube"],
  [/linkedin\./, "LinkedIn"],
  [/yelp\./, "Yelp"],
  [/reddit\./, "Reddit"],
  [/tiktok\./, "TikTok"],
  [/nextdoor\./, "Nextdoor"],
];

const SEARCH_ENGINES = new Set([
  "Google",
  "Bing",
  "DuckDuckGo",
  "Yahoo",
]);

function hostFromReferrer(referrer: string): string | null {
  const raw = referrer.trim();
  if (!raw) return null;
  try {
    return new URL(raw).hostname.replace(/^www\./, "");
  } catch {
    const host = raw.replace(/^www\./, "").split("/")[0];
    return host || null;
  }
}

function referrerName(host: string): string {
  for (const [pattern, name] of REFERRER_NAMES) {
    if (pattern.test(host)) return name;
  }
  return host;
}

/**
 * Derive a single human-readable source label from UTM params and referrer.
 * UTM campaign data always wins over the raw referrer.
 */
export function deriveSourceLabel(input: {
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}): string {
  const utmSource = input.utmSource?.trim();
  const utmMedium = input.utmMedium?.trim();

  if (utmSource) {
    // Recognize the common "google / cpc" paid pattern with a friendly label.
    const named = referrerName(utmSource.toLowerCase());
    const paid = utmMedium && /cpc|ppc|paid|ads?/i.test(utmMedium);
    if (paid && SEARCH_ENGINES.has(named)) return `${named} Ads`;
    if (utmMedium) return `${named} (${utmMedium})`;
    return named;
  }

  const host = input.referrer ? hostFromReferrer(input.referrer) : null;
  if (!host) return "Direct / none";
  const name = referrerName(host);
  return SEARCH_ENGINES.has(name) ? `${name} (organic)` : name;
}

function clean(value: unknown, max = 200): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, max);
  return trimmed || undefined;
}

/** Sanitize an untrusted attribution object arriving from the client. */
export function cleanAttribution(raw: unknown): Attribution | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const input = raw as Record<string, unknown>;

  const referrer = clean(input.referrer, 500);
  const utmSource = clean(input.utmSource, 120);
  const utmMedium = clean(input.utmMedium, 120);
  const utmCampaign = clean(input.utmCampaign, 200);
  const utmTerm = clean(input.utmTerm, 200);
  const utmContent = clean(input.utmContent, 200);
  const landingPath = clean(input.landingPath, 300);

  const source = deriveSourceLabel({
    referrer,
    utmSource,
    utmMedium,
    utmCampaign,
  });

  return {
    source,
    referrer,
    landingPath,
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
  };
}

/** Compact one-line description for emails / notifications. */
export function attributionSummary(attribution?: Attribution): string {
  if (!attribution) return "Unknown";
  const parts = [attribution.source];
  if (attribution.utmCampaign) parts.push(`campaign=${attribution.utmCampaign}`);
  if (attribution.landingPath) parts.push(`landed=${attribution.landingPath}`);
  return parts.join(" · ");
}
