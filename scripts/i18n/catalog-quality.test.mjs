import { describe, it, expect } from 'vitest';
import { catalogProblems } from './catalog-quality.mjs';

describe('translation release quality', () => {
  it('rejects bundled translation output even without interpolation slots', () => {
    expect(catalogProblems('Calculator', 'कैलकुलेटर\n[आरके_1] ब्लॉग')).toContain('unresolved-batch-marker');
    expect(catalogProblems('Calculator', 'ক্যালকুলেটর [আরকে_2]')).toContain('unresolved-batch-marker');
    expect(catalogProblems('EMI', 'ZXV6VXZ')).toContain('unresolved-batch-marker');
  });
  it('allows reordered slots but rejects missing or duplicated slots', () => {
    expect(catalogProblems('ZXQ0QXZ and ZXQ1QXZ', 'ZXQ1QXZ और ZXQ0QXZ')).toEqual([]);
    expect(catalogProblems('ZXQ0QXZ', 'রাশি')).toContain('placeholder-mismatch');
    expect(catalogProblems('ZXQ0QXZ', 'ZXQ0QXZ ZXQ0QXZ')).toContain('placeholder-mismatch');
  });
});
