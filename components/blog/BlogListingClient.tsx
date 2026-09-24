'use client';

import { useState, useMemo } from 'react';
import { BlogPost } from '@/data/blog-posts';
import { BLOG_CLUSTERS, getBlogCluster } from '@/data/blog-clusters';
import BlogCard from './BlogCard';

interface BlogListingClientProps {
  posts: BlogPost[];
}

const CATEGORY_ALL = 'All';

export default function BlogListingClient({ posts }: BlogListingClientProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(CATEGORY_ALL);

  // Seven durable clusters replace the long list of overlapping post labels.
  const categories = useMemo(() => {
    const available = new Set(posts.map((post) => getBlogCluster(post.category).label));
    return [CATEGORY_ALL, ...BLOG_CLUSTERS.map((cluster) => cluster.label).filter((label) => available.has(label))];
  }, [posts]);

  const clusterCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      const label = getBlogCluster(post.category).label;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return counts;
  }, [posts]);

  // Filter posts by category and search
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((p) => {
      const cluster = getBlogCluster(p.category);
      const matchesCat = activeCategory === CATEGORY_ALL || cluster.label === activeCategory;
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.intro.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        cluster.label.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [posts, search, activeCategory]);

  // The first post in the original array is the featured/newest
  const featuredSlug = posts[0]?.slug;

  return (
    <div>
      <section className="mt-12" aria-labelledby="blog-cluster-heading">
        <div className="text-center">
          <h2 id="blog-cluster-heading" className="text-2xl font-black text-brandDeepNavy">Explore by financial goal</h2>
          <p className="mt-2 text-sm leading-6 text-brandMuted">Seven clear topic hubs replace overlapping tags and make the next useful guide easier to find.</p>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BLOG_CLUSTERS.filter((cluster) => clusterCounts.has(cluster.label)).map((cluster) => (
            <article key={cluster.id} className={`rounded-2xl border p-4 transition ${activeCategory === cluster.label ? 'border-brandNavy bg-brandNavy/5 ring-2 ring-brandNavy/10' : 'border-brandBorder bg-white hover:border-brandNavy/30'}`}>
              <button
                type="button"
                onClick={() => setActiveCategory(cluster.label)}
                className="w-full text-left"
                aria-pressed={activeCategory === cluster.label}
                aria-controls="blog-article-library"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-bold text-brandDeepNavy">{cluster.label}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">{clusterCounts.get(cluster.label)} guides</span>
                </span>
                <span className="mt-2 block text-xs leading-5 text-brandMuted">{cluster.description}</span>
              </button>
              <a href={cluster.calculatorHref} className="mt-3 inline-flex text-xs font-bold text-brandNavy hover:underline">
                {cluster.calculatorLabel} →
              </a>
              {cluster.secondaryCalculatorHref && cluster.secondaryCalculatorLabel ? (
                <a href={cluster.secondaryCalculatorHref} className="ml-3 mt-3 inline-flex text-xs font-bold text-brandNavy hover:underline">
                  {cluster.secondaryCalculatorLabel} →
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      {/* Search + Category Filters */}
      <div className="mt-10 space-y-5">
        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
            <svg className="h-4 w-4 text-brandMuted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search finance guides…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-brandBorder bg-white py-3 pl-10 pr-4 text-sm text-brandDeepNavy placeholder-brandMuted shadow-sm outline-none transition focus:border-brandNavy focus:ring-1 focus:ring-brandNavy"
            aria-label="Search finance guides"
          />
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Filter by category">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${
                activeCategory === cat
                  ? 'border-brandNavy bg-brandNavy text-white shadow-sm'
                  : 'border-brandBorder bg-white text-brandMuted hover:border-brandNavy/40 hover:text-brandNavy'
              }`}
              aria-pressed={activeCategory === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {(search || activeCategory !== CATEGORY_ALL) && (
        <p className="mt-6 text-center text-xs text-brandMuted">
          {filtered.length === 0
            ? 'No articles found. Try a different search or category.'
            : `Showing ${filtered.length} article${filtered.length === 1 ? '' : 's'}`}
        </p>
      )}

      {/* Article Grid */}
      <section id="blog-article-library" className="mt-10 scroll-mt-24" aria-label="Article list">
        {filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <BlogCard
                key={post.slug}
                slug={post.slug}
                title={post.title}
                category={getBlogCluster(post.category).label}
                date={post.date}
                readTime={post.readTime}
                intro={post.intro}
                visualType={post.visualType}
                visualAlt={post.visualAlt}
                heroImage={post.heroImage}
                heroImageAlt={post.heroImageAlt}
                isFeatured={post.slug === featuredSlug && activeCategory === CATEGORY_ALL && !search}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-brandBorder bg-white p-10 text-center shadow-sm">
            <p className="text-brandDeepNavy font-bold">No results found</p>
            <p className="mt-2 text-sm text-brandMuted">Try clearing your search or selecting &ldquo;All&rdquo;.</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory(CATEGORY_ALL); }}
              className="mt-6 rounded-full bg-brandNavy px-6 py-2.5 text-sm font-bold text-white hover:bg-brandDeepNavy transition"
            >
              Show all articles
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
