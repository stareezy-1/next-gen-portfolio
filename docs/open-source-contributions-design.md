# Open-source contributions showcase

## Understanding

- Add a dedicated `/open-source` page and a compact homepage section.
- Showcase only merged pull requests authored by `stareezy-1` in public repositories owned by someone else.
- Keep the GitHub credential on the server and never expose it to browser JavaScript.
- Match the existing editorial, cosmic-glass portfolio direction.
- Prefer accepted engineering evidence over contribution streaks or vanity charts.

## Assumptions

- GitHub is the source of truth.
- The public feed may be refreshed every six hours rather than on every request.
- An unavailable token or GitHub response should produce a useful empty state without breaking the rest of the site.
- The current result set fits within GitHub Search's first 100 results; pagination is the documented upgrade path.

## Decision log

1. Use GitHub GraphQL through native server-side `fetch` rather than adding an SDK.
2. Query merged public pull requests, then enforce public and external-owner filters again while normalizing the response.
3. Cache the normalized snapshot for six hours.
4. Share one contribution-ledger component between the homepage preview and the full page.
5. Group the full index by upstream repository and show direct pull-request evidence.
6. Add the route to primary navigation and the sitemap.

## Data flow

1. A React Server Component requests the cached contribution snapshot.
2. The service reads `GITHUB_PORTFOLIO_TOKEN` from the server environment.
3. GitHub GraphQL returns merged pull requests authored by `stareezy-1`.
4. The normalizer rejects private repositories, self-owned repositories, and nodes without a merge date.
5. The page renders repository groups; the homepage renders the newest four accepted contributions.
6. Missing credentials and network/API failures return an unavailable snapshot rather than throwing into the page tree.

## Validation

- Property tests cover privacy, ownership filtering, merge filtering, ordering, and grouping.
- Existing navigation and sitemap properties cover the new primary route.
- Typecheck, the focused tests, the full test suite, and a production build must pass.
