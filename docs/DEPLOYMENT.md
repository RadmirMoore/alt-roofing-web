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
- **Email:** info@altroofingsolutionsinc.com

Config: `src/config/site.ts`

## Verify after deploy

```bash
curl -I https://altroofingsolutions.com
curl https://altroofingsolutions.com/robots.txt
curl https://altroofingsolutions.com/sitemap.xml
```

Submit sitemap in [Google Search Console](https://search.google.com/search-console):  
`https://altroofingsolutions.com/sitemap.xml`
