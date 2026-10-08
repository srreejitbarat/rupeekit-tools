import { describe, it, expect } from 'vitest';
import { catalogProblems } from './catalog-quality.mjs';

describe('translation release quality', () => {
  it('rejects bundled translation output even without interpolation slots', () => {
    expect(catalogProblems('Calculator', 'कैलकुलेटर\n[आरके_1] ब्लॉग')).toContain('unresolved-batch-marker');
    expect(catalogProblems('Calculator', 'ক্যালকুলেটর [আরকে_2]')).toContain('unresolved-batch-marker');
    expect(catalogProblems('EMI', 'ZXV6VXZ')).toContain('unresolved-batch-marker');
  });
  it('rejects batch markers transliterated into reader-facing Hindi or Bengali', () => {
    expect(catalogProblems('Pre-EMI & Possession Planner', 'प्री-जेडएक्सवी5वीएक्सजेड और कब्ज़ा योजनाकार')).toContain('unresolved-batch-marker');
    expect(catalogProblems('Pre-EMI', 'प्री-जेडएक्सवी५वीएक्सजेड')).toContain('unresolved-batch-marker');
    expect(catalogProblems('Pre-EMI', 'প্রি-জেডএক্সভি5ভিএক্সজেড')).toContain('unresolved-batch-marker');
    expect(catalogProblems('Pre-EMI', 'প্রি-জেডএক্সভি৫ভিএক্সজেড')).toContain('unresolved-batch-marker');
    expect(catalogProblems('Pre-EMI & Possession Planner', 'प्री-EMI और कब्ज़ा योजनाकार')).toEqual([]);
    expect(catalogProblems('Pre-EMI & Possession Planner', 'প্রি-EMI এবং পজেশন প্ল্যানার')).toEqual([]);
  });
  it('allows reordered slots but rejects missing or duplicated slots', () => {
    expect(catalogProblems('ZXQ0QXZ and ZXQ1QXZ', 'ZXQ1QXZ और ZXQ0QXZ')).toEqual([]);
    expect(catalogProblems('ZXQ0QXZ', 'রাশি')).toContain('placeholder-mismatch');
    expect(catalogProblems('ZXQ0QXZ', 'ZXQ0QXZ ZXQ0QXZ')).toContain('placeholder-mismatch');
  });
});
