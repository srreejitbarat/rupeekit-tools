import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const hero = read('components/seo/DiscoverHeroImage.tsx');
const resultVisuals = read('components/CalculatorVisualizations.tsx');

const failures = [];

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) failures.push(message);
};

requireText(hero, 'width={image.width}', 'DiscoverHeroImage must render an explicit image width.');
requireText(hero, 'height={image.height}', 'DiscoverHeroImage must render an explicit image height.');
requireText(hero, 'sizes=', 'DiscoverHeroImage must declare responsive sizes to avoid oversized image downloads.');
requireText(hero, 'priority={priority}', 'DiscoverHeroImage must preserve opt-in priority loading for above-the-fold heroes.');
requireText(hero, 'aspect-video', 'DiscoverHeroImage must reserve aspect-ratio space to protect CLS.');
requireText(resultVisuals, 'aria-live="polite"', 'Calculator result summaries must retain live-result semantics.');
requireText(resultVisuals, '<output', 'Calculator result values must retain output semantics.');


if (failures.length) {
  console.error('CWV readiness validation failed:\n' + failures.map((item) => `- ${item}`).join('\n'));
  process.exit(1);
}

console.log('CWV readiness validation passed: explicit hero dimensions/aspect ratio, responsive sizing, priority support, and result semantics are present.');
