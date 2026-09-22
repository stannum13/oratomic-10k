import type { GuideChapterId } from "./url-state";

export type GuideStage = "metrics" | "allocation" | "noise" | "feedback" | "workload" | "comparison";
export type GuideProvenance = "Core model" | "Paper-derived" | "Fitted projection" | "Model assumption" | "Illustrative estimate";

export interface GuideBeat {
  id: string;
  question: string;
  title: string;
  explanation: string;
  caption: string;
  actionLabel: string;
  durationMs: number;
  stage: GuideStage;
  provenance: GuideProvenance;
  awaitAction?: boolean;
  focusId?: string;
}

export interface GuideChapter {
  id: GuideChapterId;
  shortTitle: string;
  beats: GuideBeat[];
}

export const GUIDE_CHAPTERS: GuideChapter[] = [
  {
    id: "frame",
    shortTitle: "The question",
    beats: [
      {
        id: "frame-question",
        question: "Can this machine do useful work?",
        title: "Start with a workload, not a qubit count",
        explanation: "We will follow ECC-256 through the resources, errors, control loop, and runtime that determine whether the modeled machine can finish.",
        caption: "Baseline: ECC-256 on the balanced Oratomic qLDPC architecture.",
        actionLabel: "Reveal the estimate",
        durationMs: 5000,
        stage: "metrics",
        provenance: "Core model",
      },
      {
        id: "frame-result",
        question: "What does the model predict?",
        title: "Three numbers describe the proposed run",
        explanation: "Physical qubits describe scale, logical block error describes protection, and runtime describes how long the compiled workload is expected to take.",
        caption: "These are architecture estimates under tunable assumptions—not a hardware demonstration.",
        actionLabel: "Build the machine",
        durationMs: 6000,
        stage: "metrics",
        provenance: "Core model",
      },
    ],
  },
  {
    id: "allocate",
    shortTitle: "Allocate qubits",
    beats: [
      {
        id: "allocate-zones",
        question: "Where do the physical qubits go?",
        title: "A machine is more than one register",
        explanation: "Memory protects stored logical state; the processor performs logical work; operation space supports syndrome extraction; resource factories supply non-Clifford operations.",
        caption: "The allocation bar communicates proportion; the QPU view communicates spatial organization.",
        actionLabel: "Inspect a subsystem",
        durationMs: 6500,
        stage: "allocation",
        provenance: "Paper-derived",
      },
      {
        id: "allocate-inspect",
        question: "Which subsystem should we inspect?",
        title: "Select one part of the machine",
        explanation: "The same physical-qubit budget must serve storage, computation, correction operations, and resource-state production.",
        caption: "Select any subsystem to connect its count to its role.",
        actionLabel: "Continue to noise",
        durationMs: 0,
        stage: "allocation",
        provenance: "Paper-derived",
        awaitAction: true,
      },
    ],
  },
  {
    id: "noise",
    shortTitle: "Add noise",
    beats: [
      {
        id: "noise-pathways",
        question: "What damages the computation?",
        title: "Errors enter through several physical pathways",
        explanation: "Gate, readout, transport, loss, leakage, and correlated disturbances do not all behave alike—and the current scalar model does not include them all.",
        caption: "Scope badges distinguish included effects from physical pathways shown only for context.",
        actionLabel: "Find the error-rate cliff",
        durationMs: 6500,
        stage: "noise",
        provenance: "Model assumption",
        focusId: "gate-control-error",
      },
      {
        id: "noise-cliff",
        question: "Where does protection stop being enough?",
        title: "Move the physical error rate",
        explanation: "As the physical error assumption rises, the fitted logical-error estimate can consume the workload's reliable-operation budget.",
        caption: "Drag the control until modeled feasibility changes, then continue from that state or restore the baseline.",
        actionLabel: "Continue to correction",
        durationMs: 0,
        stage: "noise",
        provenance: "Fitted projection",
        awaitAction: true,
      },
    ],
  },
  {
    id: "feedback",
    shortTitle: "Close the loop",
    beats: [
      {
        id: "feedback-signal",
        question: "How does the machine fight back?",
        title: "Measurement becomes a classical feedback signal",
        explanation: "Sensing, analog conditioning, digitization, denoising, state classification, syndrome decoding, scheduling, and physical actuation form one closed loop.",
        caption: "Denoising improves evidence; decoding infers an error pattern. Neither recreates an unknown quantum state.",
        actionLabel: "Inspect the binding stage",
        durationMs: 7000,
        stage: "feedback",
        provenance: "Model assumption",
        focusId: "readout",
      },
      {
        id: "feedback-bottleneck",
        question: "Can classical feedback keep pace?",
        title: "Compare listed stage latency with the QEC cycle",
        explanation: "The slowest listed stage is a useful warning, but the timing profile is illustrative until measured end-to-end on the target system.",
        caption: "Select a timing stage to see how it enters—or does not enter—the current equations.",
        actionLabel: "Run the workload",
        durationMs: 0,
        stage: "feedback",
        provenance: "Illustrative estimate",
        awaitAction: true,
      },
    ],
  },
  {
    id: "workload",
    shortTitle: "Run workload",
    beats: [
      {
        id: "workload-budget",
        question: "Can it finish before errors win?",
        title: "The operation budget must clear the workload",
        explanation: "The compiled Toffoli requirement is compared with a modeled reliable-operation budget derived from the logical block-error estimate.",
        caption: "Feasible means the modeled budget clears—not that the hardware has been built or validated.",
        actionLabel: "Challenge one assumption",
        durationMs: 6500,
        stage: "workload",
        provenance: "Core model",
      },
      {
        id: "workload-change",
        question: "Which assumption moves the answer?",
        title: "Change one input and follow the consequence",
        explanation: "Error rate changes protection; cycle time changes runtime; code and allocation choices trade qubits against suppression and throughput.",
        caption: "Make one change, then continue from your experiment or restore the guided baseline.",
        actionLabel: "Compare architectures",
        durationMs: 0,
        stage: "workload",
        provenance: "Model assumption",
        awaitAction: true,
      },
    ],
  },
  {
    id: "compare",
    shortTitle: "Compare honestly",
    beats: [
      {
        id: "compare-evidence",
        question: "Would another architecture behave differently?",
        title: "Compare physical stacks without flattening the evidence",
        explanation: "Neutral atoms, trapped ions, and superconducting qubits differ in connectivity, timing, readout, control, and code family.",
        caption: "Oratomic uses the core model. Walking Cat and Surface Code resource rows remain illustrative estimates.",
        actionLabel: "Choose an architecture",
        durationMs: 0,
        stage: "comparison",
        provenance: "Illustrative estimate",
        awaitAction: true,
      },
      {
        id: "compare-finish",
        question: "What should experts challenge next?",
        title: "Turn the visualization into a reviewable model",
        explanation: "The useful outcome is a traceable list of assumptions, omissions, bottlenecks, and measurements that would make the estimate more credible.",
        caption: "Inspect methods, share the exact state, or open the source and challenge the model.",
        actionLabel: "Finish",
        durationMs: 0,
        stage: "comparison",
        provenance: "Core model",
      },
    ],
  },
];
