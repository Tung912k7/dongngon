"use client";
import { useEffect, useRef } from 'react';

const AboutContent = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-center items-start px-0 sm:px-12 md:px-20 lg:px-12 relative z-20">
      <div
        ref={ref}
        style={{
          opacity: 0,
          transform: 'translateY(20px)',
          transition: 'opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1), transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className="w-full max-w-none text-left border-l-2 sm:border-l-[8px] border-white pl-2 sm:pl-10 md:pl-16 py-8"
      >
        <div className="mb-4 sm:mb-6 flex items-center gap-4">
          <span className="font-ganh text-[10px] sm:text-xs md:text-base uppercase tracking-[0.5em] text-white/40 font-bold">
            Triết lý của Đồng Ngôn
          </span>
        </div>

        <h2 className="font-ganh text-[45px] sm:text-4xl md:text-6xl lg:text-6xl leading-[1.3] sm:leading-[1.4] text-white tracking-tighter font-bold uppercase mb-12 md:mb-10">
          &ldquo;Tại đây chúng mình đề cao sự ngẫu hứng như cách dự án này được sinh ra.&rdquo;
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mt-16 md:mt-12">
          <div className="w-12 sm:w-20 h-[2px] bg-white" />
          <p className="font-be-vietnam text-[20px] sm:text-sm md:text-base text-white/50 max-w-xl leading-relaxed font-bold uppercase tracking-widest">
            Nơi những tâm hồn đồng điệu cùng nhau kiến tạo nên những giá trị bền vững qua từng dòng chữ.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutContent;


