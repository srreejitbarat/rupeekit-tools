import type { Locale } from './routing';

type Catalog = Record<string, string>;
type Registrable = { add(entries: Catalog): void };

// Lets the client scope reach a locale's translator without importing it,
// which would create a cycle (the translator module renders the scope).
const translators: Partial<Record<Locale, Registrable>> = {};
// Webpack evaluates a client component's module the first time React renders
// it, so a scope can run before its child has loaded the locale's translator.
// Hold those entries until the translator registers.
const pending: Partial<Record<Locale, Catalog>> = {};

export function registerTranslator(locale: Locale, translator: Registrable) {
  translators[locale] = translator;
  const queued = pending[locale];
  if (queued) {
    delete pending[locale];
    translator.add(queued);
  }
}

export function addTranslations(locale: Locale, entries: Catalog) {
  const translator = translators[locale];
  if (translator) translator.add(entries);
  else pending[locale] = Object.assign(pending[locale] ?? {}, entries);
}
