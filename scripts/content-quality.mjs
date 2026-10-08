import fs from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';

// Load the actual composed registry, including overrides and live defaults.
// Keep this loader confined to the audit process; the website does not import it.
const require = createRequire(import.meta.url);
export function liveTools() {
  const previous = require.extensions['.ts'];
  require.extensions['.ts'] = (module, filename) => {
    const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
      fileName: filename,
    });
    module._compile(outputText, filename);
  };
  try { return require('../lib/tools.ts').getLiveTools(); }
  finally {
    if (previous) require.extensions['.ts'] = previous;
    else delete require.extensions['.ts'];
  }
}

export const contentKey = (text) => text.normalize('NFKC').toLocaleLowerCase('en-IN').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
export function duplicateKeys(items, field) {
  const seen = new Set();
  return items.flatMap((item) => {
    const key = contentKey(item[field] ?? '');
    if (seen.has(key)) return [item[field]];
    seen.add(key);
    return [];
  });
}

export function inspectTool(tool) {
  const errors = [];
  const review = [];
  for (const field of ['shortDescription', 'formulaExplanation', 'example']) {
    if (!tool[field]?.trim()) errors.push(`Missing ${field}`);
  }
  if (duplicateKeys(tool.faqs ?? [], 'question').length) errors.push('Repeated FAQ question');
  if (duplicateKeys(tool.contentSections ?? [], 'heading').length) errors.push('Repeated content heading');
  if ((tool.faqs ?? []).some((faq) => !faq.question?.trim() || !faq.answer?.trim())) errors.push('Empty FAQ');
  if ((tool.contentSections ?? []).some((section) => !section.heading?.trim() || !section.body?.trim())) errors.push('Empty content section');
  if ((tool.contentSections ?? []).some((section) => section.body.startsWith('This calculator uses the formula and assumptions described on this page.'))) errors.push('Synthetic methodology filler');
  if (!tool.howToUse?.length) review.push('Check whether input instructions are sufficient in the UI');
  if (!tool.assumptions?.length) review.push('Review rounding, timing, units and model exclusions');
  if (!tool.officialSources?.length) review.push('Check whether external rules need exact primary references; pure arithmetic does not require a regulatory citation');
  if (duplicateKeys(tool.faqs ?? [], 'answer').length) review.push('Review identical FAQ answers and consolidate overlapping questions');
  if (!/\d/.test(tool.example ?? '')) review.push('Worked example has no concrete numbers; reproduce an input and output case rather than describing the calculator');
  review.push('Reproduce the example and inspect zero/boundary inputs', 'Confirm factual accuracy, distinct reader value and relevant next steps', 'Review Hindi and Bengali wording');
  return { errors, review };
}
