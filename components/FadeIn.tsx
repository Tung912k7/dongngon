"use client";

import { m } from "framer-motion";
import { ReactNode } from "react";

export default function FadeIn({ children }: { children: ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </m.div>
  );
}
