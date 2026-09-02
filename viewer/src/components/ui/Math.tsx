"use client";

import katex from "katex";
import { useMemo } from "react";

interface MathProps {
  tex: string;
  display?: boolean;
  className?: string;
}

/**
 * Render LaTeX math using KaTeX.
 * Inline by default, display mode optional.
 */
export function Math({ tex, display = false, className = "" }: MathProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, {
        displayMode: display,
        throwOnError: false,
        strict: false,
        trust: true,
      });
    } catch {
      return tex;
    }
  }, [tex, display]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Render code parameters [[n, k, d]] in math notation.
 */
export function CodeParams({ n, k, d }: { n: number; k: number; d: number }) {
  return (
    <Math
      tex={`[\\![${n.toLocaleString()},\\, ${k.toLocaleString()},\\, \\leq ${d}]\\!]`}
      className=""
    />
  );
}
