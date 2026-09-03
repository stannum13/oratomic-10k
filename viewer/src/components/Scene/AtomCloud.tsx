"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { generateAtomPositions, type ZoneConfig } from "./ZoneLayout";
import { IDLE } from "@/lib/motion";
import { useSimulator } from "@/store/simulator";

export function AtomCloud({ zone }: { zone: ZoneConfig }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const timeRef = useRef(0);

  const positions = useMemo(
    () => generateAtomPositions(zone.count, zone.center, zone.gridSize, zone.spacing, zone.lattice),
    [zone.count, zone.center, zone.gridSize, zone.spacing, zone.lattice],
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const theme = useSimulator((s) => s.theme);
  const effectiveColor = useMemo(
    () => new THREE.Color(theme === "light" ? "#2A2A2A" : zone.color),
    [zone.color, theme]
  );
  const color = effectiveColor;
  const baseScale = 0.03 * zone.dotScale;

  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < zone.count; i++) {
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      dummy.scale.setScalar(baseScale / 0.03);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, zone.count, dummy, baseScale]);

  // Idle jitter
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;
    // Only update a subset each frame for performance
    const batchSize = Math.min(200, zone.count);
    const offset = Math.floor(timeRef.current * 30) % Math.max(1, zone.count - batchSize);
    for (let i = offset; i < offset + batchSize && i < zone.count; i++) {
      const jitter = IDLE.jitter(i, timeRef.current) * zone.spacing;
      dummy.position.set(
        positions[i * 3] + jitter,
        positions[i * 3 + 1],
        positions[i * 3 + 2] + IDLE.jitter(i + 1000, timeRef.current) * zone.spacing,
      );
      dummy.scale.setScalar(baseScale / 0.03);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, zone.count]} frustumCulled={false}>
      <sphereGeometry args={[0.04 * zone.dotScale, 10, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        transparent
        opacity={zone.opacity}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
