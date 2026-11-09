'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import type { ToolInput } from '@/lib/tools';

export const CalculatorResultContext = createContext<((valid: boolean, submitted: boolean) => void) | null>(null);

// Pass a stable result object for live calculators, or an attempt counter for
// forms that calculate only when the visitor commits their inputs.
export function useCalculatorResult(revision: unknown, valid: boolean, submitted = false) {
  const report = useContext(CalculatorResultContext);
  const previousRevision = useRef(revision);

  useEffect(() => {
    if (Object.is(previousRevision.current, revision)) return;
    previousRevision.current = revision;
    report?.(valid, submitted);
  }, [report, revision, submitted, valid]);
}

export function hasValidToolInputs(inputs: ToolInput[], values: Record<string, number | ''>): boolean {
  return inputs.every(({ key, min, max }) => {
    const value = values[key];
    return typeof value === 'number' && Number.isFinite(value) &&
      (min === undefined || value >= min) && (max === undefined || value <= max);
  });
}
