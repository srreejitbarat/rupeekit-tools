import Image from 'next/image';

const supportingImages = [
  {
    src: '/media/fcra-2026/fcra-2026-timeline.webp',
    alt: 'Original RupeeKit timeline showing the FCRA Amendment Bill introduction, 2026 Rules notification, portal launch and pending Bill status',
  },
  {
    src: '/media/fcra-2026/fcra-registration-snapshot-2026.webp',
    alt: 'Original RupeeKit graphic showing rounded active, cancelled and expired FCRA certificate counts from the official portal snapshot',
  },
  {
    src: '/media/fcra-2026/fcra-rules-vs-bill-2026.webp',
    alt: 'Original RupeeKit comparison graphic separating FCRA 2026 Rules already in force from the Amendment Bill that remains pending',
  },
] as const;

export default function FcraOriginalMedia() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-12" aria-labelledby="fcra-original-media-title">
      <div className="rounded-[2rem] border border-brandBorder bg-white p-6 shadow-card md:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-brandGrowthGreen">Original RupeeKit media</p>
          <h2 id="fcra-original-media-title" className="mt-2 text-2xl font-black text-brandDeepNavy md:text-3xl">
            FCRA 2026 visual explainer
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-brandMuted">
            These visuals were created from official-source facts and original RupeeKit graphics. No third-party news footage,
            screenshots or broadcaster artwork is used. Certificate totals are a dated snapshot and can change over time.
          </p>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <figure className="overflow-hidden rounded-3xl border border-brandBorder bg-brandDeepNavy shadow-soft">
            <video
              className="aspect-[9/16] w-full bg-brandDeepNavy object-cover"
              controls
              playsInline
              preload="metadata"
              poster="/images/discover/fcra-2-0-india-2026-explained.webp"
              aria-label="Twelve-second RupeeKit explainer about the FCRA 2026 timeline, certificate snapshot and pending Bill status"
            >
              <source src="/media/fcra-2026/fcra-2-0-india-2026-explainer.mp4" type="video/mp4" />
              Your browser does not support the video element.
            </video>
            <figcaption className="bg-white px-4 py-3 text-xs leading-relaxed text-brandMuted">
              12-second lightweight vertical web preview with an original synthesized background track. No third-party audio recording is used.
            </figcaption>
          </figure>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {supportingImages.map((image) => (
              <figure key={image.src} className="overflow-hidden rounded-2xl border border-brandBorder bg-brandBgSoft shadow-sm">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={1080}
                  height={1350}
                  className="h-auto w-full"
                />
              </figure>
            ))}
          </div>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-brandMuted">
          Fact basis: Ministry of Home Affairs FCRA Online portal, Press Information Bureau portal-launch material, and Digital Sansad for parliamentary status. Verify the live portal and current Bill status before relying on time-sensitive figures.
        </p>
      </div>
    </section>
  );
}
