"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const ReactLenis = dynamic(() => import("lenis/react").then((mod) => mod.ReactLenis), {
  ssr: false,
});

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(() => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [pathname, enabled]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let idleId: number | null = null;

    const enable = () => setEnabled(true);

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(enable, { timeout: 1200 });
    } else {
      timeoutId = setTimeout(enable, 300);
    }

    return () => {
      if (idleId !== null && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5 }}>
      {children}
    </ReactLenis>
  );
}
