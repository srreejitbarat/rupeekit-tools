/**
 * Single source of truth for RupeeKit's editorial entity and trust-signal URLs.
 *
 * Every YMYL page (calculator, guide, blog post, update) is expected to carry a
 * visible byline plus an `author` that resolves to this entity, and the
 * Organization node in the root layout points at the same policy pages. Keeping
 * both sides in one module stops the visible byline and the JSON-LD from
 * drifting apart.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const EDITORIAL_TEAM_ID = `${SITE_URL}/#editorial-team`;

export const EDITORIAL_POLICY_URL = `${SITE_URL}/editorial-policy`;
export const CORRECTIONS_POLICY_URL = `${SITE_URL}/corrections-policy`;

export const EDITORIAL_TEAM_NAME = 'RupeeKit Editorial Team';

export const EDITORIAL_TEAM_DESCRIPTION =
  'RupeeKit’s in-house personal-finance research desk. Every calculator, guide and update is written and reviewed against primary Indian sources — Income Tax Department, RBI, EPFO, PFRDA, PIB and the relevant Finance Act — before publication.';

/**
 * `author` / `reviewedBy` node used by every article-shaped page.
 *
 * This is an Organization sub-entity, not a Person, because RupeeKit does not
 * currently publish under a named individual. Do not swap in an invented person
 * name: a fabricated credential on a YMYL finance page is worse than an honest
 * organisational byline.
 */
export const editorialTeamEntity = {
  '@type': 'Organization',
  '@id': EDITORIAL_TEAM_ID,
  name: EDITORIAL_TEAM_NAME,
  description: EDITORIAL_TEAM_DESCRIPTION,
  url: EDITORIAL_POLICY_URL,
  parentOrganization: { '@id': ORGANIZATION_ID },
  publishingPrinciples: EDITORIAL_POLICY_URL,
} as const;

/** Shorthand reference for pages that already emit the full node elsewhere. */
export const editorialTeamRef = { '@id': EDITORIAL_TEAM_ID } as const;

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

/** Formats an ISO date for a visible byline. Returns null for unusable input. */
export function formatBylineDate(iso?: string | null): string | null {
  if (!iso) return null;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString('en-IN', DATE_FORMAT);
}
