import { describe, it, expect } from 'vitest';
import { decodeJsxText } from './jsx-text.mjs';

describe('JSX text decoding for generated translations', () => {
  it('matches visible React text without leaving encoded apostrophes', () => {
    expect(decodeJsxText('Today&apos;s value &amp; tomorrow&#39;s cost')).toBe("Today's value & tomorrow's cost");
    expect(decodeJsxText('&#8377;100 &lt; &#x20B9;200')).toBe('₹100 < ₹200');
  });
  it('decodes once and keeps literal markup inert', () => {
    expect(decodeJsxText('&amp;apos;')).toBe('&apos;');
    expect(decodeJsxText('<img src=x>')).toBe('<img src=x>');
  });
});
