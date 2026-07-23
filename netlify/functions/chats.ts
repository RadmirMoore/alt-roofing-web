import type { Config } from "@netlify/functions";
import { getBearerToken, verifyAdminToken } from "./lib/admin-auth";
import { getChat, listChatSummaries } from "./lib/chats-store";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default async (request: Request) => {
  const token = getBearerToken(request);
  if (!verifyAdminToken(token)) {
    return json({ error: "Unauthorized" }, 401);
  }

  if (request.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  const url = new URL(request.url);
  // Single transcript is fetched via ?sessionId= (a query param, not a path
  // segment) so a missing id returns a clean 404 instead of tripping the dev
  // server's static-file fallback on the /api/chats/:id path pattern.
  const sessionId = url.searchParams.get("sessionId");

  try {
    if (sessionId) {
      const chat = await getChat(sessionId);
      if (!chat) return json({ error: "Chat not found" }, 404);
      return json({ chat });
    }

    const daysParam = url.searchParams.get("days");
    const days = daysParam ? Number(daysParam) : undefined;
    const chats = await listChatSummaries(
      Number.isFinite(days) ? days : undefined,
    );

    const withLead = chats.filter((c) => c.leadSubmitted).length;
    const totalMessages = chats.reduce((sum, c) => sum + c.messageCount, 0);
    const avgMessages =
      chats.length > 0 ? Math.round((totalMessages / chats.length) * 10) / 10 : 0;

    return json({
      chats,
      total: chats.length,
      withLead,
      avgMessages,
    });
  } catch (error) {
    console.error("Chats list error:", error);
    return json({ error: "Failed to load chats" }, 500);
  }
};

export const config: Config = {
  path: "/api/chats",
};
