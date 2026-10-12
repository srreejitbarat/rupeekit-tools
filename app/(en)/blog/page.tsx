import Link from 'next/link';
import { withLanguageAlternates } from '@/lib/i18n/metadata';
import type { Metadata } from 'next';
import { blogPosts } from '@/data/all-blog-posts';
import BlogListingClient from '@/components/blog/BlogListingClient';
import { DEFAULT_OG_IMAGE } from '@/lib/seo/og-image';

const SITE_URL_CONST = 'https://www.rupeekit.co.in';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';

export const metadata: Metadata = {
  title: { absolute: 'Personal Finance Guides India: Tax, Loans & Investing' },
  description: 'Browse practical Indian money guides across seven clear hubs: budgeting, loans, tax, salary, savings, investing, and government compliance.',
  alternates: withLanguageAlternates({ canonical: `${SITE_URL}/blog` }),
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
  },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
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
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <header className="tool-page-heading">
        <h1 className="text-brandText">Personal Finance Guides for India</h1>
      </header>

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

      <Link href="/tools" className="mt-8 inline-flex min-h-11 items-center text-sm font-semibold text-brandNavy hover:underline dark:text-brandBrightGreen">
        <span>Explore All Calculators</span><span aria-hidden="true" className="ml-2">→</span>
      </Link>
    </div>
  );
}
