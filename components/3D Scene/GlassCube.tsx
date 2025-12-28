"use client";

import { MeshTransmissionMaterial, Edges } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { glassMaterialProps } from "./GlassMaterial";

export default function GlassCube() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const t = clock.elapsedTime;

    // slow rotation + float animation
    ref.current.rotation.y = t * 0.35;
    ref.current.rotation.x = Math.sin(t * 0.6) * 0.15;
    ref.current.position.y = Math.sin(t * 0.8) * 0.08;
  });

  return (
    <mesh ref={ref}>
      {/* Bigger cube */}
      <boxGeometry args={[2.3, 2.3, 2.3]} />

      {/* Glass material */}
      <MeshTransmissionMaterial {...glassMaterialProps} />

      {/* White edges */}
      <Edges scale={1.02} color="white" />
    </mesh>
  );
}
