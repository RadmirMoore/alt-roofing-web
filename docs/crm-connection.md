# Estimate form → ALT CRM

The estimate form (`src/components/EstimateForm.tsx`) still emails every request and keeps it in the admin inbox,
exactly as before. In addition, the website's server (`netlify/functions/lead.ts`) sends each real-looking request
into ALT's CRM (crm.altroofingsolutions.com) as an Unassigned lead. When the CRM can offer online inspection times,
the form's next step shows them (`src/components/InspectionTimes.tsx`, served by `netlify/functions/crm-times.ts`
and `crm-book.ts`); otherwise the visitor sees the usual thank-you message and the office calls.

- Only the server talks to the CRM, with a key. The visitor's request token is kept in an HttpOnly cookie.
- If the CRM can't be reached, nothing changes for the visitor; the email says "NOT in the CRM — enter it by hand".
- Code for the CRM call: `netlify/functions/lib/crm.ts`. CRM-side specification: `docs/website-connection.md` in
  the CRM repository.

## Turning it on (one setting in Netlify)

Netlify → this site → **Project configuration → Environment variables → Add a variable**:

| Key | Value |
|---|---|
| `WEBSITE_CONNECTION_KEY` | the key from ALT (sent privately — never put it in Git or a chat) |

Then **Deploys → Trigger deploy → Deploy site**. That's all: on the production site the CRM address is built in.

Without the key, or on deploy previews (unless `CRM_URL` is also set there), the connection stays off and the form
works exactly as before.
