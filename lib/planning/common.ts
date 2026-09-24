/** Small, deterministic helpers shared by the three planning experiences. */
export function inRange(value: number, min: number, max: number) {
  return Number.isFinite(value) && value >= min && value <= max;
}

export function monthIndex(value: string): number {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return NaN;
  const [year, month] = value.split('-').map(Number);
  if (year < 2000 || year > 2100) return NaN;
  return year * 12 + month - 1;
}

export function monthAt(start: string, offset: number) {
  const index = monthIndex(start) + offset;
  return `${Math.floor(index / 12)}-${String(index % 12 + 1).padStart(2, '0')}`;
}

export function monthLabel(value: string) {
  const index = monthIndex(value);
  if (!Number.isFinite(index)) return 'Check date';
  return new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(Math.floor(index / 12), index % 12, 1)));
}

export function money(value: number) {
  return Number.isFinite(value)
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
    : 'Unavailable';
}

export function moneyNumber(value: number) {
  return Math.round(value * 100) / 100;
}

export function csvText(rows: (string | number)[][]) {
  return rows.map(row => row.map(value => {
    // Escape spreadsheet formula prefixes in user-entered labels, but preserve numeric negatives.
    const text = typeof value === 'string' && /^[\s]*[=+@-]/.test(value) ? `'${value}` : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  }).join(',')).join('\r\n');
}

/** An advantage must persist to the end of the displayed horizon. Ties alone are not a win. */
export function sustainedLead(values: number[]) {
  let first: number | null = null;
  let hasPositive = false;
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i] < -0.01) break;
    hasPositive ||= values[i] > 0.01;
    if (hasPositive) first = i + 1;
  }
  return first;
}
