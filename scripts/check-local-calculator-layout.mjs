import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const directoryResponse = await fetch(`${baseUrl}/tools`);
if (!directoryResponse.ok) throw new Error(`Calculator directory returned ${directoryResponse.status}`);
const directory = new JSDOM(await directoryResponse.text());
const slugs = [...new Set([...directory.window.document.querySelectorAll('a[href^="/tools/"]')]
  .map(link => link.getAttribute('href').split('/')[2]).filter(Boolean))];
directory.window.close();
if (!slugs.length) throw new Error('No calculators found in the directory');

const queue = ['', '/hi', '/bn'].flatMap(locale => slugs.map(slug => `${locale}/tools/${slug}`));
const results = [];
let next = 0;
await Promise.all(Array.from({ length: 3 }, async () => {
  while (next < queue.length) {
    const route = queue[next++];
    let dom;
    try {
      const response = await fetch(`${baseUrl}${route}`, { signal: AbortSignal.timeout(120000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      dom = new JSDOM(await response.text());
      const document = dom.window.document;
      const main = document.querySelector('main');
      const calculator = main?.querySelector('#calculator, #pre-emi-planner');
      const guide = main?.querySelector('details.tool-guide');
      if (main?.querySelectorAll('h1').length !== 1) throw new Error('Expected one page title');
      if (!calculator) throw new Error('Missing primary calculator');
      if (!guide || guide.open) throw new Error('Expected a closed supporting guide');
      if (!(calculator.compareDocumentPosition(guide) & 4)) throw new Error('Guide precedes calculator');
      const precedingImage = [...main.querySelectorAll('img')].some(image =>
        image.compareDocumentPosition(calculator) & 4);
      if (precedingImage) throw new Error('Promotional image precedes calculator');
      // The tax app intentionally hydrates its saved/year-specific inputs on the client.
      const clientTaxApp = route.endsWith('/income-tax-calculator-old-vs-new-regime-india');
      if (!clientTaxApp && !calculator.querySelector('input, select')) throw new Error('Missing calculator inputs');
      results.push({ route, ok: true, clientTaxApp });
    } catch (error) {
      results.push({ route, ok: false, error: error.message });
    } finally {
      dom?.window.close();
    }
  }
}));

const failed = results.filter(result => !result.ok);
fs.mkdirSync('output/layout-check', { recursive: true });
fs.writeFileSync('output/layout-check/calculator-layout.json', JSON.stringify(results, null, 2));
console.log(`${results.length - failed.length}/${results.length} calculator layouts passed across English, Hindi and Bengali (${slugs.length} tools).`);
for (const result of failed) console.error(`${result.route}: ${result.error}`);
if (failed.length) process.exitCode = 1;
