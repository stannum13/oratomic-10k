"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/Layout/Header";
import { decodeConfig } from "@/lib/url-state";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { StatusBar } from "@/components/Layout/StatusBar";
import { PaperSection } from "@/components/Paper/PaperSection";
import { SectionTracker } from "@/components/Paper/SectionTracker";
import { SeedMatrixDisplay } from "@/components/Paper/SeedMatrixDisplay";
import { ControlPanel } from "@/components/Simulator/ControlPanel";
import { useSimulator } from "@/store/simulator";
import paperData from "../../public/data/paper-sections.json";

const Viewport = dynamic(
  () => import("@/components/Scene/Viewport").then((m) => ({ default: m.Viewport })),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-3 h-3 rounded-full bg-[#00d4ff] mx-auto mb-3 pulse-glow" />
        <span className="text-[10px] text-white/20 tracking-[0.2em] uppercase">Initializing viewport</span>
      </div>
    </div>
  )},
);

function SectionNav() {
  const activeSection = useSimulator((s) => s.activeSection);
  const sectionNames = ["Overview", "Architecture", "Codes", "Surgery", "Magic", "Resources", "Simulator"];

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-white/[0.04] bg-black/50 backdrop-blur-sm sticky top-0 z-10">
      {sectionNames.map((name, i) => (
        <button
          key={i}
          onClick={() => {
            const el = document.querySelector(`[data-section="${i}"]`);
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className={`px-2 py-1 text-[9px] tracking-[0.15em] uppercase rounded-sm transition-all ${
            activeSection === i
              ? "bg-[#6366f1]/15 text-[#6366f1]"
              : "text-white/20 hover:text-white/40"
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  );
}

function HeroOverlay() {
  const mode = useSimulator((s) => s.mode);
  const activeSection = useSimulator((s) => s.activeSection);
  const setMode = useSimulator((s) => s.setMode);

  if (mode !== "paper" || activeSection > 0) return null;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex items-end justify-center pb-12">
      <div className="text-center pointer-events-auto">
        <h1 className="text-2xl font-light text-white/90 tracking-[0.1em] mb-2">
          10,000 QUBITS
        </h1>
        <p className="text-[11px] text-white/30 tracking-[0.2em] uppercase mb-6">
          Fault-tolerant quantum computation with reconfigurable atoms
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              const el = document.querySelector('[data-section="1"]');
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] rounded-sm text-[10px] text-white/60 hover:text-white/80 tracking-[0.15em] uppercase transition-all"
          >
            Read Paper
          </button>
          <button
            onClick={() => setMode("simulate")}
            className="px-5 py-2 bg-[#6366f1]/10 hover:bg-[#6366f1]/20 border border-[#6366f1]/20 hover:border-[#6366f1]/30 rounded-sm text-[10px] text-[#6366f1] tracking-[0.15em] uppercase transition-all"
          >
            Simulate
          </button>
        </div>
      </div>
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
      <SectionNav />
      <div className="p-6 hero-gradient">
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
    <div className="flex flex-col h-screen bg-black">
      <Header />
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        <div className="w-full md:w-[40%] overflow-y-auto border-r border-white/[0.04] relative">
          <LeftPane />
        </div>
        <div className="w-full md:w-[60%] h-[50vh] md:h-auto relative">
          <HeroOverlay />
          <ErrorBoundary fallback={
            <div className="flex items-center justify-center h-full bg-black">
              <div className="text-center p-8">
                <div className="text-[14px] text-[var(--text-secondary)] mb-2">3D viewport unavailable</div>
                <div className="text-[11px] text-[var(--text-quaternary)]">WebGL may not be supported on this device</div>
              </div>
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
