export type ProvenanceKind = "Paper-derived" | "Fitted projection" | "Model assumption" | "Illustrative estimate";

export interface MethodologyItem {
  kind: ProvenanceKind;
  title: string;
  detail: string;
}

export const PAPER_URL = "https://arxiv.org/abs/2603.28627";
export const REPOSITORY_URL = "https://github.com/stannum13/oratomic-10k";

export const METHODOLOGY_ITEMS: MethodologyItem[] = [
  {
    kind: "Paper-derived",
    title: "Codes and architecture",
    detail: "Code parameters, zone allocations, compilation costs, and headline resource scenarios follow Cain et al. (2026).",
  },
  {
    kind: "Fitted projection",
    title: "Logical block error",
    detail: "Low-error results extend the paper's stated power-law fits beyond the numerically simulated range; the interface flags extrapolation.",
  },
  {
    kind: "Model assumption",
    title: "Interactive controls",
    detail: "Cycle time, decoder choice, noise scenario, and parameter sweeps explore assumptions through the in-browser symbolic model.",
  },
  {
    kind: "Illustrative estimate",
    title: "Cross-platform comparison",
    detail: "IonQ and Google resource rows are scenario estimates for orientation, not published equivalent benchmark results.",
  },
];
