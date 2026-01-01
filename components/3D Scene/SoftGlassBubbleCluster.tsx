"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/* =======================
   CONFIG
======================= */

const BUBBLE_COUNT = 20;

// Physics
const CENTER_FORCE = 0.007;
const SEPARATION_FORCE = 0.06;
const DAMPING = 0.92;

// Cursor flow
const FLOW_RADIUS = 2.6;
const FLOW_STRENGTH = 0.06;

// Pop
const POP_DURATION = 0.4;
const POP_EXPANSION = 1.6;
const SHOCKWAVE_FORCE = 0.22;

/* =======================
   TYPES
======================= */

type Bubble = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  radius: number;
  alive: boolean;
  popTime: number;
};

/* =======================
   SOAP BUBBLE MATERIAL
======================= */

const soapBubbleMaterialProps = {
  transmission: 1,
  thickness: 0.18,              // thin soap film
  roughness: 0,
  ior: 1.33,
  chromaticAberration: 0.08,
  anisotropicBlur: 0.05,
  envMapIntensity: 0.8,
  backside: true,
  samples: 4,
  resolution: 256,
};

/* =======================
   COMPONENT
======================= */

export default function SoapBubbleCluster() {
  const group = useRef<THREE.Group>(null);
  const { mouse, viewport } = useThree();

  const cursor = useRef(new THREE.Vector3());
  const prevCursor = useRef(new THREE.Vector3());
  const tmp = new THREE.Vector3();

  /* =======================
     BUBBLES
  ======================= */

  const bubbles = useMemo<Bubble[]>(() => {
    return Array.from({ length: BUBBLE_COUNT }).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 1
      ),
      velocity: new THREE.Vector3(),
      radius: 0.22 + Math.random() * 0.3,
      alive: true,
      popTime: 0,
    }));
  }, []);

  /* =======================
     RESET
  ======================= */

  const resetAll = () => {
    bubbles.forEach((b, i) => {
      b.alive = true;
      b.popTime = 0;
      b.velocity.set(0, 0, 0);
      b.position.set(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 1
      );

      const mesh = group.current?.children[i] as THREE.Mesh;
      if (mesh) {
        mesh.scale.setScalar(1);
        (mesh.material as any).opacity = 1;
      }
    });
  };

  useMemo(resetAll, []);

  /* =======================
     POP
  ======================= */

  const popBubble = (index: number) => {
    const b = bubbles[index];
    if (!b.alive) return;

    b.alive = false;
    b.popTime = 0;

    // Shockwave
    bubbles.forEach((o) => {
      if (!o.alive) return;
      tmp.subVectors(o.position, b.position);
      const d = tmp.length();
      if (d < 1.4 && d > 0.001) {
        tmp.normalize().multiplyScalar(SHOCKWAVE_FORCE / d);
        o.velocity.add(tmp);
      }
    });
  };

  /* =======================
     FRAME LOOP
  ======================= */

  useFrame((_, delta) => {
    cursor.current.lerp(
      new THREE.Vector3(
        mouse.x * viewport.width * 0.5,
        mouse.y * viewport.height * 0.5,
        0
      ),
      0.15
    );

    const cursorDelta = cursor.current.clone().sub(prevCursor.current);
    prevCursor.current.copy(cursor.current);

    let aliveCount = 0;

    bubbles.forEach((b, i) => {
      const mesh = group.current?.children[i] as THREE.Mesh;
      if (!mesh) return;

      const mat = mesh.material as any;

      /* 💥 POP */
      if (!b.alive) {
        b.popTime += delta;
        const t = b.popTime / POP_DURATION;

        if (t >= 1) {
          mesh.scale.setScalar(0);
          mat.opacity = 0;
          return;
        }

        const snap = Math.sin(t * Math.PI);
        mesh.scale.setScalar(1 + snap * POP_EXPANSION);
        mat.opacity = 1 - t * 1.5;
        return;
      }

      aliveCount++;

      /* 🧲 CENTER */
      b.velocity.addScaledVector(b.position, -CENTER_FORCE);

      /* 🫧 SEPARATION */
      bubbles.forEach((o, j) => {
        if (i === j || !o.alive) return;
        tmp.subVectors(b.position, o.position);
        const d = tmp.length();
        const min = b.radius + o.radius;
        if (d < min && d > 0.0001) {
          tmp.normalize().multiplyScalar((min - d) * SEPARATION_FORCE);
          b.velocity.add(tmp);
        }
      });

      /* 🌬️ CURSOR FLOW */
      const dist = b.position.distanceTo(cursor.current);
      if (dist < FLOW_RADIUS) {
        const f = (1 - dist / FLOW_RADIUS) * FLOW_STRENGTH;
        b.velocity.addScaledVector(cursorDelta, f);
      }

      /* 🌊 MOTION */
      b.velocity.multiplyScalar(DAMPING);
      b.position.add(b.velocity);
      mesh.position.lerp(b.position, 0.25);

      mesh.rotation.x += 0.002;
      mesh.rotation.y += 0.003;
    });

    if (aliveCount === 0) resetAll();
  });

  /* =======================
     RENDER
  ======================= */

  return (
    <group ref={group}>
      {bubbles.map((b, i) => (
        <mesh
          key={i}
          onPointerDown={(e) => {
            e.stopPropagation();
            popBubble(i);
          }}
        >
          <sphereGeometry args={[b.radius, 32, 32]} />

          <MeshTransmissionMaterial
            {...soapBubbleMaterialProps}
            transparent
            opacity={1}
          />

          {/* Invisible hit zone */}
          <mesh scale={1.25}>
            <sphereGeometry args={[b.radius, 12, 12]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </mesh>
      ))}
    </group>
  );
}
