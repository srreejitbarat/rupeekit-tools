import fs from 'node:fs';
import path from 'node:path';
import { Parser } from 'expr-eval';

const toolFiles = [
  'tools.json',
  'growth-tools.json',
  'decision-tools-2026.json',
  'insurance-tools-2026.json',
  'investing-tools-2026.json',
  'lifestage-tools-2026.json',
  'policy-tools-2026.json',
];
const readToolFile = (fileName) => JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', fileName), 'utf8'));
const tools = toolFiles.flatMap(readToolFile);
const ctrSeoOverrides = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'data', 'ctr-tool-seo-overrides-2026-08-15.json'), 'utf8')
);

const protectedSeoSlugs = new Set([
  'hra-exemption-calculator-india',
  'personal-loan-emi-calculator-india',
  'emergency-fund-calculator-india',
  'sip-calculator-india',
  'capital-gains-tax-calculator-india',
  '8th-pay-commission-salary-calculator-india',
  'fd-calculator-india',
  'nps-calculator-india',
  'ppf-calculator-india',
  'step-up-sip-calculator-india',
  'cagr-calculator-india',
  'personal-loan-eligibility-calculator-india',
  'income-tax-calculator-old-vs-new-regime-india',
  'net-worth-calculator-india',
  'gold-loan-calculator-india',
  'sukanya-samriddhi-yojana-calculator-india',
  'salary-in-hand-calculator-india',
]);

const ctrFullScopeFiles = [
  'policy-tools-2026.json',
  'decision-tools-2026.json',
  'insurance-tools-2026.json',
  'investing-tools-2026.json',
  'lifestage-tools-2026.json',
];

const parser = new Parser({
  operators: {
    add: true,
    concatenate: false,
    conditional: false,
    divide: true,
    factorial: false,
    multiply: true,
    power: true,
    remainder: true,
    subtract: true,
    logical: false,
    comparison: false,
    in: false,
    assignment: false,
  },
});

const VALID_STATUSES = new Set(['live', 'draft', 'paused']);
const VALID_OUTPUT_FORMATS = new Set(['currency', 'number', 'percent']);

let errors = 0;

function fail(message) {
  errors += 1;
  console.error(`❌ ${message}`);
}

function ensure(condition, message) {
  if (!condition) fail(message);
}

const slugMap = new Map();

for (const [index, tool] of tools.entries()) {
  if (!tool || typeof tool !== 'object') {
    fail(`Tool at index ${index} is not a valid object`);
    continue;
  }

  ensure(typeof tool.slug === 'string' && tool.slug.trim().length > 0, `Tool at index ${index} missing valid slug`);
  if (typeof tool.slug === 'string' && tool.slug.trim().length > 0) {
    if (slugMap.has(tool.slug)) {
      fail(`Duplicate slug: ${tool.slug}`);
    } else {
      slugMap.set(tool.slug, tool);
    }
  }

  ensure(typeof tool.name === 'string' && tool.name.trim().length > 0, `${tool.slug || `tool[${index}]`} missing name`);
  ensure(
    typeof tool.status === 'string' && VALID_STATUSES.has(tool.status),
    `${tool.slug || `tool[${index}]`} has invalid status: ${tool.status}`
  );
}

for (const fileName of ctrFullScopeFiles) {
  for (const tool of readToolFile(fileName)) {
    ensure(Boolean(ctrSeoOverrides[tool.slug]), `${tool.slug} is in ${fileName} but missing the Aug 15 CTR SEO override`);
  }
}
for (const tool of readToolFile('growth-tools.json')) {
  if (!protectedSeoSlugs.has(tool.slug)) {
    ensure(Boolean(ctrSeoOverrides[tool.slug]), `${tool.slug} is an uncovered growth tool missing the Aug 15 CTR SEO override`);
  }
}

for (const [slug, seo] of Object.entries(ctrSeoOverrides)) {
  ensure(slugMap.has(slug), `CTR SEO override references missing tool slug: ${slug}`);
  ensure(seo && typeof seo === 'object', `${slug} CTR SEO override must be an object`);
  if (!seo || typeof seo !== 'object') continue;

  ensure(typeof seo.title === 'string' && seo.title.trim().length > 0, `${slug} CTR SEO title is missing`);
  if (typeof seo.title === 'string') {
    ensure(seo.title.length <= 60, `${slug} CTR SEO title exceeds 60 characters (${seo.title.length})`);
    ensure(!/^free\b/i.test(seo.title.trim()), `${slug} CTR SEO title must not begin with "Free"`);
  }

  ensure(
    typeof seo.description === 'string' && seo.description.trim().length > 0,
    `${slug} CTR SEO description is missing`
  );
  if (typeof seo.description === 'string') {
    ensure(
      seo.description.length >= 140 && seo.description.length <= 160,
      `${slug} CTR SEO description must be 140-160 characters (${seo.description.length})`
    );
  }
}

