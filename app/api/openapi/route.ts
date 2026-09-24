import { NextResponse } from 'next/server';
import { API_RESPONSE_HEADERS, MAX_API_BODY_BYTES } from '@/lib/api-request';
import { PUBLIC_API_CALCULATOR_SLUGS } from '@/lib/public-calculator-api';

export const dynamic = 'force-static';

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';
  return NextResponse.json({
    openapi: '3.1.0',
    info: { title: 'RupeeKit Calculator API', version: '1.0.0', description: `Beta pilot of ${PUBLIC_API_CALCULATOR_SLUGS.length} sourced, educational India-focused calculator estimates. JSON request bodies are limited to ${MAX_API_BODY_BYTES} bytes.` },
    servers: [{ url: base }],
    paths: {
      '/api/v1/gold-rates': { get: { operationId: 'getGoldRates', summary: 'Current derived Indian gold rate per carat, with the inputs it was derived from and the independent reference it was checked against', responses: { '200': { description: 'Gold rate snapshot, or an explicit unavailable state when no rate has been published' } } } },
      '/api/v1/calculators': { get: { operationId: 'listCalculators', summary: 'List calculators in the reviewed pilot', responses: { '200': { description: 'Calculator catalog' } } } },
      '/api/v1/calculators/{slug}': {
        get: { operationId: 'getCalculator', summary: 'Get calculator definition', parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Definition and sources' }, '404': { description: 'Not found' } } },
        post: { operationId: 'calculate', summary: 'Calculate an estimate', parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['inputs'], additionalProperties: false, properties: { inputs: { type: 'object', additionalProperties: { type: 'number' } } } } } } }, responses: { '200': { description: 'Results with methodology and sources' }, '400': { description: 'Invalid JSON or calculator inputs' }, '404': { description: 'Calculator is not in the public pilot' }, '413': { description: 'Request body exceeds 16 KiB' }, '415': { description: 'Content-Type is not application/json' }, '422': { description: 'Calculation could not produce a finite result' } } },
      },
    },
  }, { headers: API_RESPONSE_HEADERS });
}
