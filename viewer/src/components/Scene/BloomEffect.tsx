"use client";

import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { BLOOM } from "@/lib/motion";

export function BloomEffect() {
  return (
    <EffectComposer>
      <Bloom
        intensity={BLOOM.strength}
        luminanceThreshold={BLOOM.threshold}
        luminanceSmoothing={0.95}
        mipmapBlur
      />
    </EffectComposer>
  );
}
