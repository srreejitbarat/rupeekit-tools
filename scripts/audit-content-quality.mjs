import fs from 'node:fs';
import path from 'node:path';
import { liveTools, inspectTool } from './content-quality.mjs';

const tools = liveTools();
const report = {
  scope: 'Composed live calculator registry; literal routes may add their own content. This is a review queue, not an AdSense score or an approval certificate.',
  humanReviewStatus: 'pending',
  toolCount: tools.length,
  tools: tools.map((tool) => ({
    path: `/tools/${tool.slug}`,
    localizedPaths: [`/hi/tools/${tool.slug}`, `/bn/tools/${tool.slug}`],
    category: tool.category,
    recordedSourceReview: tool.factsCheckedIso ?? tool.lastReviewedIso ?? null,
    sourceLinks: tool.officialSources ?? [],
    ...inspectTool(tool),
    ownerReview: { reviewer: null, date: null, primaryClaimsVerified: false, exampleReproduced: false, distinctValueConfirmed: false, languageReviewComplete: false },
  })),
  otherPageFamilies: ['blog', 'guides', 'money-guides', 'financial-updates', 'government-salary-updates', '8th-pay-commission', 'nri', 'resources', 'trust and legal pages'],
  otherPageReview: 'Use the production sitemap and rendered route manifest as the complete URL inventory. Review these families separately; calculator checks do not certify them.',
};
const destination = process.argv[2] ?? 'docs/adsense-calculator-review-queue.json';
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, JSON.stringify(report, null, 2) + '\n');
console.log(`Saved ${tools.length} calculator review records to ${destination}. Human review remains pending.`);
