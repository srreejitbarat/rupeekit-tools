'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo';
import { getDiscoverCreativeBrief } from '@/data/discover-images';
import { BlogHeroVisual } from './BlogVisuals';

interface BlogHeroProps {
  title: string;
  category: string;
  date: string;
  readTime: string;
  description: string;
  visualType?: string;
  visualAlt?: string;
  heroImage?: string;
  heroImageAlt?: string;
  heroImageWidth?: number;
  heroImageHeight?: number;
}

export default function BlogHero({
  title,
  category,
  date,
  readTime,
  description,
  visualType,
  visualAlt,
  heroImage,
  heroImageAlt,
  heroImageWidth,
  heroImageHeight,
}: BlogHeroProps) {
  const pathname = usePathname();
  const hasVisual = Boolean(heroImage || visualType);
  const discoverBrief = pathname ? getDiscoverCreativeBrief(pathname) : undefined;

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brandDeepNavy via-brandNavy to-slate-900 text-white shadow-xl">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brandGrowthGreen/20 blur-3xl"
      />

      <div className="relative z-10 px-6 pb-6 pt-7 sm:px-8 sm:pb-8 sm:pt-9 md:px-12 md:pt-11">
        <div className="max-w-4xl">
          <span className="inline-block rounded-full border border-brandGrowthGreen/30 bg-brandGrowthGreen/15 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-brandBrightGreen">
            {category}
          </span>
          <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-200 md:text-base">
            {description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-300">
            <span>Published: {date}</span>
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            <span>{readTime}</span>
          </div>
        </div>
      </div>

      {hasVisual && (
        <div className="relative z-10 px-3 pb-3 sm:px-4 sm:pb-4 md:px-6 md:pb-6">
          {heroImage ? (
            <figure className="relative mx-auto w-full overflow-hidden rounded-[1.35rem] border border-white/10 bg-slate-950 shadow-2xl">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={heroImage}
                  alt={heroImageAlt || visualAlt || title}
                  fill
                  className="object-contain"
                  sizes="(min-width: 1280px) 1152px, (min-width: 1024px) calc(100vw - 8rem), (min-width: 640px) calc(100vw - 4rem), calc(100vw - 2rem)"
                  priority
                />

                {discoverBrief ? (
                  <div
                    data-discover-overlay="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex min-h-[42%] items-end bg-gradient-to-t from-slate-950/90 via-slate-950/48 to-transparent p-4 sm:p-6 md:p-8"
                  >
                    <div className="max-w-[88%] sm:max-w-2xl">
                      <p className="text-2xl font-black leading-tight tracking-tight text-white drop-shadow-lg sm:text-3xl md:text-4xl">
                        {discoverBrief.safeHook}
                      </p>
                      <div className="mt-3 inline-flex items-center rounded-xl bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm sm:mt-4 sm:px-4">
                        <Logo type="horizontal" width={132} height={33} className="h-auto w-[112px] sm:w-[132px]" />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              <figcaption className="sr-only">{heroImageAlt || visualAlt || title}</figcaption>
            </figure>
          ) : (
            <div className="mx-auto w-full rounded-[1.35rem] border border-white/10 bg-white p-3 shadow-2xl sm:p-4">
              <BlogHeroVisual type={visualType!} alt={visualAlt || title} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
