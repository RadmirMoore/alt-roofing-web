import { Loader2, MessageSquare, RefreshCw, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { fetchChat, fetchChats, formatDateTime } from "../../lib/admin-api";
import type { ChatSummary, StoredChat } from "../../types/chats";

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-sm text-foreground/60">{label}</div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
    </div>
  );
}

function Transcript({ sessionId }: { sessionId: string }) {
  const [chat, setChat] = useState<StoredChat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchChat(sessionId)
      .then((data) => active && setChat(data))
      .catch((e) =>
        active && setError(e instanceof Error ? e.message : "Failed to load"),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-foreground/60">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        Loading transcript…
      </div>
    );
  }
  if (error) return <p className="py-3 text-sm text-red-500">{error}</p>;
  if (!chat) return null;

  return (
    <div className="space-y-3">
      {chat.messages.map((message, i) => {
        const isUser = message.role === "user";
        return (
          <div
            key={i}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                isUser
                  ? "bg-primary/15 text-foreground"
                  : "bg-background/70 text-foreground/85"
              }`}
            >
              <div className="mb-1 flex items-center gap-1.5 text-xs text-foreground/45">
                {isUser ? (
                  "Visitor"
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
                    Alex (AI)
                  </>
                )}
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        );
      })}
      <div className="pt-1 text-xs text-foreground/40">
        Model {chat.model} · {chat.messageCount} messages
      </div>
    </div>
  );
}

function ChatRow({ chat }: { chat: ChatSummary }) {
  return (
    <details className="rounded-2xl border border-border bg-card p-5">
      <summary className="cursor-pointer list-none">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <MessageSquare
                className="h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span className="truncate font-display text-sm font-semibold">
                {chat.preview || "(no visitor message)"}
              </span>
            </div>
            <div className="mt-1 text-xs text-foreground/50">
              {formatDateTime(chat.startedAt)} · Session{" "}
              {chat.sessionId.slice(0, 8)}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-border px-2.5 py-1">
              {chat.messageCount} messages
            </span>
            {chat.leadSubmitted ? (
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-600 dark:text-emerald-400">
                → lead
              </span>
            ) : null}
          </div>
        </div>
      </summary>
      <div className="mt-4 border-t border-border pt-4">
        <Transcript sessionId={chat.sessionId} />
      </div>
    </details>
  );
}

export function ChatsPanel() {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [stats, setStats] = useState({ total: 0, withLead: 0, avgMessages: 0 });
  const [onlyLeads, setOnlyLeads] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchChats();
      setChats(data.chats);
      setStats({
        total: data.total,
        withLead: data.withLead,
        avgMessages: data.avgMessages,
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const shown = onlyLeads ? chats.filter((c) => c.leadSubmitted) : chats;
  const conversionRate =
    stats.total > 0 ? Math.round((stats.withLead / stats.total) * 1000) / 10 : 0;

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Metric label="Conversations" value={stats.total} />
        <Metric
          label="Led to a lead"
          value={`${stats.withLead} · ${conversionRate}%`}
        />
        <Metric label="Avg. messages" value={stats.avgMessages} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex items-center gap-2 text-sm text-foreground/70">
          <input
            type="checkbox"
            checked={onlyLeads}
            onChange={(event) => setOnlyLeads(event.target.checked)}
            className="h-4 w-4 accent-[color:var(--primary)]"
          />
          Only conversations that produced a lead
        </label>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm transition hover:border-primary/40"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      ) : null}

      {loading && chats.length === 0 ? (
        <div className="mt-16 flex items-center justify-center gap-3 text-foreground/60">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading chats…
        </div>
      ) : shown.length === 0 ? (
        <p className="mt-10 text-center text-sm text-foreground/50">
          {onlyLeads
            ? "No lead-producing conversations yet."
            : "No AI-chat conversations recorded yet."}
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {shown.map((chat) => (
            <ChatRow key={chat.sessionId} chat={chat} />
          ))}
        </div>
      )}
    </div>
  );
}
