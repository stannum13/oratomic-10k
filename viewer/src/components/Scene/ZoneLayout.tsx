export interface ZoneConfig {
  name: string;
  count: number;
  color: string;
  center: [number, number, number];
  gridSize: [number, number]; // [cols, rows]
  spacing: number;
  opacity: number;
}

export function generateAtomPositions(
  count: number,
  center: [number, number, number],
  gridSize: [number, number],
  spacing: number,
): Float32Array {
  const positions = new Float32Array(count * 3);
  const [cols, rows] = gridSize;
  const offsetX = ((cols - 1) * spacing) / 2;
  const offsetZ = ((rows - 1) * spacing) / 2;

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols) % rows;
    const layer = Math.floor(i / (cols * rows));

    positions[i * 3 + 0] = center[0] + col * spacing - offsetX;
    positions[i * 3 + 1] = center[1] + layer * spacing;
    positions[i * 3 + 2] = center[2] + row * spacing - offsetZ;
  }

  return positions;
}

export function getZoneConfigs(breakdown: {
  memory: number;
  processor: number;
  resource: number;
  operation: number;
}): ZoneConfig[] {
  // Layout: Memory (large, left) | Processor (top center) + Operation (bottom center) | Resource (right)
  // Proper spacing, proportional to qubit count
  const memCols = 60;
  const memRows = Math.min(40, Math.ceil(Math.min(breakdown.memory, 4000) / memCols));

  const procCols = 30;
  const procRows = Math.min(20, Math.ceil(Math.min(breakdown.processor, 1600) / procCols));

  const opsCols = 30;
  const opsRows = Math.min(20, Math.ceil(Math.min(breakdown.operation, 1600) / opsCols));

  const resCols = 35;
  const resRows = Math.min(25, Math.ceil(Math.min(breakdown.resource, 2500) / resCols));

  const sp = 0.12; // tighter spacing for cleaner grid

  return [
    {
      name: "memory",
      count: Math.min(breakdown.memory, memCols * memRows),
      color: "#4dc9f6",
      center: [-7, 0, 0],
      gridSize: [memCols, memRows],
      spacing: sp,
      opacity: 0.85,
    },
    {
      name: "processor",
      count: Math.min(breakdown.processor, procCols * procRows),
      color: "#f67019",
      center: [2, 0, 3],
      gridSize: [procCols, procRows],
      spacing: sp,
      opacity: 0.9,
    },
    {
      name: "operation",
      count: Math.min(breakdown.operation, opsCols * opsRows),
      color: "#4bc076",
      center: [2, 0, -3],
      gridSize: [opsCols, opsRows],
      spacing: sp,
      opacity: 0.8,
    },
    {
      name: "resource",
      count: Math.min(breakdown.resource, resCols * resRows),
      color: "#e8548e",
      center: [9, 0, 0],
      gridSize: [resCols, resRows],
      spacing: sp,
      opacity: 0.85,
    },
  ];
}
