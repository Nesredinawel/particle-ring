"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import SoftBallCluster from "./SoftBallCluster";
import SoftGlassBubbleCluster from "./SoftGlassBubbleCluster";
import BackgroundText from "./BackgroundText";
import GlassBubbleCluster from "./SoftGlassBubbleCluster";

export default function Scene3() {
  return (
    <Canvas
  dpr={[1, 1.25]}     // 🔥 clamps GPU
  gl={{ antialias: false }}
>
  <color attach="background" args={["#000"]} />
  <ambientLight intensity={0.1} />
  <directionalLight position={[3, 4, 6]} intensity={1.2} />
   {/* BACKGROUND TEXT */}
      <BackgroundText />
  <GlassBubbleCluster />
</Canvas>

  );
}
