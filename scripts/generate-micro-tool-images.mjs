/** Regenerate native SVG-based editorial cards: node scripts/generate-micro-tool-images.mjs
 * Requires sharp in the authoring runtime; not part of the production build. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require('sharp');
const root = process.cwd();
const logo = (await fs.readFile(path.join(root, 'public/brand/rupeekit_logo_horizontal_transparent.png'))).toString('base64');
const cards = [
  { slug: 'no-cost-emi-calculator-india', tag: 'NO-COST EMI / INDIA', title: ['Refund received.', 'EMI still running?'], sub: ['Compare cash, EMI and closure.', 'See the fees behind the offer.'], labels: ['Cash price', 'EMI + fees', 'After a refund'], color: '#63e0c4', icon: 'receipt', alt: 'No-cost EMI decision tool for India comparing cash price, EMI charges and what happens after a merchant refund' },
  { slug: 'freelancer-remittance-fee-calculator-india', tag: 'FREELANCER PAYMENTS / INDIA', title: ['Invoice sent.', 'What reached', 'your bank?'], sub: ['Follow the fees. Compare two quotes.', 'Find the invoice for your INR target.'], labels: ['Foreign fees', 'FX difference', 'Net bank credit'], color: '#b7b8ff', icon: 'transfer', alt: 'Freelancer payment audit for India tracing foreign fees, exchange-rate differences and the net rupees received' },
  { slug: 'company-car-lease-exit-calculator-india', tag: 'COMPANY CAR LEASE / INDIA', title: ['New job.', 'Same car?'], sub: ['Check the buyout, return and', 'approved continuation costs.'], labels: ['Buy out', 'Return car', 'Check reserves'], color: '#f4c277', icon: 'car', alt: 'Company car lease exit planner for India comparing buyout, returning the car and protecting available cash' },
];
const icons = {
  receipt: '<path d="M1032 238h210v250l-21-14-21 14-21-14-21 14-21-14-21 14-21-14-21 14-21-14-21 14V238Z" fill="#fff" stroke="#0d3340" stroke-width="5"/><path d="M1075 292h124M1075 332h94M1075 372h124M1075 426h52" stroke="#0f766e" stroke-width="9" stroke-linecap="round"/><circle cx="1263" cy="441" r="55" fill="#0f766e"/><path d="M1242 440h37m-12-13 13 13-13 13" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>',
  transfer: '<rect x="997" y="251" width="181" height="178" rx="20" fill="#fff" stroke="#0d3340" stroke-width="5"/><path d="M1038 298h96M1038 334h68M1038 370h83" stroke="#6366f1" stroke-width="8" stroke-linecap="round"/><path d="M1130 461h125m-20-20 20 20-20 20" fill="none" stroke="#6366f1" stroke-width="8" stroke-linecap="round"/><path d="m1240 260 71-41 71 41v15h-142ZM1256 292v96m43-96v96m43-96v96m-104 22h153" fill="none" stroke="#0d3340" stroke-width="9" stroke-linejoin="round"/>',
  car: '<path d="m1031 347 39-86h185l47 86m-271 0h-26q-22 0-22 25v62h339v-62q0-25-24-25ZM1087 278l-24 69h204l-36-69" fill="#fff" stroke="#0d3340" stroke-width="6" stroke-linejoin="round"/><circle cx="1042" cy="432" r="29" fill="#0d3340"/><circle cx="1271" cy="432" r="29" fill="#0d3340"/><path d="M1015 380h37m211 0h31" stroke="#b56617" stroke-width="9" stroke-linecap="round"/><path d="M1094 405h118" stroke="#0f766e" stroke-width="8" stroke-linecap="round"/>',
};
for (const c of cards) {
  const lines = c.title.map((t, i) => `<text x="88" y="${293 + i * 90}" font-size="75" font-weight="700" letter-spacing="-2">${t}</text>`).join('');
  const subY = c.title.length === 3 ? 560 : 488;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#0c2633"/><stop offset="1" stop-color="#102f3b"/></linearGradient></defs>
  <rect width="1600" height="900" fill="url(#bg)"/><circle cx="1530" cy="45" r="310" fill="${c.color}" opacity=".06"/>
  <rect x="83" y="59" width="253" height="75" rx="16" fill="#fff"/><image href="data:image/png;base64,${logo}" x="101" y="69" width="217" height="55" preserveAspectRatio="xMidYMid meet"/>
  <g font-family="DejaVu Sans, sans-serif" fill="#f7fbfc"><text x="88" y="201" font-size="21" font-weight="700" letter-spacing="3" fill="${c.color}">${c.tag}</text>${lines}
  ${c.sub.map((t, i) => `<text x="88" y="${subY + i * 44}" font-size="29" fill="#cfdee3">${t}</text>`).join('')}
  <rect x="88" y="708" width="603" height="59" rx="29" fill="${c.color}"/><text x="389" y="746" text-anchor="middle" font-size="21" font-weight="700" fill="#0c2633">YOUR INPUTS · CLEAR COMPARISONS</text>
  <rect x="914" y="171" width="598" height="559" rx="37" fill="#f1f6f5"/>${icons[c.icon]}
  ${c.labels.map((label, i) => `<rect x="949" y="${516 + i * 61}" width="528" height="47" rx="12" fill="${i === 2 ? c.color : '#fff'}"/><circle cx="978" cy="${539 + i * 61}" r="6" fill="#0f766e"/><text x="1003" y="${547 + i * 61}" font-size="23" font-weight="700" fill="#0c2633">${label}</text>`).join('')}
  <path d="M88 808h1424" stroke="#395460"/><text x="88" y="851" font-size="21" fill="#cfdee3">Free calculator · No signup · PDF + CSV</text><text x="1512" y="851" text-anchor="end" font-size="21" fill="#cfdee3">rupeekit.co.in</text></g></svg>`;
  await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(path.join(root, `public/images/discover/${c.slug}.webp`));
}
const file = path.join(root, 'data/discover-images.json');
const manifest = JSON.parse(await fs.readFile(file, 'utf8')).filter(x => !cards.some(c => x.path === `/tools/${c.slug}`));
await fs.writeFile(file, JSON.stringify([...manifest, ...cards.map(c => ({ path: `/tools/${c.slug}`, src: `/images/discover/${c.slug}.webp`, alt: c.alt, width: 1600, height: 900 }))], null, 2) + '\n');
console.log('Created three 1600 × 900 editorial WebP cards and their Discover entries.');