for (const [index, tool] of tools.entries()) {
  const slugLabel = tool?.slug || `tool[${index}]`;

  if (tool?.status === 'live') {
    ensure(typeof tool.targetKeyword === 'string' && tool.targetKeyword.trim().length > 0, `${slugLabel} missing targetKeyword`);
    ensure(typeof tool.shortDescription === 'string' && tool.shortDescription.trim().length > 0, `${slugLabel} missing shortDescription`);
    ensure(typeof tool.metaDescription === 'string' && tool.metaDescription.trim().length > 0, `${slugLabel} missing metaDescription`);
    if (typeof tool.metaDescription === 'string') {
      ensure(tool.metaDescription.length <= 160, `${slugLabel} metaDescription exceeds 160 characters (${tool.metaDescription.length})`);
    }
    ensure(Array.isArray(tool.faqs) && tool.faqs.length >= 2, `${slugLabel} must have at least 2 FAQs`);
    ensure(Array.isArray(tool.related), `${slugLabel} must include related array`);
  }

  if (tool.related !== undefined) {
    ensure(Array.isArray(tool.related), `${slugLabel} related must be an array`);
    if (Array.isArray(tool.related)) {
      for (const relatedSlug of tool.related) {
        ensure(typeof relatedSlug === 'string' && relatedSlug.trim().length > 0, `${slugLabel} has invalid related slug entry`);
        const relatedTool = slugMap.get(relatedSlug);
        ensure(Boolean(relatedTool), `${slugLabel} references missing related slug: ${relatedSlug}`);
        if (relatedTool) {
          ensure(relatedTool.status === 'live', `${slugLabel} references non-live related slug: ${relatedSlug}`);
        }
      }
    }
  }

  ensure(Array.isArray(tool.inputs) && tool.inputs.length > 0, `${slugLabel} needs inputs`);
  ensure(Array.isArray(tool.outputs) && tool.outputs.length > 0, `${slugLabel} needs outputs`);

  const context = {};
  if (Array.isArray(tool.inputs)) {
    for (const [inputIndex, input] of tool.inputs.entries()) {
      ensure(typeof input?.key === 'string' && input.key.trim().length > 0, `${slugLabel} input[${inputIndex}] missing key`);
      ensure(typeof input?.label === 'string' && input.label.trim().length > 0, `${slugLabel} input[${inputIndex}] missing label`);
      ensure(
        typeof input?.default === 'number' && Number.isFinite(input.default),
        `${slugLabel} input[${inputIndex}] default must be a finite number`
      );

      if (typeof input?.key === 'string' && typeof input?.default === 'number' && Number.isFinite(input.default)) {
        context[input.key] = input.default;
      }
    }
  }

  if (Array.isArray(tool.outputs)) {
    for (const [outputIndex, output] of tool.outputs.entries()) {
      ensure(typeof output?.key === 'string' && output.key.trim().length > 0, `${slugLabel} output[${outputIndex}] missing key`);
      ensure(typeof output?.label === 'string' && output.label.trim().length > 0, `${slugLabel} output[${outputIndex}] missing label`);
      ensure(typeof output?.formula === 'string' && output.formula.trim().length > 0, `${slugLabel} output[${outputIndex}] missing formula`);
      ensure(VALID_OUTPUT_FORMATS.has(output?.format), `${slugLabel}.${output?.key || outputIndex} has invalid format: ${output?.format}`);

      if (!(typeof output?.formula === 'string' && output.formula.trim().length > 0)) {
        continue;
      }

      try {
        const result = parser.parse(output.formula).evaluate(context);
        ensure(Number.isFinite(result), `${slugLabel}.${output.key} formula did not produce a finite number`);
        if (typeof output?.key === 'string' && Number.isFinite(result)) {
          context[output.key] = result;
        }
      } catch (error) {
        fail(`${slugLabel}.${output?.key || outputIndex} formula error: ${error.message}`);
      }
    }
  }
}

if (errors > 0) {
  console.error(`\nValidation failed with ${errors} error(s).`);
  process.exit(1);
}

console.log(`✅ Validated ${tools.length} tool(s).`);
console.log(`✅ Validated ${Object.keys(ctrSeoOverrides).length} CTR SEO title/description override(s).`);
