import type { BlogPost } from '@/data/blog-posts';

/** Keep authored headings and answers intact. Automatic question rewrites make
 * awkward prose and translation keys that authors never wrote. Add summaries
 * deliberately, rather than cutting sentences (which can split decimals).
 * Retain this boundary for callers assembling the complete blog catalog.
 */
export function enrichLegacyBlogPost(post: BlogPost): BlogPost {
  return post;
}
