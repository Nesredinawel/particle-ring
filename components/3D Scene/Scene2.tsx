"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import BackgroundText from "./BackgroundText";
import GlassCube from "./GlassCube";

function SceneContent() {
  return (
    <>
      {/* LIGHTS */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.5}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-5, 3, 5]} intensity={0.7} color="cyan" />
      <pointLight position={[3, -5, -5]} intensity={0.5} color="magenta" />

      {/* BACKGROUND TEXT */}
      <BackgroundText label="FUTURE" />

      {/* GLASS CUBE */}
      <GlassCube />
    </>
  );
}

export default function Scene2() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ antialias: true }}
      shadows
      onCreated={({ gl }) => {
        gl.setClearColor("#000000", 1);
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <SceneContent />
    </Canvas>
  );
}
