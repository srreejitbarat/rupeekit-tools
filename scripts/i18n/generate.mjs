/** Generate localized presentation modules from the shared English UI.
 * Calculation code and data remain shared. Generated files are disposable.
 */
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const f=ts.factory;
const humanAttrs=new Set(['title','alt','placeholder','aria-label','aria-description','label','subject']);
const roots=['components','app/(en)'];
const files=[];
function walk(d){for(const n of fs.readdirSync(d)){const p=path.join(d,n);if(p.includes('/localized/')||p.includes('/i18n/')||p.includes('/layout/')||p.endsWith('/layout.tsx')||p.includes('.test.'))continue;if(fs.statSync(p).isDirectory())walk(p);else if(p.endsWith('.tsx'))files.push(p)}}
roots.forEach(walk);
const normalize=s=>s.replace(/\s+/g,' ').trim();
function richParts(children){let source='',values=[];for(const n of children){if(ts.isJsxText(n))source+=n.text.replace(/\s+/g,' ');else if(ts.isJsxExpression(n)&&!n.expression)continue;else{source+=`ZXQ${values.length}QXZ`;values.push(ts.isJsxExpression(n)?n.expression:n)}}return {source:normalize(source),values};}
const generated=new Set(files);
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
 if(!fs.existsSync(catalogFile))fs.writeFileSync(catalogFile,'{}\n');
 fs.writeFileSync(`lib/i18n/${lang}.ts`, `import catalog from './catalogs/${lang}.json';\nimport {createTranslator} from './translator';\nexport const i18n = createTranslator('${lang}', catalog);\n`);
 for(const file of files){
  // Existing native home and directory translations are maintained separately.
  if(file==='app/(en)/page.tsx'||file==='app/(en)/tools/page.tsx')continue;
  const input=fs.readFileSync(file,'utf8');const isPage=file.startsWith('app/');
  const source=ts.createSourceFile(file,input,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const call=(method,arg)=>f.createCallExpression(f.createPropertyAccessExpression(f.createIdentifier('__i18n'),method),undefined,Array.isArray(arg)?arg:[arg]);
  const tr=ts.transform(source,[ctx=>{
   function visit(n){
    if(ts.isStringLiteral(n)&&n.parent&&((ts.isImportDeclaration(n.parent)&&n.parent.moduleSpecifier===n)||(ts.isExportDeclaration(n.parent)&&n.parent.moduleSpecifier===n)||(ts.isCallExpression(n.parent)&&n.parent.expression.kind===ts.SyntaxKind.ImportKeyword))){return f.createStringLiteral(importPath(n.text,file,lang));}
    if(ts.isJsxAttribute(n)&&n.initializer){
     const name=n.name.getText(source);let v=ts.isStringLiteral(n.initializer)?f.createStringLiteral(n.initializer.text):ts.isJsxExpression(n.initializer)?n.initializer.expression:null;
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
      children=[f.createJsxExpression(undefined,call('rich',[f.createStringLiteral(text),...values.map(v=>ts.visitNode(v,visit))]))];
     }else children=n.children.map(child=>ts.isJsxExpression(child)&&child.expression?f.updateJsxExpression(child,call('node',ts.visitNode(child.expression,visit))):ts.visitNode(child,visit));
     return ts.isJsxElement(n)?f.updateJsxElement(n,ts.visitNode(n.openingElement,visit),children,n.closingElement):f.updateJsxFragment(n,n.openingFragment,children,n.closingFragment);
    }
    if(isPage && ts.isVariableDeclaration(n)&&n.name.getText(source)==='metadata'&&n.initializer)return f.updateVariableDeclaration(n,n.name,n.exclamationToken,n.type,call('metadata',ts.visitNode(n.initializer,visit)));
    if(ts.isReturnStatement(n)&&n.expression){let p=n.parent;while(p&&!ts.isFunctionDeclaration(p))p=p.parent;if(p?.name && (p.name.text==='generateMetadata' || /Metadata$/.test(p.name.text) && p.type?.getText(source)==='Metadata'))return f.updateReturnStatement(n,call('metadata',ts.visitNode(n.expression,visit)));}
    if(ts.isCallExpression(n)&&ts.isPropertyAccessExpression(n.expression)&&n.expression.name.text==='toLocaleDateString'&&n.arguments.length){return f.updateCallExpression(n,n.expression,n.typeArguments,[f.createStringLiteral(lang+'-IN-u-nu-latn'),...n.arguments.slice(1)]);}
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
  if(input.includes('@react-pdf/renderer')){
   const family=lang==='hi'?'NotoSansDevanagari':'NotoSansBengali';
   const regular=`RupeeKit-${lang}`,bold=regular+'-Bold';
   output=output.replace(/fontFamily: (["'])([^"']+)\1/g,(_,q,name)=>`fontFamily: '${/bold/i.test(name)?bold:regular}'`);
   output=output.replace(/(import \{i18n as __i18n\}[^\n]+\n)/,`$1import {Font as __LocaleFont} from '@react-pdf/renderer';\nconst __fontRoot=typeof window==='undefined'?process.cwd()+'/public/fonts':'/fonts';\n__LocaleFont.register({family:'${regular}',fonts:[{src:__fontRoot+'/${family}-Regular.ttf',fontWeight:400},{src:__fontRoot+'/${family}-Bold.ttf',fontWeight:700}]});\n__LocaleFont.register({family:'${bold}',src:__fontRoot+'/${family}-Bold.ttf'});\n__LocaleFont.registerHyphenationCallback(word=>[word]);\n`);
  }
  const dest=isPage?`app/(${lang})/${lang}/`+file.slice('app/(en)/'.length):`components/localized/${lang}/`+file.slice('components/'.length);
  fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,output);
 }
}
console.log(`Generated Hindi and Bengali presentation modules for ${files.length} shared sources.`);
