import React from "react";
import GridBackground from "./GridBackground";

const AboutSection = () => {
  return (
    <section id="about-us" className="py-20 md:py-32 bg-white text-black font-['Be_Vietnam_Pro'] relative overflow-hidden border-t-2 border-black">
      {/* Subtle grid line to match theme */}
      <GridBackground opacity={0.1} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          {/* Large Negative Space / Minimalist Title */}
          <div className="md:col-span-4">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black mb-4">
              Về chúng mình
            </h2>
            <div className="w-16 h-2 bg-literary-gold mb-6" />
            <p className="text-sm uppercase tracking-widest text-black/60 font-bold">
              Đồng ngôn — Có ăn được không?
            </p>
          </div>

          {/* Content Area with Generous Whitespace */}
          <div className="md:col-span-8 space-y-8 md:space-y-12">
            <p className="text-2xl md:text-3xl font-bold text-black leading-snug">
              Chúng mình tự hỏi rằng: Câu chuyện sẽ đi về đâu nếu mỗi người chỉ viết một câu?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-base md:text-lg text-black/70 leading-relaxed">
              <div className="space-y-4">
                <p>
                  <span className="font-bold text-black">Đồng ngôn</span> vô tình xuất hiện trong cuộc trò chuyện của chúng mình. Chúng mình mong đây sẽ là nơi mọi người có thể là chính mình, cùng nhau tạo nên những tác phẩm ý nghĩa và độc đáo.
                </p>
              </div>
              <div className="space-y-4">
                <p>
                  Bằng cách giới hạn mỗi lượt đóng góp trong một câu duy nhất, bạn không bao giờ biết câu chuyện sẽ đi về đâu.
                </p>
              </div>
            </div>

            {/* Visual Anchor / Stat Box in Neo-Brutalist Style */}
            <div className="border-4 border-black p-6 md:p-8 bg-white mt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                  <p className="text-sm uppercase tracking-widest text-black/60 font-bold mb-1">
                    Cơ chế cốt lõi
                  </p>
                  <p className="text-xl font-bold text-black">Một câu / Mỗi tác phẩm / Mỗi ngày</p>
                </div>
                <div className="text-5xl font-black text-literary-gold">1</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
