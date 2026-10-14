# ArtCraft-inspired portfolio revamp — requirements

Date: 2026-10-14. SDD means spec-driven development. This additive specification supersedes the previous Logbook visual direction, while preserving its content and functionality.

## Reference and scope

Reference: https://getartcraft.com/ (inspected live on 2026-10-14). Adopt its charcoal/white studio aesthetic, monumental centered wordmark, orbiting media, fine borders, numbered editorial sections, large visual grids, mono navigation, serif emphasis, and square calls to action. Use Bintang's identity, copy and existing project imagery; do not import ArtCraft's branding, marketing claims or media.

## Acceptance requirements

- R1 Content: preserve all 25 MDX collection files byte-for-byte, page prose, project links, author details, dates, experience, education, skills, social channels, and contact details. No invented claims. Existing page headings may be visually restyled and existing copy rearranged.
- R2 Coverage: apply the design to Home, About, Experience, Projects, project detail, Open source, Blog, article detail, Contact, and 404, including shared navigation/footer.
- R3 Home: use a centered identity with project imagery arranged around it, a readable original statement, clear work/contact actions, numbered sections, image-forward project grid, existing contribution/experience/toolkit/writing content and closing CTA.
- R4 Behavior: preserve route slugs, metadata, JSON-LD, sitemap, RSS, contact validation/transport, analytics, search and filters, resume links, demos and professional repository restrictions.
- R5 Accessibility: keyboard focus visible; mobile menu supports Escape, focus containment and return; decorative media hidden from assistive technology; respect reduced motion; preserve readable content without JavaScript; only one main landmark per page.
- R6 Responsive: no horizontal overflow at 375, 768 and 1440px. Mobile hero imagery must not overlap text; grids become one column. Existing dark/light/system and palette controls remain functional.
- R7 Delivery: keep the existing Next.js 16/React 19 stack; validate typecheck, existing tests, production build and browser smoke checks; document limitations honestly. Local implementation only, no publishing requested.

## Follow-up requirements (2026-10-14)

- R8 Motion: match the reference's scroll-reactive orbital hero, floating media, moving technology ticker, section-title entrance choreography and persistent section index/ruler. Preserve native wheel/touch/keyboard scrolling and links. Motion must work without CSS view-timeline support; reduced-motion and no-JavaScript modes retain readable static content.
- R9 Contributions: missing local GraphQL credentials must not suppress public contributions. Use GitHub public REST as a fallback, enforce public/external/merged/author constraints, retain real PR statistics and repository metadata, and provide a dated verified snapshot if live refresh fails. Never fabricate counts or label stale data live.
- R10 Public identity: redesign the generated Open Graph image, public OG fallback, SVG/PNG favicon, app icons and manifest colors around the monochrome b/asterisk identity. Keep established image endpoints and correct sizes/MIME types. Provide raster app/touch icons in addition to vectors.
