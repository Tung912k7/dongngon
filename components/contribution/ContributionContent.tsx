"use client";
import { motion } from 'framer-motion';

const ContributionContent = () => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-end">
      {/* Text Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        viewport={{ once: true }}
        className="w-full max-w-4xl flex flex-col gap-6"
      >
        <p className="font-be-vietnam text-lg md:text-xl lg:text-2xl text-gray-200">
          Mọi tác phẩm đều thuộc về cộng đồng.
        </p>
        <p className="font-be-vietnam text-lg md:text-xl lg:text-2xl text-gray-200">
          Bạn chỉ có thể đóng góp 1 kí tự (1 câu) / 1 tác phẩm / 1 ngày.
        </p>
      </motion.div>
    </div>
  );
};

export default ContributionContent;
