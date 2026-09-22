import type { ArchitectureType, MemoryCode, ProcessorCode, TargetProblem } from "@/compute/interface";

export type ExperienceMode = "guided" | "explore";
export type GuideChapterId = "frame" | "allocate" | "noise" | "feedback" | "workload" | "compare";

const GUIDE_CHAPTERS: GuideChapterId[] = ["frame", "allocate", "noise", "feedback", "workload", "compare"];

export interface ShareableConfig {
  p: number;
  t: number;
  a: ArchitectureType;
  prob: TargetProblem;
  mem: MemoryCode;
  proc: ProcessorCode;
  platform: string;
  experience?: ExperienceMode;
  chapter?: GuideChapterId;
}

export function encodeConfig(config: ShareableConfig): string {
  const params = new URLSearchParams();
  params.set("p", config.p.toString());
  params.set("t", config.t.toString());
  params.set("a", config.a);
  params.set("prob", config.prob);
  params.set("mem", config.mem);
  params.set("proc", config.proc);
  params.set("platform", config.platform);
  if (config.experience) params.set("experience", config.experience);
  if (config.chapter) params.set("chapter", config.chapter);
  return params.toString();
}

export function decodeConfig(search: string): Partial<ShareableConfig> | null {
  const params = new URLSearchParams(search);
  const result: Partial<ShareableConfig> = {};

  const p = params.get("p");
  if (p) {
    const value = Number(p);
    if (Number.isFinite(value) && value >= 0.0001 && value <= 0.01) result.p = value;
  }

  const t = params.get("t");
  if (t) {
    const value = Number(t);
    if (Number.isFinite(value) && value >= 0.001 && value <= 10) result.t = value;
  }

  const a = params.get("a");
  if (a && ["space-efficient", "balanced", "time-efficient"].includes(a)) {
    result.a = a as ArchitectureType;
  }

  const prob = params.get("prob");
  if (prob && ["ecc-256", "rsa-2048"].includes(prob)) {
    result.prob = prob as TargetProblem;
  }

  const mem = params.get("mem");
  if (mem && ["lp16", "lp20", "lp24"].includes(mem)) {
    result.mem = mem as MemoryCode;
  }

  const proc = params.get("proc");
  if (proc && ["bb18", "lp-proc"].includes(proc)) {
    result.proc = proc as ProcessorCode;
  }

  const platform = params.get("platform");
  if (platform && ["oratomic-neutral-atom", "ionq-walking-cat", "google-surface-code"].includes(platform)) {
    result.platform = platform;
  }

  const experience = params.get("experience");
  if (experience === "guided" || experience === "explore") {
    result.experience = experience;
  }

  const chapter = params.get("chapter");
  if (chapter && GUIDE_CHAPTERS.includes(chapter as GuideChapterId)) {
    result.chapter = chapter as GuideChapterId;
  }

  return Object.keys(result).length > 0 ? result : null;
}

export function resolveInitialExperience(search: string): ExperienceMode {
  const params = new URLSearchParams(search);
  const explicit = params.get("experience");
  if (explicit === "guided" || explicit === "explore") return explicit;
  const legacyFields = ["p", "t", "a", "prob", "mem", "proc", "platform"];
  return legacyFields.some((field) => params.has(field)) ? "explore" : "guided";
}
