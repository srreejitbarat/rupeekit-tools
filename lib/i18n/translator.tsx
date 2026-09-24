import { cloneElement, isValidElement, type ReactNode } from 'react';
import type { Metadata } from 'next';
import { languageAlternates, localizedHref, LOCALE_TAGS, type Locale } from './routing';

type Catalog = Record<string, string>;
const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Pure presentation adapter. Never changes field values, formula variables,
 * URL slugs, arithmetic, data keys, analytics parameters or API contracts. */
export function createTranslator(locale: Locale, catalog: Catalog) {
  const patterns = Object.entries(catalog).filter(([s]) => /ZXQ\d+QXZ/.test(s)).map(([source, target]) => ({
    source, target,
    prefix: source.split(/ZXQ\d+QXZ/)[0],
    ids: [...source.matchAll(/ZXQ(\d+)QXZ/g)].map(m => Number(m[1])),
    regex: new RegExp('^' + source.split(/ZXQ\d+QXZ/).map(escape).join('(.+?)') + '$'),
  })).filter(p => p.source.replace(/ZXQ\d+QXZ/g, '').length >= 4).sort((a,b) => b.prefix.length-a.prefix.length);
  const memo = new Map<string, string>();
  function text(value: string): string {
    if (locale === 'en' || !/[A-Za-z]/.test(value)) return value;
    const source = normalize(value);
    const exact = catalog[source];
    if (exact) return value.match(/^\s*/)?.[0] + exact + (value.match(/\s*$/)?.[0] || '');
    if (memo.has(value)) return memo.get(value)!;
    for (const p of patterns) {
      if (p.prefix && !source.startsWith(p.prefix)) continue;
      const match = p.regex.exec(source);
      if (!match) continue;
      const target = p.target.replace(/ZXQ(\d+)QXZ/g, (_, id: string) => {
        const slot = p.ids.indexOf(Number(id));
        const replacement = match[slot + 1] ?? '';
        return catalog[normalize(replacement)] || replacement;
      });
      memo.set(value, target); return target;
    }
    return value;
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
    function images<T>(v: T): T {
      if (Array.isArray(v)) return v.map(images) as T;
      if (v && typeof v === 'object' && 'alt' in v && typeof v.alt === 'string') return {...v, alt: text(v.alt)};
      return v;
    }
    const translateTitle = (v: Metadata['title']): Metadata['title'] => typeof v === 'string' ? text(v) : v ? Object.fromEntries(Object.entries(v).map(([k,s]) => [k, typeof s === 'string' ? text(s) : s])) as Metadata['title'] : v;
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
  return {text,node,rich,href,jsonLd,metadata,csv,svg};
}
