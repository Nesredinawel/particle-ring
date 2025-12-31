"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const BALL_COUNT = 28;
const CLUSTER_RADIUS = 1.4;
const CENTER_FORCE = 0.018;
const SEPARATION_FORCE = 0.12;
const CURSOR_FORCE = 0.6;
const CURSOR_RADIUS = 1.5;

type Ball = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  size: number;
};

export default function SoftBallCluster() {
  const group = useRef<THREE.Group>(null);
  const { mouse, viewport } = useThree();

  const balls = useMemo<Ball[]>(() => {
    return Array.from({ length: BALL_COUNT }).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 0.8
      ),
      velocity: new THREE.Vector3(),
      size: 0.22 + Math.random() * 0.45,
    }));
  }, []);

  useFrame(() => {
    const mx = mouse.x * viewport.width * 0.5;
    const my = mouse.y * viewport.height * 0.5;

    balls.forEach((ball, i) => {
      const mesh = group.current?.children[i] as THREE.Mesh;
      if (!mesh) return;

      /* 1️⃣ Pull toward center (cluster magnet) */
      const toCenter = ball.position.clone().multiplyScalar(-1);
      toCenter.multiplyScalar(CENTER_FORCE);
      ball.velocity.add(toCenter);

      /* 2️⃣ Soft separation (prevents overlap) */
      balls.forEach((other, j) => {
        if (i === j) return;

        const diff = ball.position.clone().sub(other.position);
        const dist = diff.length();
        const minDist = ball.size + other.size;

        if (dist < minDist && dist > 0.0001) {
          diff.normalize().multiplyScalar((minDist - dist) * SEPARATION_FORCE);
          ball.velocity.add(diff);
        }
      });

      /* 3️⃣ Cursor interaction (detach effect) */
      const dx = ball.position.x - mx;
      const dy = ball.position.y - my;
      const d = Math.sqrt(dx * dx + dy * dy);

      if (d < CURSOR_RADIUS) {
        const force = (1 - d / CURSOR_RADIUS) * CURSOR_FORCE;
        ball.velocity.x += dx * force;
        ball.velocity.y += dy * force;
      }

      /* 4️⃣ Smooth damping */
      ball.velocity.multiplyScalar(0.88);

      /* 5️⃣ Apply movement */
      ball.position.add(ball.velocity);

      /* 6️⃣ Visual smoothing */
      mesh.position.lerp(ball.position, 0.15);
    });
  });

  return (
    <group ref={group}>
      {balls.map((ball, i) => (
        <mesh key={i}>
          <sphereGeometry args={[ball.size, 64, 64]} />
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.35}
            metalness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.12}
          />
        </mesh>
      ))}
    </group>
  );
}
