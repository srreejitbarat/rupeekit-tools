'use client';

import { useMemo, useRef, useState } from 'react';
import { SIP_GOALS_EXAMPLE, extendGoalDates, planSipGoals, type SipGoal, type SipGoalsInput } from '@/lib/planning/sip-goals';
import { money, monthAt, monthIndex, monthLabel } from '@/lib/planning/common';
import { SIP_ASSUMPTIONS, sipReport } from '@/lib/planning/reports';
import PlanningGuide from './PlanningGuide';
import PlanDownloads from './PlanDownloads';
import { DataTable, Errors, Field, Grid, Note, PlanChart, Select, Stat, Step, UpdatePlan, muted, numeric, panel, secondary, usePlanForm } from './PlanningFields';

const guide = [
  { title: 'Give every goal a place', text: 'Set one monthly investment budget, then add up to five goals. Each goal has its own target, date and dedicated savings.' },
  { title: 'Choose what the target means', text: 'Today’s cost grows with your inflation assumption. A future target is the amount you want at the deadline. Returns are hypothetical and can be negative.' },
  { title: 'Decide how to share the budget', text: 'Balanced allocation shares money according to each goal’s remaining SIP need. Priority allocation funds goals in the displayed order. Reorder goals to express your priorities.' },
  { title: 'Choose the trade-off you can live with', text: 'Update the plan to see shortfalls. Try a larger monthly budget, later deadlines, or affordable target amounts. Check the lower-return test and download your plan.' },
];
export default function SipGoalsPlanner() {
  const p = usePlanForm(SIP_GOALS_EXAMPLE, planSipGoals);
  const { draft: d, committed: c, result: r } = p;
  const nextId = useRef(4);
  const [selected, setSelected] = useState('home');
  const [year, setYear] = useState('0');
  const report = useMemo(() => sipReport(c, r), [c, r]);
  function goalSet<K extends keyof SipGoal>(id: string, key: K, value: SipGoal[K]) { p.set('goals', d.goals.map(g => g.id === id ? { ...g, [key]: value } : g)); }
  function move(index: number, direction: number) { const goals = [...d.goals]; [goals[index], goals[index + direction]] = [goals[index + direction], goals[index]]; p.set('goals', goals); }
  const goal = r.goals.find(g => g.id === selected) ?? r.goals[0];
  const page = Math.min(Number(year), Math.max(0, Math.ceil((goal?.months ?? 1) / 12) - 1));
  return <div className="space-y-5">
    <PlanningGuide name="sip-goals" steps={guide} />
    <p className={muted}>The example uses one shared budget. Replace the goals and assumptions with yours; projected returns are not guaranteed.</p>
    <form onSubmit={p.submit} noValidate className="space-y-5">
      <Step number={1} title="One budget, several goals">
        <Grid><Field label="Monthly investment budget (₹)" value={d.monthlyBudget} onChange={v => p.set('monthlyBudget', numeric(v))} />
          <Field label="Plan starts" type="month" value={d.startMonth} onChange={v => p.set('startMonth', v)} />
          <Field label="Annual return assumption (%)" value={d.annualReturn} min={-20} max={30} onChange={v => p.set('annualReturn', numeric(v))} hint="A scenario input, not a promised fund return." />
          <Select label="My target amounts represent" value={d.targetBasis} onChange={v => p.set('targetBasis', v as SipGoalsInput['targetBasis'])} options={[['today', 'Today’s cost · adjust for inflation'], ['future', 'Future amount · use as entered']]} />
          {d.targetBasis === 'today' && <Field label="Annual inflation assumption (%)" value={d.inflation} max={15} onChange={v => p.set('inflation', numeric(v))} />}
          <Select label="How to share the budget" value={d.allocation} onChange={v => p.set('allocation', v as SipGoalsInput['allocation'])} options={[['balanced', 'Balanced · share by SIP need'], ['priority', 'Priority · fund in the order below']]} />
        </Grid>
      </Step>
      <Step number={2} title="Your goals" description="Dedicated savings belong to one goal. Avoid entering the same savings more than once.">
        <div className="space-y-4">{d.goals.map((g, i) => <fieldset key={g.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"><legend className="px-2 text-sm font-bold text-teal-900 dark:text-teal-200">Goal {i + 1}{d.allocation === 'priority' ? ` · priority ${i + 1}` : ''}</legend>
          <Grid><Field label={`Goal ${i + 1} name`} type="text" value={g.name} onChange={v => goalSet(g.id, 'name', v)} />
            <Field label={`Goal ${i + 1} target (₹)`} value={g.target} onChange={v => goalSet(g.id, 'target', numeric(v))} />
            <Field label={`Goal ${i + 1} deadline`} type="month" value={g.deadline} onChange={v => goalSet(g.id, 'deadline', v)} />
            <Field label={`Goal ${i + 1} dedicated savings (₹)`} value={g.savings} onChange={v => goalSet(g.id, 'savings', numeric(v))} />
          </Grid>
          <div className="mt-3 flex flex-wrap gap-2"><button type="button" className={secondary} disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move goal ${i + 1} up`}>Move up</button>
            <button type="button" className={secondary} disabled={i === d.goals.length - 1} onClick={() => move(i, 1)} aria-label={`Move goal ${i + 1} down`}>Move down</button>
            <button type="button" className={secondary} disabled={d.goals.length === 1} onClick={() => p.set('goals', d.goals.filter(item => item.id !== g.id))} aria-label={`Remove goal ${i + 1}`}>Remove</button></div>
        </fieldset>)}</div>
        <button type="button" className={`mt-4 ${secondary}`} disabled={d.goals.length >= 5} onClick={() => p.set('goals', [...d.goals, { id: `goal-${nextId.current++}`, name: 'New goal', target: 500_000, savings: 0, deadline: monthAt(Number.isFinite(monthIndex(d.startMonth)) ? d.startMonth : SIP_GOALS_EXAMPLE.startMonth, 59) }])}>Add a goal ({d.goals.length}/5)</button>
      </Step>
      <UpdatePlan dirty={p.dirty} />
    </form>
    <div ref={p.resultsRef} tabIndex={-1} aria-label="Estimated results" className="space-y-5 outline-none">
      <Errors errors={r.errors} />
      {!r.errors.length && goal && <>
        {p.dirty && <Note warning>These results use the previous inputs. Update the plan to test your changes.</Note>}
        <div className={panel}><p className="text-xs font-bold uppercase tracking-widest text-teal-800 dark:text-teal-200">Your goals, together</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{r.fits ? 'Your budget funds every goal in this scenario' : `${r.goals.filter(g => g.gap > 0.01).length} of ${r.goals.length} goals need an adjustment`}</h3>
          <p className={`mt-3 ${muted}`}>Using {money(c.monthlyBudget)} per month, {c.annualReturn}% assumed annual return and {c.allocation} allocation. Goals stop receiving money at their deadlines; unused budget stays outside this investment projection.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">{r.goals.map(g => <div key={g.id} className={panel}><div className="flex flex-wrap items-start justify-between gap-2"><h4 className="font-bold text-slate-900 dark:text-white">{g.name}</h4><span className="text-xs text-slate-600 dark:text-slate-300">{monthLabel(g.deadline)}</span></div>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{Math.min(g.coverage, 999).toFixed(1)}% <span className="text-sm font-normal">of target</span></p>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" role="progressbar" aria-label={`${g.name} target coverage`} aria-valuenow={Math.min(100, Math.max(0, g.coverage))} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-teal-700 dark:bg-teal-300" style={{ width: `${Math.min(100, Math.max(0, g.coverage))}%` }} /></div>
          <dl className="mt-4 space-y-2 text-sm"><div className="flex justify-between gap-3"><dt>Projected at deadline</dt><dd className="font-semibold">{money(g.projected)}</dd></div><div className="flex justify-between gap-3"><dt>Future target</dt><dd>{money(g.futureTarget)}</dd></div><div className="flex justify-between gap-3"><dt>Shortfall</dt><dd className="font-semibold">{money(g.gap)}</dd></div><div className="flex justify-between gap-3"><dt>First month allocation</dt><dd>{money(g.firstAllocation)}</dd></div></dl>
        </div>)}</div>
        {!r.fits && <div className={panel}><h3 className="text-lg font-bold text-slate-900 dark:text-white">Choose a change to test</h3><p className={`mt-1 ${muted}`}>Each button applies one alternative to the last calculated plan. Update any edited inputs first.</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="space-y-3"><Stat label="Increase monthly budget to" value={money(r.requiredBudget)} detail={`${money(r.extraBudget)} more each month under the selected allocation method.`} /><button type="button" className={secondary} disabled={p.dirty || r.requiredBudget > 10_000_000} onClick={() => p.commit({ ...c, monthlyBudget: r.requiredBudget })}>Try this budget</button></div>
            <div className="space-y-3"><Stat label="Extend all deadlines by" value={r.extensionMonths === null ? 'No fit found' : `${r.extensionMonths} months`} detail={r.extensionMonths === null ? `Searched ${r.extensionSearchMonths} extra months, within the 30-year horizon. Inflation can make later targets harder.` : 'Keeps the monthly budget unchanged; adjusts every goal date equally.'} /><button type="button" className={secondary} disabled={p.dirty || r.extensionMonths === null} onClick={() => { if (r.extensionMonths !== null) p.commit(extendGoalDates(c, r.extensionMonths)); }}>Try later deadlines</button></div>
            <div className="space-y-3"><Stat label="Reduce target amounts" value="Keep budget + dates" detail="Replace each shortfall goal with its projected affordable amount, using your selected target basis. Allocation is recalculated." /><button type="button" className={secondary} disabled={p.dirty || r.goals.some(g => g.affordableToday < 1)} onClick={() => p.commit({ ...c, goals: c.goals.map(g => ({ ...g, target: Math.min(g.target, Math.floor(r.goals.find(row => row.id === g.id)!.affordableToday)) })) })}>Try affordable targets</button></div>
          </div>
        </div>}
        <PlanChart title="How much of the shared budget is invested each month?" dates={r.budgetRows.map(row => monthAt(c.startMonth, row.month - 1))} series={[{ label: 'Invested', values: r.budgetRows.map(row => row.contributed) }]} reference={{ label: 'monthly budget', value: c.monthlyBudget }} />
        <DataTable caption="Goal affordability and lower-return stress test" headers={['Goal', `At ${c.annualReturn}% return`, `At ${c.annualReturn - 4}% return`, 'Future target', c.targetBasis === 'today' ? 'Affordable in today’s money' : 'Affordable future target']}
          rows={r.goals.map(g => [g.name, money(g.projected), money(g.lowerReturnValue), money(g.futureTarget), money(g.affordableToday)])} />
        <p className={muted}>The lower-return test repeats the exact same contributions at a return assumption four percentage points lower. It does not predict the likelihood or size of an actual loss.</p>
        <Select label="Explore a goal" value={goal.id} onChange={setSelected} options={r.goals.map(g => [g.id, g.name])} />
        <PlanChart title={`${goal.name}: invested money and projected value`} dates={goal.rows.map(row => monthAt(c.startMonth, row.month - 1))} series={[{ label: 'Projected value', values: goal.rows.map(row => row.value) }, { label: 'Invested incl. opening savings', values: goal.rows.map(row => row.invested) }]} reference={{ label: 'future target', value: goal.futureTarget }} />
        <details className={panel}><summary className="cursor-pointer font-bold text-slate-900 dark:text-white">Monthly allocations for this goal</summary><div className="mt-4 space-y-4">
          <Select label="Schedule year" value={String(page)} onChange={setYear} options={Array.from({ length: Math.ceil(goal.months / 12) }, (_, i) => [String(i), `Year ${i + 1}`])} />
          <DataTable caption={`${goal.name} monthly allocation`} headers={['Month', 'Contribution', 'Invested incl. savings', 'Projected value']} rows={goal.rows.slice(page * 12, page * 12 + 12).map(row => [monthLabel(monthAt(c.startMonth, row.month - 1)), money(row.contribution), money(row.invested), money(row.value)])} /></div></details>
        <PlanDownloads report={report} disabled={p.dirty} />
      </>}
    </div>
    <details className={panel}><summary className="cursor-pointer font-bold text-slate-900 dark:text-white">How allocation and projections work</summary><ul className={`mt-4 list-disc space-y-3 pl-5 ${muted}`}>{SIP_ASSUMPTIONS.map(a => <li key={a}>{a}</li>)}</ul></details>
  </div>;
}
