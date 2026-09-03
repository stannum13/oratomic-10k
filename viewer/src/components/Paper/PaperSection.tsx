"use client";

import { Math } from "@/components/ui/Math";
import { InfoMarker } from "@/components/ui/InfoMarker";
import { GLOSSARY } from "@/lib/glossary";
import { useSimulator } from "@/store/simulator";

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

      <AnnotatedText text={body} />

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
        <button
          onClick={() => {
            if (hint.includes("Simulate")) {
              useSimulator.getState().setMode("simulate");
            } else if (hint.includes("Construct")) {
              useSimulator.getState().setMode("simulate");
              useSimulator.getState().computeLiveCode();
            } else if (hint.includes("preset")) {
              useSimulator.getState().setMode("simulate");
            }
          }}
          style={{
            display: "block",
            width: "100%",
            textAlign: "left",
            marginTop: "var(--s4)",
            padding: "var(--s3) var(--s4)",
            background: "var(--bg-elevated)",
            border: "none",
            borderRadius: 3,
            fontSize: "var(--fs-label)",
            color: "var(--text-tertiary)",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "color 200ms",
          }}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "var(--text-secondary)"; }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "var(--text-tertiary)"; }}
        >
          {"\u2192"} {hint}
        </button>
      )}

      {children}
    </div>
  );
}

function AnnotatedText({ text }: { text: string }) {
  // Find glossary terms in the text and wrap them with info markers
  const terms = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length); // longest first
  const parts: (string | { term: string; match: string })[] = [];
  let remaining = text;
  const usedTerms = new Set<string>();

  while (remaining.length > 0) {
    let earliestIdx = remaining.length;
    let earliestTerm = "";
    let earliestMatch = "";

    for (const term of terms) {
      if (usedTerms.has(term)) continue;
      const lowerTerm = term.toLowerCase();
      const idx = remaining.toLowerCase().indexOf(lowerTerm);
      if (idx !== -1 && idx < earliestIdx) {
        earliestIdx = idx;
        earliestTerm = term;
        earliestMatch = remaining.substring(idx, idx + term.length);
      }
    }

    if (earliestTerm) {
      if (earliestIdx > 0) {
        parts.push(remaining.substring(0, earliestIdx));
      }
      parts.push({ term: earliestTerm, match: earliestMatch });
      usedTerms.add(earliestTerm);
      remaining = remaining.substring(earliestIdx + earliestTerm.length);
    } else {
      parts.push(remaining);
      break;
    }
  }

  return (
    <p style={{
      fontSize: "var(--fs-body)",
      color: "var(--text-secondary)",
      lineHeight: "var(--lh-body)",
      marginBottom: "var(--s5)",
    }}>
      {parts.map((part, i) => {
        if (typeof part === "string") return <span key={i}>{part}</span>;
        return (
          <InfoMarker key={i} term={part.term} definition={GLOSSARY[part.term]} match={part.match} />
        );
      })}
    </p>
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
