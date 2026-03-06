"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";


import { LazyMotion } from "framer-motion";

const WelcomeNotification = dynamic(() => import("@/components/WelcomeNotification"), { ssr: false });
const SmoothScroll = dynamic(() => import("@/components/SmoothScroll"), { ssr: false });
const ChangelogModal = dynamic(() => import("@/components/ChangelogModal"), { ssr: false });
const loadFeatures = () => import("@/lib/framer-features").then(res => res.default);

export function ClientGlobalWrappers({ 
  children, 
  hasSeenTour,
  lastSeenChangelog,
  hasUser 
}: { 
  children: ReactNode, 
  hasSeenTour?: boolean,
  lastSeenChangelog?: string | null,
  hasUser?: boolean 
}) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <SmoothScroll>
        {children}
        {hasSeenTour === false && <WelcomeNotification />}
        {hasUser && <ChangelogModal lastSeenVersion={lastSeenChangelog ?? null} />}
      </SmoothScroll>
    </LazyMotion>
  );
}
