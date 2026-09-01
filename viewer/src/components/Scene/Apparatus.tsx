"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { ZoneConfig } from "./ZoneLayout";

/**
 * Substrate chip — the physical base the atoms sit on.
 * A single dark platform spanning all zones, matching --bg.
 */
function Substrate() {
  return (
    <group>
      {/* Main substrate platform */}
      <mesh position={[1, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 12]} />
        <meshPhysicalMaterial
          color="#08090C"
          metalness={0.8}
          roughness={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Substrate edge bevel — thin bright line */}
      {[
        { pos: [1, -0.11, -6] as [number, number, number], size: [24, 0.02, 0.02] as [number, number, number] },
        { pos: [1, -0.11, 6] as [number, number, number], size: [24, 0.02, 0.02] as [number, number, number] },
        { pos: [-11, -0.11, 0] as [number, number, number], size: [0.02, 0.02, 12] as [number, number, number] },
        { pos: [13, -0.11, 0] as [number, number, number], size: [0.02, 0.02, 12] as [number, number, number] },
      ].map((edge, i) => (
        <mesh key={i} position={edge.pos}>
          <boxGeometry args={edge.size} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.08} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Vacuum chamber — transparent enclosure around the QPU.
 */
function VacuumChamber() {
  return (
    <group>
      {/* Glass dome / enclosure */}
      <mesh position={[1, 2, 0]}>
        <boxGeometry args={[25, 5, 13]} />
        <meshPhysicalMaterial
          color="#1a2a3a"
          metalness={0.1}
          roughness={0.1}
          transparent
          opacity={0.03}
          side={THREE.BackSide}
          transmission={0.95}
          thickness={0.5}
        />
      </mesh>

      {/* Chamber frame edges — 4 vertical pillars */}
      {[
        [-12, 2, -6],
        [-12, 2, 6],
        [14, 2, -6],
        [14, 2, 6],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <boxGeometry args={[0.08, 5, 0.08]} />
          <meshPhysicalMaterial color="#333333" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* Top frame edges */}
      {[
        { pos: [1, 4.5, -6] as [number, number, number], size: [26, 0.06, 0.06] as [number, number, number] },
        { pos: [1, 4.5, 6] as [number, number, number], size: [26, 0.06, 0.06] as [number, number, number] },
        { pos: [-12, 4.5, 0] as [number, number, number], size: [0.06, 0.06, 12] as [number, number, number] },
        { pos: [14, 4.5, 0] as [number, number, number], size: [0.06, 0.06, 12] as [number, number, number] },
      ].map((edge, i) => (
        <mesh key={i} position={edge.pos}>
          <boxGeometry args={edge.size} />
          <meshPhysicalMaterial color="#333333" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Inter-zone data buses — structural lines (not emissive).
 */
function DataBuses({ zones }: { zones: ZoneConfig[] }) {
  const buses = useMemo(() => {
    const memory = zones.find(z => z.name === "memory");
    const processor = zones.find(z => z.name === "processor");
    const operation = zones.find(z => z.name === "operation");
    const resource = zones.find(z => z.name === "resource");

    if (!memory || !processor || !operation || !resource) return [];

    return [
      { from: memory.center, to: processor.center },
      { from: memory.center, to: operation.center },
      { from: processor.center, to: resource.center },
      { from: operation.center, to: processor.center },
    ];
  }, [zones]);

  const lines = useMemo(() => {
    return buses.map((bus) => {
      const from = bus.from;
      const to = bus.to;
      const points = [
        new THREE.Vector3(from[0], 0.02, from[2]),
        new THREE.Vector3((from[0] + to[0]) / 2, 0.02, (from[2] + to[2]) / 2),
        new THREE.Vector3(to[0], 0.02, to[2]),
      ];
      const curve = new THREE.CatmullRomCurve3(points);
      const curvePoints = curve.getPoints(30);
      const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color("#1A1D24"),
        transparent: true,
        opacity: 0.12,
      });
      return new THREE.Line(geometry, material);
    });
  }, [buses]);

  if (buses.length === 0) return null;

  return (
    <group>
      {lines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  );
}


/**
 * Zone markings on the substrate — corner marks in structural color.
 */
function ZoneMarkings({ zones }: { zones: ZoneConfig[] }) {
  const cornerObjects = useMemo(() => {
    return zones.map((zone) => {
      const w = zone.gridSize[0] * zone.spacing;
      const h = zone.gridSize[1] * zone.spacing;
      const color = new THREE.Color("#1A1D24");

      const hw = w / 2;
      const hh = h / 2;
      const y = -0.08;
      const cx = zone.center[0];
      const cz = zone.center[2];

      const cornerLen = Math.min(w, h) * 0.15;
      const corners: [number, number, number][][] = [
        [[cx - hw, y, cz - hh], [cx - hw + cornerLen, y, cz - hh]],
        [[cx - hw, y, cz - hh], [cx - hw, y, cz - hh + cornerLen]],
        [[cx + hw, y, cz - hh], [cx + hw - cornerLen, y, cz - hh]],
        [[cx + hw, y, cz - hh], [cx + hw, y, cz - hh + cornerLen]],
        [[cx - hw, y, cz + hh], [cx - hw + cornerLen, y, cz + hh]],
        [[cx - hw, y, cz + hh], [cx - hw, y, cz + hh - cornerLen]],
        [[cx + hw, y, cz + hh], [cx + hw - cornerLen, y, cz + hh]],
        [[cx + hw, y, cz + hh], [cx + hw, y, cz + hh - cornerLen]],
      ];

      const lineObjects = corners.map((pair) => {
        const pts = pair.map(p => new THREE.Vector3(p[0], p[1], p[2]));
        const geom = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: 0.25,
        });
        return new THREE.Line(geom, mat);
      });

      return { name: zone.name, lines: lineObjects };
    });
  }, [zones]);

  return (
    <group>
      {cornerObjects.map((zoneCorners) =>
        zoneCorners.lines.map((line, ci) => (
          <primitive key={`${zoneCorners.name}-${ci}`} object={line} />
        ))
      )}
    </group>
  );
}

export function Apparatus({ zones }: { zones: ZoneConfig[] }) {
  return (
    <group>
      <Substrate />
      <VacuumChamber />
      <DataBuses zones={zones} />
      <ZoneMarkings zones={zones} />
    </group>
  );
}
