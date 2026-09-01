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

function ZoneLabel({ name, center, count, gridSize, spacing }: {
  name: string; center: [number, number, number]; count: number;
  gridSize: [number, number]; spacing: number;
}) {
  return (
    <Html
      position={[center[0] - (gridSize[0] * spacing) / 2, -0.15, center[2] - (gridSize[1] * spacing) / 2 - 0.3]}
      center={false}
      style={{ pointerEvents: "none" }}
    >
      <div style={{ whiteSpace: "nowrap", userSelect: "none" }}>
        <span className="mono" style={{
          fontSize: "var(--fs-mono-sm)", color: "var(--text-tertiary)",
          letterSpacing: "var(--tracking-label)", textTransform: "uppercase",
        }}>
          {name}
        </span>
        <span className="mono" style={{
          fontSize: "var(--fs-mono-sm)", color: "var(--text-tertiary)",
          marginLeft: "var(--s2)", opacity: 0.5,
        }}>
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
    memory: breakdown.memory, processor: breakdown.processor,
    operation: breakdown.operation, resource: breakdown.resource,
  };

  return (
    <>
      <ambientLight intensity={0.04} />
      <directionalLight position={[5, 20, 10]} intensity={0.2} color="#ffffff" />
      <directionalLight position={[-8, 10, -5]} intensity={0.06} color="#ffffff" />

      <fog attach="fog" args={["#08090C", 20, 50]} />

      <Apparatus zones={zones} />

      {zones.map((zone) => (
        <AtomCloud key={zone.name} zone={zone} />
      ))}

      {showLabels && zones.map((zone) => (
        <ZoneLabel
          key={`label-${zone.name}`}
          name={zone.name}
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
        enableDamping dampingFactor={0.05}
        minDistance={3} maxDistance={40} maxPolarAngle={Math.PI * 0.48}
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
        antialias: true, alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
      style={{ background: "#08090C" }}
      dpr={[1, 2]}
    >
      <Scene />
    </Canvas>
  );
}
