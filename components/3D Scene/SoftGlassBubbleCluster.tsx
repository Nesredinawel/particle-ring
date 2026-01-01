"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/* =======================
   CONFIG
======================= */

const BUBBLE_COUNT = 200;

// Physics
const CENTER_FORCE = 0.006;
const SEPARATION_FORCE = 0.06;
const DAMPING = 0.94;

// Cursor hole
const CLEAR_RADIUS = 1.1;
const PUSH_RADIUS = 3.6;
const CLEAR_FORCE = 0.45;
const EDGE_SMOOTHNESS = 4.5;

// Ripple
const RIPPLE_SPEED = 3.5;
const RIPPLE_STRENGTH = 0.18;
const RIPPLE_FREQUENCY = 5.0;

// Screen alignment
const FIXED_Z = 0; // screen plane

/* =======================
   TYPES
======================= */

type Bubble = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  radius: number;
};

/* =======================
   COMPONENT
======================= */

export default function GlassBubbleCluster() {
  const group = useRef<THREE.Group>(null);
  const { mouse, viewport } = useThree();

  const cursor = useRef(new THREE.Vector3());
  const rippleTime = useRef(0);

  const tmp = new THREE.Vector3();
  const tangent = new THREE.Vector3();

  const bubbles = useMemo<Bubble[]>(() => {
    return Array.from({ length: BUBBLE_COUNT }).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 1.6,
        (Math.random() - 0.5) * 1.6,
        FIXED_Z
      ),
      velocity: new THREE.Vector3(),
      radius: 0.25 + Math.random() * 0.3,
    }));
  }, []);

  /* =======================
     FRAME LOOP
  ======================= */

  useFrame((_, delta) => {
    rippleTime.current += delta;

    cursor.current.set(
      mouse.x * viewport.width * 0.5,
      mouse.y * viewport.height * 0.5,
      FIXED_Z
    );

    for (let i = 0; i < bubbles.length; i++) {
      const b = bubbles[i];
      const mesh = group.current?.children[i] as THREE.Mesh;
      if (!mesh) continue;

      /* 🧲 CENTER ATTRACTION (XY ONLY) */
      b.velocity.x += -b.position.x * CENTER_FORCE;
      b.velocity.y += -b.position.y * CENTER_FORCE;

      /* 🫧 SEPARATION (XY ONLY) */
      for (let j = i + 1; j < bubbles.length; j++) {
        const o = bubbles[j];

        tmp.subVectors(b.position, o.position);
        tmp.z = 0;

        const d = tmp.length();
        const min = b.radius + o.radius;

        if (d < min && d > 0.0001) {
          tmp.normalize().multiplyScalar((min - d) * SEPARATION_FORCE);
          b.velocity.add(tmp);
          o.velocity.sub(tmp);
        }
      }

      /* 🚫 CURSOR HOLE */
      tmp.subVectors(b.position, cursor.current);
      tmp.z = 0;

      const dist = tmp.length();

      if (dist > 0.0001) {
        const dir = tmp.clone().normalize();

        // Hard exclusion core
        if (dist < CLEAR_RADIUS) {
          b.position
            .copy(cursor.current)
            .addScaledVector(dir, CLEAR_RADIUS);

          const inward = b.velocity.dot(dir);
          if (inward < 0) {
            b.velocity.addScaledVector(dir, -inward);
          }

          b.velocity.addScaledVector(dir, CLEAR_FORCE * 1.5);
        }

        // Soft pressure shell
        if (dist < PUSH_RADIUS) {
          const x = THREE.MathUtils.clamp(
            (dist - CLEAR_RADIUS) / (PUSH_RADIUS - CLEAR_RADIUS),
            0,
            1
          );

          const pressure = Math.exp(-x * x * EDGE_SMOOTHNESS);

          b.velocity.addScaledVector(dir, pressure * CLEAR_FORCE);

          tangent.set(-dir.y, dir.x, 0);
          b.velocity.addScaledVector(tangent, pressure * 0.06);
        }

        // Ripple
        const ripple =
          Math.sin(
            dist * RIPPLE_FREQUENCY -
              rippleTime.current * RIPPLE_SPEED
          ) *
          RIPPLE_STRENGTH *
          Math.exp(-dist * 0.5);

        b.velocity.addScaledVector(dir, ripple);
      }

      /* 🧊 DAMPING */
      b.velocity.multiplyScalar(DAMPING);

      /* 🚀 INTEGRATE (LOCK Z) */
      b.position.add(b.velocity);
      b.position.z = FIXED_Z;
      b.velocity.z = 0;

      mesh.position.lerp(b.position, 0.4);
      mesh.lookAt(0, 0, 5);
    }
  });

  /* =======================
     RENDER
  ======================= */

  return (
    <group ref={group}>
      {bubbles.map((b, i) => (
        <mesh key={i}>
          <sphereGeometry args={[b.radius, 16, 16]} />
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.25}
            metalness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.08}
            transparent
            opacity={1}
            depthTest={false}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
