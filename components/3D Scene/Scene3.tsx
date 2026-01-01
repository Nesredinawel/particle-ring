"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

import BackgroundText from "./BackgroundText";
import GlassBubbleCluster from "./SoftGlassBubbleCluster";

export default function Scene3() {
  return (
    <Canvas
      dpr={[1, 1.25]}
      camera={{ position: [0, 0, 6], fov: 45 }}
      shadows={false}
      flat={false}
      linear={false}
      gl={{ antialias: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 6, 8]} intensity={1.2} />
      <directionalLight position={[-4, -2, 6]} intensity={0.5} />

      {/* 🌌 HDRI for LIGHTING ONLY (NO REFLECTIONS) */}
      <Environment
        preset="city"
        background={false}        // ❌ not visible
        environmentIntensity={0.15} // ✅ soft light contribution
      />

      {/* Custom background */}
      <BackgroundText />

      {/* Glass bubbles */}
      <GlassBubbleCluster />
    </Canvas>
  );
}
