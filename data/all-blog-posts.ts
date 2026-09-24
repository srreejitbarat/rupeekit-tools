import { blogPosts as coreBlogPosts } from './blog-posts';
import { extraBlogPosts } from './extra-blog-posts';
import { day4ComplianceBlogPosts } from './day4-compliance-blog-posts';
import { day7ComparisonBlogPosts } from './day7-comparison-blog-posts';
import queryVariantBlogOverrides from './query-variant-blog-overrides-2026-08-18.json';
import issue76BlogOverrides from './issue-76-blog-overrides-2026-08-23.json';
import issue80BlogOverrides from './issue-80-blog-overrides-2026-08-27.json';
import { BROKER_COMPARISON_SLUG, brokerComparisonOverride } from './broker-comparison-override-2026-09-08';
import { CONSOLIDATED_BLOG_SLUGS } from '../lib/consolidated-routes';
import { enrichLegacyBlogPost } from '../lib/seo/enrich-blog-post';
import type { BlogPost } from './blog-posts';

export type {
  BlogPost,
  BlogSection,
  FAQItem,
  BlogQuickAnswer,
  BlogQuickAnswerLink,
} from './blog-posts';

type BlogQueryVariantOverride = Pick<BlogPost, 'sections' | 'faqs'>;
type Issue76BlogOverride = Pick<BlogPost, 'relatedCalculators'>;
type IntentAwareBlogPost = BlogPost & { targetKeyword?: string };
type Issue80BlogOverride = Partial<Pick<BlogPost, 'h1' | 'quickAnswer' | 'sections' | 'faqs' | 'relatedCalculators'>> & {
  targetKeyword?: string;
};
const queryVariantOverrides = queryVariantBlogOverrides as Record<string, Partial<BlogQueryVariantOverride>>;
const issue76Overrides = issue76BlogOverrides as Record<string, Partial<Issue76BlogOverride>>;
const issue80Overrides = issue80BlogOverrides as Record<string, Issue80BlogOverride>;

export const blogPosts = [
  ...day7ComparisonBlogPosts,
  ...day4ComplianceBlogPosts,
  ...extraBlogPosts,
  ...coreBlogPosts,
]
  .filter((post) => !CONSOLIDATED_BLOG_SLUGS.has(post.slug))
  .map((post): IntentAwareBlogPost => {
    const queryOverride = queryVariantOverrides[post.slug];
    const issue76Override = issue76Overrides[post.slug];
    const issue80Override = issue80Overrides[post.slug];
    const mergedPost: IntentAwareBlogPost = {
      ...post,
      ...(issue80Override?.h1 ? { h1: issue80Override.h1 } : {}),
      ...(issue80Override?.quickAnswer ? { quickAnswer: issue80Override.quickAnswer } : {}),
      ...(issue80Override?.targetKeyword ? { targetKeyword: issue80Override.targetKeyword } : {}),
      sections: [
        ...post.sections,
        ...(queryOverride?.sections ?? []),
        ...(issue80Override?.sections ?? []),
      ],
      faqs: [
        ...post.faqs,
        ...(queryOverride?.faqs ?? []),
        ...(issue80Override?.faqs ?? []),
      ],
      relatedCalculators: [
        ...new Set([
          ...post.relatedCalculators,
          ...(issue76Override?.relatedCalculators ?? []),
          ...(issue80Override?.relatedCalculators ?? []),
        ]),
      ],
    };

    const finalPost: IntentAwareBlogPost =
      post.slug === BROKER_COMPARISON_SLUG
        ? ({ ...mergedPost, ...brokerComparisonOverride } as IntentAwareBlogPost)
        : mergedPost;

    return enrichLegacyBlogPost(finalPost) as IntentAwareBlogPost;
  });
