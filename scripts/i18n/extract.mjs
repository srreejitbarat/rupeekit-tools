import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { decodeJsxText } from './jsx-text.mjs';
export const ROOTS = ['app/(en)', 'components', 'lib', 'data'];
export const normalize = s => s.replace(/\s+/g, ' ').trim();
export function human(s) {
  const prose=s.replace(/ZXQ\d+QXZ/g,'');
  if (!/[A-Za-z]{2}/.test(prose) || /^\/\S+$/.test(s)) return false;
  if (/^(?:rgba?|hsla?|rotate|translate|scale)\(/.test(s) || /^M[\d .,-]+[a-z]/i.test(s) || /^\[aria-/.test(s)) return false;
  if (/[\u0900-\u09ff]/.test(s) || /^[_$]/.test(s)) return false;
  if (!/[A-Za-z]{2}/.test(s) || /^(https?:|mailto:|tel:|data:|\/?[\w.-]+\/|#|@)/.test(s)) return false;
  if (/^[\w]+(?:[-_:./][\w]+)+$/.test(s) || /^[a-z]+[A-Z][\w]*$/.test(s)) return false;
  if (/^\s*(?:\.|#|@|:root|<svg|<\?xml|function\b|\(function)/.test(s)) return false;
  if (/^window\./.test(s) || /\{\s*isolation:\s*isolate;\s*\}/.test(s)) return false;
  if (/(?:^| )(?:text-|bg-|border-|flex|grid|mt-|px-|dark:|min-h-|rounded-|font-)/.test(s)) return false;
  if (/^(?:application|image|text)\//.test(s) || /\b(?:const|let|return|import)\b.*[;{}]/.test(s)) return false;
  return s.length < 14000;
}
export function sourceFiles() {
 const out=[];
 function walk(d) {for(const n of fs.readdirSync(d)){const p=path.posix.join(d,n);if(p.includes('/localized/')||p.includes('/i18n/')||p.includes('.test.'))continue;if(fs.statSync(p).isDirectory())walk(p);else if(/\.(tsx?|json)$/.test(p))out.push(p)}}
 ROOTS.forEach(walk);return out;
}
export function richParts(children) {
 let source='', values=[];
 for(const n of children) {
  if(ts.isJsxText(n)) source+=decodeJsxText(n.text).replace(/\s+/g,' ');
  else if(ts.isJsxExpression(n)&&!n.expression)continue;
  else if(ts.isJsxExpression(n)&&ts.isStringLiteral(n.expression)&&!n.expression.text.trim())source+=n.expression.text;
  else {source+=`ZXQ${values.length}QXZ`;values.push(n);}
 }
 return {source:normalize(source),values};
}
const entries = new Map();
function add(value,file){const s=normalize(value);if(human(s)){if(!entries.has(s))entries.set(s,new Set());entries.get(s).add(file)}}
for(const file of sourceFiles()) {
 const raw=fs.readFileSync(file,'utf8');
 const machineKeys=new Set(['formula','key','href','slug','src','id','format','type','event','eventName','className']);
 if(file.endsWith('.json')){function rec(v){if(typeof v==='string')add(v,file);else if(Array.isArray(v))v.forEach(rec);else if(v&&typeof v==='object')Object.entries(v).forEach(([k,x])=>{if(!machineKeys.has(k))rec(x)})}rec(JSON.parse(raw));continue;}
 const tree=ts.createSourceFile(file,raw,ts.ScriptTarget.Latest,true);
 function visit(n) {
  if(ts.isJsxAttribute(n)&&['className','style','d','fill','stroke','viewBox','id','href','src','type','name','key','data-testid'].includes(n.name.getText(tree)))return;
  if(ts.isImportDeclaration(n)||ts.isExportDeclaration(n))return;
  if(ts.isPropertyAssignment(n)&&machineKeys.has(n.name.getText(tree).replace(/['"]/g,'')))return;
  if(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n)||ts.isJsxText(n)) add(ts.isJsxText(n)||ts.isJsxAttribute(n.parent)?decodeJsxText(n.text):n.text,file);
  if(ts.isTemplateExpression(n))add(n.head.text+n.templateSpans.map((s,i)=>`ZXQ${i}QXZ`+s.literal.text).join(''),file);
  if(ts.isJsxElement(n)||ts.isJsxFragment(n)){const r=richParts(n.children);if(r.values.length)add(r.source,file)}
  ts.forEachChild(n,visit);
 }
 visit(tree);
}
const out=Object.fromEntries([...entries.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([s,files])=>[s,[...files]]));
fs.writeFileSync('lib/i18n/catalogs/sources.json',JSON.stringify(out,null,2)+'\n');
console.log(`${entries.size} unique messages (${[...entries.keys()].join('').length} characters)`);
