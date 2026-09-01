export const CAMERA_PRESETS: Record<
  string,
  { position: [number, number, number]; target: [number, number, number]; fov: number }
> = {
  hero: { position: [1, 12, 24], target: [1, 0, 0], fov: 42 },
  architecture: { position: [1, 16, 16], target: [1, 0, 0], fov: 45 },
  codes: { position: [-5, 6, 10], target: [-5, 0, 0], fov: 38 },
  surgery: { position: [1, 10, 14], target: [1, 0, 0], fov: 42 },
  magic: { position: [8, 6, 10], target: [8, 0, 0], fov: 38 },
  resources: { position: [1, 14, 16], target: [1, 0, 0], fov: 45 },
  simulator: { position: [1, 14, 20], target: [1, 0, 0], fov: 42 },
};

export const SECTION_IDS = [
  "hero",
  "architecture",
  "codes",
  "surgery",
  "magic",
  "resources",
  "simulator",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];
