# Deploy altroofingsolutions.com

The domain is registered at **Namecheap** (currently on a parking page). Follow these steps to point it at this site.

## 1. Deploy the site (Vercel — recommended)

```bash
npm install
npm run build
npx vercel --prod
```

Or connect the GitHub repo in [vercel.com/new](https://vercel.com/new):

- **Framework:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`

## 2. Add the domain in Vercel

1. Project → **Settings** → **Domains**
2. Add `altroofingsolutions.com`
3. Add `www.altroofingsolutions.com` (redirects to apex via `vercel.json`)

Vercel will show the DNS records you need.

## 3. Update DNS at Namecheap

In **Namecheap → Domain List → altroofingsolutions.com → Advanced DNS**, remove the parking records and set:

| Type  | Host | Value                    |
|-------|------|--------------------------|
| **A** | `@`  | `76.76.21.21` (Vercel)   |
| **CNAME** | `www` | `cname.vercel-dns.com.` |

> Use the exact values Vercel shows in the Domains panel — they may differ slightly.

Delete old records:

- `@` → `162.255.119.81` (parking)
- `www` → `parkingpage.namecheap.com`

DNS propagation usually takes 5–30 minutes (up to 48 hours).

## 4. Enable HTTPS

Vercel issues a free SSL certificate automatically once DNS resolves.

## Alternative: Netlify / Cloudflare Pages

- **Netlify:** use `public/_redirects` (already included) for SPA routing; point `@` A record to Netlify’s load balancer IP.
- **Cloudflare Pages:** connect repo, set build `npm run build`, publish `dist`, then add custom domain in Cloudflare.

## URLs in this project

All SEO URLs use:

- **Site:** https://altroofingsolutions.com
- **Email:** info@altroofingsolutionsinc.com (unchanged — business inbox)

Config: `src/config/site.ts`

## Verify after deploy

```bash
curl -I https://altroofingsolutions.com
curl https://altroofingsolutions.com/robots.txt
curl https://altroofingsolutions.com/sitemap.xml
```

Submit sitemap in [Google Search Console](https://search.google.com/search-console):  
`https://altroofingsolutions.com/sitemap.xml`
