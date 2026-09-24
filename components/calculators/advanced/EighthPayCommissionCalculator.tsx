'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Tool } from '@/lib/tools';
import {
  ARREARS_DEFAULT_THROUGH_ISO,
  ARREARS_REFERENCE_ISO,
  COMPARISON_FACTORS,
  DA_PRESETS,
  DEFAULT_BASIC_PAY,
  DEFAULT_BASIC_PENSION,
  DEFAULT_DA_PERCENT,
  DEFAULT_FITMENT_FACTOR,
  DEFAULT_PAY_LEVEL,
  FITMENT_PRESETS,
  PAY_LEVEL_BANDS,
  SCHEME_CONTRIBUTIONS,
  getPayLevelBand,
  type CalculatorMode,
  type CityClass,
  type EmployeeGroup,
  type PensionScheme,
  type TransportCityClass,
} from '@/data/eighth-cpc-pay-matrix';
import {
  buildEmployeeScenarioTable,
  buildPensionerScenarioTable,
  calculateEighthCpcEmployee,
  calculateEighthCpcPensioner,
  deriveHraFloors,
  resolveTransportAllowance,
} from '@/lib/calculators/eighth-cpc-scenario';
import {
  CalculatorGovernanceStrip,
  NumericField,
  formatCurrency,
  formatNumber,
  numeric,
  type NumericValue,
} from './PriorityCalculatorPrimitives';

const CITY_CLASSES: { value: CityClass; label: string }[] = [
  { value: 'X', label: 'X (metro) — 24% projected HRA' },
  { value: 'Y', label: 'Y — 16% projected HRA' },
  { value: 'Z', label: 'Z — 8% projected HRA' },
];

const TRANSPORT_CITIES: { value: TransportCityClass; label: string }[] = [
  { value: 'higher', label: 'Higher TPTA city' },
  { value: 'other', label: 'All other places' },
];

const SCHEMES: { value: PensionScheme; label: string }[] = [
  { value: 'NPS', label: 'NPS' },
  { value: 'UPS', label: 'UPS' },
  { value: 'OPS', label: 'OPS' },
];

const GROUPS: { value: EmployeeGroup; label: string }[] = [
  { value: 'A', label: 'Group A — CGEGIS Rs 120' },
  { value: 'B', label: 'Group B — CGEGIS Rs 60' },
  { value: 'C', label: 'Group C — CGEGIS Rs 30' },
];

/**
 * Shareable URL state. Short, readable parameter names so a link pasted into a
 * WhatsApp or Telegram group is legible. The page canonical always points at
 * the clean URL and middleware marks parameterised URLs noindex, so these
 * links are shareable without creating duplicate indexable pages.
 */
const URL_KEYS = {
  mode: 'mode',
  basic: 'basic',
  level: 'level',
  city: 'city',
  tpta: 'tpta',
  scheme: 'scheme',
  group: 'group',
  ff: 'ff',
  da: 'da',
} as const;

const selectClass =
  'mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-950 outline-none transition focus:border-brandNavy focus:bg-white focus:ring-4 focus:ring-brandNavy/10';

function formatSignedCurrency(value: number) {
  if (!Number.isFinite(value)) return 'Check inputs';
  return `${value >= 0 ? '+' : '-'}${formatCurrency(Math.abs(value))}`;
}

function formatSignedPercent(value: number) {
  if (!Number.isFinite(value)) return '';
  return `${value >= 0 ? '+' : '-'}${formatNumber(Math.abs(value), 1)}%`;
}

