/**
 * Types for the BlogSearch component.
 *
 * @see Requirements 13.2, 13.3
 */

/** Props for the BlogSearch client island. */
export interface BlogSearchProps {
  /** All unique tags across the published post corpus. */
  tags: string[];
  /** All unique categories across the published post corpus. */
  categories: string[];
}
