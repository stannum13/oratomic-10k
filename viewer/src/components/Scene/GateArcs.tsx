"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface GateArcsProps {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
  active: boolean;
}

export function GateArcs({ from, to, color, active }: GateArcsProps) {
  const lineRef = useRef<THREE.Line>(null);
  const progress = useRef(0);

  const curve = useMemo(() => {
    const mid: [number, number, number] = [
      (from[0] + to[0]) / 2,
      Math.max(from[1], to[1]) + 3,
      (from[2] + to[2]) / 2,
    ];
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(...from),
      new THREE.Vector3(...mid),
      new THREE.Vector3(...to),
    ]);
  }, [from, to]);

  const fullPoints = useMemo(() => curve.getPoints(50), [curve]);
  const arcColor = useMemo(() => new THREE.Color(color), [color]);

  useFrame((_, delta) => {
    if (!active || !lineRef.current) return;
    progress.current = (progress.current + delta * 0.5) % 1;

    const count = Math.floor(progress.current * 50);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = fullPoints[i].x;
      positions[i * 3 + 1] = fullPoints[i].y;
      positions[i * 3 + 2] = fullPoints[i].z;
    }

    const geom = lineRef.current.geometry as THREE.BufferGeometry;
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setDrawRange(0, count);
  });

  if (!active) return null;

  return (
    <line ref={lineRef as any}>
      <bufferGeometry />
      <lineBasicMaterial color={arcColor} transparent opacity={0.6} linewidth={1} />
    </line>
  );
}

export function TeleportationArcs({ activeSection }: { activeSection: number }) {
  // Show teleportation arcs during surgery section (index 3)
  const showArcs = activeSection === 3;

  return (
    <group>
      {/* Memory -> Processor teleportation */}
      <GateArcs
        from={[-7, 0.5, 0]}
        to={[2, 0.5, 3]}
        color="#4fc3f7"
        active={showArcs}
      />
      {/* Processor -> Memory return */}
      <GateArcs
        from={[2, 0.5, 3]}
        to={[-7, 0.5, 0]}
        color="#ffa726"
        active={showArcs}
      />
      {/* Resource -> Processor magic state injection */}
      <GateArcs
        from={[9, 0.5, 0]}
        to={[2, 0.5, 3]}
        color="#f06292"
        active={activeSection === 4}
      />
    </group>
  );
}
