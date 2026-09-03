"use client";

import { useState } from "react";

interface InfoMarkerProps {
  term: string;
  definition: string;
  children?: React.ReactNode;
}

export function InfoMarker({ term, definition }: InfoMarkerProps) {
  const [show, setShow] = useState(false);

  return (
    <span style={{ position: "relative", display: "inline" }}>
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          color: "var(--text-tertiary)",
          fontSize: 8,
          cursor: "help",
          verticalAlign: "super",
          marginLeft: 2,
          padding: 0,
          lineHeight: 1,
          fontFamily: "var(--font-body)",
        }}
        aria-label={`Info: ${term}`}
      >
        i
      </button>
      {show && (
        <span style={{
          position: "absolute",
          bottom: "calc(100% + 4px)",
          left: "50%",
          transform: "translateX(-50%)",
          width: 240,
          padding: "var(--s3)",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 3,
          fontSize: "var(--fs-label)",
          lineHeight: 1.5,
          color: "var(--text-secondary)",
          zIndex: 50,
          pointerEvents: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}>
          <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: 4 }}>
            {term}
          </strong>
          {definition}
        </span>
      )}
    </span>
  );
}
