import { motion } from 'framer-motion';

const AboutContent = () => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      {/* Text Content - Center */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        viewport={{ once: true }}
        className="w-full max-w-4xl text-left"
      >
        <p className="font-be-vietnam text-lg md:text-xl lg:text-2xl leading-relaxed text-gray-200">
          Lần đầu tiên, một dự án viết văn kiểu mới. Nơi mọi người cùng nhau tạo nên những tác phẩm độc đáo, không giới hạn. Tại đây chúng tôi đề cao sự ngẫu hứng như cách dự án này được sinh ra.
        </p>
      </motion.div>
    </div>
  );
};

export default AboutContent;