function monthLabel(iso: string) {
  const date = new Date(`${iso.slice(0, 7)}-01T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export default function EighthPayCommissionCalculator({ tool }: { tool?: Tool }) {
  const [mode, setMode] = useState<CalculatorMode>('employee');
  const [currentBasic, setCurrentBasic] = useState<NumericValue>(DEFAULT_BASIC_PAY);
  const [basicPension, setBasicPension] = useState<NumericValue>(DEFAULT_BASIC_PENSION);
  const [payLevel, setPayLevel] = useState(DEFAULT_PAY_LEVEL);
  const [cityClass, setCityClass] = useState<CityClass>('X');
  const [transportCity, setTransportCity] = useState<TransportCityClass>('higher');
  const [pensionScheme, setPensionScheme] = useState<PensionScheme>('NPS');
  const [employeeGroup, setEmployeeGroup] = useState<EmployeeGroup>('B');
  const [fitmentFactor, setFitmentFactor] = useState<NumericValue>(DEFAULT_FITMENT_FACTOR);
  const [daPercent, setDaPercent] = useState<NumericValue>(DEFAULT_DA_PERCENT);
  const [transportOverride, setTransportOverride] = useState<NumericValue | null>(null);

  // Held as state, not derived from `new Date()` during render, so the
  // server-rendered HTML and the first client render agree. The effect below
  // moves it to the real current month after hydration.
  const [arrearsThroughIso, setArrearsThroughIso] = useState(ARREARS_DEFAULT_THROUGH_ISO);
  const [shareStatus, setShareStatus] = useState('');

  useEffect(() => {
    const now = new Date();
    const iso = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`;
    setArrearsThroughIso((current) => (iso > current ? iso : current));
  }, []);

  // Restore a shared scenario from the URL after mount. Reading this during
  // render would desynchronise hydration on a statically generated page.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if ([...params.keys()].length === 0) return;

    const readNumber = (key: string) => {
      const raw = params.get(key);
      if (raw === null) return null;
      const parsed = Number(raw);
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
    };

    const nextMode = params.get(URL_KEYS.mode);
    if (nextMode === 'employee' || nextMode === 'pensioner') setMode(nextMode);

    const nextBasic = readNumber(URL_KEYS.basic);
    if (nextBasic !== null) {
      setCurrentBasic(nextBasic);
      setBasicPension(nextBasic);
    }

    const nextLevel = params.get(URL_KEYS.level);
    if (nextLevel && PAY_LEVEL_BANDS.some((band) => band.level === nextLevel)) setPayLevel(nextLevel);

    const nextCity = params.get(URL_KEYS.city);
    if (nextCity === 'X' || nextCity === 'Y' || nextCity === 'Z') setCityClass(nextCity);

    const nextTpta = params.get(URL_KEYS.tpta);
    if (nextTpta === 'higher' || nextTpta === 'other') setTransportCity(nextTpta);

    const nextScheme = params.get(URL_KEYS.scheme);
    if (nextScheme === 'NPS' || nextScheme === 'UPS' || nextScheme === 'OPS') setPensionScheme(nextScheme);

    const nextGroup = params.get(URL_KEYS.group);
    if (nextGroup === 'A' || nextGroup === 'B' || nextGroup === 'C') setEmployeeGroup(nextGroup);

    const nextFactor = readNumber(URL_KEYS.ff);
    if (nextFactor !== null && nextFactor > 0 && nextFactor <= 10) setFitmentFactor(nextFactor);

    const nextDa = readNumber(URL_KEYS.da);
    if (nextDa !== null && nextDa <= 300) setDaPercent(nextDa);
  }, []);

  const band = getPayLevelBand(payLevel);
  const basicValue = numeric(currentBasic);
  const factorValue = numeric(fitmentFactor);

  const defaultTransport = useMemo(
    () => resolveTransportAllowance(payLevel, basicValue, transportCity),
    [payLevel, basicValue, transportCity]
  );

  // Selecting a new level or city resets an untouched transport allowance to
  // that band's rate; an explicit override is preserved.
  const transportAllowance = transportOverride === null ? defaultTransport : numeric(transportOverride);

  const employeeInputs = useMemo(
    () => ({
      currentBasic: basicValue,
      payLevel,
      cityClass,
      transportCity,
      pensionScheme,
      employeeGroup,
      fitmentFactor: factorValue,
      currentDaPercent: numeric(daPercent),
      transportAllowanceOverride: transportAllowance,
      arrearsThroughIso,
    }),
    [
      basicValue,
      payLevel,
      cityClass,
      transportCity,
      pensionScheme,
      employeeGroup,
      factorValue,
      daPercent,
      transportAllowance,
      arrearsThroughIso,
    ]
  );

  const pensionerInputs = useMemo(
    () => ({
      currentBasicPension: numeric(basicPension),
      fitmentFactor: factorValue,
      currentDrPercent: numeric(daPercent),
      arrearsThroughIso,
    }),
    [basicPension, factorValue, daPercent, arrearsThroughIso]
  );

  const employee = useMemo(() => calculateEighthCpcEmployee(employeeInputs), [employeeInputs]);
  const pensioner = useMemo(() => calculateEighthCpcPensioner(pensionerInputs), [pensionerInputs]);
  const isPensioner = mode === 'pensioner';

  const scenarioRows = useMemo(
    () =>
      isPensioner
        ? buildPensionerScenarioTable(pensionerInputs, COMPARISON_FACTORS)
        : buildEmployeeScenarioTable(employeeInputs, COMPARISON_FACTORS),
    [isPensioner, employeeInputs, pensionerInputs]
  );

  const floors = useMemo(() => deriveHraFloors(factorValue), [factorValue]);

  const outOfBand =
    !isPensioner &&
    band !== undefined &&
    basicValue > 0 &&
    (basicValue < band.minBasic || basicValue > band.maxBasic);

  const headlineBasic = isPensioner ? pensioner.revisedBasicPension : employee.revisedBasic;
  const headlineBasicChange = isPensioner ? pensioner.basicChange : employee.basicChange;
  const headlineBasicPercent = isPensioner ? pensioner.basicChangePercent : employee.basicChangePercent;
  const headlineGross = isPensioner ? pensioner.revisedTotal : employee.revisedGross;
  const headlineGrossChange = isPensioner ? pensioner.change : employee.grossChange;
  const headlineNet = isPensioner ? pensioner.revisedTotal : employee.revisedNet;
  const headlineArrears = isPensioner ? pensioner.arrears : employee.arrears;
  const arrearsMonths = isPensioner ? pensioner.arrearsMonths : employee.arrearsMonths;

  const buildShareUrl = () => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set(URL_KEYS.mode, mode);
    url.searchParams.set(URL_KEYS.basic, String(isPensioner ? numeric(basicPension) : basicValue));
    url.searchParams.set(URL_KEYS.ff, String(factorValue));
    url.searchParams.set(URL_KEYS.da, String(numeric(daPercent)));
    if (!isPensioner) {
      url.searchParams.set(URL_KEYS.level, payLevel);
      url.searchParams.set(URL_KEYS.city, cityClass);
      url.searchParams.set(URL_KEYS.tpta, transportCity);
      url.searchParams.set(URL_KEYS.scheme, pensionScheme);
      url.searchParams.set(URL_KEYS.group, employeeGroup);
    }
    return url.toString();
  };

  const shareScenario = async () => {
    const link = buildShareUrl();
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setShareStatus('Scenario link copied. It reopens this calculator with the same inputs.');
    } catch {
      window.history.replaceState({}, '', link);
      setShareStatus('Copy the URL from your address bar to share this scenario.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <p className="font-bold">Every figure below is a scenario, not an announcement</p>
        <p className="mt-1">
          The 8th Central Pay Commission was constituted on 3 November 2025 with an 18-month window to
          report, so recommendations are expected around mid-2027. No fitment factor, pay matrix, HRA
          structure, transport-allowance rate, pension formula or implementation date has been notified.
          You choose the multiplier; the calculator shows what it would mean.
        </p>
      </div>

      {/* Mode toggle */}
      <div
        role="group"
        aria-label="Calculator mode"
        className="inline-flex w-full rounded-2xl border border-slate-200 bg-slate-100 p-1 sm:w-auto"
      >
        {(['employee', 'pensioner'] as CalculatorMode[]).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={mode === option}
            onClick={() => setMode(option)}
            className={`flex-1 rounded-xl px-5 py-2.5 text-sm font-bold transition sm:flex-none ${
              mode === option ? 'bg-white text-brandDeepNavy shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {option === 'employee' ? 'Serving employee' : 'Pensioner'}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        {/* ---------------------------------------------------------------- inputs */}
        <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brandNavy">Your current 7th CPC pay</p>
            <h3 className="mt-1 text-lg font-bold text-brandDeepNavy">
              {isPensioner ? 'Enter your current basic pension' : 'Enter your current pay details'}
            </h3>
          </div>

          {isPensioner ? (
            <NumericField
              id="cpc-basic-pension"
              label="Current basic pension"
              unit="Rs / month"
              value={basicPension}
              onChange={setBasicPension}
              step={100}
              max={125_000}
              help="Basic pension before dearness relief, as shown on your pension payment order."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <NumericField
                  id="cpc-current-basic"
                  label="Current basic pay"
                  unit="Rs / month"
                  value={currentBasic}
                  onChange={setCurrentBasic}
                  step={100}
                  max={250_000}
                  help="Basic pay from your payslip, excluding DA, HRA and allowances."
                />
                {outOfBand && band ? (
                  <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                    Level {band.level} runs from {formatCurrency(band.minBasic)} to{' '}
                    {formatCurrency(band.maxBasic)} in the current matrix. The calculation still runs on the
                    figure you entered — check your level if that looks wrong.
                  </p>
                ) : null}
              </div>

              <label htmlFor="cpc-level" className="block">
                <span className="text-sm font-semibold text-slate-700">Pay level</span>
                <select
                  id="cpc-level"
                  value={payLevel}
                  onChange={(event) => {
                    setPayLevel(event.target.value);
                    setTransportOverride(null);
                    const nextBand = getPayLevelBand(event.target.value);
                    if (nextBand) setEmployeeGroup(nextBand.typicalGroup);
                  }}
                  className={selectClass}
                >
                  {PAY_LEVEL_BANDS.map((entry) => (
                    <option key={entry.level} value={entry.level}>
                      Level {entry.level} ({formatCurrency(entry.minBasic)}
                      {entry.fixedPay ? ' fixed' : `-${formatCurrency(entry.maxBasic)}`})
                    </option>
                  ))}
                </select>
              </label>

              <label htmlFor="cpc-city" className="block">
                <span className="text-sm font-semibold text-slate-700">City class (HRA)</span>
                <select
                  id="cpc-city"
                  value={cityClass}
                  onChange={(event) => setCityClass(event.target.value as CityClass)}
                  className={selectClass}
                >
                  {CITY_CLASSES.map((entry) => (
                    <option key={entry.value} value={entry.value}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </label>

              <label htmlFor="cpc-tpta" className="block">
                <span className="text-sm font-semibold text-slate-700">Transport allowance city</span>
                <select
                  id="cpc-tpta"
                  value={transportCity}
                  onChange={(event) => {
                    setTransportCity(event.target.value as TransportCityClass);
                    setTransportOverride(null);
                  }}
                  className={selectClass}
                >
                  {TRANSPORT_CITIES.map((entry) => (
                    <option key={entry.value} value={entry.value}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </label>

              <label htmlFor="cpc-scheme" className="block">
                <span className="text-sm font-semibold text-slate-700">Pension scheme</span>
                <select
                  id="cpc-scheme"
                  value={pensionScheme}
                  onChange={(event) => setPensionScheme(event.target.value as PensionScheme)}
                  className={selectClass}
                >
                  {SCHEMES.map((entry) => (
                    <option key={entry.value} value={entry.value}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </label>

              <label htmlFor="cpc-group" className="block sm:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Group (for CGEGIS)</span>
                <select
                  id="cpc-group"
                  value={employeeGroup}
                  onChange={(event) => setEmployeeGroup(event.target.value as EmployeeGroup)}
                  className={selectClass}
                >
                  {GROUPS.map((entry) => (
                    <option key={entry.value} value={entry.value}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {/* Fitment factor */}
          <div className="border-t border-slate-100 pt-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm font-semibold text-slate-700">Fitment factor scenario</span>
              <span className="text-lg font-black tabular-nums text-brandDeepNavy">
                {formatNumber(factorValue, 2)}x
              </span>
            </div>
            <input
              id="cpc-fitment-slider"
              type="range"
              min={1.5}
              max={3.5}
              step={0.01}
              value={factorValue}
              aria-label="Fitment factor"
              onChange={(event) => setFitmentFactor(Number(event.target.value))}
              className="mt-3 w-full accent-brandNavy"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {FITMENT_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  title={preset.note}
                  aria-pressed={factorValue === preset.value}
                  onClick={() => setFitmentFactor(preset.value)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-bold transition ${
                    factorValue === preset.value
                      ? 'border-brandNavy bg-brandNavy text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-brandNavy/40'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {FITMENT_PRESETS.find((preset) => preset.value === factorValue)?.note ??
                'A custom multiplier you selected. No factor has been recommended or notified.'}
            </p>
          </div>

          {/* DA */}
          <div className="border-t border-slate-100 pt-5">
            <label htmlFor="cpc-da" className="block">
              <span className="text-sm font-semibold text-slate-700">
                {isPensioner ? 'Current dearness relief' : 'Current DA at implementation'}
              </span>
              <select
                id="cpc-da"
                value={numeric(daPercent)}
                onChange={(event) => setDaPercent(Number(event.target.value))}
                className={selectClass}
              >
                {DA_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </label>
            {!DA_PRESETS.find((preset) => preset.value === numeric(daPercent))?.notified ? (
              <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                64% is a projection of the July 2026 revision. It has not been notified.
              </p>
            ) : null}
          </div>

          {!isPensioner ? (
            <details className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <summary className="cursor-pointer text-sm font-bold text-brandDeepNavy">
                Adjust transport allowance
              </summary>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                Transport allowance is a flat amount, not a percentage of basic pay, and no 8th CPC rate has
                been notified. The calculator carries your current entitlement forward unchanged. Level{' '}
                {payLevel} in a {transportCity === 'higher' ? 'higher TPTA city' : 'non-TPTA location'}{' '}
                currently draws {formatCurrency(defaultTransport)}.
              </p>
              <div className="mt-4">
                <NumericField
                  id="cpc-transport"
                  label="Transport allowance carried forward"
                  unit="Rs / month"
                  value={transportOverride === null ? defaultTransport : transportOverride}
                  onChange={setTransportOverride}
                  step={50}
                  max={25_000}
                />
              </div>
            </details>
          ) : null}
        </div>

        {/* ---------------------------------------------------------------- results */}
        <div className="space-y-4">
          <div
            aria-label="Estimated results"
            className="min-h-[420px] rounded-3xl border border-brandNavy/15 bg-brandNavy/5 p-5 shadow-sm md:p-6"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-brandNavy">
              Projection at {formatNumber(factorValue, 2)}x
            </p>

            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">
                {isPensioner ? 'Revised basic pension' : 'Revised basic pay'}
              </p>
              <p className="mt-1 text-4xl font-black tracking-tight tabular-nums text-emerald-700">
                {formatCurrency(headlineBasic)}
              </p>
              <p className="mt-1 text-sm font-semibold text-emerald-900">
                {formatSignedCurrency(headlineBasicChange)} ({formatSignedPercent(headlineBasicPercent)}) vs
                your current {isPensioner ? 'basic pension' : 'basic pay'}
              </p>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {isPensioner ? 'Estimated pension' : 'Estimated gross'}
                </p>
                <p className="mt-1 text-2xl font-black tabular-nums text-brandDeepNavy">
                  {formatCurrency(headlineGross)}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {formatSignedCurrency(headlineGrossChange)} vs {formatCurrency(
                    isPensioner ? pensioner.currentTotal : employee.currentGross
                  )}{' '}
                  today
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {isPensioner ? 'Dearness relief' : 'Estimated net'}
                </p>
                <p className="mt-1 text-2xl font-black tabular-nums text-brandDeepNavy">
                  {isPensioner ? formatCurrency(0) : formatCurrency(headlineNet)}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {isPensioner
                    ? 'DR restarts from zero on a new structure'
                    : 'After pension deduction and CGEGIS. Income tax not modelled.'}
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-sky-200 bg-sky-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-sky-800">
                Estimated arrears since {monthLabel(ARREARS_REFERENCE_ISO)}
              </p>
              <p className="mt-1 text-2xl font-black tabular-nums text-sky-900">
                {formatCurrency(headlineArrears)}
              </p>
              <p className="mt-1 text-xs leading-5 text-sky-950">
                {arrearsMonths} months to {monthLabel(arrearsThroughIso)}, at{' '}
                {formatCurrency(Math.max(0, headlineGrossChange))} a month.{' '}
                <strong>Conditional on retrospective implementation being notified</strong> — no effective
                date, arrears period or payment order has been published.
              </p>
            </div>

            {!isPensioner && employee.hraFloorApplied ? (
              <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
                Minimum-HRA floor applied. At {formatNumber(factorValue, 2)}x, {cityClass}-class HRA at{' '}
                {employee.revisedHraRate}% would be less than the {formatCurrency(employee.revisedHraFloor)}{' '}
                floor scaled from the current structure, so the floor is used instead.
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-slate-900">Share this scenario</p>
              <button
                type="button"
                onClick={shareScenario}
                className="rounded-xl border border-brandNavy bg-white px-4 py-2 text-sm font-semibold text-brandNavy transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-brandNavy/20"
              >
                Copy scenario link
              </button>
            </div>
            {shareStatus ? (
              <p className="mt-2 text-xs font-medium text-slate-700" role="status">
                {shareStatus}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------ scenario comparison */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h3 className="text-lg font-bold text-brandDeepNavy">
          Your pay under every fitment factor at once
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          The same {isPensioner ? 'pension' : 'employee'} across all five scenarios in circulation. None of
          these is a recommendation; showing them together is the honest alternative to naming one.
        </p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">
              Revised pay, gross, net and arrears under each fitment-factor scenario
            </caption>
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3">Factor</th>
                <th scope="col" className="px-4 py-3 text-right">
                  {isPensioner ? 'Revised basic pension' : 'Revised basic'}
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  {isPensioner ? 'Total pension' : 'Gross'}
                </th>
                {!isPensioner ? (
                  <th scope="col" className="px-4 py-3 text-right">Net</th>
                ) : null}
                <th scope="col" className="px-4 py-3 text-right">Change vs today</th>
                <th scope="col" className="px-4 py-3 text-right">Arrears</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scenarioRows.map((row) => (
                <tr
                  key={row.fitmentFactor}
                  className={row.fitmentFactor === factorValue ? 'bg-brandNavy/5' : undefined}
                >
                  <th scope="row" className="px-4 py-3 text-left font-bold text-slate-900">
                    {row.fitmentFactor.toFixed(2)}x
                    {row.hraFloorApplied ? (
                      <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                        floor
                      </span>
                    ) : null}
                  </th>
                  <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(row.revisedBasic)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(row.revisedGross)}</td>
                  {!isPensioner ? (
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(row.revisedNet)}</td>
                  ) : null}
                  <td
                    className={`px-4 py-3 text-right font-semibold tabular-nums ${
                      row.grossChange >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {formatSignedCurrency(row.grossChange)}
                    <span className="block text-xs font-normal text-slate-500">
                      {formatSignedPercent(row.grossChangePercent)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(row.arrears)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Arrears assume accrual from {monthLabel(ARREARS_REFERENCE_ISO)} to {monthLabel(arrearsThroughIso)}{' '}
          and depend entirely on retrospective implementation being notified. A &ldquo;floor&rdquo; tag means
          the minimum-HRA floor applied at that factor.
        </p>
      </section>

      {/* --------------------------------------------------------------- breakdown */}
      <details className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <summary className="cursor-pointer text-lg font-bold text-brandDeepNavy">
          Component-by-component breakdown
        </summary>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3">Component</th>
                <th scope="col" className="px-4 py-3 text-right">Now (7th CPC)</th>
                <th scope="col" className="px-4 py-3 text-right">Scenario at {formatNumber(factorValue, 2)}x</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isPensioner ? (
                <>
                  <tr>
                    <th scope="row" className="px-4 py-3 text-left font-semibold">Basic pension</th>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(pensioner.currentBasicPension)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(pensioner.revisedBasicPension)}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="px-4 py-3 text-left font-semibold">
                      Dearness relief ({formatNumber(pensioner.currentDrPercent, 0)}% &rarr; 0%)
                    </th>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(pensioner.currentDr)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(0)}</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <th scope="row" className="px-4 py-3 text-left">Total pension</th>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(pensioner.currentTotal)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(pensioner.revisedTotal)}</td>
                  </tr>
                </>
              ) : (
                <>
                  <tr>
                    <th scope="row" className="px-4 py-3 text-left font-semibold">Basic pay</th>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(employee.currentBasic)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(employee.revisedBasic)}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="px-4 py-3 text-left font-semibold">
                      DA ({formatNumber(employee.currentDaPercent, 0)}% &rarr; 0%)
                    </th>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(employee.currentDa)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(employee.revisedDa)}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="px-4 py-3 text-left font-semibold">
                      HRA ({employee.currentHraRate}% &rarr; {employee.revisedHraRate}%)
                      {employee.hraFloorApplied ? (
                        <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                          floor applied
                        </span>
                      ) : null}
                    </th>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(employee.currentHra)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(employee.revisedHra)}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="px-4 py-3 text-left font-semibold">Transport allowance</th>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(employee.transportAllowance)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(employee.transportAllowance)}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="px-4 py-3 text-left font-semibold">DA on transport allowance</th>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(employee.currentDaOnTransport)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(0)}</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <th scope="row" className="px-4 py-3 text-left">Gross</th>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(employee.currentGross)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(employee.revisedGross)}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="px-4 py-3 text-left font-semibold">
                      {pensionScheme} employee contribution ({employee.schemeEmployeeRate}%)
                    </th>
                    <td className="px-4 py-3 text-right tabular-nums">
                      -{formatCurrency(employee.currentEmployeeContribution)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      -{formatCurrency(employee.revisedEmployeeContribution)}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className="px-4 py-3 text-left font-semibold">CGEGIS (Group {employeeGroup})</th>
                    <td className="px-4 py-3 text-right tabular-nums">-{formatCurrency(employee.cgegis)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">-{formatCurrency(employee.cgegis)}</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <th scope="row" className="px-4 py-3 text-left">Net (before income tax)</th>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(employee.currentNet)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(employee.revisedNet)}</td>
                  </tr>
                  <tr className="text-slate-500">
                    <th scope="row" className="px-4 py-3 text-left font-semibold">
                      {pensionScheme} government contribution ({employee.schemeGovernmentRate}%) — CTC only
                    </th>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatCurrency(employee.currentGovernmentContribution)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatCurrency(employee.revisedGovernmentContribution)}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
        {!isPensioner ? (
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {SCHEME_CONTRIBUTIONS[pensionScheme].note} The government contribution is an employer cost shown
            as a CTC line, not a deduction from your take-home pay. Minimum-HRA floors at{' '}
            {formatNumber(factorValue, 2)}x: X {formatCurrency(floors.X)}, Y {formatCurrency(floors.Y)}, Z{' '}
            {formatCurrency(floors.Z)}.
          </p>
        ) : null}
      </details>

      <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-600">
        <strong>Disclaimer.</strong> All figures are projections based on a multiplier you selected. The 8th
        Central Pay Commission has not finalised the fitment factor, pay matrix, HRA structure, transport
        allowance or pension formula, and the government has not issued a resolution or implementation date.
        Income tax, professional tax, licence fee and department-specific allowances are not modelled.
        Educational information only, not personal financial advice.
      </p>

      {tool ? <CalculatorGovernanceStrip tool={tool} /> : null}
    </div>
  );
}
