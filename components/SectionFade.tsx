"use client";

import { m, useTransform, useScroll } from "framer-motion";
import { useRef, ReactNode } from "react";

export default function SectionFade({ 
  children, 
  className = "" 
}: { 
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // offset: element starts fading in when its bottom hits 90% of viewport
  // and reaches full opacity when it's 50% into viewport
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.5"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.97, 1]);

  return (
    <m.div
      ref={ref}
      style={{ opacity, scale }}
      className={className}
    >
      {children}
    </m.div>
  );
}
