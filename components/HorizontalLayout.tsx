"use client";

import Link from "next/link";
import { Work } from "@/types/database";
import { formatDate } from "@/utils/date";
import FadeIn from "@/components/FadeIn";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import { useHorizontalScroll } from "@/components/useHorizontalScroll";

interface HorizontalLayoutProps {
  works: Pick<Work, 'id' | 'title' | 'created_at'>[];
  profile: any;
}

export default function HorizontalLayout({ works, profile }: HorizontalLayoutProps) {
  const scrollRef = useHorizontalScroll();

  return (
    <div 
      // @ts-ignore
      ref={scrollRef} 
      className="flex flex-row h-screen w-screen overflow-x-auto overflow-y-hidden bg-white text-black snap-x snap-mandatory scroll-smooth no-scrollbar"
    >
      
      {/* Section 1: Hero */}
      <div className="min-w-full w-screen h-screen shrink-0 snap-center relative flex items-center justify-center">
        <HeroSection />
      </div>

      {/* Section 2: About */}
      <div className="min-w-full w-screen h-screen shrink-0 snap-center relative flex items-center justify-center bg-black">
        <AboutSection />
      </div>

      {/* Section 3: Works & Footer Container */}
      {/* Grouping Works and footer or separate? Start with Works */}
      <div className="min-w-full w-screen h-screen shrink-0 snap-center relative flex flex-col items-center justify-center bg-white overflow-y-auto">
         <div className="max-w-4xl w-full px-6 py-12">
            <h2 className="text-3xl font-ganh font-bold text-center mb-12">Tác Phẩm</h2>
            
            {works.length > 0 ? (
              <FadeIn>
                <div className="grid gap-6">
                      {works.map((work) => (
                        <Link
                          key={work.id}
                          href={`/work/${work.id}`}
                          className="block p-6 rounded-lg border border-dashed border-gray-300 hover:border-gray-400 transition-colors bg-gray-50"
                        >
                          <h3 className="text-2xl mb-2 text-gray-700">{work.title} 🔒</h3>
                          <div className="flex justify-between text-sm text-gray-400">
                            <span>ID: #{work.id.slice(0, 8)}</span>
                            <span>{formatDate(work.created_at)}</span>
                          </div>
                        </Link>
                      ))}
                </div>
              </FadeIn>
            ) : (
                <div className="text-center py-20">
                    <p className="text-gray-400 font-be-vietnam text-lg">Chưa có tác phẩm nào.</p>
                </div>
            )}
         </div>
      </div>

      {/* Section 4: Footer */}
      <div className="min-w-full w-screen h-screen shrink-0 snap-center relative flex items-center justify-center bg-gray-50">
        <div className="w-full h-full flex items-center justify-center">
             <Footer />
        </div>
      </div>

    </div>
  );
}
