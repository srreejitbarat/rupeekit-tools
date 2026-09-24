import { describe, expect, it } from 'vitest';
import { blogPosts } from '../data/all-blog-posts';
import { CONTEXTUAL_NEXT_STEPS, CONTEXTUAL_NEXT_STEP_TOOL_SLUGS } from '../data/contextual-next-steps';
import { getToolBySlug } from './tools';

describe('issue #83 contextual calculator journeys', () => {
  it('defines explicit contextual next steps for exactly 20 priority tools', () => {
    expect(CONTEXTUAL_NEXT_STEP_TOOL_SLUGS).toHaveLength(20);

    for (const slug of CONTEXTUAL_NEXT_STEP_TOOL_SLUGS) {
      expect(getToolBySlug(slug), `${slug} should remain a live calculator`).toBeTruthy();
      const steps = CONTEXTUAL_NEXT_STEPS[slug];
      expect(steps.length).toBeGreaterThanOrEqual(1);
      expect(steps.length).toBeLessThanOrEqual(2);
      for (const step of steps) {
        expect(step.question.trim().endsWith('?')).toBe(true);
        expect(step.label.trim().length).toBeGreaterThan(8);
        expect(step.href.startsWith('/')).toBe(true);
      }
    }
  });

  it('keeps every contextual destination live', () => {
    const liveBlogs = new Set(blogPosts.map((post) => `/blog/${post.slug}`));

    for (const steps of Object.values(CONTEXTUAL_NEXT_STEPS)) {
      for (const step of steps) {
        if (step.destinationType === 'guide') {
          expect(liveBlogs.has(step.href), `${step.href} should be a live blog/guide`).toBe(true);
          continue;
        }
        const slug = step.href.replace(/^\/tools\//, '');
        expect(getToolBySlug(slug), `${step.href} should be a live tool`).toBeTruthy();
      }
    }
  });

  it('uses a dedicated CTA type so contextual links can be compared with generic related links', async () => {
    const analyticsSource = await import('node:fs/promises').then(({ readFile }) =>
      readFile(new URL('./analytics.ts', import.meta.url), 'utf8')
    );
    expect(analyticsSource).toContain("'contextual_next_step'");
  });
});
