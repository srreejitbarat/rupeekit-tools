import type { Metadata } from 'next';
import { blogPosts } from '@/data/all-blog-posts';
import BlogListingClient from '@/components/blog/BlogListingClient';

const SITE_URL_CONST = 'https://www.rupeekit.co.in';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';

export const metadata: Metadata = {
  title: { absolute: 'Personal Finance Guides India: Tax, Loans & Investing' },
  description: 'Browse practical Indian money guides across seven clear hubs: budgeting, loans, tax, salary, savings, investing, and government compliance.',
  alternates: { canonical: `${SITE_URL}/blog` },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
  },
  openGraph: {
    title: 'Personal Finance Guides India: Tax, Loans & Investing',
    description: 'Browse practical Indian money guides across seven clear topic hubs.',
    url: `${SITE_URL}/blog`,
    siteName: 'RupeeKit',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Personal Finance Guides India: Tax, Loans & Investing',
    description: 'Browse practical Indian money guides across seven clear topic hubs.',
  },
};

export default function BlogListingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Blog Listing Header — server-rendered for SEO */}
      <section className="text-center max-w-3xl mx-auto">
        <span className="rounded-full bg-brandNavy/10 border border-brandNavy/20 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-brandNavy">
          RupeeKit Library
        </span>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-brandDeepNavy md:text-5xl">
          Personal Finance Guides for India
        </h1>
        <p className="mt-4 text-brandMuted text-lg leading-relaxed">
          Start with one of seven focused hubs for budgeting, loans, income tax, salary, savings, investing, or government compliance—then move directly to the calculator that supports the decision.
        </p>
      </section>

      {/* Client component handles search, filter, featured badge */}
      <BlogListingClient posts={blogPosts} />

      {/* JSON-LD: BreadcrumbList + CollectionPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL_CONST },
                { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL_CONST}/blog` },
              ],
            },
            {
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: 'Personal Finance Guides India: Tax, Loans & Investing',
              url: `${SITE_URL_CONST}/blog`,
              description: 'Free, practical personal finance articles covering budgeting, savings, investing, taxes, and financial planning for Indian salaried employees.',
              hasPart: blogPosts.map((p) => ({
                '@type': 'Article',
                name: p.seoTitle ?? p.title,
                url: `${SITE_URL_CONST}/blog/${p.slug}`,
              })),
            },
          ]),
        }}
      />

      {/* Bottom Educational Banner */}
      <section className="mt-16 rounded-[2rem] border border-brandBorder bg-white p-8 text-center shadow-sm max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-brandDeepNavy">Need Interactive Estimations?</h2>
        <p className="mt-2 text-sm text-brandMuted max-w-xl mx-auto">
          Our articles explain the rules, but you can compute exact outcomes for your income, EMIs, mutual funds, or tax deductions instantly.
        </p>
        <div className="mt-6">
          <a
            href="/#calculators"
            className="rounded-full bg-brandNavy px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-brandDeepNavy hover:shadow-md transition"
          >
            Explore All Calculators
          </a>
        </div>
      </section>
    </div>
  );
}
