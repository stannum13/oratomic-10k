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
import { EmissionLayer } from "./EmissionLayer";
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
      <div className="zone-label">
        <span className="zone-label__name">
          {name}
        </span>
        <span className="zone-label__count">
          {count.toLocaleString()}
        </span>
      </div>
    </Html>
  );
}

function Scene({ enableEffects, mobile, resetSignal }: { enableEffects: boolean; mobile: boolean; resetSignal: number }) {
  const breakdown = useSimulator((s) => s.computed.qubitBreakdown);
  const mode = useSimulator((s) => s.mode);
  const activeSection = useSimulator((s) => s.activeSection);
  const theme = useSimulator((s) => s.theme);
  const bgColor = theme === "light" ? "#FAFAFA" : "#08090C";
  const zones = getZoneConfigs(breakdown);
  const showLabels = activeSection >= 1 || mode === "simulate";

  const breakdownMap: Record<string, number> = {
    memory: breakdown.memory, processor: breakdown.processor,
    operation: breakdown.operation, resource: breakdown.resource,
  };
  const labeledZones = mobile
    ? [...zones].sort((a, b) => breakdownMap[b.name] - breakdownMap[a.name]).slice(0, 2)
    : zones;

  return (
    <>
      <ambientLight intensity={0.28} />
      <directionalLight position={[5, 20, 10]} intensity={0.55} color="#ffffff" />
      <directionalLight position={[-8, 10, -5]} intensity={0.25} color="#ffffff" />

      <fog attach="fog" args={[bgColor, 20, 50]} />

      <Apparatus zones={zones} theme={theme} />

      {zones.map((zone) => (
        <AtomCloud key={zone.name} zone={zone} />
      ))}

      {showLabels && labeledZones.map((zone) => (
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
      <EmissionLayer />

      <CameraRig mobile={mobile} resetSignal={resetSignal} />
      <OrbitControls
        enableDamping dampingFactor={0.05}
        enablePan={!mobile}
        target={[1, 0, 0]}
        minDistance={3} maxDistance={40} maxPolarAngle={Math.PI * 0.48}
        onStart={() => getCameraRigCallbacks().onStart?.()}
        onEnd={() => getCameraRigCallbacks().onEnd?.()}
      />
      {enableEffects && <BloomEffect />}
    </>
  );
}

export function Viewport({ mobile = false, enableEffects = true, active = true, resetSignal = 0 }: { mobile?: boolean; enableEffects?: boolean; active?: boolean; resetSignal?: number }) {
  const theme = useSimulator((s) => s.theme);
  const bgColor = theme === "light" ? "#FAFAFA" : "#08090C";

  return (
    <Canvas
      camera={{ position: mobile ? [1, 14, 18] : [1, 10, 17], fov: mobile ? 42 : 40, near: 0.1, far: 100 }}
      gl={{
        antialias: !mobile, alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
      style={{ background: bgColor }}
      dpr={mobile ? [1, 1.5] : [1, 2]}
      frameloop={active ? "always" : "never"}
    >
      <Scene enableEffects={enableEffects} mobile={mobile} resetSignal={resetSignal} />
    </Canvas>
  );
}
