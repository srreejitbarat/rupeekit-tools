import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('issue #86 mobile calculator safeguards', () => {
  it('keeps standard calculator numeric inputs mobile-friendly without changing formulas', () => {
    const source = read('components/Calculator.tsx');
    expect(source).toContain('type="number"');
    expect(source).toContain('inputMode="decimal"');
    expect(source).toContain('min={input.min}');
    expect(source).toContain('max={input.max}');
    expect(source).toContain('step={input.step ?? 1}');
  });

  it('keeps advanced numeric fields mobile-friendly and suppresses text correction behaviours', () => {
    const source = read('components/calculators/advanced/PriorityCalculatorPrimitives.tsx');
    expect(source).toContain('inputMode="decimal"');
    expect(source).toContain('autoCorrect="off"');
    expect(source).toContain('autoCapitalize="none"');
    expect(source).toContain('spellCheck={false}');
    expect(source).toContain('min-h-11');
  });

  it('keeps preset controls thumb-sized with accessible pressed state and focus indication', () => {
    const source = read('components/calculators/CalculatorPresets.tsx');
    expect(source).toContain('aria-pressed={isActive}');
    expect(source).toContain('min-h-11');
    expect(source).toContain('focus-visible:ring-2');
  });

  it('keeps result changes announced without replacing calculator output semantics', () => {
    const source = read('components/CalculatorVisualizations.tsx');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('<output');
  });
});
