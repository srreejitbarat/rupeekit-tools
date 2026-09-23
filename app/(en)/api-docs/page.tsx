import type { Metadata } from 'next';
import Link from 'next/link';
import { mcpCalculateExampleText } from '@/lib/api-docs-examples';
import { listPublicCalculators } from '@/lib/public-calculator-api';

export const metadata: Metadata = {
  title: 'RupeeKit Calculator API and MCP Documentation',
  description: 'Documentation for RupeeKit’s sourced pilot finance calculators through JSON API and MCP tools.',
  alternates: { canonical: '/api-docs' },
};

const requestExample = `POST https://www.rupeekit.co.in/api/v1/calculators/personal-loan-true-apr-calculator-india
Content-Type: application/json

{
  "inputs": {
    "principal": 500000,
    "annualInterestRate": 12,
    "tenureMonths": 36,
    "processingFeePercent": 2,
    "gstPercent": 18,
    "insuranceAndOtherUpfront": 5000,
    "advanceEmis": 0
  }
}`;

export default function ApiDocsPage() {
  const calculators = listPublicCalculators();

  return (
    <article className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold text-brandOrange">RupeeKit for AI assistants and developers</p>
      <h1 className="mt-2 text-4xl font-bold text-brandDeepNavy">Calculator API and MCP documentation</h1>
      <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-700">
        Use the {calculators.length}-calculator sourced pilot through one read-only JSON API or MCP endpoint. Calculator inputs, defaults, limits, output names, methodology, assumptions, canonical page, reviewed date, sources, privacy note, and disclaimer are returned in machine-readable form.
      </p>

      <nav className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
        <a className="rounded-full bg-brandDeepNavy px-4 py-2 text-white" href="/api/v1/calculators">Calculator catalog JSON</a>
        <a className="rounded-full border border-brandBorder bg-white px-4 py-2 text-brandDeepNavy" href="/api/openapi">OpenAPI 3.1 JSON</a>
        <a className="rounded-full border border-brandBorder bg-white px-4 py-2 text-brandDeepNavy" href="/.well-known/mcp.json">MCP discovery JSON</a>
      </nav>

      <section className="mt-10 rounded-2xl border border-brandBorder bg-white p-6">
        <h2 className="text-2xl font-bold text-brandDeepNavy">JSON API endpoints</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead><tr className="border-b"><th className="p-3">Method</th><th className="p-3">Endpoint</th><th className="p-3">Purpose</th></tr></thead>
            <tbody className="text-slate-700">
              <tr className="border-b"><td className="p-3 font-bold">GET</td><td className="p-3"><code>/api/v1/calculators</code></td><td className="p-3">List every calculator in the reviewed pilot and its exact input contract.</td></tr>
              <tr className="border-b"><td className="p-3 font-bold">GET</td><td className="p-3"><code>/api/v1/calculators/{'{slug}'}</code></td><td className="p-3">Get one calculator’s inputs, defaults, output fields, methodology and sources.</td></tr>
              <tr><td className="p-3 font-bold">POST</td><td className="p-3"><code>/api/v1/calculators/{'{slug}'}</code></td><td className="p-3">Run the calculator. Send numeric values inside an <code>inputs</code> object.</td></tr>
            </tbody>
          </table>
        </div>
        <h3 className="mt-7 text-lg font-bold text-brandDeepNavy">REST calculation example</h3>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100"><code>{requestExample}</code></pre>
        <p className="mt-4 text-sm leading-6 text-slate-600">Send <code>application/json</code> with a body no larger than 16 KiB. Inputs omitted from the request use documented defaults. Unknown keys, non-numeric values, out-of-range values, malformed JSON, unsupported media types and oversized payloads are rejected with structured errors.</p>
      </section>

      <section className="mt-8 rounded-2xl border border-brandBorder bg-white p-6">
        <h2 className="text-2xl font-bold text-brandDeepNavy">MCP for AI tools</h2>
        <p className="mt-3 text-slate-700">Beta JSON-RPC HTTP endpoint: <code>https://www.rupeekit.co.in/api/mcp</code></p>
        <p className="mt-3 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          Compatibility note: this beta currently advertises MCP protocol version <code>2025-03-26</code>.
          Verification and transport hardening for the current <code>2025-11-25</code> specification are pending,
          so do not treat it as a production-SLA integration yet. Browser requests with a different
          <code> Origin</code> are rejected; non-browser clients should omit that header.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
          <li><code>list_calculators</code> discovers calculators and valid input fields.</li>
          <li><code>get_calculator</code> retrieves the complete contract for one slug.</li>
          <li><code>calculate</code> runs the selected calculator and returns structured results with sources.</li>
        </ul>
        <h3 className="mt-7 text-lg font-bold text-brandDeepNavy">MCP tool-call example</h3>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100"><code>{mcpCalculateExampleText}</code></pre>
        <h3 className="mt-7 text-lg font-bold text-brandDeepNavy">Instructions for AI assistants</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-slate-700">
          <li>Call <code>list_calculators</code> or <code>get_calculator</code> before calculating; never invent an input key.</li>
          <li>Ask the user only for missing values that should not use the documented default.</li>
          <li>Present the returned units and assumptions with the result.</li>
          <li>Cite the returned canonical calculator URL and relevant official sources.</li>
          <li>Preserve the returned disclaimer and never represent an estimate as personalized advice or guaranteed outcome.</li>
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-brandDeepNavy">Available calculators</h2>
        <p className="mt-2 text-slate-600">
          This beta catalog is an explicit sourced pilot. Publishing a calculator on the website does not
          automatically expose it through REST or MCP; machine access is added only after contract and formula review.
        </p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-brandBorder bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead><tr className="border-b bg-slate-50"><th className="p-3">Calculator</th><th className="p-3">Slug</th><th className="p-3">Inputs</th><th className="p-3">API definition</th></tr></thead>
            <tbody>{calculators.map((calculator) => (
              <tr key={calculator.slug} className="border-b last:border-0">
                <td className="p-3"><Link className="font-semibold text-brandDeepNavy underline" href={`/tools/${calculator.slug}`}>{calculator.name}</Link></td>
                <td className="p-3"><code>{calculator.slug}</code></td>
                <td className="p-3 text-slate-600">{calculator.inputs.map((input) => input.key).join(', ')}</td>
                <td className="p-3"><a className="font-semibold text-brandOrange underline" href={`/api/v1/calculators/${calculator.slug}`}>JSON</a></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-2xl bg-amber-50 p-6 text-amber-950">
        <h2 className="text-xl font-bold">Data, privacy and responsible use</h2>
        <p className="mt-2 leading-7">Only calculator inputs are accepted. Do not send PAN, Aadhaar, bank-account details or other sensitive information. Values are processed for the request and are not saved by default. Results are educational estimates—not personalized financial, tax, legal, lending or investment advice.</p>
      </section>
    </article>
  );
}
