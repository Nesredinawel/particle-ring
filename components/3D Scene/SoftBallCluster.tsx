"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const BALL_COUNT = 260;
const CENTER_FORCE = 0.015;
const SEPARATION_FORCE = 0.1;
const DAMPING = 0.9;

// Cursor flow (directional)
const FLOW_RADIUS = 2.5;
const FLOW_STRENGTH = 0.06;

// Burst
const BURST_SPEED = 0.16;

type Ball = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  size: number;
  alive: boolean;
  burst: number;
};

export default function SoftBallCluster() {
  const group = useRef<THREE.Group>(null);
  const { mouse, viewport } = useThree();

  const prevCursor = useRef(new THREE.Vector3());

  const balls = useMemo<Ball[]>(() => {
    return Array.from({ length: BALL_COUNT }).map(() => ({
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      size: 0.2 + Math.random() * 0.45,
      alive: true,
      burst: 0,
    }));
  }, []);

  // Reset all bubbles together
  const resetAll = () => {
    balls.forEach((ball, i) => {
      ball.alive = true;
      ball.burst = 0;
      ball.velocity.set(0, 0, 0);

      ball.position.set(
        (Math.random() - 0.5) * 1.4,
        (Math.random() - 0.5) * 1.4,
        (Math.random() - 0.5) * 0.9
      );

      const mesh = group.current?.children[i] as THREE.Mesh;
      if (mesh) {
        mesh.scale.setScalar(1);
        (mesh.material as THREE.MeshPhysicalMaterial).opacity = 1;
      }
    });
  };

  useMemo(resetAll, []);

  useFrame((_, delta) => {
    const cx = mouse.x * viewport.width * 0.5;
    const cy = mouse.y * viewport.height * 0.5;
    const cursor = new THREE.Vector3(cx, cy, 0);

    // Cursor direction & speed
    const cursorDelta = cursor.clone().sub(prevCursor.current);
    prevCursor.current.copy(cursor);

    let aliveCount = 0;

    balls.forEach((ball, i) => {
      const mesh = group.current?.children[i] as THREE.Mesh;
      if (!mesh) return;

      const material = mesh.material as THREE.MeshPhysicalMaterial;

      /* 💥 BURST */
      if (!ball.alive) {
        ball.burst += BURST_SPEED * delta * 60;

        const snap = Math.sin(ball.burst * Math.PI);
        mesh.scale.setScalar(1 + snap * 1.6 - ball.burst * 0.8);
        material.opacity = Math.max(0, 1 - ball.burst * 1.8);

        return;
      }

      aliveCount++;

      /* 🧲 CENTER */
      ball.velocity.add(
        ball.position.clone().multiplyScalar(-CENTER_FORCE)
      );

      /* 🫧 SEPARATION */
      balls.forEach((other, j) => {
        if (i === j || !other.alive) return;

        const diff = ball.position.clone().sub(other.position);
        const dist = diff.length();
        const minDist = ball.size + other.size;

        if (dist < minDist && dist > 0.0001) {
          diff
            .normalize()
            .multiplyScalar((minDist - dist) * SEPARATION_FORCE);
          ball.velocity.add(diff);
        }
      });

      /* 🌬️ CURSOR DIRECTION FLOW */
      const toBall = ball.position.clone().sub(cursor);
      const dist = toBall.length();

      if (dist < FLOW_RADIUS) {
        const falloff = 1 - dist / FLOW_RADIUS;

        const flow = cursorDelta
          .clone()
          .multiplyScalar(FLOW_STRENGTH * falloff);

        ball.velocity.add(flow);
      }

      /* 🌊 DAMPING */
      ball.velocity.multiplyScalar(DAMPING);

      /* 🚀 APPLY */
      ball.position.add(ball.velocity);
      mesh.position.lerp(ball.position, 0.18);
    });

    /* ♻️ RESET WHEN ALL POPPED */
    if (aliveCount === 0) {
      resetAll();
    }
  });

  return (
    <group ref={group}>
      {balls.map((ball, i) => (
        <mesh
          key={i}
          onPointerDown={(e) => {
            e.stopPropagation();
            if (!ball.alive) return;
            ball.alive = false;
            ball.burst = 0;
          }}
        >
          <sphereGeometry args={[ball.size, 48, 48]} />
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.25}
            metalness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.08}
            transparent
            opacity={1}
          />
        </mesh>
      ))}
    </group>
  );
}
