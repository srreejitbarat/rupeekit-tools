import fs from 'node:fs';
const sources=JSON.parse(fs.readFileSync('lib/i18n/catalogs/sources.json','utf8'));
let missing=0,invalid=0;
for(const lang of ['hi','bn']){
 const catalog=JSON.parse(fs.readFileSync(`lib/i18n/catalogs/${lang}.json`,'utf8'));
 const absent=Object.keys(sources).filter(s=>!catalog[s]);
 const bad=Object.entries(catalog).filter(([source,target])=>!target||JSON.stringify((source.match(/ZXQ\d+QXZ/g)||[]).sort())!==JSON.stringify((target.match(/ZXQ\d+QXZ/g)||[]).sort()));
 missing+=absent.length;invalid+=bad.length;
 console.log(`${lang}: ${Object.keys(sources).length-absent.length}/${Object.keys(sources).length} source messages translated; ${absent.length} missing; ${bad.length} invalid placeholder sets.`);
}
if(missing||invalid){
 console.error('Translation release blocked. Complete and review both catalogs before publishing localized routes.');
 if(!process.argv.includes('--report'))process.exitCode=1;
}
