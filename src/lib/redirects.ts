/**
 * Acyclic 301 redirect-map utilities.
 *
 * When a legacy URL is changed rather than preserved, the SEO_Engine emits an
 * HTTP 301 (permanent) redirect from the old path to the new one. A redirect
 * map must be **acyclic** — a cycle would trap a crawler or visitor in an
 * infinite loop — and every redirect chain must terminate at a route the
 * platform actually serves.
 *
 * This module provides:
 *  - {@link buildRedirectMap} to construct `Redirect[]` (all `permanent: true`)
 *    from either an array of pairs or a `source → destination` record;
 *  - {@link hasCycle} to detect any cycle (self-loops and longer loops);
 *  - {@link validateRedirectMap} to verify the map is acyclic and that every
 *    redirect's terminal target is a served route.
 *
 * @see Requirements 17.3
 */

import type { Redirect } from "@/types";

/** Source→destination pairs accepted by {@link buildRedirectMap}. */
export type RedirectPairs =
  | Array<{ source: string; destination: string }>
  | Record<string, string>;

/** The successful or failed outcome of {@link validateRedirectMap}. */
export type RedirectValidation = { ok: true } | { ok: false; error: string };

/**
 * Builds a `Redirect[]` from source→destination pairs.
 *
 * Accepts either an array of `{ source, destination }` objects or a plain
 * `Record<string, string>` mapping each source path to its destination. Every
 * produced redirect is permanent (HTTP 301).
 *
 * @param pairs - The source→destination pairs to convert.
 * @returns A list of permanent redirects, one per input pair.
 *
 * @example
 * buildRedirectMap({ "/old": "/new" });
 * // → [{ source: "/old", destination: "/new", permanent: true }]
 */
export function buildRedirectMap(pairs: RedirectPairs): Redirect[] {
  const entries: Array<{ source: string; destination: string }> = Array.isArray(
    pairs,
  )
    ? pairs
    : Object.entries(pairs).map(([source, destination]) => ({
        source,
        destination,
      }));

  return entries.map(({ source, destination }) => ({
    source,
    destination,
    permanent: true,
  }));
}

/** DFS node colors for three-color cycle detection. */
type Color = "white" | "gray" | "black";

/**
 * Finds a cycle in the redirect graph, if one exists.
 *
 * Treats each redirect as a directed edge `source → destination` and runs a
 * depth-first search with three-color marking. When the search reaches a node
 * currently on the recursion stack (gray), the path back to that node is a
 * cycle. Self-loops (`source === destination`) are detected as a two-node path.
 *
 * @param redirects - The redirect map to inspect.
 * @returns The ordered list of nodes forming a cycle (closing back on the first
 *   node), or `null` when the graph is acyclic.
 */
function findCyclePath(redirects: Redirect[]): string[] | null {
  const adjacency = new Map<string, string[]>();
  const nodes = new Set<string>();

  for (const { source, destination } of redirects) {
    const existing = adjacency.get(source);
    if (existing) {
      existing.push(destination);
    } else {
      adjacency.set(source, [destination]);
    }
    nodes.add(source);
    nodes.add(destination);
  }

  const color = new Map<string, Color>();
  const stack: string[] = [];
  let cycle: string[] | null = null;

  const visit = (node: string): boolean => {
    color.set(node, "gray");
    stack.push(node);

    const neighbors = adjacency.get(node) ?? [];
    for (const next of neighbors) {
      const state: Color = color.get(next) ?? "white";
      if (state === "gray") {
        // `next` is on the current stack: reconstruct the cycle.
        const startIndex = stack.indexOf(next);
        cycle = stack.slice(startIndex).concat(next);
        return true;
      }
      if (state === "white" && visit(next)) {
        return true;
      }
    }

    stack.pop();
    color.set(node, "black");
    return false;
  };

  for (const node of nodes) {
    if ((color.get(node) ?? "white") === "white" && visit(node)) {
      return cycle;
    }
  }

  return null;
}

/**
 * Reports whether the redirect map contains any cycle.
 *
 * A cycle is any directed loop in the `source → destination` graph, including a
 * self-loop (a redirect whose source equals its destination) and longer loops
 * (`a → b → a`, `a → b → c → a`, …).
 *
 * @param redirects - The redirect map to inspect.
 * @returns `true` when at least one cycle exists, otherwise `false`.
 */
export function hasCycle(redirects: Redirect[]): boolean {
  return findCyclePath(redirects) !== null;
}

/**
 * Validates that a redirect map is acyclic and lands every chain on a served
 * route.
 *
 * The map is rejected when:
 *  - **(a)** a cycle exists — the error names the cycle path; or
 *  - **(b)** a redirect's terminal target is not in `servedRoutes`. The
 *    terminal target is found by following the chain of redirects from a
 *    redirect's destination through any further redirects whose source matches,
 *    until reaching a path that is not itself a redirect source.
 *
 * Chain resolution is guarded against infinite loops so a malformed map can
 * never hang, even though the cycle check runs first.
 *
 * @param redirects - The redirect map to validate.
 * @param servedRoutes - The set of paths the platform actually serves.
 * @returns `{ ok: true }` when valid, otherwise `{ ok: false, error }` with a
 *   descriptive message.
 */
export function validateRedirectMap(
  redirects: Redirect[],
  servedRoutes: Set<string>,
): RedirectValidation {
  const cycle = findCyclePath(redirects);
  if (cycle) {
    return {
      ok: false,
      error: `Redirect map contains a cycle: ${cycle.join(" -> ")}`,
    };
  }

  // Map each source to its immediate destination (first declaration wins).
  const sourceToDestination = new Map<string, string>();
  for (const { source, destination } of redirects) {
    if (!sourceToDestination.has(source)) {
      sourceToDestination.set(source, destination);
    }
  }

  for (const { source, destination } of redirects) {
    let current = destination;
    const seen = new Set<string>([source]);

    // Follow the redirect chain to its terminal (non-source) target. The
    // `seen` guard prevents an infinite loop even if a cycle slipped through.
    for (;;) {
      const next = sourceToDestination.get(current);
      if (next === undefined || seen.has(current)) {
        break;
      }
      seen.add(current);
      current = next;
    }

    if (!servedRoutes.has(current)) {
      return {
        ok: false,
        error: `Redirect "${source}" resolves to "${current}", which is not a served route.`,
      };
    }
  }

  return { ok: true };
}
