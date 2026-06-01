# Muhammad Bintang Al Akbar — Portfolio

Premium, server-rendered personal portfolio built with **Next.js 16**, **React 19**, and **TypeScript**. Token-driven theming, MDX content collections, full SEO, and PWA support.

**Live:** [stareezy.tech](https://stareezy.tech)

---

## Deploy to Vercel

### One-click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/stareezy/next-gen-portfolio)

### Manual

```bash
# Install Vercel CLI
npm i -g vercel

# From the next-gen-portfolio directory
cd next-gen-portfolio
vercel
```

Follow the prompts:

- **Framework:** Next.js (auto-detected)
- **Root directory:** `next-gen-portfolio` (if deploying from workspace root)
- **Build command:** `npm run build`
- **Output directory:** `.next`

### Environment variables (all optional)

Copy `.env.example` to `.env.local` and fill in values:

| Variable                          | Purpose                                 |
| --------------------------------- | --------------------------------------- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`   | Google Analytics 4                      |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID`  | Microsoft Clarity                       |
| `NEXT_PUBLIC_OPENPANEL_CLIENT_ID` | OpenPanel analytics                     |
| `RESEND_API_KEY`                  | Contact form email delivery             |
| `CONTACT_TO_EMAIL`                | Email that receives contact submissions |

The app works fully without any of these — analytics silently no-ops and the contact form falls back gracefully.

---

## Local development

```bash
cd next-gen-portfolio
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run test       # property-based tests (vitest --run)
npm run typecheck  # tsc --noEmit
```

## Stack

- **Framework:** Next.js 16 App Router, React 19, TypeScript 5
- **Styling:** CSS custom properties from `@stareezy-ui/tokens`
- **Content:** MDX + Zod schemas (content collections)
- **Testing:** Vitest + fast-check (47 property-based tests)
- **SEO:** sitemap, robots, RSS, JSON-LD, OG image, PWA manifest
- **Analytics:** Google Analytics 4, Microsoft Clarity, OpenPanel
