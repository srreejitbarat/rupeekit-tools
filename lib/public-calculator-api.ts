import { Parser } from 'expr-eval';
import { getLiveTools, getToolBySlug, type Tool } from './tools';
import { CalculatorApiError } from './api-error';

export { CalculatorApiError } from './api-error';

const parser = new Parser({
  operators: {
    add: true, concatenate: false, conditional: false, divide: true,
    factorial: false, multiply: true, power: true, remainder: true,
    subtract: true, logical: false, comparison: false, in: false, assignment: false,
  },
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';

// Public machine contracts are an explicit, reviewed pilot. Adding a web calculator must
// not automatically expose it through REST and MCP before its sources and tests are ready.
export const PUBLIC_API_CALCULATOR_SLUGS = [
  'home-loan-swp-stress-test-india',
  'personal-loan-true-apr-calculator-india',
  'invest-vs-prepay-home-loan-calculator-india',
  'loan-foreclosure-net-savings-calculator-india',
  'reduce-emi-vs-tenure-calculator-india',
] as const;

const publicApiSlugs = new Set<string>(PUBLIC_API_CALCULATOR_SLUGS);

export type CalculatorInputs = Record<string, number>;

function publicDefinition(tool: Tool) {
  const defaultInputs = Object.fromEntries(tool.inputs.map((input) => [input.key, input.default]));
  return {
    slug: tool.slug,
    name: tool.name,
    description: tool.shortDescription,
    category: tool.category,
    inputs: tool.inputs.map((input) => ({ ...input, required: false })),
    outputs: tool.outputs.map(({ formula: _formula, ...output }) => output),
    formulaExplanation: tool.formulaExplanation,
    assumptions: tool.assumptions ?? [],
    lastReviewed: tool.lastReviewedIso ?? tool.lastReviewed ?? null,
    calculatorUrl: `${SITE_URL}/tools/${tool.slug}`,
    apiUrl: `${SITE_URL}/api/v1/calculators/${tool.slug}`,
    officialSources: tool.officialSources ?? [],
    exampleRequest: { inputs: defaultInputs },
    responseIncludes: ['inputs', 'outputs', 'methodology', 'assumptions', 'sources', 'disclaimer', 'privacy'],
  };
}

export function listPublicCalculators() {
  return getLiveTools().filter((tool) => publicApiSlugs.has(tool.slug)).map(publicDefinition);
}

export function getPublicCalculator(slug: string) {
  if (!publicApiSlugs.has(slug)) {
    throw new CalculatorApiError(404, 'calculator_not_found', `No public calculator found for slug: ${slug}`);
  }
  const tool = getToolBySlug(slug);
  if (!tool) throw new CalculatorApiError(404, 'calculator_not_found', `No public calculator found for slug: ${slug}`);
  return publicDefinition(tool);
}

export function calculate(slug: string, suppliedInputs: unknown) {
  if (!publicApiSlugs.has(slug)) {
    throw new CalculatorApiError(404, 'calculator_not_found', `No public calculator found for slug: ${slug}`);
  }
  const tool = getToolBySlug(slug);
  if (!tool) throw new CalculatorApiError(404, 'calculator_not_found', `No public calculator found for slug: ${slug}`);
  if (suppliedInputs === null || typeof suppliedInputs !== 'object' || Array.isArray(suppliedInputs)) {
    throw new CalculatorApiError(400, 'invalid_inputs', 'inputs must be a JSON object containing numeric values.');
  }

  const raw = suppliedInputs as Record<string, unknown>;
  const allowed = new Set(tool.inputs.map((input) => input.key));
  const unknown = Object.keys(raw).filter((key) => !allowed.has(key));
  if (unknown.length) throw new CalculatorApiError(400, 'unknown_inputs', `Unknown input keys: ${unknown.join(', ')}`);

  const inputs: CalculatorInputs = {};
  for (const definition of tool.inputs) {
    const value = raw[definition.key] ?? definition.default;
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new CalculatorApiError(400, 'invalid_input_value', `${definition.key} must be a finite number.`);
    }
    if (definition.min !== undefined && value < definition.min) {
      throw new CalculatorApiError(400, 'input_below_minimum', `${definition.key} must be at least ${definition.min}.`);
    }
    if (definition.max !== undefined && value > definition.max) {
      throw new CalculatorApiError(400, 'input_above_maximum', `${definition.key} must be at most ${definition.max}.`);
    }
    inputs[definition.key] = value;
  }

  const context: Record<string, number> = { ...inputs };
  const outputs = tool.outputs.map((output) => {
    let value: number;
    try {
      value = Number(parser.parse(output.formula).evaluate(context));
    } catch {
      throw new CalculatorApiError(422, 'calculation_failed', `Could not calculate ${output.key} with the supplied values.`);
    }
    if (!Number.isFinite(value)) {
      throw new CalculatorApiError(422, 'non_finite_result', `${output.key} is not finite; check inputs that may cause division by zero.`);
    }
    context[output.key] = value;
    return { key: output.key, label: output.label, value, format: output.format, hidden: output.hidden ?? false };
  });

  return {
    schemaVersion: '1.0',
    calculator: { slug: tool.slug, name: tool.name, url: `${SITE_URL}/tools/${tool.slug}` },
    inputs,
    outputs,
    methodology: tool.formulaExplanation,
    example: tool.example,
    quickAnswer: tool.quickAnswer ?? null,
    assumptions: tool.assumptions ?? [],
    lastReviewed: tool.lastReviewedIso ?? tool.lastReviewed ?? null,
    sources: [
      { label: `${tool.name} methodology`, url: `${SITE_URL}/tools/${tool.slug}#source-and-methodology` },
      ...(tool.officialSources ?? []).map((source) => ({ label: source.label, url: source.href })),
    ],
    disclaimer: 'Educational estimate only. This is not personalized financial, tax, legal, loan, or investment advice.',
    privacy: 'Inputs are processed for this request and are not saved by RupeeKit.',
  };
}

export function apiError(error: unknown) {
  if (error instanceof CalculatorApiError) {
    return { status: error.status, body: { error: { code: error.code, message: error.message } } };
  }
  return { status: 500, body: { error: { code: 'internal_error', message: 'Unexpected server error.' } } };
}
