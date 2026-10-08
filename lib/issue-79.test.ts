import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import relatedOverrides from '../data/issue-79-related-overrides.json';
import retiredPages from '../data/retired-pages.json';
import { getLiveTools } from './tools';

describe('issue 79 discovery links', () => {
  it('retires the cluster hub pages that only repeated calculator cards and FAQs', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'app/(en)/tool-hubs'))).toBe(false);
    expect(Object.keys(retiredPages)).toEqual(expect.arrayContaining(['/tool-hubs', '/tool-hubs/loans-emi']));
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
