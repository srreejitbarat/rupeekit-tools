"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type InputTab = "loan" | "cash" | "schedule";
type Step = {
  label: string;
  title: string;
  description: string;
  tip: string;
  target: string;
  tab?: InputTab;
};
const SEEN_KEY = "rupeekit:pre-emi:tour:v1";
const PLAN_KEY = "rupeekit:pre-emi:plan:v1";
const steps: Step[] = [
  {
    label: "Home & loan",
    title: "Start with your loan and dates.",
    description: "Enter your sanctioned loan, interest rate and repayment tenure. Set your expected possession month and the month full EMI starts separately.",
    tip: "Month 1 means the first month of your plan. Possession and full EMI can start at different times.",
    target: "pe-tour-inputs",
    tab: "loan",
  },
  {
    label: "Your cash",
    title: "Give your cash a safety margin.",
    description: "Add household take-home income, living expenses, rent and other EMIs. Then enter accessible savings, your protected reserve and your move-in budget.",
    tip: "Keep rent and EMIs out of living expenses so they are not counted twice.",
    target: "pe-tour-inputs",
    tab: "cash",
  },
  {
    label: "Builder stages",
    title: "Map out the builder payments.",
    description: "A tranche is one portion of the bank loan paid out to the builder. Add its month, percentage of the loan and any separate contribution from your own cash.",
    tip: "Loan percentages must total 100%. Presets replace the stages and clear own-cash entries.",
    target: "pe-tour-inputs",
    tab: "schedule",
  },
  {
    label: "Compare strategies",
    title: "Compare interest and cash pressure.",
    description: "Choose pre-EMI first, EMI on the drawn loan, or EMI on the full sanction. Watch the reserve warning above, then explore the cash chart and same-date comparison below.",
    tip: "Lower interest can mean less cash available today. Check both cash and remaining debt, and confirm the options with your lender.",
    target: "pe-tour-strategies",
  },
  {
    label: "Possession delays",
    title: "What if the keys arrive late?",
    description: "Compare on-time possession with a six- or twelve-month delay. The planner shows extra rent and the effect on your cash reserve.",
    tip: "By default, only possession moves. Extra payments & stress settings can move future construction stages too.",
    target: "pe-tour-delays",
  },
  {
    label: "Stress tests",
    title: "Try a tougher month before it happens.",
    description: "Test a one-percentage-point rate rise or three months without income. You can combine them with a possession delay and see how your buffer changes.",
    tip: "Use Extra payments & stress settings in the input panel to change the timing or add optional prepayments.",
    target: "pe-tour-stress",
  },
  {
    label: "Save & download",
    title: "Take the plan to your next conversation.",
    description: "Download the comparison as a PDF, get the full monthly schedule as CSV, or save a plan file to return to later. Browser saving happens only when you choose it.",
    tip: "PDF generation sends your inputs to RupeeKit for this request. CSV and plan-file exports stay in your browser.",
    target: "pe-tour-exports",
  },
];
type Position = {
  left: number;
  top: number;
  spotlight?: { left: number; top: number; width: number; height: number };
  missingTarget: boolean;
};

function rememberTour() {
  try {
    localStorage.setItem(SEEN_KEY, "seen");
  } catch {
    // Storage is optional; this flag contains no financial inputs.
  }
}

