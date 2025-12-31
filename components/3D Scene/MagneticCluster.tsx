"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const BALL_COUNT = 26;
const ATTRACTION = 0.015;
const RETURN_FORCE = 0.02;
const CURSOR_FORCE = 0.35;
const CURSOR_RADIUS = 1.6;

export default function MagneticCluster() {
  const group = useRef<THREE.Group>(null);
  const { mouse, viewport } = useThree();

  const balls = useMemo(() => {
    return Array.from({ length: BALL_COUNT }).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 1.8,
        (Math.random() - 0.5) * 1.8,
        (Math.random() - 0.5) * 1.2
      ),
      velocity: new THREE.Vector3(),
      size: 0.25 + Math.random() * 0.45,
    }));
  }, []);

  useFrame(() => {
    const mx = mouse.x * viewport.width * 0.5;
    const my = mouse.y * viewport.height * 0.5;

    balls.forEach((ball, i) => {
      const mesh = group.current?.children[i] as THREE.Mesh;
      if (!mesh) return;

      // --- Attraction to center (magnet core)
      const toCenter = ball.position.clone().multiplyScalar(-1);
      toCenter.multiplyScalar(ATTRACTION);
      ball.velocity.add(toCenter);

      // --- Cursor repulsion (detach)
      const dx = ball.position.x - mx;
      const dy = ball.position.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CURSOR_RADIUS) {
        const force = (1 - dist / CURSOR_RADIUS) * CURSOR_FORCE;
        ball.velocity.x += dx * force;
        ball.velocity.y += dy * force;
      }

      // --- Soft damping
      ball.velocity.multiplyScalar(0.92);

      // --- Apply velocity
      ball.position.add(ball.velocity);

      // --- Smooth visual update
      mesh.position.lerp(ball.position, RETURN_FORCE);
    });
  });

  return (
    <group ref={group}>
      {balls.map((ball, i) => (
        <mesh key={i}>
          <sphereGeometry args={[ball.size, 48, 48]} />
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.35}
            metalness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}
