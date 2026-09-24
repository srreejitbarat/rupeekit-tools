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
 it('translates Hindi source text on Bengali pages',()=>{
  const bn=createTranslator('bn', {'क्या यह अनुमान है?':'এটি কি একটি অনুমান?'});
  expect(bn.text('क्या यह अनुमान है?')).toBe('এটি কি একটি অনুমান?');
 });
 it('finds an authored title after deterministic SEO shortening',()=>{
  const bn=createTranslator('bn', {'Investment Calculator India: Compare Returns and Costs Over Time':'ভারতে বিনিয়োগের রিটার্ন ও খরচের তুলনা'});
  expect(bn.metadata({title:'Investment Calculator India: Compare Returns and Costs Over'}).title).toBe('ভারতে বিনিয়োগের রিটার্ন ও খরচের তুলনা');
 });
 it('prefers the specific title template over the generic site suffix',()=>{
  const bn=createTranslator('bn', {
   'ZXQ0QXZ | RupeeKit':'ZXQ0QXZ | RupeeKit',
   'ZXQ0QXZ Calculators India | RupeeKit':'ভারতে ZXQ0QXZ ক্যালকুলেটর | RupeeKit',
   'Small Savings':'ছোট সঞ্চয়',
  });
  expect(bn.text('Small Savings Calculators India | RupeeKit')).toBe('ভারতে ছোট সঞ্চয় ক্যালকুলেটর | RupeeKit');
 });
 it('preserves numeric values, field keys and elements',()=>{
  expect(hi.node(125000)).toBe(125000);
  expect(hi.node('monthly_investment')).toBe('monthly_investment');
  expect(hi.node('Monthly investment')).toBe('मासिक निवेश');
  const field=<input name="monthly_investment" defaultValue={125000}/>;
  expect(hi.node(field)).toBe(field);
 });
 it('translates known label lists inside nested summaries without changing numbers or unknown prose',()=>{
  const bn=createTranslator('bn', {
   'Basic pay':'মূল বেতন', 'Allowance':'ভাতা', 'Tax':'কর',
   'Result: ZXQ0QXZ.':'ফল: ZXQ0QXZ।',
   'Summary: ZXQ0QXZ':'সারাংশ: ZXQ0QXZ',
  });
  expect(bn.text('Summary: Result: Basic pay, Allowance, and Tax.')).toBe('সারাংশ: ফল: মূল বেতন, ভাতা এবং কর।');
  expect(bn.text('Result: ₹1,50,000 and ₹20,000.')).toBe('ফল: ₹1,50,000 and ₹20,000।');
  expect(bn.text('Basic pay and an unknown sentence')).toBe('Basic pay and an unknown sentence');
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
