import { cloneElement, createElement, isValidElement, type ComponentType, type ReactElement, type ReactNode } from 'react';
import type { Metadata } from 'next';
import { languageAlternates, localizedHref, LOCALE_TAGS, type Locale } from './routing';
import { normalizeSerpTitle } from '../seo/ctr-metadata';

type Catalog = Record<string, string>;
const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Pure presentation adapter. Never changes field values, formula variables,
 * URL slugs, arithmetic, data keys, analytics parameters or API contracts. */
// Month names are fixed here: Node and browsers ship different ICU data (for
// example "জানুয়ারি" vs "জানুয়ারী"), and any difference breaks hydration.
const MONTHS: Record<'hi' | 'bn', string[]> = {
  hi: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'],
  bn: ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'],
};
const IST_OFFSET_MS = 330 * 60 * 1000;

type ClientScope = ComponentType<{ locale: Locale; dict: Catalog; children?: ReactNode }>;

export function createTranslator(locale: Locale, initialCatalog: Catalog, clientScope?: ClientScope) {
  // Browser and SSR bundles start small and grow through add(): each localized
  // module registers the slice of strings it can render, and server components
  // pass translations for the props they hand to client components.
  const catalog: Catalog = { ...initialCatalog };
  const translatedValues = new Set(Object.values(catalog).map(normalize));
  let patterns = buildPatterns();
  function buildPatterns() { return Object.entries(catalog).filter(([s]) => /ZXQ\d+QXZ/.test(s)).map(([source, target]) => ({
    source, target,
    prefix: source.split(/ZXQ\d+QXZ/)[0],
    literals: source.split(/ZXQ\d+QXZ/).filter(part => part.trim()),
    ids: [...source.matchAll(/ZXQ(\d+)QXZ/g)].map(m => Number(m[1])),
    regex: new RegExp('^' + source.split(/ZXQ\d+QXZ/).map(escape).join('(.+?)') + '$'),
  })).filter(p => p.source.replace(/ZXQ\d+QXZ/g, '').length >= 4).sort((a,b) => b.prefix.length-a.prefix.length || b.source.replace(/ZXQ\d+QXZ/g,'').length-a.source.replace(/ZXQ\d+QXZ/g,'').length); }
  const memo = new Map<string, string>();
  function add(entries: Catalog) {
    let added = false, templates = false;
    for (const [source, target] of Object.entries(entries)) {
      if (catalog[source] === target) continue;
      catalog[source] = target; translatedValues.add(normalize(target)); added = true;
      if (/ZXQ\d+QXZ/.test(source)) templates = true;
    }
    if (!added) return;
    memo.clear();
    if (templates) patterns = buildPatterns();
  }
  /** Server side: the translations a client component needs for its props. */
  function collect(value: unknown, dict: Catalog = {}, seen = new WeakSet<object>()): Catalog {
    if (typeof value === 'string') {
      if (value.length < 14000 && /[A-Za-z]/.test(value)) {
        const translated = text(value);
        if (translated !== value) dict[normalize(value)] = normalize(translated);
      }
      return dict;
    }
    if (!value || typeof value !== 'object' || isValidElement(value) || seen.has(value)) return dict;
    seen.add(value);
    for (const item of Array.isArray(value) ? value : Object.values(value)) collect(item, dict, seen);
    return dict;
  }
  /** Wraps a client component rendered by a server component. */
  function Scope({ children }: { children: ReactNode }): ReactNode {
    if (locale === 'en' || !clientScope || !isValidElement(children)) return children;
    return createElement(clientScope, { locale, dict: collect((children as ReactElement).props) }, children);
  }
  function text(value: string): string {
    if (locale === 'en') return value;
    const source = normalize(value);
    const exact = catalog[source];
    if (exact) return value.match(/^\s*/)?.[0] + exact + (value.match(/\s*$/)?.[0] || '');
    if (translatedValues.has(source)) return value;
    if (!/[A-Za-z\u0900-\u09ff]/.test(value)) return value;
    if (memo.has(value)) return memo.get(value)!;
    // Calculator summaries join known input/output labels before they reach
    // the presentation boundary. Only split a list if every item is known;
    // arbitrary prose and comma-separated amounts must remain untouched.
    const labels = source.split(/,\s+(?:and\s+)?|\s+and\s+/);
    if (labels.length > 1 && labels.every(label => catalog[label])) {
      const translated = labels.map(label => catalog[label]);
      const conjunction = locale === 'bn' ? ' এবং ' : ' और ';
      const result = translated.slice(0, -1).join(', ') + conjunction + translated.at(-1);
      memo.set(value, result); return result;
    }
    for (const p of patterns) {
      if (p.prefix && !source.startsWith(p.prefix)) continue;
      if (!p.literals.every(literal => source.includes(literal))) continue;
      const match = p.regex.exec(source);
      if (!match) continue;
      const target = p.target.replace(/ZXQ(\d+)QXZ/g, (_, id: string) => {
        const slot = p.ids.indexOf(Number(id));
        const replacement = match[slot + 1] ?? '';
        // Nested summaries can contain translated label lists or another
        // template. A strictly shorter source guarantees recursion terminates.
        return catalog[normalize(replacement)] || (replacement.length < source.length ? text(replacement) : replacement);
      });
      memo.set(value, target); return target;
    }
    return value;
  }
  /** Deterministic replacement for toLocaleDateString on localized pages.
   * Dates are shown in India time (or UTC when asked) wherever they render. */
  function date(value: Date | string | number, options: Intl.DateTimeFormatOptions = {}): string {
    const parsed = value instanceof Date ? value : new Date(value);
    if (locale === 'en' || Number.isNaN(parsed.getTime()) || options.weekday || options.hour || options.minute) {
      return parsed.toLocaleDateString(locale === 'en' ? 'en-IN' : `${LOCALE_TAGS[locale]}-u-nu-latn`, options);
    }
    const zoned = new Date(parsed.getTime() + (options.timeZone === 'UTC' ? 0 : IST_OFFSET_MS));
    const day = zoned.getUTCDate(), monthIndex = zoned.getUTCMonth(), year = zoned.getUTCFullYear();
    if (!options.month) return options.year && !options.day ? String(year) : `${day}/${monthIndex + 1}/${year}`;
    const month = options.month === 'numeric' || options.month === '2-digit' ? String(monthIndex + 1) : MONTHS[locale][monthIndex];
    if (!options.day) return options.year ? `${month} ${year}` : month;
    if (!options.year) return `${day} ${month}`;
    return locale === 'bn' ? `${day} ${month}, ${year}` : `${day} ${month} ${year}`;
  }
  function node<T>(value: T): T {
    if (typeof value === 'string') return text(value) as T;
    if (Array.isArray(value)) return value.map(node) as T;
    return value;
  }
  function rich(source: string, ...values: ReactNode[]): ReactNode {
    const target = text(source);
    return target.split(/(ZXQ\d+QXZ)/).map((part, i) => {
      const slot = /^ZXQ(\d+)QXZ$/.exec(part);
      if (!slot) return text(part);
      const value = node(values[Number(slot[1])]);
      return isValidElement(value) ? cloneElement(value, { key: value.key ?? `translation-${i}` }) : value;
    });
  }
  function href<T>(value: T): T {
    if (typeof value !== 'string') return value;
    const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in').replace(/\/$/, '');
    if (value === base || value.startsWith(base + '/')) return (base + localizedHref(value.slice(base.length) || '/', locale)) as T;
    return localizedHref(value, locale) as T;
  }
  const displayKeys = new Set(['name','headline','description','text','caption','alternativeHeadline','articleBody','abstract','keywords']);
  function schema(value: unknown, key = ''): unknown {
    if (Array.isArray(value)) return value.map(v => schema(v, key));
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, schema(v,k)]));
    if (typeof value !== 'string') return value;
    if (key === '@id' && /\/#(?:organization|editorial-team|website)$/.test(value)) return value;
    if (key === 'inLanguage') return LOCALE_TAGS[locale];
    if (displayKeys.has(key)) return text(value);
    if (['url','@id','item','mainEntityOfPage','publishingPrinciples','correctionsPolicy'].includes(key)) return href(value);
    return value;
  }
  function jsonLd(value: { __html: string }) {
    try {return {__html: JSON.stringify(schema(JSON.parse(value.__html))).replace(/</g,'\\u003c')};}
    catch {return value;}
  }
  function metadata(value: Metadata): Metadata {
    function titleText(value: string): string {
      const translated=text(value);
      if(translated!==value || locale==='en') return translated;
      // SEO normalization can shorten an authored title before it reaches this
      // boundary. Match that exact normalization, never a fuzzy prefix.
      const candidates=new Set(Object.entries(catalog)
        .filter(([source])=>normalizeSerpTitle(source)===value)
        .map(([,target])=>target));
      return candidates.size===1 ? [...candidates][0] : translated;
    }
    function images<T>(v: T): T {
      if (Array.isArray(v)) return v.map(images) as T;
      if (v && typeof v === 'object' && 'alt' in v && typeof v.alt === 'string') return {...v, alt: text(v.alt)};
      return v;
    }
    const translateTitle = (v: Metadata['title']): Metadata['title'] => typeof v === 'string' ? titleText(v) : v ? Object.fromEntries(Object.entries(v).map(([k,s]) => [k, typeof s === 'string' ? titleText(s) : s])) as Metadata['title'] : v;
    const canonical = value.alternates?.canonical;
    const url = typeof canonical === 'string' ? canonical : canonical instanceof URL ? canonical.href : canonical && 'url' in canonical ? String(canonical.url) : '';
    const pathname = url ? new URL(url, 'https://www.rupeekit.co.in').pathname : '';
    return {...value,
      ...(value.title ? {title: translateTitle(value.title)} : {}),
      ...(value.description ? {description: text(value.description)} : {}),
      ...(pathname ? {alternates: languageAlternates(pathname, locale)} : {}),
      ...(value.openGraph ? {openGraph: {...value.openGraph, title: translateTitle(value.openGraph.title) ?? undefined, description: value.openGraph.description ? text(value.openGraph.description) : undefined, locale: LOCALE_TAGS[locale].replace('-','_'), url: href(value.openGraph.url) as string, images: images(value.openGraph.images)}} : {}),
      ...(value.twitter ? {twitter: {...value.twitter, title: translateTitle(value.twitter.title) ?? undefined, description: value.twitter.description ? text(value.twitter.description) : undefined, ...('images' in value.twitter ? {images: images(value.twitter.images)} : {})}} : {}),
    };
  }
  function csv(value: string): string {
    // CSV quoting is parsed before translating cells and re-escaped afterwards.
    const rows: string[][] = [[]]; let cell='', quoted=false;
    for(let i=0;i<value.length;i++) {
      const c=value[i];
      if(c==='"') {if(quoted && value[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
      else if(!quoted && (c===',' || c==='\n')) {rows.at(-1)!.push(cell);cell='';if(c==='\n')rows.push([]);}
      else if(c!=='\r' || quoted)cell+=c;
    }
    rows.at(-1)!.push(cell);
    return rows.map(row=>row.map(v=>'"'+text(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');
  }
  function svg(value: string): string {
    if(typeof DOMParser==='undefined')return value;
    const doc=new DOMParser().parseFromString(value,'image/svg+xml');
    doc.querySelectorAll('text,title,desc').forEach(n=>{for(const child of Array.from(n.childNodes))if(child.nodeType===3)child.textContent=text(child.textContent || '');});
    return new XMLSerializer().serializeToString(doc);
  }
  return {text,node,rich,href,jsonLd,metadata,csv,svg,add,collect,Scope,date};
}