export default function PlannerTour({ activeTab, onSelectTab }: {
  activeTab: InputTab;
  onSelectTab: (tab: InputTab) => void;
}) {
  // -1 is the invitation; null leaves the calculator unobstructed.
  const [step, setStep] = useState<number | null>(null);
  const [invitation, setInvitation] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const autoAttempted = useRef(false);
  const dismissFrame = useRef(0);
  const entry = useRef({ tab: activeTab, x: 0, y: 0 });
  const returnFocus = useRef<HTMLElement | null>(null);
  const isOpen = step !== null;
  const current = step !== null && step >= 0 ? steps[step] : null;

  const begin = useCallback((firstStep = -1) => {
    window.cancelAnimationFrame(dismissFrame.current);
    autoAttempted.current = true;
    entry.current = { tab: activeTab, x: window.scrollX, y: window.scrollY };
    returnFocus.current = document.activeElement as HTMLElement | null;
    setInvitation(false);
    setPosition(null);
    setStep(firstStep);
  }, [activeTab]);

  useEffect(() => () => window.cancelAnimationFrame(dismissFrame.current), []);

  // Show the invitation when the planner is visible, never over active input.
  useEffect(() => {
    if (autoAttempted.current || typeof IntersectionObserver === "undefined") return;
    try {
      if (localStorage.getItem(SEEN_KEY) || localStorage.getItem(PLAN_KEY)) return;
    } catch {
      return; // Without persistence, avoid repeatedly prompting on every visit.
    }
    const trigger = triggerRef.current;
    const workspace = trigger?.closest(".pe-workspace");
    if (!trigger || !workspace) return;
    let timer: number | undefined;
    const cancel = () => {
      autoAttempted.current = true;
      window.clearTimeout(timer);
      observer.disconnect();
    };
    const observer = new IntersectionObserver(([visible]) => {
      window.clearTimeout(timer);
      if (!visible.isIntersecting) return;
      timer = window.setTimeout(() => {
        if (autoAttempted.current || document.visibilityState === "hidden") return;
        const focused = document.activeElement;
        if (focused && workspace.contains(focused)) return;
        autoAttempted.current = true;
        setInvitation(true);
        observer.disconnect();
      }, 650);
    }, { threshold: 1 });
    observer.observe(trigger);
    workspace.addEventListener("pointerdown", cancel, { once: true });
    workspace.addEventListener("keydown", cancel, { once: true });
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      workspace.removeEventListener("pointerdown", cancel);
      workspace.removeEventListener("keydown", cancel);
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;
    const previousOverflow = document.documentElement.style.overflow;
    dialog.showModal();
    document.documentElement.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Native modal behavior contains focus. Highlight the real page section
  // without making the background inputs interactive while the tour is open.
  useEffect(() => {
    if (step === null) return;
    const targetId = step >= 0 ? steps[step].target : null;
    let frame = 0;
    const measure = () => {
      const card = cardRef.current;
      if (!card) return;
      const width = document.documentElement.clientWidth || window.innerWidth;
      const height = window.visualViewport?.height || window.innerHeight;
      const cardRect = card.getBoundingClientRect();
      const target = targetId ? document.getElementById(targetId) : null;
      const rect = target?.getBoundingClientRect();
      let left = Math.max(16, (width - cardRect.width) / 2);
      let top = Math.max(16, (height - cardRect.height) / 2);
      let spotlight: Position["spotlight"];
      if (rect && rect.width > 0 && rect.height > 0) {
        const rightFits = rect.right + cardRect.width + 40 <= width;
        const leftFits = rect.left - cardRect.width - 24 >= 16;
        const beside = width >= 900 && (rightFits || leftFits);
        if (beside) {
          left = rightFits ? rect.right + 24 : rect.left - cardRect.width - 24;
          top = Math.max(16, Math.min(rect.top, height - cardRect.height - 16));
        } else {
          top = Math.max(16, height - cardRect.height - 16);
        }
        const spotLeft = Math.max(8, rect.left - 5);
        const spotTop = Math.max(8, rect.top - 5);
        const spotRight = Math.min(width - 8, rect.right + 5);
        const spotBottom = Math.min(height - 8, rect.bottom + 5, beside ? height : top - 16);
        if (spotBottom - spotTop > 24 && spotRight > spotLeft) {
          spotlight = { left: spotLeft, top: spotTop, width: spotRight - spotLeft, height: spotBottom - spotTop };
        }
      }
      setPosition({ left, top, spotlight, missingTarget: Boolean(targetId && !target) });
    };
    const queueMeasure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measure);
    };
    const initialFrame = window.requestAnimationFrame(() => {
      if (targetId) {
        const target = document.getElementById(targetId);
        if (targetId === "pe-tour-inputs" && target) target.scrollTop = 0;
        target?.scrollIntoView({ block: "start", behavior: "instant" });
      }
      titleRef.current?.focus({ preventScroll: true });
      measure();
    });
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(queueMeasure) : null;
    if (cardRef.current) observer?.observe(cardRef.current);
    window.addEventListener("resize", queueMeasure);
    window.visualViewport?.addEventListener("resize", queueMeasure);
    document.addEventListener("scroll", queueMeasure, true);
    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", queueMeasure);
      window.visualViewport?.removeEventListener("resize", queueMeasure);
      document.removeEventListener("scroll", queueMeasure, true);
    };
  }, [step, activeTab]);

  const dismiss = (finished = false) => {
    rememberTour();
    setStep(null);
    setPosition(null);
    onSelectTab(finished ? "loan" : entry.current.tab);
    dismissFrame.current = window.requestAnimationFrame(() => {
      if (finished) {
        const input = document.getElementById("pe-loanAmount");
        document.getElementById("pe-tour-inputs")?.scrollTo({ top: 0, behavior: "instant" });
        input?.focus({ preventScroll: true });
        input?.scrollIntoView({ block: "center", behavior: "instant" });
      } else {
        const previous = returnFocus.current;
        const target = previous?.isConnected && previous !== document.body ? previous : triggerRef.current;
        target?.focus({ preventScroll: true });
        window.scrollTo({ left: entry.current.x, top: entry.current.y, behavior: "instant" });
      }
    });
  };
  const go = (index: number) => {
    const next = steps[index];
    if (next?.tab) onSelectTab(next.tab);
    setStep(index);
  };

  return (
    <>
      <button type="button" className="pe-tour-trigger" ref={triggerRef} onClick={() => begin()} aria-haspopup="dialog">
        <span aria-hidden="true">?</span> Quick tour
      </button>
      {invitation && <aside className="pe-tour-invite" aria-label="First-visit tour invitation">
        <strong>New to pre-EMI?</strong>
        <p>Take a quick, step-by-step tour of your home plan.</p>
        <div>
          <button type="button" className="pe-tour-skip" onClick={() => {
            rememberTour();
            setInvitation(false);
            triggerRef.current?.focus({ preventScroll: true });
          }}>Skip tour</button>
          <button type="button" className="pe-button" onClick={() => { onSelectTab("loan"); begin(0); }}>Start tour <span aria-hidden="true">→</span></button>
        </div>
      </aside>}
      <dialog ref={dialogRef} className="pe-tour-dialog" aria-labelledby="pe-tour-title" aria-describedby="pe-tour-description"
        onCancel={(event) => { event.preventDefault(); dismiss(); }}>
        {isOpen && <>
          {position?.spotlight
            ? <div className="pe-tour-spotlight" style={position.spotlight} aria-hidden="true" />
            : <div className="pe-tour-shade" aria-hidden="true" />}
          <div ref={cardRef} className={`pe-tour-card ${current ? "" : "pe-tour-welcome"}`} style={position ? { left: position.left, top: position.top, transform: "none" } : undefined}>
            <div className="pe-tour-topline">
              <span>{current ? `STEP ${(step ?? 0) + 1} OF ${steps.length} · ${current.label.toUpperCase()}` : "WELCOME TO YOUR HOME PLAN"}</span>
              <button type="button" onClick={() => dismiss()} className="pe-tour-close" aria-label="Close tour">×</button>
            </div>
            <div className="pe-tour-body">
              {!current && <div className="pe-tour-illustration" aria-hidden="true">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                  <path d="M9 29 30 11l21 18v23H9Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M24 52V36h12v16M39 17v-6h6v11" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
                  <circle cx="48" cy="44" r="11" fill="#35813b" stroke="#fff" strokeWidth="3" />
                  <path d="m43 44 3.5 3.5L53 41" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>7 short steps<br /><strong>Your pace. Your plan.</strong></span>
              </div>}
              <h2 ref={titleRef} id="pe-tour-title" tabIndex={-1}>
                {current ? <><span className="sr-only">Step {(step ?? 0) + 1} of {steps.length}. </span>{current.title}</> : "A little guidance. A clearer plan."}
              </h2>
              <p id="pe-tour-description">{current?.description || "New to pre-EMI? Let’s walk through the planner, from your first loan details to the cash you want to protect. Skip whenever you like."}</p>
              {current
                ? <div className="pe-tour-tip"><strong>Good to know</strong><p>{current.tip}</p></div>
                : <ol className="pe-tour-route" aria-label="Tour overview">
                    <li><span>01</span> Add your numbers</li>
                    <li><span>02</span> Explore the what-ifs</li>
                    <li><span>03</span> Take your plan with you</li>
                  </ol>}
              {position?.missingTarget && <p className="pe-tour-unavailable">This section appears once your inputs are valid. Finish or skip the tour to fix the input warning.</p>}
            </div>
            <div className="pe-tour-footer">
              {current && <div className="pe-tour-progress" aria-hidden="true">{steps.map((s, i) => <span key={s.label} className={i <= (step ?? 0) ? "is-done" : ""} />)}</div>}
              <div className="pe-tour-actions">
                <button type="button" className="pe-tour-skip" onClick={() => dismiss()}>Skip tour</button>
                <div>
                  {current && <button type="button" className="pe-tour-back" onClick={() => go((step ?? 0) - 1)}>Back</button>}
                  <button type="button" className="pe-button" onClick={() => step === steps.length - 1 ? dismiss(true) : go((step ?? -1) + 1)}>
                    {!current ? "Show me around" : step === steps.length - 1 ? "Finish tour" : "Next"}<span aria-hidden="true"> →</span>
                  </button>
                </div>
              </div>
              <p className="pe-tour-reassurance">{current ? "Your inputs stay as they are." : "You can reopen this anytime with Quick tour."}</p>
            </div>
          </div>
        </>}
      </dialog>
    </>
  );
}
