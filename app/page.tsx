import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đồng ngôn",
  description: "Suỵt",
};

import SectionFade from "@/components/SectionFade";

import HeroSection from "@/components/HeroSection";
import CumulativeSection from "@/components/CumulativeSection";

export default async function Home() {
  
  return (
    <div className="bg-white text-black min-h-screen flex flex-col">
      
      {/* Hero Section */}
      {/* Hero Section */}
      <SectionFade className="min-h-screen w-full flex items-center justify-center">
        <HeroSection />
      </SectionFade>

      {/* Cumulative Section - Main Content Flow */}
      <CumulativeSection />

    </div>
  );
}

