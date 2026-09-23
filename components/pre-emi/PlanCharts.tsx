"use client";

import { useId, useState } from "react";
import type { PlanInput, PlanResult } from "@/lib/pre-emi/engine";
import { monthLabel } from "@/lib/pre-emi/engine";
import { compactMoney, money } from "./format";

export default function PlanCharts({
  input,
  result,
}: {
  input: PlanInput;
  result: PlanResult;
}) {
  const id = useId().replace(/:/g, "");
  const [view, setView] = useState<"cash" | "payments">("cash");
  const [selected, setSelected] = useState(1);
  const rows = result.rows.slice(0, result.horizonMonth);
  const index = Math.min(selected, rows.length);
  const row = rows[index - 1];
  const w = 720,
    h = 265,
    left = 66,
    right = 18,
    top = 24,
    bottom = 38;
  const plotW = w - left - right,
    plotH = h - top - bottom;
  const values =
    view === "cash"
      ? [input.startingCash, input.protectedReserve, ...rows.map((r) => r.cash)]
      : rows.map((r) => r.outflow);
  const lo = Math.min(0, ...values),
    hi = Math.max(1, ...values);
  const range = hi - lo || 1;
  const x = (month: number) => left + (month / rows.length) * plotW;
  const y = (value: number) => top + ((hi - value) / range) * plotH;
  const cashPoints = [input.startingCash, ...rows.map((r) => r.cash)]
    .map((value, m) => `${x(m)},${y(value)}`)
    .join(" ");
  const fillPoints = `${x(0)},${y(lo)} ${cashPoints} ${x(rows.length)},${y(lo)}`;
  const ticks = Array.from({ length: 5 }, (_, i) => lo + (i * range) / 4);
  const months = [
    ...new Set([
      1,
      Math.round(rows.length / 3),
      Math.round((rows.length * 2) / 3),
      rows.length,
    ]),
  ];
  const categories = [
    {
      label: "Loan + prepayments",
      color: "#003080",
      value: (r: typeof row) => r.payment + r.prepayment,
    },
    { label: "Rent", color: "#43a047", value: (r: typeof row) => r.rent },
    {
      label: "Builder + move-in",
      color: "#e5a236",
      value: (r: typeof row) => r.ownCash + r.moveInCost,
    },
    {
      label: "Living + other EMIs",
      color: "#c7d3df",
      value: (r: typeof row) => r.living + r.otherEmi,
    },
  ];
  return (
    <section className="pe-card pe-chart" aria-labelledby={`${id}-heading`}>
      <div className="pe-section-head">
        <div>
          <span className="pe-eyebrow">THE MONTH-BY-MONTH PICTURE</span>
          <h3 id={`${id}-heading`}>
            {view === "cash"
              ? "See the squeeze before it happens."
              : "Where your money goes."}
          </h3>
        </div>
        <div className="pe-segment" aria-label="Chart view">
          {(["cash", "payments"] as const).map((v) => (
            <button
              type="button"
              key={v}
              aria-pressed={view === v}
              onClick={() => setView(v)}
            >
              {v === "cash" ? "Cash balance" : "Monthly outflow"}
            </button>
          ))}
        </div>
      </div>
      <p className="pe-muted pe-small">
        {view === "cash"
          ? "Your liquid cash after each month’s income and expenses. The dashed line is your protected reserve."
          : "Includes loan payments, rent, living costs and your own builder contributions. Bank draws are not cash income."}
      </p>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
        className="pe-chart-svg"
      >
        <title id={`${id}-title`}>
          {view === "cash"
            ? "Monthly cash balance and protected reserve"
            : "Monthly cash outflow by category"}
        </title>
        <desc id={`${id}-desc`}>
          Lowest cash {money(result.lowestCash)}; peak outflow{" "}
          {money(result.peakOutflow)}. Use the month slider and the full
          schedule below for exact accessible values.
        </desc>
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#43a047" stopOpacity="0.23" />
            <stop offset="100%" stopColor="#43a047" stopOpacity="0.015" />
          </linearGradient>
        </defs>
        {ticks.map((tick, i) => (
          <g key={i}>
            <line
              x1={left}
              x2={w - right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="currentColor"
              opacity="0.09"
            />
            <text
              x={left - 10}
              y={y(tick) + 4}
              textAnchor="end"
              className="pe-axis"
            >
              {compactMoney(tick)}
            </text>
          </g>
        ))}
        {view === "cash" ? (
          <>
            <polygon points={fillPoints} fill={`url(#${id}-fill)`} />
            <line
              x1={left}
              x2={w - right}
              y1={y(input.protectedReserve)}
              y2={y(input.protectedReserve)}
              stroke="#bf7c15"
              strokeDasharray="5 5"
              strokeWidth="1.5"
            />
            <polyline
              points={cashPoints}
              fill="none"
              stroke="#43a047"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {lo < 0 && (
              <line
                x1={left}
                x2={w - right}
                y1={y(0)}
                y2={y(0)}
                stroke="#bf4141"
                strokeDasharray="3 4"
              />
            )}
            <line
              x1={x(index)}
              x2={x(index)}
              y1={top}
              y2={h - bottom}
              stroke="#003080"
              opacity="0.22"
            />
            <circle
              cx={x(index)}
              cy={y(row.cash)}
              r="5"
              fill={row.cash < input.protectedReserve ? "#bf7c15" : "#43a047"}
              stroke="white"
              strokeWidth="2"
            />
          </>
        ) : (
          rows.map((r) => {
            let base = 0;
            return (
              <g key={r.month}>
                {categories.map((c) => {
                  const v = c.value(r),
                    position = base + v;
                  base += v;
                  return (
                    <rect
                      key={c.label}
                      x={x(r.month - 1) + 1}
                      y={y(position)}
                      width={Math.max(1, plotW / rows.length - 2)}
                      height={Math.max(0, (v / range) * plotH)}
                      fill={c.color}
                      opacity={r.month === index ? 1 : 0.8}
                    />
                  );
                })}
              </g>
            );
          })
        )}
        <line
          x1={x(result.possessionMonth)}
          x2={x(result.possessionMonth)}
          y1={top}
          y2={h - bottom}
          stroke="#64748b"
          strokeDasharray="3 5"
        />
        <text
          x={Math.min(w - 88, x(result.possessionMonth) + 5)}
          y={15}
          className="pe-axis"
        >
          Possession
        </text>
        {months.map((m) => (
          <text
            key={m}
            x={x(m)}
            y={h - 12}
            textAnchor={m === rows.length ? "end" : "middle"}
            className="pe-axis"
          >
            {monthLabel(input.startMonth, m)}
          </text>
        ))}
      </svg>
      <div className="pe-chart-legend">
        {view === "cash" ? (
          <>
            <span>
              <i style={{ background: "#43a047" }} />
              Cash balance
            </span>
            <span>
              <i style={{ background: "#bf7c15" }} />
              Protected reserve
            </span>
          </>
        ) : (
          categories.map((c) => (
            <span key={c.label}>
              <i style={{ background: c.color }} />
              {c.label}
            </span>
          ))
        )}
      </div>
      <div className="pe-month-inspector">
        <label htmlFor={`${id}-month`}>
          <strong>{row.date}</strong>
          <span>
            Explore month {index} of {rows.length}
          </span>
        </label>
        <input
          id={`${id}-month`}
          type="range"
          min={1}
          max={rows.length}
          value={index}
          onChange={(e) => setSelected(Number(e.target.value))}
        />
        <dl>
          <div>
            <dt>Cash remaining</dt>
            <dd
              className={
                row.cash < input.protectedReserve ? "pe-warning-text" : ""
              }
            >
              {money(row.cash)}
            </dd>
          </div>
          <div>
            <dt>Loan + extra payment</dt>
            <dd>{money(row.payment + row.prepayment)}</dd>
          </div>
          <div>
            <dt>Rent</dt>
            <dd>{money(row.rent)}</dd>
          </div>
          <div>
            <dt>Total outflow</dt>
            <dd>{money(row.outflow)}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
