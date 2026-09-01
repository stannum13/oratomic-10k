export const CAMERA_PRESETS: Record<
  string,
  { position: [number, number, number]; target: [number, number, number]; fov: number }
> = {
  hero: { position: [0, 10, 22], target: [1, 0, 0], fov: 45 },
  architecture: { position: [2, 14, 14], target: [1, 0, 0], fov: 50 },
  codes: { position: [-7, 5, 8], target: [-7, 0, 0], fov: 40 },
  surgery: { position: [0, 8, 12], target: [0, 0, 0], fov: 45 },
  magic: { position: [9, 5, 8], target: [9, 0, 0], fov: 40 },
  resources: { position: [2, 12, 14], target: [1, 0, 0], fov: 50 },
  simulator: { position: [2, 12, 18], target: [1, 0, 0], fov: 45 },
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
