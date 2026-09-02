"use client";

import { Math } from "@/components/ui/Math";

interface PaperSectionProps {
  title: string;
  subtitle?: string;
  body: string;
  keyInsight: string;
  equation?: string;
  zones?: Array<{ name: string; role: string; color: string }>;
  hint?: string;
  isActive: boolean;
  children?: React.ReactNode;
}

export function PaperSection({
  title, subtitle, body, keyInsight, equation, zones, hint, isActive, children,
}: PaperSectionProps) {
  return (
    <div style={{
      minHeight: "70vh",
      paddingTop: "var(--s7)",
      paddingBottom: "var(--s7)",
      opacity: isActive ? 1 : 0.25,
      transition: `opacity var(--dur-scale) var(--ease-ui)`,
    }}>
      <h2 style={{
        fontSize: "var(--fs-h2)",
        fontWeight: 500,
        lineHeight: "var(--lh-heading)",
        color: "var(--text-primary)",
        marginBottom: "var(--s1)",
      }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: "var(--fs-label)", color: "var(--text-tertiary)", marginBottom: "var(--s5)" }}>
          {subtitle}
        </p>
      )}

      <p style={{
        fontSize: "var(--fs-body)",
        color: "var(--text-secondary)",
        lineHeight: "var(--lh-body)",
        marginBottom: "var(--s5)",
      }}>
        {body}
      </p>

      {equation && (
        <div style={{
          background: "var(--bg-elevated)",
          padding: `var(--s4) var(--s5)`,
          marginBottom: "var(--s5)",
          borderRadius: 3,
        }}>
          <Math tex={equationToTex(equation)} display className="mono" />
        </div>
      )}

      {zones && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s2)", marginBottom: "var(--s5)" }}>
          {zones.map((z) => (
            <div key={z.name} className="card" style={{ borderRadius: 3 }}>
              <div style={{ fontSize: "var(--fs-label)", fontWeight: 500, color: "var(--text-primary)", marginBottom: "var(--s1)" }}>
                {z.name}
              </div>
              <div style={{ fontSize: "var(--fs-label)", color: "var(--text-tertiary)", lineHeight: 1.5 }}>
                {z.role}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="callout" style={{ borderRadius: 3 }}>
        <p style={{ fontSize: "var(--fs-label)", lineHeight: 1.6, margin: 0, color: "var(--text-secondary)" }}>
          {keyInsight}
        </p>
      </div>

      {hint && isActive && (
        <div style={{
          marginTop: "var(--s4)",
          padding: "var(--s3) var(--s4)",
          background: "var(--bg-elevated)",
          borderRadius: 3,
          fontSize: "var(--fs-label)",
          color: "var(--text-tertiary)",
        }}>
          {hint}
        </div>
      )}

      {children}
    </div>
  );
}

function equationToTex(eq: string): string {
  return eq
    .replace(/\[\[/g, '[\\![').replace(/\]\]/g, ']\\!]')
    .replace(/\u2265/g, '\\geq ').replace(/\u2264/g, '\\leq ')
    .replace(/\u00b7/g, '\\cdot ').replace(/\u2212/g, '-')
    .replace(/\u03c4/g, '\\tau ').replace(/\u03b2/g, '\\beta ')
    .replace(/\u03b3/g, '\\gamma ').replace(/\u2113/g, '\\ell ')
    .replace(/\u00b2/g, '^2').replace(/\u2248/g, '\\approx ');
}
