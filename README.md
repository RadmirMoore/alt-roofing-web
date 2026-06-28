# ALT Roofing Solutions

Local rebuild of the [ALT Roofing demo site](https://alt-roof-studio.lovable.app/) — a marketing landing page for ALT Roofing Solutions in Southern California.

## Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- Framer Motion (scroll animations)
- Lucide React (icons)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Production build & domain

```bash
npm run lint
npm run build
npm run preview
```

**Live domain:** [altroofingsolutions.com](https://altroofingsolutions.com)

Step-by-step DNS and Vercel setup: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## Project structure

- `src/components/` — page sections (hero, services, gallery, quote form, etc.)
- `src/data/content.ts` — copy, service areas, reviews, and shared constants
- `public/images/` — logo, gallery photos, manufacturer logos

## Next steps

- Wire quote forms to email/CRM (e.g. Resend, Formspree, or a custom API)
- Add analytics
- Deploy to production from the `main` branch
