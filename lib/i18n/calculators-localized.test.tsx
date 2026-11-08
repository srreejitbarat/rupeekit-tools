// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Calculator from '@/components/Calculator';
import HindiCalculator from '@/components/localized/hi/Calculator';
import BengaliCalculator from '@/components/localized/bn/Calculator';
import { getLiveTools } from '@/lib/tools';
vi.mock('next/navigation',()=>({usePathname:()=>'/tools',useSearchParams:()=>new URLSearchParams()}));

const localizedDigits = '०१२३४५६७८९০১২৩৪৫৬৭৮৯';

function snapshot(html: string) {
 const doc=new DOMParser().parseFromString(html,'text/html');
 const fields=Array.from(doc.querySelectorAll('input,select,textarea')).map(el=>{
  const input=el as HTMLInputElement;
  return {tag:el.tagName,name:input.name,type:input.type,value:input.value,min:input.min,max:input.max,step:input.step,checked:input.checked,options:el.tagName==='SELECT'?Array.from((el as HTMLSelectElement).options).map(o=>o.value):undefined};
 });
 // Compare formatted outputs, independent of how each translation writes
 // currency amounts in explanatory prose. Individual nodes keep nearby
 // headings and list numbers separate from the result.
 const walker=doc.createTreeWalker(doc.body,NodeFilter.SHOW_TEXT);
 const amounts:string[]=[];
 while(walker.nextNode()) {
  const text = (walker.currentNode.textContent ?? '').trim().replace(/[०-९০-৯]/g, (digit) =>
    String(localizedDigits.indexOf(digit) % 10)
  );
  const amount = text.match(/^(-?)₹\s*(-?\d(?:[\d,]*\d)?(?:\.\d+)?)[.!?]?$/);
  if (amount) amounts.push(`${amount[1]}${amount[2].replaceAll(',', '')}`);
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
 it('compares localized formatted amounts separately from translated prose', () => {
  const english = snapshot('<p>-₹12,345.50</p><p>Use a ceiling of Rs 25,000.</p>');
  const bengali = snapshot('<p>-₹১২,৩৪৫.৫০</p><p>₹২৫,০০০ সীমা ব্যবহার করুন।</p>');
  expect(english.amounts).toEqual(['-12345.50']);
  expect(bengali).toEqual(english);
 });
 for(const tool of getLiveTools()) it(tool.slug,()=>{
  const en=snapshot(renderToStaticMarkup(<Calculator tool={tool}/>));
  expect(snapshot(renderToStaticMarkup(<HindiCalculator tool={tool}/>))).toEqual(en);
  expect(snapshot(renderToStaticMarkup(<BengaliCalculator tool={tool}/>))).toEqual(en);
 });
});
