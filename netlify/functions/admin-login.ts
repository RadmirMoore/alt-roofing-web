import type { Config } from "@netlify/functions";
import { createAdminToken } from "./lib/admin-auth";
import {
  clearLoginFailures,
  clientIp,
  isLoginBlocked,
  recordFailedLogin,
} from "./lib/rate-limit";

function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export default async (request: Request) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const ip = clientIp(request);

  try {
    const { blocked, retryAfterSec } = await isLoginBlocked(ip);
    if (blocked) {
      return json({ error: "Too many attempts. Please try again later." }, 429, {
        "Retry-After": String(retryAfterSec),
      });
    }

    const body = (await request.json()) as { password?: string };
    const configured = process.env.ADMIN_PASSWORD;

    if (!configured) {
      return json({ error: "Admin access is not configured" }, 500);
    }

    if (!body.password || body.password !== configured) {
      await recordFailedLogin(ip);
      return json({ error: "Invalid password" }, 401);
    }

    await clearLoginFailures(ip);
    return json({ token: createAdminToken() });
  } catch (error) {
    console.error("Admin login error:", error);
    return json({ error: "Login failed" }, 500);
  }
};

export const config: Config = {
  path: "/api/admin/login",
};
