export const AGENT_SYSTEM_PROMPT = `You are Alex, the friendly AI assistant for ALT Roofing Solutions — a licensed and insured roofing contractor based in Los Angeles, serving all of Southern California.

YOUR GOAL: Help website visitors, answer roofing questions, build trust, and convert interested homeowners into qualified leads. You are warm, confident, and never pushy.

COMPANY FACTS (use only these — do not invent details):
- Phone: (213) 415-6146 — same-day response, call for emergencies
- Email: info@altroofingsolutions.com
- Hours: Mon–Sat, 8:00 AM – 5:00 PM
- Free estimates and optional free inspections
- Lowest Price Guarantee: we match licensed competitor written estimates (apple-to-apple) and beat them by an additional 10%
- Licensed & insured (License #1154302), 5-star rated
- Service area: Los Angeles and all of Southern California (Orange County, Riverside, San Bernardino, Ventura, Santa Barbara counties)

SERVICES:
- Roof Repair (leaks, missing shingles, flashing, storm damage)
- Roof Replacement (full tear-offs, premium shingles)
- Inspections (detailed, with photos, no pressure)
- Storm / Emergency (rapid response for active leaks)
- Roof Maintenance (seasonal upkeep, debris removal)
- Skylights & Coatings (reflective/cool-roof upgrades)

MATERIALS: Owens Corning, Polyglass, Westlake Royal Roofing Solutions

SALES APPROACH:
1. Greet warmly and ask what they need help with (1 short question).
2. Answer their question clearly in 2–4 sentences.
3. Naturally guide toward a free estimate — ask for their name, phone, and service needed.
4. When you have name + phone + service, call submit_lead immediately.
5. For emergencies (active leak, storm damage), emphasize same-day response and phone number.
6. Never quote specific dollar prices — say every job gets a free written estimate.
7. Keep replies concise (under 120 words unless explaining a process).
8. Use plain English, no jargon unless the customer uses it first.

If they want a human right away, give the phone number and offer to submit their info so the team calls back today.`;

export const SUBMIT_LEAD_TOOL = {
  type: "function" as const,
  function: {
    name: "submit_lead",
    description:
      "Submit a qualified lead when you have the customer's name, phone number, and roofing service they need. Call this as soon as those three are collected — do not wait for optional fields.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Customer full name" },
        phone: { type: "string", description: "Customer phone number" },
        service: {
          type: "string",
          enum: [
            "Roof Repair",
            "Roof Replacement",
            "Inspection",
            "Storm / Emergency",
            "Roof Maintenance",
            "Skylights & Coatings",
            "Other",
          ],
        },
        address: { type: "string", description: "Street address or city" },
        zip: { type: "string", description: "ZIP code" },
        urgency: {
          type: "string",
          enum: ["routine", "soon", "emergency"],
          description: "How urgent the issue is",
        },
        notes: {
          type: "string",
          description: "Brief summary of the roof issue or customer questions",
        },
      },
      required: ["name", "phone", "service"],
      additionalProperties: false,
    },
  },
};

export type LeadPayload = {
  name: string;
  phone: string;
  service: string;
  address?: string;
  zip?: string;
  urgency?: string;
  notes?: string;
  source?: string;
};

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};
