import Scene from "../3D Scene/Scene";
import Scene3 from "../3D Scene/Scene3";
import Button from "../ui/Button";
import HeroHeadline from "./HeroHeadline";
import Navbar from "./Navbar";
import SocialLinks from "./SocialLinks";

export default function Hero() {
  return (
    <section className="h-screen w-screen px-20 border-b-2 border-white relative overflow-hidden bg-black">
      
      {/* Navbar */}
      <div className="absolute top-0 left-0 w-full z-20">
        <Navbar /> 
      </div>

      {/* Left text */}
      <div className="absolute bottom-2/12 left-0 px-24 ">
        <p className="text-4xl text-white font-extralight">Let's Build the</p>
        <p className="text-4xl text-white font-extralight">Future of</p>
        <p className="text-4xl text-white font-extrabold">Design.</p>
      </div>

      {/* Right number */}
      <div className="absolute top-0 right-0 pt-[420px]">
        <p className="text-[260px] font-medium text-transparent [-webkit-text-stroke:2px_white]">09</p>
      </div>

      {/* Social Links */}
      <SocialLinks />

      {/* Hero Headline */}
      <div className="absolute top-2/12 left-0 px-24  ">
        <HeroHeadline />
      </div>

      {/* 3D Scene */}
      <Scene />
       {/*  vertical line */}
      <div className="absolute top-0 left-16 h-full w-[2px] bg-white opacity-20 z-10"></div>
      {/*  vertical line */}
      <div className="absolute top-0 right-16 h-full w-[2px] bg-white opacity-20 z-10"></div>
    
      
      {/* Button at bottom center */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto">
        <Button label="View Work" onClick={() => alert("clicked!")} variant="outline" />
      </div>
    </section>
  );
}
