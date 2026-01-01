"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/* =======================
   CONFIG
======================= */

const BUBBLE_COUNT = 1000;

// Physics
const CENTER_FORCE = 0.006;
const SEPARATION_FORCE = 0.06;
const DAMPING = 0.94;

// Cursor hole
const CLEAR_RADIUS = 1.1;   // absolutely empty
const PUSH_RADIUS = 3.6;    // pressure shell
const CLEAR_FORCE = 0.45;
const EDGE_SMOOTHNESS = 4.5;

// Ripple
const RIPPLE_SPEED = 3.5;
const RIPPLE_STRENGTH = 0.18;
const RIPPLE_FREQUENCY = 5.0;

/* =======================
   TYPES
======================= */

type Bubble = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  radius: number;
};

/* =======================
   MATERIAL
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
  const rippleTime = useRef(0);

  const tmp = new THREE.Vector3();
  const tangent = new THREE.Vector3();

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
      0
    );

    for (let i = 0; i < bubbles.length; i++) {
      const b = bubbles[i];
      const mesh = group.current?.children[i] as THREE.Mesh;
      if (!mesh) continue;

      /* 🧲 CENTER ATTRACTION */
      b.velocity.addScaledVector(b.position, -CENTER_FORCE);

      /* 🫧 BUBBLE SEPARATION */
      for (let j = i + 1; j < bubbles.length; j++) {
        const o = bubbles[j];

        tmp.subVectors(b.position, o.position);
        const d = tmp.length();
        const min = b.radius + o.radius;

        if (d < min && d > 0.0001) {
          tmp.normalize().multiplyScalar((min - d) * SEPARATION_FORCE);
          b.velocity.add(tmp);
          o.velocity.sub(tmp);
        }
      }

      /* 🚫 CURSOR HOLE (TRUE EMPTY ZONE) */
      tmp.subVectors(b.position, cursor.current);
      const dist = tmp.length();

      if (dist > 0.0001) {
        const dir = tmp.clone().normalize();

        /* 🕳️ HARD EXCLUSION CORE */
        if (dist < CLEAR_RADIUS) {
          // Clamp position to boundary
          b.position
            .copy(cursor.current)
            .addScaledVector(dir, CLEAR_RADIUS);

          // Kill inward velocity
          const inward = b.velocity.dot(dir);
          if (inward < 0) {
            b.velocity.addScaledVector(dir, -inward);
          }

          // Strong outward impulse
          b.velocity.addScaledVector(dir, CLEAR_FORCE * 1.5);
        }

        /* 🌫️ SOFT PRESSURE SHELL */
        if (dist < PUSH_RADIUS) {
          const x = THREE.MathUtils.clamp(
            (dist - CLEAR_RADIUS) / (PUSH_RADIUS - CLEAR_RADIUS),
            0,
            1
          );

          const pressure = Math.exp(-x * x * EDGE_SMOOTHNESS);

          b.velocity.addScaledVector(dir, pressure * CLEAR_FORCE);

          // Tangential flow
          tangent.set(-dir.y, dir.x, 0);
          b.velocity.addScaledVector(tangent, pressure * 0.06);
        }

        /* 🌊 PRESSURE RIPPLE */
        const ripple =
          Math.sin(
            dist * RIPPLE_FREQUENCY -
              rippleTime.current * RIPPLE_SPEED
          ) *
          RIPPLE_STRENGTH *
          Math.exp(-dist * 0.5);

        b.velocity.addScaledVector(dir, ripple);
      }

      /* 🧊 DAMPING & INTEGRATION */
      b.velocity.multiplyScalar(DAMPING);
      b.position.add(b.velocity);

      mesh.position.lerp(b.position, 0.4);
    }
  });

  /* =======================
     RENDER
  ======================= */

  return (
    <group ref={group}>
      {bubbles.map((b, i) => (
        <mesh key={i} material={material}>
          <sphereGeometry args={[b.radius, 16, 16]} />
        </mesh>
      ))}
    </group>
  );
}
