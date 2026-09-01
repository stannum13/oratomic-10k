export interface ZoneConfig {
  name: string;
  count: number;
  color: string;       // kept for compatibility but should be white/off-white
  center: [number, number, number];
  gridSize: [number, number];
  spacing: number;
  opacity: number;
  dotScale: number;    // relative dot size
  lattice: "dense" | "sparse" | "concentric" | "scatter";
}

export function generateAtomPositions(
  count: number,
  center: [number, number, number],
  gridSize: [number, number],
  spacing: number,
  lattice: string,
): Float32Array {
  const positions = new Float32Array(count * 3);
  const [cols, rows] = gridSize;
  const offsetX = ((cols - 1) * spacing) / 2;
  const offsetZ = ((rows - 1) * spacing) / 2;

  if (lattice === "concentric") {
    // Concentric rings
    for (let i = 0; i < count; i++) {
      const ring = Math.floor(Math.sqrt(i));
      const angle = (i / Math.max(1, ring * 6)) * Math.PI * 2;
      const r = ring * spacing * 0.4;
      positions[i * 3 + 0] = center[0] + Math.cos(angle) * r;
      positions[i * 3 + 1] = center[1];
      positions[i * 3 + 2] = center[2] + Math.sin(angle) * r;
    }
  } else if (lattice === "scatter") {
    // Pseudo-random scatter (deterministic)
    for (let i = 0; i < count; i++) {
      const phi = i * 2.399963; // golden angle
      const r = Math.sqrt(i / count) * Math.min(cols, rows) * spacing * 0.5;
      positions[i * 3 + 0] = center[0] + Math.cos(phi) * r;
      positions[i * 3 + 1] = center[1];
      positions[i * 3 + 2] = center[2] + Math.sin(phi) * r;
    }
  } else {
    // Square grid (dense or sparse — spacing handles the difference)
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols) % rows;
      positions[i * 3 + 0] = center[0] + col * spacing - offsetX;
      positions[i * 3 + 1] = center[1];
      positions[i * 3 + 2] = center[2] + row * spacing - offsetZ;
    }
  }

  return positions;
}

export function getZoneConfigs(breakdown: {
  memory: number;
  processor: number;
  resource: number;
  operation: number;
}): ZoneConfig[] {
  return [
    {
      name: "memory",
      count: Math.min(breakdown.memory, 4000),
      color: "#E8EAED",
      center: [-7, 0, 0],
      gridSize: [65, 35],
      spacing: 0.10,
      opacity: 0.9,
      dotScale: 0.7,
      lattice: "dense",
    },
    {
      name: "processor",
      count: Math.min(breakdown.processor, 1200),
      color: "#D0D4DA",
      center: [2, 0, 3],
      gridSize: [28, 18],
      spacing: 0.16,
      opacity: 0.85,
      dotScale: 1.0,
      lattice: "sparse",
    },
    {
      name: "operation",
      count: Math.min(breakdown.operation, 1200),
      color: "#C0C4CA",
      center: [2, 0, -3],
      gridSize: [28, 18],
      spacing: 0.14,
      opacity: 0.7,
      dotScale: 0.85,
      lattice: "scatter",
    },
    {
      name: "resource",
      count: Math.min(breakdown.resource, 1800),
      color: "#D8DCDF",
      center: [9, 0, 0],
      gridSize: [30, 22],
      spacing: 0.12,
      opacity: 0.8,
      dotScale: 0.9,
      lattice: "concentric",
    },
  ];
}
