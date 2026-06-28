import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24;

function getAdminSecret() {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error("ADMIN_PASSWORD is not configured");
  }
  return secret;
}

export function createAdminToken() {
  const secret = getAdminSecret();
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const signature = createHmac("sha256", secret)
    .update(String(expiresAt))
    .digest("hex");

  return `${expiresAt}.${signature}`;
}

export function verifyAdminToken(token: string | null | undefined) {
  if (!token) return false;

  try {
    const secret = getAdminSecret();
    const [expiresRaw, signature] = token.split(".");
    const expiresAt = Number(expiresRaw);

    if (!expiresRaw || !signature || Number.isNaN(expiresAt)) return false;
    if (Date.now() > expiresAt) return false;

    const expected = createHmac("sha256", secret)
      .update(expiresRaw)
      .digest("hex");

    const left = Buffer.from(signature, "utf8");
    const right = Buffer.from(expected, "utf8");

    if (left.length !== right.length) return false;
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export function getBearerToken(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim();
}
