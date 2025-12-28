"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import ParticleRing from "./ParticleRing";

export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <ParticleRing />
      </Suspense>
    </Canvas>
  );
}
