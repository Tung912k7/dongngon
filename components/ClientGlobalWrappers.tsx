"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

const GuideNotification = dynamic(() => import("@/components/GuideNotification"), { ssr: false });
const SmoothScroll = dynamic(() => import("@/components/SmoothScroll"), { ssr: false });

export function ClientGlobalWrappers({ children, hasSeenTour }: { children: ReactNode, hasSeenTour: boolean }) {
  return (
    <SmoothScroll>
      {children}
      <GuideNotification hasSeenTour={hasSeenTour} />
    </SmoothScroll>
  );
}
