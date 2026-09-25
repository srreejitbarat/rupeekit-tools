/** Compact Indian number for chart axes: 950, 20.4K, 3.5L, 1.2Cr.
 * Intl's compact notation depends on the runtime's CLDR data (Node prints
 * "20.4K" for en-IN while current Chrome prints "20.4T"), which breaks
 * hydration, so the suffixes are fixed here. */
export function compactIndianNumber(value: number): string {
  const abs = Math.abs(value);
  const scaled = (divisor: number, suffix: string) => `${Number((value / divisor).toFixed(1))}${suffix}`;
  if (abs >= 1e7) return scaled(1e7, 'Cr');
  if (abs >= 1e5) return scaled(1e5, 'L');
  if (abs >= 1e3) return scaled(1e3, 'K');
  return String(Number(value.toFixed(1)));
}
