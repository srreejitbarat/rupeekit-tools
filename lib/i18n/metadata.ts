import type { Metadata } from 'next';
import { languageAlternates } from './routing';
export function withLanguageAlternates(value: NonNullable<Metadata['alternates']>): NonNullable<Metadata['alternates']> {
  const canonical=value.canonical;
  const url=typeof canonical==='string'?canonical:canonical instanceof URL?canonical.href:canonical&&'url' in canonical?String(canonical.url):'';
  return url?{...value,...languageAlternates(new URL(url,'https://www.rupeekit.co.in').pathname)}:value;
}
