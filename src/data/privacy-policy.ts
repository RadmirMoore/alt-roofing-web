// Update this date whenever the policy text changes.
export const PRIVACY_EFFECTIVE_DATE = "October 26, 2026";

export type PolicyBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: { label?: string; text: string }[] };

export type PolicySection = {
  id: string;
  title: string;
  blocks: PolicyBlock[];
};

export const privacyIntro = [
  'ALT Roofing Solutions Inc. ("ALT," "we," "us," or "our") explains in this Privacy Policy how we collect, use, retain, and disclose personal information through https://altroofingsolutions.com and related inquiries, estimates, roofing services, and customer communications. It also describes your privacy choices and how to contact us.',
  "This policy covers customers, prospective customers, and website visitors. Separate notices may apply to employment records or services operated independently by other companies. Reading this policy or using the website does not, by itself, give consent to receive marketing text messages.",
];

export const privacySections: PolicySection[] = [
  {
    id: "information-we-collect",
    title: "Information we collect",
    blocks: [
      {
        type: "p",
        text: "The information we collect depends on how you interact with us:",
      },
      {
        type: "list",
        items: [
          {
            label: "Contact and inquiry information",
            text: "your name, phone number, email address if provided, property or mailing address, requested roofing service, preferred inspection date and time, and information you provide in a form, message, call, or chat.",
          },
          {
            label: "Project and transaction information",
            text: "roof and property details, measurements, inspection findings, project photographs or documents, proposals, contracts, signatures, work history, warranty requests, invoices, payment amounts, payment method, and transaction references associated with your project.",
          },
          {
            label: "Communications and preferences",
            text: "emails, text messages, chat messages and responses, customer service notes, communications preferences, and records of consent or withdrawal of consent. If a call is recorded or transcribed, we provide notice and obtain any legally required consent before doing so.",
          },
          {
            label: "Website and device information",
            text: "browser and device details, IP address and request information available to our hosting systems, screen size, visitor and session identifiers, pages and sections visited, referring pages, campaign referral information, visit times, time on the site, scrolling, clicked links or buttons, click locations, and mouse movement patterns used to produce interaction maps.",
          },
        ],
      },
      {
        type: "p",
        text: "We receive information from you, your browser or device, people acting on your behalf, referral and lead-generation services, advertising platforms through which you submit an inquiry, and service providers supporting your project. Where relevant, property information may also come from public property records or inspections. Information from these sources may be combined with your inquiry or project record.",
      },
      {
        type: "p",
        text: "Please do not put Social Security numbers, passwords, complete payment card numbers, card security codes, bank account credentials, or sensitive health information in our public contact form or chat. Use the payment or financing channel provided for that purpose.",
      },
    ],
  },
  {
    id: "how-we-use-information",
    title: "How we use information",
    blocks: [
      {
        type: "p",
        text: "We use personal information to respond to questions; assess roofing needs; prepare and send estimates and proposals; arrange inspections; perform and manage projects; coordinate crews, materials, permits, and inspections; process and document payments; and handle customer service and warranty requests.",
      },
      {
        type: "p",
        text: "We also use it to send requested communications, manage consent and opt-outs, measure which website content and campaigns generate inquiries, improve navigation and service, detect spam and misuse, secure our systems, maintain business records, and meet legal obligations or resolve disputes. Promotional communications are subject to the choices and consent requirements described below.",
      },
    ],
  },
  {
    id: "who-receives-information",
    title: "Who receives information",
    blocks: [
      {
        type: "p",
        text: "We disclose information as needed for the purposes described in this policy to these categories of recipients:",
      },
      {
        type: "list",
        items: [
          {
            text: "Technology and support providers that operate website hosting, data storage, customer management, email, text messaging, AI chat, analytics, document, payment, or business support services for us.",
          },
          {
            text: "Roofing crews, subcontractors, suppliers, inspectors, permitting authorities, and warranty or insurance contacts, when needed to carry out your requested project, claim, or service.",
          },
          {
            text: "Payment processors and financing providers when you choose their services. Their own privacy notices explain how they handle information they collect directly.",
          },
          {
            text: "Professional advisers, regulators, courts, law enforcement, or others when disclosure is reasonably necessary to comply with law, protect rights or safety, investigate misuse, or address a claim.",
          },
          {
            text: "Other recipients you specifically direct us to contact or authorize to receive your information.",
          },
        ],
      },
      {
        type: "p",
        text: "We limit disclosures to information needed for the relevant purpose and require providers acting on our behalf to protect it and limit its use appropriately.",
      },
      {
        type: "p",
        text: "We do not sell personal information, rent customer lists, or share personal information for cross-context behavioral advertising. We do not give customer information to other companies for their independent marketing. The additional restrictions on mobile information and text-message consent below apply to all of the disclosures described in this policy.",
      },
    ],
  },
  {
    id: "analytics-and-browser-storage",
    title: "Website analytics and browser storage",
    blocks: [
      {
        type: "p",
        text: "Our website uses first-party analytics to understand visits and interactions. Browser local storage remembers a visitor identifier and referral information across visits. Session storage maintains a session identifier and timing information. Interaction data includes clicks, scrolling, time on the site, and mouse movement patterns. A click on a phone link records the click; it does not by itself identify who actually called or record a telephone conversation.",
      },
      {
        type: "p",
        text: "Visitor and session identifiers can connect website activity with a form submission or chat conversation. These records should not be treated as anonymous merely because they use an identifier instead of a name.",
      },
      {
        type: "p",
        text: "Local storage may remain in your browser until you or your browser remove it. Session storage generally lasts for the browser tab session. You can use your browser settings to clear or restrict cookies and site storage. Doing so may affect features, does not necessarily stop all technical logging, and does not delete information already stored in our systems. Contact us about information held by ALT.",
      },
      {
        type: "p",
        text: "The website loads fonts from Google Fonts. Your browser sends Google technical request information, including your IP address, to retrieve those fonts. Hosting and other feature providers also process information needed to deliver their services. We do not authorize third-party collection on this website for tracking your activity across unrelated websites for behavioral advertising.",
      },
      {
        type: "p",
        text: "California Do Not Track disclosure: our website does not currently change its behavior in response to legacy browser Do Not Track signals. Global Privacy Control is a different signal used to express an opt-out of sale or sharing. We do not engage in the sale or cross-context advertising sharing described above. If our practices change, we will update our notices and implement legally required opt-out methods and signal handling before beginning those activities.",
      },
    ],
  },
  {
    id: "ai-chat",
    title: "AI chat",
    blocks: [
      {
        type: "p",
        text: "Our website offers an automated AI chat assistant. When you use it, your messages, the assistant's responses, visitor and session identifiers, and referral information are processed to answer questions, collect inquiry details, and arrange follow-up. Chat records may be linked to a customer or lead record and reviewed by authorized ALT personnel for customer service, troubleshooting, and quality review.",
      },
      {
        type: "p",
        text: "Technology providers supporting the chat may process conversation content on our behalf. Share only information needed for your roofing inquiry. You can contact us by phone or email instead of using chat. An AI response may contain errors; confirm project commitments and pricing with our team.",
      },
    ],
  },
  {
    id: "text-messages",
    title: "Text messages and mobile information",
    blocks: [
      {
        type: "p",
        text: "If you opt in to receive text messages from ALT Roofing Solutions Inc., we may send recurring messages about your inquiry, requested estimate, inspection confirmations and reminders, scheduling, project updates, payments, and customer support. Promotional texts, such as offers or discounts, require a separate marketing opt-in. Messages may be sent using automated technology.",
      },
      {
        type: "p",
        text: "Message frequency varies with your requests and project activity. Message and data rates may apply. Text-message consent is optional and is not a condition of purchasing roofing services.",
      },
      {
        type: "p",
        text: "To stop texts, reply STOP to the number that messaged you. For assistance, reply HELP, email info@altroofingsolutions.com, or call (213) 415-6146. You may also tell us through these contact methods that you want texts to stop. We may send one confirmation of your opt-out, then stop further messages unless you provide a new valid opt-in. Opting out of texts does not cancel your service or project.",
      },
      {
        type: "p",
        text: "We use your mobile number, messages, delivery records, and opt-in or opt-out history to operate the messaging program, respond to you, and document your communications choices.",
      },
      {
        type: "p",
        text: "Mobile numbers, SMS opt-in records, and messaging consent are not sold, rented, or supplied to affiliates, lead generators, or other third parties for marketing or promotional use. Service providers supporting message delivery and customer support may process this information only to perform those services for us, subject to appropriate confidentiality and use restrictions. Messaging consent is not transferred to another business for its own use.",
      },
    ],
  },
  {
    id: "email-and-telephone",
    title: "Email and telephone choices",
    blocks: [
      {
        type: "p",
        text: "To stop promotional emails, use the unsubscribe instructions in the email or contact info@altroofingsolutions.com. We honor marketing email opt-outs within the period required by law. You may still receive non-promotional emails about an existing request, project, payment, warranty, or other service matter.",
      },
      {
        type: "p",
        text: "You can ask us to stop marketing calls or update your contact preferences using the contact details below. We obtain any consent required for automated or prerecorded marketing calls. A website privacy notice does not replace any required notice or consent for call recording or transcription.",
      },
    ],
  },
  {
    id: "retention",
    title: "How long we keep information",
    blocks: [
      {
        type: "p",
        text: "We retain personal information for the purposes described in this policy, using the following criteria:",
      },
      {
        type: "list",
        items: [
          {
            label: "Inquiries and contact records",
            text: "for the time needed to answer the request, complete appropriate follow-up, and maintain an active customer relationship.",
          },
          {
            label:
              "Project, contract, inspection, payment, and warranty records",
            text: "for performance of the project and applicable warranty, accounting, permit, insurance, recordkeeping, and legal claim requirements.",
          },
          {
            label: "Communications and chat records",
            text: "for the time needed to resolve the inquiry, support the project, review service quality, address complaints, or preserve relevant evidence.",
          },
          {
            label: "Website analytics and security records",
            text: "for the time needed to evaluate website performance, troubleshoot problems, prevent misuse, and investigate security events.",
          },
          {
            label: "Consent and opt-out records",
            text: "for the time needed to honor communications preferences and demonstrate that we complied with them.",
          },
        ],
      },
      {
        type: "p",
        text: "Browser storage follows the behavior described above. Legal holds or other legal obligations may require longer retention of relevant records. When information is no longer needed, we delete it or de-identify it, subject to lawful backup and recordkeeping requirements.",
      },
    ],
  },
  {
    id: "privacy-requests",
    title: "Your privacy requests",
    blocks: [
      {
        type: "p",
        text: 'You may contact us to ask about personal information associated with you, request access or correction, request deletion, or update your communications choices. Email info@altroofingsolutions.com with the subject "Privacy Request" or call (213) 415-6146. Please identify your request and provide enough contact or project information for us to locate the relevant record. Do not send sensitive identity documents unless we explain why they are needed and provide an appropriate way to submit them.',
      },
      {
        type: "p",
        text: "We may need to verify your identity before providing, correcting, or deleting personal information, and may request proof of authority if someone acts for you. We do not require identity verification simply to stop marketing communications. We will respond within applicable legal time limits and explain any lawful limitation, such as the need to retain records for a contract, warranty, tax requirement, security purpose, or legal claim.",
      },
      {
        type: "p",
        text: "Where applicable privacy law, including the California Consumer Privacy Act as amended, gives you rights, those may include knowing and accessing information; receiving a portable copy; correcting or deleting information; opting out of sale or sharing; limiting certain uses of sensitive personal information; and using an authorized agent. Those statutory rights depend on the law's coverage and exceptions. We will not unlawfully discriminate or retaliate against you for exercising a privacy right.",
      },
      {
        type: "p",
        text: "California residents may also contact us about disclosures for third parties' direct marketing under California's Shine the Light law, where applicable. We do not disclose customer information for that purpose, as stated above. You may request an accessible copy of this policy through the same contact methods.",
      },
    ],
  },
  {
    id: "security",
    title: "Security",
    blocks: [
      {
        type: "p",
        text: "We use administrative, technical, and organizational measures intended to protect personal information, including limiting access to people and providers who need it for their work. No website, transmission method, or storage system can be guaranteed completely secure. Please contact us if you believe information you provided to ALT has been misused.",
      },
    ],
  },
  {
    id: "children-and-other-websites",
    title: "Children and other websites",
    blocks: [
      {
        type: "p",
        text: "Our roofing services and website are intended for adults and are not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided information to us, contact us so we can investigate and delete it as required.",
      },
      {
        type: "p",
        text: "Links to financing providers, social media, or other independent websites lead to services governed by their own privacy notices. Review those notices before providing information. Our services are directed to the United States; this policy does not waive any privacy protections that applicable law gives you.",
      },
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    blocks: [
      {
        type: "p",
        text: "We will post updates on this page and revise the effective date and last-updated date. For material changes in how we collect, use, or disclose personal information, we will also provide a prominent website notice or contact affected individuals as appropriate. We obtain additional consent where required before applying a new use. An update to this policy does not itself create consent for marketing texts or calls.",
      },
    ],
  },
];
