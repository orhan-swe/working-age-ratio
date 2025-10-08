/**
 * Utility functions that can be used in both client and server components
 */

/**
 * Convert entity name to URL slug
 */
export function entityToSlug(entity: string): string {
  return entity
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[()]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Minimal slug → OWID Entity map (for special cases)
 */
const SLUG_TO_ENTITY: Record<string, string> = {
  "south-korea": "South Korea",
  sweden: "Sweden",
  japan: "Japan",
  "united-states": "United States",
  "united-kingdom": "United Kingdom",
  europe: "Europe (UN)",
};

export { SLUG_TO_ENTITY };
