// components/3D Scene/BackgroundText.tsx
"use client";

import { Text } from "@react-three/drei";

export default function BackgroundText() {
  return (
    <Text
      position={[0, 0, -2]}
      fontSize={3.2}
      color="white"
      anchorX="center"
      anchorY="middle"
      letterSpacing={-0.12}
    >
      FUTURE
    </Text>
  );
}
