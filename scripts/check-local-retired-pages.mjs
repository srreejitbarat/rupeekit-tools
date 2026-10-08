import fs from 'node:fs';

const args = process.argv.slice(2);
const retryFailures = args.includes('--retry-failures');
const base = args.find(argument => argument !== '--retry-failures') || 'http://localhost:3000';
const reportPath = 'artifacts/pr-222-runtime-check/results.json';
const retired = JSON.parse(fs.readFileSync('data/retired-pages.json', 'utf8'));
const prefixes = ['', '/hi', '/bn'];
const results = [];
const tasks = Object.entries(retired).flatMap(([source, destination]) => prefixes.map(prefix => ({
  path: prefix + source, destination: prefix + destination, redirect: true,
})));
for (const destination of new Set(Object.values(retired))) {
  for (const prefix of prefixes) tasks.push({ path: prefix + destination, redirect: false });
}
tasks.push({ path: '/sitemap.xml', redirect: false });
const taskKey = task => JSON.stringify([task.path, task.redirect, task.destination ?? null]);
const previousResults = new Map();
if (retryFailures) {
  const previousReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  if (typeof previousReport.base !== 'string' || new URL(previousReport.base).href !== new URL(base).href) {
    throw new Error('Cannot retry results from a different base URL.');
  }
  if (!Array.isArray(previousReport.results)) throw new Error('Previous report must contain a results array.');
  for (const result of previousReport.results) previousResults.set(taskKey(result), result);
}
const pendingTasks = retryFailures
  ? tasks.filter(task => previousResults.get(taskKey(task))?.ok !== true)
  : tasks;
if (retryFailures) console.log(`Retrying ${pendingTasks.length} absent or failed URLs; preserving ${tasks.length - pendingTasks.length} passed results.`);
function recordResult(task, result) {
  const previousAttempt = previousResults.get(taskKey(task));
  results.push({ ...result, ...(retryFailures && previousAttempt?.ok !== true && previousAttempt ? { previousAttempt } : {}) });
}
let cursor = 0;
async function worker() {
  while (cursor < pendingTasks.length) {
    const task = pendingTasks[cursor++];
    try {
      const response = await fetch(new URL(task.path, base), { redirect: 'manual', signal: AbortSignal.timeout(120000) });
      const location = response.headers.get('location');
      let ok = task.redirect
        ? response.status === 301 && location && new URL(location, base).pathname === task.destination
        : response.status === 200;
      const body = await response.text();
      if (task.path === '/sitemap.xml') {
        const paths = [...body.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => new URL(match[1]).pathname);
        const leaks = paths.filter(path => retired[path.replace(/^\/(hi|bn)(?=\/)/, '')]);
        if (leaks.length) { ok = false; task.retiredInSitemap = leaks; }
      }
      recordResult(task, { ...task, status: response.status, location, ok });
      if (!ok) console.error('FAIL', task.path, response.status, location || '');
    } catch (error) {
      recordResult(task, { ...task, ok: false, error: error.message });
      console.error('FAIL', task.path, error.message);
    }
    if (results.length % 60 === 0) console.log(`Checked ${results.length}/${pendingTasks.length} URLs`);
  }
}
await Promise.all(Array.from({ length: 3 }, worker));
const currentResults = new Map(results.map(result => [taskKey(result), result]));
const completeResults = retryFailures
  ? tasks.map(task => currentResults.get(taskKey(task)) ?? previousResults.get(taskKey(task)))
  : results;
fs.mkdirSync('artifacts/pr-222-runtime-check', { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify({ base, checkedAt: new Date().toISOString(), results: completeResults }, null, 2) + '\n');
const failures = completeResults.filter(result => !result.ok);
console.log(`${completeResults.length} URLs checked; ${failures.length} failures.`);
process.exitCode = failures.length ? 1 : 0;
