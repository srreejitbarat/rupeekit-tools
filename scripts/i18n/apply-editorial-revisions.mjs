import fs from 'node:fs';
import ts from 'typescript';

const file = 'data/blog-posts.ts';
const revisions = JSON.parse(fs.readFileSync('docs/editorial-rewrites-2026-09-24.json', 'utf8'));
const source = fs.readFileSync(file, 'utf8');
const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
const replacements = [];
const found = new Set();
const catalogs = Object.fromEntries(['hi','bn'].map(lang => [lang, JSON.parse(fs.readFileSync(`lib/i18n/catalogs/${lang}.json`, 'utf8'))]));
function visit(node) {
  if (ts.isObjectLiteralExpression(node)) {
    const property = name => node.properties.find(p => ts.isPropertyAssignment(p) && p.name.getText(tree) === name);
    const slug = property('slug')?.initializer;
    if (slug && ts.isStringLiteral(slug)) {
      for (const revision of revisions.filter(r => r.slug === slug.text)) {
        let value = node;
        for (const part of revision.field.split('.')) {
          value = value && ts.isArrayLiteralExpression(value)
            ? value.elements[Number(part)]
            : value && ts.isObjectLiteralExpression(value)
              ? value.properties.find(p => ts.isPropertyAssignment(p) && p.name.getText(tree) === part)?.initializer
              : undefined;
        }
        if (!value || !ts.isStringLiteral(value)) throw new Error(`Missing string: ${revision.slug}.${revision.field}`);
        found.add(revision.slug + '.' + revision.field);
        replacements.push({start:value.getStart(tree),end:value.end,text:JSON.stringify(revision.en)});
        for (const lang of ['hi','bn']) catalogs[lang][revision.en] = revision[lang];
      }
    }
  }
  ts.forEachChild(node, visit);
}
visit(tree);
if (found.size !== revisions.length) throw new Error('Not every revision matched a source property.');
let updated = source;
for (const r of replacements.sort((a,b)=>b.start-a.start)) updated=updated.slice(0,r.start)+r.text+updated.slice(r.end);
fs.writeFileSync(file, updated);
const fixes = JSON.parse(fs.readFileSync('docs/editorial-catalog-fixes-2026-09-24.json', 'utf8'));
for (const [source, targets] of Object.entries(fixes)) {
  for (const lang of ['hi','bn']) catalogs[lang][source] = targets[lang];
}
for (const lang of ['hi','bn']) fs.writeFileSync(`lib/i18n/catalogs/${lang}.json`,JSON.stringify(catalogs[lang],null,2)+'\n');
console.log(`Applied ${found.size} editorial revisions with Hindi and Bengali equivalents.`);
