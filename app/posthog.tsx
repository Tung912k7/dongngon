"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import type { PostHogConfig } from "posthog-js";

export default function PostHogAutoTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    let isCancelled = false;
    let activeTimeout: NodeJS.Timeout | null = null;

    if (!initialized.current) {
      initialized.current = true;
      import("posthog-js").then((m) => {
        if (isCancelled) return;
        const posthog = m.default;
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

        // Capture initial pageview
        let url = window.origin + pathname;
        if (searchParams.toString()) {
          url = url + `?${searchParams.toString()}`;
        }
        posthog.capture("$pageview", { $current_url: url });
      });
    } else {
      import("posthog-js").then((m) => {
        if (isCancelled) return;
        const posthog = m.default;
        let url = window.origin + pathname;
        if (searchParams.toString()) {
          url = url + `?${searchParams.toString()}`;
        }
        activeTimeout = setTimeout(() => {
          posthog.capture("$pageview", {
            $current_url: url,
          });
        }, 500);
      });
    }

    return () => {
      isCancelled = true;
      if (activeTimeout) {
        clearTimeout(activeTimeout);
      }
    };
  }, [pathname, searchParams]);

  return null;
}
