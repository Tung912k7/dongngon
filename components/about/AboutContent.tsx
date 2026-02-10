"use client";
import { motion } from 'framer-motion';

const AboutContent = () => {
  return (
    <div className="w-full flex flex-col justify-center items-end gap-10 md:gap-20 lg:gap-32">
      {/* Text Content - Top Right */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        viewport={{ once: true }}
        className="w-full max-w-4xl"
      >
        <p className="font-be-vietnam text-lg md:text-xl lg:text-2xl leading-relaxed text-gray-200">
          Lần đầu tiên, một dự án viết văn kiểu mới. Nơi mọi người cùng nhau tạo nên những tác phẩm độc đáo, không giới hạn. Tại đây chúng tôi đề cao sự ngẫu hứng như cách dự án này được sinh ra.
        </p>
      </motion.div>

      {/* Angled Image Cards - Bottom Right */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        viewport={{ once: true }}
        className="w-full relative h-[300px] sm:h-[350px] md:h-[450px] flex items-center justify-end pr-4 md:pr-12 lg:pr-20 mt-10"
      >
        {/* Left Card (Back) */}
        <div className="absolute hidden sm:block right-48 md:right-80 lg:right-[480px] top-1/2 -translate-y-1/2 w-64 md:w-80 lg:w-[460px] aspect-[16/9] bg-white rounded-[3.5rem] p-3 shadow-2xl transition-transform hover:z-30 duration-500 cursor-pointer z-10">
          <div className="w-full h-full relative rounded-[2.8rem] bg-white flex items-center justify-center border border-gray-100">
             <span className="text-black font-quicksand text-xl lg:text-2xl font-medium">Image</span>
          </div>
        </div>

        {/* Right Card (Front) */}
        <div className="absolute right-1/2 translate-x-1/2 sm:translate-x-0 sm:right-0 md:right-12 lg:right-20 top-1/2 -translate-y-1/2 mt-8 sm:mt-12 w-64 md:w-80 lg:w-[460px] aspect-[16/9] bg-white rounded-[3.5rem] p-3 shadow-2xl transition-transform hover:z-30 duration-500 cursor-pointer z-20">
          <div className="w-full h-full relative rounded-[2.8rem] bg-white flex items-center justify-center border border-gray-100">
             <span className="text-black font-quicksand text-sm sm:text-lg lg:text-2xl font-medium">Image</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutContent;
