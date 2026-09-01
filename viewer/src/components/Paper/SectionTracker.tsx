"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSimulator } from "@/store/simulator";

interface SectionTrackerProps {
  sectionIndex: number;
  children: React.ReactNode;
}

export function SectionTracker({ sectionIndex, children }: SectionTrackerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const setActiveSection = useSimulator((s) => s.setActiveSection);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(sectionIndex);
        }
      });
    },
    [sectionIndex, setActiveSection],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "-40% 0px -40% 0px",
      threshold: 0,
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersection]);

  return <div ref={ref}>{children}</div>;
}
