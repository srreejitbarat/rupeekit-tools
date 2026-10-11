'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BlogVisualRenderer } from './BlogVisuals';

interface BlogCardProps {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  intro: string;
  visualType?: string;
  visualAlt?: string;
  heroImage?: string;
  heroImageAlt?: string;
  isFeatured?: boolean;
}

export default function BlogCard({
  slug,
  title,
  category,
  date,
  readTime,
  intro,
  visualType,
  visualAlt,
  heroImage,
  heroImageAlt,
  isFeatured,
}: BlogCardProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="group flex flex-col justify-between rounded-3xl border border-brandBorder bg-white overflow-hidden shadow-sm transition duration-300 hover:shadow-sm hover:border-brandNavy/35"
    >
      <div>
        {/* Visual Thumbnail */}
        <div className="relative">
          {heroImage ? (
            <div className="relative w-full aspect-[1.91/1] overflow-hidden border-b border-brandBorder">
              <Image
                src={heroImage}
                alt={heroImageAlt || visualAlt || title}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transform-none"
              />
            </div>
          ) : visualType ? (
            <div className="relative w-full aspect-[1.91/1] bg-gradient-to-br from-brandDeepNavy to-slate-900 p-4 flex items-center justify-center border-b border-brandBorder overflow-hidden">
              <div className="w-[70%] max-w-[180px] aspect-[16/10] bg-slate-900/60 border border-slate-800/80 rounded-xl p-2 flex items-center justify-center transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transform-none">
                <BlogVisualRenderer type={visualType} mode="thumbnail" />
              </div>
            </div>
          ) : (
            <div className="w-full aspect-[1.91/1] bg-brandBgSoft border-b border-brandBorder flex items-center justify-center text-brandNavy/20 font-black">
              RupeeKit
            </div>
          )}

          {/* Featured badge overlay */}
          {isFeatured && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-brandGrowthGreen px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                ✦ Featured
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-block rounded-full bg-brandNavy/10 border border-brandNavy/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brandNavy">
              {category}
            </span>
            <span className="text-[11px] text-brandMuted">{readTime}</span>
          </div>
          <h3 className="mt-3 text-lg font-bold tracking-tight text-brandDeepNavy group-hover:text-brandNavy transition line-clamp-3 md:line-clamp-none">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-brandMuted line-clamp-2">
            {intro}
          </p>
        </div>
      </div>

      <div className="mx-5 mb-5 pt-3 border-t border-brandBorder flex items-center justify-between text-xs">
        <span className="text-brandMuted">{date}</span>
        <span className="font-bold text-brandGrowthGreen group-hover:text-brandBrightGreen transition">
          Read Article →
        </span>
      </div>
    </Link>
  );
}
