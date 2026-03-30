import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đồng ngôn - Nhất ngôn xuất, vạn kiếp hồi thanh",
  description:
    "Đồng ngôn là địa hạt của những lời nói vừa của riêng mình mà không của riêng ai. Tại nơi đây, chữ chồng lên chữ, hồn chất lên hồn, sinh nghệ thuật.",
  openGraph: {
    title: "Đồng ngôn - Nhất ngôn xuất, vạn kiếp hồi thanh",
    description:
      "Đồng ngôn là địa hạt của những lời nói vừa của riêng mình mà không của riêng ai. Tại nơi đây, chữ chồng lên chữ, hồn chất lên hồn, sinh nghệ thuật.",
    type: "website",
  },
};

import HeroSection from "@/components/HeroSection";
import CumulativeSection from "@/components/CumulativeSection";

export default async function Home() {
  
  return (
    <div className="bg-white text-black min-h-screen flex flex-col">

      {/* Hero Section — no animation wrapper: must be immediately visible for LCP */}
      <div className="min-h-screen w-full flex items-center justify-center">
        <HeroSection />
      </div>

      {/* Cumulative Section - Main Content Flow */}
      <CumulativeSection />

    </div>
  );
}

