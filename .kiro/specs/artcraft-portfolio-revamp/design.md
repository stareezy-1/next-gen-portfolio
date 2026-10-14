# Design and implementation

## Visual system

ArtCraft's navigation is a compact edge-to-edge strip of mono labels. Its hero centers a wide bold wordmark among small floating media panels and subtle elliptical lines. Main sections use full-width hairline borders, numerical labels, oversized headings with occasional italic serif contrast, and two-column media grids. The closing invitation and footer repeat the typography and grid.

Translate this into a BINTANG wordmark using the installed Space Grotesk font, neutral charcoal surfaces, warm white type, muted grey metadata and an indigo orbit accent. Preserve existing palette alternatives; the default Aurora palette becomes the studio palette in both light and dark mode. Keep all existing semantic CSS variables so shared controls inherit the new colors.

## Architecture

- Server-rendered home remains responsible for content collection loading and contribution fetching.
- Extract `PortfolioHero` as a server component receiving the existing projects. Its decorative orbit uses existing images and transform-only CSS motion. The original full headline, lead, identity metadata, portrait and award remain present.
- Replace home visual rules; add an explicit studio layer for inner-page surfaces/type without changing content or data services.
- Keep existing containers and long-form reading widths; remove double main landmarks in route wrappers.
- Restyle navigation and footer; improve mobile keyboard handling in the existing navigation client boundary.
- No new production packages, canvas, third-party stock media or reference-site scripts. Existing 404 canvas remains in place.

## Validation mapping

R1: SHA-256 content inventory before/after and source copy comparison.
R2/R3/R6: browser inspection of home, indexes, representative details, contact, about, experience, open-source and 404; desktop and narrow viewport.
R4: existing property suite plus browser search/filter and contact required-field checks without sending email.
R5: keyboard menu checks, semantic main count, reduced-motion CSS, focus visibility.
R7: TypeScript, Vitest and optimized production build.

## Workflow provenance

Applied installed `diegosouzapw-redesign-existing-projects/SKILL.md` (upstream sickn33/antigravity-awesome-skills). Its referenced metadata.json and ORIGIN.md are absent in this installation. No imported files were modified. Existing graphify-out has only cache/memory/reflections and no graph.json, so source files were used directly for authoritative inspection.

## Implementation adjustments from validation

Removed the old global 768px navigation visibility rules: they conflicted with the new 1000px menu breakpoint. Changed body overflow containment from hidden to clip so the sticky header remains attached to the viewport. Removed the manual immutable-cache header for Next.js chunks after it served stale development JavaScript and caused a hydration mismatch; Next.js retains its own production asset caching. ScrollReveal now progressively uses native CSS view timelines, with visible static fallback and reduced-motion support. Project detail uses the same reveal primitive to retain server-visible text.

## Follow-up design

Reference inspection shows a fixed right-side ruler and animated current/upcoming section labels, orbiting media with a parallax exit, a horizontal ticker, and blurred/translating section headlines. Add a small home client controller for requestAnimationFrame-coalesced hero transforms and active-section tracking; keep content server rendered. Progressive IntersectionObserver reveals replace view-timeline-only behavior, with complete cleanup and reduced-motion bypass. Hero motion stops outside the viewport and while the document is hidden.

The local environment lacks GITHUB_PORTFOLIO_TOKEN. Keep optional server GraphQL; add bounded-concurrency public REST search + verified PR/repository detail lookup. Fetch only GitHub API URLs built from validated owner/repository/PR fields. Cache successful snapshots, never cache a failed response as empty. A checked-in public-only snapshot (19 verified contributions at initial check) provides a clearly dated fallback; metadata and counts come from GitHub, not fixtures.

Public branding remains vector/code-native: a single monogram SVG source generates SVG/PNG icons; matching SVG and Next ImageResponse OG layouts use charcoal, warm white, orbital rules and the BINTANG wordmark. No raster image-generation workflow is needed for this established vector identity.
