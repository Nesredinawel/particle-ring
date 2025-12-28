// components/3D Scene/GlassTriangle.tsx
"use client";

import { MeshTransmissionMaterial } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { glassMaterialProps } from "./GlassMaterial";

export default function GlassTriangle() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const t = clock.elapsedTime;

    // slow roll + float
    ref.current.rotation.y = t * 0.35;
    ref.current.rotation.x = Math.sin(t * 0.6) * 0.15;
    ref.current.position.y = Math.sin(t * 0.8) * 0.08;
  });

  return (
    <mesh ref={ref}>
      {/* 3-sided prism */}
      <cylinderGeometry args={[1.2, 1.2, 2.2, 3]} />
      <MeshTransmissionMaterial {...glassMaterialProps} />
    </mesh>
  );
}
