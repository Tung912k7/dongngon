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

import HeroSectionV2 from "@/components/HeroSectionV2";
import InspirationFlow from "@/components/InspirationFlow";
import OpenProjects from "@/components/OpenProjects";
import ContributionShowcase from "@/components/ContributionShowcase";

export default function Home() {
  return (
    <div className="bg-[#FAF8F5] text-ink-charcoal min-h-screen flex flex-col font-['Be_Vietnam_Pro']">
      {/* Hero Section */}
      <div className="w-full flex items-center justify-center">
        <HeroSectionV2 />
      </div>

      {/* Open Projects / Trending Stories */}
      <OpenProjects />

      {/* Inspiration Flow (Retained) */}
      <InspirationFlow />

      {/* Contribution Showcase (Retained) */}
      <ContributionShowcase />
    </div>
  );
}
