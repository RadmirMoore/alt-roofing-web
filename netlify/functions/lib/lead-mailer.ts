import type { LeadPayload } from "./agent";

type ResendResponse = {
  id?: string;
  error?: { message?: string };
};

export async function notifyLead(lead: LeadPayload): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  const notifyEmail =
    process.env.LEAD_NOTIFICATION_EMAIL ?? "info@altroofingsolutionsinc.com";
  const fromEmail =
    process.env.LEAD_FROM_EMAIL ?? "leads@altroofingsolutions.com";

  const subject = `[Website Lead] ${lead.service} — ${lead.name}`;
  const body = [
    `New lead from AI chat on altroofingsolutions.com`,
    ``,
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    `Service: ${lead.service}`,
    lead.address ? `Address: ${lead.address}` : null,
    lead.zip ? `ZIP: ${lead.zip}` : null,
    lead.urgency ? `Urgency: ${lead.urgency}` : null,
    lead.notes ? `Notes: ${lead.notes}` : null,
    ``,
    `Submitted: ${new Date().toISOString()}`,
  ]
    .filter(Boolean)
    .join("\n");

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
      const data = (await response.json()) as ResendResponse;
      throw new Error(data.error?.message ?? "Failed to send lead email");
    }

    return;
  }

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "ai-chat", lead, submittedAt: new Date().toISOString() }),
    });

    if (!response.ok) {
      throw new Error("Lead webhook failed");
    }

    return;
  }

  console.log("New lead (no RESEND_API_KEY or LEAD_WEBHOOK_URL configured):", lead);
}
