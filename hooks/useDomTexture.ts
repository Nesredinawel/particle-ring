// hooks/useDomTexture.ts
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import html2canvas from "html2canvas";

function sanitizeColors(root: HTMLElement) {
  const changed: Array<{
    el: HTMLElement;
    color?: string;
    bg?: string;
  }> = [];

  root.querySelectorAll<HTMLElement>("*").forEach((el) => {
    const cs = getComputedStyle(el);

    if (cs.color.includes("lab(") || cs.color.includes("oklch(")) {
      changed.push({ el, color: el.style.color });
      el.style.color = "rgb(255,255,255)";
    }

    if (
      cs.backgroundColor.includes("lab(") ||
      cs.backgroundColor.includes("oklch(")
    ) {
      changed.push({ el, bg: el.style.backgroundColor });
      el.style.backgroundColor = "transparent";
    }
  });

  return () => {
    changed.forEach(({ el, color, bg }) => {
      if (color !== undefined) el.style.color = color;
      if (bg !== undefined) el.style.backgroundColor = bg;
    });
  };
}

export function useDomTexture(id: string) {
  const texRef = useRef<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    const el = document.getElementById(id);
    if (!el) return;

    // 🔒 sanitize BEFORE capture
    const restore = sanitizeColors(el);

    html2canvas(el, {
      backgroundColor: null,
      scale: window.devicePixelRatio,
      useCORS: true,
    })
      .then((canvas) => {
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        texRef.current = tex;
      })
      .finally(() => {
        // ♻️ restore DOM
        restore();
      });
  }, [id]);

  return texRef;
}
