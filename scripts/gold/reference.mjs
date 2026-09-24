/**
 * Independent Indian-market references for the derived rate.
 *
 * Everything else in this pipeline checks INTERNAL consistency: do two spot
 * feeds agree, is the number in range, did it jump. None of that can catch a
 * wrong LEVY assumption, because the levies are applied identically to every
 * feed. The 6% -> 15% import duty error passed every internal guardrail and was
 * 5.08% wrong; only comparison against a real Indian price surfaced it.
 *
 * A reference must therefore be an INDIAN domestic price, since that is what
 * embeds import duty. An international XAU quote in rupees would validate the
 * FX leg and miss the duty leg entirely -- precisely the leg that broke.
 *
 * A reference is a gate, never a source. Its value is never published.
 */

const USER_AGENT = 'RupeeKitGoldRates/1.0 (+https://www.rupeekit.co.in)';
const TIMEOUT_MS = 15_000;

async function getText(url, headers = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'user-agent': USER_AGENT, accept: '*/*', ...headers },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

function requireFinite(value, label) {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value).replace(/,/g, ''));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${label} did not yield a usable number (got ${JSON.stringify(value)})`);
  }
  return parsed;
}

/**
 * MCX gold futures. RETIRED — kept for the record, not in REFERENCE_SOURCES.
 *
 * On paper this was the strongest free reference: MCX contracts are physically
 * deliverable inside India, so the price embeds import duty the way a domestic
 * cash price does. In practice the route is closed. Probed from a GitHub runner
 * on 23 Aug 2026:
 *
 *   market watch POST, honest UA    HTTP 403
 *   market watch POST, browser UA   HTTP 200  -- but the body is MCX's own 404
 *                                                HTML error page, not JSON
 *   market watch GET, honest UA     HTTP 403
 *   bhavcopy page / mcx home, any UA  HTTP 403
 *
 * Two independent blockers. MCX 403s any client that does not present a browser
 * user-agent, which is a deliberate filter rather than an accident; and the page
 * method being targeted returns 404 regardless, so the data was never behind it.
 * Reaching the real bhavcopy needs Selenium against an HTML page that 403s at
 * the domain level anyway.
 *
 * Do not re-enable without re-probing (`node scripts/probe-mcx.mjs`). Getting
 * past the filter would mean spoofing a user-agent to defeat an access control
 * MCX chose to apply, which is not a foundation for a finance pipeline.
 */
export async function referenceFromMcxQuote() {
  const body = await getText('https://www.mcxindia.com/backpage.aspx/GetMarketWatch', {
    'content-type': 'application/json',
    accept: 'application/json',
  });
  const payload = JSON.parse(body);
  const rows = payload?.d ?? payload?.data ?? [];
  const gold = rows.find(
    (row) => String(row?.Symbol ?? row?.symbol ?? '').toUpperCase() === 'GOLD'
  );
  if (!gold) throw new Error('MCX market watch contained no GOLD row');
  const per10g995 = requireFinite(gold.LTP ?? gold.ltp, 'MCX GOLD LTP');
  // Normalise 995 fineness to the 999 basis we publish.
  return {
    source: 'mcx-gold-futures',
    instrument: 'futures',
    per10Gram24K: (per10g995 / 0.995) * 0.999,
    fineness: 995,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Published Indian retail reference. Used strictly as a drift alarm: the value
 * is compared and discarded, never republished, so this is a validation input
 * rather than a redistribution of someone else's rate table.
 */
export async function referenceFromPublishedIndianRate() {
  const html = await getText('https://www.goodreturns.in/gold-rates/');
  // Look for a 10-gram 24K figure in the page's rate table.
  const match =
    html.match(/24K[^₹]{0,400}?₹\s*([\d,]{4,12})/i) ||
    html.match(/₹\s*([\d,]{4,12})[^<]{0,80}?24\s*carat/i);
  if (!match) throw new Error('Could not locate a 24K rate in the published page');
  const value = requireFinite(match[1], 'published 24K rate');
  // Published tables quote either per gram or per 10 grams; normalise by
  // magnitude rather than trusting the label, which varies by page section.
  const per10Gram24K = value < 40_000 && value > 3_000 ? value * 10 : value;
  return {
    source: 'published-indian-retail',
    instrument: 'cash',
    per10Gram24K,
    fetchedAt: new Date().toISOString(),
  };
}

// referenceFromMcxQuote is deliberately absent: see its docblock. The published
// retail page is still viable — it responds, only the parse fails — so it stays.
export const REFERENCE_SOURCES = [referenceFromPublishedIndianRate];

/**
 * Try each reference in order; the first that responds wins. Returns null when
 * none respond -- which is explicitly NOT a failure, see resolveReferenceCheck.
 */
export async function resolveReference(sources = REFERENCE_SOURCES) {
  const errors = [];
  for (const source of sources) {
    try {
      return { reference: await source(), errors };
    } catch (error) {
      errors.push(`${source.name}: ${error.message}`);
    }
  }
  return { reference: null, errors };
}
