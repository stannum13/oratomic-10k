"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/Layout/Header";
import { decodeConfig } from "@/lib/url-state";
import { StatusBar } from "@/components/Layout/StatusBar";
import { ComparisonStrip } from "@/components/Layout/ComparisonStrip";
import { PaperSection } from "@/components/Paper/PaperSection";
import { SectionTracker } from "@/components/Paper/SectionTracker";
import { SeedMatrixDisplay } from "@/components/Paper/SeedMatrixDisplay";
import { ControlPanel } from "@/components/Simulator/ControlPanel";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { EmissionLegend } from "@/components/Scene/EmissionLegend";
import { KeyboardShortcuts } from "@/components/ui/KeyboardShortcuts";
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

const SECTION_HINTS: Record<string, string> = {
  architecture: "Switch to Simulate mode to adjust architecture parameters",
  codes: "Click 'Construct LP Code' in Simulate mode to build the Tanner graph",
  resources: "Try the preset configurations to explore different tradeoffs",
};

function SectionTabs() {
  const activeSection = useSimulator((s) => s.activeSection);

  return (
    <div style={{
      display: "flex",
      padding: `var(--s3) var(--s4)`,
      borderBottom: `1px solid var(--border)`,
      position: "sticky",
      top: 0,
      zIndex: 10,
      background: "var(--bg-pane-left)",
      overflowX: "auto",
      flexWrap: "nowrap",
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
                  hint={SECTION_HINTS[section.id]}
                >
                  {section.id === "codes" && activeSection === i && <SeedMatrixDisplay />}
                </PaperSection>
              </div>
            </SectionTracker>
          ))}
        </div>
        {mode === "paper" && activeSection === 0 && (
          <div style={{
            position: "sticky",
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            padding: "var(--s5)",
            background: "linear-gradient(transparent, var(--bg-pane-left))",
            pointerEvents: "none",
          }}>
            <div style={{
              fontSize: "var(--fs-label)",
              color: "var(--text-tertiary)",
              letterSpacing: "var(--tracking-label)",
              textTransform: "uppercase",
              animation: "fade-up 2s ease infinite alternate",
            }}>
              scroll to explore
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function SceneInfo() {
  const [show, setShow] = useState(false);
  const activeSection = useSimulator((s) => s.activeSection);
  const mode = useSimulator((s) => s.mode);

  const descriptions: Record<number, string> = {
    0: "Four functional zones of a neutral-atom quantum processor: memory stores logical qubits, processor executes gates, operation zone performs syndrome measurements, resource zone generates magic states.",
    1: "Reconfigurable atom arrays enable nonlocal connectivity for high-rate qLDPC codes. Each dot represents a physical qubit trapped in an optical tweezer.",
    2: "The memory zone encodes logical qubits using lifted-product codes with ~30% encoding rate. The overlay shows stabilizer connectivity from the Tanner graph.",
    3: "Logical qubits teleport from memory to processor for computation, then return. Watch for blue flashes during syndrome extraction rounds.",
    4: "The resource zone distills magic states using 8T-to-CCZ protocols. Blue flashes indicate successful distillation; red indicates discarded attempts.",
    5: "Architecture-level view showing total qubit and runtime requirements across different design tradeoffs.",
    6: "Full simulator mode. Adjust parameters to explore the architecture design space.",
  };

  const desc = descriptions[activeSection] || descriptions[0];

  return (
    <div style={{ position: "absolute", top: "var(--s3)", right: "var(--s3)", zIndex: 2 }}>
      <button
        onClick={() => setShow(!show)}
        style={{
          width: 24, height: 24,
          borderRadius: "50%",
          background: show ? "var(--bg-elevated)" : "transparent",
          border: `1px solid var(--border)`,
          color: "var(--text-tertiary)",
          fontSize: 12,
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        ?
      </button>
      {show && (
        <div style={{
          position: "absolute", top: 32, right: 0,
          width: 280,
          padding: "var(--s4)",
          background: "var(--bg-elevated)",
          border: `1px solid var(--border)`,
          borderRadius: 3,
          fontSize: "var(--fs-label)",
          lineHeight: 1.6,
          color: "var(--text-secondary)",
        }}>
          {mode === "simulate" ? descriptions[6] : desc}
        </div>
      )}
    </div>
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
      <KeyboardShortcuts />
      <Header />
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <div className="pane-left" style={{ width: "38%", overflowY: "auto", flexShrink: 0 }}>
          <LeftPane />
        </div>
        <div className="pane-right" style={{ flex: 1, position: "relative" }}>
          {/* Watermark */}
          <div style={{
            position: "absolute",
            bottom: "var(--s7)",
            left: "var(--s7)",
            zIndex: 1,
            fontFamily: "var(--font-display)",
            fontSize: 72,
            fontWeight: 200,
            color: "#0F1218",
            letterSpacing: "-0.02em",
            userSelect: "none",
            pointerEvents: "none",
          }}>
            10,000
          </div>
          <SceneInfo />
          <EmissionLegend />
          <ErrorBoundary fallback={
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "var(--bg)" }}>
              <span style={{ color: "var(--text-tertiary)", fontSize: "var(--fs-label)" }}>3D viewport unavailable</span>
            </div>
          }>
            <Viewport />
          </ErrorBoundary>
        </div>
      </div>
      <ComparisonStrip />
      <StatusBar />
    </div>
  );
}
