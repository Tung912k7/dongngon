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
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div
        ref={ref}
        style={{
          opacity: 0,
          transform: 'translateY(12px)',
          transition: 'opacity 1s ease-in-out, transform 1s ease-in-out',
        }}
        className="w-full max-w-4xl text-left"
      >
        <p className="font-ganh text-2xl md:text-4xl lg:text-5xl leading-relaxed text-white tracking-wide">
          &quot;Tại đây chúng tôi đề cao sự ngẫu hứng như cách dự án này được sinh ra.&quot;
        </p>
      </div>
    </div>
  );
};

export default AboutContent;

