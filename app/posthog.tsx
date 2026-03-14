'use client'

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"
import type { PostHogConfig } from "posthog-js"

export default function PostHogAutoTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    if (!initialized.current) {
        import('posthog-js').then((m) => {
            const posthog = m.default;
            const posthogConfig: Partial<PostHogConfig> = {
              api_host: '/api/event',
              person_profiles: 'identified_only',
              capture_pageview: false,
              enable_recording_console_log: true,
              capture_performance: true,
              // enable_exception_autocapture is handled separately or no longer supported
            };
            posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, posthogConfig);
            initialized.current = true;
            
            // Capture initial pageview
            let url = window.origin + pathname;
            if (searchParams.toString()) {
              url = url + `?${searchParams.toString()}`;
            }
            posthog.capture('$pageview', { '$current_url': url });
        });
    } else {
        import('posthog-js').then((m) => {
            const posthog = m.default;
            let url = window.origin + pathname;
            if (searchParams.toString()) {
              url = url + `?${searchParams.toString()}`;
            }
            const handle = setTimeout(() => {
              posthog.capture('$pageview', {
                '$current_url': url,
              });
            }, 500);
            return () => clearTimeout(handle);
        });
    }
  }, [pathname, searchParams]);

  return null;
}
