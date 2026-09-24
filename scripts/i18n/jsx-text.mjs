import { JSDOM } from 'jsdom';

const decoder = new JSDOM('<!doctype html><textarea></textarea>').window.document.querySelector('textarea');

// TypeScript preserves entities in JSX source text. React decodes them when
// rendering JSX; generated string expressions must do the same, exactly once.
export function decodeJsxText(value) {
  decoder.innerHTML = value.replaceAll('<', '&lt;');
  return decoder.value;
}
