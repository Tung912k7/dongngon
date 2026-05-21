"use client";

import React from "react";

const AboutSection = () => {
  return (
    <section className="py-20 md:py-32 bg-white text-black font-['Be_Vietnam_Pro'] relative overflow-hidden border-t-2 border-black">
      {/* Subtle grid line to match theme */}
      <div
        className="absolute inset-0 z-0 opacity-[0.1]"
        style={{
          backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          {/* Large Negative Space / Minimalist Title */}
          <div className="md:col-span-4">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black mb-4">
              Về chúng tôi
            </h2>
            <div className="w-16 h-2 bg-literary-gold mb-6" />
            <p className="text-sm uppercase tracking-widest text-black/60 font-bold">
              Đồng ngôn — Có ăn được không?
            </p>
          </div>

          {/* Content Area with Generous Whitespace */}
          <div className="md:col-span-8 space-y-8 md:space-y-12">
            <p className="text-2xl md:text-3xl font-bold text-black leading-snug">
              Chúng mình tự hỏi rằng: Một tác phẩm văn học sẽ có hình thù như nào khi được nhào nặn
              bởi hàng nghìn bàn tay?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-base md:text-lg text-black/70 leading-relaxed">
              <div className="space-y-4">
                <p>
                  <span className="font-bold text-black">Đồng ngôn</span> là một không gian sáng tạo
                  độc đáo, nơi bạn không cần phải là một nhà văn chuyên nghiệp để bắt đầu. Bạn chỉ
                  cần viết một câu.
                </p>
                <p>
                  Bằng cách giới hạn mỗi lượt đóng góp trong một câu duy nhất, chúng tôi tạo ra một
                  trò chơi nối chữ đầy bất ngờ và thú vị. Bạn không bao giờ biết câu chuyện sẽ đi về
                  đâu.
                </p>
              </div>
              <div className="space-y-4">
                <p>
                  Đây là nơi tiếng nói của bạn hòa quyện với tiếng nói của người khác. Một tác phẩm
                  có thể được viết bởi hàng chục, hàng trăm con người xa lạ.
                </p>
                <p>
                  Hãy tham gia cùng chúng tôi để khám phá sức mạnh của sự ngẫu hứng và cộng tác.
                  Viết một câu, tiếp nối một hành trình.
                </p>
              </div>
            </div>

            {/* Visual Anchor / Stat Box in Neo-Brutalist Style */}
            <div className="border-4 border-black p-6 md:p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                  <p className="text-sm uppercase tracking-widest text-black/60 font-bold mb-1">
                    Cơ chế cốt lõi
                  </p>
                  <p className="text-xl font-bold text-black">Một câu\ Mỗi tác phẩm\ Mỗi ngày</p>
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
