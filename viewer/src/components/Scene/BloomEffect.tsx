"use client";

import { EffectComposer, Bloom } from "@react-three/postprocessing";

export function BloomEffect() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.35}
        luminanceThreshold={0.3}
        luminanceSmoothing={0.95}
        mipmapBlur
      />
    </EffectComposer>
  );
}
