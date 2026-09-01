"use client";

import { useRef, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSimulator } from "@/store/simulator";
import { CAMERA_PRESETS, SECTION_IDS } from "@/lib/constants";

const lerpVec = new THREE.Vector3();
const lerpTarget = new THREE.Vector3();

// Module-scoped interaction callbacks
let _onInteractionStart: (() => void) | null = null;
let _onInteractionEnd: (() => void) | null = null;

export function getCameraRigCallbacks() {
  return { onStart: _onInteractionStart, onEnd: _onInteractionEnd };
}

/**
 * Camera rig that guides the camera but yields to user interaction.
 * - In paper mode: lerps toward section presets, pauses when user is dragging
 * - In simulate mode: fully user-controlled via OrbitControls
 * - Hero section: slow auto-orbit that pauses on interaction
 */
export function CameraRig() {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 10, 22));
  const targetLookAt = useRef(new THREE.Vector3(1, 0, 0));
  const angle = useRef(0);
  const userInteracting = useRef(false);
  const idleTimer = useRef(0);
  const activeSection = useSimulator((s) => s.activeSection);
  const mode = useSimulator((s) => s.mode);

  // Expose interaction state for OrbitControls callbacks
  const onInteractionStart = useCallback(() => {
    userInteracting.current = true;
    idleTimer.current = 0;
  }, []);

  const onInteractionEnd = useCallback(() => {
    userInteracting.current = false;
    idleTimer.current = 0;
  }, []);

  // Store callbacks in module scope so Viewport can access them
  _onInteractionStart = onInteractionStart;
  _onInteractionEnd = onInteractionEnd;

  useFrame((_, delta) => {
    // When user is interacting, don't fight the controls
    if (userInteracting.current) return;

    // After interaction ends, wait a moment before resuming guided camera
    if (mode === "simulate") {
      // In simulate mode, only do gentle auto-return if idle for 10+ seconds
      idleTimer.current += delta;
      if (idleTimer.current < 10) return;
    }

    const sectionId = SECTION_IDS[activeSection] || "hero";
    const preset = CAMERA_PRESETS[sectionId];

    if (sectionId === "hero" && mode === "paper") {
      angle.current += delta * 0.08;
      const radius = 24;
      const y = 10;
      targetPos.current.set(
        Math.sin(angle.current) * radius + 1,
        y,
        Math.cos(angle.current) * radius,
      );
      targetLookAt.current.set(1, 0, 0);
    } else {
      targetPos.current.set(...preset.position);
      targetLookAt.current.set(...preset.target);
    }

    // Gentle lerp — doesn't fight, just guides
    const lerpSpeed = mode === "simulate" ? 0.005 : 0.02;
    lerpVec.copy(camera.position).lerp(targetPos.current, lerpSpeed);
    camera.position.copy(lerpVec);

    lerpTarget
      .set(0, 0, -1)
      .applyQuaternion(camera.quaternion)
      .add(camera.position)
      .lerp(targetLookAt.current, lerpSpeed);
    camera.lookAt(lerpTarget);
  });

  return null;
}

