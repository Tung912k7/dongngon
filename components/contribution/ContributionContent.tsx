"use client";
import { m } from 'framer-motion';

const ContributionContent = () => {
  return (
    <div className="w-full">
      <m.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        viewport={{ once: true }}
        className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-10 text-center md:text-left items-center mt-8 md:mt-16 lg:mt-20 p-4 max-w-6xl mx-auto"
      >
        {/* Left Column: Purpose & Description */}
        <div className="lg:col-span-7 flex flex-col gap-5 md:gap-8">
          
          <div className="space-y-2 lg:space-y-3">
            <h2 className="font-ganh text-2xl md:text-3xl lg:text-4xl text-white tracking-wide">
              Mục đích & Ý nghĩa
            </h2>
            <p className="font-be-vietnam text-sm md:text-base text-gray-300 leading-relaxed font-light">
              <strong className="text-white font-medium">Đồng ngôn</strong> là một bước lùi có chủ ý khỏi sự xô bồ của mạng xã hội hiện đại. Nơi đây là không gian tĩnh lặng dành riêng cho việc lưu giữ, sáng tác và trân trọng văn chương thực thụ.
            </p>
          </div>

          <div className="space-y-2 lg:space-y-3 md:pl-5 md:border-l-[1px] md:border-white/20 pt-1">
            <h3 className="font-ganh text-xl md:text-2xl lg:text-3xl text-white tracking-wide">
              Sự độc đáo
            </h3>
            <p className="font-be-vietnam text-sm md:text-base text-gray-300 leading-relaxed font-light text-center md:text-left">
              Trải nghiệm chậm rãi, nơi giao diện không có những cuộn trang vô tận. Bạn được dừng lại, đọc thật sâu và suy ngẫm từng câu từ thuần túy, vắng bóng các thuật toán bủa vây. Mọi tính năng đều xoay quanh việc viết, đem lại sự tập trung tuyệt đối.
            </p>
          </div>

        </div>

        {/* Right Column: Rule Card (Glassmorphism) */}
        <div className="lg:col-span-5 w-full mt-4 lg:mt-0 px-2 md:px-0">
          <div className="relative p-5 md:p-6 lg:p-8 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md overflow-hidden group shadow-2xl active:scale-[0.98] transition-transform">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col gap-3 md:gap-4 lg:gap-5">
              <h3 className="font-ganh text-2xl md:text-3xl lg:text-4xl text-white tracking-wide">
                Nguyên tắc Đóng góp
              </h3>
              <p className="font-be-vietnam text-sm md:text-base text-gray-400 font-light">
                Mọi tác phẩm đều thuộc về cộng đồng. Để duy trì sự cân bằng và chắt chiu cho bề dày văn hóa:
              </p>
              
              {/* Highlight Box */}
              <div className="bg-black/60 border border-white/10 rounded-xl p-4 md:p-5 shadow-inner">
                <p className="font-be-vietnam text-base md:text-lg text-yellow-50/90 italic font-light tracking-wide leading-relaxed">
                  "Bạn chỉ có thể đóng góp 1 câu mỗi tác phẩm"
                </p>
              </div>
            </div>
          </div>
        </div>

      </m.div>
    </div>
  );
};

export default ContributionContent;
