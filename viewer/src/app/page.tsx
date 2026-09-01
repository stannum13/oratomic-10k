"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/Layout/Header";
import { decodeConfig } from "@/lib/url-state";
import { StatusBar } from "@/components/Layout/StatusBar";
import { PaperSection } from "@/components/Paper/PaperSection";
import { SectionTracker } from "@/components/Paper/SectionTracker";
import { SeedMatrixDisplay } from "@/components/Paper/SeedMatrixDisplay";
import { ControlPanel } from "@/components/Simulator/ControlPanel";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useSimulator } from "@/store/simulator";
import paperData from "../../public/data/paper-sections.json";

const Viewport = dynamic(
  () => import("@/components/Scene/Viewport").then((m) => ({ default: m.Viewport })),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-full" style={{ background: "var(--bg)" }}>
      <span style={{ color: "var(--text-tertiary)", fontSize: "var(--fs-label)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase" as const }}>
        Initializing
      </span>
    </div>
  )},
);

const SECTION_LABELS = ["Overview", "Architecture", "Codes", "Surgery", "Magic", "Resources", "Simulator"];

function SectionTabs() {
  const activeSection = useSimulator((s) => s.activeSection);

  return (
    <div style={{
      display: "flex",
      padding: `var(--s3) var(--s6)`,
      borderBottom: `1px solid var(--border)`,
      position: "sticky",
      top: 0,
      zIndex: 10,
      background: "var(--bg-pane-left)",
    }}>
      {SECTION_LABELS.map((name, i) => (
        <button
          key={i}
          className="tab"
          aria-selected={activeSection === i}
          onClick={() => {
            const el = document.querySelector(`[data-section="${i}"]`);
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          {name}
        </button>
      ))}
    </div>
  );
}

function LeftPane() {
  const mode = useSimulator((s) => s.mode);
  const activeSection = useSimulator((s) => s.activeSection);

  if (mode === "simulate") {
    return <ControlPanel />;
  }

  return (
    <>
      <SectionTabs />
      <div style={{ padding: `var(--s7) var(--s6)` }}>
        <div className="article">
          {paperData.sections.map((section, i) => (
            <SectionTracker key={section.id} sectionIndex={i}>
              <div data-section={i}>
                <PaperSection
                  title={section.title}
                  subtitle={"subtitle" in section ? (section as Record<string, unknown>).subtitle as string : undefined}
                  body={section.body}
                  keyInsight={section.keyInsight}
                  equation={"equation" in section ? (section as Record<string, unknown>).equation as string : undefined}
                  zones={"zones" in section ? (section as Record<string, unknown>).zones as Array<{ name: string; role: string; color: string }> : undefined}
                  isActive={activeSection === i}
                >
                  {section.id === "codes" && activeSection === i && <SeedMatrixDisplay />}
                </PaperSection>
              </div>
            </SectionTracker>
          ))}
        </div>
      </div>
    </>
  );
}

export default function Home() {
  useEffect(() => {
    const config = decodeConfig(window.location.search);
    if (!config) return;
    const store = useSimulator.getState();
    if (config.p) store.setPhysicalErrorRate(config.p);
    if (config.t) store.setCycleTime(config.t);
    if (config.a) store.setArchitectureType(config.a);
    if (config.prob) store.setTargetProblem(config.prob);
    if (config.mem) store.setMemoryCode(config.mem);
    if (config.proc) store.setProcessorCode(config.proc);
    if (config.a || config.p) store.setMode("simulate");
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>
      <Header />
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <div className="pane-left" style={{ width: "38%", overflowY: "auto", flexShrink: 0 }}>
          <LeftPane />
        </div>
        <div className="pane-right" style={{ flex: 1, position: "relative" }}>
          {/* Watermark */}
          <div className="watermark" style={{ position: "absolute", bottom: "var(--s7)", right: "var(--s6)", zIndex: 1 }}>
            10,000
          </div>
          <ErrorBoundary fallback={
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "var(--bg)" }}>
              <span style={{ color: "var(--text-tertiary)", fontSize: "var(--fs-label)" }}>3D viewport unavailable</span>
            </div>
          }>
            <Viewport />
          </ErrorBoundary>
        </div>
      </div>
      <StatusBar />
    </div>
  );
}
