import type { Config, Context } from "@netlify/functions";
import { forVisitor, forward } from "./lib/crm";

// Open inspection times from the CRM for the visitor's request (the request
// token stays in its HttpOnly cookie). Body: { from, to } as Pacific dates.
export default async (request: Request, context: Context) => {
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });
  const v = forVisitor(context);
  if ("reply" in v) return v.reply;
  const body = (await request.json().catch(() => ({}))) as { from?: unknown; to?: unknown };
  return forward(v.s, "times", { token: v.token, from: body.from, to: body.to });
};

export const config: Config = {
  path: "/api/crm/times",
};
