// components/3D Scene/BackgroundText.tsx
"use client";

import { Text } from "@react-three/drei";

type BackgroundTextProps = {
  label: string;
  position?: [number, number, number];
  fontSize?: number;
  color?: string;
  letterSpacing?: number;
};

export default function BackgroundText({
  label,
  position = [0, 0, -2],
  fontSize = 3.2,
  color = "white",
  letterSpacing = -0.12,
}: BackgroundTextProps) {
  return (
    <Text
      position={position}
      fontSize={fontSize}
      color={color}
      anchorX="center"
      anchorY="middle"
      letterSpacing={letterSpacing}
    >
      {label}
    </Text>
  );
}
