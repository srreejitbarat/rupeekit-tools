import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

// RupeeKit's internal readiness checklist, not a Google approval rule.
const queue = JSON.parse(fs.readFileSync('docs/adsense-calculator-review-queue.json', 'utf8'));
const pending = queue.tools.filter(({ ownerReview: review }) => !review.reviewer || !review.date
  || !review.primaryClaimsVerified || !review.exampleReproduced || !review.distinctValueConfirmed || !review.languageReviewComplete);
const freshness = spawnSync(process.execPath, ['scripts/validate-content-freshness.mjs', '--strict'], { stdio: 'inherit' });
if (pending.length || freshness.status !== 0) {
  console.error(`AdSense review checklist remains incomplete: ${pending.length} calculator editorial records need signoff. Also review every other content family, the live site, account settings and consent configuration.`);
  process.exit(1);
}
console.log('Recorded calculator and freshness checks are complete. Confirm the other page families and live/account checks in the repair plan before requesting review; Google decides approval.');
