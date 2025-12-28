// components/3D Scene/GlassMaterial.ts
export const glassMaterialProps = {
  transmission: 1,
  thickness: 1.6,
  roughness: 0,
  ior: 1.45,
  chromaticAberration: 0.08,

  // 🔕 disable environment reflection
  envMapIntensity: 0,

  backside: true,
};
