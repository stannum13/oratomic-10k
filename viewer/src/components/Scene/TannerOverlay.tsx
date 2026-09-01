"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useSimulator } from "@/store/simulator";

export function TannerOverlay() {
  const activeSection = useSimulator((s) => s.activeSection);
  const mode = useSimulator((s) => s.mode);
  const liveCode = useSimulator((s) => s.liveCode);

  const showTanner = activeSection === 2 || mode === "simulate";

  // Use live-computed Tanner graph if available, otherwise show nothing
  const edges = liveCode?.tannerEdgesX;

  const geometry = useMemo(() => {
    if (!edges || edges.length === 0) return null;

    // Map Tanner graph edges to 3D positions in the memory zone
    const center: [number, number, number] = [-7, 0, 0];
    const gridCols = 60;
    const spacing = 0.12;
    const offsetX = ((gridCols - 1) * spacing) / 2;
    const gridRows = 40;
    const offsetZ = ((gridRows - 1) * spacing) / 2;

    const maxEdges = Math.min(edges.length, 300);
    const positions = new Float32Array(maxEdges * 6);
    let count = 0;

    for (let i = 0; i < maxEdges; i++) {
      const [checkIdx, dataIdx] = edges[i];

      // Map check and data indices to grid positions
      const cCol = checkIdx % gridCols;
      const cRow = Math.floor(checkIdx / gridCols) % gridRows;
      const dCol = dataIdx % gridCols;
      const dRow = Math.floor(dataIdx / gridCols) % gridRows;

      positions[count * 6 + 0] = center[0] + cCol * spacing - offsetX;
      positions[count * 6 + 1] = center[1] + 0.15;
      positions[count * 6 + 2] = center[2] + cRow * spacing - offsetZ;
      positions[count * 6 + 3] = center[0] + dCol * spacing - offsetX;
      positions[count * 6 + 4] = center[1] + 0.15;
      positions[count * 6 + 5] = center[2] + dRow * spacing - offsetZ;
      count++;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions.slice(0, count * 6), 3));
    return geom;
  }, [edges]);

  if (!showTanner || !geometry) {
    // Fallback: show a "construct code to see Tanner graph" hint
    if (showTanner && !liveCode) {
      return null; // Could add a text hint via Html component
    }
    return null;
  }

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#818cf8" transparent opacity={0.2} />
    </lineSegments>
  );
}
