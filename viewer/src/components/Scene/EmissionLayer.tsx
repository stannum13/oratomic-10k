"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useSimulator } from "@/store/simulator";
import { Scheduler, TIMING, QEC_PERIOD_MS, type SceneEvent, type MagicBuffer } from "@/lib/motion";
import { getZoneConfigs } from "./ZoneLayout";

// Emission colors from the design brief
const EMISSION_420 = new THREE.Color("#6B7BFF"); // Rydberg excitation
const EMISSION_780 = new THREE.Color("#FF4D3D"); // transport / readout

interface FlashEvent {
  position: [number, number, number];
  color: THREE.Color;
  startTime: number;
  duration: number;
  intensity: number;
}

interface TransportEvent {
  from: [number, number, number];
  to: [number, number, number];
  startTime: number;
  duration: number;
  progress: number;
}

export function EmissionLayer() {
  const mode = useSimulator((s) => s.mode);
  const breakdown = useSimulator((s) => s.computed.qubitBreakdown);

  const schedulerRef = useRef<Scheduler | null>(null);
  const eventsRef = useRef<SceneEvent[]>([]);
  const flashesRef = useRef<FlashEvent[]>([]);
  const transportsRef = useRef<TransportEvent[]>([]);
  const [buffer, setBuffer] = useState<MagicBuffer>({ count: 3, capacity: 8 });
  const [schedulerState, setSchedulerState] = useState<"running" | "stalled">("running");
  const [qecPhase, setQecPhase] = useState(0);
  const roundTimer = useRef(0);
  const elapsedRef = useRef(0);

  const zones = getZoneConfigs(breakdown);

  // Initialize scheduler
  useEffect(() => {
    if (mode !== "simulate") {
      schedulerRef.current = null;
      return;
    }

    const scheduler = new Scheduler((event: SceneEvent) => {
      eventsRef.current.push(event);
    });
    schedulerRef.current = scheduler;

    return () => { schedulerRef.current = null; };
  }, [mode]);

  // Get zone center by name
  const getZoneCenter = useCallback((name: string): [number, number, number] => {
    const zone = zones.find(z => z.name === name);
    return zone ? zone.center : [0, 0, 0];
  }, [zones]);

  // Random position within a zone
  const randomInZone = useCallback((name: string): [number, number, number] => {
    const zone = zones.find(z => z.name === name);
    if (!zone) return [0, 0, 0];
    const hw = (zone.gridSize[0] * zone.spacing) / 2;
    const hd = (zone.gridSize[1] * zone.spacing) / 2;
    return [
      zone.center[0] + (Math.random() - 0.5) * hw * 2,
      zone.center[1] + 0.1,
      zone.center[2] + (Math.random() - 0.5) * hd * 2,
    ];
  }, [zones]);

  useFrame((_, delta) => {
    if (mode !== "simulate" || !schedulerRef.current) return;

    elapsedRef.current += delta;
    const scheduler = schedulerRef.current;

    // QEC metronome — one round every QEC_PERIOD_MS wall milliseconds
    roundTimer.current += delta * 1000;
    const roundDur = QEC_PERIOD_MS;

    // Smooth QEC phase for the breath animation
    setQecPhase((roundTimer.current % roundDur) / roundDur);

    if (roundTimer.current >= roundDur) {
      roundTimer.current -= roundDur;
      scheduler.tickRound();

      // Process accumulated events
      const events = eventsRef.current.splice(0);
      for (const event of events) {
        switch (event.type) {
          case "qec-round":
            // Flash ancilla atoms in all zones — brief 420nm pulse
            for (let j = 0; j < 3; j++) {
              flashesRef.current.push({
                position: randomInZone("memory"),
                color: EMISSION_420,
                startTime: elapsedRef.current,
                duration: TIMING.gateAttack.dur / 1000 + TIMING.gateDecay.dur / 1000,
                intensity: 0.6,
              });
            }
            break;

          case "distill-commit":
            // Bright flash in resource zone — success
            for (let j = 0; j < 5; j++) {
              flashesRef.current.push({
                position: randomInZone("resource"),
                color: EMISSION_420,
                startTime: elapsedRef.current,
                duration: 0.5,
                intensity: 1.2,
              });
            }
            setBuffer({ ...scheduler.buffer });
            break;

          case "distill-discard":
            // Red flash — failure, visible
            for (let j = 0; j < 3; j++) {
              flashesRef.current.push({
                position: randomInZone("resource"),
                color: EMISSION_780,
                startTime: elapsedRef.current,
                duration: 0.3,
                intensity: 0.8,
              });
            }
            break;

          case "buffer-drain":
            // Transport from resource to processor
            transportsRef.current.push({
              from: getZoneCenter("resource"),
              to: getZoneCenter("processor"),
              startTime: elapsedRef.current,
              duration: TIMING.transport.dur / 1000,
              progress: 0,
            });
            setBuffer({ ...scheduler.buffer });
            break;

          case "stall":
            setSchedulerState("stalled");
            break;

          case "resume":
            setSchedulerState("running");
            // Green flash on resume
            flashesRef.current.push({
              position: getZoneCenter("processor"),
              color: EMISSION_420,
              startTime: elapsedRef.current,
              duration: 0.6,
              intensity: 1.5,
            });
            setBuffer({ ...scheduler.buffer });
            break;
        }
      }
    }

    // Clean up expired flashes
    flashesRef.current = flashesRef.current.filter(
      f => elapsedRef.current - f.startTime < f.duration * 1.5
    );

    // Update transport progress
    transportsRef.current = transportsRef.current.filter(t => {
      t.progress = (elapsedRef.current - t.startTime) / t.duration;
      return t.progress < 1.2;
    });
  });

  if (mode !== "simulate") return null;

  const memoryCenterTuple = getZoneCenter("memory");
  const resourceCenter = getZoneCenter("resource");

  return (
    <group>
      {/* Flash particles — emission-colored spheres that bloom */}
      {flashesRef.current.map((flash, i) => {
        const age = elapsedRef.current - flash.startTime;
        const t = age / flash.duration;
        // Hard attack, exponential decay
        const intensity = t < 0.2 ? t / 0.2 : Math.exp(-3 * (t - 0.2));
        if (intensity < 0.01) return null;

        return (
          <mesh key={`flash-${i}`} position={flash.position}>
            <sphereGeometry args={[0.08 * intensity * flash.intensity, 8, 6]} />
            <meshBasicMaterial
              color={flash.color}
              transparent
              opacity={intensity * 0.8}
              toneMapped={false}
            />
          </mesh>
        );
      })}

      {/* Transport particles — moving between zones */}
      {transportsRef.current.map((transport, i) => {
        if (transport.progress < 0 || transport.progress > 1) return null;
        const p = transport.progress;
        const x = transport.from[0] + (transport.to[0] - transport.from[0]) * p;
        const y = 0.5 + Math.sin(p * Math.PI) * 1.5; // arc
        const z = transport.from[2] + (transport.to[2] - transport.from[2]) * p;

        return (
          <mesh key={`transport-${i}`} position={[x, y, z]}>
            <sphereGeometry args={[0.06, 8, 6]} />
            <meshBasicMaterial
              color={EMISSION_780}
              transparent
              opacity={0.7}
              toneMapped={false}
            />
          </mesh>
        );
      })}

      {/* QEC metronome — subtle pulse on memory zone */}
      <mesh position={memoryCenterTuple}>
        <sphereGeometry args={[3, 16, 16]} />
        <meshBasicMaterial
          color={EMISSION_420}
          transparent
          opacity={Math.sin(qecPhase * Math.PI) * 0.015 * (schedulerState === "stalled" ? 0 : 1)}
          toneMapped={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Buffer gauge — persistent visual */}
      <Html position={[resourceCenter[0] + 3, 2, resourceCenter[2]]} center>
        <div style={{
          pointerEvents: "none",
          userSelect: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}>
          <div style={{
            display: "flex",
            gap: 2,
            transform: "rotate(180deg)",
          }}>
            {Array.from({ length: buffer.capacity }, (_, i) => (
              <div
                key={i}
                style={{
                  width: 3,
                  height: 12,
                  borderRadius: 1,
                  background: i < buffer.count ? "#6B7BFF" : "#1A1D24",
                  transition: "background 200ms",
                }}
              />
            ))}
          </div>
          <span style={{
            fontSize: 8,
            fontFamily: "var(--font-mono)",
            color: schedulerState === "stalled" ? "#FF4D3D" : "#5C626C",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}>
            {schedulerState === "stalled" ? "stall" : `${buffer.count}/${buffer.capacity}`}
          </span>
        </div>
      </Html>
    </group>
  );
}
