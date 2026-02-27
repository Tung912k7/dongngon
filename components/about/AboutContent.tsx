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
        <p className="font-ganh text-2xl md:text-4xl lg:text-5xl leading-relaxed text-white tracking-wide">
          "Tại đây chúng tôi đề cao sự ngẫu hứng như cách dự án này được sinh ra."
        </p>
      </motion.div>
    </div>
  );
};

export default AboutContent;
