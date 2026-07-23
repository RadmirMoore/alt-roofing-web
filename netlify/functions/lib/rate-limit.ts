import { getStore } from "@netlify/blobs";

// Simple per-IP failed-login throttle backed by Netlify Blobs. Enough to blunt
// password brute-forcing against the single shared admin password.
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILURES = 8;

function getRateStore() {
  return getStore({ name: "alt-ratelimit", consistency: "strong" });
}

function key(ip: string) {
  return `login:${ip}`;
}

/** Best-effort client IP from the platform / proxy headers. */
export function clientIp(request: Request): string {
  const direct = request.headers.get("x-nf-client-connection-ip");
  if (direct) return direct.trim();
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

async function recentFailures(ip: string): Promise<number[]> {
  const store = getRateStore();
  const stamps = (await store.get(key(ip), { type: "json" })) as number[] | null;
  const cutoff = Date.now() - WINDOW_MS;
  return (stamps ?? []).filter((t) => t >= cutoff);
}

export async function isLoginBlocked(
  ip: string,
): Promise<{ blocked: boolean; retryAfterSec: number }> {
  const fails = await recentFailures(ip);
  if (fails.length < MAX_FAILURES) return { blocked: false, retryAfterSec: 0 };
  const oldest = Math.min(...fails);
  const retryAfterSec = Math.max(
    1,
    Math.ceil((oldest + WINDOW_MS - Date.now()) / 1000),
  );
  return { blocked: true, retryAfterSec };
}

export async function recordFailedLogin(ip: string): Promise<void> {
  const fails = await recentFailures(ip);
  fails.push(Date.now());
  await getRateStore().setJSON(key(ip), fails);
}

export async function clearLoginFailures(ip: string): Promise<void> {
  await getRateStore().delete(key(ip));
}
