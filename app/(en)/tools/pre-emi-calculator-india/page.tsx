import { withLanguageAlternates } from '@/lib/i18n/metadata';
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PreEmiPlanner from "@/components/pre-emi/PreEmiPlanner";
import { MODEL_ASSUMPTIONS, MODEL_VERSION } from "@/lib/pre-emi/engine";
import { preEmiFaqs, preEmiSources, lenderQuestions } from "@/data/pre-emi";
import "./pre-emi.css";

export const revalidate = 86400;
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.rupeekit.co.in";
const pageUrl = `${siteUrl}/tools/pre-emi-calculator-india`;
const title = "Pre-EMI Calculator India: Rent, Full EMI & Possession Delays";
const description =
  "Compare pre-EMI and full EMI with staged loan draws, rent, possession delays and prepayments. Find cash shortfalls and protect your reserve with RupeeKit.";
const image = "/images/discover/pre-emi-calculator-india.webp";
export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: withLanguageAlternates({ canonical: pageUrl }),
  robots: { index: true, follow: true, "max-image-preview": "large" },
  openGraph: {
    title,
    description,
    url: pageUrl,
    type: "website",
    siteName: "RupeeKit",
    locale: "en_IN",
    images: [
      {
        url: `${siteUrl}${image}`,
        width: 1600,
        height: 900,
        alt: "A staged home-loan plan connects construction payments, possession and a protected cash reserve.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${siteUrl}${image}`],
  },
};

export default function PreEmiPage() {
  const now = new Date();
  const initialMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  )
    .toISOString()
    .slice(0, 7);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${pageUrl}#calculator`,
        name: "RupeeKit Pre-EMI Calculator",
        url: pageUrl,
        description,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        image: `${siteUrl}${image}`,
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description,
        datePublished: "2026-09-23",
        dateModified: "2026-09-23",
        mainEntity: { "@id": `${pageUrl}#calculator` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${siteUrl}${image}`,
          width: 1600,
          height: 900,
        },
        citation: preEmiSources.map((s) => s.href),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "Calculators",
            item: `${siteUrl}/tools`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Pre-EMI calculator",
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: preEmiFaqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };
  return (
    <section className="pre-emi" aria-label="Pre-EMI calculator and planner">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <div className="pe-wrap">
        <nav className="pe-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/tools">Calculators</Link>
          <span>/</span>
          <span>Pre-EMI planner</span>
        </nav>
        <header className="pe-hero">
          <div>
            <span className="pe-eyebrow">
              FOR THE HOME YOU’RE STILL WAITING FOR
            </span>
            <h1>
              Pre-EMI calculator.
              <span>
                Plan the wait.
                <br />
                Protect your cash.
              </span>
            </h1>
            <p className="pe-hero-copy">
              The EMI is only part of the story. See how staged loan payments,
              rent and a delayed possession fit into your life—before you
              commit.
            </p>
            <div className="pe-hero-tags">
              <span>3 repayment strategies</span>
              <span>Real cash-flow planning</span>
              <span>No signup</span>
            </div>
          </div>
          <figure className="pe-hero-art">
            <Image
              src={image}
              width={1600}
              height={900}
              alt="A staged home-loan plan connects construction payments, possession and a protected cash reserve."
              sizes="(max-width: 550px) calc(100vw - 32px), (max-width: 850px) 40vw, 450px"
              priority
            />
            <figcaption>
              Your home loan and your household cash, in one plan.
            </figcaption>
          </figure>
        </header>
        <p className="pe-quick-answer">
          <strong>What is pre-EMI?</strong> Interest on the portion of a home
          loan already disbursed, before regular EMI starts. For a full month,
          ₹12 lakh outstanding at 8.5% means an estimated{" "}
          <strong>₹8,500</strong> of interest. Principal repayment, rent and
          possession delays need a separate cash-flow check.
        </p>
        <PreEmiPlanner initialMonth={initialMonth} />
        <div className="pe-editorial">
          <article>
            <span className="pe-eyebrow">UNDERSTAND THE NUMBERS</span>
            <h2>Pre-EMI vs full EMI: look beyond the first payment.</h2>
            <p>
              Pre-EMI can reduce your initial outflow because you pay interest
              on the drawn loan. It does not repay principal unless you make
              extra payments. Full EMI starts principal repayment earlier, but
              the combination of rent, EMI and builder demands can put pressure
              on your savings.
            </p>
            <div className="pe-example">
              <h3>A worked example you can check</h3>
              <p>
                Suppose the bank has disbursed ₹12 lakh from a ₹60 lakh sanction
                at 8.5% a year. With no principal repaid, a full month’s
                interest is:
              </p>
              <code>₹12,00,000 × 8.5 ÷ 100 ÷ 12 = ₹8,500</code>
              <p>
                If another ₹12 lakh arrives at the start of the next month, the
                balance becomes ₹24 lakh and the monthly interest estimate
                becomes ₹17,000. Rent and your own builder contribution are
                separate cash expenses. An extra bank draw is not extra
                household income.
              </p>
              <p>
                These are month-start illustrations. RBI’s fair-practices
                guidance addresses charging interest from actual disbursement
                and only for the period the money is outstanding. Use the
                lender’s statement for exact mid-month charges.
              </p>
            </div>
            <h3>How to build a useful plan</h3>
            <ol>
              <li>
                Enter the sanction, rate, tenure, possession month and your
                lender’s full-EMI start month.
              </li>
              <li>
                Add take-home income, living costs, other EMIs, rent, liquid
                cash and the reserve you want to protect.
              </li>
              <li>
                Replace the example tranches with the builder’s actual schedule,
                keeping loan draws separate from your own contributions.
              </li>
              <li>
                Compare all three strategies, then try a possession delay, rate
                rise or income interruption.
              </li>
              <li>
                Download your plan and check the repayment assumptions with your
                lender.
              </li>
            </ol>
            <h3>What the comparison includes</h3>
            <p>
              The cash check extends through the latest of the 12-month-delay
              scenario, your chosen delay and the relevant loan-start date, plus
              11 months. All three strategies use the same date. Lifetime
              interest is shown separately because different repayment starts
              can produce different payoff dates. House value and investment
              returns are not used to declare a “winner”.
            </p>
            <h3>Calculation assumptions</h3>
            <ul>
              {MODEL_ASSUMPTIONS.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <h3>Take these questions to your lender</h3>
            <ul>
              {lenderQuestions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
            <h3>Official references</h3>
            <ul>
              {preEmiSources.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <p>
              The RBI housing-loan FAQ is used for the definition of pre-EMI,
              not its historical tax or fee examples. This is a planning
              estimate; your loan agreement controls repayment rules.
            </p>
          </article>
          <aside className="pe-faq">
            <h2>Your pre-EMI questions</h2>
            {preEmiFaqs.map((f) => (
              <details key={f.question}>
                <summary>{f.question}</summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </aside>
        </div>
        <nav className="pe-related" aria-label="Related calculators">
          <Link href="/tools/home-loan-emi-calculator-india">
            Home-loan EMI →
          </Link>
          <Link href="/tools/emi-calculator-india">Loan EMI →</Link>
          <Link href="/tools/emergency-fund-calculator-india">
            Emergency fund →
          </Link>
        </nav>
        <p className="pe-review-note">
          Built by RupeeKit · Methodology checked 23 September 2026 ·
          Calculation version {MODEL_VERSION} · Educational estimate; verify the
          disbursement schedule and repayment rules with your lender.
        </p>
      </div>
    </section>
  );
}
