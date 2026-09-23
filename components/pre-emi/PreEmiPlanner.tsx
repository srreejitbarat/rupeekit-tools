"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  comparePlans,
  comparisonHorizon,
  createDefaultPlan,
  MODE_LABELS,
  MODEL_VERSION,
  MODES,
  monthLabel,
  parsePlan,
  simulatePlan,
  toCsv,
  validatePlan,
  type PaymentMode,
  type PlanInput,
  type Tranche,
} from "@/lib/pre-emi/engine";
import { trackAnalyticsEvent } from "@/lib/analytics";
import PlanCharts from "./PlanCharts";
import { compactMoney, money } from "./format";

type NumericKey = {
  [K in keyof PlanInput]: PlanInput[K] extends number ? K : never;
}[keyof PlanInput];
type Tab = "loan" | "cash" | "schedule";
const STORAGE_KEY = "rupeekit:pre-emi:plan:v1";
const analytics = {
  tool_slug: "pre-emi-calculator-india",
  tool_category: "Loans",
};
const modeDescriptions: Record<PaymentMode, string> = {
  "pre-emi": "Interest now. Principal repayment from your EMI start month.",
  "disbursed-emi": "Start repaying principal as each loan tranche arrives.",
  "sanctioned-emi":
    "If allowed, start with full-sanction EMI; later draws can raise it to keep the term.",
};

function downloadFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Field({
  id,
  label,
  value,
  onChange,
  min = 0,
  max = 1000000000,
  step = 1000,
  suffix,
  help,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  help?: string;
}) {
  return (
    <div className="pe-field">
      <label htmlFor={id}>{label}</label>
      <div className="pe-input-wrap">
        <input
          id={id}
          type="number"
          inputMode={step < 1 ? "decimal" : "numeric"}
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) =>
            onChange(e.target.value === "" ? NaN : Number(e.target.value))
          }
          aria-describedby={help ? `${id}-help` : undefined}
        />
        {suffix && <span>{suffix}</span>}
      </div>
      {help && <p id={`${id}-help`}>{help}</p>}
    </div>
  );
}
function Icon({
  kind,
}: {
  kind: "home" | "shield" | "download" | "arrow" | "spark";
}) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === "home" ? (
        <>
          <path d="m3 10 9-7 9 7v10H3Z" />
          <path d="M9 20v-7h6v7" />
        </>
      ) : kind === "shield" ? (
        <>
          <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z" />
          <path d="m8 12 3 3 5-6" />
        </>
      ) : kind === "download" ? (
        <>
          <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
        </>
      ) : kind === "spark" ? (
        <>
          <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" />
        </>
      ) : (
        <path d="M4 12h16m-6-6 6 6-6 6" />
      )}
    </svg>
  );
}

