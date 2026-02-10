"use client";
import Image from 'next/image';
import { motion } from 'framer-motion';

const ContributionSection = () => {
  return (
    <section className="relative w-full min-h-[80vh] bg-black text-white flex items-center justify-center overflow-hidden py-20 z-20">
      {/* Right Sidebar Container: Pattern Only */}
      <div className="absolute right-0 top-0 bottom-0 z-30 flex flex-row items-end h-full pointer-events-none border-l border-white/10 bg-black overflow-hidden bg-black/40">
          {/* Pattern Column */}
          <div className="relative h-full w-20 md:w-24 lg:w-28 pointer-events-auto z-40 flex items-center justify-center">
             <div 
               className="absolute top-1/2 left-1/2 w-[180vh] h-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center scale-125"
               style={{ transform: 'translate(-50%, -50%) rotate(-90deg)' }}
             >
                <div className="relative w-full h-20 md:h-24 lg:h-28">
                  <Image 
                    src="/pattern/pattern1.png"
                    alt="Decorative Pattern"
                    fill
                    sizes="(max-width: 1024px) 96px, 112px"
                    className="object-cover opacity-100"
                  />
                </div>
             </div>
          </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-20 h-full flex flex-col justify-center items-start lg:pr-32">
        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          viewport={{ once: true }}
          className="w-full max-w-4xl"
        >
          <h2 className="font-be-vietnam text-xl md:text-2xl lg:text-3xl font-medium mb-6 leading-tight">
            Mọi tác phẩm đều thuộc về cộng đồng
          </h2>
          <p className="font-be-vietnam text-lg md:text-xl lg:text-2xl text-gray-200">
            Bạn chỉ có thể đóng góp 1 kí tự (1 câu)/ 1 tác phẩm/ 1 ngày
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ContributionSection;
