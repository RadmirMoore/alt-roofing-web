// Client-side mirror of the server chat types
// (netlify/functions/lib/chats-store.ts). Keep the two in sync.

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

export type ChatSummary = {
  sessionId: string;
  visitorId?: string;
  startedAt: string;
  updatedAt: string;
  messageCount: number;
  leadSubmitted: boolean;
  preview: string;
};

export type ChatsResponse = {
  chats: ChatSummary[];
  total: number;
  withLead: number;
  avgMessages: number;
};