export default function PreEmiPlanner({
  initialMonth,
}: {
  initialMonth: string;
}) {
  const [input, setInput] = useState<PlanInput>(() =>
    createDefaultPlan(initialMonth),
  );
  const [mode, setMode] = useState<PaymentMode>("pre-emi");
  const [tab, setTab] = useState<Tab>("loan");
  const [status, setStatus] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const interacted = useRef(false);
  const calculations = useRef(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const errors = useMemo(() => validatePlan(input), [input]);
  const results = useMemo(
    () => (errors.length ? [] : comparePlans(input)),
    [input, errors],
  );
  const current = results.find((r) => r.mode === mode);
  const delays = useMemo(
    () =>
      errors.length
        ? []
        : [0, 6, 12].map((delay) =>
            simulatePlan(input, mode, delay, comparisonHorizon(input)),
          ),
    [input, mode, errors],
  );
  const baseline = delays[0];
  const changed = () => {
    interacted.current = true;
    setStatus("");
  };
  const setNumber = (key: NumericKey, value: number) => {
    changed();
    setInput((p) => ({ ...p, [key]: value }));
  };
  const patch = (values: Partial<PlanInput>) => {
    changed();
    setInput((p) => ({ ...p, ...values }));
  };
  const field = (
    key: NumericKey,
    label: string,
    options: Partial<Parameters<typeof Field>[0]> = {},
  ) => (
    <Field
      key={key}
      id={`pe-${key}`}
      label={label}
      value={input[key]}
      onChange={(v) => setNumber(key, v)}
      {...options}
    />
  );
  const setTranche = (index: number, key: keyof Tranche, value: number) =>
    patch({
      tranches: input.tranches.map((t, i) =>
        i === index ? { ...t, [key]: value } : t,
      ),
    });
  const totalPercent = input.tranches.reduce((sum, t) => sum + t.percent, 0);

  useEffect(() => {
    try {
      setSaved(Boolean(localStorage.getItem(STORAGE_KEY)));
    } catch {
      /* Storage is optional. */
    }
  }, []);
  useEffect(() => {
    if (!interacted.current || errors.length) return;
    const timer = window.setTimeout(() => {
      calculations.current += 1;
      if (calculations.current === 1)
        trackAnalyticsEvent("calculator_used", analytics);
      trackAnalyticsEvent("calculation_completed", {
        ...analytics,
        calculation_number: calculations.current,
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [input, mode, errors]);

  const envelope = () => ({
    version: 1,
    modelVersion: MODEL_VERSION,
    input: parsePlan(input),
    mode,
  });
  const restore = (raw: string) => {
    if (raw.length > 32000)
      throw new Error("Plan files must be smaller than 32 KB.");
    const data = JSON.parse(raw);
    if (data?.version !== 1 || !MODES.includes(data.mode))
      throw new Error("Choose a RupeeKit pre-EMI plan file (version 1).");
    const restored = parsePlan(data.input);
    changed();
    setInput(restored);
    setMode(data.mode);
    setStatus(
      "Plan restored. Review the dates and assumptions before using the results.",
    );
  };
  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope()));
      setSaved(true);
      setStatus("Saved on this browser. You can restore it here next time.");
    } catch {
      setStatus(
        "This browser could not save your plan. Download a plan file instead.",
      );
    }
  };
  const pdf = async () => {
    if (busy || errors.length) return;
    setBusy(true);
    setStatus("Preparing your PDF report…");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 45000);
    try {
      const response = await fetch("/api/pre-emi/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(envelope()),
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) {
        if (response.status === 503)
          throw new Error(
            "The report service is busy. Please try again in a few seconds.",
          );
        throw new Error(
          "The PDF could not be created. Your plan is still here; try again or download the CSV.",
        );
      }
      const blob = await response.blob();
      if (!blob.type.includes("application/pdf") || blob.size < 100)
        throw new Error("The report was incomplete. Please try again.");
      downloadFile(blob, "RupeeKit-pre-EMI-plan.pdf");
      setStatus(
        "Your PDF is ready. It includes all three strategies, your inputs and the calculation assumptions.",
      );
    } catch (e) {
      setStatus(
        e instanceof Error
          ? e.message
          : "Could not create the report. Please try again.",
      );
    } finally {
      window.clearTimeout(timeout);
      setBusy(false);
    }
  };
  const share = async () => {
    const url = `${window.location.origin}/tools/pre-emi-calculator-india`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "RupeeKit Pre-EMI Planner",
          text: "Plan rent, staged loan draws and possession delays.",
          url,
        });
        trackAnalyticsEvent("result_shared", {
          ...analytics,
          share_method: "native_share",
        });
      } else {
        await navigator.clipboard.writeText(url);
        trackAnalyticsEvent("result_shared", {
          ...analytics,
          share_method: "copy_link",
        });
        setStatus(
          "Calculator link copied. Your financial inputs are not in this link.",
        );
      }
    } catch (e) {
      if (!(e instanceof Error && e.name === "AbortError"))
        setStatus(
          "Could not share automatically. Copy this page’s address to share the calculator.",
        );
    }
  };

  return (
    <div className="pe-workspace" id="pre-emi-planner">
      <div className="pe-workspace-bar">
        <span>
          <span className="pe-live-dot" />
          YOUR HOME. YOUR NUMBERS.
        </span>
        <div>
          <button
            type="button"
            onClick={() => setShowReset(true)}
            className="pe-text-button"
          >
            Reset example
          </button>
          <button type="button" onClick={share} className="pe-text-button">
            Share calculator ↗
          </button>
        </div>
      </div>
      {showReset && (
        <div className="pe-notice" role="alert">
          <span>Replace your current inputs with the example plan?</span>
          <div>
            <button
              type="button"
              className="pe-button pe-button-small"
              onClick={() => {
                patch(createDefaultPlan(initialMonth));
                setMode("pre-emi");
                setShowReset(false);
              }}
            >
              Reset inputs
            </button>
            <button
              type="button"
              className="pe-text-button"
              onClick={() => setShowReset(false)}
            >
              Keep my plan
            </button>
          </div>
        </div>
      )}
      {saved && (
        <div className="pe-notice">
          <span>A saved plan is available on this browser.</span>
          <div>
            <button
              type="button"
              className="pe-text-button"
              onClick={() => {
                try {
                  const raw = localStorage.getItem(STORAGE_KEY);
                  if (raw) restore(raw);
                } catch {
                  setStatus(
                    "The saved plan could not be restored. You can clear it and start again.",
                  );
                }
              }}
            >
              Restore saved plan
            </button>
            <button
              type="button"
              className="pe-text-button"
              onClick={() => {
                try {
                  localStorage.removeItem(STORAGE_KEY);
                  setSaved(false);
                  setStatus("Saved browser copy removed.");
                } catch {
                  setStatus("Browser storage is unavailable.");
                }
              }}
            >
              Clear saved copy
            </button>
          </div>
        </div>
      )}
      <div className="pe-layout">
        <aside className="pe-input-panel pe-card" aria-label="Plan inputs">
          <div className="pe-panel-heading">
            <span className="pe-icon-box">
              <Icon kind="home" />
            </span>
            <div>
              <h2>Build your home plan</h2>
              <p>Start simple. Make it yours.</p>
            </div>
          </div>
          <div className="pe-tabs" role="group" aria-label="Input sections">
            {(["loan", "cash", "schedule"] as Tab[]).map((t, i) => (
              <button
                key={t}
                type="button"
                aria-pressed={tab === t}
                onClick={() => setTab(t)}
              >
                <span>0{i + 1}</span>
                {t === "loan"
                  ? "Home & loan"
                  : t === "cash"
                    ? "Your cash"
                    : "Tranches"}
              </button>
            ))}
          </div>
          <div className="pe-input-content">
            {tab === "loan" && (
              <div id="pe-panel-loan">
                <div className="pe-field">
                  <label htmlFor="pe-startMonth">Plan starts</label>
                  <input
                    id="pe-startMonth"
                    type="month"
                    min="2020-01"
                    max="2199-12"
                    value={input.startMonth}
                    onChange={(e) => patch({ startMonth: e.target.value })}
                  />
                </div>
                {field("loanAmount", "Sanctioned loan", {
                  min: 1000,
                  step: 100000,
                  suffix: "₹",
                  help: "Only the loan. Add your own builder contributions under Tranches.",
                })}
                <div className="pe-field-grid">
                  {field("annualRate", "Interest rate", {
                    max: 30,
                    step: 0.05,
                    suffix: "% p.a.",
                  })}
                  {field("tenureMonths", "Repayment tenure", {
                    min: 12,
                    max: 420,
                    step: 12,
                    suffix: "months",
                    help: Number.isFinite(input.tenureMonths)
                      ? `${(input.tenureMonths / 12).toFixed(1)} years`
                      : undefined,
                  })}
                </div>
                {field("possessionMonth", "Expected possession", {
                  min: 1,
                  max: 120,
                  step: 1,
                  suffix: "month",
                  help:
                    Number.isFinite(input.possessionMonth) &&
                    /^\d{4}-\d{2}$/.test(input.startMonth)
                      ? `${monthLabel(input.startMonth, input.possessionMonth)} · rent stops this month`
                      : undefined,
                })}
                {field("emiStartMonth", "Full EMI starts in", {
                  min: 1,
                  max: 120,
                  step: 1,
                  suffix: "month",
                  help: "For the pre-EMI option. Confirm with your lender; this can differ from possession.",
                })}
                <div className="pe-input-tip">
                  <Icon kind="spark" />
                  <p>
                    Early EMI starts principal repayment sooner. Compare its
                    cash pressure before choosing the lowest interest.
                  </p>
                </div>
                <button
                  type="button"
                  className="pe-button pe-next"
                  onClick={() => setTab("cash")}
                >
                  Add your cash flow <Icon kind="arrow" />
                </button>
              </div>
            )}
            {tab === "cash" && (
              <div id="pe-panel-cash">
                {field("monthlyIncome", "Monthly take-home income", {
                  max: 10000000,
                  suffix: "₹",
                  help: "Combined household income after tax.",
                })}
                <div className="pe-field-grid">
                  {field("livingExpenses", "Living expenses", {
                    max: 10000000,
                    suffix: "₹",
                    help: "Exclude rent and EMIs.",
                  })}
                  {field("otherEmi", "Other EMIs", {
                    max: 10000000,
                    suffix: "₹",
                    help: "Exclude this home loan.",
                  })}
                </div>
                <div className="pe-field-grid">
                  {field("rent", "Current monthly rent", {
                    max: 10000000,
                    suffix: "₹",
                  })}
                  {field("rentEscalation", "Annual rent rise", {
                    max: 30,
                    step: 1,
                    suffix: "%",
                  })}
                </div>
                {field("startingCash", "Liquid cash available today", {
                  suffix: "₹",
                  help: "Cash and accessible savings. Do not include the loan sanction or money already paid to the builder.",
                })}
                {field("protectedReserve", "Cash you want to keep untouched", {
                  suffix: "₹",
                  help: "Your emergency reserve. The chart flags months below this line.",
                })}
                {field("moveInCost", "Possession & move-in budget", {
                  max: 100000000,
                  suffix: "₹",
                  help: "Interiors, moving and costs not already included in your builder contributions.",
                })}
                <button
                  type="button"
                  className="pe-button pe-next"
                  onClick={() => setTab("schedule")}
                >
                  Set your loan tranches <Icon kind="arrow" />
                </button>
              </div>
            )}
            {tab === "schedule" && (
              <div id="pe-panel-schedule">
                <div className="pe-schedule-intro">
                  <h3>When does the builder get paid?</h3>
                  <p>
                    Enter each bank draw and the cash you contribute separately.
                    Month 1 is your plan’s first month.
                  </p>
                </div>
                <div className="pe-preset-row">
                  <button
                    type="button"
                    onClick={() =>
                      patch({
                        tranches: [
                          { month: 1, percent: 20, ownCash: 0 },
                          { month: 6, percent: 20, ownCash: 0 },
                          { month: 12, percent: 20, ownCash: 0 },
                          { month: 18, percent: 20, ownCash: 0 },
                          { month: 24, percent: 20, ownCash: 0 },
                        ],
                        emiStartMonth: Math.max(25, input.emiStartMonth),
                        possessionMonth: Math.max(25, input.possessionMonth),
                      })
                    }
                  >
                    5 equal stages
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      patch({
                        tranches: [
                          { month: 1, percent: 10, ownCash: 0 },
                          { month: 6, percent: 20, ownCash: 0 },
                          { month: 12, percent: 30, ownCash: 0 },
                          { month: 18, percent: 30, ownCash: 0 },
                          { month: 24, percent: 10, ownCash: 0 },
                        ],
                        emiStartMonth: Math.max(25, input.emiStartMonth),
                        possessionMonth: Math.max(25, input.possessionMonth),
                      })
                    }
                  >
                    Construction linked
                  </button>
                </div>
                <p className="pe-small pe-muted">
                  Applying a preset replaces this schedule and clears own-cash
                  entries.
                </p>
                <div className="pe-tranches">
                  {input.tranches.map((t, i) => (
                    <div key={i} className="pe-tranche">
                      <div className="pe-tranche-heading">
                        <strong>
                          <span>{String(i + 1).padStart(2, "0")}</span> Loan
                          tranche
                        </strong>
                        <button
                          type="button"
                          disabled={input.tranches.length === 1}
                          aria-label={`Remove tranche ${i + 1}`}
                          onClick={() =>
                            patch({
                              tranches: input.tranches.filter(
                                (_, j) => i !== j,
                              ),
                            })
                          }
                        >
                          Remove
                        </button>
                      </div>
                      <div className="pe-field-grid">
                        <Field
                          id={`pe-tranche-${i}-month`}
                          label="Month"
                          value={t.month}
                          min={1}
                          max={120}
                          step={1}
                          onChange={(n) => setTranche(i, "month", n)}
                        />
                        <Field
                          id={`pe-tranche-${i}-percent`}
                          label="Loan drawn"
                          value={t.percent}
                          min={0.01}
                          max={100}
                          step={1}
                          suffix="%"
                          onChange={(n) => setTranche(i, "percent", n)}
                        />
                      </div>
                      <Field
                        id={`pe-tranche-${i}-cash`}
                        label="Your own cash paid to builder"
                        value={t.ownCash}
                        max={100000000}
                        suffix="₹"
                        onChange={(n) => setTranche(i, "ownCash", n)}
                      />
                      <p className="pe-tranche-amount">
                        Bank draw:{" "}
                        {Number.isFinite(t.percent * input.loanAmount)
                          ? money((t.percent * input.loanAmount) / 100)
                          : "—"}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="pe-schedule-total">
                  <strong>
                    Allocated:{" "}
                    {Number.isFinite(totalPercent)
                      ? totalPercent.toFixed(1)
                      : "—"}
                    %
                  </strong>
                  <button
                    type="button"
                    className="pe-text-button"
                    disabled={input.tranches.length >= 12}
                    onClick={() => {
                      const month = Math.min(
                        120,
                        Math.max(...input.tranches.map((t) => t.month)) + 1,
                      );
                      patch({
                        tranches: [
                          ...input.tranches,
                          {
                            month,
                            percent: Math.max(1, 100 - totalPercent),
                            ownCash: 0,
                          },
                        ],
                        emiStartMonth: Math.max(month, input.emiStartMonth),
                      });
                    }}
                  >
                    + Add tranche
                  </button>
                </div>
                <p className="pe-small pe-muted">
                  Tranches must total 100%. Up to 12 stages. Monthly estimates
                  assume draws at the start of each month.
                </p>
              </div>
            )}
            <details className="pe-advanced">
              <summary>Extra payments & stress settings</summary>
              <div>
                <h3>Prepay at your pace</h3>
                {field("monthlyPrepayment", "Extra payment each month", {
                  max: 10000000,
                  suffix: "₹",
                })}
                {field("annualPrepayment", "Extra payment once a year", {
                  max: 100000000,
                  suffix: "₹",
                  help: "Paid from available cash; this does not add bonus income.",
                })}
                {field("prepaymentStartMonth", "Extra payments start", {
                  min: 1,
                  max: 120,
                  step: 1,
                  suffix: "month",
                  help: "Annual extras repeat every 12 months from this month.",
                })}
                <label className="pe-check">
                  <input
                    type="checkbox"
                    checked={input.protectReserve}
                    onChange={(e) =>
                      patch({ protectReserve: e.target.checked })
                    }
                  />
                  <span>
                    Limit extra payments to cash above my reserve
                    <small>
                      Checks this month’s cash; future expenses may still cause
                      a shortfall.
                    </small>
                  </span>
                </label>
                <h3>Stress-test assumptions</h3>
                <div className="pe-field-grid">
                  {field("rateIncrease", "Rate rise", {
                    max: 5,
                    step: 0.25,
                    suffix: "% points",
                  })}
                  {field("rateChangeMonth", "Rate changes in", {
                    min: 1,
                    max: 120,
                    step: 1,
                    suffix: "month",
                  })}
                </div>
                <div className="pe-field-grid">
                  {field("incomePauseMonths", "No-income period", {
                    max: 24,
                    step: 1,
                    suffix: "months",
                  })}
                  {field("incomePauseMonth", "Income pause starts", {
                    min: 1,
                    max: 120,
                    step: 1,
                    suffix: "month",
                  })}
                </div>
                {field("delayMonths", "Possession delay", {
                  max: 36,
                  step: 1,
                  suffix: "months",
                })}
                <label className="pe-check">
                  <input
                    type="checkbox"
                    checked={input.shiftConstruction}
                    onChange={(e) =>
                      patch({ shiftConstruction: e.target.checked })
                    }
                  />
                  <span>
                    Delay future construction stages too
                    <small>
                      Moves all tranches after the first, their own-cash
                      payments and the full-EMI start by the same delay.
                    </small>
                  </span>
                </label>
              </div>
            </details>
            <p className="pe-privacy">
              <Icon kind="shield" />
              Calculations stay in your browser. Only a PDF request sends this
              plan to RupeeKit for processing.
            </p>
          </div>
        </aside>
        <div
          className="pe-results"
          ref={resultsRef}
          aria-label="Estimated results"
        >
          {errors.length > 0 && (
            <div className="pe-card pe-errors" role="alert">
              <h2>Let’s fix these inputs first.</h2>
              <p>Results and exports pause until the plan is valid.</p>
              <ul>
                {errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          {current && baseline && (
            <>
              <section className="pe-scenario-bar">
                <div>
                  <span className="pe-eyebrow">WHAT IF POSSESSION MOVES?</span>
                  <h2>Plan for the wait.</h2>
                </div>
                <div className="pe-delay-options">
                  {delays.map((r) => (
                    <button
                      type="button"
                      key={r.delay}
                      aria-pressed={input.delayMonths === r.delay}
                      onClick={() => setNumber("delayMonths", r.delay)}
                    >
                      <strong>
                        {r.delay === 0 ? "On time" : `+${r.delay} months`}
                      </strong>
                      <span>
                        {r.delay === 0
                          ? "Your base plan"
                          : `${compactMoney(r.rentThroughHorizon - baseline.rentThroughHorizon)} extra rent`}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
              <section
                className={`pe-safety ${current.extraCashNeeded > 0 ? "pe-safety-warning" : ""}`}
                aria-labelledby="pe-safety-title"
              >
                <div className="pe-safety-top">
                  <span className="pe-pill">
                    <Icon kind="shield" />
                    {current.extraCashNeeded > 0
                      ? "RESERVE NEEDS ATTENTION"
                      : "RESERVE HOLDS IN THIS PLAN"}
                  </span>
                  <span>{MODE_LABELS[mode]}</span>
                </div>
                <div className="pe-safety-main">
                  <div>
                    <h3 id="pe-safety-title">
                      {current.extraCashNeeded > 0
                        ? "Your largest reserve shortfall"
                        : "Your lowest cash balance"}
                    </h3>
                    <p className="pe-safety-number">
                      {money(
                        current.extraCashNeeded > 0
                          ? current.extraCashNeeded
                          : current.lowestCash,
                      )}
                    </p>
                    <p className="pe-safety-copy">
                      {current.extraCashNeeded > 0
                        ? `Cash falls ${money(current.extraCashNeeded)} below your ${money(input.protectedReserve)} reserve ${current.lowestCashMonth === 0 ? "at the start" : `in ${monthLabel(input.startMonth, current.lowestCashMonth)}`}.`
                        : `That is ${money(current.lowestCash - input.protectedReserve)} above the ${money(input.protectedReserve)} you want to protect.`}
                    </p>
                  </div>
                  <div className="pe-home-mark" aria-hidden="true">
                    <Icon kind="home" />
                    <span>
                      {input.delayMonths
                        ? `+${input.delayMonths} mo`
                        : "On track"}
                    </span>
                  </div>
                </div>
                <div className="pe-safety-footer">
                  <span>
                    Cash check through{" "}
                    <strong>
                      {monthLabel(input.startMonth, current.horizonMonth)}
                    </strong>
                  </span>
                  <span>
                    Possession:{" "}
                    {monthLabel(input.startMonth, current.possessionMonth)}
                  </span>
                </div>
              </section>
              <div className="pe-payment-path">
                <div>
                  <span>First loan payment</span>
                  <strong>
                    {money(
                      current.rows.find((r) => r.disbursement > 0)?.payment ??
                        0,
                    )}
                  </strong>
                </div>
                <span aria-hidden="true">→</span>
                <div>
                  <span>
                    {mode === "pre-emi"
                      ? "EMI after the interest-only phase"
                      : "First scheduled EMI"}
                  </span>
                  <strong>
                    {money(current.regularEmi)}
                    <small>/ month</small>
                  </strong>
                </div>
                <p>
                  {mode === "pre-emi"
                    ? `Starts ${monthLabel(input.startMonth, current.emiStartMonth)}`
                    : "Changes with draw and rate assumptions; see schedule."}
                </p>
              </div>
              {input.delayMonths > 0 && (
                <p className="pe-delay-impact">
                  Compared with on-time possession:{" "}
                  <strong>
                    {money(
                      current.rentThroughHorizon - baseline.rentThroughHorizon,
                    )}{" "}
                    extra rent
                  </strong>
                  ; lifetime loan interest changes by{" "}
                  <strong>
                    {money(current.totalInterest - baseline.totalInterest)}
                  </strong>
                  .{" "}
                  {input.shiftConstruction
                    ? "Future construction stages move with the delay."
                    : "Loan dates stay unchanged."}
                </p>
              )}
              {current.firstFundingGap !== null && (
                <div className="pe-notice">
                  <span>
                    Cash turns negative from{" "}
                    {monthLabel(input.startMonth, current.firstFundingGap)}. The
                    plan needs additional funding or lower outflows from that
                    point.
                  </span>
                </div>
              )}
              <div className="pe-kpis">
                <div className="pe-card">
                  <span>Peak monthly outflow</span>
                  <strong>{money(current.peakOutflow)}</strong>
                  <small>
                    {monthLabel(input.startMonth, current.peakOutflowMonth)} ·
                    all costs included
                  </small>
                </div>
                <div className="pe-card">
                  <span>Loan at possession</span>
                  <strong>{money(current.debtAtPossession)}</strong>
                  <small>Outstanding after that month’s payments</small>
                </div>
                <div className="pe-card">
                  <span>Total loan interest</span>
                  <strong>{money(current.totalInterest)}</strong>
                  <small>
                    Loan cleared{" "}
                    {monthLabel(input.startMonth, current.payoffMonth)}
                  </small>
                </div>
              </div>
              <section
                className="pe-card pe-strategies"
                aria-labelledby="pe-strategies-title"
              >
                <div className="pe-section-head">
                  <div>
                    <span className="pe-eyebrow">THREE WAYS TO REPAY</span>
                    <h3 id="pe-strategies-title">Find your balance.</h3>
                  </div>
                  <span className="pe-small pe-muted">
                    Select a strategy to explore
                  </span>
                </div>
                <div className="pe-strategy-grid">
                  {results.map((r) => (
                    <button
                      type="button"
                      key={r.mode}
                      aria-pressed={mode === r.mode}
                      onClick={() => {
                        changed();
                        setMode(r.mode);
                      }}
                    >
                      <span className="pe-radio-mark" />
                      <strong>{MODE_LABELS[r.mode]}</strong>
                      <p>{modeDescriptions[r.mode]}</p>
                      <span className="pe-strategy-value">
                        {compactMoney(r.totalInterest)}
                        <small>lifetime interest</small>
                      </span>
                      <span
                        className={
                          r.extraCashNeeded > 0
                            ? "pe-warning-text"
                            : "pe-success-text"
                        }
                      >
                        {r.extraCashNeeded > 0
                          ? `${compactMoney(r.extraCashNeeded)} reserve gap`
                          : "Reserve stays intact"}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="pe-small pe-muted">
                  Early EMI starts the entered tenure at the first draw. Pre-EMI
                  starts it at your full-EMI date. Check the same-date
                  comparison below before deciding.
                </p>
              </section>
              <PlanCharts input={input} result={current} />
              <section className="pe-card pe-stress">
                <div>
                  <span className="pe-eyebrow">
                    GIVE YOUR PLAN A REALITY CHECK
                  </span>
                  <h3>A surprise shouldn’t be a surprise.</h3>
                  <p>Combine shocks to see where your cash buffer gives way.</p>
                </div>
                <div className="pe-stress-buttons">
                  <button
                    type="button"
                    aria-pressed={input.rateIncrease === 1}
                    onClick={() =>
                      patch({ rateIncrease: input.rateIncrease === 1 ? 0 : 1 })
                    }
                  >
                    <span>↗</span> +1% rate rise{" "}
                    <small>From month {input.rateChangeMonth}</small>
                  </button>
                  <button
                    type="button"
                    aria-pressed={input.incomePauseMonths === 3}
                    onClick={() =>
                      patch({
                        incomePauseMonths:
                          input.incomePauseMonths === 3 ? 0 : 3,
                      })
                    }
                  >
                    <span>Ⅱ</span> 3 months without income{" "}
                    <small>From month {input.incomePauseMonth}</small>
                  </button>
                </div>
                {(input.rateIncrease > 0 ||
                  input.incomePauseMonths > 0 ||
                  input.delayMonths > 0) && (
                  <p className="pe-stress-active">
                    Active: {input.delayMonths} months’ delay · +
                    {input.rateIncrease}% points from month{" "}
                    {input.rateChangeMonth} · {input.incomePauseMonths} months
                    without income.{" "}
                    {input.shiftConstruction
                      ? "Future construction draws move too."
                      : "Loan draw dates stay unchanged."}
                  </p>
                )}
              </section>
              <section className="pe-card pe-comparison">
                <div className="pe-section-head">
                  <div>
                    <span className="pe-eyebrow">
                      SAME DATE. CLEARER TRADE-OFFS.
                    </span>
                    <h3>Where will each plan leave you?</h3>
                  </div>
                </div>
                <p className="pe-small pe-muted">
                  All columns use{" "}
                  {monthLabel(input.startMonth, current.horizonMonth)} and the
                  same household assumptions. A larger cash balance can come
                  with more debt.
                </p>
                <div
                  className="pe-table-scroll"
                  tabIndex={0}
                  role="region"
                  aria-label="Strategy comparison"
                >
                  <table>
                    <caption className="sr-only">
                      Three payment strategies at a common comparison date
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">At the comparison date</th>
                        {results.map((r) => (
                          <th scope="col" key={r.mode}>
                            {MODE_LABELS[r.mode]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">Liquid cash</th>
                        {results.map((r) => (
                          <td key={r.mode}>{money(r.cashAtHorizon)}</td>
                        ))}
                      </tr>
                      <tr>
                        <th scope="row">Loan still outstanding</th>
                        {results.map((r) => (
                          <td key={r.mode}>{money(r.debtAtHorizon)}</td>
                        ))}
                      </tr>
                      <tr>
                        <th scope="row">Interest paid to this date</th>
                        {results.map((r) => (
                          <td key={r.mode}>
                            {money(r.interestThroughHorizon)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <th scope="row">Rent paid to this date</th>
                        {results.map((r) => (
                          <td key={r.mode}>{money(r.rentThroughHorizon)}</td>
                        ))}
                      </tr>
                      <tr>
                        <th scope="row">Largest reserve shortfall</th>
                        {results.map((r) => (
                          <td
                            className={
                              r.extraCashNeeded > 0 ? "pe-warning-text" : ""
                            }
                            key={r.mode}
                          >
                            {money(r.extraCashNeeded)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="pe-small pe-muted">
                  A negative cash balance is an unfunded gap. Shortfall is
                  measured under the displayed payment schedule; changing
                  available cash may change reserve-limited prepayments.
                </p>
                {current.skippedPrepayment > 0 && (
                  <div className="pe-inline-insight">
                    <Icon kind="shield" />
                    <p>
                      Reserve protection held back{" "}
                      <strong>{money(current.skippedPrepayment)}</strong> of
                      requested extra payments through the comparison date.
                    </p>
                  </div>
                )}
              </section>
              <details className="pe-card pe-ledger">
                <summary>
                  <span>Every month, accounted for.</span>
                  <span>View payment schedule ↓</span>
                </summary>
                <p className="pe-small pe-muted">
                  Showing the cash-planning period. Download CSV for the
                  complete loan schedule. Amounts rounded to the nearest rupee
                  for display.
                </p>
                <div
                  className="pe-table-scroll"
                  tabIndex={0}
                  role="region"
                  aria-label="Monthly payment schedule"
                >
                  <table>
                    <thead>
                      <tr>
                        {[
                          "Month",
                          "Drawn",
                          "Interest",
                          "Loan + extra",
                          "Rent",
                          "Own + move-in",
                          "All outflows",
                          "Cash left",
                          "Debt left",
                        ].map((h) => (
                          <th scope="col" key={h}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {current.rows.slice(0, current.horizonMonth).map((r) => (
                        <tr key={r.month}>
                          <th scope="row">{r.date}</th>
                          {[
                            r.disbursement,
                            r.interest,
                            r.payment + r.prepayment,
                            r.rent,
                            r.ownCash + r.moveInCost,
                            r.outflow,
                            r.cash,
                            r.closingDebt,
                          ].map((v, i) => (
                            <td
                              key={i}
                              className={
                                i === 6 && v < input.protectedReserve
                                  ? "pe-warning-text"
                                  : ""
                              }
                            >
                              {money(v)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
              <section className="pe-export">
                <div>
                  <span className="pe-eyebrow">TAKE YOUR PLAN WITH YOU</span>
                  <h3>Walk into the bank prepared.</h3>
                  <p>
                    Your comparison, assumptions and lender questions in one
                    report.
                  </p>
                </div>
                <button
                  type="button"
                  className="pe-button"
                  onClick={pdf}
                  disabled={busy}
                >
                  <Icon kind="download" />
                  {busy ? "Preparing report…" : "Download PDF report"}
                </button>
                <p className="pe-export-privacy">
                  PDF generation sends these inputs to RupeeKit’s server for
                  this request. We do not store the report or plan. Browser-only
                  CSV and plan-file downloads are below.
                </p>
                <div className="pe-export-actions">
                  <button
                    type="button"
                    onClick={() => {
                      downloadFile(
                        new Blob([toCsv(current)], {
                          type: "text/csv;charset=utf-8",
                        }),
                        "RupeeKit-pre-EMI-schedule.csv",
                      );
                      setStatus("Complete monthly schedule downloaded.");
                    }}
                  >
                    Download full CSV
                  </button>
                  <button type="button" onClick={save}>
                    Save on this browser
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      downloadFile(
                        new Blob([JSON.stringify(envelope(), null, 2)], {
                          type: "application/json",
                        }),
                        "RupeeKit-pre-EMI-plan.json",
                      );
                      setStatus(
                        "Plan file downloaded. It contains your financial inputs; share it only with people you choose.",
                      );
                    }}
                  >
                    Download plan file
                  </button>
                </div>
              </section>
            </>
          )}
          <div className="pe-import">
            <input
              className="sr-only"
              ref={fileInput}
              type="file"
              accept=".json,application/json"
              aria-label="Import a saved pre-EMI plan"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  if (file.size > 32000)
                    throw new Error("Plan files must be smaller than 32 KB.");
                  restore(await file.text());
                } catch (err) {
                  setStatus(
                    err instanceof Error
                      ? err.message
                      : "Could not open this plan file.",
                  );
                } finally {
                  if (fileInput.current) fileInput.current.value = "";
                }
              }}
            />
            <button
              type="button"
              className="pe-text-button"
              onClick={() => fileInput.current?.click()}
            >
              ↥ Import a saved plan file
            </button>
            <p className="pe-small pe-muted">
              No account needed. Your input values are not sent as analytics
              parameters.
            </p>
          </div>
          <div
            role="status"
            aria-live="polite"
            className={status ? "pe-notice pe-status" : "sr-only"}
          >
            {status}
          </div>
        </div>
      </div>
    </div>
  );
}
