"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";


const WelcomeNotification = dynamic(() => import("@/components/WelcomeNotification"), { ssr: false });
const SmoothScroll = dynamic(() => import("@/components/SmoothScroll"), { ssr: false });

export function ClientGlobalWrappers({ children, hasSeenTour }: { children: ReactNode, hasSeenTour?: boolean }) {
  return (
    <SmoothScroll>
      {children}
      {hasSeenTour === false && <WelcomeNotification />}
    </SmoothScroll>
  );
}
