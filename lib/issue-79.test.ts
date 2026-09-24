import { describe, expect, it } from 'vitest';
import relatedOverrides from '../data/issue-79-related-overrides.json';
import { getPrimaryClusterForTool, toolClusters } from '../data/tool-clusters';
import { getLiveTools } from './tools';

describe('issue 79 cluster hubs and discovery links', () => {
  it('defines the required clusters, including freelance business, with unique target keywords', () => {
    expect(toolClusters.map((cluster) => cluster.slug)).toEqual([
      'freelance-business',
      'loans-emi',
      'tax-compliance',
      'investing-markets',
      'insurance-protection',
      'government-pension',
      'life-stage-planning',
      'small-savings',
    ]);

    const keywords = toolClusters.map((cluster) => cluster.targetKeyword.toLowerCase());
    expect(new Set(keywords).size).toBe(keywords.length);

    const toolKeywords = new Set(getLiveTools().map((tool) => tool.targetKeyword.toLowerCase()));
    for (const keyword of keywords) expect(toolKeywords.has(keyword)).toBe(false);
  });

  it('assigns every live calculator to exactly one primary cluster', () => {
    const liveTools = getLiveTools();
    expect(liveTools.length).toBeGreaterThan(0);
    for (const tool of liveTools) {
      const matches = toolClusters.filter((cluster) => cluster.sourceCategories.includes(tool.category));
      expect(matches, `${tool.slug} (${tool.category}) cluster assignment`).toHaveLength(1);
      expect(getPrimaryClusterForTool(tool)?.slug).toBe(matches[0].slug);
    }
  });

  it('gives each named discovery target at least two explicit inbound source tools', () => {
    const targets = [
      'loan-foreclosure-net-savings-calculator-india',
      'personal-loan-true-apr-calculator-india',
      'reduce-emi-vs-tenure-calculator-india',
      'home-affordability-calculator-india',
    ];
    const overrides = relatedOverrides as Record<string, string[]>;

    for (const target of targets) {
      const sources = Object.entries(overrides)
        .filter(([, related]) => related.includes(target))
        .map(([source]) => source);
      expect(sources.length, target).toBeGreaterThanOrEqual(2);
    }
  });

  it('does not introduce dead related-tool overrides', () => {
    const liveSlugs = new Set(getLiveTools().map((tool) => tool.slug));
    for (const [source, targets] of Object.entries(relatedOverrides as Record<string, string[]>)) {
      expect(liveSlugs.has(source), `source ${source}`).toBe(true);
      for (const target of targets) expect(liveSlugs.has(target), `${source} -> ${target}`).toBe(true);
    }
  });
});
