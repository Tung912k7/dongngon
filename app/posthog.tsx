"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import type { PostHogConfig } from "posthog-js";

let posthogInitialized = false;

export default function PostHogAutoTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    let isCancelled = false;
    let activeTimeout: NodeJS.Timeout | null = null;

    import("posthog-js").then((m) => {
      if (isCancelled) return;
      const posthog = m.default;

      if (!posthogInitialized) {
        posthogInitialized = true;
        const posthogConfig: Partial<PostHogConfig> = {
          api_host: "/ingest",
          ui_host: "https://us.i.posthog.com",
          person_profiles: "identified_only",
          capture_pageview: false,
          capture_pageleave: true,
          enable_recording_console_log: true,
          capture_performance: true,
        };
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, posthogConfig);
      }

      // Capture pageview with delay to ensure page rendering is complete
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }

      activeTimeout = setTimeout(() => {
        posthog.capture("$pageview", { $current_url: url });
      }, 500);
    });

    return () => {
      isCancelled = true;
      if (activeTimeout) {
        clearTimeout(activeTimeout);
      }
    };
  }, [pathname, searchParams]);

  return null;
}
