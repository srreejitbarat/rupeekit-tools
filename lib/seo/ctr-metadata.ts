export const SERP_TITLE_MAX = 60;
export const SERP_DESCRIPTION_MIN = 140;
export const SERP_DESCRIPTION_MAX = 160;

function cleanWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function clipAtWord(value: string, maxLength: number) {
  const cleaned = cleanWhitespace(value);
  if (cleaned.length <= maxLength) return cleaned;

  const clipped = cleaned.slice(0, maxLength + 1);
  const lastSpace = clipped.lastIndexOf(' ');
  const candidate = lastSpace >= Math.floor(maxLength * 0.7) ? clipped.slice(0, lastSpace) : clipped.slice(0, maxLength);
  return candidate.replace(/[\s,;:|\-–—]+$/g, '').trim();
}

export function normalizeSerpTitle(value: string) {
  let cleaned = cleanWhitespace(value).replace(/^free\s+/i, '');
  if (cleaned.length <= SERP_TITLE_MAX) return cleaned;

  for (const separator of [' | ', ' — ', ' – ', ': ', ' - ']) {
    const [head] = cleaned.split(separator);
    if (head && head.length >= 28 && head.length <= SERP_TITLE_MAX) {
      return head.trim();
    }
  }

  cleaned = clipAtWord(cleaned, SERP_TITLE_MAX);
  return cleaned;
}

export function normalizeSerpDescription(value: string) {
  // Preserve the complete page-specific summary and its translation lookup key.
  // Search snippets vary by query/device; do not add filler or cut caveats to
  // manufacture a fixed character count.
  return cleanWhitespace(value);
}
