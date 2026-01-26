'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: "/a",
    ui_host: "https://us.i.posthog.com",
    person_profiles: 'identified_only',
    capture_pageview: false,
    enable_recording_console_log: true,
    capture_performance: true,
    enable_exception_autocapture: true,
  } as Parameters<typeof posthog.init>[1])
}

function PostHogPageView() : null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', {
        '$current_url': url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

import React, { Component, ReactNode } from 'react'

class PostHogErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    posthog.captureException(error, {
      extra: errorInfo,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[200px] p-4 text-center">
          <div>
            <h2 className="text-xl font-bold mb-2">Đã có lỗi xảy ra</h2>
            <p className="text-gray-600 mb-4">Chúng tôi đã ghi nhận lỗi này và sẽ sớm khắc phục.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
    return (
        <PostHogProvider client={posthog}>
          <PostHogErrorBoundary>
            <Suspense fallback={null}>
              <PostHogPageView />
            </Suspense>
            {children}
          </PostHogErrorBoundary>
        </PostHogProvider>
    )
}
