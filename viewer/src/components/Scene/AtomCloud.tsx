"use client";

import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { generateAtomPositions, type ZoneConfig } from "./ZoneLayout";

interface AtomCloudProps {
  zone: ZoneConfig;
}

export function AtomCloud({ zone }: AtomCloudProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const positions = useMemo(
    () => generateAtomPositions(zone.count, zone.center, zone.gridSize, zone.spacing),
    [zone.count, zone.center, zone.gridSize, zone.spacing],
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(zone.color), [zone.color]);

  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < zone.count; i++) {
      dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, zone.count, dummy]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, zone.count]} frustumCulled={false}>
      <sphereGeometry args={[0.035, 12, 8]} />
      <meshPhysicalMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        roughness={0.4}
        metalness={0.1}
        transparent
        opacity={zone.opacity}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
