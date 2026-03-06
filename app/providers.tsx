'use client'

import { usePathname, useRouter } from "next/navigation"
import { useEffect, Component, ReactNode, ErrorInfo } from "react"
import { createClient } from "@/utils/supabase/client"
import dynamic from "next/dynamic"

const PostHogAutoTracker = dynamic(() => import('./posthog'), { ssr: false });

function AuthListener() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    
    let hasSession = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      hasSession = !!session;
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        const wasLoggedIn = hasSession;
        hasSession = false;
        
        const isPublicPage = pathname === '/' || pathname === '/dong-ngon' || pathname.startsWith('/work/');
        if (!isPublicPage && (wasLoggedIn || pathname.startsWith('/profile') || pathname.startsWith('/settings'))) {
          window.location.href = '/dang-nhap';
        }
      } else if (event === 'SIGNED_IN') {
        hasSession = true;
      }
    });

    const handlePageHide = () => {
      supabase.removeAllChannels();
    };

    window.addEventListener('pagehide', handlePageHide);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [pathname, router]);

  return null;
}

class SimpleErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      import('posthog-js').then((m) => {
        m.default.captureException(error, { extra: errorInfo as any });
      });
    }
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

export function CSPostHogProvider({ children }: { children: ReactNode }) {
  const isPostHogEnabled = !!process.env.NEXT_PUBLIC_POSTHOG_KEY;

  return (
    <>
      <AuthListener />
      <SimpleErrorBoundary>
        {isPostHogEnabled && <PostHogAutoTracker />}
        {children}
      </SimpleErrorBoundary>
    </>
  );
}
