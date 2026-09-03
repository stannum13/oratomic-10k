import { create } from "zustand";
import type {
  ArchitectureType,
  LiveCodeResult,
  MemoryCode,
  ProcessorCode,
  TargetProblem,
} from "@/compute/interface";
import { computeWithEngine, type EngineComputeResult } from "@/compute/engine-compute";
import { SEED_MATRICES } from "@/lib/seed-matrices";
import { PLATFORM_PRESETS } from "@/compute/lookup-tables";

interface SimulatorState {
  mode: "paper" | "simulate";
  activeSection: number;
  timeScale: number;
  setTimeScale: (v: number) => void;
  setMode: (mode: "paper" | "simulate") => void;
  setActiveSection: (section: number) => void;

  physicalErrorRate: number;
  cycleTime: number;
  architectureType: ArchitectureType;
  targetProblem: TargetProblem;

  memoryCode: MemoryCode;
  processorCode: ProcessorCode;
  decoderType: string;

  hardwarePlatform: string;
  setHardwarePlatform: (v: string) => void;

  computed: EngineComputeResult;

  liveCode: LiveCodeResult | null;
  liveCodeLoading: boolean;
  computeLiveCode: () => void;

  pinnedConfig: {
    label: string;
    computed: EngineComputeResult;
    params: {
      physicalErrorRate: number;
      cycleTime: number;
      architectureType: string;
      targetProblem: string;
      memoryCode: string;
      processorCode: string;
    };
  } | null;
  setPinnedConfig: (config: SimulatorState['pinnedConfig']) => void;

  setPhysicalErrorRate: (v: number) => void;
  setCycleTime: (v: number) => void;
  setArchitectureType: (v: ArchitectureType) => void;
  setTargetProblem: (v: TargetProblem) => void;
  setMemoryCode: (v: MemoryCode) => void;
  setProcessorCode: (v: ProcessorCode) => void;
  setDecoderType: (v: string) => void;

  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;

  paramHistory: Array<{
    physicalErrorRate: number;
    cycleTime: number;
    architectureType: ArchitectureType;
    targetProblem: TargetProblem;
    memoryCode: MemoryCode;
    processorCode: ProcessorCode;
  }>;
  pushHistory: () => void;
  undoParams: () => void;
}

function recompute(state: {
  physicalErrorRate: number;
  cycleTime: number;
  architectureType: ArchitectureType;
  targetProblem: TargetProblem;
  memoryCode: MemoryCode;
  processorCode: ProcessorCode;
  decoderType: string;
}): EngineComputeResult {
  return computeWithEngine(state);
}

const defaults = {
  physicalErrorRate: 0.001,
  cycleTime: 1.0,
  architectureType: "balanced" as ArchitectureType,
  targetProblem: "ecc-256" as TargetProblem,
  memoryCode: "lp20" as MemoryCode,
  processorCode: "lp-proc" as ProcessorCode,
  decoderType: "bp-lsd",
};

export const useSimulator = create<SimulatorState>((set, get) => ({
  mode: "paper",
  activeSection: 0,
  timeScale: 0,
  ...defaults,
  hardwarePlatform: "oratomic-neutral-atom",
  computed: recompute(defaults),
  liveCode: null,
  liveCodeLoading: false,
  theme: "dark",
  setTheme: (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    set({ theme });
  },
  paramHistory: [],
  pinnedConfig: null,
  setPinnedConfig: (pinnedConfig) => set({ pinnedConfig }),

  setMode: (mode) => set({ mode }),
  setTimeScale: (timeScale) => set({ timeScale }),
  setActiveSection: (activeSection) => {
    const scales: Record<number, number> = {
      0: 0, 1: -3, 2: 0, 3: 0, 4: 2, 5: 9, 6: 0,
    };
    set({ activeSection, timeScale: scales[activeSection] ?? 0 });
  },

  setPhysicalErrorRate: (physicalErrorRate) =>
    set((s) => {
      const next = { ...s, physicalErrorRate };
      return { physicalErrorRate, computed: recompute(next) };
    }),
  setCycleTime: (cycleTime) =>
    set((s) => {
      const next = { ...s, cycleTime };
      return { cycleTime, computed: recompute(next) };
    }),
  setArchitectureType: (architectureType) =>
    set((s) => {
      const next = { ...s, architectureType };
      return { architectureType, computed: recompute(next) };
    }),
  setTargetProblem: (targetProblem) =>
    set((s) => {
      const next = { ...s, targetProblem };
      return { targetProblem, computed: recompute(next) };
    }),
  setMemoryCode: (memoryCode) =>
    set((s) => {
      const next = { ...s, memoryCode };
      return { memoryCode, computed: recompute(next) };
    }),
  setProcessorCode: (processorCode) =>
    set((s) => {
      const next = { ...s, processorCode };
      return { processorCode, computed: recompute(next) };
    }),
  setDecoderType: (decoderType) =>
    set((s) => {
      const next = { ...s, decoderType };
      return { decoderType, computed: recompute(next) };
    }),
  setHardwarePlatform: (hardwarePlatform) =>
    set((s) => {
      const preset = PLATFORM_PRESETS[hardwarePlatform];
      if (!preset) return { hardwarePlatform };
      const next = {
        ...s,
        hardwarePlatform,
        physicalErrorRate: preset.defaultErrorRate,
        cycleTime: preset.defaultCycleTime,
      };
      return { hardwarePlatform, physicalErrorRate: preset.defaultErrorRate, cycleTime: preset.defaultCycleTime, computed: recompute(next) };
    }),

  pushHistory: () => {
    const s = get();
    set({
      paramHistory: [
        ...s.paramHistory.slice(-19),
        {
          physicalErrorRate: s.physicalErrorRate,
          cycleTime: s.cycleTime,
          architectureType: s.architectureType,
          targetProblem: s.targetProblem,
          memoryCode: s.memoryCode,
          processorCode: s.processorCode,
        },
      ],
    });
  },
  undoParams: () => {
    const s = get();
    if (s.paramHistory.length === 0) return;
    const prev = s.paramHistory[s.paramHistory.length - 1];
    const next = { ...s, ...prev };
    set({
      ...prev,
      paramHistory: s.paramHistory.slice(0, -1),
      computed: recompute(next),
    });
  },

  computeLiveCode: () => {
    const state = useSimulator.getState();
    const matrix = SEED_MATRICES[state.memoryCode];
    if (!matrix) return;

    set({ liveCodeLoading: true });

    import("@/compute/code-worker").then(({ computeCodeSync }) => {
      const result = computeCodeSync({
        type: "construct",
        seedExponents: matrix.entries,
        ringOrder: matrix.ringOrder,
      });

      set({
        liveCode: {
          n: result.code.n,
          k: result.code.k,
          kLowerBound: result.code.kLowerBound,
          stabilizerWeightX: result.code.stabilizerWeightX,
          stabilizerWeightZ: result.code.stabilizerWeightZ,
          encodingRate: result.code.encodingRate,
          tannerEdgesX: result.tanner.sampleEdgesX,
          tannerEdgesZ: result.tanner.sampleEdgesZ,
          tannerDataNodes: result.tanner.dataNodes,
          tannerCheckNodesX: result.tanner.checkNodesX,
          tannerCheckNodesZ: result.tanner.checkNodesZ,
          computeTimeMs: result.computeTimeMs,
        },
        liveCodeLoading: false,
      });
    });
  },
}));
