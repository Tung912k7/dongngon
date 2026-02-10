"use client";
import Image from 'next/image';
import { motion } from 'framer-motion';

const AboutSection = () => {
  return (
    <section className="relative w-full min-h-[80vh] bg-black text-white flex items-center justify-center overflow-hidden py-20 z-20">
      {/* Left Sidebar Container: Pattern Only */}
      <div className="absolute left-0 top-0 bottom-0 z-30 flex flex-row items-stretch h-full pointer-events-none border-r border-white/10 bg-black overflow-hidden bg-black/40">
          
          {/* 1. Pattern Column (Fixed Width) */}
          <div className="relative h-full w-20 md:w-24 lg:w-28 pointer-events-auto z-40 flex items-center justify-center">
             <div 
               className="absolute top-1/2 left-1/2 w-[200vh] h-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center origin-center"
               style={{ transform: 'translate(-50%, -50%) rotate(-90deg)' }}
             >
                <div className="relative w-full h-20 md:h-24 lg:h-28">
                  <div 
                    className="w-full h-full"
                    style={{
                      backgroundImage: "url('/pattern/pattern1.png')",
                      backgroundRepeat: 'repeat-x',
                      backgroundPosition: 'center',
                      backgroundSize: 'auto 100%' 
                    }}
                  />
                </div>
             </div>
          </div>
      </div>

      <div className="container mx-auto px-6 sm:px-10 md:px-16 relative z-20 h-full flex flex-col justify-center items-end gap-20 lg:gap-32">
        
        {/* Text Content - Top Right */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          viewport={{ once: true }}
          className="w-full max-w-4xl"
        >
          <p className="font-be-vietnam text-xl md:text-2xl lg:text-3xl leading-relaxed text-gray-100 font-medium">
            Lần đầu tiên, một dự án viết văn kiểu mới. Nơi mọi người cùng nhau tạo nên những tác phẩm độc đáo, không giới hạn. Tại đây chúng tôi đề cao sự ngẫu hứng như cách dự án này được sinh ra.
          </p>
        </motion.div>

        {/* Angled Image Cards - Bottom Right */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true }}
          className="w-full relative h-[350px] md:h-[450px] flex items-center justify-end pr-4 md:pr-12 lg:pr-20"
        >
          
          {/* Left Card (Back) */}
          <div className="absolute right-40 md:right-72 lg:right-[400px] top-1/2 -translate-y-1/2 w-72 md:w-96 lg:w-[480px] aspect-[16/9] bg-white rounded-[3.5rem] p-4 shadow-2xl transition-transform hover:z-30 duration-500 cursor-pointer z-10">
            <div className="w-full h-full relative rounded-[2.8rem] bg-white flex items-center justify-center border border-gray-100">
               <span className="text-black font-quicksand text-2xl lg:text-3xl font-medium">Image</span>
            </div>
          </div>

          {/* Right Card (Front) */}
          <div className="absolute right-0 md:right-8 lg:right-12 top-1/2 -translate-y-1/2 mt-12 w-72 md:w-96 lg:w-[480px] aspect-[16/9] bg-white rounded-[3.5rem] p-4 shadow-2xl transition-transform hover:z-30 duration-500 cursor-pointer z-20">
            <div className="w-full h-full relative rounded-[2.8rem] bg-white flex items-center justify-center border border-gray-100">
               <span className="text-black font-quicksand text-2xl lg:text-3xl font-medium">Image</span>
            </div>
          </div>

        </motion.div>

      </div>


    </section>
  );
};

export default AboutSection;
