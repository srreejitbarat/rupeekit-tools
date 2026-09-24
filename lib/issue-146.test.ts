import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('issue #146 measurement loop', () => {
  const root = process.cwd();
  const script = fs.readFileSync(path.join(root, 'scripts/measurement-export-report.mjs'), 'utf8');
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const snapshot = JSON.parse(
    fs.readFileSync(path.join(root, 'automation/reports/measurement/2026-09-08/summary.json'), 'utf8'),
  );

  it('exposes a rerunnable browser-export measurement command', () => {
    expect(packageJson.scripts['report:measurement']).toBe('node scripts/measurement-export-report.mjs');
    expect(script).toContain("'gsc-chart'");
    expect(script).toContain("'gsc-pages'");
    expect(script).toContain("'ga4-pages'");
  });

  it('uses chart totals instead of reconstructing site totals from page/query exports', () => {
    expect(script).toContain('Headline totals come from Chart.csv');
    expect(script).not.toContain('queryRows.reduce');
  });

  it('fails closed for incomplete measurement windows unless explicitly preserving a partial snapshot', () => {
    expect(script).toContain("args['expected-days'] || 28");
    expect(script).toContain("!args['allow-partial']");
    expect(snapshot.authoritative).toBe(false);
    expect(snapshot.status).toBe('partial');
    expect(snapshot.expectedDays).toBe(28);
  });

  it('does not pretend non-additive or absent GA4 metrics are available', () => {
    expect(script).toContain('Active users and average engagement time are not summed');
    expect(snapshot.ga4.unavailableFromPagesAndScreensExport).toEqual([
      'sessions',
      'engagedSessions',
      'calculatorCompletion',
      'toolCtaClicks',
    ]);
  });
});
