import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const toolFiles = [
  'data/tools.json','data/growth-tools.json','data/decision-tools-2026.json','data/insurance-tools-2026.json','data/investing-tools-2026.json','data/lifestage-tools-2026.json',
];
const errors=[];
const readText=(p)=>fs.readFile(path.join(ROOT,p),'utf8');
const readJson=async(p)=>JSON.parse(await readText(p));
const assert=(c,m)=>{if(!c)errors.push(m)};
const consolidatedSource=await readText('lib/consolidated-routes.ts');
const section=consolidatedSource.match(/CONSOLIDATED_TOOL_SLUGS\s*=\s*new Set\(\[([\s\S]*?)\]\)/)?.[1]??'';
const consolidated=new Set([...section.matchAll(/['"]([^'"]+)['"]/g)].map(m=>m[1]));
let count=0;
for(const file of toolFiles){const tools=await readJson(file);const live=tools.filter(t=>t.status==='live'&&!consolidated.has(t.slug));assert(live.length>0,`${file} has no live analytics-covered tools`);for(const t of live){assert(t.slug&&t.category,`${file} has invalid analytics source data`);count++;}}
const [calculator,boundary,link,analytics,toolPage]=await Promise.all([
readText('components/Calculator.tsx'),readText('components/CalculatorAnalyticsBoundary.tsx'),readText('components/AnalyticsLink.tsx'),readText('lib/analytics.ts'),readText('app/(en)/tools/[slug]/page.tsx')]);
assert(toolPage.includes('<Calculator tool={tool}'),'Dynamic tool route must render through Calculator');
assert(calculator.includes('<CalculatorAnalyticsBoundary'),'Calculator must use CalculatorAnalyticsBoundary');
assert(boundary.includes("trackAnalyticsEvent('calculator_used'")&&boundary.includes("trackAnalyticsEvent('result_viewed'"),'Boundary must emit calculator events');
for (const eventName of ['calculation_completed','result_panel_viewed','calculator_session_summary','calculator_abandoned']) {
  assert(boundary.includes(`trackAnalyticsEvent('${eventName}'`),`Boundary must emit ${eventName}`);
  assert(analytics.includes(`${eventName}:`),`Analytics event map must type ${eventName}`);
}
assert(boundary.includes('time_to_first_calculation_ms'),'Journey analytics must record time to first calculation');
assert(boundary.includes('recalculations:'),'Journey analytics must record recalculation count');
assert(boundary.includes('IntersectionObserver'),'Journey analytics must observe result-panel visibility');
assert(link.includes("trackAnalyticsEvent('guide_click'")&&link.includes("trackAnalyticsEvent('tool_cta_click'"),'AnalyticsLink must emit click events');
assert(analytics.includes('tool_slug: string')&&analytics.includes('tool_category: string'),'Analytics base must require slug/category');
const forbiddenJourneyParameters=['principal','salary','income','investment','emi','tax','email','pan','aadhaar','bank'];
const journeyTypeSection=analytics.slice(analytics.indexOf('calculation_completed:'),analytics.indexOf('guide_click:'));
for (const forbidden of forbiddenJourneyParameters) {
  assert(!new RegExp(`\\b${forbidden}\\b`, 'i').test(journeyTypeSection),`Journey analytics must not expose user-entered financial/PII field: ${forbidden}`);
}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`Analytics coverage validation passed for ${count} live tool slugs, including issue #82 journey events.`);
