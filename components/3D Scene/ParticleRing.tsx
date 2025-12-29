"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const COUNT = 9000;
const BASE_RADIUS = 1.7;
const SPREAD_RADIUS = 1.2;
const FORCE = 0.75;
const RETURN_FORCE = 0.035;
const DAMPING = 0.9;
const ORBIT_SPEED = 0.15;
const DEPTH_WAVE = 0.6;

// Helper to rotate a 2D vector
function rotate2D(x: number, y: number, angle: number) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return {
    x: x * c - y * s,
    y: x * s + y * c,
  };
}

export default function ParticleRing() {
  const points = useRef<THREE.Points>(null);
  const { mouse, viewport } = useThree();
  const prevMouse = useRef(new THREE.Vector2());

  const data = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const velocity = new Float32Array(COUNT * 3);
    const angle = new Float32Array(COUNT);
    const offset = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const a = Math.random() * Math.PI * 2;
      const o = (Math.random() - 0.5) * 0.6;
      const r = BASE_RADIUS + o;

      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = Math.sin(a) * r;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.2;

      angle[i] = a;
      offset[i] = o;
    }

    return { positions, velocity, angle, offset };
  }, []);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));
    return g;
  }, [data]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const pos = geometry.attributes.position.array as Float32Array;

    // Mouse in world space
    const mx = mouse.x * viewport.width * 0.5;
    const my = mouse.y * viewport.height * 0.5;

    // Mouse velocity
    const mvx = mx - prevMouse.current.x;
    const mvy = my - prevMouse.current.y;
    prevMouse.current.set(mx, my);

    // Normalize mouse direction
    const mLen = Math.sqrt(mvx * mvx + mvy * mvy) || 1;
    const dirX = mvx / mLen;
    const dirY = mvy / mLen;

    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3;
      const iy = ix + 1;
      const iz = ix + 2;

      // ---- Orbital motion ----
      data.angle[i] += ORBIT_SPEED * 0.002;
      const r = BASE_RADIUS + data.offset[i];
      const bx = Math.cos(data.angle[i]) * r;
      const by = Math.sin(data.angle[i]) * r;

      // ---- Cursor influence ----
      const dx = bx - mx;
      const dy = by - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < SPREAD_RADIUS && mLen > 0.001) {
        const falloff = 1 - dist / SPREAD_RADIUS;

        // Random cone spread
        const spread = (Math.random() - 0.5) * Math.PI * 0.6;
        const rotated = rotate2D(dirX, dirY, spread);

        data.velocity[ix] += rotated.x * falloff * FORCE;
        data.velocity[iy] += rotated.y * falloff * FORCE;
      }

      // ---- Return force to orbit ----
      data.velocity[ix] += (bx - pos[ix]) * RETURN_FORCE;
      data.velocity[iy] += (by - pos[iy]) * RETURN_FORCE;

      // ---- Damping ----
      data.velocity[ix] *= DAMPING;
      data.velocity[iy] *= DAMPING;

      // ---- Apply velocity ----
      pos[ix] += data.velocity[ix];
      pos[iy] += data.velocity[iy];

      // ---- Depth shimmer ----
      pos[iz] = Math.sin(t + data.offset[i] * 6) * DEPTH_WAVE;
    }

    geometry.attributes.position.needsUpdate = true;

    if (points.current) {
      points.current.rotation.z = t * 0.02;
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
