'use client';

import type { ReactNode } from 'react';
import { addTranslations } from './registry';
import type { Locale } from './routing';

/** Registers the translations a server component computed for its client
 * child's props before that child renders, during SSR and hydration alike. */
export default function I18nClientScope({ locale, dict, children }: { locale: Locale; dict: Record<string, string>; children?: ReactNode }) {
  addTranslations(locale, dict);
  return <>{children}</>;
}
