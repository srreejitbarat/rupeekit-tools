import { Fragment } from 'react';
import Link from 'next/link';
import type { BlogPost } from '@/data/blog-posts';
import BlogHero from './BlogHero';
import TableOfContents from './TableOfContents';
import RelatedCalculatorLinks from './RelatedCalculatorLinks';
import FAQSection from './FAQSection';
import FinanceDisclaimer from './FinanceDisclaimer';
import AffiliateDisclosure from './AffiliateDisclosure';
import BrokerAffiliateDisclosure from './BrokerAffiliateDisclosure';
import BookRecommendationCard from './BookRecommendationCard';
import QuickAnswerBox from '@/components/seo/QuickAnswerBox';
import AnswerEngineSummary from '@/components/seo/AnswerEngineSummary';
import EditorialByline from '@/components/seo/EditorialByline';
import { BlogInlineVisual, BlogSharePreviewCard } from './BlogVisuals';
import BrokerComparisonCard from './BrokerComparisonCard';
import { Tax2026Stats, Tax2026CTA, Tax2026CompactCTA, CommonMistakesCards } from './Tax2026Visuals';
import {
  FilingDeadlineTimeline,
  CapitalGainsRateShift,
  OldVsNewRegimeSlabSnapshot,
  RebateComparison,
  ITR2TriggerMatrix
} from './ITR2DataVisuals';

interface BlogArticleLayoutProps {
  post: BlogPost;
}

const GRATUITY_ELIGIBILITY_ROWS = [
  {
    situation: 'Regular permanent employee',
    eligibility: 'General five-year continuous-service rule, subject to statutory exceptions',
  },
  {
    situation: 'Eligible fixed-term employee',
    eligibility: 'One-year eligibility where the applicable legal provisions and contract conditions are satisfied',
  },
  {
    situation: 'Death or disablement',
    eligibility: 'Separate statutory exceptions may apply; the five-year condition does not apply',
  },
] as const;

