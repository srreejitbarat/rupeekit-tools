import { getLoanValuationRate, hasLiveGoldRate } from './gold-rates';
import type { Tool, ToolInput } from './tools';

/**
 * Calculator inputs whose default is a market rate rather than a user
 * assumption. A hardcoded default here goes stale silently and quietly
 * misprices every result, so these are bound to the live snapshot instead.
 *
 * Keyed by tool slug -> input key.
 */
export const LIVE_RATE_INPUTS: Record<string, string[]> = {
  'gold-loan-calculator-india': ['pricePerGram24k'],
};

function resolveLiveDefault(slug: string, inputKey: string): { value: number; help: string } | null {
  if (slug === 'gold-loan-calculator-india' && inputKey === 'pricePerGram24k') {
    if (!hasLiveGoldRate()) return null;
    const { perGram, basis, sampleDays } = getLoanValuationRate();
    // The input is defined as a 24K price; the tool's own formula scales it by
    // karat. We seed the 24K bullion value and describe the basis honestly.
    const twentyFourK = perGram === null ? null : perGram / 0.916 * 0.999;
    if (twentyFourK === null || !Number.isFinite(twentyFourK)) return null;
    const help =
      basis === 'average'
        ? `Pre-filled from the ${sampleDays}-day average bullion value, the basis RBI-regulated lenders use. Override with your lender's reference rate if you have it.`
        : `Pre-filled from the latest bullion value. A ${sampleDays}-day average is not yet available, so lenders may value your gold slightly differently.`;
    return { value: Math.round(twentyFourK), help };
  }
  return null;
}

/**
 * Replace stale hardcoded market-rate defaults with the live snapshot.
 * When no live rate is available the authored default is kept untouched, so a
 * failed fetch can never blank out a calculator.
 */
export function applyLiveRateDefaults(tool: Tool): Tool {
  const liveKeys = LIVE_RATE_INPUTS[tool.slug];
  if (!liveKeys) return tool;

  let changed = false;
  const inputs: ToolInput[] = tool.inputs.map((input) => {
    if (!liveKeys.includes(input.key)) return input;
    const resolved = resolveLiveDefault(tool.slug, input.key);
    if (!resolved) return input;
    changed = true;
    return { ...input, default: resolved.value, help: resolved.help };
  });

  return changed ? { ...tool, inputs } : tool;
}
