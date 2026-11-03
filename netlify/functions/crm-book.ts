import type { Config, Context } from "@netlify/functions";
import { forVisitor, forward } from "./lib/crm";

// Books the chosen inspection time in the CRM. Body: { request_id, date, time };
// request_id is made once per chosen time, so a retry can't book twice.
// { check: true } instead asks the CRM what it holds now for this request (used
// when a booking answer was lost).
export default async (request: Request, context: Context) => {
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });
  const v = forVisitor(context);
  if ("reply" in v) return v.reply;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (body.check === true) return forward(v.s, "request", { token: v.token });
  return forward(v.s, "book", { token: v.token, request_id: body.request_id, date: body.date, time: body.time });
};

export const config: Config = {
  path: "/api/crm/book",
};
