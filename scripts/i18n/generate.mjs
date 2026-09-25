/** Generate localized presentation modules from the shared English UI.
 * Calculation code and data remain shared. Generated files are disposable.
 */
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import ts from 'typescript';
import { decodeJsxText } from './jsx-text.mjs';
import { writeUtf8 } from './write-file.mjs';
const f=ts.factory;
const humanAttrs=new Set(['title','alt','placeholder','aria-label','aria-description','label','subject']);
const roots=['components','app/(en)'];
const files=[];
function walk(d){for(const n of fs.readdirSync(d)){const p=path.posix.join(d,n);if(p.includes('/localized/')||p.includes('/i18n/')||p.includes('/layout/')||p.endsWith('/layout.tsx')||p.includes('.test.'))continue;if(fs.statSync(p).isDirectory())walk(p);else if(p.endsWith('.tsx'))files.push(p)}}
roots.forEach(walk);
const normalize=s=>s.replace(/\s+/g,' ').trim();
function richParts(children){let source='',values=[];for(const n of children){if(ts.isJsxText(n))source+=decodeJsxText(n.text).replace(/\s+/g,' ');else if(ts.isJsxExpression(n)&&!n.expression)continue;else if(ts.isJsxExpression(n)&&ts.isStringLiteral(n.expression)&&!n.expression.text.trim())source+=n.expression.text;else{source+=`ZXQ${values.length}QXZ`;values.push(ts.isJsxExpression(n)?n.expression:n)}}return {source:normalize(source),values};}
const generated=new Set(files);

