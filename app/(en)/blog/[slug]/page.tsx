import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { blogPosts } from '@/data/all-blog-posts';
import { getDiscoverImage } from '@/data/discover-images';
import BlogArticleLayout from '@/components/blog/BlogArticleLayout';
import FcraArticleLayout from '@/components/blog/FcraArticleLayout';
import FcraOriginalMedia from '@/components/blog/FcraOriginalMedia';
import { normalizeSerpDescription, normalizeSerpTitle } from '@/lib/seo/ctr-metadata';
import {
  CORRECTIONS_POLICY_URL,
  EDITORIAL_POLICY_URL,
  editorialTeamRef,
} from '@/lib/seo/editorial';

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

interface BlogPostPageProps {
  params: { slug: string };
}

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) return {};
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';
  const pageUrl = `${siteUrl}/blog/${post.slug}`;
  const title = normalizeSerpTitle(post.seoTitle || post.title);
  const description = normalizeSerpDescription(post.metaDescription);
  const discoverImage = getDiscoverImage(`/blog/${post.slug}`);
  const heroImage = discoverImage?.src || post.heroImage;
  const heroImageAlt = discoverImage?.alt || post.heroImageAlt || title;
  const heroImageWidth = discoverImage?.width || post.heroImageWidth || 1600;
  const heroImageHeight = discoverImage?.height || post.heroImageHeight || 900;
  const imageUrl = heroImage ? `${siteUrl}${heroImage}` : undefined;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: pageUrl },
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'RupeeKit',
      type: 'article',
      locale: 'en_IN',
      ...(imageUrl && { images: [{ url: imageUrl, width: heroImageWidth, height: heroImageHeight, alt: heroImageAlt }] }),
    },
    twitter: { card: 'summary_large_image', title, description, ...(imageUrl && { images: [imageUrl] }) },
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rupeekit.co.in';
  const pageUrl = `${siteUrl}/blog/${post.slug}`;
  const discoverImage = getDiscoverImage(`/blog/${post.slug}`);
  const heroImage = discoverImage?.src || post.heroImage;
  const imageUrl = heroImage ? `${siteUrl}${heroImage}` : undefined;
  const postWithHero = heroImage ? {
    ...post,
    heroImage,
    heroImageAlt: discoverImage?.alt || post.heroImageAlt || post.title,
    heroImageWidth: discoverImage?.width || post.heroImageWidth || 1600,
    heroImageHeight: discoverImage?.height || post.heroImageHeight || 900,
  } : post;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.seoTitle || post.title,
    description: post.metaDescription,
    image: imageUrl ? [imageUrl] : undefined,
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    datePublished: post.publishedDateISO || undefined,
    dateModified: post.modifiedDateISO || post.publishedDateISO || undefined,
    inLanguage: 'en-IN',
    author: editorialTeamRef,
    reviewedBy: editorialTeamRef,
    publisher: { '@id': `${siteUrl}/#organization` },
    publishingPrinciples: EDITORIAL_POLICY_URL,
    correctionsPolicy: CORRECTIONS_POLICY_URL,
    isPartOf: { '@id': `${siteUrl}/#website` },
    ...(post.officialSources?.length ? { citation: post.officialSources.map((source) => source.href) } : {}),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: pageUrl },
    ],
  };

  const faqSchema = post.faqs?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })),
  } : null;

  const isFcraGuide = post.slug === 'fcra-2-0-india-2026-explained';

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
    {isFcraGuide ? <><FcraArticleLayout post={postWithHero} /><FcraOriginalMedia /></> : <BlogArticleLayout post={postWithHero} />}
  </>;
}
