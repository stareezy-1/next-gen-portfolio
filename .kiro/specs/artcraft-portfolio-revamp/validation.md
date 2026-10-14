# Validation record — 2026-10-14

## Automated verification

- Baseline: TypeScript passed; 49 Vitest files / 293 tests passed before implementation.
- Final application logic: `npm run typecheck` passed; 50 files / 297 tests passed. Four new component checks cover actual navigation focus wrap, Escape/focus restoration, current-route dismissal, scroll cleanup, and server-visible reveal output.
- Final optimized build: `npm run build -- --webpack` passed, including TypeScript and generation of 32 static pages. All existing route families are present.
- Content integrity: SHA-256 comparison against `content-baseline.json` passed for all 25 MDX files. Portfolio collection content, contact transport, selectors, analytics adapters and route slugs were preserved.
- `git diff --check` passed.

## Browser verification

Production preview: http://127.0.0.1:3001 (local `next start`).

- Home, About, Experience, Projects, Open Source, Blog, Contact, ZniForm project detail, frontend architecture article, and 404 loaded with one main landmark each.
- Home and the nine content page types were checked at 375px, 768px and desktop widths up to 1440px: no horizontal document overflow. The 404 was also checked at desktop and a narrow 341px viewport.
- Visual review: desktop hero, selected work, About, project catalog, Blog, Contact; mobile home, navigation, experience and project detail; tablet light theme.
- Sticky header remains at top 0 after anchor navigation.
- Mobile menu moves focus inside, wraps Shift+Tab/Tab, closes on Escape and restores toggle focus. Tablet menu is visible at the final 768px check.
- Blog query `Aurora` updates URL and results; Tutorial category yields only the Next.js tutorial.
- Empty contact submission shows four required-field errors and four aria-invalid fields. No email was sent.
- Light theme survives reload. Light/System/Dark cycling and Steins;Gate/Aurora switching work.
- Final production browser logs contain no JavaScript errors or hydration warnings; existing 404 decoration emits a THREE.Clock deprecation warning.

## Evidence

- `output/artcraft-revamp/home-desktop.jpg` — production hero, 1440 × 900 capture.
- `output/artcraft-revamp/home-mobile.jpg` — production hero, 375 × 811 capture.

## Limits and existing issues

- `npm run lint` is pre-existing `next lint`; the installed Next.js 16 CLI rejects it as an invalid directory. No ESLint dependency or working flat config is installed. TypeScript, component/property tests and build passed; a separate ESLint migration was not introduced.
- Turbopack failed on this external SSD with `Next.js package not found`; validation used Webpack successfully. The sandbox initially prevented font downloads, so the successful build used approved network access for the existing Google Fonts integration.
- Live GitHub contributions are unavailable in this local environment. Its existing unavailable state was inspected; no live totals or successful feed refresh are claimed.
- Existing article MDX may contain its own level-one heading in addition to the page title. Authored article content was preserved.
- Local validation does not establish production deployment, live contact delivery, external demo availability, cross-browser coverage or a Lighthouse score.

## Follow-up: motion, contribution recovery and public identity

- Root cause: local environment had no `GITHUB_PORTFOLIO_TOKEN`. No secret values were displayed or copied. Public REST returned 19 merged PRs in four external repositories; each PR and repository was then verified and its real statistics normalized.
- The updated development preview rendered four homepage highlights and all 19 records / four repositories on `/open-source`, with `GitHub snapshot · October 14, 2026`. No unavailable state remained.
- Actual wheel scroll at `scrollY=405` changed the hero's progress to approximately 0.39 and its orbital transform from identity to a translated, rotated and scaled matrix. The right-hand index switched between hero, work and experience; the ticker and staggered word reveals were visually inspected. Animated heading spaces were corrected after visual QA.
- Reduced-motion and missing-IntersectionObserver fallback are covered by new component tests. Server-rendered reveal output remains visible without client execution. Hero CSS/JS both bypass parallax for reduced motion; native scrolling is retained.
- `npm test -- --maxWorkers=2`: 52 files / 309 tests passed. The initial high-concurrency run while compiling timed out in 14 existing property tests; no assertions failed in the successful bounded-worker rerun.
- New SVG and PNG favicon, 192/512 app icons, 180px Apple touch icon, 1200x630 PNG/SVG fallback and generated `/opengraph-image` endpoint were inspected. Raster dimensions and manifest asset references were verified. The OG endpoint returned HTTP 200 and rendered with the bundled OFL-licensed Space Grotesk bold font.
- All 25 baseline MDX hashes still match. Public PR evidence is newly captured data, not altered portfolio prose.
- Final production scroll checks confirmed section `work` becomes active after its anchor settles, heading spaces remain intact, and all four homepage highlights render. The full feed showed 19 rows / four repositories even when anonymous GitHub rate limiting occurred during repeated validation.
- Snapshot startup reuse now honors the six-hour freshness window; invalid/future/expired dates do not qualify. Page ISR retries every five minutes after failures, while successful data keeps its six-hour cache. Three additional expiry-boundary tests cover this behavior.
- The production image route is statically generated with the bundled font: the optimized build generated 33 pages, including `/opengraph-image`.

- Final freshness/navigation/reveal regression run: 19 focused tests passed, including all three new snapshot freshness tests. Final optimized production build passed TypeScript and generated 33 pages; Home and Open Source revalidate every five minutes.
- Responsive production checks passed at 375px and 768px (no horizontal overflow, desktop rail hidden, mobile menu visible) and 1440px (rail active and header sticky). Word opacity measurements confirmed distinct staggered entry values during the section-heading transition.
- Final served build: `/open-source` renders 19 rows, four repositories, `GitHub snapshot · October 14, 2026`, with neither stale nor unavailable state. Final browser error log was empty. The existing preview tab was refreshed at http://127.0.0.1:3001/.
- Follow-up visual evidence: `output/artcraft-revamp/home-motion.jpg`, `section-motion.jpg`, `contributions-restored.jpg`, and `og-image.png`.
