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
      <div style={{ position: "relative", height: 20, display: "flex", alignItems: "center" }}>
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
          style={{
            width: "100%",
            height: 3,
            appearance: "none",
            WebkitAppearance: "none",
            background: `linear-gradient(to right, var(--text-tertiary) ${((sliderValue - sliderMin) / (sliderMax - sliderMin)) * 100}%, var(--border) ${((sliderValue - sliderMin) / (sliderMax - sliderMin)) * 100}%)`,
            borderRadius: 2,
            outline: "none",
            cursor: "pointer",
          }}
          className="[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--text-primary)] [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing"
        />
      </div>
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
      <div role="radiogroup" aria-label={label} style={{ display: "flex", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 3, padding: 1, gap: 1 }}>
        {options.map((opt) => (
          <button
            key={opt.value}
            role="radio"
            aria-checked={value === opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              padding: "5px 8px",
              fontSize: "var(--fs-label)",
              fontWeight: 500,
              borderRadius: 2,
              border: "none",
              cursor: "pointer",
              transition: "all 200ms",
              background: value === opt.value ? "var(--bg-elevated)" : "transparent",
              color: value === opt.value ? "var(--text-primary)" : "var(--text-tertiary)",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
