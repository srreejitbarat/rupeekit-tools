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
 const amounts=(doc.body.textContent?.match(/₹\s*-?\d[\d,]*(?:\.\d+)?/g)||[]).map(s=>s.replace(/\s/g,'')).sort();
 return {fields,amounts};
}
describe('calculator mechanics across languages',()=>{
 for(const tool of getLiveTools()) it(tool.slug,()=>{
  const en=snapshot(renderToStaticMarkup(<Calculator tool={tool}/>));
  expect(snapshot(renderToStaticMarkup(<HindiCalculator tool={tool}/>))).toEqual(en);
  expect(snapshot(renderToStaticMarkup(<BengaliCalculator tool={tool}/>))).toEqual(en);
 });
});
