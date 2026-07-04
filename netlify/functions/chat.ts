import type { Config } from "@netlify/functions";
import {
  AGENT_SYSTEM_PROMPT,
  SUBMIT_LEAD_TOOL,
  type ChatMessage,
  type LeadPayload,
} from "./lib/agent";
import { notifyLead } from "./lib/lead-mailer";
import { isValidPhone } from "./lib/validate";

type OpenAIMessage =
  | { role: "system" | "user" | "assistant"; content: string }
  | {
      role: "assistant";
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: "function";
        function: { name: string; arguments: string };
      }>;
    }
  | { role: "tool"; tool_call_id: string; content: string };

type OpenAIResponse = {
  choices: Array<{
    message: OpenAIMessage;
    finish_reason: string;
  }>;
  error?: { message?: string };
};

const MAX_MESSAGES = 24;
const MAX_CONTENT_LENGTH = 2000;
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function sanitizeMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages
    .filter(
      (message) =>
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim().length > 0,
    )
    .slice(-MAX_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_CONTENT_LENGTH),
    }));
}

async function callOpenAI(messages: OpenAIMessage[]): Promise<OpenAIResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      tools: [SUBMIT_LEAD_TOOL],
      tool_choice: "auto",
      temperature: 0.6,
      max_tokens: 500,
    }),
  });

  const data = (await response.json()) as OpenAIResponse;
  if (!response.ok) {
    throw new Error(data.error?.message ?? "OpenAI request failed");
  }

  return data;
}

function parseLead(args: string): LeadPayload {
  const parsed = JSON.parse(args) as LeadPayload;
  if (!parsed.name?.trim() || !parsed.phone?.trim() || !parsed.service?.trim()) {
    throw new Error("Invalid lead payload");
  }
  return parsed;
}

export default async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const body = (await request.json()) as { messages?: ChatMessage[] };
    const userMessages = sanitizeMessages(body.messages ?? []);

    if (userMessages.length === 0) {
      return json({ error: "No messages provided" }, 400);
    }

    const conversation: OpenAIMessage[] = [
      { role: "system", content: AGENT_SYSTEM_PROMPT },
      ...userMessages,
    ];

    let leadSubmitted = false;
    let iterations = 0;

    while (iterations < 4) {
      iterations += 1;
      const data = await callOpenAI(conversation);
      const choice = data.choices[0];
      if (!choice) {
        throw new Error("Empty model response");
      }

      const { message, finish_reason: finishReason } = choice;

      if (
        finishReason === "tool_calls" &&
        "tool_calls" in message &&
        message.tool_calls?.length
      ) {
        conversation.push(message);

        for (const toolCall of message.tool_calls) {
          if (toolCall.function.name !== "submit_lead") {
            conversation.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: "Unsupported tool.",
            });
            continue;
          }

          let lead: LeadPayload;
          try {
            lead = parseLead(toolCall.function.arguments);
          } catch {
            conversation.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content:
                "Could not submit yet — name, phone, and service are all required. Ask the customer for whatever is missing, then submit again. Do not tell the customer it was submitted.",
            });
            continue;
          }

          if (!isValidPhone(lead.phone)) {
            conversation.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content:
                "The phone number doesn't look valid — we need a 10-digit US number with area code. Politely ask the customer to confirm their phone number, then submit again. Do NOT tell the customer the lead was submitted yet.",
            });
            continue;
          }

          await notifyLead({ ...lead, source: "AI chat" });
          leadSubmitted = true;
          conversation.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content:
              "Lead submitted successfully. Confirm to the customer that our team will call them back today, usually within a few hours.",
          });
        }

        continue;
      }

      const content =
        "content" in message && message.content
          ? message.content.trim()
          : "Sorry, I had trouble responding. Please call us at (213) 415-6146.";

      return json({
        message: content,
        leadSubmitted,
      });
    }

    return json({
      message:
        "Thanks for your patience! Our team will follow up shortly — or call us now at (213) 415-6146.",
      leadSubmitted,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    console.error("Chat function error:", message);
    return json(
      {
        error:
          message === "OPENAI_API_KEY is not configured"
            ? "Chat is not configured yet. Please call (213) 415-6146."
            : "Something went wrong. Please try again or call (213) 415-6146.",
      },
      500,
    );
  }
};

export const config: Config = {
  path: "/api/chat",
};
