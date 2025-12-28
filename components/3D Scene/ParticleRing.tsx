"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const COUNT = 9000;
const BASE_RADIUS = 1.7;

export default function ParticleRing() {
  const points = useRef<THREE.Points>(null);

  // Store original data so motion is smooth & stable
  const data = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const angles = new Float32Array(COUNT);
    const offsets = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const offset = (Math.random() - 0.5) * 0.6;

      const r = BASE_RADIUS + offset;

      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = Math.sin(angle) * r;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.2;

      angles[i] = angle;
      offsets[i] = offset;
    }

    return { positions, angles, offsets };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(data.positions, 3)
    );
    return geo;
  }, [data]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const pos = geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < COUNT; i++) {
      const angle = data.angles[i];
      const offset = data.offsets[i];

      // 🔁 Radial breathing (very subtle)
      const breathe =
        Math.sin(t * 0.6 + offset * 4) * 0.05;

      const r = BASE_RADIUS + offset + breathe;

      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = Math.sin(angle) * r;

      // 🔀 Near ↔ far depth movement
      pos[i * 3 + 2] =
        Math.sin(t * 0.9 + offset * 6) * 0.6;
    }

    geometry.attributes.position.needsUpdate = true;

    // 🌀 Almost-static orbital rotation
    if (points.current) {
      points.current.rotation.z = t * 0.03;
    }
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.02}
        color="#ffffff"
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
