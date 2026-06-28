export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

export type ChatResponse = {
  message: string;
  leadSubmitted?: boolean;
  error?: string;
};

export async function sendChatMessage(
  messages: Array<{ role: ChatRole; content: string }>,
): Promise<ChatResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  const data = (await response.json()) as ChatResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Chat request failed");
  }

  return data;
}

export function createMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
  };
}