function GratuityEligibilityTable() {
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-brandBorder bg-white shadow-sm">
      <div className="border-b border-brandBorder bg-slate-50 px-5 py-4">
        <h3 className="text-base font-black text-brandDeepNavy">Gratuity eligibility at a glance (2026)</h3>
        <p className="mt-1 text-xs text-brandMuted">
          Eligibility depends on the written contract and applicable legal conditions — not every contract worker
          automatically qualifies after one year.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Employment situation</th>
              <th className="px-5 py-3">General eligibility explanation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {GRATUITY_ELIGIBILITY_ROWS.map((row) => (
              <tr key={row.situation}>
                <td className="px-5 py-3 font-semibold text-slate-900">{row.situation}</td>
                <td className="px-5 py-3">{row.eligibility}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const EMERGENCY_FUND_EXAMPLE_ROWS = [
  { monthlyCost: '₹25,000', threeMonths: '₹75,000', sixMonths: '₹1,50,000', nineMonths: '₹2,25,000', twelveMonths: '₹3,00,000' },
  { monthlyCost: '₹40,000', threeMonths: '₹1,20,000', sixMonths: '₹2,40,000', nineMonths: '₹3,60,000', twelveMonths: '₹4,80,000' },
  { monthlyCost: '₹60,000', threeMonths: '₹1,80,000', sixMonths: '₹3,60,000', nineMonths: '₹5,40,000', twelveMonths: '₹7,20,000' },
] as const;

function EmergencyFundExamplesTable() {
  return (
    <div className="mt-5 overflow-x-auto rounded-2xl border border-brandBorder">
      <table className="w-full min-w-[680px] text-left text-sm text-slate-700">
        <caption className="bg-slate-50 px-5 py-4 text-left text-sm font-bold text-brandDeepNavy">
          Emergency fund examples by monthly survival cost
        </caption>
        <thead className="border-t border-brandBorder bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
          <tr>
            <th className="px-4 py-3">Monthly survival cost</th>
            <th className="px-4 py-3">3 months</th>
            <th className="px-4 py-3">6 months</th>
            <th className="px-4 py-3">9 months</th>
            <th className="px-4 py-3">12 months</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {EMERGENCY_FUND_EXAMPLE_ROWS.map((row) => (
            <tr key={row.monthlyCost}>
              <th scope="row" className="px-4 py-3 font-semibold text-slate-900">{row.monthlyCost}</th>
              <td className="px-4 py-3">{row.threeMonths}</td>
              <td className="px-4 py-3">{row.sixMonths}</td>
              <td className="px-4 py-3">{row.nineMonths}</td>
              <td className="px-4 py-3">{row.twelveMonths}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatBlogDateLabel(isoDate?: string, fallback?: string) {
  if (!isoDate) return fallback ?? 'Not specified';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return fallback ?? 'Not specified';
  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

export default function BlogArticleLayout({ post }: BlogArticleLayoutProps) {
  const isEmergencyFundGuide = post.slug === 'how-much-emergency-fund';
  const showTaxCrossLinks =
    post.slug === 'itr-2-ay-2026-27-filing-guide' ||
    post.slug === 'income-tax-calculator-2026-calculator-guide' ||
    post.slug === 'personal-finance-checklist-for-salaried-people';
  const lastUpdatedLabel = formatBlogDateLabel(post.modifiedDateISO || post.publishedDateISO, post.date);
  const answerEngineSummary =
    post.answerEngineSummary ||
    `${post.h1} explains the key assumptions, practical steps, and common mistakes so you can plan with clearer estimates. This article is educational information only and should be cross-verified with official rules and records where required.`;

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="text-xs md:text-sm text-brandMuted mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-brandNavy transition font-medium">
          Home
        </Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-brandNavy transition font-medium">
          Blog
        </Link>
        <span>/</span>
        <span className="text-brandText truncate max-w-[200px] md:max-w-none">{post.title}</span>
      </nav>

      <BlogHero
        title={post.h1}
        category={post.category}
        date={post.date}
        readTime={post.readTime}
        description={post.metaDescription}
        visualType={post.visualType}
        visualAlt={post.visualAlt}
        heroImage={post.heroImage}
        heroImageAlt={post.heroImageAlt}
        heroImageWidth={post.heroImageWidth}
        heroImageHeight={post.heroImageHeight}
      />

      <section className="mt-6" data-direct-answer="server-rendered">
        {post.quickAnswer ? (
          <QuickAnswerBox
            title={post.quickAnswer.title || 'Quick Answer'}
            question={post.quickAnswer.question}
            answer={post.quickAnswer.answer}
            formula={post.quickAnswer.formula}
            example={post.quickAnswer.example}
            note={post.quickAnswer.note}
            links={post.quickAnswer.links}
          />
        ) : (
          <AnswerEngineSummary summary={answerEngineSummary} />
        )}
      </section>

      <EditorialByline
        className="mt-6"
        publishedIso={post.publishedDateISO}
        updatedIso={post.modifiedDateISO}
        updatedFallback={post.date}
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.42fr]">
        <article className="flex flex-col gap-8">
          {post.amazonDisclosure && <AffiliateDisclosure />}
          {post.brokerAffiliateDisclosure && <BrokerAffiliateDisclosure />}

          <div className="rounded-3xl border border-brandBorder bg-white p-6 shadow-sm md:p-8">
            <p className="text-base md:text-lg leading-relaxed text-slate-800 font-medium">
              {post.intro}
            </p>

            {post.quickAnswer ? <AnswerEngineSummary className="mt-6" summary={answerEngineSummary} /> : null}

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Last updated: {lastUpdatedLabel}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Educational information only. Verify applicability with official guidance and qualified professionals where needed.
              </p>
            </div>

            {isEmergencyFundGuide ? (
              <>
                <p className="mt-4 text-sm md:text-base leading-relaxed text-slate-700">
                  Want to calculate your own safety corpus? Use the{' '}
                  <Link
                    href="/tools/emergency-fund-calculator-india"
                    className="font-semibold text-brandNavy hover:underline"
                  >
                    Emergency Fund Calculator India
                  </Link>{' '}
                  to estimate your 3, 6, 9 or 12 month emergency fund based on monthly expenses, EMI burden and
                  current savings.
                </p>
                <div className="mt-4 rounded-2xl border border-brandBorder bg-brandBgSoft p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-brandNavy">Related Planning Tools</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-700">
                    Continue with{' '}
                    <Link href="/tools/emergency-fund-calculator-india" className="font-semibold text-brandNavy hover:underline">
                      Emergency Fund Calculator India
                    </Link>
                    ,{' '}
                    <Link href="/tools/personal-loan-emi-calculator-india" className="font-semibold text-brandNavy hover:underline">
                      Personal Loan EMI Calculator India
                    </Link>
                    ,{' '}
                    <Link href="/tools/fd-calculator-india" className="font-semibold text-brandNavy hover:underline">
                      FD Calculator India
                    </Link>{' '}
                    and{' '}
                    <Link href="/tools/sip-calculator-india" className="font-semibold text-brandNavy hover:underline">
                      SIP Calculator India
                    </Link>
                    .
                  </p>
                </div>
              </>
            ) : null}

            {showTaxCrossLinks ? (
              <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-sky-800">Tax Planning Links</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-700">
                  Compare regimes with the{' '}
                  <Link href="/tools/income-tax-calculator-old-vs-new-regime-india" className="font-semibold text-sky-800 hover:underline">
                    Old vs New Tax Regime Calculator
                  </Link>
                  {' '}and the{' '}
                  <Link href="/tools/income-tax-calculator-old-vs-new-regime-india" className="font-semibold text-sky-800 hover:underline">
                    Income Tax Calculator Old vs New Regime
                  </Link>
                  . For alternate phrasing, use the{' '}
                  <Link href="/tools/income-tax-calculator-old-vs-new-regime-india" className="font-semibold text-sky-800 hover:underline">
                    New Regime vs Old Regime Calculator
                  </Link>
                  .{' '}
                  For HRA-specific estimation, use the{' '}
                  <Link href="/tools/hra-exemption-calculator-india" className="font-semibold text-sky-800 hover:underline">
                    HRA Exemption Calculator India
                  </Link>
                  . For return-prep steps, read the{' '}
                  <Link href="/blog/itr-2-ay-2026-27-filing-guide" className="font-semibold text-sky-800 hover:underline">
                    ITR-2 AY 2026-27 Filing Guide
                  </Link>
                  .
                </p>
              </div>
            ) : null}

            {post.slug === 'itr-2-ay-2026-27-filing-guide' && (
              <div className="mt-6 rounded-2xl border border-brandBorder bg-brandBgSoft p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-brandDeepNavy">
                  Editorial Note
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  This page is educational and does not guarantee tax savings or filing outcomes.
                  Always verify dates, rates, and eligibility from official government sources before filing.
                </p>
              </div>
            )}

            {post.slug === 'income-tax-calculator-2026-calculator-guide' && (
              <>
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-900">
                    ⚠️ Educational Estimate Only
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-amber-800">
                    Tax rules can change by financial year. This guide is for educational planning only. Verify the latest slabs, deductions, rebates, and filing rules before making tax decisions.
                  </p>
                </div>
                <Tax2026CompactCTA />
              </>
            )}

            {/* Sections */}
            <div className="mt-8 space-y-10">
              {post.sections.map((section, idx) => {
                const sectionId = slugify(section.title);
                return (
                  <Fragment key={section.title}>
                    <section id={sectionId} className="scroll-mt-24 border-t border-brandBorder pt-8 first:border-0 first:pt-0">
                      <h2 className="text-xl md:text-2xl font-black tracking-tight text-brandDeepNavy">
                        {section.title}
                      </h2>
                      {section.paragraphs.map((p, pIdx) => (
                        <p key={pIdx} className="mt-4 text-sm md:text-base leading-relaxed text-slate-700">
                          {p}
                        </p>
                      ))}
                      {section.bullets && section.bullets.length > 0 && (
                        <ul className="mt-4 list-disc space-y-2.5 pl-6 text-sm md:text-base text-slate-700">
                          {section.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      )}
                      {section.example && (
                        <div className="mt-5 rounded-2xl border border-brandNavy/10 bg-brandNavy/[0.02] p-5">
                          <h4 className="text-sm font-bold text-brandDeepNavy uppercase tracking-wider">
                            Practical Example: {section.example.title}
                          </h4>
                          <p className="mt-2 text-xs md:text-sm leading-relaxed text-slate-700">
                            {section.example.details}
                          </p>
                        </div>
                      )}
                      {isEmergencyFundGuide && section.title === 'How many months of expenses should an emergency fund cover?' ? (
                        <EmergencyFundExamplesTable />
                      ) : null}
                    </section>
                    {idx === 0 && post.visualType && (
                      <BlogInlineVisual
                        type={post.visualType}
                        title={post.visualTitle || ''}
                        subtitle={post.visualSubtitle || ''}
                        alt={post.visualAlt || ''}
                      />
                    )}
                    {post.slug === 'zerodha-vs-upstox-vs-angel-one-demat-account' && idx === 0 && (
                      <BrokerComparisonCard />
                    )}
                    {post.slug === 'new-labour-code-gratuity-rules-india-2026' && idx === 0 && (
                      <GratuityEligibilityTable />
                    )}
                    {post.slug === 'itr-2-ay-2026-27-filing-guide' && section.title === 'Who must file ITR-2 for AY 2026-27?' && <ITR2TriggerMatrix />}
                    {post.slug === 'itr-2-ay-2026-27-filing-guide' && section.title === 'What changed in ITR-2 AY 2026-27?' && <CapitalGainsRateShift />}
                    {post.slug === 'itr-2-ay-2026-27-filing-guide' && section.title === 'ITR-2 due date and key deadlines' && <FilingDeadlineTimeline />}
                    {post.slug === 'itr-2-ay-2026-27-filing-guide' && section.title === 'Old vs new tax regime quick reminder' && (
                      <>
                        <OldVsNewRegimeSlabSnapshot />
                        <RebateComparison />
                      </>
                    )}
                    {post.slug === 'income-tax-calculator-2026-calculator-guide' && section.title === 'Why Use an Income Tax Calculator for 2026?' && (
                      <Tax2026Stats />
                    )}
                    {post.slug === 'income-tax-calculator-2026-calculator-guide' && section.title === 'Common Mistakes to Avoid' && (
                      <CommonMistakesCards />
                    )}
                    {post.slug === 'income-tax-calculator-2026-calculator-guide' && section.title === 'How to Project Your Future Taxes' && (
                      <div className="mt-8 mb-8">
                        <Tax2026CTA />
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </div>

            {post.books && post.books.length > 0 && (
              <div className="mt-8 border-t border-brandBorder pt-8 space-y-6">
                <h2 className="text-2xl font-black text-brandDeepNavy">
                  Top Recommended Books
                </h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {post.books.map((book) => (
                    <BookRecommendationCard key={book.title} book={book} />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10 border-t border-brandBorder pt-8">
              <div className="rounded-2xl bg-brandBgSoft border border-brandBorder p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-brandDeepNavy">Estimate Your Own Finances</h4>
                  <p className="text-xs text-brandMuted mt-1">
                    {isEmergencyFundGuide
                      ? 'Use the dedicated emergency fund calculator to estimate your safety corpus target and shortfall.'
                      : 'Try our free interactive calculators to plan your savings, loans, and taxes.'}
                  </p>
                </div>
                <Link
                  href={isEmergencyFundGuide ? '/tools/emergency-fund-calculator-india' : '/#calculators'}
                  className="rounded-full bg-brandGrowthGreen px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brandBrightGreen hover:shadow-md transition whitespace-nowrap"
                >
                  {isEmergencyFundGuide ? 'Go to Calculator' : 'Go to Calculators'}
                </Link>
              </div>
            </div>
          </div>

          <FAQSection faqs={post.faqs} />
          {isEmergencyFundGuide && post.officialSources?.length ? (
            <section className="rounded-2xl border border-brandBorder bg-white p-5 text-sm leading-relaxed text-brandMuted shadow-sm">
              <h2 className="text-base font-bold text-brandDeepNavy">Official references checked</h2>
              <p className="mt-2">
                These references support the deposit-protection and product-risk explanations. The 3 to 12-month
                figures on this page are transparent planning scenarios, not rules issued by these authorities.
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                {post.officialSources.map((source) => (
                  <li key={source.href}>
                    <a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-brandNavy hover:underline">
                      {source.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <FinanceDisclaimer />
        </article>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <TableOfContents sections={post.sections} />
          <RelatedCalculatorLinks slugs={post.relatedCalculators} />
          {post.visualType && <BlogSharePreviewCard post={post} />}
        </aside>
      </div>
    </div>
  );
}
