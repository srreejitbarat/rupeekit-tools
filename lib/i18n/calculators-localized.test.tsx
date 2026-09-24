// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Calculator from '@/components/Calculator';
import HindiCalculator from '@/components/localized/hi/Calculator';
import BengaliCalculator from '@/components/localized/bn/Calculator';
import { getLiveTools } from '@/lib/tools';
vi.mock('next/navigation',()=>({usePathname:()=>'/tools',useSearchParams:()=>new URLSearchParams()}));
function snapshot(html: string) {
 const doc=new DOMParser().parseFromString(html,'text/html');
 const fields=Array.from(doc.querySelectorAll('input,select,textarea')).map(el=>{
  const input=el as HTMLInputElement;
  return {tag:el.tagName,name:input.name,type:input.type,value:input.value,min:input.min,max:input.max,step:input.step,checked:input.checked,options:el.tagName==='SELECT'?Array.from((el as HTMLSelectElement).options).map(o=>o.value):undefined};
 });
 // Read individual text nodes: textContent joins a result with the next
 // heading/list number, manufacturing amounts that were never displayed.
 const walker=doc.createTreeWalker(doc.body,NodeFilter.SHOW_TEXT);
 const amounts:string[]=[];
 while(walker.nextNode()) {
  const text=walker.currentNode.textContent || '';
  for(const match of text.matchAll(/₹\s*(-?\d(?:[\d,]*\d)?(?:\.\d+)?)/g)) amounts.push(match[1].replaceAll(',',''));
 }
 amounts.sort();
 return {fields,amounts};
}
describe('calculator mechanics across languages',()=>{
 it('does not join results with neighbouring list numbers or punctuation',()=>{
  expect(snapshot('<p>₹10,000.</p><p>3. Next step</p>').amounts).toEqual(['10000']);
  expect(snapshot('<p>₹23,23,391</p><span>1</span>').amounts).toEqual(['2323391']);
  expect(snapshot('<p>₹10,001</p>').amounts).not.toEqual(snapshot('<p>₹10,000</p>').amounts);
 });
 for(const tool of getLiveTools()) it(tool.slug,()=>{
  const en=snapshot(renderToStaticMarkup(<Calculator tool={tool}/>));
  expect(snapshot(renderToStaticMarkup(<HindiCalculator tool={tool}/>))).toEqual(en);
  expect(snapshot(renderToStaticMarkup(<BengaliCalculator tool={tool}/>))).toEqual(en);
 });
});
