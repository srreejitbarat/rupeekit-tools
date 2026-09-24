import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import scenarios from '../data/indexable-calculator-scenarios.json';

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('issue #84 shareable calculator results', () => {
  it('keeps arbitrary parameter URLs out of the index', () => {
    const middleware = read('middleware.ts');
    expect(middleware).toContain("X-Robots-Tag', 'noindex, follow'");
    // The matcher may cover additional shareable-scenario surfaces (the 8th CPC
    // hub embeds the same calculator), so assert coverage rather than an exact list.
    expect(middleware).toContain("'/tools/:path*'");
  });

  it('restores and shares calculator inputs through one shared boundary', () => {
    const boundary = read('components/CalculatorAnalyticsBoundary.tsx');
    expect(boundary).toContain("const SHARE_PARAM_PREFIX = 'rk_';");
    expect(boundary).toContain("querySelectorAll<ShareableField>('input, select, textarea')");
    expect(boundary).toContain("trackAnalyticsEvent('result_shared'");
  });

  it('never sends shared query values in page-view analytics', () => {
    const analytics = read('lib/analytics.ts');
    expect(analytics).not.toContain('window.location.search');
    expect(analytics).toContain('result_shared:');
  });

  it('publishes only explicit evidence-backed scenario URLs', () => {
    expect(scenarios.length).toBeGreaterThanOrEqual(2);
    for (const scenario of scenarios) {
      expect(scenario.evidence).toMatch(/Issue #84/i);
      expect(scenario.targetKeyword.length).toBeGreaterThan(10);
      expect(scenario.title.length).toBeLessThanOrEqual(60);
    }
    const sitemap = read('app/sitemap.ts');
    expect(sitemap).toContain('/tools/scenarios/${scenario.slug}');
    expect(sitemap).not.toContain('rk_');
  });
});
