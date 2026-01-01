// app/page.tsx
"use client";

import Scene2 from "@/components/3D Scene/Scene2";
import Bubble from "@/components/Feature/Bubble";
import Feature from "@/components/Feature/Feature";
import Hero from "@/components/Hero/Hero";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="w-screen h-screen  gap-48">
      
      <Hero />
      <Feature />
      <Bubble />
      
    </main>
  );
}
