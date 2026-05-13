import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đồng ngôn - Sự bay bổng của cảm hứng",
  description:
    "Nhất ngôn xuất, vạn kiếp hồi thanh - Đồng ngôn là địa hạt của những lời nói vừa của riêng mình mà không của riêng ai...",
  openGraph: {
    title: "Đồng ngôn - Sự bay bổng của cảm hứng",
    description:
      "Nhất ngôn xuất, vạn kiếp hồi thanh - Đồng ngôn là địa hạt của những lời nói vừa của riêng mình mà không của riêng ai...",
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


