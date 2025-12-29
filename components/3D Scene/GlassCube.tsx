"use client";

import { MeshTransmissionMaterial, Edges } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { glassMaterialProps } from "./GlassMaterial";

export default function GlassCube() {
  const ref = useRef<THREE.Mesh>(null);

  // cursor-driven rotation velocity
  const rollVelocity = useRef(new THREE.Vector2());
  const prevPointer = useRef(new THREE.Vector2());
  const isHovering = useRef(false);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const t = clock.elapsedTime;

    // -------------------------
    // BASE AUTOMATIC ANIMATION
    // -------------------------
    ref.current.rotation.y += 0.003;
    ref.current.rotation.x = Math.sin(t * 0.6) * 0.15;
    ref.current.position.y = Math.sin(t * 0.8) * 0.08;

    // -------------------------
    // CURSOR-DRIVEN ROLL
    // -------------------------
    ref.current.rotation.y += rollVelocity.current.x;
    ref.current.rotation.x += rollVelocity.current.y;

    // damping for smoothness
    rollVelocity.current.multiplyScalar(0.9);
  });

  return (
    <mesh
      ref={ref}
      onPointerOver={(e) => {
        isHovering.current = true;
        prevPointer.current.set(e.clientX, e.clientY);
      }}
      onPointerOut={() => {
        isHovering.current = false;
      }}
      onPointerMove={(e) => {
        if (!isHovering.current) return;

        const dx = e.clientX - prevPointer.current.x;
        const dy = e.clientY - prevPointer.current.y;

        prevPointer.current.set(e.clientX, e.clientY);

        // direction-aware rolling
        rollVelocity.current.x += dx * 0.0008;
        rollVelocity.current.y += dy * 0.0008;
      }}
    >
      <boxGeometry args={[2.3, 2.3, 2.3]} />
      <MeshTransmissionMaterial {...glassMaterialProps} />
      <Edges scale={1.02} color="white" />
    </mesh>
  );
}
