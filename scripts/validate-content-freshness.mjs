import fs from 'node:fs';
import path from 'node:path';

const registerPath = path.join(process.cwd(), 'data', 'freshness-review-register.json');
const required = [
  'id',
  'pagePattern',
  'fact',
  'primarySource',
  'verificationDate',
  'reviewIntervalDays',
  'reviewTrigger',
  'owner',
];

function fail(message) {
  console.error(`[freshness] ERROR: ${message}`);
  process.exitCode = 1;
}

function parseIsoDate(value, id) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    fail(`${id}: verificationDate must be YYYY-MM-DD, got ${JSON.stringify(value)}`);
    return null;
  }
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    fail(`${id}: invalid verificationDate ${value}`);
    return null;
  }
  return date;
}

if (!fs.existsSync(registerPath)) {
  fail('missing data/freshness-review-register.json');
} else {
  const register = JSON.parse(fs.readFileSync(registerPath, 'utf8'));
  if (!Array.isArray(register.entries) || register.entries.length === 0) {
    fail('review register must contain at least one entry');
  } else {
    const ids = new Set();
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    let warningCount = 0;

    for (const entry of register.entries) {
      for (const key of required) {
        if (entry[key] === undefined || entry[key] === null || entry[key] === '') {
          fail(`${entry.id ?? '<unknown>'}: missing ${key}`);
        }
      }

      if (ids.has(entry.id)) fail(`duplicate register id: ${entry.id}`);
      ids.add(entry.id);

      if (!Number.isInteger(entry.reviewIntervalDays) || entry.reviewIntervalDays < 1) {
        fail(`${entry.id}: reviewIntervalDays must be a positive integer`);
      }

      const verified = parseIsoDate(entry.verificationDate, entry.id);
      if (!verified || !Number.isInteger(entry.reviewIntervalDays) || entry.reviewIntervalDays < 1) continue;

      const ageDays = Math.floor((today.getTime() - verified.getTime()) / 86_400_000);
      if (ageDays > entry.reviewIntervalDays) {
        warningCount += 1;
        console.warn(
          `[freshness] WARNING: ${entry.id} is ${ageDays} days since verification ` +
            `(review interval ${entry.reviewIntervalDays} days). Trigger: ${entry.reviewTrigger}`,
        );
      }
    }

    if (!process.exitCode) {
      console.log(
        `[freshness] Review register valid: ${register.entries.length} time-sensitive page families; ` +
          `${warningCount} currently beyond their review interval.`,
      );
    }
  }
}
