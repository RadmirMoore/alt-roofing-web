import type { LeadPayload } from "./agent";
import { attributionSummary } from "./attribution";
import type { SpamVerdict } from "./spam";

type ResendResponse = {
  id?: string;
  name?: string;
  message?: string;
  statusCode?: number;
  error?: { message?: string };
};

type NotifyOptions = {
  spam?: SpamVerdict;
};

/** Fire-and-forget Telegram notification when a bot token + chat id are set. */
async function notifyTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          disable_web_page_preview: true,
        }),
      },
    );
    if (!response.ok) {
      console.error(`Telegram notify failed: HTTP ${response.status}`);
    }
  } catch (error) {
    console.error("Telegram notify error:", error);
  }
}

export async function notifyLead(
  lead: LeadPayload,
  options: NotifyOptions = {},
): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  const notifyEmail =
    process.env.LEAD_NOTIFICATION_EMAIL ?? "info@altroofingsolutions.com";
  const fromEmail =
    process.env.LEAD_FROM_EMAIL ?? "leads@altroofingsolutions.com";

  const source = lead.source ?? "website";
  const trafficSource = attributionSummary(lead.attribution);
  const spamNote = options.spam?.suspected
    ? `⚠ SUSPECTED SPAM: ${options.spam.reasons.join("; ")}`
    : null;

  const subject = `[Website Lead · ${source}] ${lead.service} — ${lead.name}`;
  const bodyLines = [
    `New lead from ${source} on altroofingsolutions.com`,
    ``,
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    `Service: ${lead.service}`,
    lead.address ? `Address: ${lead.address}` : null,
    lead.zip ? `ZIP: ${lead.zip}` : null,
    lead.urgency ? `Urgency: ${lead.urgency}` : null,
    lead.notes ? `Notes: ${lead.notes}` : null,
    ``,
    `Traffic source: ${trafficSource}`,
    spamNote,
    ``,
    `Submitted: ${new Date().toISOString()}`,
  ];
  const body = bodyLines.filter((line) => line !== null).join("\n");

  // Telegram (optional, non-blocking relative to email delivery).
  await notifyTelegram(body);

  if (resendKey) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [notifyEmail],
        subject,
        text: body,
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as ResendResponse | null;
      const detail =
        data?.message ?? data?.error?.message ?? `HTTP ${response.status}`;
      throw new Error(`Resend ${response.status} (from ${fromEmail}): ${detail}`);
    }

    return;
  }

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, lead, submittedAt: new Date().toISOString() }),
    });

    if (!response.ok) {
      throw new Error("Lead webhook failed");
    }

    return;
  }

  console.log("New lead (no RESEND_API_KEY or LEAD_WEBHOOK_URL configured):", lead);
}
