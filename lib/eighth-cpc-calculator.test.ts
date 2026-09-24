import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware as indexingMiddleware } from '../middleware';
import { metadata as hubMetadata } from '../app/(en)/8th-pay-commission/page';

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

const hub = read('app/(en)/8th-pay-commission/page.tsx');
const calculator = read('components/calculators/advanced/EighthPayCommissionCalculator.tsx');
const matrix = read('data/eighth-cpc-pay-matrix.ts');
const middleware = read('middleware.ts');

describe('8th CPC hub freshness and indexing', () => {
  it('carries a dated status block near the top of the page', () => {
    expect(hub).toContain('Latest verified update — {STATUS_AS_OF}');
    expect(hub).toContain("const STATUS_AS_OF = '8 September 2026'");
    // The status block must precede the calculator in the document.
    expect(hub.indexOf('id="status"')).toBeLessThan(hub.indexOf('id="calculator"'));
  });

  it('revalidates hourly given the news velocity on this cluster', () => {
    expect(hub).toContain('export const revalidate = 3600;');
  });

  it('keeps dateModified aligned with the review date', () => {
    expect(hub).toContain("const LAST_REVIEWED_ISO = '2026-09-08'");
    expect(hub).toContain('dateModified: LAST_REVIEWED_ISO');
  });

  it('publishes SoftwareApplication and FAQPage schema', () => {
    expect(hub).toContain("'@type': 'SoftwareApplication'");
    expect(hub).toContain("'@type': 'FAQPage'");
  });

  it('canonicalises to the clean URL and noindexes parameterised variants', () => {
    expect(hubMetadata.alternates?.canonical).toBe('https://www.rupeekit.co.in/8th-pay-commission');
    for (const prefix of ['', '/hi', '/bn']) {
      const url='https://www.rupeekit.co.in'+prefix+'/8th-pay-commission';
      expect(indexingMiddleware(new NextRequest(url)).headers.get('X-Robots-Tag')).toBeNull();
      expect(indexingMiddleware(new NextRequest(url+'?rk_salary=75000')).headers.get('X-Robots-Tag')).toBe('noindex, follow');
    }
  });
});

describe('8th CPC hub query fan-out', () => {
  const requiredHeadings = [
    'Is the fitment factor officially announced?',
    '8th CPC fitment factor for government employees',
    'Fitment factor for pensioners',
    'When will the fitment factor be announced?',
    '6th vs 7th vs 8th CPC fitment factor',
  ];

  it.each(requiredHeadings)('answers "%s"', (heading) => {
    expect(hub).toContain(heading);
  });

  it('links out to the pay matrix, pension and DA cluster pages', () => {
    expect(hub).toContain('/8th-pay-commission/level-1');
    expect(hub).toContain('{PENSION_CALCULATOR_URL}');
    expect(hub).toContain('/tools/pension-commutation-calculator-india');
    expect(hub).toContain('/government-salary-updates');
  });
});

describe('scenario-based positioning', () => {
  it('never states a settled 8th CPC fitment factor', () => {
    // Any sentence asserting a decided factor would undo the whole framing.
    expect(hub).not.toMatch(/fitment factor (is|will be|has been set at) \d/i);
    expect(calculator).not.toMatch(/fitment factor (is|will be|has been set at) \d/i);
    expect(hub).toContain('Not announced');
  });

  it('labels the 64% DA preset as unnotified', () => {
    expect(matrix).toContain("label: '60% (notified, w.e.f. 1 Jan 2026)', notified: true");
    expect(matrix).toContain('not notified');
  });

  it('defaults the fitment factor to the most cited projection', () => {
    expect(matrix).toContain('export const DEFAULT_FITMENT_FACTOR = 2.28;');
  });

  it('ships a visible projection disclaimer in the calculator', () => {
    expect(calculator).toContain('All figures are projections based on a multiplier you selected');
    expect(calculator).toContain('has not finalised the fitment factor');
  });
});

describe('calculator inputs and outputs', () => {
  it('offers a serving-employee and pensioner mode', () => {
    expect(calculator).toContain("useState<CalculatorMode>('employee')");
    expect(calculator).toContain('Serving employee');
    expect(calculator).toContain('Pensioner');
  });

  it('exposes every input the scenario needs', () => {
    ['cpc-current-basic', 'cpc-level', 'cpc-city', 'cpc-tpta', 'cpc-scheme', 'cpc-group', 'cpc-fitment-slider', 'cpc-da'].forEach(
      (id) => expect(calculator).toContain(id)
    );
  });

  it('renders the headline card, comparison table and breakdown', () => {
    expect(calculator).toContain('Revised basic pay');
    expect(calculator).toContain('Estimated arrears since');
    expect(calculator).toContain('Your pay under every fitment factor at once');
    expect(calculator).toContain('Component-by-component breakdown');
  });

  it('reserves the results panel height so compute causes no layout shift', () => {
    expect(calculator).toContain('min-h-[420px]');
    expect(calculator).toContain('aria-label="Estimated results"');
  });

  it('encodes shareable state as readable query parameters', () => {
    ['mode', 'basic', 'level', 'city', 'ff', 'da'].forEach((key) =>
      expect(calculator).toContain(`${key}: '${key}'`)
    );
  });

  it('computes client-side with no network call', () => {
    expect(calculator).not.toContain('fetch(');
    expect(calculator).not.toContain('await fetch');
  });

  it('reads URL state in an effect rather than during render', () => {
    // Reading window.location during render would break hydration on a
    // statically generated page and reintroduce layout shift.
    const renderPortion = calculator.slice(calculator.indexOf('return ('));
    expect(renderPortion).not.toContain('window.location.search');
  });
});
