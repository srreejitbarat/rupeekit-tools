import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createTranslator } from './translator';

const hi=createTranslator('hi', {
  'Monthly investment':'मासिक निवेश',
  'Monthly EMI: ZXQ0QXZ':'मासिक EMI: ZXQ0QXZ',
  'Compare ZXQ0QXZ with ZXQ1QXZ.':'ZXQ0QXZ की तुलना ZXQ1QXZ से करें।',
  'Annual income':'वार्षिक आय',
  'Tax calculator':'कर कैलकुलेटर',
  'Value, INR':'राशि, INR',
});
describe('translation at the presentation boundary',()=>{
 it('preserves numeric values, field keys and elements',()=>{
  expect(hi.node(125000)).toBe(125000);
  expect(hi.node('monthly_investment')).toBe('monthly_investment');
  expect(hi.node('Monthly investment')).toBe('मासिक निवेश');
  const field=<input name="monthly_investment" defaultValue={125000}/>;
  expect(hi.node(field)).toBe(field);
 });
 it('interpolates changed results without translating or rounding their numbers',()=>{
  expect(hi.text('Monthly EMI: ₹18,642.57')).toBe('मासिक EMI: ₹18,642.57');
  expect(hi.text('Monthly EMI: ₹6,42,189.10')).toBe('मासिक EMI: ₹6,42,189.10');
 });
 it('retains markup and permits natural word order around placeholders',()=>{
  const html=renderToStaticMarkup(<p>{hi.rich('Compare ZXQ0QXZ with ZXQ1QXZ.',<strong key="a">₹100</strong>,<em key="b">₹200</em>)}</p>);
  expect(html).toBe('<p><strong>₹100</strong> की तुलना <em>₹200</em> से करें।</p>');
 });
 it('localizes text and links in structured data while retaining identifiers and dates',()=>{
  const raw={name:'Tax calculator',inLanguage:'en-IN',url:'https://www.rupeekit.co.in/tools/sip-calculator-india',dateModified:'2026-09-24',identifier:'Annual income'};
  const out=JSON.parse(hi.jsonLd({__html:JSON.stringify(raw)}).__html);
  expect(out).toEqual({...raw,name:'कर कैलकुलेटर',inLanguage:'hi-IN',url:'https://www.rupeekit.co.in/hi/tools/sip-calculator-india'});
 });
 it('creates self canonicals with reciprocal language links',()=>{
  const out=hi.metadata({title:'Tax calculator',alternates:{canonical:'https://www.rupeekit.co.in/tools/sip-calculator-india'}});
  expect(out.title).toBe('कर कैलकुलेटर');
  expect(out.alternates?.canonical).toBe('https://www.rupeekit.co.in/hi/tools/sip-calculator-india');
  expect(out.alternates?.languages?.['bn-IN']).toBe('https://www.rupeekit.co.in/bn/tools/sip-calculator-india');
 });
 it('preserves CSV columns, escaped quotes and numbers',()=>{
  expect(hi.csv('"Annual income","Value, INR"\n"125000","18,642.57"')).toBe('"वार्षिक आय","राशि, INR"\r\n"125000","18,642.57"');
 });
 it('retains query strings, fragments and external official-source links',()=>{
  expect(hi.href('/tools/sip-calculator-india?rk_amount=7500#results')).toBe('/hi/tools/sip-calculator-india?rk_amount=7500#results');
  expect(hi.href('https://rbi.org.in/')).toBe('https://rbi.org.in/');
 });
});
