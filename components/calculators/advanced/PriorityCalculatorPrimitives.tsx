import type { Tool } from '@/lib/tools';

export type NumericValue = number | '';

export function numeric(value: NumericValue) {
  return value === '' ? 0 : value;
}

export function formatCurrency(value: number) {
  if (!Number.isFinite(value)) return 'Check inputs';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, maximumFractionDigits = 1) {
  if (!Number.isFinite(value)) return 'Check inputs';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits }).format(value);
}

export function NumericField({
  id,
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  unit,
  help,
}: {
  id: string;
  label: string;
  value: NumericValue;
  onChange: (value: NumericValue) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  help?: string;
}) {
  const helpId = help ? `${id}-help` : undefined;

  return (
    <label htmlFor={id} className="block">
      <span className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
        {label}
        {unit ? <span className="text-xs font-medium text-slate-500">{unit}</span> : null}
      </span>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        aria-describedby={helpId}
        value={value}
        min={min}
        max={max}
        step={step}
        onFocus={(event) => event.currentTarget.select()}
        onChange={(event) => {
          if (event.target.value === '') return onChange('');
          const next = Number(event.target.value);
          if (!Number.isFinite(next)) return;
          onChange(Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min, next)));
        }}
        className="mt-2 min-h-11 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-950 outline-none transition focus:border-brandNavy focus:bg-white focus:ring-4 focus:ring-brandNavy/10"
      />
      {help ? <span id={helpId} className="mt-1.5 block text-xs leading-5 text-slate-500">{help}</span> : null}
    </label>
  );
}

export function ResultCard({
  label,
  value,
  detail,
  emphasis = false,
}: {
  label: string;
  value: string;
  detail?: string;
  emphasis?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${emphasis ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-black tracking-tight ${emphasis ? 'text-emerald-700' : 'text-brandDeepNavy'}`}>
        {value}
      </p>
      {detail ? <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p> : null}
    </div>
  );
}

export function CalculatorGovernanceStrip({ tool }: { tool: Tool }) {
  if (!tool.calculationVersion && !tool.factsCheckedIso) return null;
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
      {tool.calculationVersion ? <span><strong>Calculation version:</strong> {tool.calculationVersion}</span> : null}
      {tool.factsCheckedIso ? <span><strong>Facts checked:</strong> {tool.factsCheckedIso}</span> : null}
      <span><strong>Privacy:</strong> values stay in this browser</span>
    </div>
  );
}
