"use client";
import { m } from 'framer-motion';

const ContributionContent = () => {
  return (
    <div className="w-full">
      <m.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true }}
        className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-8 md:gap-12 lg:gap-16 text-left items-stretch p-4 max-w-6xl mx-auto"
      >
        {/* Left Column: Purpose & Description */}
        <div className="lg:col-span-12 xl:col-span-7 flex flex-col gap-6 sm:gap-6 md:gap-10">
          <div className="flex flex-col gap-4 sm:gap-4 md:gap-6">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-6 md:h-8 bg-white" />
              <h2 className="font-ganh text-xl md:text-4xl lg:text-5xl text-white tracking-tight font-bold uppercase transition-transform hover:translate-x-2 duration-300">
                Câu chuyện
              </h2>
            </div>
            <p className="font-be-vietnam text-[13px] md:text-base lg:text-lg text-white/70 leading-[1.6] max-w-2xl font-medium tracking-wide">
              <strong className="text-white">Đồng ngôn</strong> là địa hạt của những lời nói vừa của riêng mình mà không của riêng ai. Tại nơi đây, chữ chồng lên chữ, hồn chất lên hồn, sinh nghệ thuật.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <div className="space-y-3 md:space-y-4 border-l-2 border-white/10 pl-4 md:pl-6">
              <h3 className="font-ganh text-base md:text-xl lg:text-2xl text-white tracking-widest font-bold uppercase">
                Khởi nguồn
              </h3>
              <p className="font-be-vietnam text-[13px] md:text-sm lg:text-base text-white/50 leading-relaxed">
                Dự án vô tình xuất hiện trong cuộc trò chuyện của tôi và người ấy. Tôi mong đây có thể là nơi mọi người có thể là chính mình, cùng nhau tạo nên những tác phẩm ý nghĩa và đẹp đẽ.
              </p>
            </div>
            <div className="space-y-3 md:space-y-4 border-l-2 border-white/10 pl-4 md:pl-6">
              <h3 className="font-ganh text-base md:text-xl lg:text-2xl text-white tracking-widest font-bold uppercase">
                Sự độc đáo
              </h3>
              <p className="font-be-vietnam text-[13px] md:text-sm lg:text-base text-white/50 leading-relaxed">
                Cơ chế viết khác biệt khiến ta trở nên chậm rãi, để ta có thể nhìn lại, suy ngẫm và sắp xếp lại sự rối ren trong đầu. Thoát ra khỏi sự xô bồ của cuộc sống và yêu lấy bản thân ta.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Rule Card (Brutalist) */}
        <div className="lg:col-span-12 xl:col-span-5 flex items-center justify-center">
          <div className="relative w-full p-4 sm:p-6 md:p-10 rounded-2xl border-2 border-white bg-transparent group shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] sm:shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] hover:shadow-[14px_14px_0px_0px_rgba(255,255,255,1)] transition-all cursor-default overflow-hidden">
            <div className="relative z-10 flex flex-col gap-3 sm:gap-6 md:gap-8 text-center sm:text-left">
              <div className="space-y-0.5 sm:space-y-1 sm:space-y-2">
                <span className="font-be-vietnam text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Giao ước</span>
                <h3 className="font-ganh text-base sm:text-xl md:text-4xl text-white tracking-tight font-bold uppercase leading-none">
                  Nguyên tắc
                </h3>
              </div>

              <div className="bg-white text-black p-3 sm:p-4 md:p-8 rounded-xl border-2 border-black transform group-hover:-rotate-1 transition-transform">
                <p className="font-ganh text-sm sm:text-base md:text-2xl font-bold italic tracking-tight leading-snug">
                  &ldquo;Mỗi người chỉ có thể đóng góp duy nhất một câu cho mỗi tác phẩm.&rdquo;
                </p>
              </div>

              <p className="font-be-vietnam text-[9px] sm:text-[10px] text-white/40 font-bold uppercase tracking-widest">
                Không giới hạn số lượng tác phẩm được đóng góp nha.
              </p>
            </div>
          </div>
        </div>

      </m.div>
    </div>
  );
};

export default ContributionContent;
