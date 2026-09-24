import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const toolOverrides = JSON.parse(
  fs.readFileSync(path.join(root, 'data/query-variant-tool-overrides-2026-08-18.json'), 'utf8'),
) as Record<string, { contentSections?: { heading: string; body: string }[]; faqs?: { question: string; answer: string }[] }>;
const blogOverrides = JSON.parse(
  fs.readFileSync(path.join(root, 'data/query-variant-blog-overrides-2026-08-18.json'), 'utf8'),
) as Record<string, { sections?: { title: string; paragraphs: string[] }[]; faqs?: { question: string; answer: string }[] }>;

const expectedToolSlugs = [
  'personal-loan-emi-calculator-india',
  '8th-pay-commission-salary-calculator-india',
  'emergency-fund-calculator-india',
  'personal-loan-eligibility-calculator-india',
  'gold-loan-calculator-india',
  'income-tax-calculator-old-vs-new-regime-india',
  'net-worth-calculator-india',
];

const expectedBlogSlugs = [
  'itr-2-ay-2026-27-filing-guide',
  'zerodha-vs-upstox-vs-angel-one-demat-account',
  'new-labour-code-gratuity-rules-india-2026',
];

describe('issue #71 query-variant and PAA coverage', () => {
  it('covers exactly the ten evidence-backed high-impression pages', () => {
    expect(Object.keys(toolOverrides).sort()).toEqual([...expectedToolSlugs].sort());
    expect(Object.keys(blogOverrides).sort()).toEqual([...expectedBlogSlugs].sort());
    expect(expectedToolSlugs.length + expectedBlogSlugs.length).toBe(10);
  });

  it('adds useful sections and at least two visible PAA-style FAQs per touched page', () => {
    for (const slug of expectedToolSlugs) {
      const override = toolOverrides[slug];
      expect(override.contentSections?.length ?? 0, slug).toBeGreaterThanOrEqual(2);
      expect(override.faqs?.length ?? 0, slug).toBeGreaterThanOrEqual(2);
      for (const faq of override.faqs ?? []) {
        expect(faq.question.trim().endsWith('?'), `${slug}: ${faq.question}`).toBe(true);
        expect(faq.answer.trim().length, `${slug}: ${faq.question}`).toBeGreaterThan(40);
      }
    }

    for (const slug of expectedBlogSlugs) {
      const override = blogOverrides[slug];
      expect(override.sections?.length ?? 0, slug).toBeGreaterThanOrEqual(2);
      expect(override.faqs?.length ?? 0, slug).toBeGreaterThanOrEqual(2);
      for (const faq of override.faqs ?? []) {
        expect(faq.question.trim().endsWith('?'), `${slug}: ${faq.question}`).toBe(true);
        expect(faq.answer.trim().length, `${slug}: ${faq.question}`).toBeGreaterThan(40);
      }
    }
  });

  it('covers the personal-loan salary bands, FOIR, phrasing split and lender criteria explicitly', () => {
    const eligibility = toolOverrides['personal-loan-eligibility-calculator-india'];
    const text = JSON.stringify(eligibility).toLowerCase();
    for (const token of ['₹12', '₹13', '₹14', '₹25', '₹40', '₹45', 'foir', 'eligibility check', 'eligibility calculator', 'sbi', 'hdfc', 'icici']) {
      expect(text, token).toContain(token.toLowerCase());
    }
  });

  it('does not create new calculator or guide slugs', () => {
    const files = fs.readdirSync(path.join(root, 'data'));
    expect(files).toContain('query-variant-tool-overrides-2026-08-18.json');
    expect(files).toContain('query-variant-blog-overrides-2026-08-18.json');
    expect(Object.values(toolOverrides).some((value: any) => 'slug' in value || 'targetKeyword' in value)).toBe(false);
    expect(Object.values(blogOverrides).some((value: any) => 'slug' in value || 'targetKeyword' in value)).toBe(false);
  });
});
