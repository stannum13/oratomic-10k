"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { useSimulator } from "@/store/simulator";
import { AtomCloud } from "./AtomCloud";
import { getZoneConfigs } from "./ZoneLayout";
import { BloomEffect } from "./BloomEffect";
import { CameraRig, getCameraRigCallbacks } from "./CameraRig";
import { Apparatus } from "./Apparatus";
import { TeleportationArcs } from "./GateArcs";
import { TannerOverlay } from "./TannerOverlay";
import * as THREE from "three";

function ZoneLabel({
  name,
  color,
  center,
  count,
  gridSize,
  spacing,
}: {
  name: string;
  color: string;
  center: [number, number, number];
  count: number;
  gridSize: [number, number];
  spacing: number;
}) {
  const w = gridSize[0] * spacing;
  return (
    <Html
      position={[center[0] - w / 2, -0.05, center[2] - gridSize[1] * spacing / 2 - 0.4]}
      center={false}
      style={{ pointerEvents: "none" }}
    >
      <div className="select-none whitespace-nowrap">
        <span
          className="text-[8px] tracking-[0.25em] uppercase"
          style={{ color, opacity: 0.5 }}
        >
          {name}
        </span>
        <span className="text-[8px] text-white/15 ml-2">
          {count.toLocaleString()}
        </span>
      </div>
    </Html>
  );
}

function Scene() {
  const breakdown = useSimulator((s) => s.computed.qubitBreakdown);
  const mode = useSimulator((s) => s.mode);
  const activeSection = useSimulator((s) => s.activeSection);
  const zones = getZoneConfigs(breakdown);
  const showLabels = activeSection >= 1 || mode === "simulate";

  const breakdownMap: Record<string, number> = {
    memory: breakdown.memory,
    processor: breakdown.processor,
    operation: breakdown.operation,
    resource: breakdown.resource,
  };

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.06} />
      <directionalLight position={[8, 20, 8]} intensity={0.25} color="#ffffff" castShadow={false} />
      <directionalLight position={[-8, 12, -4]} intensity={0.08} color="#4dc9f6" />
      <pointLight position={[1, 8, 0]} intensity={0.15} color="#ffffff" distance={30} decay={2} />

      {/* Fog */}
      <fog attach="fog" args={["#000000", 18, 50]} />

      {/* QPU Apparatus */}
      <Apparatus zones={zones} />

      {/* Atom clouds */}
      {zones.map((zone) => (
        <AtomCloud key={zone.name} zone={zone} />
      ))}

      {/* Labels */}
      {showLabels &&
        zones.map((zone) => (
          <ZoneLabel
            key={`label-${zone.name}`}
            name={zone.name}
            color={zone.color}
            center={zone.center}
            count={breakdownMap[zone.name]}
            gridSize={zone.gridSize}
            spacing={zone.spacing}
          />
        ))}

      <TeleportationArcs activeSection={activeSection} />
      <TannerOverlay />

      <CameraRig />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={40}
        maxPolarAngle={Math.PI * 0.48}
        onStart={() => getCameraRigCallbacks().onStart?.()}
        onEnd={() => getCameraRigCallbacks().onEnd?.()}
      />
      <BloomEffect />
    </>
  );
}

export function Viewport() {
  return (
    <Canvas
      camera={{ position: [0, 10, 22], fov: 45, near: 0.1, far: 100 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      style={{ background: "#000000" }}
      dpr={[1, 2]}
    >
      <Scene />
    </Canvas>
  );
}
