'use client';

import { useState } from 'react';
import Link from 'next/link';
import { indexableGovernmentSalaryUpdates } from '@/data/government-salary-updates';
import UpdateVisual from '@/components/updates/UpdateVisual';

const STATES_LIST = [
  'All India',
  'Central Government',
  'West Bengal',
  'Maharashtra',
  'Karnataka',
  'Tamil Nadu',
  'Kerala',
  'Telangana',
  'Andhra Pradesh',
  'Odisha',
  'Bihar',
  'Jharkhand',
  'Uttar Pradesh',
  'Rajasthan',
  'Gujarat',
  'Madhya Pradesh',
  'Punjab',
  'Haryana',
  'Assam',
  'Delhi',
  'Other States'
];

export default function GovernmentSalaryUpdatesPage() {
  const [selectedState, setSelectedState] = useState('All India');

  // Filter updates based on state selection
  const filteredUpdates = indexableGovernmentSalaryUpdates.filter((update) => {
    if (selectedState === 'All India') {
      return true;
    }
    return update.state.toLowerCase() === selectedState.toLowerCase();
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12 space-y-12 md:space-y-16">
      {/* Hero Section */}
      <section className="rounded-3xl bg-gradient-to-br from-brandDeepNavy via-brandNavy to-slate-900 px-6 py-10 md:px-12 md:py-12 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative background accent */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-brandGrowthGreen/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-brandNavy/40 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white ring-1 ring-white/20 mb-4">
            Educational Tracker
          </span>
          <h1 className="text-3xl font-black tracking-tight leading-tight md:text-5xl text-white">
            State-wise Government Employee Updates
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-200 md:text-base">
            Track state-wise DA, DR, pay revision, arrears, pension, and official salary communication updates in a simple educational format. Learn how adjustments are calculated and where to verify official circulars.
          </p>
        </div>
      </section>

      {/* State Filter Chips Section — id for deep-linking from /updates and /resources */}
      <section id="state-wise" className="space-y-4 scroll-mt-24">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-brandDeepNavy">Filter Updates by State</h2>
          <p className="text-xs text-brandMuted mt-1">Select a state to view verified educational update summaries.</p>
        </div>

        <div className="flex flex-wrap gap-2 py-2">
          {STATES_LIST.map((state) => {
            const isActive = selectedState === state;
            return (
              <button
                key={state}
                onClick={() => setSelectedState(state)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition duration-150 ${
                  isActive
                    ? 'bg-brandNavy border-brandNavy text-white shadow-sm'
                    : 'bg-white border-brandBorder text-brandText hover:bg-brandBgSoft hover:border-brandNavy/30'
                }`}
              >
                {state}
              </button>
            );
          })}
        </div>
      </section>

      {/* Updates Cards List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-brandBorder pb-4">
          <h3 className="text-lg font-black text-brandDeepNavy">
            Updates Matrix ({filteredUpdates.length})
          </h3>
          <span className="text-xs font-semibold text-brandMuted">
            Showing updates for: <strong className="text-brandNavy">{selectedState}</strong>
          </span>
        </div>

        {filteredUpdates.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredUpdates.map((update) => {
              // Map category to visual type
              const visualTypeMap: Record<string, 'da-dr' | 'pay-commission' | 'pension' | 'government-salary'> = {
                'DA Update': 'da-dr',
                'Pay Revision': 'pay-commission',
                'Pension': 'pension',
                'Allowances': 'government-salary',
                'Arrears': 'da-dr',
                'Circular': 'pay-commission',
              };
              const visualType = visualTypeMap[update.category] ?? 'government-salary';
              return (
              <div
                key={update.id}
                className="flex flex-col justify-between rounded-3xl border border-brandBorder bg-white shadow-sm hover:shadow-md transition duration-300 relative overflow-hidden"
              >
                {/* Visual thumbnail header */}
                <div className="bg-gradient-to-br from-brandDeepNavy to-slate-900 px-5 pt-4 pb-3 flex items-center gap-3">
                  <UpdateVisual type={visualType} size="sm" />
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-brandNavy/80 border border-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      {update.category}
                    </span>
                    <span className="rounded-full bg-white/10 border border-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/70">
                      Educational Summary
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col gap-3">
                  {/* Badges row */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="rounded-full bg-brandNavy/10 border border-brandNavy/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brandNavy">
                      {update.state}
                    </span>
                    <span className="text-[10px] font-semibold text-brandMuted">
                      {update.employeeGroup}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-bold tracking-tight text-brandDeepNavy line-clamp-2 leading-snug">
                    {update.title}
                  </h4>

                  {/* Meta: source + effective date */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-brandMuted">
                    <span className="truncate max-w-[180px]">{update.sourceName}</span>
                    {update.effectiveDate && (
                      <>
                        <span>·</span>
                        <span>Effective: {update.effectiveDate}</span>
                      </>
                    )}
                  </div>

                  {/* Summary */}
                  <p className="text-xs leading-relaxed text-slate-600 line-clamp-3">
                    {update.summary}
                  </p>

                  {/* Verify one-liner */}
                  <div className="rounded-xl bg-green-50 border border-green-100 px-3 py-2">
                    <p className="text-[11px] font-semibold text-green-800 line-clamp-2">
                      <span className="font-bold">Verify: </span>{update.actionToVerify.split('.')[0]}.
                    </p>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-brandBorder">
                    <Link
                      href={`/government-salary-updates/${update.slug}`}
                      className="rounded-full bg-brandNavy px-4 py-1.5 text-xs font-bold text-white hover:bg-brandDeepNavy transition"
                    >
                      Read update →
                    </Link>
                    <span className="text-[10px] text-brandMuted italic">Verify from official source</span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-brandBorder bg-white p-8 text-center max-w-lg mx-auto space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brandNavy/5 text-brandNavy mx-auto">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-base font-bold text-brandDeepNavy">No verified updates for {selectedState}</h4>
            <p className="text-xs text-brandMuted">
              New summaries will appear here only after the source and effective date have been checked against an official government publication.
            </p>
          </div>
        )}
      </section>

      {/* Pension anchor section for deep-linking */}
      <div id="pension" className="scroll-mt-24" />

      {/* Explainer Blocks: Key Terms */}
      <section className="rounded-3xl border border-brandBorder bg-white p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <span className="inline-block rounded-full bg-brandNavy/10 border border-brandNavy/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brandNavy">
            Key Terms Explained
          </span>
          <h2 className="mt-4 text-2xl font-black text-brandDeepNavy md:text-3xl">
            Government Pay: Concepts Explained Simply
          </h2>
          <p className="mt-2 text-sm text-brandMuted">
            Understanding these terms helps you interpret official circulars, pay slips, and government announcements correctly.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl bg-brandBgSoft border border-brandBorder p-5 space-y-2">
            <h3 className="text-sm font-bold text-brandDeepNavy">What is Dearness Allowance (DA)?</h3>
            <p className="text-xs leading-relaxed text-slate-600">
              Dearness Allowance is a cost-of-living adjustment paid to active government employees and public sector workers. It is calculated as a percentage of basic pay and revised biannually (typically January and July) based on the All India Consumer Price Index for Industrial Workers (AICPI-IW). DA compensates employees for inflation erosion of their purchasing power.
            </p>
          </div>
          <div className="rounded-2xl bg-brandBgSoft border border-brandBorder p-5 space-y-2">
            <h3 className="text-sm font-bold text-brandDeepNavy">What is Dearness Relief (DR)?</h3>
            <p className="text-xs leading-relaxed text-slate-600">
              Dearness Relief is the equivalent of Dearness Allowance but paid to retired employees (pensioners) and family pension recipients. It is added to the basic pension amount and revised similarly to DA for active employees. DR ensures retirees&apos; fixed pension income maintains some purchasing power against rising prices.
            </p>
          </div>
          <div className="rounded-2xl bg-brandBgSoft border border-brandBorder p-5 space-y-2">
            <h3 className="text-sm font-bold text-brandDeepNavy">What is a Pay Commission?</h3>
            <p className="text-xs leading-relaxed text-slate-600">
              A Pay Commission is a government-appointed body that reviews and recommends revisions to the salary structure of central or state government employees. Central Pay Commissions (e.g., 7th CPC) are set up roughly every 10 years and their recommendations, once accepted by the Cabinet, reshape basic pay, grade pay, allowances, and retirement benefits for millions of employees.
            </p>
          </div>
          <div className="rounded-2xl bg-brandBgSoft border border-brandBorder p-5 space-y-2">
            <h3 className="text-sm font-bold text-brandDeepNavy">What is a Pay Matrix?</h3>
            <p className="text-xs leading-relaxed text-slate-600">
              A Pay Matrix is a structured table introduced by the 7th Pay Commission that determines basic pay for government employees based on their Level (job grade) and Cell (incremental step within that grade). It replaced the earlier Grade Pay + Basic Pay system with a single consolidated Pay Level system that is simpler to understand and apply for salary fixation.
            </p>
          </div>
          <div className="rounded-2xl bg-brandBgSoft border border-brandBorder p-5 space-y-2 md:col-span-2">
            <h3 className="text-sm font-bold text-brandDeepNavy">Announcement vs Order vs Effective Date vs Payment Date</h3>
            <div className="grid gap-3 sm:grid-cols-2 mt-2">
              <div>
                <p className="text-[11px] font-bold text-brandNavy uppercase tracking-wide">Announcement Date</p>
                <p className="text-xs leading-relaxed text-slate-600 mt-1">The date when the Cabinet or government publicly announces a revision (e.g., press release, media briefing). This is not legally binding until an official order is issued.</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-brandNavy uppercase tracking-wide">Official Order Date</p>
                <p className="text-xs leading-relaxed text-slate-600 mt-1">The date the signed Office Memorandum (OM) or Government Order (GO) is issued by the Finance Department. This is the legally binding document that authorises implementation.</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-brandNavy uppercase tracking-wide">Effective Date</p>
                <p className="text-xs leading-relaxed text-slate-600 mt-1">The date from which the revised rate is applicable for salary or pension calculation — this is often retrospective (e.g., effective from January 1 even if the order is issued in March).</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-brandNavy uppercase tracking-wide">Payment Date</p>
                <p className="text-xs leading-relaxed text-slate-600 mt-1">The actual date when the revised salary or arrears are credited to the employee&apos;s bank account. Payment dates can differ from effective dates due to payroll processing cycles.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guide Section: How to verify state-wise salary updates */}
      <section className="rounded-3xl border border-brandBorder bg-white p-6 md:p-10 shadow-sm space-y-6">
        <div>
          <span className="inline-block rounded-full bg-brandNavy/10 border border-brandNavy/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brandNavy">
            Verification Guide
          </span>
          <h2 className="mt-4 text-2xl font-black text-brandDeepNavy md:text-3xl">
            How to verify state-wise salary updates
          </h2>
          <p className="mt-2 text-sm text-brandMuted">
            Official announcements regarding salary scales, dearness revisions, and pensions follow strict administrative channels. Always follow these verification practices before planning:
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brandNavy/10 text-brandNavy text-xs font-bold">1</div>
              <div>
                <h4 className="text-sm font-bold text-brandDeepNavy">Check the State Finance Department Website</h4>
                <p className="mt-1 text-xs text-brandMuted leading-relaxed">
                  All official revisions (DA order, pay revision resolutions, fitment directives) are issued as government resolutions or office memorandums directly on the state&apos;s official Finance Department portal.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brandNavy/10 text-brandNavy text-xs font-bold">2</div>
              <div>
                <h4 className="text-sm font-bold text-brandDeepNavy">Check Treasury or Payroll Department Notices</h4>
                <p className="mt-1 text-xs text-brandMuted leading-relaxed">
                  The directorate of accounts or state treasuries publish implementing orders showing how the drawing and disbursing officers (DDOs) should apply revised scales to the payroll system.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brandNavy/10 text-brandNavy text-xs font-bold">3</div>
              <div>
                <h4 className="text-sm font-bold text-brandDeepNavy">Check Pension Department Circulars</h4>
                <p className="mt-1 text-xs text-brandMuted leading-relaxed">
                  For Dearness Relief (DR) and pension commuted values, check the specific pension welfare portal or treasury pension branch circulars since disbursement dates can differ from active staff.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brandNavy/10 text-brandNavy text-xs font-bold">4</div>
              <div>
                <h4 className="text-sm font-bold text-brandDeepNavy">Verify Department-Specific Directives</h4>
                <p className="mt-1 text-xs text-brandMuted leading-relaxed">
                  Certain sectors (e.g., school education, police forces, health departments, municipal corporations, public sector undertakings) publish separate internal circulars adapting the general finance orders.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brandNavy/10 text-brandNavy text-xs font-bold">5</div>
              <div>
                <h4 className="text-sm font-bold text-brandDeepNavy">Confirm Dates and Implementation Limits</h4>
                <p className="mt-1 text-xs text-brandMuted leading-relaxed">
                  Verify the exact effective date (when calculations start accumulating), the payment implementation date (when it hits the bank account), and the split format for accumulated arrears (e.g., quarter deposits to provident funds).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brandNavy/10 text-brandNavy text-xs font-bold">6</div>
              <div>
                <h4 className="text-sm font-bold text-brandDeepNavy">Avoid Social Media Unverified Forwards</h4>
                <p className="mt-1 text-xs text-brandMuted leading-relaxed">
                  Do not rely on text messages or third-party screenshots. Fake circulars are common. Ensure you cross-reference with official circular numbers on governmental domains ending in &apos;.gov.in&apos; or &apos;.nic.in&apos;.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Source Checklist Section */}
      <section className="rounded-3xl border border-brandBorder bg-brandBgSoft p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brandNavy/10 text-brandNavy">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-brandDeepNavy">Before acting on any state salary update, verify:</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <div className="flex items-center gap-3 bg-white border border-brandBorder rounded-2xl p-4 shadow-sm">
            <div className="rounded-full bg-emerald-50 border border-emerald-100 p-1 text-brandGrowthGreen">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs font-bold text-brandDeepNavy">Official Source Portal</span>
          </div>

          <div className="flex items-center gap-3 bg-white border border-brandBorder rounded-2xl p-4 shadow-sm">
            <div className="rounded-full bg-emerald-50 border border-emerald-100 p-1 text-brandGrowthGreen">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs font-bold text-brandDeepNavy">Circular / Order Number</span>
          </div>

          <div className="flex items-center gap-3 bg-white border border-brandBorder rounded-2xl p-4 shadow-sm">
            <div className="rounded-full bg-emerald-50 border border-emerald-100 p-1 text-brandGrowthGreen">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs font-bold text-brandDeepNavy">Effective Date</span>
          </div>

          <div className="flex items-center gap-3 bg-white border border-brandBorder rounded-2xl p-4 shadow-sm">
            <div className="rounded-full bg-emerald-50 border border-emerald-100 p-1 text-brandGrowthGreen">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs font-bold text-brandDeepNavy">Eligible Employee Group</span>
          </div>

          <div className="flex items-center gap-3 bg-white border border-brandBorder rounded-2xl p-4 shadow-sm">
            <div className="rounded-full bg-emerald-50 border border-emerald-100 p-1 text-brandGrowthGreen">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs font-bold text-brandDeepNavy">Arrears / Payment Timeline</span>
          </div>

          <div className="flex items-center gap-3 bg-white border border-brandBorder rounded-2xl p-4 shadow-sm">
            <div className="rounded-full bg-emerald-50 border border-emerald-100 p-1 text-brandGrowthGreen">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs font-bold text-brandDeepNavy">Approval vs Announcement Status</span>
          </div>
        </div>
      </section>

      {/* Educational Disclaimer Section */}
      <section className="rounded-2xl border border-brandBorder bg-white p-6 text-xs leading-relaxed text-brandMuted shadow-sm">
        <p className="font-bold text-brandDeepNavy mb-2 text-sm">Educational Disclaimer</p>
        <p>
          State-wise government salary updates on RupeeKit are for general educational information only. Always verify rules, rates, eligibility, effective dates, arrears, and circulars from official state or central government sources.
        </p>
      </section>
    </div>
  );
}
