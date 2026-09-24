import fs from 'node:fs';
import { catalogProblems } from './catalog-quality.mjs';
const sources=JSON.parse(fs.readFileSync('lib/i18n/catalogs/sources.json','utf8'));
const supplemental=JSON.parse(fs.readFileSync('lib/i18n/catalogs/supplemental-sources.json','utf8'));
for(const source of supplemental)sources[source]??=['visible-copy supplement'];
let missing=0,invalid=0;
for(const lang of ['hi','bn']){
 const catalog=JSON.parse(fs.readFileSync(`lib/i18n/catalogs/${lang}.json`,'utf8'));
 const absent=Object.keys(sources).filter(s=>!catalog[s]);
 const bad=Object.entries(catalog).filter(([source,target])=>catalogProblems(source,target).length);
 missing+=absent.length;invalid+=bad.length;
 console.log(`${lang}: ${Object.keys(sources).length-absent.length}/${Object.keys(sources).length} source messages translated; ${absent.length} missing; ${bad.length} invalid entries (placeholders or batch markers).`);
}
if(missing||invalid){
 console.error('Translation release blocked. Complete and review both catalogs before publishing localized routes.');
 if(!process.argv.includes('--report'))process.exitCode=1;
}
