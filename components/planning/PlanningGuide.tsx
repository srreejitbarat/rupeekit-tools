'use client';

import { useEffect, useRef, useState } from 'react';
import { primary, secondary, muted } from './PlanningFields';
export type GuideStep = { title: string; text: string };

export default function PlanningGuide({ name, steps }: { name: string; steps: GuideStep[] }) {
  const [step, setStep] = useState<number | null>(null);
  const [invite, setInvite] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const key = `rupeekit:planning-guide:${name}:v1`;
  useEffect(() => {
    try { if (!localStorage.getItem(key)) setInvite(true); } catch { /* Optional preference only. */ }
  }, [key]);
  function remember() { try { localStorage.setItem(key, 'seen'); } catch { /* Calculators work without storage. */ } }
  function close() { remember(); setStep(null); setInvite(false); trigger.current?.focus({ preventScroll: true }); }
  const open = step !== null;
  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    element?.showModal();
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => { element?.close(); document.documentElement.style.overflow = overflow; };
  }, [open]);
  useEffect(() => { if (step !== null) title.current?.focus(); }, [step]);
  return <>
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
      <p className={muted}>{invite ? 'First time here? Take a short, skippable guide.' : 'Need a hand? Reopen the guide whenever you like.'}</p>
      <div className="flex flex-wrap gap-2"><button ref={trigger} type="button" className={secondary} onClick={() => { setInvite(false); setStep(0); }}>Show guide</button>
        {invite && <button type="button" className="px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200" onClick={() => { remember(); setInvite(false); }}>Skip guide</button>}</div>
    </div>
    {step !== null && <dialog ref={dialog} onCancel={e => { e.preventDefault(); close(); }} aria-labelledby={`${name}-guide-title`} aria-describedby={`${name}-guide-text`}
      className="m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl backdrop:bg-slate-950/60 dark:border-slate-600 dark:bg-slate-900 dark:text-white">
      <div className="mb-6 flex items-center justify-between gap-4"><p className="text-xs font-bold uppercase tracking-widest text-teal-800 dark:text-teal-200">Step {step + 1} of {steps.length}</p><button type="button" className="text-sm font-semibold underline underline-offset-4" onClick={close}>Skip guide</button></div>
      <h3 ref={title} tabIndex={-1} id={`${name}-guide-title`} className="text-2xl font-bold outline-none">{steps[step].title}</h3>
      <p id={`${name}-guide-text`} className={`mt-4 ${muted}`}>{steps[step].text}</p>
      <div className="mt-8 flex justify-between gap-4"><button type="button" className={secondary} disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
        <button type="button" className={primary} onClick={() => step === steps.length - 1 ? close() : setStep(step + 1)}>{step === steps.length - 1 ? 'Start planning' : 'Next'}</button></div>
    </dialog>}
  </>;
}
