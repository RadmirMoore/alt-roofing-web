import type { Config } from "@netlify/functions";
import { createAdminToken } from "./lib/admin-auth";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default async (request: Request) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const body = (await request.json()) as { password?: string };
    const configured = process.env.ADMIN_PASSWORD;

    if (!configured) {
      return json({ error: "Admin access is not configured" }, 500);
    }

    if (!body.password || body.password !== configured) {
      return json({ error: "Invalid password" }, 401);
    }

    return json({ token: createAdminToken() });
  } catch (error) {
    console.error("Admin login error:", error);
    return json({ error: "Login failed" }, 500);
  }
};

export const config: Config = {
  path: "/api/admin/login",
};
