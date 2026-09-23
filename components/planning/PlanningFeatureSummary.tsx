const entries: Record<string, { title: string; intro: string; questions: [string, string][] }> = {
  'home-loan-emi-calculator-india': {
    title: 'Plan home-loan repayment around your budget and savings',
    intro: 'Choose Repayment planner above to compare your existing schedule with prepayment, a current-lender repricing quote and a balance transfer. Each option is checked against a monthly payment limit, a debt-free date and a protected cash reserve.',
    questions: [
      ['Can a lower interest rate still be a poor fit?', 'Yes. Upfront fees or a large prepayment can leave too little cash, even when interest falls. The planner compares interest plus fees, remaining debt and available cash on the same date. It identifies the lowest-cost option only among those that satisfy all three entered limits.'],
      ['What happens if income stops or rates rise?', 'Each option includes two separate stress checks: an initial period without household income, and a one-percentage-point rate rise with payments unchanged. The cash test includes living costs and checks the reserve after upfront payments and at each month end.'],
      ['What should I take to the lender?', 'Download the PDF comparison and monthly CSV. They record the inputs, fees, planned payments and assumptions. Confirm whether your lender permits the payment changes and which charges apply; the calculator does not grant approval or supply live lender offers.'],
    ],
  },
  'sip-calculator-india': {
    title: 'Plan several SIP goals with one monthly budget',
    intro: 'Choose Multiple-goal planner above to assign a single investment budget to up to five goals. Give each goal its own deadline, target and dedicated savings, then choose balanced allocation or your own priority order.',
    questions: [
      ['How is the shared SIP budget allocated?', 'Balanced allocation divides the budget in proportion to each active goal’s recalculated monthly contribution need. Priority allocation funds goals in the displayed order. Allocation is recalculated monthly, completed deadlines release budget, and the same money is never assigned to two goals.'],
      ['What if the budget cannot fund every goal?', 'The planner estimates a shared monthly budget that funds the goals under your assumptions. It also searches for an equal extension to all deadlines and shows affordable target amounts. You can apply one change and inspect the recalculated results.'],
      ['How do inflation and investment risk appear?', 'Today-cost targets rise with your inflation assumption; future targets stay as entered. A lower-return test repeats the same contribution schedule at an annual return four percentage points lower. These are hypothetical projections, excluding taxes, fees and actual market fluctuations.'],
    ],
  },
  'salary-in-hand-calculator-india': {
    title: 'Compare salary offers with a twelve-month cash calendar',
    intro: 'Choose Salary cash planner above to compare two salary options using fixed CTC, bonus payment dates, delayed first pay, switching costs and work expenses. It also solves for the fixed CTC behind a desired normal monthly in-hand salary.',
    questions: [
      ['Why can a higher CTC leave less usable cash?', 'Variable pay may arrive later or pay out below target. A job switch may require cash for moving or notice buyout before the first salary arrives. The calendar separates regular salary, bonus receipts, estimated tax and expenses so those timing differences are visible.'],
      ['How is a joining-bonus clawback handled?', 'The full gross joining bonus is shown as possible repayment exposure from its receipt through the entered period after starting the job. A separate chart subtracts that exposure from available cash. Contract-specific prorating and any tax recovery after repayment are excluded.'],
      ['Which salary and tax situations does the planner cover?', 'The model covers resident individuals below 60 with salary-only income and projected annual gross salary up to ₹50 lakh. It uses entered earlier-year income and TDS, and estimates each April-March year separately. The selected tax-rule year remains constant even when the calendar crosses into a future year; actual payroll withholding can differ.'],
    ],
  },
};

export default function PlanningFeatureSummary({ slug }: { slug: string }) {
  const entry = entries[slug];
  if (!entry) return null;
  return <section id="planning-workflows" className="mt-8 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{entry.title}</h2>
    <p className="mt-3 leading-7 text-slate-700 dark:text-slate-200">{entry.intro}</p>
    <div className="mt-5 space-y-5">{entry.questions.map(([question, answer]) => <div key={question}>
      <h3 className="font-bold text-slate-900 dark:text-white">{question}</h3><p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-200">{answer}</p>
    </div>)}</div>
    <p className="mt-5 text-xs leading-6 text-slate-500 dark:text-slate-400">Planning workflow reviewed 23 September 2026. The Quick calculator mode and its examples remain available above. PDF and CSV reports are generated in your browser.</p>
  </section>;
}
