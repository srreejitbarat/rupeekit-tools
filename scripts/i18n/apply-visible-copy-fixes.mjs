import fs from 'node:fs';
import {catalogProblems} from './catalog-quality.mjs';
import {writeUtf8} from './write-file.mjs';

const sources=JSON.parse(fs.readFileSync('lib/i18n/catalogs/supplemental-sources.json','utf8'));
const fixes={
  hi:JSON.parse(fs.readFileSync('docs/hindi-visible-copy-fixes.json','utf8')),
  bn:JSON.parse(fs.readFileSync('docs/bengali-visible-copy-fixes.json','utf8')),
};

for(const locale of ['hi','bn']){
  const path=`lib/i18n/catalogs/${locale}.json`;
  const catalog=JSON.parse(fs.readFileSync(path,'utf8'));
  for(const source of sources){
    const target=fixes[locale][source]??catalog[source];
    if(!target)throw Error(`${locale}: missing visible-copy translation for ${source}`);
    const problems=catalogProblems(source,target);
    if(problems.length)throw Error(`${locale}: ${problems.join(',')} in ${source}`);
    catalog[source]=target;
  }
  writeUtf8(path,JSON.stringify(catalog,null,2)+'\n');
}
console.log(`Applied and validated ${sources.length} Hindi and Bengali visible-copy supplements.`);
