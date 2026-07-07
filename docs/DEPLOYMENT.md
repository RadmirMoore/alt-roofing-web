# Deploy altroofingsolutions.com (Netlify)

**GitHub repo:** https://github.com/RadmirMoore/alt-roofing-web

## 1. Connect repo in Netlify

1. Open [Netlify → Projects](https://app.netlify.com/teams/radmirmoore/projects)
2. **Add new project** → **Import an existing project**
3. Choose **GitHub** → authorize if needed → select **RadmirMoore/alt-roofing-web**
4. Build settings (auto-detected from `netlify.toml`):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **Deploy site**

## 2. Add custom domain

After the first deploy succeeds:

1. **Site configuration → Domain management → Add a domain**
2. Add `altroofingsolutions.com` and `www.altroofingsolutions.com`
3. Netlify will show DNS records to set at Namecheap

## 3. Update DNS at Namecheap

In **Namecheap → altroofingsolutions.com → Advanced DNS**, remove parking records and add what Netlify shows. Typical setup:

| Type | Host | Value |
|------|------|-------|
| **ALIAS/ANAME** or **A** | `@` | Netlify load balancer IP |
| **CNAME** | `www` | `<your-site>.netlify.app` |

Delete old parking records:

- `@` → `162.255.119.81`
- `www` → `parkingpage.namecheap.com`

DNS propagation: 5–30 minutes (up to 48 hours).

## 4. Enable HTTPS

Netlify provisions a free Let's Encrypt certificate once DNS resolves.

## CLI deploy (optional)

```bash
npx netlify-cli login
npx netlify-cli init          # link to team radmirmoore
npm run build
npx netlify-cli deploy --prod --dir=dist
```

## URLs in this project

- **Site:** https://altroofingsolutions.com
- **Email:** info@altroofingsolutions.com

Config: `src/config/site.ts`

## 5. AI chat agent (optional but recommended)

In **Site configuration → Environment variables**, add:

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for the sales assistant |
| `OPENAI_MODEL` | No | Default: `gpt-4o-mini` |
| `RESEND_API_KEY` | No | Sends lead emails when the agent captures a customer |
| `LEAD_NOTIFICATION_EMAIL` | No | Where leads go (default: info@altroofingsolutions.com) |
| `LEAD_FROM_EMAIL` | No | Sender for Resend (must be verified in Resend) |
| `LEAD_WEBHOOK_URL` | No | Zapier/Make/CRM webhook instead of email |

Redeploy after adding variables. See `.env.example` for a template.

## 6. Admin panel

Open **https://altroofingsolutions.com/admin** and sign in with `ADMIN_PASSWORD`.
The panel has three tabs (deep-linkable — `/admin`, `/admin/leads`, `/admin/chats`):

- **Analytics** — unique visitors & sessions, page/section views, clicks, exits
  with time-on-site & scroll depth, traffic/conversion trend charts, a conversion
  funnel, device/source/browser breakdowns, click/attention/scroll heatmaps, and
  full per-session event timelines.
- **Leads** — every quote-form and AI-chat lead with a status pipeline
  (new → contacted → quoted → won → lost), internal notes, and CSV export.
- **Chats** — full AI-assistant transcripts, flagged when they produced a lead.

Set `ADMIN_PASSWORD` in Netlify environment variables before first use. Failed
logins are rate-limited per IP (8 attempts / 15 min) to blunt brute-forcing.

> **Access model:** a single shared password today. Multi-user accounts with
> roles (owner / view-only manager) are a planned follow-up — the token already
> flows through `admin-auth.ts` as the extension point.

### Data storage & retention

All admin data lives in **Netlify Blobs** (no external database). Three stores:

| Store | Holds | Retention |
|-------|-------|-----------|
| `alt-analytics` | Raw tracking events, one blob per day | Capped at 5 000 events/day; the dashboard reads the last 90 days |
| `alt-leads` | Persisted leads + CRM status/notes | Kept indefinitely (no cap) — this is the customer record |
| `alt-chats` | AI-chat transcripts, keyed per session | Kept indefinitely; may contain phone/address, so admin-token gated |

Leads and chats are intentionally **not** in the analytics store, so they never
hit the 5 000/day cap or the 90-day read window. If you later want to prune old
transcripts, add a scheduled function that deletes `alt-chats` blobs past a TTL.

Local testing with functions:

```bash
cp .env.example .env   # add your OPENAI_API_KEY
npm run dev:netlify    # runs Vite + Netlify functions together
```

## Verify after deploy

```bash
curl -I https://altroofingsolutions.com
curl https://altroofingsolutions.com/robots.txt
curl https://altroofingsolutions.com/sitemap.xml
```

Submit sitemap in [Google Search Console](https://search.google.com/search-console):  
`https://altroofingsolutions.com/sitemap.xml`
