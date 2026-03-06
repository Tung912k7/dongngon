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
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.95, 1]);

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
