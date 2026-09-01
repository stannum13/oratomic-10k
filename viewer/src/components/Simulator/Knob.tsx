"use client";

interface SliderKnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  logarithmic?: boolean;
  onChange: (v: number) => void;
  formatValue?: (v: number) => string;
}

export function SliderKnob({
  label,
  value,
  min,
  max,
  step,
  unit,
  logarithmic,
  onChange,
  formatValue,
}: SliderKnobProps) {
  const displayValue = formatValue ? formatValue(value) : value.toString();

  const sliderValue = logarithmic ? Math.log10(value) : value;
  const sliderMin = logarithmic ? Math.log10(min) : min;
  const sliderMax = logarithmic ? Math.log10(max) : max;
  const sliderStep = logarithmic ? 0.01 : step;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[11px] text-[var(--text-tertiary)]">{label}</span>
        <span className="text-[11px] mono font-medium text-[var(--text-secondary)]">
          {displayValue}
          {unit && <span className="text-[var(--text-quaternary)] ml-0.5">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        aria-label={label}
        aria-valuetext={displayValue + (unit ? ` ${unit}` : "")}
        min={sliderMin}
        max={sliderMax}
        step={sliderStep}
        value={sliderValue}
        onChange={(e) => {
          const raw = parseFloat(e.target.value);
          onChange(logarithmic ? Math.pow(10, raw) : raw);
        }}
        className="w-full h-[3px] bg-[var(--border-default)] rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[14px]
          [&::-webkit-slider-thumb]:h-[14px] [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-[var(--accent)]
          [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(99,102,241,0.3)]
          [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing
          [&::-webkit-slider-thumb]:transition-shadow
          [&::-webkit-slider-thumb]:hover:shadow-[0_0_12px_rgba(99,102,241,0.5)]"
      />
    </div>
  );
}

interface ToggleKnobProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}

export function ToggleKnob<T extends string>({
  label,
  value,
  options,
  onChange,
}: ToggleKnobProps<T>) {
  return (
    <div className="mb-3">
      {label && (
        <span className="text-[11px] text-[var(--text-tertiary)] block mb-1.5">{label}</span>
      )}
      <div role="radiogroup" aria-label={label} className="flex gap-px bg-[var(--border-subtle)] rounded-[4px] p-px">
        {options.map((opt) => (
          <button
            key={opt.value}
            role="radio"
            aria-checked={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 px-2.5 py-[5px] text-[11px] font-medium rounded-[3px] transition-all ${
              value === opt.value
                ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                : "bg-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
