import fs from 'node:fs';
import {catalogProblems} from './catalog-quality.mjs';
import {writeUtf8} from './write-file.mjs';

const dir='artifacts/google-translation/';
const drafts=JSON.parse(fs.readFileSync(dir+'hindi-google-drafts.json','utf8'));
const rows=JSON.parse(fs.readFileSync(dir+'hindi-source-map.json','utf8'));
const sources=JSON.parse(fs.readFileSync('lib/i18n/catalogs/sources.json','utf8'));
const fixes=JSON.parse(fs.readFileSync('docs/hindi-google-review-fixes.json','utf8'));
const catalog=JSON.parse(fs.readFileSync('lib/i18n/catalogs/hi.json','utf8'));
const applied=[];
const skipped=[];

for(const {id,source} of rows){
  // The workbook was prepared before the last extraction pass. Ignore obsolete
  // strings rather than adding keys that no page uses.
  if(!Object.hasOwn(sources,source)){skipped.push(String(id));continue;}
  const target=fixes[String(id)]??drafts[source];
  const problems=catalogProblems(source,target);
  if(problems.length)throw Error(`${id}: ${problems.join(',')}`);
  catalog[source]=target;
  applied.push({id,source,reviewedOverride:Object.hasOwn(fixes,String(id))});
}


writeUtf8('lib/i18n/catalogs/hi.json',JSON.stringify(catalog,null,2)+'\n');
writeUtf8(dir+'hindi-applied.json',JSON.stringify(applied,null,2)+'\n');
writeUtf8(dir+'hindi-obsolete-rows.json',JSON.stringify(skipped,null,2)+'\n');
console.log(`Applied ${applied.length} current Hindi messages (${applied.filter(row=>row.reviewedOverride).length} editorial corrections); ignored ${skipped.length} obsolete workbook rows.`);
