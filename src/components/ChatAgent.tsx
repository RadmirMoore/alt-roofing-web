import { AnimatePresence, motion } from "framer-motion";
import {
  Loader2,
  MessageCircle,
  Phone,
  SendHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { PHONE, PHONE_HREF } from "../data/content";
import { createMessage, sendChatMessage, type ChatMessage } from "../lib/chat";

const QUICK_PROMPTS = [
  "I need a free roof estimate",
  "I have a leak — is this an emergency?",
  "What areas do you serve?",
  "How does your price guarantee work?",
] as const;

const WELCOME_MESSAGE = createMessage(
  "assistant",
  "Hi! I'm Alex from ALT Roofing Solutions. I can answer questions about repairs, replacements, inspections, and help you get a free estimate. What can I help you with today?",
);

function useMobileViewport(open: boolean) {
  const [style, setStyle] = useState<CSSProperties>({});

  useEffect(() => {
    if (!open) {
      setStyle({});
      return;
    }

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (!isMobile) {
      setStyle({});
      return;
    }

    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      setStyle({
        top: `${viewport.offsetTop}px`,
        left: `${viewport.offsetLeft}px`,
        width: `${viewport.width}px`,
        height: `${viewport.height}px`,
      });
    };

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    window.addEventListener("orientationchange", update);

    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      window.removeEventListener("orientationchange", update);
    };
  }, [open]);

  return style;
}

export function ChatAgent() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mobileViewportStyle = useMobileViewport(open);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  useEffect(() => {
    if (!open) return;

    document.body.classList.add("chat-open");

    return () => {
      document.body.classList.remove("chat-open");
    };
  }, [open]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage = createMessage("user", trimmed);
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const payload = nextMessages.map(({ role, content }) => ({ role, content }));
      const response = await sendChatMessage(payload);
      setMessages((current) => [
        ...current,
        createMessage("assistant", response.message),
      ]);
      if (response.leadSubmitted) {
        setLeadCaptured(true);
      }
    } catch (error) {
      const fallback =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please call us directly.";
      setMessages((current) => [
        ...current,
        createMessage("assistant", fallback),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Close chat backdrop"
            className="chat-backdrop fixed inset-0 z-[65] md:hidden"
            onClick={() => setOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            style={mobileViewportStyle}
            className="fixed z-[70] box-border flex max-w-full flex-col overflow-hidden border border-border bg-card shadow-[0_30px_80px_-30px_rgba(0,0,0,0.55)] max-md:rounded-none max-md:border-x-0 max-md:border-t max-md:border-b-0 md:right-6 md:bottom-24 md:h-[min(560px,calc(100dvh-8rem))] md:w-[min(400px,calc(100vw-3rem))] md:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Chat with ALT Roofing assistant"
          >
            <div className="flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur-xl">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/20">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="truncate font-display text-sm font-semibold">
                    Alex · ALT Roofing
                  </div>
                  <div className="truncate text-[11px] text-foreground/55">
                    {leadCaptured
                      ? "Lead sent — we'll call you today"
                      : "Free estimates · Same-day response"}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border transition hover:border-primary/40"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div
              ref={listRef}
              className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md border border-border bg-background text-foreground/85"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {loading ? (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-border bg-background px-4 py-3 text-sm text-foreground/60">
                    <Loader2
                      className="h-4 w-4 animate-spin text-primary"
                      aria-hidden="true"
                    />
                    Alex is typing…
                  </div>
                </div>
              ) : null}
            </div>

            {!leadCaptured && messages.length <= 2 ? (
              <div className="shrink-0 border-t border-border px-4 py-3 max-md:max-h-28 max-md:overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      className="max-w-full rounded-full border border-border bg-background/80 px-3 py-1.5 text-left text-xs text-foreground/75 transition hover:border-primary/40 hover:text-foreground"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <form
              onSubmit={handleSubmit}
              className="shrink-0 border-t border-border bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:pb-3"
            >
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage(input);
                    }
                  }}
                  rows={1}
                  placeholder="Ask about your roof…"
                  disabled={loading}
                  className="max-h-24 min-h-11 flex-1 resize-none rounded-xl border border-border bg-card px-3 py-2.5 text-base outline-none transition placeholder:text-foreground/40 focus:border-primary disabled:opacity-60 md:text-sm"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:brightness-110 disabled:opacity-50 cobalt-glow"
                >
                  <SendHorizontal className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-2 hidden items-center justify-between gap-2 text-[11px] text-foreground/45 md:flex">
                <span>Licensed & insured · Los Angeles</span>
                <a
                  href={PHONE_HREF}
                  className="inline-flex items-center gap-1 text-primary transition hover:underline"
                >
                  <Phone className="h-3 w-3" aria-hidden="true" />
                  {PHONE}
                </a>
              </div>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open chat assistant"
          className="fixed right-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-[60] inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_16px_40px_-12px_var(--color-accent-cobalt-glow)] transition hover:brightness-110 md:right-6 md:bottom-6 md:px-5 md:py-3.5 cobalt-glow"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          <span className="hidden sm:inline">Chat with us</span>
        </button>
      ) : null}
    </>
  );
}