// ---- Browser catalog slices ------------------------------------------------
// Browser and SSR bundles never import the full catalogs (package.json
// "imports" serves them only under the react-server condition). Instead each
// localized module that can run in the browser registers the strings of its
// own source file and of the non-localized modules (data, lib) it imports, and
// server components pass translations for client props through __i18n.Scope.
if(!fs.existsSync('lib/i18n/catalogs/sources.json'))execSync('node scripts/i18n/extract.mjs',{stdio:'inherit'});
const keysByFile=new Map();
for(const [key,owners] of Object.entries(JSON.parse(fs.readFileSync('lib/i18n/catalogs/sources.json','utf8'))))for(const owner of owners){if(!keysByFile.has(owner))keysByFile.set(owner,[]);keysByFile.get(owner).push(key)}
// Some catalog keys predate the extractor's current filters (for example
// "SHORT-TERM" looks like an identifier). Keep them with every file that
// contains them verbatim, so browser output matches the full catalog.
{
 const indexed=new Set([...keysByFile.values()].flat());
 const orphans=new Set();
 for(const lang of ['hi','bn'])for(const key of Object.keys(JSON.parse(fs.readFileSync(`lib/i18n/catalogs/${lang}.json`,'utf8'))))if(!indexed.has(key)&&key.length>=3)orphans.add(key);
 const texts=[];
 const scan=dir=>{for(const n of fs.readdirSync(dir)){const p=path.posix.join(dir,n);if(p.includes('/localized/')||p.startsWith('lib/i18n')||p.includes('.test.'))continue;if(fs.statSync(p).isDirectory())scan(p);else if(/\.(tsx?|json)$/.test(p))texts.push([p,fs.readFileSync(p,'utf8')])}};
 ['components','lib','data','app/(en)'].forEach(scan);
 for(const key of orphans){const escaped=JSON.stringify(key).slice(1,-1);for(const [file,text] of texts)if(text.includes(key)||text.includes(escaped)){if(!keysByFile.has(file))keysByFile.set(file,[]);keysByFile.get(file).push(key)}}
}
const clientDirective=/^\s*(['"])use client\1/;
const isClientSource=file=>/\.tsx?$/.test(file)&&clientDirective.test(fs.readFileSync(file,'utf8'));
function resolveSource(spec,from){
 const base=spec.startsWith('@/')?spec.slice(2):spec.startsWith('.')?path.posix.normalize(path.posix.join(path.posix.dirname(from),spec)):null;
 if(!base)return null;
 for(const candidate of [base,base+'.tsx',base+'.ts',base+'.json',base+'/index.tsx',base+'/index.ts'])if(fs.existsSync(candidate)&&fs.statSync(candidate).isFile())return candidate;
 return null;
}
const valueImportCache=new Map();
function valueImports(file){
 if(!/\.tsx?$/.test(file))return [];
 if(!valueImportCache.has(file)){
  // Transpiling drops imports that are only used as types, as the bundler does.
  const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.Preserve,isolatedModules:true}}).outputText;
  const specs=[...js.matchAll(/(?:^|\n)\s*(?:import|export)\s[^;]*?from\s*['"]([^'"]+)['"]|(?:^|\n)\s*import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g)].map(m=>m[1]||m[2]||m[3]);
  valueImportCache.set(file,specs.map(spec=>resolveSource(spec,file)).filter(Boolean));
 }
 return valueImportCache.get(file);
}
function sliceOwners(file){
 const owners=[file],seen=new Set(owners);
 const visit=from=>{for(const dep of valueImports(from)){if(seen.has(dep)||generated.has(dep)||dep.startsWith('lib/i18n/'))continue;seen.add(dep);owners.push(dep);visit(dep)}};
 visit(file);return owners;
}
const catalogs={},writtenSlices=new Set();
function sliceImport(lang,owner){
 const catalog=catalogs[lang]??=JSON.parse(fs.readFileSync(`lib/i18n/catalogs/${lang}.json`,'utf8'));
 const entries=(keysByFile.get(owner)||[]).filter(key=>catalog[key]).map(key=>[key,catalog[key]]);
 if(!entries.length)return null;
 const name=owner.replace(/[^A-Za-z0-9]+/g,'_');
 const out=`lib/i18n/slices/${lang}/${name}.json`;
 if(!writtenSlices.has(out)){writtenSlices.add(out);fs.mkdirSync(path.dirname(out),{recursive:true});writeUtf8(out,JSON.stringify(Object.fromEntries(entries.sort(([a],[b])=>a.localeCompare(b))))+'\n');}
 return '@/'+out;
}
fs.rmSync('lib/i18n/slices',{recursive:true,force:true});
function importPath(spec,file,lang){
 let resolved=spec.startsWith('@/')?spec.slice(2):spec.startsWith('.')?path.posix.normalize(path.posix.join(path.posix.dirname(file),spec)):null;
 if(!resolved)return spec;
 if(resolved.endsWith('.css'))return '@/'+resolved;
 if(!generated.has(resolved+'.tsx'))return spec.startsWith('.')?'@/'+resolved:spec;
 if(resolved.startsWith('components/'))return '@/components/localized/'+lang+'/'+resolved.slice(11);
 if(resolved.startsWith('app/(en)/'))return `@/app/(${lang})/${lang}/`+resolved.slice(9);
 return spec;
}
for(const lang of ['hi','bn']){
 const catalogFile=`lib/i18n/catalogs/${lang}.json`;
 if(!fs.existsSync(catalogFile))writeUtf8(catalogFile,'{}\n');
 // Browser base catalog: reviewed supplements that have no single source file.
 const full=JSON.parse(fs.readFileSync(catalogFile,'utf8'));
 const supplemental=JSON.parse(fs.readFileSync('lib/i18n/catalogs/supplemental-sources.json','utf8'));
 writeUtf8(`lib/i18n/catalogs/client-${lang}.json`,JSON.stringify(Object.fromEntries(supplemental.filter(key=>full[key]).map(key=>[key,full[key]])))+'\n');
 writeUtf8(`lib/i18n/${lang}.ts`, `import catalog from '#i18n-catalog/${lang}';\nimport {createTranslator} from './translator';\nimport {registerTranslator} from './registry';\nimport I18nClientScope from './client-scope';\n\n// Full catalog on the server (react-server condition); a small base in the\n// browser, extended by the slices each localized module registers.\nexport const i18n = createTranslator('${lang}', catalog, I18nClientScope);\nregisterTranslator('${lang}', i18n);\n`);
 for(const file of files){
  // Existing native home and directory translations are maintained separately.
  if(file==='app/(en)/page.tsx'||file==='app/(en)/tools/page.tsx')continue;
  const input=fs.readFileSync(file,'utf8');const isPage=file.startsWith('app/');
  const source=ts.createSourceFile(file,input,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const isClientModule=clientDirective.test(input);
  // Client components rendered from a server module get their props' translations.
  const clientTags=new Set();
  if(!isClientModule)for(const statement of source.statements){
   if(!ts.isImportDeclaration(statement)||!statement.importClause||statement.importClause.isTypeOnly)continue;
   const target=resolveSource(statement.moduleSpecifier.text,file);
   if(!target||!isClientSource(target))continue;
   const clause=statement.importClause;
   if(clause.name)clientTags.add(clause.name.text);
   if(clause.namedBindings&&ts.isNamespaceImport(clause.namedBindings))clientTags.add(clause.namedBindings.name.text);
   if(clause.namedBindings&&ts.isNamedImports(clause.namedBindings))for(const el of clause.namedBindings.elements)if(!el.isTypeOnly)clientTags.add(el.name.text);
  }
  const scoped=new Set();
  const call=(method,arg)=>f.createCallExpression(f.createPropertyAccessExpression(f.createIdentifier('__i18n'),method),undefined,Array.isArray(arg)?arg:[arg]);
  const tr=ts.transform(source,[ctx=>{
   function visit(n){
    if(clientTags.size&&(ts.isJsxElement(n)||ts.isJsxSelfClosingElement(n))&&!scoped.has(n)){
     const opening=ts.isJsxElement(n)?n.openingElement:n;
     if(clientTags.has(opening.tagName.getText(source).split('.')[0])){
      scoped.add(n);
      const inner=visit(n);
      const key=opening.attributes.properties.find(a=>ts.isJsxAttribute(a)&&a.name.getText(source)==='key');
      const tag=f.createPropertyAccessExpression(f.createIdentifier('__i18n'),'Scope');
      return f.createJsxElement(f.createJsxOpeningElement(tag,undefined,f.createJsxAttributes(key?[key]:[])),[inner],f.createJsxClosingElement(tag));
     }
    }
    if(ts.isStringLiteral(n)&&n.parent&&((ts.isImportDeclaration(n.parent)&&n.parent.moduleSpecifier===n)||(ts.isExportDeclaration(n.parent)&&n.parent.moduleSpecifier===n)||(ts.isCallExpression(n.parent)&&n.parent.expression.kind===ts.SyntaxKind.ImportKeyword))){return f.createStringLiteral(importPath(n.text,file,lang));}
    if(ts.isJsxAttribute(n)&&n.initializer){
     const name=n.name.getText(source);let v=ts.isStringLiteral(n.initializer)?f.createStringLiteral(decodeJsxText(n.initializer.text)):ts.isJsxExpression(n.initializer)?n.initializer.expression:null;
     if(v && (humanAttrs.has(name)||name==='href'||name==='dangerouslySetInnerHTML'&&n.parent.parent.tagName.getText(source)==='script')){
      const method=name==='href'?'href':name==='dangerouslySetInnerHTML'?'jsonLd':'node';
      return f.updateJsxAttribute(n,n.name,f.createJsxExpression(undefined,call(method,ts.visitNode(v,visit))));
     }
    }
    if(ts.isJsxElement(n)||ts.isJsxFragment(n)){
     const tag=ts.isJsxElement(n)?n.openingElement.tagName.getText(source):'';
     if(['script','style','code','pre'].includes(tag))return ts.visitEachChild(n,visit,ctx);
     const {source:text,values}=richParts(n.children);
     let children;
     if(text && /[A-Za-z]/.test(text.replace(/ZXQ\d+QXZ/g,''))){
       children=[f.createJsxExpression(undefined,call('rich',[f.createStringLiteral(text),...values.map(v=>v.getText(source)==='entry.commonlyAssociatedWith.toLowerCase()'?call('node',f.createPropertyAccessExpression(f.createIdentifier('entry'),'commonlyAssociatedWith')):ts.visitNode(v,visit))]))];
     }else children=n.children.map(child=>ts.isJsxExpression(child)&&child.expression?f.updateJsxExpression(child,call('node',ts.visitNode(child.expression,visit))):ts.visitNode(child,visit));
     return ts.isJsxElement(n)?f.updateJsxElement(n,ts.visitNode(n.openingElement,visit),children,n.closingElement):f.updateJsxFragment(n,n.openingFragment,children,n.closingFragment);
    }
    if(isPage && ts.isVariableDeclaration(n)&&n.name.getText(source)==='metadata'&&n.initializer)return f.updateVariableDeclaration(n,n.name,n.exclamationToken,n.type,call('metadata',ts.visitNode(n.initializer,visit)));
    if(ts.isReturnStatement(n)&&n.expression){let p=n.parent;while(p&&!ts.isFunctionDeclaration(p))p=p.parent;if(p?.name && (p.name.text==='generateMetadata' || /Metadata$/.test(p.name.text) && p.type?.getText(source)==='Metadata'))return f.updateReturnStatement(n,call('metadata',ts.visitNode(n.expression,visit)));}
    // Deterministic dates: ICU month names differ between Node and browsers.
    if(ts.isCallExpression(n)&&ts.isPropertyAccessExpression(n.expression)&&n.expression.name.text==='toLocaleDateString'&&n.arguments.length){return call('date',[ts.visitNode(n.expression.expression,visit),...n.arguments.slice(1).map(arg=>ts.visitNode(arg,visit))]);}
    if(ts.isJsxAttribute(n)&&n.name.getText(source)==='render'&&n.initializer&&ts.isJsxExpression(n.initializer)&&n.initializer.expression&&ts.isArrowFunction(n.initializer.expression)&&!ts.isBlock(n.initializer.expression.body)){const a=n.initializer.expression;return f.updateJsxAttribute(n,n.name,f.createJsxExpression(undefined,f.updateArrowFunction(a,a.modifiers,a.typeParameters,a.parameters,a.type,a.equalsGreaterThanToken,call('node',a.body))));}
    // Presentation formats only. JSON plan exports retain machine-readable keys.
    if(ts.isNewExpression(n)&&n.expression.getText(source)==='Blob'&&n.arguments?.[0]&&n.arguments?.[1]){
     const options=n.arguments[1].getText(source);const method=options.includes('text/csv')?'csv':options.includes('image/svg+xml')?'svg':null;
     if(method&&ts.isArrayLiteralExpression(n.arguments[0]))return f.updateNewExpression(n,n.expression,n.typeArguments,[f.createArrayLiteralExpression(n.arguments[0].elements.map(v=>call(method,ts.visitNode(v,visit)))),n.arguments[1]]);
    }
    // Pass locale to the server-side report endpoint; no locale enters the engine.
    if(ts.isStringLiteral(n)&&n.text==='/api/pre-emi/report')return f.createStringLiteral(n.text+'?lang='+lang);
    return ts.visitEachChild(n,visit,ctx);
   }
   return root=>ts.visitNode(root,visit);
  }]);
  let output=ts.createPrinter({newLine:ts.NewLineKind.LineFeed}).printFile(tr.transformed[0]);tr.dispose();
  // Keep the client directive first.
  const directive=/^(['"])use client\1;\s*/;
  const prefix=output.match(directive)?.[0]||'';output=output.replace(directive,'');
  output=prefix+`// Generated by scripts/i18n/generate.mjs. Edit the shared source or catalog.\nimport {i18n as __i18n} from '@/lib/i18n/${lang}';\n`+output;
  // Modules that can run in the browser carry their own strings.
  if(!isPage||isClientModule){
   const slices=sliceOwners(file).map(owner=>sliceImport(lang,owner)).filter(Boolean);
   if(slices.length)output+=`\n${slices.map((slice,i)=>`import __slice${i} from '${slice}';`).join('\n')}\n__i18n.add(Object.assign({}, ${slices.map((_,i)=>`__slice${i}`).join(', ')}));\n`;
  }
  if(input.includes('@react-pdf/renderer')){
   const family=lang==='hi'?'NotoSansDevanagari':'NotoSansBengali';
   const regular=`RupeeKit-${lang}`,bold=regular+'-Bold';
   output=output.replace(/fontFamily: (["'])([^"']+)\1/g,(_,q,name)=>`fontFamily: '${/bold/i.test(name)?bold:regular}'`);
   output=output.replace(/(import \{i18n as __i18n\}[^\n]+\n)/,`$1import {Font as __LocaleFont} from '@react-pdf/renderer';\nconst __fontRoot=typeof window==='undefined'?process.cwd()+'/public/fonts':'/fonts';\n__LocaleFont.register({family:'${regular}',fonts:[{src:__fontRoot+'/${family}-Regular.ttf',fontWeight:400},{src:__fontRoot+'/${family}-Bold.ttf',fontWeight:700}]});\n__LocaleFont.register({family:'${bold}',src:__fontRoot+'/${family}-Bold.ttf'});\n__LocaleFont.registerHyphenationCallback(word=>[word]);\n`);
  }
  const dest=isPage?`app/(${lang})/${lang}/`+file.slice('app/(en)/'.length):`components/localized/${lang}/`+file.slice('components/'.length);
  fs.mkdirSync(path.dirname(dest),{recursive:true});writeUtf8(dest,output);
 }
}
console.log(`Generated Hindi and Bengali presentation modules for ${files.length} shared sources.`);
