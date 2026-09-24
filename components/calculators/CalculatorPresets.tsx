'use client';

export type CalculatorPreset = {
  id: string;
  label: string;
  description?: string;
  values: Record<string, number | string | boolean>;
};

type CalculatorPresetsProps = {
  presets: CalculatorPreset[];
  activePresetId?: string | null;
  onApply: (preset: CalculatorPreset) => void;
  title?: string;
  note?: string;
  className?: string;
};

export default function CalculatorPresets({
  presets,
  activePresetId,
  onApply,
  title = 'Try an example scenario',
  note = 'Presets are illustrative example scenarios, not recommendations. Adjust any input after applying one.',
  className,
}: CalculatorPresetsProps) {
  if (presets.length === 0) return null;

  const activePreset = presets.find((preset) => preset.id === activePresetId);

  return (
    <div
      className={`rounded-2xl border border-brandBorder bg-slate-50 p-4 ${className ?? ''}`}
      role="group"
      aria-label={title}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-slate-700">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {presets.map((preset) => {
          const isActive = preset.id === activePresetId;
          return (
            <button
              key={preset.id}
              type="button"
              aria-pressed={isActive}
              title={preset.description}
              onClick={() => onApply(preset)}
              className={`min-h-11 rounded-full border px-3.5 py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brandNavy focus-visible:ring-offset-2 md:text-sm ${
                isActive
                  ? 'border-brandNavy bg-brandNavy text-white shadow-sm'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-brandNavy hover:text-brandNavy'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      {activePreset?.description ? (
        <p className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-600">
          <span className="font-semibold text-slate-800">{activePreset.label}:</span> {activePreset.description}
        </p>
      ) : null}
      <p className="mt-3 text-[11px] leading-4 text-slate-500">{note}</p>
    </div>
  );
}
