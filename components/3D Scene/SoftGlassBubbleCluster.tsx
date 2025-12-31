"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/* =======================
   CONFIG
======================= */

const BUBBLE_COUNT = 500;

// Physics
const CENTER_FORCE = 0.01;
const SEPARATION_FORCE = 0.06;
const DAMPING = 0.92;

// Cursor flow
const FLOW_RADIUS = 2.5;
const FLOW_STRENGTH = 0.06;

// Pop
const POP_DURATION = 0.45;
const POP_EXPANSION = 1.8;
const SHOCKWAVE_FORCE = 0.25;

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
   MATERIAL (SOAP BUBBLE)
======================= */

function createBubbleMaterial() {
  const mat = new THREE.MeshPhysicalMaterial({
    transparent: true,
    opacity: 0.25,
    roughness: 0,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0,
    reflectivity: 1,
    side: THREE.DoubleSide,
  });

  // 🌈 Fake thin-film iridescence (FAST)
  mat.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      `#include <output_fragment>`,
      `
      float fresnel = pow(
        1.0 - dot(normalize(vNormal), normalize(vViewPosition)),
        3.0
      );

      vec3 iridescence = vec3(
        sin(fresnel * 8.0),
        sin(fresnel * 6.0 + 1.0),
        sin(fresnel * 4.0 + 2.0)
      ) * 0.6;

      outgoingLight += iridescence * fresnel * 1.6;

      #include <output_fragment>
      `
    );
  };

  return mat;
}

/* =======================
   COMPONENT
======================= */

export default function GlassBubbleCluster() {
  const group = useRef<THREE.Group>(null);
  const { mouse, viewport } = useThree();

  const cursor = useRef(new THREE.Vector3());
  const prevCursor = useRef(new THREE.Vector3());
  const tmp = new THREE.Vector3();

  const material = useMemo(() => createBubbleMaterial(), []);

  const bubbles = useMemo<Bubble[]>(() => {
    return Array.from({ length: BUBBLE_COUNT }).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 1.6,
        (Math.random() - 0.5) * 1.6,
        (Math.random() - 0.5) * 0.8
      ),
      velocity: new THREE.Vector3(),
      radius: 0.25 + Math.random() * 0.3,
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
        (Math.random() - 0.5) * 1.6,
        (Math.random() - 0.5) * 1.6,
        (Math.random() - 0.5) * 0.8
      );

      const mesh = group.current?.children[i] as THREE.Mesh;
      if (mesh) mesh.scale.setScalar(1);
    });
  };

  /* =======================
     FRAME LOOP
  ======================= */

  useFrame((_, delta) => {
    cursor.current.set(
      mouse.x * viewport.width * 0.5,
      mouse.y * viewport.height * 0.5,
      0
    );

    const cursorDelta = cursor.current.clone().sub(prevCursor.current);
    prevCursor.current.copy(cursor.current);

    let aliveCount = 0;

    for (let i = 0; i < bubbles.length; i++) {
      const b = bubbles[i];
      const mesh = group.current?.children[i] as THREE.Mesh;
      if (!mesh) continue;

      /* 💥 POP */
      if (!b.alive) {
        b.popTime += delta;
        const t = b.popTime / POP_DURATION;

        if (t >= 1) {
          mesh.scale.setScalar(0);
          continue;
        }

        const pressure = Math.sin(t * Math.PI);
        mesh.scale.setScalar(1 + pressure * POP_EXPANSION);
        continue;
      }

      aliveCount++;

      /* 🧲 CENTER FORCE */
      b.velocity.addScaledVector(b.position, -CENTER_FORCE);

      /* 🫧 SEPARATION (OPTIMIZED) */
      for (let j = i + 1; j < bubbles.length; j++) {
        const o = bubbles[j];
        if (!o.alive) continue;

        tmp.subVectors(b.position, o.position);
        const d = tmp.length();
        const min = b.radius + o.radius;

        if (d < min && d > 0.0001) {
          tmp.normalize().multiplyScalar((min - d) * SEPARATION_FORCE);
          b.velocity.add(tmp);
          o.velocity.sub(tmp);
        }
      }

      /* 🌬️ CURSOR FLOW */
      const dist = b.position.distanceTo(cursor.current);
      if (dist < FLOW_RADIUS) {
        const f = (1 - dist / FLOW_RADIUS) * FLOW_STRENGTH;
        b.velocity.addScaledVector(cursorDelta, f);
      }

      b.velocity.multiplyScalar(DAMPING);
      b.position.add(b.velocity);
      mesh.position.lerp(b.position, 0.3);
    }

    if (aliveCount === 0) resetAll();
  });

  /* =======================
     POP HANDLER
  ======================= */

  const popBubble = (index: number) => {
    const b = bubbles[index];
    if (!b.alive) return;

    b.alive = false;
    b.popTime = 0;

    bubbles.forEach((o) => {
      if (!o.alive) return;
      tmp.subVectors(o.position, b.position);
      const d = tmp.length();
      if (d < 1.2 && d > 0.001) {
        tmp.normalize().multiplyScalar(SHOCKWAVE_FORCE / d);
        o.velocity.add(tmp);
      }
    });
  };

  /* =======================
     RENDER
  ======================= */

  return (
    <group ref={group}>
      {bubbles.map((b, i) => (
        <mesh
          key={i}
          material={material}
          onPointerDown={(e) => {
            e.stopPropagation();
            popBubble(i);
          }}
        >
          {/* LOW-POLY = FAST */}
          <sphereGeometry args={[b.radius, 16, 16]} />
        </mesh>
      ))}
    </group>
  );
}
