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
| `GITHUB_PORTFOLIO_TOKEN`          | Server-only public GitHub contribution feed |

The core app works without these values. Analytics silently no-ops, the contact
form falls back gracefully, and the open-source page displays an unavailable
state until `GITHUB_PORTFOLIO_TOKEN` is configured. Keep that token server-only;
it does not need write permissions.

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

## Portfolio studio redesign

The ArtCraft-inspired redesign follows the specification in [requirements](.kiro/specs/artcraft-portfolio-revamp/requirements.md), [design](.kiro/specs/artcraft-portfolio-revamp/design.md), and [tasks](.kiro/specs/artcraft-portfolio-revamp/tasks.md). See [validation](.kiro/specs/artcraft-portfolio-revamp/validation.md) for content-integrity, browser, test and build evidence. All existing MDX content is preserved.

If Turbopack cannot resolve packages on an external drive, use `npm run dev -- --webpack`. The verified production build command is `npm run build -- --webpack`, followed by `npm run start`.

The studio includes a scroll-reactive hero, a section index and progressive heading reveals. Motion respects reduced-motion preferences; native scrolling and server-rendered content remain available.

Public contributions work without a GitHub token using public REST. Optional `GITHUB_PORTFOLIO_TOKEN` enables GraphQL. A dated, verified snapshot is used when GitHub is unavailable. Refresh it with `node_modules/.bin/vite-node scripts/refresh-contributions.ts`.

Regenerate the vector/raster public brand assets with `node scripts/build-brand-assets.mjs`. The shared mark/palette lives in `src/constants/brand.json`; the generated OG endpoint uses the bundled, OFL-licensed Space Grotesk font in `public/fonts`.
