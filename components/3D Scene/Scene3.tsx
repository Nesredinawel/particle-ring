"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import SoftBallCluster from "./SoftBallCluster";

export default function Scene3() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.setClearColor("", 1);
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      {/* LIGHTING — soft studio look */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 5, 5]} intensity={1.1} />
      <directionalLight position={[-4, -2, 3]} intensity={0.6} />

      <SoftBallCluster />
    </Canvas>
  );
}
