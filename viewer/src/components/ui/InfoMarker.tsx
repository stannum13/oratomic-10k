"use client";

import { useState, useRef, useEffect } from "react";

interface InfoMarkerProps {
  term: string;
  definition: string;
  match: string;
}

export function InfoMarker({ term, definition, match }: InfoMarkerProps) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState<"above" | "below">("above");
  const triggerRef = useRef<HTMLSpanElement>(null);

  // Detect if tooltip would clip above — if so, show below
  useEffect(() => {
    if (show && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      if (rect.top < 260) {
        setPosition("below");
      } else {
        setPosition("above");
      }
    }
  }, [show]);

  return (
    <span
      ref={triggerRef}
      style={{ position: "relative", display: "inline" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span
        style={{
          borderBottom: "1px dotted var(--text-tertiary)",
          cursor: "help",
          transition: "border-color 200ms",
        }}
        onMouseEnter={(e) => { (e.target as HTMLElement).style.borderBottomColor = "var(--text-secondary)"; }}
        onMouseLeave={(e) => { (e.target as HTMLElement).style.borderBottomColor = "var(--text-tertiary)"; }}
      >
        {match}
      </span>
      {show && (
        <span style={{
          position: "absolute",
          [position === "above" ? "bottom" : "top"]: "calc(100% + 6px)",
          left: 0,
          width: 260,
          padding: "var(--s3)",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 3,
          fontSize: "var(--fs-label)",
          lineHeight: 1.5,
          color: "var(--text-secondary)",
          zIndex: 50,
          boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        }}>
          <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: 3, fontSize: "var(--fs-label)" }}>
            {term}
          </strong>
          {definition}
        </span>
      )}
    </span>
  );
}
