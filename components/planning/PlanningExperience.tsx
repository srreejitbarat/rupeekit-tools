'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import CalculatorAnalyticsBoundary from '@/components/CalculatorAnalyticsBoundary';
import { primary, secondary } from './PlanningFields';

const loading = () => <p className="p-6 text-sm" role="status">Loading your planner…</p>;
const HomeLoanPlanner = dynamic(() => import('./HomeLoanPlanner'), { loading });
const SipGoalsPlanner = dynamic(() => import('./SipGoalsPlanner'), { loading });
const SalaryCashPlanner = dynamic(() => import('./SalaryCashPlanner'), { loading });

export const PLANNING_TOOLS = {
  'home-loan-emi-calculator-india': { mode: 'Repayment planner', title: 'Find a home-loan plan that fits your life', description: 'Compare keeping, prepaying, repricing and transferring against your monthly limit, debt-free date and protected savings.', features: ['Three limits checked together', 'Income-loss and rate-rise tests', 'Same-date cost and cash comparison'] },
  'sip-calculator-india': { mode: 'Multiple-goal planner', title: 'Make one SIP budget work across your goals', description: 'Allocate a shared budget across up to five goals. See the shortfalls, then test a bigger budget, later deadlines or smaller targets.', features: ['Balanced or priority allocation', 'Inflation and lower-return scenarios', 'Budget, deadline and target adjustments'] },
  'salary-in-hand-calculator-india': { mode: 'Salary cash planner', title: 'Compare job offers by the cash you can actually use', description: 'Build a 12-month calendar with bonus dates, delayed first pay, switching costs and repayment exposure. Solve for the fixed CTC behind your target take-home.', features: ['Dated cash and bonus calendar', 'Joining-bonus repayment exposure', 'Fixed-pay target solver'] },
} as const;
export type PlanningSlug = keyof typeof PLANNING_TOOLS;

export default function PlanningExperience({ slug, category, quick }: { slug: PlanningSlug; category: string; quick: ReactNode }) {
  const config = PLANNING_TOOLS[slug];
  const [active, setActive] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  function choose(next: boolean) { setActive(next); if (next) setLoaded(true); }
  return <div className="space-y-5 text-slate-800 dark:text-slate-100">
    <div role="tablist" aria-label="Calculator experience" className="flex flex-wrap gap-3" onKeyDown={e => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault(); const next = e.key === 'Home' ? false : e.key === 'End' ? true : !active; choose(next); buttons.current[next ? 1 : 0]?.focus();
    }}>
      {[false, true].map((value, i) => <button key={i} ref={el => { buttons.current[i] = el; }} type="button" role="tab" id={`${id}-tab-${i}`} aria-controls={`${id}-panel-${i}`} aria-selected={active === value} tabIndex={active === value ? 0 : -1} className={active === value ? primary : secondary} onClick={() => choose(value)}>{value ? config.mode : 'Quick calculator'}</button>)}
    </div>
    <div role="tabpanel" id={`${id}-panel-0`} aria-labelledby={`${id}-tab-0`} hidden={active}><CalculatorAnalyticsBoundary toolSlug={slug} toolCategory={category}>{quick}</CalculatorAnalyticsBoundary></div>
    {loaded && <div role="tabpanel" id={`${id}-panel-1`} aria-labelledby={`${id}-tab-1`} hidden={!active}>
      <CalculatorAnalyticsBoundary toolSlug={slug} toolCategory={category} shareInputs={false}>
        {slug === 'home-loan-emi-calculator-india' ? <HomeLoanPlanner /> : slug === 'sip-calculator-india' ? <SipGoalsPlanner /> : <SalaryCashPlanner />}
      </CalculatorAnalyticsBoundary>
    </div>}
  </div>;
}
