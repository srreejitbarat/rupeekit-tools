import fs from 'node:fs';

const retiredPages = JSON.parse(fs.readFileSync(new URL('./data/retired-pages.json', import.meta.url), 'utf8'));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/blog/home-loan-eligibility-25000-salary-india',
        destination: '/blog/home-loan-eligibility-by-salary-india',
        statusCode: 301,
      },
      {
        source: '/blog/home-loan-eligibility-40000-salary-india',
        destination: '/blog/home-loan-eligibility-by-salary-india',
        statusCode: 301,
      },
      {
        source: '/blog/home-loan-eligibility-45000-salary-india',
        destination: '/blog/home-loan-eligibility-by-salary-india',
        statusCode: 301,
      },
      {
        source: '/tools/net-worth-tracker-calculator-india',
        destination: '/tools/net-worth-calculator-india',
        statusCode: 301,
      },
      // These publicly linked editorial samples were intentionally noindexed.
      // Retire their URLs with a permanent redirect instead of serving thin
      // sample pages or leaving them as crawlable exclusions.
      ...[
        'central-government-da-dr-revision-format',
        'west-bengal-da-tracker-format',
        'maharashtra-salary-update-layout',
        'karnataka-pay-revision-tracker-format',
        'tamil-nadu-allowance-update-format',
        'kerala-pension-dr-update-format',
        'telangana-employee-pay-update-tracker-layout',
        'odisha-state-da-tracker-format',
        'uttar-pradesh-employee-pay-circular-format',
        'rajasthan-pension-tracker-layout',
        'assam-state-employee-update-tracker-format',
        'delhi-government-employee-payroll-format',
      ].map((slug) => ({
        source: `/government-salary-updates/${slug}`,
        // The tracker itself was later retired (data/retired-pages.json), so
        // point straight at its replacement to avoid a redirect chain.
        destination: '/8th-pay-commission',
        statusCode: 301,
      })),
      // Pages retired during the AdSense low-value-content review. Each one
      // redirects, in every language, to the kept page covering the same need.
      ...Object.entries(retiredPages).flatMap(([source, destination]) =>
        ['', '/hi', '/bn'].map((prefix) => ({
          source: `${prefix}${source}`,
          destination: `${prefix}${destination}`,
          statusCode: 301,
        })),
      ),
      // Slugs removed in 71d098d ("Replace old Financial Updates with EPFO
      // story"). Google still has these indexed and keeps re-crawling them,
      // which shows up as a coverage issue in Search Console.
      {
        source: '/financial-updates/income-tax-regime-comparison',
        destination: '/tools/income-tax-calculator-old-vs-new-regime-india',
        statusCode: 301,
      },
      ...[
        'gst-council-explainer',
        'banking-fd-rate-tracker',
        'hra-exemption-explainer',
        'nps-tier1-explainer',
      ].map((slug) => ({
        source: `/financial-updates/${slug}`,
        destination: '/financial-updates',
        statusCode: 301,
      })),
    ];
  },
  // Disable build trace collection — avoids a Next.js 14.2.x ENOENT bug on Windows
  // where _not-found/page.js.nft.json is missing during trace collection.
  // This does not affect dev, runtime, or static export output.
  experimental: {
    outputFileTracingExcludes: {
      '*': [],
    },
  },
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback };
    return config;
  },
};

export default nextConfig;
