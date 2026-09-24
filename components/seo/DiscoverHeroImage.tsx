'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo';
import { getDiscoverCreativeBrief, type DiscoverImage } from '@/data/discover-images';

type HeroImage = Pick<DiscoverImage, 'src' | 'alt' | 'width' | 'height'>;

type DiscoverHeroImageProps = {
  image: HeroImage;
  className?: string;
  priority?: boolean;
};

export default function DiscoverHeroImage({
  image,
  className = '',
  priority = false,
}: DiscoverHeroImageProps) {
  const pathname = usePathname();
  const isCalculatorRoute = pathname?.startsWith('/tools/');
  const discoverBrief = pathname ? getDiscoverCreativeBrief(pathname) : undefined;

  return (
    <>
      {isCalculatorRoute ? (
        <style jsx global>{`
          /* Calculator pages use a large editorial hero instead of a narrow side-column image. */
          @media (min-width: 1024px) {
            header:has(.rupeekit-calculator-discover-hero) {
              grid-template-columns: minmax(0, 1fr) !important;
              align-items: start !important;
            }

            header:has(.rupeekit-calculator-discover-hero) > div:first-child {
              max-width: 64rem;
            }

            header:has(.rupeekit-calculator-discover-hero) > div:nth-child(2) {
              width: 100%;
            }

            header:has(.rupeekit-calculator-discover-hero)
              > div:nth-child(2)
              > :not(.rupeekit-calculator-discover-hero) {
              max-width: 48rem;
            }
          }
        `}</style>
      ) : null}

      <figure
        className={`relative aspect-video w-full overflow-hidden border border-slate-200 bg-slate-950 ${
          isCalculatorRoute
            ? 'rupeekit-calculator-discover-hero rounded-[2rem] shadow-2xl'
            : 'rounded-3xl shadow-lg'
        } ${className}`}
      >
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="h-full w-full object-contain"
          sizes="(min-width: 1280px) 1152px, (min-width: 1024px) calc(100vw - 8rem), (min-width: 640px) calc(100vw - 4rem), calc(100vw - 2rem)"
          priority={priority}
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

        <figcaption className="sr-only">{image.alt}</figcaption>
      </figure>
    </>
  );
}
