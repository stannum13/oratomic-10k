"use client";

import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { BLOOM } from "@/lib/motion";

export function BloomEffect() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.5}
        luminanceThreshold={0.4}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
    </EffectComposer>
  );
}
