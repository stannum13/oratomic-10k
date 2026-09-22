export interface RelatedWork {
  name: string;
  url: string;
  role: string;
}

export const RELATED_WORK: RelatedWork[] = [
  {
    name: "Microsoft Quantum Resource Estimator",
    url: "https://learn.microsoft.com/en-us/azure/quantum/intro-to-resource-estimation",
    role: "Layered, error-corrected resource estimates and Pareto frontiers.",
  },
  {
    name: "Qualtran",
    url: "https://github.com/quantumlib/Qualtran",
    role: "Composable fault-tolerant algorithms and resource counting.",
  },
  {
    name: "Bench-Q",
    url: "https://github.com/zapatacomputing/benchq",
    role: "End-to-end hardware, compilation, factory, and decoder estimates.",
  },
  {
    name: "Stim",
    url: "https://github.com/quantumlib/Stim",
    role: "Fast stabilizer-circuit simulation and circuit-level QEC analysis.",
  },
  {
    name: "QEC Explorer",
    url: "https://github.com/kondshk/QEC-Explorer",
    role: "Interactive browser exploration of codes, noise, and decoders.",
  },
  {
    name: "Error Correction Zoo",
    url: "https://errorcorrectionzoo.org/",
    role: "A map of quantum and classical error-correcting code families.",
  },
];
