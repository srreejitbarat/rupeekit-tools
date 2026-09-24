import imageManifest from './discover-images.json';
import fcraImageManifest from './discover-images-fcra.json';
import guideClusterImageManifest from './discover-guide-clusters.json';
import creativeBriefManifest from './discover-creative-briefs-2026-08-24.json';
import { calculatorGuides } from './calculator-guides';

export type DiscoverImage = {
  path: string;
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type DiscoverCreativeBrief = {
  path: string;
  priority: 'P0' | 'P1';
  contentType: 'article' | 'calculator';
  safeHook: string;
  story: string;
  composition: string;
  generationPrompt: string;
  avoid: string[];
};

type DiscoverGuideClusterImage = {
  clusterId: string;
  src: string;
  alt: string;
};

const guideClusterImageById = new Map(
  (guideClusterImageManifest as DiscoverGuideClusterImage[]).map((image) => [image.clusterId, image]),
);

const guideImages: DiscoverImage[] = calculatorGuides.flatMap((guide) => {
  const clusterImage = guideClusterImageById.get(guide.clusterId);
  if (!clusterImage) return [];

  return [{
    path: `/guides/${guide.slug}`,
    src: clusterImage.src,
    alt: clusterImage.alt,
    width: 1600,
    height: 900,
  }];
});

// Keep every preferred image bound to a verified static WebP. Static assets are
// reliable in the visible hero, Open Graph/Twitter metadata, structured data and
// the image sitemap. Creative briefs govern future image regeneration/review but
// do not replace the actual editorial image at runtime.
//
// Calculator guides deliberately reuse one reviewed editorial image per guide
// cluster. These guides explain different questions around the same calculator,
// so cluster-level reuse gives every indexable guide a large, verified image
// without pretending that 34 near-identical generated images are unique assets.
export const discoverImages = [
  ...imageManifest,
  ...fcraImageManifest,
  ...guideImages,
] as DiscoverImage[];

export const discoverCreativeBriefs = creativeBriefManifest as DiscoverCreativeBrief[];

const discoverImageByPath = new Map(discoverImages.map((image) => [image.path, image]));
const creativeBriefByPath = new Map(discoverCreativeBriefs.map((brief) => [brief.path, brief]));
const creativeBriefBySlug = new Map(
  discoverCreativeBriefs.map((brief) => [brief.path.split('/').filter(Boolean).at(-1) ?? '', brief]),
);

function normalizePath(pathname: string) {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/$/, '');
}

export function getBaseDiscoverImage(pathname: string): DiscoverImage | undefined {
  return discoverImageByPath.get(normalizePath(pathname));
}

export function getDiscoverCreativeBrief(pathname: string): DiscoverCreativeBrief | undefined {
  return creativeBriefByPath.get(normalizePath(pathname));
}

export function getDiscoverCreativeBriefBySlug(slug: string): DiscoverCreativeBrief | undefined {
  return creativeBriefBySlug.get(slug);
}

export function getDiscoverImage(pathname: string): DiscoverImage | undefined {
  return getBaseDiscoverImage(pathname);
}

export function getAbsoluteDiscoverImageUrl(siteUrl: string, pathname: string): string | undefined {
  const image = getDiscoverImage(pathname);
  return image ? `${siteUrl.replace(/\/$/, '')}${image.src}` : undefined;
}
