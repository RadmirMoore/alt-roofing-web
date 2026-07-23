import { getStore } from "@netlify/blobs";

export type ChatRole = "user" | "assistant";

export type ChatTranscriptMessage = {
  role: ChatRole;
  content: string;
};

export type StoredChat = {
  sessionId: string;
  visitorId?: string;
  startedAt: string;
  updatedAt: string;
  messages: ChatTranscriptMessage[];
  messageCount: number;
  leadSubmitted: boolean;
  model: string;
};

/** Lightweight row for the list view — no full transcript. */
export type ChatSummary = {
  sessionId: string;
  visitorId?: string;
  startedAt: string;
  updatedAt: string;
  messageCount: number;
  leadSubmitted: boolean;
  preview: string;
};

const KEY_PREFIX = "chat:";

function getChatsStore() {
  return getStore({ name: "alt-chats", consistency: "strong" });
}

function chatKey(sessionId: string) {
  return `${KEY_PREFIX}${sessionId}`;
}

function firstUserMessage(messages: ChatTranscriptMessage[]): string {
  return messages.find((m) => m.role === "user")?.content?.slice(0, 140) ?? "";
}

/**
 * Upsert a transcript keyed by session. The client resends the full history
 * each turn, so the latest call carries the complete conversation — we overwrite
 * the message list and only preserve the original startedAt. Best-effort: the
 * caller wraps this so a storage failure never breaks the chat response.
 */
export async function persistChat(input: {
  sessionId: string;
  visitorId?: string;
  messages: ChatTranscriptMessage[];
  leadSubmitted: boolean;
  model: string;
}): Promise<void> {
  const store = getChatsStore();
  const key = chatKey(input.sessionId);
  const existing = (await store.get(key, { type: "json" })) as StoredChat | null;
  const now = new Date().toISOString();

  const stored: StoredChat = {
    sessionId: input.sessionId,
    visitorId: input.visitorId ?? existing?.visitorId,
    startedAt: existing?.startedAt ?? now,
    updatedAt: now,
    messages: input.messages,
    messageCount: input.messages.length,
    // Once a lead has been submitted in a session it stays flagged.
    leadSubmitted: Boolean(existing?.leadSubmitted) || input.leadSubmitted,
    model: input.model,
  };

  await store.setJSON(key, stored);
}

export async function listChatSummaries(days?: number): Promise<ChatSummary[]> {
  const store = getChatsStore();
  const { blobs } = await store.list({ prefix: KEY_PREFIX });
  const cutoff =
    days && days > 0 ? Date.now() - days * 24 * 60 * 60 * 1000 : null;

  const chats = (await Promise.all(
    blobs.map((blob) => store.get(blob.key, { type: "json" })),
  )) as (StoredChat | null)[];

  return chats
    .filter((c): c is StoredChat => Boolean(c))
    .filter((c) => (cutoff ? new Date(c.updatedAt).getTime() >= cutoff : true))
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .map((c) => ({
      sessionId: c.sessionId,
      visitorId: c.visitorId,
      startedAt: c.startedAt,
      updatedAt: c.updatedAt,
      messageCount: c.messageCount,
      leadSubmitted: c.leadSubmitted,
      preview: firstUserMessage(c.messages),
    }));
}

export async function getChat(sessionId: string): Promise<StoredChat | null> {
  const store = getChatsStore();
  return (await store.get(chatKey(sessionId), { type: "json" })) as
    | StoredChat
    | null;
}
