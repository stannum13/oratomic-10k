"use client";

import { Math } from "@/components/ui/Math";

interface PaperSectionProps {
  title: string;
  subtitle?: string;
  body: string;
  keyInsight: string;
  equation?: string;
  zones?: Array<{ name: string; role: string; color: string }>;
  isActive: boolean;
  children?: React.ReactNode;
}

export function PaperSection({
  title,
  subtitle,
  body,
  keyInsight,
  equation,
  zones,
  isActive,
  children,
}: PaperSectionProps) {
  return (
    <div
      className={`min-h-[70vh] py-10 pl-5 transition-all duration-500 border-l-[1.5px] ${
        isActive
          ? "opacity-100 border-[var(--accent)]"
          : "opacity-25 border-transparent hover:opacity-40"
      }`}
    >
      <h2 className="text-[18px] font-medium text-[var(--text-primary)] mb-1 tracking-[-0.01em]">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[11px] text-[var(--text-tertiary)] mb-6 font-light">{subtitle}</p>
      )}

      <p className="text-[13px] text-[var(--text-secondary)] leading-[1.75] mb-6 font-light">
        {body}
      </p>

      {equation && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[4px] px-5 py-3.5 mb-6">
          <Math tex={equationToTex(equation)} display className="text-[var(--accent)]" />
        </div>
      )}

      {zones && (
        <div className="grid grid-cols-2 gap-2 mb-6">
          {zones.map((z) => (
            <div
              key={z.name}
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[4px] p-3 hover:bg-[var(--bg-hover)] transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-[5px] h-[5px] rounded-full"
                  style={{ backgroundColor: z.color }}
                />
                <span className="text-[12px] font-medium text-[var(--text-primary)]">
                  {z.name}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed font-light">
                {z.role}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-start gap-2.5 bg-[var(--accent-muted)] border border-[rgba(99,102,241,0.08)] rounded-[4px] p-3">
        <div className="w-[4px] h-[4px] rounded-full bg-[var(--accent)] mt-[5px] shrink-0 opacity-60" />
        <p className="text-[11px] text-[var(--accent)] leading-relaxed font-light opacity-70">
          {keyInsight}
        </p>
      </div>

      {children}
    </div>
  );
}

/** Convert plain-text equation strings to LaTeX */
function equationToTex(eq: string): string {
  return eq
    .replace(/\[\[/g, '[\\![')
    .replace(/\]\]/g, ']\\!]')
    .replace(/\u2265/g, '\\geq ')
    .replace(/\u2264/g, '\\leq ')
    .replace(/\u00b7/g, '\\cdot ')
    .replace(/\u2212/g, '-')
    .replace(/\u03c4/g, '\\tau ')
    .replace(/\u03b2/g, '\\beta ')
    .replace(/\u03b3/g, '\\gamma ')
    .replace(/\u2113/g, '\\ell ')
    .replace(/\u00b2/g, '^2')
    .replace(/_A/g, '_A')
    .replace(/_i/g, '_i')
    .replace(/_s/g, '_s')
    .replace(/r\u00b2/g, 'r^2')
    .replace(/n\u00b2/g, 'n^2')
    .replace(/\u2248/g, '\\approx ');
}
