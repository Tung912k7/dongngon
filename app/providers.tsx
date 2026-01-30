'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { useEffect, Suspense } from "react"
import { createClient } from "@/utils/supabase/client"

function AuthListener() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    
    // Track if we were initially logged in
    let hasSession = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      hasSession = !!session;
    });

    // Listen for auth state changes (SYNC across tabs)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, !!session);

      if (event === 'SIGNED_OUT') {
        const wasLoggedIn = hasSession;
        hasSession = false;
        
        // Only redirect if we were previously logged in (avoids guest redirect loop)
        // or if we are currently on a protected route (double safety)
        const isPublicPage = pathname === '/' || pathname === '/dong-ngon' || pathname.startsWith('/work/');
        if (!isPublicPage && (wasLoggedIn || pathname.startsWith('/profile') || pathname.startsWith('/settings'))) {
          window.location.href = '/dang-nhap';
        }
      } else if (event === 'SIGNED_IN') {
        hasSession = true;
        // Optionally reload to update server-side rendered state (nickname in header, etc.)
        // but only if we were NOT logged in before (initial login)
        // router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  return null;
}

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: '/api/event',
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
      
      // Use a timeout to debounce pageview capturing
      // and avoid rate-limiting on rapid filtering
      const handle = setTimeout(() => {
        posthog.capture('$pageview', {
          '$current_url': url,
        });
      }, 500);

      return () => clearTimeout(handle);
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
  const isPostHogEnabled = !!process.env.NEXT_PUBLIC_POSTHOG_KEY;

  const content = (
    <>
      <AuthListener />
      <PostHogErrorBoundary>
        <Suspense fallback={null}>
          {isPostHogEnabled && <PostHogPageView />}
        </Suspense>
        {children}
      </PostHogErrorBoundary>
    </>
  );

  if (!isPostHogEnabled) {
    return content;
  }

  return (
    <PostHogProvider client={posthog}>
      {content}
    </PostHogProvider>
  );
}
