import type { ArchitectureType, MemoryCode, ProcessorCode, TargetProblem } from "@/compute/interface";

export interface ShareableConfig {
  p: number;
  t: number;
  a: ArchitectureType;
  prob: TargetProblem;
  mem: MemoryCode;
  proc: ProcessorCode;
}

export function encodeConfig(config: ShareableConfig): string {
  const params = new URLSearchParams();
  params.set("p", config.p.toString());
  params.set("t", config.t.toString());
  params.set("a", config.a);
  params.set("prob", config.prob);
  params.set("mem", config.mem);
  params.set("proc", config.proc);
  return params.toString();
}

export function decodeConfig(search: string): Partial<ShareableConfig> | null {
  const params = new URLSearchParams(search);
  const result: Partial<ShareableConfig> = {};

  const p = params.get("p");
  if (p) result.p = parseFloat(p);

  const t = params.get("t");
  if (t) result.t = parseFloat(t);

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

  return Object.keys(result).length > 0 ? result : null;
}
