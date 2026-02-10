"use client";
import Image from 'next/image';
import { motion } from 'framer-motion';

const ContributionSection = () => {
  return (
    <section className="relative w-full min-h-[80vh] bg-black text-white flex items-center justify-center overflow-hidden py-20 z-20">
      {/* Right Sidebar Container: Pattern Only */}
      <div className="absolute right-0 top-0 bottom-0 z-30 flex flex-row items-end h-full pointer-events-none border-l border-white/10 bg-black overflow-hidden bg-black/40">
          {/* Pattern Column */}
             <div className="relative w-full h-full">
                  <div 
                    className="w-full h-full"
                    style={{
                      backgroundImage: "url('/pattern/pattern1.png')",
                      backgroundRepeat: 'repeat-y',
                      backgroundPosition: 'center top',
                      backgroundSize: '100% auto' 
                    }}
                  />
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
